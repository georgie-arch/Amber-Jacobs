/**
 * linkedin-browser.ts
 *
 * LinkedIn browser automation via Playwright.
 * Uses a real Chromium session authenticated with the li_at cookie —
 * identical to what Dripify and similar tools do under the hood.
 *
 * Why this instead of the Voyager API:
 *   LinkedIn's WAF blocks server-side POST requests (connection invites,
 *   messages) even with valid session cookies. A real browser bypasses
 *   fingerprinting checks because it IS the browser.
 *
 * Key behaviours:
 *   - One shared browser + context for the whole run (see note below)
 *   - Human-like random delays between every interaction
 *   - Stealth mode: disables navigator.webdriver flag
 *   - All actions respect daily limits set in linkedin-drip.ts
 *   - Session health checked before each action — auto-restores if expired
 *
 * Usage:
 *   const browser = await getLinkedInBrowser();
 *   await browserSendConnectionRequest(browser, 'https://linkedin.com/in/username', 'Hi...');
 *   await browserSendMessage(browser, 'https://linkedin.com/in/username', 'Hey...');
 *   await closeBrowser();
 */

import { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// Apply full stealth suite — patches navigator.webdriver, plugins, permissions,
// WebGL fingerprint, chrome.runtime, etc. Must be called before any launch.
chromium.use(StealthPlugin());

// ─── SINGLETON BROWSER + CONTEXT ─────────────────────────────────────────────
// ONE Browser and ONE BrowserContext stay alive for the whole run. Per-action
// functions open a new Page and close it when done, but the context (and its
// cookie jar, session storage, service workers) is never torn down.
//
// Why: LinkedIn's session continuity depends on cookies set by the initial
// feed load (lidc, __cf_bm, JSESSIONID, etc.). Closing and recreating the
// context between actions discards those and causes ERR_TOO_MANY_REDIRECTS on
// subsequent profile navigations — the opposite of what "fresh context" intends.

let _browser: Browser | null = null;
let _context: BrowserContext | null = null;

async function getOrLaunchBrowser(): Promise<Browser> {
  if (_browser) return _browser;

  logger.info('🌐 Launching LinkedIn browser...');
  _browser = await chromium.launch({
    headless: process.env.LINKEDIN_HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,800',
      '--disable-dev-shm-usage',
      '--lang=en-US,en',
    ],
  });
  return _browser;
}

// Parse the LINKEDIN_FULL_COOKIE_STRING (raw Cookie header from Chrome DevTools)
// into Playwright cookie objects for addCookies(). Splitting on '; ' handles
// values that contain '=' (base64) and quoted values like bcookie="v=2&...".
//
// Only inject auth-essential LinkedIn cookies. Strip everything else.
//
// KEEP (auth-essential):
//   li_at, bscookie, bcookie — primary auth tokens
//   JSESSIONID              — CSRF token
//   li_gc                   — GDPR consent
//   lidc                    — CDN datacenter routing (required — feed fails without it)
//   li_mc, li_alerts        — session state
//   timezone, g_state       — locale/Google auth
//   liap, sdui_ver          — LinkedIn platform/UI version cookies
//
// STRIP (causes problems or irrelevant):
//   lang        — stale locale causes redirect loops on non-US IPs
//   __cf_bm     — Cloudflare bot token, 30-min TTL. Short-lived, stale value causes issues.
//   _pxvid      — PerimeterX visitor ID fingerprinted to the original Chrome browser.
//                 Injecting a Chrome-fingerprinted _pxvid into Playwright causes PX to
//                 detect a fingerprint mismatch and trigger a 302 self-redirect loop on
//                 profile pages (feed is more lenient). Stripping lets PX assign a fresh
//                 ID matching our actual browser fingerprint.
//   dfpfpt, AnalyticsSyncHistory, lms_ads, lms_analytics — ad/analytics tracking
//   AMCV_*, AMCVS_*, aam_uuid — Adobe Analytics (fingerprint-tied)
//   fptctx2     — DoubleClick fingerprint context
function parseLinkedInCookies(fullCookieString: string, liAt: string, csrfToken: string) {
  const domain = '.linkedin.com';
  const path = '/';
  const STRIP = new Set([
    'lang', '__cf_bm',
    '_pxvid',
    'dfpfpt', 'AnalyticsSyncHistory', 'lms_ads', 'lms_analytics',
    'AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg',
    'AMCV_14215E3D5995C57C0A495C55%40AdobeOrg',
    'aam_uuid',
    'fptctx2',
  ]);

  if (fullCookieString) {
    return fullCookieString.split(/;\s+/).flatMap(part => {
      const eqIdx = part.indexOf('=');
      if (eqIdx === -1) return [];
      const name = part.substring(0, eqIdx).trim();
      const value = part.substring(eqIdx + 1).trim();
      if (!name || !value || STRIP.has(name)) return [];
      return [{
        name,
        value,
        domain,
        path,
        secure: true,
        httpOnly: name === 'li_at' || name === 'bscookie',
        sameSite: 'None' as const,
      }];
    });
  }

  // Minimal fallback when no full cookie string is set
  const cookies = [];
  if (liAt) cookies.push({ name: 'li_at', value: liAt, domain, path, secure: true, httpOnly: true, sameSite: 'None' as const });
  if (csrfToken) cookies.push({ name: 'JSESSIONID', value: `"${csrfToken}"`, domain, path, secure: true, httpOnly: false, sameSite: 'None' as const });
  return cookies;
}

