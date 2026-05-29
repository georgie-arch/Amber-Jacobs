import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

const FORM_URL = 'https://forms.monday.com/forms/2efe3ba1901669818a49233deddde5a8?r=use1';
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  await page.goto(FORM_URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('input[type="checkbox"]', { state: 'visible', timeout: 30000 });
  await delay(2000);

  // Dump the DOM around the checkbox section
  const checkboxHtml = await page.evaluate(() => {
    const all = document.querySelectorAll('input[type="checkbox"]');
    const results: string[] = [];
    all.forEach((el, i) => {
      const parent = el.closest('[class]') || el.parentElement;
      results.push(`--- checkbox ${i} ---`);
      results.push(`  tag: ${el.tagName}`);
      results.push(`  id: ${el.id}`);
      results.push(`  class: ${el.className}`);
      results.push(`  visible: ${(el as HTMLElement).offsetParent !== null}`);
      results.push(`  checked: ${(el as HTMLInputElement).checked}`);
      if (parent) {
        results.push(`  parent tag: ${parent.tagName}`);
        results.push(`  parent class: ${parent.className.substring(0, 100)}`);
        results.push(`  parent html: ${parent.outerHTML.substring(0, 200)}`);
      }
      // Check for associated label
      const label = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
      if (label) results.push(`  label: ${label.textContent?.trim()}`);
    });
    return results.join('\n');
  });

  console.log('CHECKBOX DOM:\n', checkboxHtml);

  // Also check for any elements with "Sir Martin" text to find what's clickable
  const martinEl = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.includes('Sir Martin')) {
        const el = node.parentElement;
        const clickable = el?.closest('[onclick], label, button, [role="checkbox"], [tabindex]');
        return {
          text: node.textContent,
          tag: el?.tagName,
          class: el?.className.substring(0, 100),
          clickableTag: clickable?.tagName,
          clickableClass: clickable?.className.substring(0, 100),
          clickableId: clickable?.id,
          html: el?.closest('li, div, label')?.outerHTML.substring(0, 300),
        };
      }
    }
    return null;
  });

  console.log('\nSIR MARTIN ELEMENT:\n', JSON.stringify(martinEl, null, 2));

  await browser.close();
})();
