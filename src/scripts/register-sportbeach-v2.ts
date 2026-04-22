/**
 * register-sportbeach-v2.ts
 *
 * Sport Beach Cannes 2026 — registration via Cvent embedded iframe.
 * The form at sportbeach.com embeds a Cvent registration form in an iframe.
 * We switch into the iframe frame context to fill and submit.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/register-sportbeach-v2.ts
 */

import { chromium, Page, Frame } from 'playwright';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS, Resident } from '../data/residents';

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots/sportbeach-v2');
const LOG_PATH = '/tmp/sportbeach-v2.log';
const FORM_URL = 'https://www.sportbeach.com/cannes2026/register';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

async function typeInto(frame: Frame, selector: string, value: string): Promise<boolean> {
  try {
    const el = await frame.$(selector);
    if (!el || !(await el.isVisible())) return false;
    await el.click({ force: true });
    await el.selectText().catch(() => {});
    await el.fill('');
    await frame.type(selector, value, { delay: 40 });
    const actual = await el.inputValue().catch(() => '');
    if (actual) return true;
    // Native setter fallback for React
    await el.evaluate((node: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      setter?.call(node, val);
      node.dispatchEvent(new Event('input', { bubbles: true }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    return true;
  } catch { return false; }
}

async function fillField(frame: Frame, labels: string[], value: string, fieldName: string): Promise<boolean> {
  // Try by label text
  for (const lbl of labels) {
    try {
      const loc = frame.getByLabel(lbl, { exact: false });
      if (await loc.count() > 0 && await loc.first().isVisible()) {
        await loc.first().click({ force: true });
        await loc.first().fill('');
        for (const ch of value) await loc.first().press(ch);
        const actual = await loc.first().inputValue().catch(() => '');
        if (actual.length > 0) {
          log(`  [label:"${lbl}"] ${fieldName} = "${value}"`);
          return true;
        }
      }
    } catch { /* try next */ }
  }
  // Try by placeholder
  for (const lbl of labels) {
    const sel = `input[placeholder*="${lbl}" i], input[aria-label*="${lbl}" i], input[name*="${lbl}" i]`;
    if (await typeInto(frame, sel, value)) {
      log(`  [attr:"${lbl}"] ${fieldName} = "${value}"`);
      return true;
    }
  }
  return false;
}

async function registerInFrame(frame: Frame, resident: Resident, slug: string, page: Page): Promise<boolean> {
  let pageNum = 1;
  const maxPages = 8;

  while (pageNum <= maxPages) {
    await page.waitForTimeout(1500);

    const bodyText = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '');

    // Check for success
    if (
      bodyText.includes('thank you') || bodyText.includes('you\'re registered') ||
      bodyText.includes('registration complete') || bodyText.includes('confirmed') ||
      bodyText.includes('success') || bodyText.includes('see you') ||
      bodyText.includes('on the list') || bodyText.includes('request received')
    ) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
      log(`  ✅ REGISTERED SUCCESSFULLY`);
      return true;
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page${pageNum}.png` });

    // Fill visible text/email/tel inputs
    const inputs = await frame.$$('input:visible');
    log(`  Page ${pageNum}: ${inputs.length} inputs visible.`);

    for (const inp of inputs) {
      try {
        const type = await inp.getAttribute('type') || 'text';
        if (['hidden', 'checkbox', 'radio', 'submit', 'button'].includes(type)) continue;
        const name = (await inp.getAttribute('name') || '').toLowerCase();
        const placeholder = (await inp.getAttribute('placeholder') || '').toLowerCase();
        const ariaLabel = (await inp.getAttribute('aria-label') || '').toLowerCase();
        const id = (await inp.getAttribute('id') || '').toLowerCase();
        const hint = `${name} ${placeholder} ${ariaLabel} ${id}`;

        let value = '';
        if (/first/i.test(hint)) value = resident.firstName;
        else if (/last/i.test(hint)) value = resident.lastName;
        else if (/email/i.test(hint)) value = resident.email;
        else if (/company|organi|employer/i.test(hint)) value = resident.company;
        else if (/title|role|position|job/i.test(hint)) value = resident.jobTitle;
        else if (/phone|mobile|tel/i.test(hint)) value = resident.phone;
        else if (/linkedin/i.test(hint)) value = resident.linkedinUrl;
        else if (/website|url/i.test(hint)) value = resident.website || '';

        if (!value) continue;

        const current = await inp.inputValue().catch(() => '');
        if (current) continue; // already filled

        await inp.click({ force: true });
        await inp.fill('');
        await page.keyboard.type(value, { delay: 35 });
        const actual = await inp.inputValue().catch(() => '');
        if (!actual) {
          // React fallback
          await inp.evaluate((node: HTMLInputElement, val: string) => {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            setter?.call(node, val);
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.dispatchEvent(new Event('change', { bubbles: true }));
          }, value);
        }
        log(`  Filled [${hint.trim().substring(0, 40)}] = "${value}"`);
      } catch { /* skip field */ }
    }

    // Handle selects
    const selects = await frame.$$('select:visible');
    for (const sel of selects) {
      try {
        const options = await sel.$$('option');
        if (options.length <= 1) continue;
        // Pick first non-empty option
        for (const opt of options) {
          const val = await opt.getAttribute('value') || '';
          const txt = (await opt.textContent() || '').trim();
          if (val && txt && txt !== 'Select...' && txt !== '-- Select --') {
            await sel.selectOption({ value: val });
            log(`  Select: chose "${txt}"`);
            break;
          }
        }
      } catch { /* skip */ }
    }

    // Handle checkboxes (consent / terms)
    const checkboxes = await frame.$$('input[type="checkbox"]:visible');
    for (const cb of checkboxes) {
      try {
        if (!(await cb.isChecked())) await cb.click();
      } catch { /* skip */ }
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page${pageNum}-filled.png` });

    // Click Next / Submit
    const nextSelectors = [
      'button:has-text("Next")', 'button:has-text("NEXT")',
      'button:has-text("Continue")', 'button:has-text("Submit")',
      'button:has-text("Register")', 'button:has-text("RSVP")',
      'button:has-text("Finish")', 'button:has-text("Complete")',
      'input[type="submit"]',
    ];

    let clicked = false;
    for (const sel of nextSelectors) {
      try {
        const btn = await frame.$(sel);
        if (btn && await btn.isVisible() && await btn.isEnabled()) {
          await btn.scrollIntoViewIfNeeded();
          await btn.click();
          log(`  Clicked: "${sel}"`);
          clicked = true;
          break;
        }
      } catch { /* try next */ }
    }

    if (!clicked) {
      // Try any visible button as last resort
      const buttons = await frame.$$('button:visible');
      for (const btn of buttons) {
        const txt = (await btn.textContent() || '').trim().toLowerCase();
        if (['next', 'submit', 'continue', 'register', 'finish', 'complete', 'rsvp'].includes(txt)) {
          await btn.click();
          log(`  Clicked button text: "${txt}"`);
          clicked = true;
          break;
        }
      }
    }

    if (!clicked) {
      log(`  No Next/Submit found on page ${pageNum}.`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page${pageNum}-stuck.png` });
      break;
    }

    await page.waitForTimeout(2500);
    pageNum++;
  }

  // Final check for success
  const finalText = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');
  if (finalText.includes('thank you') || finalText.includes('confirmed') || finalText.includes('success')) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
    log(`  ✅ REGISTERED SUCCESSFULLY`);
    return true;
  }

  log(`  ❌ Could not confirm registration`);
  return false;
}

async function registerResident(browser: any, resident: Resident, index: number): Promise<boolean> {
  const slug = `${resident.firstName.toLowerCase()}-${resident.lastName.toLowerCase()}`;
  log(`[${index}/${RESIDENTS.length}] ${resident.firstName} ${resident.lastName} <${resident.email}>`);

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  let success = false;
  try {
    await page.goto(FORM_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Dismiss cookie banner on main page
    try {
      const btn = page.getByText('I UNDERSTAND', { exact: false });
      if (await btn.count() > 0 && await btn.first().isVisible()) {
        await btn.first().click();
        await page.waitForTimeout(500);
        log('  Cookie banner dismissed.');
      }
    } catch { /* no banner */ }

    // Find the Cvent iframe
    const frames = page.frames();
    log(`  Frames found: ${frames.length} — ${frames.map((f: Frame) => f.url().substring(0, 60)).join(' | ')}`);

    const cventFrame = frames.find((f: Frame) => f.url().includes('cvent.com'));
    if (!cventFrame) {
      // Try waiting for iframe to load
      await page.waitForTimeout(3000);
      const framesAfterWait = page.frames();
      const cf = framesAfterWait.find((f: Frame) => f.url().includes('cvent.com'));
      if (!cf) {
        log('  ❌ Cvent iframe not found.');
        await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-no-iframe.png` });
        await context.close();
        return false;
      }
      success = await registerInFrame(cf, resident, slug, page);
    } else {
      success = await registerInFrame(cventFrame, resident, slug, page);
    }
  } catch (err: any) {
    log(`  ERROR: ${err.message}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-error.png` }).catch(() => {});
  }

  await context.close();
  return success;
}

async function main() {
  log(`\n=== Sport Beach Cannes 2026 — v2 (Cvent iframe) — ${new Date().toISOString()} ===`);
  log(`Registering ${RESIDENTS.length} residents via Cvent embedded form.`);

  const browser = await chromium.launch({ headless: true });
  const results: { name: string; success: boolean }[] = [];

  for (let i = 0; i < RESIDENTS.length; i++) {
    const success = await registerResident(browser, RESIDENTS[i], i + 1);
    results.push({ name: `${RESIDENTS[i].firstName} ${RESIDENTS[i].lastName}`, success });
    if (i < RESIDENTS.length - 1) await new Promise(r => setTimeout(r, 3000));
  }

  await browser.close();

  log('\n=== FINAL RESULTS ===');
  results.forEach(r => log(`  ${r.success ? '✅' : '❌'} ${r.name}`));
  const passed = results.filter(r => r.success).length;
  log(`${passed}/${results.length} registered.`);
  log(`Screenshots: ${SCREENSHOT_DIR}`);
}

main().catch(err => { log(`FATAL: ${err.message}`); process.exit(1); });
