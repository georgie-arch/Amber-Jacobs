import dotenv from 'dotenv';
dotenv.config();

import { getLinkedInBrowser, browserGetProfileHeadline, browserPostToLinkedIn, newAuthenticatedPage } from '../integrations/linkedin-browser';

const PROFILE_URL = process.env.LINKEDIN_PROFILE_URL || 'https://www.linkedin.com/in/george-guise-0377961a9';

const POST_TEXT = `Summer is nearly here, and so are some of the most exciting creative events of the year.

I am on a mission to bring my community together, connecting creatives, makers and culture-shapers at the moments that matter most. If you are heading to any of the major creative festivals this summer, I would love to connect in person.

Stay tuned for some exciting Cannes 2026 updates especially! 🚀`;

async function main() {
  console.log('🔐 Initialising LinkedIn browser session...');
  const browser = await getLinkedInBrowser();

  // ── 1. Read profile headline ─────────────────────────────────
  console.log(`\n👤 Reading headline from: ${PROFILE_URL}`);
  const headline = await browserGetProfileHeadline(browser, PROFILE_URL);
  if (headline) {
    console.log(`\n📋 Current headline: "${headline}"`);
  } else {
    console.log('\n⚠️  Could not read headline — check src/scripts/screenshots/linkedin-profile-debug.png');
  }

  // ── 2. Create the post ───────────────────────────────────────
  console.log(`\n📝 Creating post on feed...`);
  const posted = await browserPostToLinkedIn(browser, POST_TEXT);

  if (!posted) {
    console.error('❌ Post failed — check src/scripts/screenshots/linkedin-post-debug.png');
    await browser.close();
    process.exit(1);
  }

  // ── 3. Fetch post URL from recent activity ───────────────────
  console.log('\n🔍 Fetching post URL from recent activity...');
  await new Promise(r => setTimeout(r, 3000)); // give LinkedIn a moment to index

  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    await page.goto(
      'https://www.linkedin.com/in/george-guise-0377961a9/recent-activity/shares/',
      { waitUntil: 'domcontentloaded', timeout: 30000 }
    );
    await page.waitForTimeout(4000);

    // Try to find the most recent post link
    const postLink = await page.locator('a[href*="/feed/update/"]').first()
      .getAttribute('href').catch(() => null);

    await page.screenshot({ path: 'src/scripts/screenshots/linkedin-post-created.png' });

    if (postLink) {
      const fullUrl = `https://www.linkedin.com${postLink.split('?')[0]}`;
      console.log(`\n✅ Post live at: ${fullUrl}`);
    } else {
      console.log('\n✅ Post published. URL not auto-captured — check linkedin.com/in/george-guise-0377961a9/recent-activity/shares/');
    }
  } finally {
    await ctx.close();
  }

  await browser.close();
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
