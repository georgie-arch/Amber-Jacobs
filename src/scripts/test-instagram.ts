/**
 * test-instagram.ts
 *
 * End-to-end test of Amber's Instagram capabilities.
 * Read tests run by default. Action tests require explicit targets.
 *
 * Flags:
 *   --read-only         Only run credential check, follower count, inbox, media reads
 *   --send-dm=IG_ID     Send a test DM to a user ID (must have messaged first)
 *   --comment=MEDIA_ID  Post a test comment on a media ID
 *   --reply=COMMENT_ID  Post a public reply to a comment ID
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/test-instagram.ts --read-only
 *   npx ts-node --project tsconfig.json src/scripts/test-instagram.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

const args = process.argv.slice(2);
const READ_ONLY = args.includes('--read-only');
const DM_TARGET = args.find(a => a.startsWith('--send-dm='))?.split('=')[1];
const COMMENT_TARGET = args.find(a => a.startsWith('--comment='))?.split('=')[1];
const REPLY_TARGET = args.find(a => a.startsWith('--reply='))?.split('=')[1];

interface TestResult { name: string; status: 'PASS' | 'FAIL' | 'SKIP'; detail?: string; }
const results: TestResult[] = [];

function pass(name: string, detail?: string) {
  results.push({ name, status: 'PASS', detail });
  console.log(`  ✅ PASS  ${name}${detail ? '  |  ' + detail : ''}`);
}
function fail(name: string, detail?: string) {
  results.push({ name, status: 'FAIL', detail });
  console.log(`  ❌ FAIL  ${name}${detail ? '  |  ' + detail : ''}`);
}
function skip(name: string, reason: string) {
  results.push({ name, status: 'SKIP', detail: reason });
  console.log(`  ⏭  SKIP  ${name}  |  ${reason}`);
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(' Instagram Capability Test Suite');
  console.log(' ' + new Date().toISOString());
  console.log(' Mode: ' + (READ_ONLY ? 'READ-ONLY' : 'FULL'));
  console.log(' Webhook URL: ' + (process.env.WEBHOOK_BASE_URL || '(not set)') + '/webhooks/instagram');
  console.log('═'.repeat(60) + '\n');

  if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) {
    console.log('❌ INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID not set in .env');
    process.exit(1);
  }

  // ── TEST 1: Validate access token ────────────────────────────────
  console.log('\n[1] Validate access token...');
  try {
    const res = await axios.get(`${GRAPH_API}/${BUSINESS_ACCOUNT_ID}`, {
      params: { access_token: ACCESS_TOKEN, fields: 'id,name,username,followers_count,media_count' }
    });
    const d = res.data;
    pass('Access token valid', `@${d.username} | ${d.followers_count} followers | ${d.media_count} posts`);
  } catch (err: any) {
    fail('Access token valid', err.response?.data?.error?.message || err.message);
    console.log('\n  ⚠️  Token invalid. Run: npx ts-node --project tsconfig.json src/scripts/refresh-instagram-token.ts');
    printSummary();
    return;
  }

  // ── TEST 2: Token expiry check ────────────────────────────────────
  console.log('\n[2] Check token expiry...');
  try {
    const appToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
    const res = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: { input_token: ACCESS_TOKEN, access_token: appToken }
    });
    const data = res.data?.data;
    const expiresAt: number = data?.expires_at;
    if (!expiresAt) {
      pass('Token expiry', 'No expiry (permanent system user token)');
    } else {
      const daysLeft = Math.round((expiresAt * 1000 - Date.now()) / 86_400_000);
      const expiryDate = new Date(expiresAt * 1000).toDateString();
      if (daysLeft < 14) {
        fail('Token expiry', `Expires ${expiryDate} (${daysLeft} days) — refresh NOW`);
      } else {
        pass('Token expiry', `Expires ${expiryDate} (${daysLeft} days left)`);
      }
    }
  } catch (err: any) {
    skip('Token expiry', 'META_APP_ID/META_APP_SECRET not set — cannot debug token');
  }

  // ── TEST 3: Read recent media ─────────────────────────────────────
  console.log('\n[3] Read recent media (posts)...');
  let firstMediaId = '';
  let firstCommentId = '';
  try {
    const res = await axios.get(`${GRAPH_API}/${BUSINESS_ACCOUNT_ID}/media`, {
      params: {
        access_token: ACCESS_TOKEN,
        fields: 'id,caption,media_type,timestamp,comments_count,like_count',
        limit: 3
      }
    });
    const posts = res.data?.data || [];
    if (posts.length === 0) {
      fail('Read recent media', 'No posts found');
    } else {
      firstMediaId = posts[0].id;
      pass('Read recent media', `${posts.length} posts returned, latest ID: ${firstMediaId}`);
    }
  } catch (err: any) {
    fail('Read recent media', err.response?.data?.error?.message || err.message);
  }

  // ── TEST 4: Read comments on most recent post ─────────────────────
  console.log('\n[4] Read comments on most recent post...');
  if (!firstMediaId) {
    skip('Read comments', 'No media ID from test 3');
  } else {
    try {
      const res = await axios.get(`${GRAPH_API}/${firstMediaId}/comments`, {
        params: { access_token: ACCESS_TOKEN, fields: 'id,text,username,timestamp' }
      });
      const comments = res.data?.data || [];
      if (comments.length > 0) {
        firstCommentId = comments[0].id;
        pass('Read comments', `${comments.length} comments, first: "${comments[0].text?.substring(0, 60)}"`);
      } else {
        pass('Read comments', 'No comments on latest post (endpoint working)');
      }
    } catch (err: any) {
      fail('Read comments', err.response?.data?.error?.message || err.message);
    }
  }

  // ── TEST 5: Read DM inbox ─────────────────────────────────────────
  console.log('\n[5] Read DM inbox...');
  try {
    const res = await axios.get(`${GRAPH_API}/${BUSINESS_ACCOUNT_ID}/conversations`, {
      params: {
        access_token: ACCESS_TOKEN,
        fields: 'messages{message,from,created_time}',
        platform: 'instagram'
      }
    });
    const convs = res.data?.data || [];
    pass('Read DM inbox', `${convs.length} conversations found`);
  } catch (err: any) {
    fail('Read DM inbox', err.response?.data?.error?.message || err.message);
  }

  // ── TEST 6: Webhook reachability ──────────────────────────────────
  console.log('\n[6] Webhook reachability...');
  const webhookBase = process.env.WEBHOOK_BASE_URL;
  if (!webhookBase) {
    skip('Webhook reachability', 'WEBHOOK_BASE_URL not set in .env');
  } else {
    try {
      const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || '';
      const res = await axios.get(`${webhookBase}/webhooks/instagram`, {
        params: {
          'hub.mode': 'subscribe',
          'hub.verify_token': verifyToken,
          'hub.challenge': 'TEST_CHALLENGE_12345'
        },
        validateStatus: () => true
      });
      if (res.status === 200 && res.data === 'TEST_CHALLENGE_12345') {
        pass('Webhook reachability', `${webhookBase}/webhooks/instagram is live and verified`);
      } else if (res.status === 403) {
        fail('Webhook reachability', `403 — verify token mismatch. Expected: "${verifyToken}"`);
      } else {
        fail('Webhook reachability', `Status ${res.status}, body: ${String(res.data).substring(0, 80)}`);
      }
    } catch (err: any) {
      fail('Webhook reachability', err.message);
    }
  }

  // ── TEST 7: Send DM (action) ──────────────────────────────────────
  if (READ_ONLY || !DM_TARGET) {
    skip('Send DM', READ_ONLY ? 'read-only mode' : 'pass --send-dm=IG_USER_ID to test');
  } else {
    console.log(`\n[7] Send DM to ${DM_TARGET}...`);
    try {
      await axios.post(
        `${GRAPH_API}/${BUSINESS_ACCOUNT_ID}/messages`,
        { recipient: { id: DM_TARGET }, message: { text: 'Test from Amber — confirming DM capability is working.' } },
        { params: { access_token: ACCESS_TOKEN } }
      );
      pass('Send DM', `DM sent to ${DM_TARGET}`);
    } catch (err: any) {
      fail('Send DM', err.response?.data?.error?.message || err.message);
    }
  }

  // ── TEST 8: Post comment (action) ─────────────────────────────────
  const commentMediaId = COMMENT_TARGET || firstMediaId;
  if (READ_ONLY || !COMMENT_TARGET) {
    skip('Post comment', READ_ONLY ? 'read-only mode' : 'pass --comment=MEDIA_ID to test (will post a real comment)');
  } else {
    console.log(`\n[8] Post comment on ${commentMediaId}...`);
    try {
      const res = await axios.post(
        `${GRAPH_API}/${commentMediaId}/comments`,
        { message: 'Test comment from Amber — confirming comment capability.' },
        { params: { access_token: ACCESS_TOKEN } }
      );
      pass('Post comment', `Comment posted, ID: ${res.data.id}`);
    } catch (err: any) {
      fail('Post comment', err.response?.data?.error?.message || err.message);
    }
  }

  // ── TEST 9: Reply to comment (action) ─────────────────────────────
  const replyCommentId = REPLY_TARGET || firstCommentId;
  if (READ_ONLY || !REPLY_TARGET) {
    skip('Reply to comment', READ_ONLY ? 'read-only mode' : 'pass --reply=COMMENT_ID to test');
  } else {
    console.log(`\n[9] Reply to comment ${replyCommentId}...`);
    try {
      await axios.post(
        `${GRAPH_API}/${replyCommentId}/replies`,
        { message: 'Test reply from Amber — confirming reply capability.' },
        { params: { access_token: ACCESS_TOKEN } }
      );
      pass('Reply to comment', `Reply posted on ${replyCommentId}`);
    } catch (err: any) {
      fail('Reply to comment', err.response?.data?.error?.message || err.message);
    }
  }

  printSummary();
}

function printSummary() {
  const passed  = results.filter(r => r.status === 'PASS').length;
  const failed  = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log('\n' + '═'.repeat(60));
  console.log(` Results: ${passed} passed  ${failed} failed  ${skipped} skipped`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  x ${r.name}: ${r.detail || ''}`);
    });
  }

  if (skipped > 0) {
    console.log('\nSkipped (action tests — pass flags to enable):');
    results.filter(r => r.status === 'SKIP').forEach(r => {
      console.log(`  - ${r.name}: ${r.detail}`);
    });
  }

  console.log('\nMeta Developer Console setup checklist:');
  console.log('  1. Go to: developers.facebook.com > Your App > Webhooks');
  console.log('  2. Callback URL: ' + (process.env.WEBHOOK_BASE_URL || 'https://your-railway-app.up.railway.app') + '/webhooks/instagram');
  console.log('  3. Verify token: ' + (process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'amber_indvstryclvb_webhook_2024'));
  console.log('  4. Subscribe to fields: messages, comments');
  console.log('  5. Token refresh: run refresh-instagram-token.ts every ~55 days');
  console.log('');
}

main().catch(err => {
  console.error('Test suite crashed:', err.message);
  process.exit(1);
});
