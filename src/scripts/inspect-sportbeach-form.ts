import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  await page.goto('https://www.sportbeach.com/cannes2026/register', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  try {
    const btn = page.getByText('I UNDERSTAND', { exact: false });
    if (await btn.count() > 0) { await btn.first().click(); await page.waitForTimeout(500); }
  } catch {}

  const result = await page.evaluate(() => {
    const els = document.querySelectorAll('input, textarea, select, button, [role="button"], iframe');
    return Array.from(els).map(el => ({
      tag: el.tagName,
      type: (el as HTMLInputElement).type || '',
      name: el.getAttribute('name') || '',
      id: el.getAttribute('id') || '',
      placeholder: el.getAttribute('placeholder') || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      className: (el.className || '').toString().substring(0, 100),
      text: el.textContent?.trim().substring(0, 60) || '',
      visible: (el as HTMLElement).offsetHeight > 0,
    }));
  });

  // Also grab iframe src if any
  const frames = page.frames().map(f => f.url());
  console.log('FRAMES:', JSON.stringify(frames));
  console.log('ELEMENTS:', JSON.stringify(result, null, 2));
  await browser.close();
})();
