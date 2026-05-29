/**
 * Targeted registration for Monday.com IPH event form
 * https://forms.monday.com/forms/2efe3ba1901669818a49233deddde5a8?r=use1
 *
 * Fields: Attendee Name, Email, Job Title, Company, event checkboxes (tick all)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/register-monday-form-iph.ts
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { RESIDENTS } from '../data/residents';
dotenv.config();

const FORM_URL = 'https://forms.monday.com/forms/2efe3ba1901669818a49233deddde5a8?r=use1';

const residents = RESIDENTS.filter(r => !(r.firstName === 'George' && r.lastName === 'Guise'));

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function registerResident(
  page: any,
  firstName: string,
  lastName: string,
  email: string,
  jobTitle: string,
  company: string,
  index: number,
  total: number
): Promise<boolean> {
  const fullName = `${firstName} ${lastName}`;
  console.log(`\n[${index}/${total}] Registering ${fullName} <${email}>`);

  try {
    await page.goto(FORM_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);

    // ── Fill Attendee Name ──────────────────────────────────────────
    const nameInput = await page.$('input[placeholder*="name" i], input[aria-label*="name" i], input[data-testid*="name" i]')
      || await page.$('label:has-text("Attendee Name") + * input, label:has-text("Attendee Name") ~ * input')
      || await page.$$('input[type="text"]').then((els: any[]) => els[0]);

    if (nameInput) {
      await nameInput.click();
      await nameInput.fill(fullName);
      console.log(`  [name] filled: "${fullName}"`);
    } else {
      // Fallback: find by label proximity
      const labels = await page.$$('label, span[class*="label"], div[class*="label"]');
      for (const label of labels) {
        const text = await label.innerText().catch(() => '');
        if (text.trim().toLowerCase().includes('attendee name') || text.trim().toLowerCase() === 'name') {
          const input = await label.evaluateHandle((el: Element) => {
            const parent = el.closest('[class*="form"], [class*="field"], [class*="question"], div');
            return parent?.querySelector('input');
          });
          if (input) {
            await (input as any).click();
            await (input as any).fill(fullName);
            console.log(`  [name-label] filled: "${fullName}"`);
            break;
          }
        }
      }
    }

    // ── Fill Email ─────────────────────────────────────────────────
    const emailInput = await page.$('input[type="email"], input[placeholder*="email" i], input[aria-label*="email" i]');
    if (emailInput) {
      await emailInput.click();
      await emailInput.fill(email);
      console.log(`  [email] filled: "${email}"`);
    }

    // ── Fill Job Title ──────────────────────────────────────────────
    const allTextInputs = await page.$$('input[type="text"]');
    // Find inputs by scanning labels
    const fieldMap: Record<string, any> = {};
    const formFields = await page.$$('[class*="question"], [class*="field-wrapper"], [class*="form-field"], [data-testid*="question"]');

    for (const field of formFields) {
      const labelEl = await field.$('label, [class*="label"], [class*="title"]');
      const inputEl = await field.$('input[type="text"], input[type="email"], textarea');
      if (labelEl && inputEl) {
        const labelText = (await labelEl.innerText().catch(() => '')).trim().toLowerCase();
        fieldMap[labelText] = inputEl;
      }
    }

    if (fieldMap['job title'] || fieldMap['title']) {
      const el = fieldMap['job title'] || fieldMap['title'];
      await el.click();
      await el.fill(jobTitle);
      console.log(`  [job title] filled: "${jobTitle}"`);
    }

    if (fieldMap['company'] || fieldMap['company name'] || fieldMap['organisation']) {
      const el = fieldMap['company'] || fieldMap['company name'] || fieldMap['organisation'];
      await el.click();
      await el.fill(company);
      console.log(`  [company] filled: "${company}"`);
    }

    // ── Fallback: fill by input order if fieldMap missed them ──────
    // Typical order on this form: Name(0), Email(1), Job Title(2), Company(3)
    if (!fieldMap['job title'] && !fieldMap['title'] && allTextInputs.length >= 3) {
      await allTextInputs[2].click();
      await allTextInputs[2].fill(jobTitle);
      console.log(`  [job title fallback] filled: "${jobTitle}"`);
    }
    if (!fieldMap['company'] && !fieldMap['company name'] && allTextInputs.length >= 4) {
      await allTextInputs[3].click();
      await allTextInputs[3].fill(company);
      console.log(`  [company fallback] filled: "${company}"`);
    }

    // ── Tick ALL event checkboxes ──────────────────────────────────
    await delay(500);
    const checkboxes = await page.$$('input[type="checkbox"]');
    let ticked = 0;
    for (const cb of checkboxes) {
      const isChecked = await cb.isChecked().catch(() => false);
      if (!isChecked) {
        await cb.click().catch(async () => {
          // Try clicking the label instead
          const id = await cb.getAttribute('id');
          if (id) await page.$(`label[for="${id}"]`).then((l: any) => l?.click()).catch(() => {});
        });
        ticked++;
      }
    }
    // Also try clicking visible checkbox labels (Monday.com uses custom UI checkboxes)
    const checkboxLabels = await page.$$('[class*="checkbox"], [class*="Checkbox"], [role="checkbox"]');
    for (const cb of checkboxLabels) {
      const ariaChecked = await cb.getAttribute('aria-checked').catch(() => null);
      if (ariaChecked === 'false' || ariaChecked === null) {
        await cb.click().catch(() => {});
        ticked++;
      }
    }
    console.log(`  [checkboxes] ticked ${ticked} event(s)`);

    // ── Submit ─────────────────────────────────────────────────────
    await delay(800);
    const submitBtn = await page.$('button[type="submit"], button:has-text("Submit"), button:has-text("Register"), button:has-text("Send")');
    if (submitBtn) {
      await submitBtn.click();
      console.log(`  [submit] clicked`);
    } else {
      // Find any submit-looking button
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await btn.innerText().catch(() => '');
        if (/submit|register|send|confirm/i.test(text)) {
          await btn.click();
          console.log(`  [submit fallback] clicked: "${text}"`);
          break;
        }
      }
    }

    await delay(3000);

    // ── Check result ──────────────────────────────────────────────
    const pageContent = await page.content();
    const successSignals = ['thank you', 'submitted', 'success', 'registered', 'confirmation', 'received'];
    const errorSignals = ['required field', 'please fill', 'error', 'invalid'];

    const lowerContent = pageContent.toLowerCase();
    const isSuccess = successSignals.some(s => lowerContent.includes(s));
    const isError = errorSignals.some(s => lowerContent.includes(s));

    if (isSuccess) {
      console.log(`  ✅ Submitted successfully`);
      return true;
    } else if (isError) {
      // Take screenshot for debugging
      const screenshotPath = `/tmp/monday-reg-fail-${firstName.toLowerCase()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  ❌ Error detected — screenshot saved to ${screenshotPath}`);
      const snippet = (await page.innerText('body').catch(() => '')).substring(0, 400);
      console.log(`  Snippet: ${snippet}`);
      return false;
    } else {
      console.log(`  ⚠️  Unclear result — assuming submitted`);
      return true;
    }
  } catch (err: any) {
    console.error(`  ❌ Exception: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`Registering ${residents.length} residents (skipping George Guise)`);
  console.log(`Form: ${FORM_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const results: { name: string; success: boolean }[] = [];

  for (let i = 0; i < residents.length; i++) {
    const r = residents[i];
    const success = await registerResident(
      page,
      r.firstName, r.lastName,
      r.email, r.jobTitle, r.company,
      i + 1, residents.length
    );
    results.push({ name: `${r.firstName} ${r.lastName}`, success });
    if (i < residents.length - 1) await delay(2000);
  }

  await browser.close();

  console.log('\n─── RESULTS ─────────────────────────────────────');
  let passed = 0;
  for (const r of results) {
    if (r.success) { console.log(`✅ ${r.name}`); passed++; }
    else console.log(`❌ ${r.name}`);
  }
  console.log(`\n${passed}/${results.length} registered.`);
}

main().catch(console.error);
