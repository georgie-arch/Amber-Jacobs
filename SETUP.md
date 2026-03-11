# 🖤 Amber Jacobs — Setup Guide
## Indvstry Clvb AI Community Manager

---

## What Amber Does

| Platform | Actions |
|----------|---------|
| **Email** | Reads inbox, replies, sends welcome emails, follow-ups |
| **LinkedIn** | Scrapes leads by role/industry, drafts outreach messages |
| **Instagram** | Reads DMs, replies to comments, does outreach |
| **WhatsApp** | Answers enquiries, sends messages, broadcasts |
| **Telegram** | Full bot — answers questions, takes enquiries |
| **Memory** | Remembers every person, every conversation, across all platforms |

---

## Step 1: Prerequisites

```bash
node --version   # Need v18+
npm --version    # Need v8+
```

---

## Step 2: Install

```bash
cd amber-agent
npm install
```

---

## Step 3: Configure

```bash
cp .env.example .env
```

Open `.env` and fill in **at minimum**:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` — from Google Cloud Console
- `TELEGRAM_BOT_TOKEN` — from @BotFather on Telegram

The rest can be added later as you connect each platform.

---

## Step 4: Get Your Gmail OAuth Credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Gmail API**
3. Create OAuth 2.0 credentials (Desktop app)
4. Go to [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
5. In settings (⚙️), enable "Use your own OAuth credentials" — enter your Client ID + Secret
6. Select scope: `https://mail.google.com/`
7. Authorize → Exchange for tokens → Copy **Refresh Token**

---

## Step 5: Create Telegram Bot

1. Open Telegram → search for `@BotFather`
2. Type `/newbot`
3. Name: `Amber - Indvstry Clvb`
4. Username: `AmberIndvstryClvbBot` (must end in 'bot')
5. Copy the token into `.env`

---

## Step 6: Setup Database

```bash
npm run db:setup
```

---

## Step 7: Run Amber

```bash
# Run everything
npm run start

# Run specific services
npm run start:telegram    # Just Telegram
npm run start:email       # Just email + scheduler
npm run start:whatsapp    # Just WhatsApp webhooks

# Test with manual task run
npm run tasks:run
```

---

## Platform Setup Guides

### Instagram
1. Create a **Facebook Developer App** at [developers.facebook.com](https://developers.facebook.com)
2. Add the **Instagram Graph API** product
3. Connect your **Instagram Business Account**
4. Generate a **Long-lived Access Token**
5. Set up webhook URL: `https://yourdomain.com/webhooks/instagram`
6. Subscribe to: `messages`, `comments`

### WhatsApp (Twilio — easiest)
1. Sign up at [twilio.com](https://twilio.com)
2. Activate the **WhatsApp Sandbox**
3. Copy `Account SID` and `Auth Token`
4. Set webhook: `https://yourdomain.com/webhooks/whatsapp/twilio`

### WhatsApp (Meta — production)
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create app → Add **WhatsApp** product
3. Add your business phone number
4. Generate access token
5. Set webhook: `https://yourdomain.com/webhooks/whatsapp/meta`

### LinkedIn Leads (Apify)
1. Sign up at [apify.com](https://apify.com)
2. Copy your API key
3. Amber will automatically scrape leads at 9am daily (weekdays)

---

## Deploying to a Server

Amber needs a public URL for webhooks. Options:

**Development:** Use [ngrok](https://ngrok.com) to expose localhost:
```bash
ngrok http 3000
# Copy the https URL to WEBHOOK_BASE_URL in .env
```

**Production:** Deploy to Railway, Render, or a VPS:
```bash
# Railway (recommended for ease)
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## Managing Amber

```bash
# View all interactions
npm run memory:view

# Process follow-ups now
npm run tasks:run

# Check logs
tail -f logs/amber.log
```

---

## Adding a New Member Manually

```typescript
import AmberAgent from './src/agent/amber';
import { onboardNewMember } from './src/tools/member-manager';

const agent = new AmberAgent();

await onboardNewMember(agent, {
  first_name: 'Sarah',
  last_name: 'Johnson',
  email: 'sarah@example.com',
  phone: '+447XXXXXXXXX',
  company: 'Studio XYZ',
  job_title: 'Creative Director',
  source: 'referral'
});
```

---

## Important Notes

- **LinkedIn scraping** — Apify is the most reliable. LinkedIn bans scrapers regularly. Keep volumes low (20–50 profiles/day).
- **Instagram API** — Only works with a verified Business Account. Personal accounts don't have API access.
- **Approval mode** — By default, Amber drafts everything and George approves. Set `AUTO_SEND=true` to let her fly solo.
- **Memory** — All data is stored locally in `amber_memory.db`. Back this up regularly.

---

## Questions?

Amber is built on Claude (Anthropic). Her brain, personality, and responses are powered by the Claude API.

For issues with the codebase: review `CLAUDE.md` and run in Claude Code.
