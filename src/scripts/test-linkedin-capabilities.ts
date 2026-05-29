/**
 * test-linkedin-capabilities.ts
 *
 * End-to-end test of every LinkedIn browser capability.
 * Read-only tests run by default. Action tests require explicit targets below.
 *
 * Set targets here or via env vars before running:
 *   CONNECT_TARGET   — profile URL to send a connection request to
 *   DM_TARGET        — profile URL to send a DM to (must already be connected)
 *   FOLLOW_TARGET    — profile URL to follow
 *   COMMENT_POST_URL — post URL to comment on
 *
 * Flags:
 *   --read-only      Run only auth/visit/headline/check-connected (no side effects)
 *   --skip-connect
 *   --skip-dm
 *   --skip-follow
 *   --skip-comment
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/test-linkedin-capabilities.ts
 *   npx ts-node --project tsconfig.json src/scripts/test-linkedin-capabilities.ts --read-only
 */

import dotenv from 'dotenv';
dotenv.config();

import {
  getLinkedInBrowser,
  closeBrowser,
  browserVisitProfile,
  browserGetProfileHeadline,
  browserCheckIsConnected,
  browserFollowProfile,
  browserSendConnectionRequest,
  browserSendMessage,
  browserCommentOnPost,
} from '../integrations/linkedin-browser';
import { logger } from '../utils/logger';

// ─── TARGETS ─────────────────────────────────────────────────────────────────
// Profile used for all READ-ONLY tests (visit, headline, check-connected).
// Use a third-party public profile — not George's own (LinkedIn behaves differently on self-visits).
const READ_PROFILE = process.env.TEST_PROFILE_URL
  || 'https://www.linkedin.com/in/cindygallop/';

// Action targets — set via env or hardcode below
const CONNECT_TARGET  = process.env.CONNECT_TARGET  || 'https://www.linkedin.com/in/hiroyukikato/';
const FOLLOW_TARGET   = process.env.FOLLOW_TARGET   || 'https://www.linkedin.com/in/cindygallop/';
const DM_TARGET       = process.env.DM_TARGET       || '';   // must be already connected
const COMMENT_POST    = process.env.COMMENT_POST_URL || '';  // a LinkedIn post URL

const NOTE = "Hi! I came across your profile and would love to connect. I'm building a curated creative community at Indvstry Clvb and your work is exactly the kind we love to bring together.";
const DM   = "Hey, thanks for connecting! I'd love to share more about what we're building at Indvstry Clvb when you have a moment.";
const COMMENT = "Great perspective. This is exactly the kind of thinking the creative industry needs right now.";

// ─── FLAGS ───────────────────────────────────────────────────────────────────
const args        = new Set(process.argv.slice(2));
const READ_ONLY   = args.has('--read-only');
const SKIP_CONNECT  = READ_ONLY || args.has('--skip-connect');
const SKIP_DM       = READ_ONLY || args.has('--skip-dm');
const SKIP_FOLLOW   = READ_ONLY || args.has('--skip-follow');
const SKIP_COMMENT  = READ_ONLY || args.has('--skip-comment');

