/**
 * register-sportbeach-v3.ts
 *
 * Sport Beach Cannes 2026 — Fixed v3.
 * Fixes from v2:
 *  - Selects "No" for "Do you have a voucher code?" radio (was unhandled)
 *  - Selects an Industry from the dropdown (was not selected → validation block)
 *  - Does NOT check the EA assistant checkbox (was auto-checked, causing extra required fields)
 *  - Takes a final screenshot of the confirmation/result page
 *  - Dumps page text on final state for debugging
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/register-sportbeach-v3.ts
 */

import { chromium, Page, Frame } from 'playwright';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS, Resident } from '../data/residents';

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots/sportbeach-v3');
const LOG_PATH = '/tmp/sportbeach-v3.log';
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
    text.includes('success') || text.includes('see you') ||
    text.includes('on the list') || text.includes('request received') ||
    text.includes('submitted') || text.includes('you are registered') ||
    text.includes('registration received') || text.includes('we have your') ||
    text.includes('you\'re in') || text.includes('you\'re on') ||
    text.includes('congrat') || text.includes('complete')
  );
}

async function clickNext(frame: Frame): Promise<boolean> {
  const nextSelectors = [
    'button:has-text("Next")', 'button:has-text("NEXT")',
    'button:has-text("Continue")', 'button:has-text("CONTINUE")',
    'button:has-text("Submit")', 'button:has-text("SUBMIT")',
    'button:has-text("Register")', 'button:has-text("RSVP")',
    'button:has-text("Finish")', 'button:has-text("Complete")',
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
    } catch { /* try next */ }
  }
  return false;
}

async function fillInputs(frame: Frame, resident: Resident, page: Page): Promise<void> {
  const inputs = await frame.$$('input:visible');
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

      if (!value) continue;
      const current = await inp.inputValue().catch(() => '');
      if (current) continue;

      await inp.click({ force: true });
      await inp.fill('');
      await page.keyboard.type(value, { delay: 35 });
      log(`  Filled [${hint.trim().substring(0, 40)}] = "${value}"`);
    } catch { /* skip */ }
  }
}

async function handleVoucherRadio(frame: Frame): Promise<void> {
  // Select "No" for "Do you have a voucher code?"
  try {
    const radios = await frame.$$('input[type="radio"]:visible');
    log(`  Radio buttons visible: ${radios.length}`);
    for (const r of radios) {
      const val = (await r.getAttribute('value') || '').toLowerCase();
      const id = await r.getAttribute('id') || '';
      // Get associated label text
      const labelText = await r.evaluate((el: HTMLInputElement): string => {
        if (el.id) {
          const lbl = document.querySelector(`label[for="${el.id}"]`);
          if (lbl) return lbl.textContent?.trim().toLowerCase() || '';
        }
        const parent = el.closest('label');
        if (parent) return parent.textContent?.trim().toLowerCase() || '';
        return el.value?.toLowerCase() || '';
      });
      log(`    Radio: value="${val}" label="${labelText}"`);

      // Click the "No" radio for voucher code
      if (val === 'no' || labelText === 'no') {
        if (!(await r.isChecked())) {
          await r.click();
          log('  Selected "No" for voucher code');
        }
        return;
      }
    }
    // Fallback: look for any radio near "No" text using getByLabel
    const noLoc = frame.getByLabel('No', { exact: true });
    if (await noLoc.count() > 0) {
      const el = noLoc.first();
      if (await el.isVisible() && !(await el.isChecked())) {
        await el.click();
        log('  Selected "No" via getByLabel');
      }
    }
  } catch (e: any) {
    log(`  Radio handler error: ${e.message}`);
  }
}