// Get or create the shared BrowserContext. Called once; subsequent calls
// return the same context so cookies accumulate across actions.
async function getOrCreateContext(browser: Browser): Promise<BrowserContext> {
  if (_context) return _context;

  const fullCookieString = process.env.LINKEDIN_FULL_COOKIE_STRING || '';
  const liAt = process.env.LINKEDIN_LI_AT_COOKIE || '';
  const csrfToken = (process.env.LINKEDIN_CSRF_TOKEN || '').replace(/^"|"$/g, '');

  _context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-GB',
  });

  const cookies = parseLinkedInCookies(fullCookieString, liAt, csrfToken);
  if (cookies.length > 0) await _context.addCookies(cookies);

  return _context;
}

// Open a new Page from the shared context. Returns a pseudo-ctx whose close()
// only closes the page — callers use the same try/finally { ctx.close() }
// pattern but the shared context stays alive.
//
// If the shared context or browser has died (crash, OOM, etc.) since the last
// action, the singleton references become stale and context.newPage() throws
// "Target page, context or browser has been closed". We detect that here,
// reset both singletons, and re-launch fresh so the caller gets a working page
// without having to know anything about the crash.
async function newAuthenticatedPage(browser: Browser): Promise<{ page: Page; ctx: { close: () => Promise<void> } }> {
  let context = await getOrCreateContext(browser);
  let page: Page;

  try {
    page = await context.newPage();
  } catch (err: any) {
    if (err.message?.includes('closed') || err.message?.includes('Target page')) {
      logger.warn('  Shared context/browser died — resetting and re-launching...');
      if (_context) { await _context.close().catch(() => {}); _context = null; }
      if (_browser) { await _browser.close().catch(() => {}); _browser = null; }

      const freshBrowser = await getOrLaunchBrowser();
      context = await getOrCreateContext(freshBrowser);
      page = await context.newPage();
    } else {
      throw err;
    }
  }

  return { page, ctx: { close: async () => { await page.close().catch(() => {}); } } };
}

// Validate that the li_at session cookie is still working.
// Keeps the context alive after validation so the feed cookies persist.
export async function getLinkedInBrowser(): Promise<Browser> {
  const browser = await getOrLaunchBrowser();

  logger.info('🔄 Validating LinkedIn session and warming routing cookies...');
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    // Use gotoWithRetry so lidc redirect loops are auto-recovered
    await gotoWithRetry(page, 'https://www.linkedin.com/feed/');
    const url = page.url();
    if (url.includes('/login') || url.includes('/authwall') || url.includes('/checkpoint') || url.includes('/uas/')) {
      throw new Error(
        'LinkedIn session expired or invalid. ' +
        'Go to linkedin.com in Chrome → DevTools → Application → Cookies → copy li_at value → update LINKEDIN_LI_AT_COOKIE in .env. ' +
        'Also copy the full Cookie header from DevTools → Network → any feed request → update LINKEDIN_FULL_COOKIE_STRING.'
      );
    }
    await humanDelay(2000, 3000);
    logger.info('✅ Session valid — routing cookies warmed');
  } finally {
    await ctx.close(); // closes just the page; context stays alive with all fresh cookies
  }

  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (_context) {
    await _context.close().catch(() => {});
    _context = null;
  }
  if (_browser) {
    await _browser.close();
    _browser = null;
    logger.info('🌐 LinkedIn browser closed');
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Dismiss LinkedIn cookie/privacy consent banners if present
async function dismissConsentBanner(page: Page): Promise<void> {
  const acceptBtn = page.locator('button:has-text("Accept"), button[action-type="ACCEPT"]').first();
  if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptBtn.click();
    await humanDelay(600, 1000);
    logger.info('  Cookie consent banner dismissed');
  }
}

// Export for use in scripts that need a raw authenticated page
export { newAuthenticatedPage };

