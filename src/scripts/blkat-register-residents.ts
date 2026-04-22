/**
 * BlackAt (blkat.org) — Account creation for all Indvstry Power House residents
 *
 * Flow: /create-acc → Continue with Email → enter email → Create Account
 * Result: account created immediately; verification email sent to each resident.
 * Each resident should check their inbox and click the verification link to activate.
 */

import { chromium, Browser, Page } from 'playwright';
import { RESIDENTS } from '../data/residents';

const SCREENSHOT_DIR = `${__dirname}/screenshots`;

async function createAccount(
  browser: Browser,
  email: string,
  name: string,
  index: number,
  total: number
): Promise<'created' | 'failed'> {
  console.log(`\n[${index + 1}/${total}] ${name} <${email}>`);
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();

  try {
    // Step 1: land on create-acc page
    await page.goto('https://www.blkat.org/create-acc', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Step 2: click Continue with Email
    const emailLink = page.locator('a:has-text("Continue with Email")').first();
    await emailLink.waitFor({ timeout: 10000 });
    await emailLink.click();
    await page.waitForTimeout(2500);

    // Step 3: fill email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ timeout: 8000 });
    await emailInput.fill(email);
    await page.waitForTimeout(500);

    // Step 4: submit
    const submitBtn = page.locator('button:has-text("Create Account")').first();
    await submitBtn.click();
    await page.waitForTimeout(4000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/blkat-${index + 1}-result.png` });
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));

    if (/account created|verify your email|sent a.*code|check your/i.test(bodyText)) {
      console.log(`  ✅ Account created — verification email sent to ${email}`);
      return 'created';
    } else if (/already.*exist|already.*registered|already have an account/i.test(bodyText)) {
      console.log(`  ℹ️  Account already exists for ${email}`);
      return 'created';
    } else {
      console.log(`  ⚠️  Unexpected response: ${bodyText.slice(0, 150)}`);
      return 'failed';
    }

  } catch (err: any) {
    console.error(`  ❌ Failed for ${name}: ${err.message}`);
    return 'failed';
  } finally {
    await ctx.close();
  }
}

async function main() {
  console.log('BlackAt — Account Registration for Indvstry Power House Residents');
  console.log(`Registering ${RESIDENTS.length} residents\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const results: { name: string; email: string; status: string }[] = [];

  for (let i = 0; i < RESIDENTS.length; i++) {
    const r = RESIDENTS[i];
    const name = `${r.firstName} ${r.lastName}`.trim();
    const status = await createAccount(browser, r.email, name, i, RESIDENTS.length);
    results.push({ name, email: r.email, status });

    if (i < RESIDENTS.length - 1) await new Promise(res => setTimeout(res, 3000));
  }

  await browser.close();

  console.log('\n─── RESULTS ─────────────────────────────────────');
  for (const r of results) {
    const icon = r.status === 'created' ? '✅' : '❌';
    console.log(`${icon} ${r.name} <${r.email}> — ${r.status}`);
  }
  console.log('\nEach resident will receive a verification email to activate their account.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