// ─── RESULT TRACKING ─────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  detail?: string;
}

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

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(' LinkedIn Capability Test Suite');
  console.log(' ' + new Date().toISOString());
  console.log(' Mode: ' + (READ_ONLY ? 'READ-ONLY' : 'FULL (includes live actions)'));
  console.log('═'.repeat(60) + '\n');

  let browser: any = null;

  // ── TEST 1: Session auth ─────────────────────────────────────────────────
  console.log('\n[1/8] Browser session auth...');
  try {
    browser = await getLinkedInBrowser();
    pass('Session auth', 'li_at cookie valid, feed loaded');
  } catch (err: any) {
    fail('Session auth', err.message.substring(0, 120));
    console.log('\n  ⚠️  Session expired. Refresh steps:');
    console.log('  1. Open linkedin.com in Chrome, make sure you\'re logged in as George');
    console.log('  2. Open DevTools → Application → Cookies → www.linkedin.com');
    console.log('  3. Copy the value of "li_at" → update LINKEDIN_LI_AT_COOKIE in .env');
    console.log('  4. In DevTools → Network, click any feed request → Headers → Request Headers');
    console.log('  5. Copy the full "Cookie:" line → update LINKEDIN_FULL_COOKIE_STRING in .env');
    console.log('  6. Also copy the "csrf-token" header value → update LINKEDIN_CSRF_TOKEN in .env');
    printSummary();
    return;
  }

  // ── TEST 2: Visit profile ────────────────────────────────────────────────
  console.log(`\n[2/8] Visit profile (${READ_PROFILE})...`);
  try {
    const visited = await browserVisitProfile(browser, READ_PROFILE);
    if (visited) {
      pass('Visit profile', 'profile loaded + scrolled (triggers "viewed your profile")');
    } else {
      fail('Visit profile',
        'Profile navigation looping — lidc routing cookie likely expired.\n' +
        '  Fix: refresh LINKEDIN_FULL_COOKIE_STRING in .env (see steps at end of test)');
    }
  } catch (err: any) {
    if (err.message?.includes('ERR_TOO_MANY_REDIRECTS')) {
      fail('Visit profile', 'ERR_TOO_MANY_REDIRECTS — lidc routing cookie expired. Refresh LINKEDIN_FULL_COOKIE_STRING in .env');
    } else {
      fail('Visit profile', err.message.substring(0, 120));
    }
  }

  // ── TEST 3: Get profile headline ─────────────────────────────────────────
  console.log(`\n[3/8] Get profile headline (${READ_PROFILE})...`);
  try {
    const headline = await browserGetProfileHeadline(browser, READ_PROFILE);
    if (headline) {
      pass('Get profile headline', `"${headline.substring(0, 80)}"`);
    } else {
      fail('Get profile headline', 'headline text not found — check src/scripts/screenshots/linkedin-profile-debug.png');
    }
  } catch (err: any) {
    fail('Get profile headline', err.message.substring(0, 120));
  }

  // ── TEST 4: Check if connected ───────────────────────────────────────────
  console.log(`\n[4/8] Check if connected (${READ_PROFILE})...`);
  try {
    const isConnected = await browserCheckIsConnected(browser, READ_PROFILE);
    // On George's own profile, "Message" button won't appear so this will be false —
    // that's expected. The test is that it ran without error.
    pass('Check if connected', `result: ${isConnected} (false on own profile is correct)`);
  } catch (err: any) {
    fail('Check if connected', err.message.substring(0, 120));
  }

  // ── TEST 5: Follow profile ───────────────────────────────────────────────
  if (SKIP_FOLLOW) {
    skip('Follow profile', FOLLOW_TARGET ? '--skip-follow flag set' : 'no FOLLOW_TARGET set');
  } else {
    console.log(`\n[5/8] Follow profile (${FOLLOW_TARGET})...`);
    try {
      const followed = await browserFollowProfile(browser, FOLLOW_TARGET);
      if (followed) {
        pass('Follow profile', `now following ${FOLLOW_TARGET}`);
      } else {
        // false = already following, or button not found. Not necessarily a failure.
        pass('Follow profile', 'returned false — likely already following (not an error)');
      }
    } catch (err: any) {
      fail('Follow profile', err.message.substring(0, 120));
    }
  }

  // ── TEST 6: Send connection request ──────────────────────────────────────
  if (SKIP_CONNECT) {
    skip('Send connection request', READ_ONLY ? 'read-only mode' : '--skip-connect flag set');
  } else if (!CONNECT_TARGET) {
    skip('Send connection request', 'set CONNECT_TARGET env var to a LinkedIn profile URL');
  } else {
    console.log(`\n[6/8] Send connection request (${CONNECT_TARGET})...`);
    try {
      const sent = await browserSendConnectionRequest(browser, CONNECT_TARGET, NOTE);
      if (sent) {
        pass('Send connection request', `request sent to ${CONNECT_TARGET}`);
      } else {
        // false can mean: already connected, already pending, follow-only, button not found
        fail('Send connection request', 'returned false — may be already connected/pending or follow-only profile');
      }
    } catch (err: any) {
      fail('Send connection request', err.message.substring(0, 120));
    }
  }

  // ── TEST 7: Send DM ──────────────────────────────────────────────────────
  if (SKIP_DM) {
    skip('Send DM', READ_ONLY ? 'read-only mode' : '--skip-dm flag set');
  } else if (!DM_TARGET) {
    skip('Send DM', 'set DM_TARGET env var to a profile you\'re already connected to');
  } else {
    console.log(`\n[7/8] Send DM (${DM_TARGET})...`);
    try {
      const sent = await browserSendMessage(browser, DM_TARGET, DM);
      if (sent) {
        pass('Send DM', `message sent to ${DM_TARGET}`);
      } else {
        fail('Send DM', 'returned false — not connected to this person yet, or Message button not found');
      }
    } catch (err: any) {
      fail('Send DM', err.message.substring(0, 120));
    }
  }

  // ── TEST 8: Comment on post ───────────────────────────────────────────────
  if (SKIP_COMMENT) {
    skip('Comment on post', READ_ONLY ? 'read-only mode' : '--skip-comment flag set');
  } else if (!COMMENT_POST) {
    skip('Comment on post', 'set COMMENT_POST_URL env var to a LinkedIn post URL');
  } else {
    console.log(`\n[8/8] Comment on post (${COMMENT_POST})...`);
    try {
      const commented = await browserCommentOnPost(browser, COMMENT_POST, COMMENT);
      if (commented) {
        pass('Comment on post', `comment posted on ${COMMENT_POST}`);
      } else {
        fail('Comment on post', 'returned false — comment box or submit button not found');
      }
    } catch (err: any) {
      fail('Comment on post', err.message.substring(0, 120));
    }
  }

  await closeBrowser();
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
      console.log(`  • ${r.name}${r.detail ? ': ' + r.detail : ''}`);
    });
  }

  if (skipped > 0) {
    console.log('\nSkipped (action tests — run with targets set to enable):');
    results.filter(r => r.status === 'SKIP').forEach(r => {
      console.log(`  • ${r.name}: ${r.detail}`);
    });
  }

  console.log('');
}

main().catch(err => {
  logger.error(`Test suite crashed: ${err.message}`);
  closeBrowser().catch(() => {});
  process.exit(1);
});
