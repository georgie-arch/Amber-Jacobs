#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# deploy-lambda-instagram.sh
# Builds and deploys the Amber Instagram Lambda to AWS
# Usage: bash scripts/deploy-lambda-instagram.sh
# ─────────────────────────────────────────────────────────────────

set -euo pipefail

FUNCTION_NAME="amber-instagram"
REGION="eu-west-2"
RUNTIME="nodejs20.x"
HANDLER="instagram-handler.handler"
ROLE_NAME="amber-instagram-role"
BUILD_DIR="lambda-dist-instagram"
ZIP_FILE="lambda-package-instagram.zip"

# ─── COLOURS ─────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
info()  { echo -e "${GREEN}✓${NC} $1"; }
step()  { echo -e "\n${YELLOW}▶${NC} $1"; }

# ─── 1. COMPILE TYPESCRIPT ───────────────────────────────────────
step "Compiling Lambda TypeScript..."
rm -rf "$BUILD_DIR"
npx tsc \
  --outDir "$BUILD_DIR" \
  --target ES2020 \
  --module commonjs \
  --esModuleInterop true \
  --skipLibCheck true \
  --strict true \
  src/lambda/instagram-handler.ts
info "TypeScript compiled"

# ─── 2. INSTALL PRODUCTION DEPS ──────────────────────────────────
step "Installing production dependencies..."
cp package.json package-lock.json "$BUILD_DIR/"
cd "$BUILD_DIR"
npm ci --production --ignore-scripts 2>/dev/null || npm install --production --ignore-scripts
cd ..
info "Dependencies installed ($(du -sh "$BUILD_DIR/node_modules" | cut -f1) total)"

# ─── 3. PACKAGE ZIP ──────────────────────────────────────────────
step "Creating deployment package..."
rm -f "$ZIP_FILE"
cd "$BUILD_DIR"
zip -r "../$ZIP_FILE" . -x "*.map" -x "*.d.ts" -x "*.ts" > /dev/null
cd ..
info "Package created: $(du -sh "$ZIP_FILE" | cut -f1)"

# ─── 4. LOAD ENV VARS ────────────────────────────────────────────
step "Loading environment variables from .env..."
get_env() { grep "^$1=" .env 2>/dev/null | cut -d= -f2- || echo ""; }

ANTHROPIC_KEY=$(get_env ANTHROPIC_API_KEY)
IG_ACCOUNT_ID=$(get_env INSTAGRAM_BUSINESS_ACCOUNT_ID)
IG_ACCESS_TOKEN=$(get_env INSTAGRAM_ACCESS_TOKEN)
IG_VERIFY_TOKEN=$(get_env INSTAGRAM_WEBHOOK_VERIFY_TOKEN)
CLAUDE_MODEL_VAL=$(get_env CLAUDE_MODEL)
CLAUDE_MODEL_VAL="${CLAUDE_MODEL_VAL:-claude-sonnet-4-6}"

if [[ -z "$ANTHROPIC_KEY" || -z "$IG_ACCOUNT_ID" || -z "$IG_ACCESS_TOKEN" || -z "$IG_VERIFY_TOKEN" ]]; then
  echo "❌ Missing required .env variables:"
  [[ -z "$ANTHROPIC_KEY" ]]    && echo "   - ANTHROPIC_API_KEY"
  [[ -z "$IG_ACCOUNT_ID" ]]    && echo "   - INSTAGRAM_BUSINESS_ACCOUNT_ID"
  [[ -z "$IG_ACCESS_TOKEN" ]]  && echo "   - INSTAGRAM_ACCESS_TOKEN"
  [[ -z "$IG_VERIFY_TOKEN" ]]  && echo "   - INSTAGRAM_WEBHOOK_VERIFY_TOKEN"
  exit 1
fi
info "Environment variables loaded"

# ─── 5. IAM ROLE ─────────────────────────────────────────────────
step "Setting up IAM role..."
ROLE_ARN=$(aws iam get-role \
  --role-name "$ROLE_NAME" \
  --query 'Role.Arn' \
  --output text 2>/dev/null) || true

