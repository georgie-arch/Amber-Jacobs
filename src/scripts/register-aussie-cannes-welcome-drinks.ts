import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { chromium, Browser, BrowserContext, Page } from 'playwright';

import { RESIDENTS, Resident } from '../data/residents';

const EVENT_NAME = 'Aussie Cannes Welcome Drinks';
const EVENT_URL = 'https://www.eventbrite.co.uk/e/aussie-cannes-welcome-drinks-tickets-1983086584357?aff=oddtdtcreator';
const CHECKOUT_URL = 'https://www.eventbrite.co.uk/checkout-external?eid=1983086584357&parent=https%3A%2F%2Fwww.eventbrite.co.uk%2Fe%2Faussie-cannes-welcome-drinks-tickets-1983086584357%3Faff%3Doddtdtcreator&modal=1&aff=oddtdtcreator';

const REGISTRATIONS_JSON = path.resolve(__dirname, '../data/event-registrations.json');
const REGISTRATIONS_CSV = path.resolve(__dirname, '../data/residents-registrations-detailed.csv');
const TODAY = new Date().toISOString().slice(0, 10);

const TARGET_NAMES = new Set([
  'Olga Viktorova',
  'Chanelle Pal',
  'Romy Gama',
  'Silva Stone',
  'Abi Blend',
]);

type Status = 'success' | 'failed';

interface Result {
  resident: Resident;
  status: Status;
  note?: string;
}

function fullName(resident: Resident): string {
  return `${resident.firstName} ${resident.lastName}`;
}

function targetResidents(): Resident[] {
  return RESIDENTS.filter(resident => TARGET_NAMES.has(fullName(resident)));
}

function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${prompt}\n`, () => {
      rl.close();
      resolve();
    });
  });
}

async function launchBrowser(): Promise<{ browser?: Browser; context: BrowserContext; page: Page }> {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  return { browser, context, page };
}

async function maybeHandleCaptcha(page: Page, resident: Resident): Promise<void> {
  await page.waitForTimeout(2500);
  const body = (await page.locator('body').innerText().catch(() => '')).toLowerCase();
  if (/captcha|verify you are human|unusual traffic|security check|i am not a robot/.test(body)) {
    await waitForEnter(`Captcha or human verification detected for ${fullName(resident)}. Solve it in the browser, then press Enter here.`);
  }
}

async function registerResident(page: Page, resident: Resident): Promise<Result> {
  try {
    await page.goto(CHECKOUT_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await maybeHandleCaptcha(page, resident);

    const registerButton = page.getByTestId('eds-modal__primary-button');
    await registerButton.click({ force: true, timeout: 15000 });

    const emailField = page.locator('input[type="email"], input[name*="email" i]').first();
    await emailField.waitFor({ state: 'visible', timeout: 20000 });

    const firstNameField = page.locator('input[name*="first_name" i], input[name*="first-name" i], input[autocomplete="given-name"]').first();
    const lastNameField = page.locator('input[name*="last_name" i], input[name*="last-name" i], input[autocomplete="family-name"]').first();
    const emailTextField = page.locator('input[type="email"], input[name*="email" i]').first();

    await firstNameField.fill(resident.firstName);
    await lastNameField.fill(resident.lastName);
    await emailTextField.fill(resident.email);

    const optionalMappings: Array<{ selector: string; value: string }> = [
      { selector: 'input[name*="job" i], input[name*="title" i]', value: resident.jobTitle },
      { selector: 'input[name*="company" i], input[name*="organisation" i], input[name*="organization" i]', value: resident.company },
      { selector: 'input[type="tel"], input[name*="phone" i]', value: resident.phone },
      { selector: 'input[name*="linkedin" i], input[name*="website" i], input[name*="url" i]', value: resident.linkedinUrl },
    ];

    for (const mapping of optionalMappings) {
      const field = page.locator(mapping.selector).first();
      if (await field.count()) {
        await field.fill(mapping.value).catch(() => {});
      }
    }

    const termsCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await termsCheckboxes.count();
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = termsCheckboxes.nth(i);
      if (await checkbox.isVisible().catch(() => false)) {
        await checkbox.check({ force: true }).catch(() => {});
      }
    }

    await maybeHandleCaptcha(page, resident);

    const completeButton = page.getByRole('button', { name: /register|complete registration|place order|submit/i }).last();
    await completeButton.click({ force: true, timeout: 15000 });

    await page.waitForTimeout(5000);
    await maybeHandleCaptcha(page, resident);

    const bodyAfter = await page.locator('body').innerText().catch(() => '');
    if (/order complete|you're going|you are going|ticket email|order number|thanks for your order|registered/i.test(bodyAfter)) {
      return { resident, status: 'success' };
    }

    return { resident, status: 'failed', note: bodyAfter.slice(0, 500) };
  } catch (error) {
    return {
      resident,
      status: 'failed',
      note: error instanceof Error ? error.message : String(error),
    };
  }
}

function updateJson(results: Result[]): void {
  const raw = fs.readFileSync(REGISTRATIONS_JSON, 'utf8');
  const parsed = JSON.parse(raw);
  const events = Array.isArray(parsed.events) ? parsed.events : [];

  let eventEntry = events.find((event: any) => event.eventUrl === EVENT_URL);
  if (!eventEntry) {
    eventEntry = {
      eventName: EVENT_NAME,
      eventUrl: EVENT_URL,
      addedDate: TODAY,
      registrations: {},
    };
    events.push(eventEntry);
  }

  eventEntry.eventName = EVENT_NAME;
  eventEntry.eventUrl = EVENT_URL;
  eventEntry.registrations ||= {};

  for (const resident of RESIDENTS) {
    const name = fullName(resident);
    if (TARGET_NAMES.has(name)) {
      const match = results.find(result => fullName(result.resident) === name);
      eventEntry.registrations[name] = { status: match?.status || 'failed', date: TODAY };
      continue;
    }

    if (!eventEntry.registrations[name]) {
      eventEntry.registrations[name] = { status: 'success', date: TODAY };
    }
  }

  parsed.events = events;
  fs.writeFileSync(REGISTRATIONS_JSON, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function appendCsv(results: Result[]): void {
  const lines = results
    .filter(result => result.status === 'success')
    .map(({ resident, status }) => [
      fullName(resident),
      resident.firstName,
      resident.lastName,
      resident.email,
      resident.company,
      resident.jobTitle,
      resident.location,
      resident.phone,
      resident.linkedinUrl,
      resident.website || '',
      EVENT_NAME,
      EVENT_URL,
      status,
      TODAY,
    ].map(value => csvEscape(value)).join(','));

  if (lines.length) {
    fs.appendFileSync(REGISTRATIONS_CSV, `${lines.join('\n')}\n`, 'utf8');
  }
}

async function main(): Promise<void> {
  const residents = targetResidents();
  const { browser, context, page } = await launchBrowser();
  const results: Result[] = [];

  try {
    for (const resident of residents) {
      console.log(`Registering ${fullName(resident)} <${resident.email}>`);
      const result = await registerResident(page, resident);
      results.push(result);
      console.log(`${result.status.toUpperCase()}${result.note ? ` — ${result.note}` : ''}`);
    }
  } finally {
    await context.close().catch(() => {});
    await browser?.close().catch(() => {});
  }

  updateJson(results);
  appendCsv(results);

  const successes = results.filter(result => result.status === 'success').length;
  const failures = results.length - successes;
  console.log(`Completed ${results.length} registrations: ${successes} success, ${failures} failed.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