// Get the headline from a LinkedIn profile
export async function browserGetProfileHeadline(
  browser: Browser,
  profileUrl: string
): Promise<string | null> {
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    await gotoWithRetry(page, profileUrl);
    await humanDelay(2500, 4000);
    await dismissConsentBanner(page);
    await humanDelay(1000, 1500);

    // Multiple selectors for the headline field
    const selectors = [
      '.text-body-medium.break-words',
      '[data-field="headline"]',
      '.pv-text-details__left-panel .text-body-medium',
      'div.ph5 .text-body-medium',
      'h2 + .text-body-medium',
    ];

    for (const sel of selectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await el.textContent();
        if (text?.trim()) return text.trim();
      }
    }

    // Fallback: screenshot for manual review
    await page.screenshot({ path: 'src/scripts/screenshots/linkedin-profile-debug.png' });
    return null;
  } finally {
    await ctx.close();
  }
}

// Human-like pause: random ms between min and max
function humanDelay(minMs = 800, maxMs = 2400): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(r => setTimeout(r, ms));
}

// Type text with random per-character delay (looks like real typing)
async function humanType(page: Page, selector: string, text: string): Promise<void> {
  await page.click(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: Math.floor(Math.random() * 80) + 30 });
  }
}

// Check if the session is authenticated (not redirected to login)
async function isLoggedIn(page: Page): Promise<boolean> {
  const url = page.url();
  const loggedIn = !url.includes('/login') && !url.includes('/authwall') && !url.includes('/checkpoint');
  if (!loggedIn) logger.warn(`  Session check failed — landed at: ${url.substring(0, 120)}`);
  return loggedIn;
}

