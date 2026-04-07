/**
 * One-off: register George Guise at FQ Beach @ Cannes Lions 2026
 * using g@soabparty.com as test email.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/register-george-fq.ts
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

const URL = 'https://events.thefemalequotient.com/canneslions26';

const GEORGE = {
  firstName: 'George',
  lastName: 'Guise',
  email: 'g@soabparty.com',
  company: 'Indvstry Clvb',
  jobTitle: 'Founder',
};

const PREFERRED_INDUSTRY = ['marketing', 'media', 'advertising', 'technology', 'creative', 'entertainment', 'pr', 'communications'];
const PREFERRED_SIZE     = ['1 - 10', '1-10', '2-10', 'micro', 'small', '1–10'];
const PREFERRED_ROLE     = ['final decision', 'decision maker', 'influencer', 'recommend'];

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 120, args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  console.log('Navigating to FQ event page...');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'src/scripts/george-fq-1-before.png' });

  // Click RSVP to open the form
  const rsvp = page.getByText('RSVP').first();
  if (await rsvp.isVisible()) {
    console.log('Clicking RSVP...');
    await rsvp.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'src/scripts/george-fq-2-form.png' });

  // Wait for form inputs
  try { await page.waitForSelector('input', { timeout: 8000 }); } catch {}
  await page.waitForTimeout(1000);

  // Fill text fields via label
  async function fillLabel(labels: string[], value: string, name: string) {
    for (const l of labels) {
      try {
        const loc = page.getByLabel(l, { exact: false });
        if (await loc.count() > 0 && await loc.first().isVisible()) {
          await loc.first().click();
          await loc.first().fill(value);
          console.log(`  Filled ${name} via label "${l}": "${value}"`);
          return;
        }
      } catch {}
    }
    console.log(`  WARNING: could not find field for ${name}`);
  }

  await fillLabel(['first name', 'given name'], GEORGE.firstName, 'First Name');
  await fillLabel(['last name', 'surname', 'family name'], GEORGE.lastName, 'Last Name');
  await fillLabel(['work email', 'email', 'e-mail'], GEORGE.email, 'Work Email');
  await fillLabel(['personal email'], GEORGE.email, 'Personal Email');
  await fillLabel(['company', 'organization', 'organisation'], GEORGE.company, 'Company');
  await fillLabel(['job title', 'title', 'position'], GEORGE.jobTitle, 'Job Title');
  await fillLabel(['location', 'city', 'country', 'where are you based'], 'London, UK', 'Location');

  // Fill dropdowns smartly
  const preferredLists = [PREFERRED_INDUSTRY, PREFERRED_SIZE, PREFERRED_ROLE];
  const selects = await page.$$('select');
  let di = 0;
  for (const sel of selects) {
    if (!(await sel.isVisible())) continue;
    const opts = await sel.$$eval('option', os =>
      os.map(o => ({ value: (o as any).value as string, text: ((o as any).textContent || '').trim().toLowerCase() }))
        .filter(o => o.value && o.value.trim() !== '')
    );
    if (!opts.length) continue;
    const preferred = preferredLists[di] || [];
    let chosen = opts[0].value;
    for (const term of preferred) {
      const m = opts.find(o => o.text.includes(term) || o.value.toLowerCase().includes(term));
      if (m) { chosen = m.value; break; }
    }
    await sel.selectOption(chosen);
    const label = opts.find(o => o.value === chosen)?.text || chosen;
    console.log(`  Selected dropdown #${di + 1}: "${label}"`);
    di++;
  }

  // Scroll to top, screenshot
  await page.keyboard.press('Home');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'src/scripts/george-fq-3-filled.png' });

  // Submit
  const submitSelectors = [
    'button[type="submit"]', 'input[type="submit"]',
    'button:has-text("Register")', 'button:has-text("Submit")',
    'button:has-text("RSVP")', 'button:has-text("Confirm")',
  ];
  for (const sel of submitSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible() && await btn.isEnabled()) {
        console.log(`  Clicking submit: ${sel}`);
        await btn.click();
        await page.waitForTimeout(4000);
        await page.screenshot({ path: 'src/scripts/george-fq-4-after.png' });
        break;
      }
    } catch {}
  }

  console.log('\nDone. Browser staying open 30s for review...');
  await page.waitForTimeout(30000);
  await browser.close();
}

run().catch(console.error);
