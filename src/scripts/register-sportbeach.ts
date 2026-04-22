/**
 * register-sportbeach.ts
 *
 * Dedicated Sport Beach Cannes 2026 registration script.
 * Form URL: https://www.sportbeach.com/cannes2026/register
 *
 * Handles: cookie consent dismissal, React controlled inputs (type-char-by-char),
 * multi-step form navigation, screenshot confirmation per resident.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/register-sportbeach.ts
 */

import { chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS, Resident } from '../data/residents';

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots/sportbeach');
const LOG_PATH = '/tmp/sportbeach-registration.log';
const FORM_URL = 'https://www.sportbeach.com/cannes2026/register';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

// Type into a React-controlled input char by char
async function reactFill(page: Page, selector: string, value: string): Promise<boolean> {
  try {
    const el = await page.$(selector);
    if (!el || !(await el.isVisible())) return false;
    await el.click({ force: true });
    await el.fill('');
    // Type char by char for React controlled inputs
    for (const char of value) {
      await page.keyboard.type(char, { delay: 30 });
    }
    // Verify value was set
    const actual = await el.inputValue().catch(() => '');
    if (actual.length > 0) return true;
    // Fallback: evaluate setter
    await el.evaluate((input: HTMLInputElement, val: string) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    return true;
  } catch { return false; }
}

async function fillByLabel(page: Page, labelText: string, value: string): Promise<boolean> {
  try {
    const loc = page.getByLabel(labelText, { exact: false });
    if (await loc.count() === 0) return false;
    const el = loc.first();
    if (!(await el.isVisible())) return false;
    await el.click({ force: true });
    await el.fill('');
    for (const char of value) {
      await page.keyboard.type(char, { delay: 25 });
    }
    const actual = await el.inputValue().catch(() => '');
    if (actual.length > 0) return true;
    // Native setter fallback
    await el.evaluate((input: HTMLInputElement, val: string) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    return true;
  } catch { return false; }
}

async function dismissCookies(page: Page): Promise<void> {
  try {
    const btn = page.getByText('I UNDERSTAND', { exact: false });
    if (await btn.count() > 0 && await btn.first().isVisible()) {
      await btn.first().click();
      await page.waitForTimeout(500);
      log('  Cookie banner dismissed.');
    }
  } catch { /* no banner */ }
}

async function clickNext(page: Page): Promise<boolean> {
  const selectors = [
    'button:has-text("Next")',
    'button:has-text("NEXT")',
    'input[value="Next"]',
    'a:has-text("Next")',
    '[role="button"]:has-text("Next")',
    'button[type="submit"]',
    'input[type="submit"]',
  ];
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible() && await el.isEnabled()) {
        await el.click();
        log('  Clicked Next/Submit.');
        return true;
      }
    } catch { /* try next */ }
  }
  // Last resort: find any visible button that isn't a cookie/consent button
  try {
    const buttons = await page.$$('button:visible');
    for (const btn of buttons) {
      const text = (await btn.textContent() || '').toLowerCase().trim();
      if (['next', 'submit', 'register', 'continue', 'proceed', 'rsvp'].includes(text)) {
        await btn.click();
        log(`  Clicked button: "${text}"`);
        return true;
      }
    }
  } catch { /* ignore */ }
  return false;
}

async function waitForSuccess(page: Page): Promise<boolean> {
  try {
    await page.waitForFunction(() => {
      const text = document.body.innerText.toLowerCase();
      return (
        text.includes('thank you') ||
        text.includes('confirmed') ||
        text.includes('registered') ||
        text.includes('success') ||
        text.includes('submitted') ||
        text.includes('on the list') ||
        text.includes('request received') ||
        text.includes('see you')
      );
    }, { timeout: 10000 });
    return true;
  } catch { return false; }
}

