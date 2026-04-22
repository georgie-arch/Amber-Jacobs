/**
 * register-sportbeach-v4.ts
 *
 * Sport Beach Cannes 2026 — Fixed v4.
 * Fixes from v3:
 *  - Waits for voucher/industry fields to render before clicking Next
 *  - Dismisses Cvent Dialog overlay before interacting with fields
 *  - Uses force:true on radio/combobox clicks to bypass overlays
 *  - Industry is a React Select combobox — opened by click+ArrowDown+Enter
 *  - Voucher radio value is "1" (not "no") for the No option
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/register-sportbeach-v4.ts
 */

import { chromium, Page, Frame, ElementHandle } from 'playwright';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS, Resident } from '../data/residents';

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots/sportbeach-v4');
const LOG_PATH = '/tmp/sportbeach-v4.log';
const FORM_URL = 'https://www.sportbeach.com/cannes2026/register';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

function isSuccess(text: string): boolean {
  return (
    text.includes('thank you') || text.includes("you're registered") ||
    text.includes('registration complete') || text.includes('confirmed') ||
    text.includes('see you') || text.includes('on the list') ||
    text.includes('request received') || text.includes('submitted') ||
    text.includes('you are registered') || text.includes('registration received') ||
    text.includes('we have your') || text.includes("you're in") ||
    text.includes('congrat') || text.includes('you\'re on')
  );
}

async function clickNext(frame: Frame): Promise<boolean> {
  const nextSelectors = [
    'button:has-text("Next")', 'button:has-text("NEXT")',
    'button:has-text("Continue")', 'button:has-text("CONTINUE")',
    'button:has-text("Submit")', 'button:has-text("SUBMIT")',
    'button:has-text("Register")', 'button:has-text("Finish")',
    'input[type="submit"]',
  ];
  for (const sel of nextSelectors) {
    try {
      const btn = await frame.$(sel);
      if (btn && await btn.isVisible() && await btn.isEnabled()) {
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        log(`  Clicked: "${sel}"`);
        return true;
      }
    } catch { }
  }
  return false;
}

