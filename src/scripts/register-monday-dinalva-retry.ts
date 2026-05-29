import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

const FORM_URL = 'https://forms.monday.com/forms/2efe3ba1901669818a49233deddde5a8?r=use1';
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  console.log('Retrying: Dinalva Tavares <contact@missdinalva.com>');
  await page.goto(FORM_URL, { waitUntil: 'load', timeout: 60000 });

  // Wait for the hidden checkbox inputs to be attached (they have tabindex="-1")
  await page.waitForSelector('input[type="checkbox"]', { state: 'attached', timeout: 30000 });
  await delay(2000);

  // Fill by label text — Monday Workforms uses label→input pairing
  await page.getByLabel('Attendee Name', { exact: false }).fill('Dinalva Tavares');
  console.log('[name] filled');

  await page.getByLabel('Email', { exact: false }).fill('contact@missdinalva.com');
  console.log('[email] filled');

  await page.getByLabel('Job Title', { exact: false }).fill('Brand Partnerships & Events Manager');
  console.log('[job title] filled');

  await page.getByLabel('Company', { exact: false }).fill('Miss Dinalva');
  console.log('[company] filled');

  await delay(500);

  // Monday Workforms: the real inputs are hidden (tabindex="-1").
  // Get aria-labels from the hidden inputs, then click the visible label element
  // that contains the same text — this triggers React's onClick handler.
  const eventNames: string[] = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="checkbox"][aria-label]'))
      .map(el => el.getAttribute('aria-label') || '');
  });
  console.log(`  Found ${eventNames.length} events: ${eventNames.slice(0,3).join(', ')}...`);

  let ticked = 0;
  for (const name of eventNames) {
    try {
      // Find the label/span/div that contains this text and is clickable
      const el = page.locator(`text="${name}"`).first();
      await el.scrollIntoViewIfNeeded();
      await el.click({ timeout: 3000 });
      ticked++;
      await delay(150);
    } catch {
      // Try partial text match
      try {
        await page.locator(`label:has-text("${name.substring(0, 20)}")`).first().click({ timeout: 2000 });
        ticked++;
      } catch { /* skip */ }
    }
  }
  await delay(500);
  console.log(`[checkboxes] ticked ${ticked}`);

  await delay(500);
  const submit = await page.$('button[type="submit"]');
  if (submit) { await submit.click(); console.log('[submit] clicked'); }
  await delay(4000);

  const body = (await page.innerText('body').catch(() => '')).toLowerCase();
  const ok = ['thank you', 'submitted', 'success', 'registered', 'received'].some(s => body.includes(s));
  if (ok) {
    console.log('✅ Dinalva Tavares — submitted successfully');
  } else {
    await page.screenshot({ path: '/tmp/dinalva-retry.png', fullPage: true });
    console.log('❌ Failed — screenshot at /tmp/dinalva-retry.png');
    console.log('Page snippet:', body.substring(0, 300));
  }

  await browser.close();
})();
