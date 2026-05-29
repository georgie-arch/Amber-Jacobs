/**
 * Visits Wilson Wellbeing contact page and takes a screenshot
 * so we can see the actual form fields rendered by JavaScript.
 */
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.wilsonwellbeing.com/contact.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'wilson-contact.png', fullPage: true });

  // Dump all input/textarea/select elements
  const fields = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('input, textarea, select, button[type="submit"]'));
    return els.map(el => ({
      tag: el.tagName,
      type: (el as any).type || '',
      name: (el as any).name || '',
      id: el.id || '',
      placeholder: (el as any).placeholder || '',
      label: document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || '',
    }));
  });
  console.log('Form fields found:', JSON.stringify(fields, null, 2));

  // Also grab visible page text
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('\nPage text:\n', bodyText);

  await browser.close();
})();
