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
 *   - One shared browser instance (reused across actions to avoid re-auth)
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

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// ─── SINGLETON BROWSER (shared) ───────────────────────────────────────────────
// We keep ONE Browser process alive but create a FRESH BrowserContext for each
// individual action. This prevents LinkedIn's rotating Set-Cookie responses
// from accumulating in the cookie jar and breaking subsequent navigations.

let _browser: Browser | null = null;

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

// Create a clean context with the session injected as a request header.
// We use extraHTTPHeaders rather than addCookies because addCookies triggers
// ERR_TOO_MANY_REDIRECTS when LinkedIn's Set-Cookie responses accumulate
// during the redirect chain.
//
// IMPORTANT: LinkedIn requires the full set of session cookies (li_at, JSESSIONID,
// bcookie, lidc, etc.) to authenticate non-public profile pages.
// Set LINKEDIN_FULL_COOKIE_STRING in .env to the full Cookie header value from
// Chrome DevTools → Network → any linkedin.com request → Request Headers → Cookie.
// This is more reliable than individual cookies.
async function newAuthenticatedPage(browser: Browser): Promise<{ page: Page; ctx: BrowserContext }> {
  const fullCookieString = process.env.LINKEDIN_FULL_COOKIE_STRING || '';
  const liAt = process.env.LINKEDIN_LI_AT_COOKIE || '';
  const csrfToken = (process.env.LINKEDIN_CSRF_TOKEN || '').replace(/^"|"$/g, '');

  // Prefer the full cookie string (more complete session fingerprint)
  const cookieHeader = fullCookieString ||
    (csrfToken ? `li_at=${liAt}; JSESSIONID="${csrfToken}"` : `li_at=${liAt}`);

  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    extraHTTPHeaders: {
      Cookie: cookieHeader,
    },
  });

  await ctx.addInitScript(() => {
    Object.defineProperty((globalThis as any).navigator, 'webdriver', { get: () => undefined });
    (globalThis as any).chrome = { runtime: {} };
  });

  const page = await ctx.newPage();
  return { page, ctx };
}

