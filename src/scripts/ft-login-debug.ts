import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  await page.goto('https://accounts.ft.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  for (const frame of page.frames()) {
    for (const sel of ['button:has-text("Accept all")', 'button:has-text("Accept")', 'button:has-text("Agree")']) {
      try {
        const btn = await frame.$(sel);
        if (btn && await btn.isVisible()) {
          await btn.click({ force: true });
          await page.waitForTimeout(1000);
          console.log('Clicked consent: ' + sel);
          break;
        }
      } catch {}
    }
  }

  await page.screenshot({ path: '/Users/georgeguise/AMBER/src/scripts/screenshots/failed-retries/ft-login-debug-1.png' });
  console.log('URL:', page.url());
  console.log('Body:', (await page.evaluate(() => document.body.innerText.slice(0, 400))).replace(/\n/g, ' '));

  // Find email input
  const inputs = await page.$$('input');
  console.log(`Found ${inputs.length} input(s)`);
  for (const inp of inputs) {
    const type = await inp.getAttribute('type');
    const name = await inp.getAttribute('name');
    const id = await inp.getAttribute('id');
    const placeholder = await inp.getAttribute('placeholder');
    const visible = await inp.isVisible();
    console.log(`  input type=${type} name=${name} id=${id} placeholder=${placeholder} visible=${visible}`);
  }

  await browser.close();
}

main().catch(console.error);