if [[ -z "$ROLE_ARN" || "$ROLE_ARN" == "None" ]]; then
  echo "  Creating role $ROLE_NAME..."
  ROLE_ARN=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
      "Version":"2012-10-17",
      "Statement":[{
        "Effect":"Allow",
        "Principal":{"Service":"lambda.amazonaws.com"},
        "Action":"sts:AssumeRole"
      }]
    }' \
    --query 'Role.Arn' \
    --output text)

  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

  echo "  Waiting for role to propagate..."
  sleep 8
fi
info "IAM role ready: $ROLE_ARN"

# ─── 6. CREATE OR UPDATE LAMBDA ──────────────────────────────────
ENV_VARS="Variables={ANTHROPIC_API_KEY=$ANTHROPIC_KEY,INSTAGRAM_BUSINESS_ACCOUNT_ID=$IG_ACCOUNT_ID,INSTAGRAM_ACCESS_TOKEN=$IG_ACCESS_TOKEN,INSTAGRAM_WEBHOOK_VERIFY_TOKEN=$IG_VERIFY_TOKEN,CLAUDE_MODEL=$CLAUDE_MODEL_VAL}"

EXISTING=$(aws lambda get-function \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION" \
  --query 'Configuration.FunctionName' \
  --output text 2>/dev/null) || true

if [[ "$EXISTING" == "$FUNCTION_NAME" ]]; then
  step "Updating existing Lambda function..."

  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$ZIP_FILE" \
    --region "$REGION" > /dev/null

  aws lambda wait function-updated \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION"

  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment "$ENV_VARS" \
    --timeout 30 \
    --memory-size 256 \
    --region "$REGION" > /dev/null

else
  step "Creating Lambda function..."

  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime "$RUNTIME" \
    --handler "$HANDLER" \
    --role "$ROLE_ARN" \
    --zip-file "fileb://$ZIP_FILE" \
    --environment "$ENV_VARS" \
    --timeout 30 \
    --memory-size 256 \
    --region "$REGION" > /dev/null

  aws lambda wait function-active \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION"
fi
info "Lambda deployed"

# ─── 7. FUNCTION URL (public HTTPS endpoint) ─────────────────────
step "Setting up Function URL..."
FUNCTION_URL=$(aws lambda get-function-url-config \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION" \
  --query 'FunctionUrl' \
  --output text 2>/dev/null) || true

if [[ -z "$FUNCTION_URL" || "$FUNCTION_URL" == "None" ]]; then
  FUNCTION_URL=$(aws lambda create-function-url-config \
    --function-name "$FUNCTION_NAME" \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["GET","POST"]}' \
    --region "$REGION" \
    --query 'FunctionUrl' \
    --output text)

  aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id "allow-public-invoke" \
    --action "lambda:InvokeFunctionUrl" \
    --principal "*" \
    --function-url-auth-type NONE \
    --region "$REGION" > /dev/null 2>&1 || true
fi
info "Function URL ready"

# ─── 8. DONE ─────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Amber Instagram Lambda is live!${NC}"
echo ""
echo "  Function:     $FUNCTION_NAME"
echo "  Region:       $REGION"
echo "  Webhook URL:  $FUNCTION_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next steps:"
echo ""
echo "1. Go to: https://developers.facebook.com/apps"
echo "2. Select your app → Instagram → Webhooks"
echo "3. Set Callback URL to:  $FUNCTION_URL"
echo "4. Set Verify token to:  $(get_env INSTAGRAM_WEBHOOK_VERIFY_TOKEN)"
echo "5. Click 'Verify and Save'"
echo "6. Under Webhook fields, subscribe to: messages"
echo ""
echo "Test it:"
echo "  Send a DM to your Instagram business account"
echo "  Then check logs: aws logs tail /aws/lambda/$FUNCTION_NAME --follow --region $REGION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
