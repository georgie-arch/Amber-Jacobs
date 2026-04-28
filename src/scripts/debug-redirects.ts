import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
dotenv.config();
chromium.use(StealthPlugin());

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--lang=en-GB,en'] });
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', locale: 'en-GB', viewport: { width: 1280, height: 800 } });
  const full = process.env.LINKEDIN_FULL_COOKIE_STRING || '';
  const cookies = full.split(/;\s+/).flatMap((p: string) => {
    const eq = p.indexOf('='); if (eq === -1) return [];
    const n = p.substring(0, eq).trim(); const v = p.substring(eq+1).trim();
    if (!n || !v || n === 'lang') return [];
    return [{ name: n, value: v, domain: '.linkedin.com', path: '/', secure: true, httpOnly: n === 'li_at' || n === 'bscookie', sameSite: 'None' as const }];
  });
  await ctx.addCookies(cookies);

  const page = await ctx.newPage();
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'src/scripts/screenshots/debug-feed.png', fullPage: false });
  const title = await page.title();
  const bodySnippet = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('Feed URL:', page.url());
  console.log('Title:', title);
  console.log('Body preview:', bodySnippet.replace(/\s+/g, ' ').trim());
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