// Navigate with warm-up + redirect-loop recovery.
//
// Fresh pages always warm up on the feed first so LinkedIn's routing cookies
// (lidc, JSESSIONID etc.) are set before navigating to a deep profile URL.
//
// When a redirect loop is detected, we listen to intermediate 302 responses to
// capture a fresh lidc from LinkedIn's Set-Cookie header, apply it to the context,
// then retry. This avoids the need for frequent manual cookie refreshes.
async function gotoWithRetry(page: Page, url: string): Promise<void> {
  const normalised = url.replace(/^https?:\/\/[a-z]{2,3}\.linkedin\.com\//, 'https://www.linkedin.com/');

  // Warm up on feed for any fresh (non-LinkedIn) page
  const currentUrl = page.url();
  const needsWarmup = !currentUrl.includes('linkedin.com') || currentUrl === 'about:blank';

  if (needsWarmup && !normalised.includes('/feed/')) {
    logger.info('  Warming up on feed before profile navigation...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await humanDelay(2000, 3500);
  }

  // Capture fresh lidc from any 302 redirect responses LinkedIn sends during navigation.
  // LinkedIn issues a new lidc in Set-Cookie during the redirect chain — we capture it
  // so we can apply it and retry if the initial navigation loops.
  let capturedLidc: string | null = null;
  const responseHandler = (response: import('playwright').Response) => {
    const status = response.status();
    if (status < 300 || status >= 400) return;
    if (!response.url().includes('linkedin.com')) return;
    const headers = response.headers();
    const location = headers['location'] ?? '(no location)';
    const setCookie = headers['set-cookie'] ?? '';
    logger.info(`  [redirect ${status}] from: ${response.url()} → ${location}`);
    if (setCookie) logger.info(`  [set-cookie] ${setCookie.substring(0, 200)}`);
    if (setCookie.includes('lidc=')) {
      const match = setCookie.match(/lidc=("[^"]*"|[^;,\s]*)/);
      if (match) {
        capturedLidc = match[1];
        logger.info(`  Captured fresh lidc from redirect (t=${capturedLidc.match(/t=(\d+)/)?.[1] ?? '?'})`);
      }
    }
  };
  page.on('response', responseHandler);

  try {
    await page.goto(normalised, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err: any) {
    if (err.message?.includes('ERR_TOO_MANY_REDIRECTS') || err.message?.includes('interrupted by another navigation')) {
      page.off('response', responseHandler);

      if (capturedLidc && _context) {
        // LinkedIn gave us a fresh lidc in the redirect chain — apply it and retry
        logger.info('  Applying captured fresh lidc and retrying...');
        await _context.addCookies([{
          name: 'lidc', value: capturedLidc,
          domain: '.linkedin.com', path: '/',
          secure: true, httpOnly: false, sameSite: 'None' as const,
        }]);
        await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
        await humanDelay(1500, 2500);
        await page.goto(normalised, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } else {
        // No fresh lidc captured — fall back to re-warming feed and retrying once
        logger.info('  Redirect loop — no fresh lidc captured; re-warming feed and retrying...');
        await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
        await humanDelay(1500, 2500);
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 25000 });
        await humanDelay(3000, 5000);
        await page.goto(normalised, { waitUntil: 'domcontentloaded', timeout: 30000 });
      }
    } else {
      page.off('response', responseHandler);
      throw err;
    }
  }

  page.off('response', responseHandler);

  if (!await isLoggedIn(page)) {
    logger.info('  Retrying navigation after 10s...');
    await humanDelay(10000, 12000);
    await page.goto(normalised, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }
}

// ─── VISIT PROFILE ────────────────────────────────────────────────────────────

export async function browserVisitProfile(
  browser: Browser,
  profileUrl: string
): Promise<boolean> {
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    await gotoWithRetry(page, profileUrl);
    await humanDelay(1500, 3000);

    if (!await isLoggedIn(page)) {
      logger.warn('LinkedIn session expired — please refresh LINKEDIN_LI_AT_COOKIE in .env');
      return false;
    }

    // Scroll a bit — registers as a real profile view
    await page.evaluate(() => (globalThis as any).window.scrollBy(0, 400));
    await humanDelay(1000, 2000);
    await page.evaluate(() => (globalThis as any).window.scrollBy(0, 300));
    await humanDelay(500, 1200);

    logger.info(`👁  Profile visited: ${profileUrl}`);
    return true;
  } catch (err: any) {
    logger.warn(`Profile visit failed for ${profileUrl}: ${err.message}`);
    return false;
  } finally {
    await ctx.close();
  }
}

// ─── SEND CONNECTION REQUEST ──────────────────────────────────────────────────

export async function browserSendConnectionRequest(
  browser: Browser,
  profileUrl: string,
  note: string
): Promise<boolean> {
  if (!process.env.LINKEDIN_LI_AT_COOKIE) {
    logger.warn('LINKEDIN_LI_AT_COOKIE not set');
    return false;
  }

  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    logger.info(`🔗 Navigating to profile: ${profileUrl}`);
    await gotoWithRetry(page, profileUrl);
    await humanDelay(2000, 4000);

    // ── Private profile: authwall with Connect button ────────
    if (page.url().includes('/authwall')) {
      logger.info('  Private profile (authwall) — looking for Connect button...');
      const authwallConnect = page
        .locator('button:has-text("Connect"), a:has-text("Connect")')
        .first();
      if (await authwallConnect.isVisible({ timeout: 4000 }).catch(() => false)) {
        await authwallConnect.click({ force: true });
        logger.info('  Clicked Connect from authwall page');
        await humanDelay(1500, 2500);
      } else {
        logger.warn('  No Connect button on authwall — profile fully private');
        return false;
      }
    } else if (!await isLoggedIn(page)) {
      logger.warn('LinkedIn session expired — refresh LINKEDIN_LI_AT_COOKIE in .env');
      return false;
    }

    // ── Dismiss any modal overlays first ─────────────────────
    const overlay = page.locator('.modal__overlay--visible, .artdeco-modal__dismiss').first();
    if (await overlay.isVisible({ timeout: 1500 }).catch(() => false)) {
      await page.keyboard.press('Escape');
      await humanDelay(500, 800);
    }

    // ── Check connection status ───────────────────────────────
    const isPending = await page.locator('button[aria-label*="Pending"], button:text-is("Pending")').first().isVisible({ timeout: 1000 }).catch(() => false);
    const isConnected = await page.locator('button:text-is("Message")').first().isVisible({ timeout: 1000 }).catch(() => false);
    const isFollowOnly = await page.locator('button:text-is("Follow")').first().isVisible({ timeout: 1000 }).catch(() => false);

    if (isPending) { logger.info('  Connection already pending'); return false; }
    if (isConnected) { logger.info('  Already connected'); return false; }

    // ── Find and click the Connect button ────────────────────
    let connectClicked = false;

    // Option A: aria-label starting with "Invite"
    const ariaConnectBtn = page.locator('button[aria-label^="Invite"][aria-label*="connect"]').first();
    if (await ariaConnectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await ariaConnectBtn.click();
      connectClicked = true;
      logger.info('  Clicked Connect button (aria-label)');
    }

    // Option B: Exact text "Connect" in profile action buttons
    if (!connectClicked) {
      const exactBtn = page.locator('.pvs-profile-actions button:text-is("Connect"), .pv-top-card-v2-ctas button:text-is("Connect")').first();
      if (await exactBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await exactBtn.click();
        connectClicked = true;
        logger.info('  Clicked Connect button (exact text)');
      }
    }

    // Option C: "More" dropdown → Connect
    if (!connectClicked) {
      const moreBtn = page.locator('button[aria-label*="More actions"]').first();
      if (await moreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await moreBtn.click();
        await humanDelay(600, 1200);
        const connectOption = page.locator('[role="menuitem"]:text-is("Connect")').first();
        if (await connectOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await connectOption.click();
          connectClicked = true;
          logger.info('  Clicked Connect via More dropdown');
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }

    if (!connectClicked) {
      if (isFollowOnly) {
        logger.info('  Follow-only profile — cannot connect directly');
      } else {
        logger.warn(`  Could not find Connect button on ${profileUrl}`);
      }
      return false;
    }

    await humanDelay(1500, 2500);

    // ── Handle "How do you know X?" dialog ────────────────────
    const otherBtn = page.locator('button:has-text("Other"), label:has-text("Other")').first();
    if (await otherBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      logger.info('  Handling "How do you know?" dialog — selecting Other');
      await otherBtn.click();
      await humanDelay(800, 1400);
      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextBtn.click();
        await humanDelay(800, 1500);
      }
    }

    // ── "Add a note" ──────────────────────────────────────────
    const addNoteBtn = page.locator('button:has-text("Add a note")').first();
    if (await addNoteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addNoteBtn.click();
      await humanDelay(800, 1500);
      logger.info('  Adding personalised note...');
    }

    // ── Type the note ─────────────────────────────────────────
    const noteField = page.locator('textarea[name="message"]').first();
    if (await noteField.isVisible({ timeout: 3000 }).catch(() => false)) {
      const truncated = note.substring(0, 295); // LinkedIn 300 char max, safety margin
      await humanType(page, 'textarea[name="message"]', truncated);
      await humanDelay(500, 1200);
      logger.info(`  Note typed (${truncated.length} chars)`);
    } else {
      logger.warn('  Note field not visible — sending without personalised note');
    }

    // ── Send ──────────────────────────────────────────────────
    const sendSelectors = [
      'button[aria-label="Send invitation"]',
      'button[aria-label="Send now"]',
      'button:has-text("Send invitation")',
      'button:has-text("Send now")',
      'button:has-text("Send")',
    ];

    let sent = false;
    for (const sel of sendSelectors) {
      const btn = page.locator(sel).last();
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await btn.click();
        sent = true;
        break;
      }
    }

    if (sent) {
      await humanDelay(2000, 3500);
      logger.info(`✅ Connection request sent to ${profileUrl}`);
      return true;
    } else {
      const closeBtn = page.locator('button[aria-label="Dismiss"], button[aria-label="Close"]').first();
      await closeBtn.click().catch(() => {});
      logger.warn('  Send button not found — connection may not have been sent');
      return false;
    }

  } catch (err: any) {
    logger.error(`Connection request failed for ${profileUrl}: ${err.message}`);
    return false;
  } finally {
    await ctx.close();
  }
}

// ─── SEND MESSAGE ─────────────────────────────────────────────────────────────

export async function browserSendMessage(
  browser: Browser,
  profileUrl: string,
  message: string
): Promise<boolean> {
  if (!process.env.LINKEDIN_LI_AT_COOKIE) {
    logger.warn('LINKEDIN_LI_AT_COOKIE not set');
    return false;
  }

  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    logger.info(`💬 Navigating to profile to send message: ${profileUrl}`);
    await gotoWithRetry(page, profileUrl);
    await humanDelay(2000, 3500);

    if (!await isLoggedIn(page)) {
      logger.warn('LinkedIn session expired');
      return false;
    }

    const messageBtn = page.locator('button:text-is("Message")').first();
    if (!await messageBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      logger.warn(`  No Message button on ${profileUrl} — may not be connected yet`);
      return false;
    }

    await messageBtn.click({ force: true });
    await humanDelay(1200, 2500);
    logger.info('  Message window opened');

    const compose = page.locator('.msg-form__contenteditable, [data-placeholder="Write a message..."]').first();
    if (!await compose.isVisible({ timeout: 4000 }).catch(() => false)) {
      await page.locator('.msg-overlay-conversation-bubble').first().click().catch(() => {});
      await humanDelay(800, 1500);
    }

    await compose.click().catch(() => {});
    await humanDelay(400, 800);

    for (const char of message) {
      await page.keyboard.type(char, { delay: Math.floor(Math.random() * 60) + 20 });
    }
    await humanDelay(800, 1600);

    const sendBtn = page.locator('button[type="submit"].msg-form__send-button, button:has-text("Send") >> nth=-1').first();
    const sendVisible = await sendBtn.isVisible({ timeout: 2000 }).catch(() => false);

    if (sendVisible) {
      await sendBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await humanDelay(1500, 2500);
    logger.info(`✅ Message sent to ${profileUrl}`);
    return true;

  } catch (err: any) {
    logger.error(`Message failed for ${profileUrl}: ${err.message}`);
    return false;
  } finally {
    await ctx.close();
  }
}

// ─── CHECK IF CONNECTED ───────────────────────────────────────────────────────

export async function browserCheckIsConnected(
  browser: Browser,
  profileUrl: string
): Promise<boolean> {
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    await gotoWithRetry(page, profileUrl);
    await humanDelay(1500, 2500);

    if (!await isLoggedIn(page)) return false;

    const messageVisible = await page.locator('button:text-is("Message")').isVisible({ timeout: 3000 }).catch(() => false);
    return messageVisible;
  } catch {
    return false;
  } finally {
    await ctx.close();
  }
}

// ─── POST TO LINKEDIN FEED ────────────────────────────────────────────────────

export async function browserPostToLinkedIn(
  browser: Browser,
  text: string
): Promise<boolean> {
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    logger.info('📝 Opening LinkedIn feed to create post...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await humanDelay(2000, 3500);

    if (!await isLoggedIn(page)) {
      logger.warn('LinkedIn session expired — refresh LINKEDIN_LI_AT_COOKIE in .env');
      return false;
    }

    await dismissConsentBanner(page);
    await humanDelay(1000, 1800);

    // Click "Start a post"
    const startSelectors = [
      'button.share-box-feed-entry__trigger',
      'button[aria-label*="start a post"]',
      'button[aria-label*="Start a post"]',
      '[data-view-name="FEED_SHARE_BOX_TRIGGER"]',
      'button:has-text("Start a post")',
      '.share-box-feed-entry__trigger',
      'div[data-placeholder="Start a post"] button',
    ];

    let opened = false;
    for (const sel of startSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        opened = true;
        logger.info('  Post modal opened');
        break;
      }
    }

    if (!opened) {
      const placeholder = page.locator('text="Start a post"').first();
      if (await placeholder.isVisible({ timeout: 3000 }).catch(() => false)) {
        await placeholder.click();
        opened = true;
        logger.info('  Post modal opened via placeholder text');
      }
    }

    if (!opened) {
      await page.screenshot({ path: 'src/scripts/screenshots/linkedin-post-debug.png' });
      logger.warn('  Could not find "Start a post" button — screenshot saved for debugging');
      return false;
    }

    await humanDelay(1500, 2500);

    // Type into the post editor
    const editorSelectors = [
      '.ql-editor[data-placeholder]',
      '[contenteditable="true"][data-placeholder*="talk about"]',
      '[contenteditable="true"][data-placeholder*="share"]',
      '.share-creation-state__placeholder',
    ];

    let typed = false;
    for (const sel of editorSelectors) {
      const editor = page.locator(sel).first();
      if (await editor.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editor.click();
        await humanDelay(500, 900);
        for (const char of text) {
          await page.keyboard.type(char, { delay: Math.floor(Math.random() * 60) + 20 });
        }
        typed = true;
        logger.info(`  Post text typed (${text.length} chars)`);
        break;
      }
    }

    if (!typed) {
      logger.warn('  Could not find post editor');
      return false;
    }

    await humanDelay(1200, 2200);

    // Submit the post
    const postBtnSelectors = [
      'button.share-actions__primary-action',
      'button[data-control-name="share.post"]',
      'button.artdeco-button--primary:has-text("Post")',
      'button:has-text("Post"):not(:has-text("Start a post"))',
    ];

    for (const sel of postBtnSelectors) {
      const btn = page.locator(sel).last();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await humanDelay(2500, 4000);
        logger.info('✅ LinkedIn post published');
        return true;
      }
    }

    logger.warn('  Could not find Post submit button');
    return false;

  } catch (err: any) {
    logger.error(`LinkedIn post failed: ${err.message}`);
    return false;
  } finally {
    await ctx.close();
  }
}