async function registerResident(page: Page, resident: Resident, index: number): Promise<boolean> {
  const slug = `${resident.firstName.toLowerCase()}-${resident.lastName.toLowerCase()}`;
  log(`[${index}] Registering ${resident.firstName} ${resident.lastName} <${resident.email}>`);

  await page.goto(FORM_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await dismissCookies(page);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-before.png` });

  // Page 1: First name, Last name, Company Email
  let filled = 0;
  if (await fillByLabel(page, 'First name', resident.firstName)) filled++;
  else if (await reactFill(page, 'input[placeholder*="first" i], input[name*="first" i]', resident.firstName)) filled++;

  if (await fillByLabel(page, 'Last name', resident.lastName)) filled++;
  else if (await reactFill(page, 'input[placeholder*="last" i], input[name*="last" i]', resident.lastName)) filled++;

  if (await fillByLabel(page, 'Company Email', resident.email)) filled++;
  else if (await fillByLabel(page, 'Email', resident.email)) filled++;
  else if (await reactFill(page, 'input[type="email"], input[placeholder*="email" i]', resident.email)) filled++;

  log(`  Page 1: filled ${filled} fields.`);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page1-filled.png` });

  const nextClicked = await clickNext(page);
  if (!nextClicked) {
    log(`  WARNING: Could not click Next on page 1 for ${resident.firstName} ${resident.lastName}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page1-error.png` });
    return false;
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page2.png` });

  // Page 2+: handle any additional fields
  let pageNum = 2;
  let maxPages = 6;
  while (pageNum <= maxPages) {
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());

    // Check for success
    if (
      pageText.includes('thank you') ||
      pageText.includes('confirmed') ||
      pageText.includes('registered') ||
      pageText.includes('success') ||
      pageText.includes('submitted') ||
      pageText.includes('request received') ||
      pageText.includes('on the list') ||
      pageText.includes('see you')
    ) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
      log(`  ✅ ${resident.firstName} ${resident.lastName} — REGISTERED SUCCESSFULLY`);
      return true;
    }

    // Fill any visible text inputs
    const inputs = await page.$$('input[type="text"]:visible, input[type="email"]:visible, input[type="tel"]:visible');
    for (const input of inputs) {
      const name = (await input.getAttribute('name') || '').toLowerCase();
      const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
      const label = `${name} ${placeholder}`;
      let val = '';
      if (/first/i.test(label)) val = resident.firstName;
      else if (/last/i.test(label)) val = resident.lastName;
      else if (/email/i.test(label)) val = resident.email;
      else if (/company|organis|employer/i.test(label)) val = resident.company;
      else if (/title|role|position|job/i.test(label)) val = resident.jobTitle;
      else if (/phone|mobile|tel/i.test(label)) val = resident.phone;
      else if (/linkedin/i.test(label)) val = resident.linkedinUrl;
      else if (/website|url/i.test(label)) val = resident.website || '';
      if (val) {
        await input.click({ force: true });
        await input.fill('');
        for (const char of val) await page.keyboard.type(char, { delay: 20 });
      }
    }

    // Handle checkboxes (consent / terms)
    const checkboxes = await page.$$('input[type="checkbox"]:visible');
    for (const cb of checkboxes) {
      const checked = await cb.isChecked();
      if (!checked) await cb.click().catch(() => {});
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page${pageNum}-filled.png` });
    const advanced = await clickNext(page);
    if (!advanced) {
      log(`  No Next/Submit on page ${pageNum} — checking if complete.`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page${pageNum}-stuck.png` });
      break;
    }
    await page.waitForTimeout(2000);
    pageNum++;
  }

  // Final check
  const success = await waitForSuccess(page);
  if (success) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
    log(`  ✅ ${resident.firstName} ${resident.lastName} — REGISTERED SUCCESSFULLY`);
    return true;
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-final.png` });
  log(`  ❌ ${resident.firstName} ${resident.lastName} — could not confirm registration`);
  return false;
}

async function main() {
  log(`\n=== Sport Beach Cannes 2026 Registration — ${new Date().toISOString()} ===`);
  log(`Registering ${RESIDENTS.length} residents.`);

  const browser = await chromium.launch({ headless: true });
  const results: { name: string; success: boolean }[] = [];

  for (let i = 0; i < RESIDENTS.length; i++) {
    const resident = RESIDENTS[i];
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    const success = await registerResident(page, resident, i + 1).catch(err => {
      log(`  ERROR: ${err.message}`);
      return false;
    });
    results.push({ name: `${resident.firstName} ${resident.lastName}`, success });
    await context.close();
    if (i < RESIDENTS.length - 1) await new Promise(r => setTimeout(r, 3000));
  }

  await browser.close();

  log('\n=== RESULTS ===');
  results.forEach(r => log(`  ${r.success ? '✅' : '❌'} ${r.name}`));
  const passed = results.filter(r => r.success).length;
  log(`\n${passed}/${results.length} residents registered successfully.`);
  log(`Screenshots: ${SCREENSHOT_DIR}`);
  log(`Log: ${LOG_PATH}`);
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