async function handleIndustryDropdown(frame: Frame, page: Page): Promise<void> {
  log('  Handling Industry dropdown...');

  // Strategy 1: Native <select> with any industry-related attributes
  try {
    const allSelects = await frame.$$('select:visible');
    log(`  Native selects visible: ${allSelects.length}`);
    for (const sel of allSelects) {
      const name = (await sel.getAttribute('name') || '').toLowerCase();
      const id = (await sel.getAttribute('id') || '').toLowerCase();
      const ariaLabel = (await sel.getAttribute('aria-label') || '').toLowerCase();
      log(`    Select: name="${name}" id="${id}" aria-label="${ariaLabel}"`);

      const opts = await sel.$$('option');
      for (const opt of opts) {
        const val = await opt.getAttribute('value') || '';
        const txt = (await opt.textContent() || '').trim();
        if (val && txt && !/^(select|choose|pick|--|none)/i.test(txt)) {
          await sel.selectOption({ value: val });
          log(`  Industry (native select): chose "${txt}"`);
          return;
        }
      }
    }
  } catch (e: any) {
    log(`  Native select error: ${e.message}`);
  }

  // Strategy 2: ARIA combobox or listbox labeled "Industry"
  try {
    const comboboxes = await frame.$$('[role="combobox"]:visible, [role="listbox"]:visible');
    log(`  ARIA comboboxes visible: ${comboboxes.length}`);
    for (const cb of comboboxes) {
      const ariaLabel = (await cb.getAttribute('aria-label') || '').toLowerCase();
      const id = await cb.getAttribute('id') || '';
      log(`    Combobox: aria-label="${ariaLabel}" id="${id}"`);
      if (/industr/i.test(ariaLabel)) {
        await cb.click();
        await page.waitForTimeout(800);
        const opts = await frame.$$('[role="option"]:visible');
        if (opts.length > 0) {
          await opts[0].click();
          log('  Industry (ARIA combobox): selected first option');
          return;
        }
      }
    }
  } catch (e: any) {
    log(`  ARIA combobox error: ${e.message}`);
  }

  // Strategy 3: getByLabel 'Industry' and click it
  try {
    const industryLoc = frame.getByLabel('Industry', { exact: false });
    const count = await industryLoc.count();
    log(`  getByLabel('Industry') count: ${count}`);
    if (count > 0) {
      const el = industryLoc.first();
      if (await el.isVisible()) {
        const tagName = await el.evaluate((e: Element) => e.tagName.toLowerCase());
        log(`  Industry element tag: ${tagName}`);

        if (tagName === 'select') {
          const opts = await el.locator('option').all();
          for (const opt of opts) {
            const val = await opt.getAttribute('value') || '';
            const txt = (await opt.textContent() || '').trim();
            if (val && txt && !/^(select|choose|--|none)/i.test(txt)) {
              await el.selectOption({ value: val });
              log(`  Industry (select via label): chose "${txt}"`);
              return;
            }
          }
        } else {
          // Click to open dropdown
          await el.click();
          await page.waitForTimeout(800);
          const opts = await frame.$$('[role="option"]:visible');
          log(`  Dropdown options visible after click: ${opts.length}`);
          if (opts.length > 0) {
            await opts[0].click();
            log('  Industry (custom via label): selected first option');
            return;
          }
        }
      }
    }
  } catch (e: any) {
    log(`  getByLabel Industry error: ${e.message}`);
  }

  // Strategy 4: Find any element with "industry" in nearby text and click it
  try {
    const industryEl = await frame.$('[data-cvent-id*="industr" i], [id*="industr" i], [name*="industr" i]');
    if (industryEl && await industryEl.isVisible()) {
      await industryEl.click();
      await page.waitForTimeout(800);
      const opts = await frame.$$('[role="option"]:visible');
      if (opts.length > 0) {
        await opts[0].click();
        log('  Industry (data-cvent attr): selected first option');
        return;
      }
    }
  } catch { /* ignore */ }

  // Strategy 5: Dump all visible elements to understand the DOM
  try {
    const elements = await frame.evaluate(() => {
      const els = document.querySelectorAll('select, [role="combobox"], [role="listbox"], [role="option"]');
      return Array.from(els).map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role') || '',
        name: el.getAttribute('name') || '',
        id: el.getAttribute('id') || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        text: el.textContent?.trim().substring(0, 60) || '',
        visible: (el as HTMLElement).offsetHeight > 0,
      }));
    });
    log(`  DOM dump (select/combobox elements):`);
    elements.forEach(e => log(`    ${JSON.stringify(e)}`));
  } catch { /* ignore */ }

  log('  WARNING: Could not handle Industry dropdown — form may fail validation');
}

