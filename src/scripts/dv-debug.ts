import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://events.doubleverify.com/dvhappyhour2026', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  
  const frames = page.frames();
  console.log('Frames:', frames.length);
  frames.forEach((f: any, i: number) => console.log(`  Frame ${i}: ${f.url()}`));
  
  const buttons = await page.$$eval('button, input[type="submit"], input[type="button"], [role="button"]', (els: Element[]) => 
    els.map((e: any) => ({ tag: e.tagName, type: e.type, text: e.textContent?.trim().slice(0, 80), id: e.id, class: e.className?.slice(0, 60) }))
  );
  console.log('\nButtons found:', JSON.stringify(buttons, null, 2));
  
  const inputs = await page.$$eval('input, select, textarea', (els: Element[]) => 
    els.map((e: any) => ({ tag: e.tagName, type: e.type, name: e.name, placeholder: e.placeholder, id: e.id }))
  );
  console.log('\nInputs found:', JSON.stringify(inputs, null, 2));
  
  await browser.close();
})();
