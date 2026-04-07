/**
 * Tests proper cookie injection via CDP after page load,
 * then verifies we can dismiss modals and click Connect.
 */
import { chromium, Page } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

const liAt = process.env.LINKEDIN_LI_AT_COOKIE || '';
const csrfRaw = (process.env.LINKEDIN_CSRF_TOKEN || '').replace(/^"|"$/g, '');

async function injectSessionViaCDP(page: Page): Promise<void> {
  const cdp = await page.context().newCDPSession(page);

  // Set li_at using CDP Network.setCookie — works regardless of page origin
  await cdp.send('Network.setCookie', {
    name: 'li_at',
    value: liAt,
    domain: '.linkedin.com',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });

  if (csrfRaw) {
    await cdp.send('Network.setCookie', {
      name: 'JSESSIONID',
      value: `"${csrfRaw}"`,
      domain: '.linkedin.com',
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'None',
    });
    await cdp.send('Network.setCookie', {
      name: 'liap',
      value: 'true',
      domain: '.linkedin.com',
      path: '/',
      secure: true,
      sameSite: 'None',
    });
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });

  const page = await ctx.newPage();

  // Step 1: Navigate to linkedin.com without cookies — loads cleanly
  console.log('Step 1: Load linkedin.com (no cookies) to establish context...');
  await page.goto('https://www.linkedin.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  console.log('  Landed:', page.url());

  // Step 2: Inject session cookie via CDP
  console.log('Step 2: Injecting li_at via CDP...');
  await injectSessionViaCDP(page);
  console.log('  Done');

  // Step 3: Navigate to a profile page
  console.log('Step 3: Navigating to Cindy Gallop profile...');
  await page.goto('https://www.linkedin.com/in/cindygallop', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  const url = page.url();
  const title = await page.title();
  console.log('  URL:', url.substring(0, 100));
  console.log('  Title:', title.substring(0, 60));
  console.log('  Logged in:', !url.includes('/login') && !url.includes('/authwall'));

  // Check for modal overlay — dismiss it if present
  const modalOverlay = page.locator('.modal__overlay--visible, [data-modal]').first();
  const modalVisible = await modalOverlay.isVisible({ timeout: 2000 }).catch(() => false);
  if (modalVisible) {
    console.log('  Modal detected — dismissing...');
    const closeBtn = page.locator('button[aria-label="Dismiss"], button[aria-label="Close"], button.modal__dismiss').first();
    const dismissed = await closeBtn.click().then(() => true).catch(() => false);
    if (!dismissed) {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(1000);
    console.log('  Modal dismissed');
  }

  // Check buttons
  const connectVisible = await page.locator('button:has-text("Connect")').first().isVisible({ timeout: 3000 }).catch(() => false);
  const msgVisible = await page.locator('button:has-text("Message")').first().isVisible({ timeout: 1000 }).catch(() => false);
  console.log('  Connect button:', connectVisible);
  console.log('  Message button:', msgVisible);

  if (connectVisible) {
    console.log('\nStep 4: Attempting to click Connect...');
    try {
      await page.locator('button:has-text("Connect")').first().click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      const afterUrl = page.url();
      console.log('  Clicked! URL now:', afterUrl.substring(0, 100));
      // Check for modal
      const inviteModal = await page.locator('[aria-label*="invitation"], [aria-label*="Connect"], textarea[name="message"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      console.log('  Invite modal open:', inviteModal);
    } catch(e: any) {
      console.log('  Click failed:', e.message.substring(0, 200));
    }
  }

  await browser.close();
}

main().catch(e => console.error('Fatal:', e.message));