// ─── FOLLOW PROFILE ───────────────────────────────────────────────────────────

export async function browserFollowProfile(
  browser: Browser,
  profileUrl: string
): Promise<boolean> {
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    logger.info(`👣 Following profile: ${profileUrl}`);
    await gotoWithRetry(page, profileUrl);
    await humanDelay(2000, 3500);

    if (!await isLoggedIn(page)) {
      logger.warn('LinkedIn session expired');
      return false;
    }

    const alreadyFollowing = await page.locator('button:text-is("Following")').first()
      .isVisible({ timeout: 1500 }).catch(() => false);
    if (alreadyFollowing) {
      logger.info('  Already following this profile');
      return false;
    }

    let followClicked = false;

    const directBtn = page.locator(
      '.pvs-profile-actions button:text-is("Follow"), .pv-top-card-v2-ctas button:text-is("Follow"), button[aria-label*="Follow"]'
    ).first();
    if (await directBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await directBtn.click({ force: true });
      followClicked = true;
      logger.info('  Clicked Follow button directly');
    }

    if (!followClicked) {
      const moreBtn = page.locator('button[aria-label*="More actions"]').first();
      if (await moreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await moreBtn.click();
        await humanDelay(600, 1200);
        const followOption = page.locator('[role="menuitem"]:text-is("Follow")').first();
        if (await followOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await followOption.click();
          followClicked = true;
          logger.info('  Clicked Follow via More dropdown');
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }

    if (!followClicked) {
      logger.warn(`  No Follow button found on ${profileUrl}`);
      return false;
    }

    await humanDelay(1500, 2500);
    logger.info(`✅ Now following: ${profileUrl}`);
    return true;

  } catch (err: any) {
    logger.error(`Follow failed for ${profileUrl}: ${err.message}`);
    return false;
  } finally {
    await ctx.close();
  }
}

// ─── COMMENT ON A POST ────────────────────────────────────────────────────────
// postUrl: a LinkedIn post URL, e.g. https://www.linkedin.com/feed/update/urn:li:activity:...

export async function browserCommentOnPost(
  browser: Browser,
  postUrl: string,
  comment: string
): Promise<boolean> {
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    logger.info(`💬 Commenting on post: ${postUrl}`);
    await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await humanDelay(2500, 4000);

    if (!await isLoggedIn(page)) {
      logger.warn('LinkedIn session expired');
      return false;
    }

    const commentBtnSelectors = [
      'button[aria-label*="Comment"]',
      'button:has-text("Comment")',
      '[data-control-name="comment"]',
    ];

    let boxOpened = false;
    for (const sel of commentBtnSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click({ force: true });
        boxOpened = true;
        logger.info('  Comment box opened');
        break;
      }
    }

    await humanDelay(1000, 2000);

    const editorSelectors = [
      '.comments-comment-box__form .ql-editor',
      '.ql-editor[data-placeholder*="omment"]',
      '[contenteditable="true"][data-placeholder*="omment"]',
    ];

    let typed = false;
    for (const sel of editorSelectors) {
      const editor = page.locator(sel).first();
      if (await editor.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editor.click();
        await humanDelay(400, 800);
        for (const char of comment) {
          await page.keyboard.type(char, { delay: Math.floor(Math.random() * 70) + 25 });
        }
        typed = true;
        logger.info(`  Comment typed (${comment.length} chars)`);
        break;
      }
    }

    if (!typed) {
      logger.warn('  Could not find comment editor');
      return false;
    }

    await humanDelay(800, 1500);

    const submitSelectors = [
      'button[aria-label="Post comment"]',
      'button[aria-label*="Post comment"]',
      '.comments-comment-box__submit-button',
      'button.artdeco-button--primary:has-text("Post")',
    ];

    for (const sel of submitSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await humanDelay(1500, 2500);
        logger.info(`✅ Comment posted on: ${postUrl}`);
        return true;
      }
    }

    // Fallback: Ctrl+Enter
    await page.keyboard.press('Control+Enter');
    await humanDelay(1500, 2500);
    logger.info(`✅ Comment submitted via keyboard on: ${postUrl}`);
    return true;

  } catch (err: any) {
    logger.error(`Comment failed for ${postUrl}: ${err.message}`);
    return false;
  } finally {
    await ctx.close();
  }
}