// Validate that the li_at session cookie is still working
export async function getLinkedInBrowser(): Promise<Browser> {
  const browser = await getOrLaunchBrowser();

  logger.info('🔄 Validating LinkedIn session...');
  const { page, ctx } = await newAuthenticatedPage(browser);
  try {
    await page.goto('https://www.linkedin.com/in/reidhoffman', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    const url = page.url();
    if (url.includes('/login') || url.includes('/authwall') || url.includes('/checkpoint')) {
      throw new Error(
        'LinkedIn li_at session cookie is expired. ' +
        'Open Chrome → linkedin.com → DevTools → Application → Cookies → copy li_at → update LINKEDIN_LI_AT_COOKIE in .env'
      );
    }
    logger.info('✅ Session valid');
  } finally {
    await ctx.close();
  }

  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
    logger.info('🌐 LinkedIn browser closed');
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

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

// Navigate to a profile URL with one automatic retry on auth failure.
// LinkedIn occasionally rejects the injected cookie on the first request
// (rate limit / CDN routing). A 10s pause + second attempt usually succeeds.
async function gotoWithRetry(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (!await isLoggedIn(page)) {
    logger.info('  Retrying navigation after 10s...');
    await humanDelay(10000, 12000);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
    // Authenticated users viewing private profiles land on /authwall.
    // LinkedIn still renders a Connect button there — click it if present.
    if (page.url().includes('/authwall')) {
      logger.info('  Private profile (authwall) — looking for Connect button...');
      const authwallConnect = page
        .locator('button:has-text("Connect"), a:has-text("Connect")')
        .first();
      if (await authwallConnect.isVisible({ timeout: 4000 }).catch(() => false)) {
        await authwallConnect.click({ force: true });
        logger.info('  Clicked Connect from authwall page');
        await humanDelay(1500, 2500);
        // Fall through to the note/send flow below
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
    // Do this BEFORE trying to find Connect button to avoid false matches.
    // "has-text" does substring match — "connections" would match "Connect".
    const isPending = await page.locator('button[aria-label*="Pending"], button:text-is("Pending")').first().isVisible({ timeout: 1000 }).catch(() => false);
    const isConnected = await page.locator('button:text-is("Message")').first().isVisible({ timeout: 1000 }).catch(() => false);
    const isFollowOnly = await page.locator('button:text-is("Follow")').first().isVisible({ timeout: 1000 }).catch(() => false);

    if (isPending) { logger.info('  Connection already pending'); return false; }
    if (isConnected) { logger.info('  Already connected'); return false; }

    // ── Find and click the Connect button ────────────────────
    // Use exact text match and specific aria-labels to avoid false positives.
    let connectClicked = false;

    // Option A: aria-label starting with "Invite" (most reliable)
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

    // Option C: "More" dropdown → Connect (profiles where Connect is hidden)
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
    // LinkedIn sometimes asks this before showing the invite modal.
    // Selecting "Other" is the most neutral option.
    const otherBtn = page.locator('button:has-text("Other"), label:has-text("Other")').first();
    if (await otherBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      logger.info('  Handling "How do you know?" dialog — selecting Other');
      await otherBtn.click();
      await humanDelay(800, 1400);
      // Click Next/Continue if present
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
    // Multiple possible send button locations
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
      // Check if a dismiss/close modal exists — clean up before returning
      const closeBtn = page.locator('button[aria-label="Dismiss"], button[aria-label="Close"]').first();
      await closeBtn.click().catch(() => {});
      logger.warn('  Send button not found — connection may not have been sent');
      return false;
    }

  } catch (err: any) {
    logger.error(`Connection request failed for ${profileUrl}: ${err.message}`);
    return false;
  } finally {
    await ctx.close().catch(() => {});
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

    // Find the authenticated Message button.
    // We use the same text-is selector as browserCheckIsConnected — it's confirmed to work.
    // If a modal overlay is intercepting pointer events we use force:true to bypass it.
    const messageBtn = page.locator('button:text-is("Message")').first();

    if (!await messageBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      logger.warn(`  No Message button on ${profileUrl} — may not be connected yet`);
      return false;
    }

    // force:true bypasses any overlay that intercepts pointer events
    await messageBtn.click({ force: true });
    await humanDelay(1200, 2500);
    logger.info('  Message window opened');

    // Type message in compose box
    const compose = page.locator('.msg-form__contenteditable, [data-placeholder="Write a message..."]').first();
    if (!await compose.isVisible({ timeout: 4000 }).catch(() => false)) {
      // Try clicking the message area
      await page.locator('.msg-overlay-conversation-bubble').first().click().catch(() => {});
      await humanDelay(800, 1500);
    }

    await compose.click().catch(() => {});
    await humanDelay(400, 800);

    // Type with human-like pacing
    for (const char of message) {
      await page.keyboard.type(char, { delay: Math.floor(Math.random() * 60) + 20 });
    }
    await humanDelay(800, 1600);

    // Send with Enter or send button
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
    await ctx.close().catch(() => {});
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

// ─── BATCH: VISIT + CONNECT FOR A LIST OF PROFILES ───────────────────────────

export interface LinkedInBrowserAction {
  profileUrl: string;
  action: 'visit' | 'connect' | 'message';
  message?: string;
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
      }
    } catch (err: any) {
      logger.error(`Action failed: ${err.message}`);
      results.push({ profileUrl, action, success: false, error: err.message });
      continue;
    }

    results.push({ profileUrl, action, success });

    // Human-like gap between actions
    if (i < actions.length - 1) {
      const delay = delayBetweenMs + Math.floor(Math.random() * 4000);
      logger.info(`  Waiting ${Math.round(delay / 1000)}s before next action...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return results;
}