async function registerInFrame(frame: Frame, resident: Resident, slug: string, page: Page): Promise<boolean> {
  await page.waitForTimeout(1500);

  // Check if already on success page
  const bodyText0 = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');
  if (isSuccess(bodyText0)) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
    log('  ✅ Already confirmed on load');
    return true;
  }

  // ── PAGE 1: First name / Last name / Email ────────────────────────────────
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page1.png` });

  const inputs1 = await frame.$$('input:visible');
  log(`  Page 1: ${inputs1.length} inputs visible`);

  for (const inp of inputs1) {
    try {
      const type = await inp.getAttribute('type') || 'text';
      if (['hidden', 'checkbox', 'radio', 'submit', 'button'].includes(type)) continue;
      const name = (await inp.getAttribute('name') || '').toLowerCase();
      const placeholder = (await inp.getAttribute('placeholder') || '').toLowerCase();
      const id = (await inp.getAttribute('id') || '').toLowerCase();
      const hint = `${name} ${placeholder} ${id}`;

      let value = '';
      if (/first/i.test(hint)) value = resident.firstName;
      else if (/last/i.test(hint)) value = resident.lastName;
      else if (/email|co/i.test(hint)) value = resident.email;

      if (!value) continue;
      const current = await inp.inputValue().catch(() => '');
      if (current) continue;

      await inp.click({ force: true });
      await inp.fill('');
      await page.keyboard.type(value, { delay: 35 });
      log(`  Filled [${hint.trim().substring(0, 40)}] = "${value}"`);
    } catch { /* skip */ }
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page1-filled.png` });

  if (!await clickNext(frame)) {
    log('  No Next button on page 1');
    return false;
  }
  await page.waitForTimeout(2500);

  // Check success
  const bodyText1 = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');
  if (isSuccess(bodyText1)) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
    log('  ✅ REGISTERED SUCCESSFULLY after page 1');
    return true;
  }

  // ── PAGE 2: Personal Information (Industry, voucher code, no EA checkbox) ──
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page2.png` });
  log(`  Page 2 body preview: "${bodyText1.substring(0, 200)}"`);

  // Fill regular text inputs
  await fillInputs(frame, resident, page);

  // Handle voucher code radio → "No"
  await handleVoucherRadio(frame);

  // Handle Industry dropdown
  await handleIndustryDropdown(frame, page);

  // Handle checkboxes: skip EA/assistant checkbox, check others (terms etc.)
  const checkboxes = await frame.$$('input[type="checkbox"]:visible');
  log(`  Page 2: ${checkboxes.length} checkboxes visible`);
  for (const cb of checkboxes) {
    try {
      // Get nearby text to identify EA checkbox
      const nearbyText = await cb.evaluate((el: HTMLInputElement): string => {
        // Check parent labels or surrounding divs for context
        const label = el.closest('label');
        if (label) return label.textContent?.toLowerCase() || '';
        const parent = el.parentElement;
        if (parent) return parent.textContent?.toLowerCase() || '';
        return '';
      });
      log(`    Checkbox nearby text: "${nearbyText.substring(0, 80)}"`);

      // Skip the EA/assistant checkbox
      if (/assistant|behalf|executive|proxy|completing this/i.test(nearbyText)) {
        log('  Skipped EA checkbox');
        continue;
      }

      if (!(await cb.isChecked())) {
        await cb.click();
        log(`  Checked checkbox`);
      }
    } catch { /* skip */ }
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page2-filled.png` });

  // Click Next on page 2
  if (!await clickNext(frame)) {
    log('  No Next button on page 2');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page2-stuck.png` });
    return false;
  }
  await page.waitForTimeout(3000);

  // ── PAGE 3+: Check for success or continue ────────────────────────────────
  for (let pageNum = 3; pageNum <= 12; pageNum++) {
    const bodyText = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-page${pageNum}.png` });
    log(`  Page ${pageNum} preview: "${bodyText.substring(0, 200)}"`);

    if (isSuccess(bodyText)) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-confirmed.png` });
      log(`  ✅ REGISTERED SUCCESSFULLY on page ${pageNum}`);
      return true;
    }

    // Check if we're stuck on the same validation page (voucher/industry still required)
    if (bodyText.includes('industries is required') || bodyText.includes('voucher code') && bodyText.includes('required')) {
      log('  Still on validation page — industry or voucher not handled. Trying again...');
      await handleVoucherRadio(frame);
      await handleIndustryDropdown(frame, page);
    }

    // Fill any unfilled inputs
    await fillInputs(frame, resident, page);

    const clicked = await clickNext(frame);
    if (!clicked) {
      log(`  No Next button on page ${pageNum}`);
      break;
    }
    await page.waitForTimeout(2500);
  }

  // Final screenshot and text dump
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-final.png` });
  const finalText = await frame.evaluate(() => document.body?.innerText?.toLowerCase() || '').catch(() => '');
  log(`  Final page text (full): "${finalText.substring(0, 500)}"`);

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

    // Dismiss cookie banner
    try {
      const btn = page.getByText('I UNDERSTAND', { exact: false });
      if (await btn.count() > 0 && await btn.first().isVisible()) {
        await btn.first().click();
        await page.waitForTimeout(500);
        log('  Cookie banner dismissed.');
      }
    } catch { /* no banner */ }

    // Find Cvent iframe
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
    log(`  Cvent frame URL: ${cventFrame.url().substring(0, 80)}`);

    success = await registerInFrame(cventFrame, resident, slug, page);
  } catch (err: any) {
    log(`  ERROR: ${err.message}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${slug}-error.png` }).catch(() => {});
  }

  await context.close();
  return success;
}

async function main() {
  log(`\n=== Sport Beach Cannes 2026 — v3 — ${new Date().toISOString()} ===`);
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