/** Dismiss any Cvent dialog/modal overlay (validation error popup) */
async function dismissDialog(frame: Frame, page: Page): Promise<void> {
  try {
    // Press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  } catch { }
  try {
    // Look for common close/OK buttons
    const closeSelectors = [
      '[aria-label="Close"]', '[aria-label="close"]',
      'button:has-text("Close")', 'button:has-text("OK")',
      'button:has-text("Dismiss")', 'button:has-text("Got it")',
      '[class*="close" i]', '[class*="dismiss" i]',
    ];
    for (const sel of closeSelectors) {
      const btn = await frame.$(sel);
      if (btn && await btn.isVisible()) {
        await btn.click({ force: true });
        log(`  Dismissed dialog via: ${sel}`);
        await page.waitForTimeout(400);
        return;
      }
    }
  } catch { }
}

/** Select "No" for voucher code radio */
async function handleVoucherRadio(frame: Frame, page: Page): Promise<void> {
  try {
    const radios = await frame.$$('input[type="radio"]');
    log(`  Radios found (all): ${radios.length}`);
    for (const r of radios) {
      const val = (await r.getAttribute('value') || '');
      const labelText = await r.evaluate((el: HTMLInputElement): string => {
        if (el.id) {
          const lbl = document.querySelector(`label[for="${el.id}"]`);
          if (lbl) return lbl.textContent?.trim().toLowerCase() || '';
        }
        const parent = el.closest('label');
        return parent?.textContent?.trim().toLowerCase() || el.value?.toLowerCase() || '';
      });
      log(`    Radio: value="${val}" label="${labelText}"`);

      // The "No" radio has label "no" and value "1"
      if (labelText === 'no' || val === '1') {
        try {
          await r.click({ force: true });
          log('  Selected "No" for voucher code (force click)');
          return;
        } catch {
          // Try via evaluate
          await r.evaluate((el: HTMLInputElement) => el.click());
          log('  Selected "No" for voucher code (evaluate click)');
          return;
        }
      }
    }
  } catch (e: any) {
    log(`  Voucher radio error: ${e.message?.substring(0, 100)}`);
  }
}

/** Select an industry from the React Select combobox */
async function handleIndustryCombobox(frame: Frame, page: Page): Promise<void> {
  log('  Handling Industry React Select combobox...');
  try {
    // Find the React Select input by aria-label
    const combobox = await frame.$('input[role="combobox"][aria-label="Industry" i], input[aria-label="industry" i]');
    if (!combobox) {
      log('  Industry combobox not found by aria-label');
      return;
    }

    const ariaExpanded = await combobox.getAttribute('aria-expanded');
    log(`  Industry combobox found, aria-expanded="${ariaExpanded}"`);

    // Click to focus and open the dropdown (force bypasses Dialog overlay)
    await combobox.click({ force: true });
    await page.waitForTimeout(600);

    // Check if options appeared
    let opts = await frame.$$('[role="option"]:visible');
    log(`  Options after click: ${opts.length}`);

    if (opts.length === 0) {
      // Press ArrowDown to open/navigate
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      opts = await frame.$$('[role="option"]:visible');
      log(`  Options after ArrowDown: ${opts.length}`);
    }

    if (opts.length === 0) {
      // Type a space to trigger dropdown
      await page.keyboard.type(' ', { delay: 50 });
      await page.waitForTimeout(500);
      opts = await frame.$$('[role="option"]:visible');
      log(`  Options after space: ${opts.length}`);
    }

    if (opts.length > 0) {
      const optText = await opts[0].textContent().catch(() => '');
      await opts[0].click({ force: true });
      log(`  Industry: selected "${optText?.trim()}"`);
      return;
    }

    // Fallback: ArrowDown + Enter (selects first option without clicking)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    log('  Industry: selected via ArrowDown+Enter');
  } catch (e: any) {
    log(`  Industry combobox error: ${e.message?.substring(0, 150)}`);
  }
}

async function fillTextInputs(frame: Frame, resident: Resident, page: Page): Promise<void> {
  const inputs = await frame.$$('input:visible');
  for (const inp of inputs) {
    try {
      const type = await inp.getAttribute('type') || 'text';
      if (['hidden', 'checkbox', 'radio', 'submit', 'button'].includes(type)) continue;
      const role = await inp.getAttribute('role') || '';
      if (role === 'combobox') continue; // Don't type into React Select inputs here

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

      if (!value) continue;
      const current = await inp.inputValue().catch(() => '');
      if (current) continue;

      await inp.click({ force: true });
      await inp.fill('');
      await page.keyboard.type(value, { delay: 35 });
      log(`  Filled [${hint.trim().substring(0, 40)}] = "${value}"`);
    } catch { }
  }
}

async function registerInFrame(frame: Frame, resident: Resident, slug: string, page: Page): Promise<boolean> {
  await page.waitForTimeout(2000);

  const bodyText0 = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');
  if (isSuccess(bodyText0)) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
    log('  ✅ Already confirmed on load');
    return true;
  }

  // ── STEP 1: Fill initial fields (first/last/email) ────────────────────────
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-step1.png` });
  const inputCount1 = (await frame.$$('input:visible')).length;
  log(`  Step 1: ${inputCount1} inputs`);
  await fillTextInputs(frame, resident, page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-step1-filled.png` });

  // Click Next to go to Personal Information page
  if (!await clickNext(frame)) {
    log('  No Next button on step 1');
    return false;
  }

  // ── STEP 2: Wait for voucher/industry fields to appear ────────────────────
  // The Cvent SPA loads these fields asynchronously after step 1's Next
  log('  Waiting for Personal Information form to fully render...');
  let voucherVisible = false;
  for (let attempt = 0; attempt < 12; attempt++) {  // up to 6 seconds
    await page.waitForTimeout(500);
    const radios = await frame.$$('input[type="radio"]');
    if (radios.length > 0) {
      voucherVisible = true;
      log(`  Voucher radios appeared after ${(attempt + 1) * 500}ms`);
      break;
    }
  }

  if (!voucherVisible) {
    log('  Voucher fields not visible after 6s — clicking Next to force render, then dismissing dialog');
    await clickNext(frame);
    await page.waitForTimeout(1500);
    await dismissDialog(frame, page);
    await page.waitForTimeout(500);
  }

  const bodyText2 = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');
  if (isSuccess(bodyText2)) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
    log('  ✅ REGISTERED after step 1');
    return true;
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-step2.png` });
  log(`  Step 2 text: "${bodyText2.substring(0, 150)}"`);

  // Fill text inputs
  await fillTextInputs(frame, resident, page);

  // Handle voucher code → "No"
  await handleVoucherRadio(frame, page);
  await page.waitForTimeout(300);

  // Handle Industry combobox
  await handleIndustryCombobox(frame, page);
  await page.waitForTimeout(500);

  // DO NOT check the EA assistant checkbox
  // Only check other checkboxes (e.g. terms/privacy if they appear)
  const checkboxes = await frame.$$('input[type="checkbox"]:visible');
  log(`  Step 2: ${checkboxes.length} checkboxes`);
  for (const cb of checkboxes) {
    try {
      const nearbyText = await cb.evaluate((el: HTMLInputElement): string => {
        const label = el.closest('label');
        if (label) return label.textContent?.toLowerCase() || '';
        const parent = el.parentElement;
        return parent?.textContent?.toLowerCase() || '';
      });
      if (/assistant|behalf|executive|proxy|completing this/i.test(nearbyText)) {
        log(`  Skipping EA checkbox`);
        continue;
      }
      if (!(await cb.isChecked())) {
        await cb.click({ force: true });
        log('  Checked checkbox');
      }
    } catch { }
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-step2-filled.png` });

  // Click Next on step 2
  if (!await clickNext(frame)) {
    log('  No Next button on step 2');
    return false;
  }
  await page.waitForTimeout(3000);

  // ── STEP 3+: Navigate to completion ────────────────────────────────────────
  for (let step = 3; step <= 12; step++) {
    const bodyText = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-step${step}.png` });
    log(`  Step ${step} text: "${bodyText.substring(0, 200)}"`);

    if (isSuccess(bodyText)) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
      log(`  ✅ REGISTERED SUCCESSFULLY on step ${step}`);
      return true;
    }

    // If still on validation page, handle missing fields
    if (bodyText.includes('required') || bodyText.includes('industries')) {
      log('  Still seeing validation errors — handling fields again');
      await dismissDialog(frame, page);
      await handleVoucherRadio(frame, page);
      await handleIndustryCombobox(frame, page);
    }

    // Fill any newly appearing text inputs
    await fillTextInputs(frame, resident, page);

    const clicked = await clickNext(frame);
    if (!clicked) {
      log(`  No Next button on step ${step}`);
      break;
    }
    await page.waitForTimeout(3000);
  }

  // Final state
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-final.png` });
  const finalText = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');
  log(`  FINAL page text: "${finalText.substring(0, 400)}"`);

  if (isSuccess(finalText)) {
    log('  ✅ REGISTERED SUCCESSFULLY');
    return true;
  }

  log('  ❌ Could not confirm registration');
  return false;
}