// ─── READ LINKEDIN INBOX ──────────────────────────────────────────────────────
// Voyager API is blocked server-side for reads. This uses the browser instead.
// Returns up to maxConversations recent conversations with the latest message text.

export interface InboxConversation {
  participantName: string;
  participantProfileUrl: string;
  latestMessage: string;
  isUnread: boolean;
  timestamp: string;
}

export async function browserReadInbox(
  browser: Browser,
  maxConversations = 20
): Promise<InboxConversation[]> {
  const { page, ctx } = await newAuthenticatedPage(browser);
  const conversations: InboxConversation[] = [];

  try {
    logger.info('📬 Opening LinkedIn inbox...');
    await page.goto('https://www.linkedin.com/messaging/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await humanDelay(3000, 5000);

    if (!await isLoggedIn(page)) {
      logger.warn('LinkedIn session expired — refresh LINKEDIN_LI_AT_COOKIE in .env');
      return [];
    }

    // Wait for conversation list to load
    await page.waitForSelector(
      '.msg-conversations-container__conversations-list, .msg-overlay-list-bubble, [data-control-name="overlay.open_conversation"]',
      { timeout: 12000 }
    ).catch(() => {});

    await humanDelay(2000, 3000);

    // Each conversation item in the sidebar
    const convItems = page.locator(
      '.msg-conversation-listitem, .msg-conversations-container__conversations-list > li'
    );
    const count = await convItems.count().catch(() => 0);
    logger.info(`  Found ${count} conversations`);

    const limit = Math.min(count, maxConversations);

    for (let i = 0; i < limit; i++) {
      try {
        const item = convItems.nth(i);

        // Is this conversation unread?
        const isUnread = await item.locator(
          '.msg-conversation-listitem__unread-count, [data-control-name="unread_indicator"]'
        ).isVisible({ timeout: 500 }).catch(() => false);

        // Participant name
        const nameEl = item.locator(
          '.msg-conversation-listitem__participant-names, .msg-conversation-card__participant-names'
        ).first();
        const participantName = ((await nameEl.textContent().catch(() => '')) ?? '').trim() || 'Unknown';

        // Latest message preview
        const previewEl = item.locator(
          '.msg-conversation-listitem__message-snippet, .msg-conversation-card__message-snippet-body'
        ).first();
        const latestMessage = ((await previewEl.textContent().catch(() => '')) ?? '').trim();

        // Timestamp
        const timeEl = item.locator(
          'time, .msg-conversation-listitem__time-stamp'
        ).first();
        const timestamp = (await timeEl.getAttribute('datetime').catch(() => ''))
          ?? ((await timeEl.textContent().catch(() => '')) ?? '').trim();

        // Click to get profile URL
        await item.click({ force: true }).catch(() => {});
        await humanDelay(1200, 2000);

        // Try to find the profile link in the open conversation
        const profileLink = await page.locator(
          '.msg-thread__link-to-profile, .msg-s-message-group__profile-link, a[href*="/in/"]'
        ).first().getAttribute('href').catch(() => null);

        const participantProfileUrl = profileLink
          ? `https://www.linkedin.com${profileLink.split('?')[0]}`
          : '';

        conversations.push({
          participantName,
          participantProfileUrl,
          latestMessage,
          isUnread,
          timestamp,
        });

        logger.info(`  [${i + 1}/${limit}] ${participantName}${isUnread ? ' (UNREAD)' : ''}: "${latestMessage.substring(0, 60)}"`);
      } catch {
        // Silently skip malformed items
      }
    }

    await page.screenshot({ path: 'src/scripts/screenshots/linkedin-inbox.png' });
    logger.info(`✅ Inbox read: ${conversations.length} conversations`);
    return conversations;

  } catch (err: any) {
    logger.error(`Inbox read failed: ${err.message}`);
    return conversations;
  } finally {
    await ctx.close();
  }
}

// ─── BATCH: VISIT + CONNECT FOR A LIST OF PROFILES ───────────────────────────

export interface LinkedInBrowserAction {
  profileUrl: string;
  action: 'visit' | 'connect' | 'message' | 'follow' | 'comment' | 'post';
  message?: string;
  postText?: string;
}

export interface LinkedInBrowserResult {
  profileUrl: string;
  action: string;
  success: boolean;
  error?: string;
}

export async function runLinkedInBrowserActions(
  actions: LinkedInBrowserAction[],
  delayBetweenMs = 8000
): Promise<LinkedInBrowserResult[]> {
  const browser = await getLinkedInBrowser();
  const results: LinkedInBrowserResult[] = [];

  for (let i = 0; i < actions.length; i++) {
    const { profileUrl, action, message } = actions[i];
    logger.info(`\n[${i + 1}/${actions.length}] ${action} → ${profileUrl}`);

    let success = false;

    try {
      if (action === 'visit') {
        success = await browserVisitProfile(browser, profileUrl);
      } else if (action === 'connect') {
        success = await browserSendConnectionRequest(browser, profileUrl, message || '');
      } else if (action === 'message') {
        success = await browserSendMessage(browser, profileUrl, message || '');
      } else if (action === 'follow') {
        success = await browserFollowProfile(browser, profileUrl);
      } else if (action === 'comment') {
        success = await browserCommentOnPost(browser, profileUrl, message || '');
      } else if (action === 'post') {
        success = await browserPostToLinkedIn(browser, (actions[i] as any).postText || message || '');
      }
    } catch (err: any) {
      logger.error(`Action failed: ${err.message}`);
      results.push({ profileUrl, action, success: false, error: err.message });
      continue;
    }

    results.push({ profileUrl, action, success });

    if (i < actions.length - 1) {
      const delay = delayBetweenMs + Math.floor(Math.random() * 4000);
      logger.info(`  Waiting ${Math.round(delay / 1000)}s before next action...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return results;
}