async function registerResident(browser: any, resident: Resident, index: number): Promise<boolean> {
  const slug = `${resident.firstName.toLowerCase()}-${resident.lastName.toLowerCase()}`;
  log(`\n[${index}/${RESIDENTS.length}] ${resident.firstName} ${resident.lastName} <${resident.email}>`);

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  let success = false;
  try {
    await page.goto(FORM_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    try {
      const btn = page.getByText('I UNDERSTAND', { exact: false });
      if (await btn.count() > 0 && await btn.first().isVisible()) {
        await btn.first().click();
        await page.waitForTimeout(500);
        log('  Cookie banner dismissed.');
      }
    } catch { }

    let cventFrame = page.frames().find((f: Frame) => f.url().includes('cvent.com'));
    if (!cventFrame) {
      await page.waitForTimeout(3000);
      cventFrame = page.frames().find((f: Frame) => f.url().includes('cvent.com'));
    }
    if (!cventFrame) {
      log('  ❌ Cvent iframe not found');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-no-iframe.png` });
      await context.close();
      return false;
    }
    log(`  Cvent frame found.`);

    success = await registerInFrame(cventFrame, resident, slug, page);
  } catch (err: any) {
    log(`  ERROR: ${err.message}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-error.png` }).catch(() => {});
  }

  await context.close();
  return success;
}

async function main() {
  log(`\n=== Sport Beach Cannes 2026 — v4 — ${new Date().toISOString()} ===`);
  log(`Registering ${RESIDENTS.length} residents.`);

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
