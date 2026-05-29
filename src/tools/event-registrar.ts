/**
 * event-registrar.ts
 *
 * Playwright-powered event registration tool for Amber.
 * Handles all form types encountered at Cannes Lions 2026 events:
 *   - Text inputs (name, email, company, job title, phone, LinkedIn, website)
 *   - Textareas (why attending, expectations, bio — fabricates reasonable answers)
 *   - Dropdowns (industry, company size, job function — picks best match)
 *   - Radio buttons (selects most appropriate option)
 *   - Checkboxes (ticks consent/terms; ticks all relevant interest options)
 *   - Date/time slot selectors (selects all available or most appropriate)
 *   - Multi-step/paginated forms (navigates through all pages to submit)
 *
 * Usage (CLI):
 *   npx ts-node --project tsconfig.json src/tools/event-registrar.ts \
 *     --url "https://events.thefemalequotient.com/canneslions26"
 *
 * Programmatic (from sync script):
 *   import { registerAllResidents } from './event-registrar';
 *   await registerAllResidents(url, eventName, residentsToRegister);
 */

import { chromium, Browser, BrowserContext, Page, Frame, ElementHandle } from 'playwright';

type PageOrFrame = Page | Frame;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS, Resident } from '../data/residents';

const REGISTRATIONS_LOG = path.resolve(__dirname, '../data/event-registrations.json');
const SCREENSHOT_DIR = path.resolve(__dirname, '../scripts/screenshots');

interface RegistrarSession {
  browser?: Browser;
  context: BrowserContext;
  page: Page;
}

function buildLaunchArgs(): string[] {
  const args = ['--disable-blink-features=AutomationControlled', '--no-sandbox'];
  const profileDirectory = process.env.CHROME_PROFILE_DIRECTORY;
  if (profileDirectory) args.push(`--profile-directory=${profileDirectory}`);
  return args;
}

async function createRegistrarSession(headless = true): Promise<RegistrarSession> {
  const useChromeProfile = process.env.CHROME_USER_DATA && process.env.CHROME_CHANNEL;

  if (useChromeProfile) {
    const context = await chromium.launchPersistentContext(process.env.CHROME_USER_DATA!, {
      channel: process.env.CHROME_CHANNEL as 'chrome',
      headless: headless && process.env.HEADLESS !== 'false',
      slowMo: 40,
      args: buildLaunchArgs(),
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
    const page = context.pages()[0] || await context.newPage();
    return { context, page };
  }

  const browser: Browser = await chromium.launch({
    headless,
    slowMo: headless ? 40 : 80,
    args: buildLaunchArgs(),
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();
  return { browser, context, page };
}

// ─── BOT CHALLENGE DETECTION ──────────────────────────────────────────────────

async function detectBotChallenge(page: Page): Promise<string | null> {
  try {
    const title = await page.title();
    if (/just a moment|checking your browser|please wait|access denied|attention required|security check/i.test(title)) {
      return `Cloudflare/security page detected: "${title}"`;
    }

    const challengeSelectors = [
      'iframe[src*="captcha"]',
      'iframe[src*="recaptcha"]',
      'iframe[src*="hcaptcha"]',
      'iframe[title*="captcha" i]',
      'div.cf-challenge-running',
      '#cf-please-wait',
      '.cf-browser-verification',
      'div[class*="captcha"]',
      'div[id*="captcha"]',
      '[data-testid="challenge-stage"]',
      '.h-captcha',
      '.g-recaptcha',
      '#px-captcha',
    ];

    for (const sel of challengeSelectors) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) return `Bot challenge element visible: ${sel}`;
      } catch { /* ignore */ }
    }

    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 600) || '');
    if (/verify you(?: are| 're) (?:a )?human|i am not a robot|prove you(?: are| 're) human|unusual traffic|suspicious activity|too many requests|rate.?limit|access is temporarily restricted|unusual activity from your device/i.test(bodyText)) {
      return `Bot challenge text detected on page`;
    }
  } catch { /* page may have navigated */ }

  return null;
}

// ─── HUMAN INPUT PAUSE ────────────────────────────────────────────────────────

async function waitForHumanInput(message: string): Promise<void> {
  const { createInterface } = await import('readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  return new Promise(resolve => {
    console.log(`\n${'='.repeat(62)}`);
    console.log(`  HUMAN INPUT NEEDED`);
    console.log(`  ${message}`);
    console.log(`  Solve it in the browser window, then press ENTER here.`);
    console.log('='.repeat(62));
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });
}

// Checks for a bot challenge and pauses if one is found. Returns true if a challenge was handled.
async function handleBotChallengeIfPresent(page: Page, label: string): Promise<boolean> {
  const challenge = await detectBotChallenge(page);
  if (!challenge) return false;

  console.log(`\n  [BOT CHALLENGE] ${challenge}`);
  await waitForHumanInput(`Bot/CAPTCHA detected for ${label}. Complete it in the browser.`);
  await page.waitForTimeout(1500);
  return true;
}

// ─── FIELD SELECTORS ──────────────────────────────────────────────────────────

const FIELD_SELECTORS = {
  firstName: [
    'input[name*="first" i]', 'input[placeholder*="first" i]',
    'input[id*="first" i]', 'input[autocomplete="given-name"]',
    'input[name="fname"]', 'input[id="fname"]',
  ],
  lastName: [
    'input[name*="last" i]', 'input[placeholder*="last" i]',
    'input[id*="last" i]', 'input[autocomplete="family-name"]',
    'input[name="lname"]', 'input[id="lname"]',
  ],
  fullName: [
    'input[name*="full" i]', 'input[placeholder*="full name" i]',
    'input[id*="fullname" i]', 'input[name="name"]',
    'input[placeholder*="your name" i]', 'input[id="name"]',
  ],
  email: [
    'input[type="email"]', 'input[name*="email" i]',
    'input[placeholder*="email" i]', 'input[id*="email" i]',
    'input[autocomplete="email"]',
  ],
  company: [
    'input[name*="company" i]', 'input[placeholder*="company" i]',
    'input[id*="company" i]', 'input[name*="organization" i]',
    'input[placeholder*="organization" i]', 'input[name*="employer" i]',
  ],
  jobTitle: [
    'input[name*="title" i]', 'input[placeholder*="title" i]',
    'input[id*="title" i]', 'input[name*="role" i]',
    'input[placeholder*="role" i]', 'input[name*="position" i]',
    'input[placeholder*="job" i]',
  ],
  phone: [
    'input[type="tel"]', 'input[name*="phone" i]', 'input[placeholder*="phone" i]',
    'input[id*="phone" i]', 'input[name*="mobile" i]', 'input[placeholder*="mobile" i]',
    'input[autocomplete="tel"]',
  ],
  linkedin: [
    'input[name*="linkedin" i]', 'input[placeholder*="linkedin" i]',
    'input[id*="linkedin" i]', 'input[name*="social" i]',
    'input[placeholder*="linkedin.com" i]',
  ],
  website: [
    'input[name*="website" i]', 'input[placeholder*="website" i]',
    'input[id*="website" i]', 'input[name*="url" i]',
    'input[placeholder*="http" i]', 'input[type="url"]',
  ],
  submit: [
    'button[type="submit"]', 'input[type="submit"]',
    'button:has-text("Register")', 'button:has-text("Sign up")',
    'button:has-text("Sign Up")', 'button:has-text("Submit")',
    'button:has-text("RSVP")', 'button:has-text("Book")',
    'button:has-text("Confirm")', 'button:has-text("Attend")',
    'button:has-text("Complete")', 'button:has-text("Finish")',
    'button:has-text("Place Order")', 'button:has-text("Place order")',
    'button:has-text("Order Now")', 'button:has-text("Order now")',
    'button:has-text("Place Free Order")',
    'button:has-text("Request to Join")',
    'button:has-text("Register your interest")',
    'button:has-text("Register Interest")',
    'button:has-text("Checkout")',
  ],
  next: [
    'button:has-text("Next")', 'button:has-text("Continue")',
    'button:has-text("Proceed")', 'button:has-text("Next step")',
    'a:has-text("Next")', 'a:has-text("Continue")',
    'button[aria-label*="next" i]',
  ],
};

// ─── DROPDOWN PREFERENCE TERMS ────────────────────────────────────────────────

// Ordered preference lists for common dropdown types
const DROPDOWN_PREFERENCES: Record<string, string[]> = {
  industry: ['marketing', 'media', 'advertising', 'creative', 'entertainment', 'technology', 'communications', 'pr', 'digital', 'brand'],
  company_size: ['1 - 10', '1-10', '2-10', '11-50', '11 - 50', 'micro', 'small', 'startup', '1–10', '< 10'],
  seniority: ['founder', 'c-suite', 'c-level', 'executive', 'director', 'vp', 'senior', 'manager', 'lead'],
  decision: ['final decision', 'decision maker', 'key decision', 'influencer', 'recommend', 'budget'],
  how_heard: ['colleague', 'friend', 'email', 'newsletter', 'linkedin', 'social media', 'invitation', 'word'],
  attendance_type: ['in-person', 'in person', 'attend', 'physical', 'cannes', 'all sessions', 'full event'],
  country: ['united kingdom', 'uk', 'england', 'great britain', 'gb'],
  country_us: ['united states', 'usa', 'us', 'america'],
};

function isInkwellLumaEvent(page: PageOrFrame): boolean {
  return page.url().toLowerCase().includes('luma.com/inkwellcannes2026');
}

function isCanvaEvent(page: PageOrFrame): boolean {
  return page.url().toLowerCase().includes('events.canva.com');
}

function inferCanvaDepartment(guest: Resident): string {
  const t = guest.jobTitle.toLowerCase();
  if (/creative|design|art director/i.test(t)) return 'Creative';
  if (/marketing|brand|partnerships|advertising|ads/i.test(t)) return 'Marketing';
  if (/sales|business dev|new business/i.test(t)) return 'Sales';
  if (/talent|hr|people|recruit/i.test(t)) return 'Human Resources';
  if (/product|engineer|tech|develop/i.test(t)) return 'Product';
  if (/founder|ceo|chief|president|owner/i.test(t)) return 'Executive Leadership';
  if (/director/i.test(t)) return 'Executive Leadership';
  return 'Marketing';
}

function inferCanvaSeniority(guest: Resident): string {
  const t = guest.jobTitle.toLowerCase();
  if (/founder|owner|ceo|chief|president/i.test(t)) return 'C-Suite';
  if (/senior director|vp|vice president/i.test(t)) return 'VP';
  if (/director/i.test(t)) return 'Director';
  if (/senior|lead/i.test(t)) return 'Senior';
  if (/manager/i.test(t)) return 'Manager';
  return 'Individual Contributor';
}

function inferCanvaCompanySize(guest: Resident): string {
  const c = guest.company.toLowerCase();
  if (/ebay/i.test(c)) return '1001';
  return '1-50';
}

async function selectDropdownOption(page: PageOrFrame, labelTexts: string[], optionTerms: string[], fieldName: string): Promise<boolean> {
  // Strategy 1: Standard <select> by label
  for (const labelText of labelTexts) {
    try {
      const selectEl = page.getByLabel(labelText, { exact: false });
      if (await selectEl.count() > 0 && await selectEl.first().isVisible()) {
        const tagName = await selectEl.first().evaluate((el: Element) => el.tagName.toLowerCase());
        if (tagName === 'select') {
          const selectHandle = await selectEl.first().elementHandle();
          const options: { value: string; text: string }[] = selectHandle
            ? await selectHandle.$$eval('option', (opts: HTMLOptionElement[]) =>
                opts.map(o => ({ value: o.value, text: (o.textContent || '').trim() })).filter(o => o.value)
              )
            : [];
          for (const term of optionTerms) {
            const match = options.find(o => o.text.toLowerCase().includes(term.toLowerCase()) || o.value.toLowerCase().includes(term.toLowerCase()));
            if (match) {
              await selectEl.first().selectOption(match.value);
              console.log(`  [label-select] ${fieldName}: "${match.text}"`);
              return true;
            }
          }
        }
      }
    } catch { /* try next */ }
  }

  // Strategy 2: combobox role by name
  for (const labelText of labelTexts) {
    try {
      const combobox = page.getByRole('combobox', { name: new RegExp(labelText, 'i') });
      if (await combobox.count() > 0 && await combobox.first().isVisible()) {
        await combobox.first().click({ force: true });
        await page.waitForTimeout(400);
        for (const term of optionTerms) {
          const option = page.getByRole('option').filter({ hasText: new RegExp(term, 'i') }).first();
          if (await option.count() > 0) {
            await option.click({ force: true });
            console.log(`  [combobox] ${fieldName}: matched "${term}"`);
            return true;
          }
        }
        if ('keyboard' in page) await (page as any).keyboard.press('Escape').catch(() => {});
      }
    } catch { /* try next */ }
  }

  // Strategy 3: listbox opened by a button near label text
  for (const labelText of labelTexts) {
    try {
      const wrapper = page.getByText(labelText, { exact: false }).locator('xpath=following::*[self::select or @role="combobox" or @role="listbox"][1]').first();
      if (await wrapper.count() > 0 && await wrapper.isVisible()) {
        await wrapper.click({ force: true });
        await page.waitForTimeout(400);
        for (const term of optionTerms) {
          const option = page.getByRole('option').filter({ hasText: new RegExp(term, 'i') }).first();
          if (await option.count() > 0) {
            await option.click({ force: true });
            console.log(`  [listbox] ${fieldName}: matched "${term}"`);
            return true;
          }
        }
        if ('keyboard' in page) await (page as any).keyboard.press('Escape').catch(() => {});
      }
    } catch { /* try next */ }
  }

  return false;
}

async function handleCanvaEventFields(page: PageOrFrame, guest: Resident): Promise<void> {
  if (!isCanvaEvent(page)) return;

  const department = inferCanvaDepartment(guest);
  const seniority = inferCanvaSeniority(guest);
  const companySize = inferCanvaCompanySize(guest);

  await selectDropdownOption(
    page,
    ['department', 'your department', 'department / function', 'department/function', 'team', 'function'],
    [department, 'marketing', 'creative', 'executive leadership', 'executive', 'sales'],
    'Department'
  );
  await selectDropdownOption(
    page,
    ['seniority', 'job level', 'level', 'seniority level', 'your seniority', 'job seniority'],
    [seniority, 'c-suite', 'director', 'vp', 'senior', 'manager', 'individual contributor'],
    'Seniority'
  );
  await selectDropdownOption(
    page,
    ['company size', 'organisation size', 'number of employees', 'employees', 'team size'],
    [companySize, '1-50', '1-10', '11-50', '1001', 'small'],
    'Company Size'
  );
}

function hashGuest(guest: Resident): number {
  return `${guest.firstName} ${guest.lastName}`.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function inferLocationFromPhone(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, '');
  if (normalized.startsWith('+44')) return 'London, UK';
  if (normalized.startsWith('+1408') || normalized.startsWith('1408')) return 'San Jose, USA';
  if (normalized.startsWith('+1')) return 'United States';
  return 'London, UK';
}

function getInkwellProfessionalLevel(guest: Resident): string[] {
  const title = guest.jobTitle.toLowerCase();
  if (/founder|owner|ceo/.test(title)) return ['Founder / entrepreneur'];
  if (/director|head|vp|vice president/.test(title)) return ['Senior / director level'];
  if (/chief|president/.test(title)) return ['Executive / C-suite'];
  return ['Mid-level professional'];
}

function getInkwellExcitedDays(guest: Resident): string[] {
  const dayOptions = [
    'Mon 6/22 — The Power of Partnerships & AYA Inclusion Awards',
    'Tue 6/23 — Currents of Culture',
    'Wed 6/24 — Day of Disruption',
    'Thu 6/25 — License to Lead: Reclaiming the Art of Storytelling',
    'Fri 6/26 — Forward Focused',
  ];
  const seed = hashGuest(guest);
  const first = seed % dayOptions.length;
  const second = (first + 2) % dayOptions.length;
  return [dayOptions[first], dayOptions[second]];
}

function getInkwellTakeawayAnswer(guest: Resident): string {
  const options = [
    'I want to leave with a sharper sense of how leaders are using storytelling to build influence, create opportunity and move culture forward in a meaningful way.',
    'I am hoping to take away practical insight on inclusive storytelling, stronger strategic relationships and a clearer view of where culture-led partnerships are heading next.',
    'I would like to leave with new ideas, real perspective from peers and a stronger understanding of how creative leadership can turn community into long-term impact.',
  ];
  return options[hashGuest(guest) % options.length];
}

function getInkwellConnectionAnswer(guest: Resident): string {
  const options = [
    'I am hoping to connect with brand, media and cultural leaders who are building thoughtful partnerships around storytelling, community and entertainment.',
    'I would love to meet creative and partnership leads, founders and senior decision-makers who care about culture-first collaboration and long-term relationship building.',
    'I am looking to connect with people across entertainment, brand partnerships and creative strategy who are open to meaningful collaboration during and beyond Cannes.',
  ];
  return options[(hashGuest(guest) + 1) % options.length];
}

// ─── TEXTAREA ANSWERS ─────────────────────────────────────────────────────────

function getTextareaAnswer(labelText: string, guest: Resident): string {
  const label = labelText.toLowerCase();
  const fullName = `${guest.firstName} ${guest.lastName}`.trim();
  const isFounder = guest.jobTitle.toLowerCase().includes('founder') || guest.jobTitle.toLowerCase().includes('ceo');

  if (/why.*(attend|join|come|interested|register)/i.test(label) || /reason/i.test(label)) {
    return `I am attending Cannes Lions 2026 to connect with leaders across creative, media and brand industries, and to stay close to the conversations and partnerships shaping the next chapter of our work at ${guest.company}. Cannes is the one moment in the year where the entire creative industry is in one place, and I want to make the most of that.`;
  }

  if (/what.*(hope|expect|get out|looking for|gain)/i.test(label) || /goals?/i.test(label)) {
    return `My main goals are to build meaningful industry relationships, discover new collaborators and clients, and stay informed on where creativity and brand strategy are headed. I am also keen to attend sessions that challenge conventional thinking in ${isFounder ? 'brand building and entrepreneurship' : 'marketing and media'}.`;
  }

  if (/tell us.*(yourself|about you)/i.test(label) || /bio|background|introduce/i.test(label)) {
    return `${fullName} is ${guest.jobTitle} at ${guest.company}, working at the intersection of creativity, culture and brand. Based in ${guest.location}, ${isFounder ? `${guest.firstName} founded ${guest.company} to create a more inclusive and dynamic space for creative professionals.` : `${guest.firstName} works across brand partnerships, creative strategy and community.`}`;
  }

  if (/company.*description|about.*company|what does.*company do/i.test(label)) {
    return `${guest.company} is a creative and cultural brand operating at the intersection of media, technology and community. We work with forward-thinking brands and creative professionals to build meaningful connections and cultural impact.`;
  }

  if (/interest|topic|session|area|focus/i.test(label)) {
    return `Brand strategy and creativity, cultural marketing, diversity and inclusion in creative industries, creator economy, AI and the future of storytelling, sustainable brand practices.`;
  }

  if (/diet|food|allergi/i.test(label)) {
    return `No dietary requirements.`;
  }

  if (/access|requirement|special need/i.test(label)) {
    return `No specific requirements.`;
  }

  if (/how.*hear|find out|discover|referr/i.test(label)) {
    return `Invitation from a colleague in the industry.`;
  }

  if (/message|comment|anything else|additional|note/i.test(label)) {
    return `Looking forward to connecting with the community at Cannes. Thank you for the invitation.`;
  }

  // Generic fallback for unknown textareas
  return `${fullName}, ${guest.jobTitle} at ${guest.company}. Based in ${guest.location}. Attending Cannes Lions 2026 to connect with the creative and media industry and explore new partnerships.`;
}

async function fillTextareaByQuestion(page: PageOrFrame, questionText: string, answer: string): Promise<boolean> {
  try {
    const textarea = page.getByText(questionText, { exact: false }).locator('xpath=following::textarea[1]');
    if (await textarea.count() > 0 && await textarea.first().isVisible()) {
      await textarea.first().scrollIntoViewIfNeeded().catch(() => {});
      await textarea.first().click({ force: true });
      await textarea.first().fill(answer);
      console.log(`  [textarea] "${questionText}": filled`);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

async function fillTextInputByQuestion(page: PageOrFrame, questionText: string, answer: string, fieldName: string): Promise<boolean> {
  try {
    const input = page.getByText(questionText, { exact: false }).locator('xpath=following::input[not(@type="hidden")][1]').first();
    if (await input.count() > 0 && await input.isVisible()) {
      await input.scrollIntoViewIfNeeded().catch(() => {});
      await input.click({ force: true });
      await input.fill(answer);
      console.log(`  [question input] ${fieldName}: "${answer}"`);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

async function chooseLumaOptions(page: PageOrFrame, questionText: string, optionLabels: string[]): Promise<boolean> {
  try {
    let wrapper = page.locator('.lux-input-wrapper').filter({ hasText: questionText }).first();
    if (await wrapper.count() === 0) {
      wrapper = page.getByText(questionText, { exact: false }).locator(
        'xpath=ancestor::*[contains(@class, "lux-input-wrapper")][1]'
      ).first();
    }
    if (await wrapper.count() === 0 || !(await wrapper.first().isVisible())) return false;
    await wrapper.first().scrollIntoViewIfNeeded().catch(() => {});

    const textInput = wrapper.locator('input').first();
    const picker = wrapper.locator('.lux-input').first();

    for (let i = 0; i < optionLabels.length; i++) {
      if (await textInput.count() > 0 && await textInput.isVisible()) {
        await textInput.click({ force: true });
        await textInput.fill(optionLabels[i]);
        await page.waitForTimeout(300);
      } else {
        await picker.click({ force: true });
        await page.waitForTimeout(300);
      }

      const option = page.getByText(optionLabels[i], { exact: true }).last();
      if (await option.count() > 0) {
        await option.click({ force: true });
      } else if (await textInput.count() > 0 && await textInput.isVisible()) {
        await textInput.press('Enter');
      }
      await page.waitForTimeout(300);
    }

    if ('keyboard' in page) {
      await page.keyboard.press('Escape').catch(() => {});
    }
    console.log(`  [luma select] "${questionText}": ${optionLabels.join(', ')}`);
    return true;
  } catch { /* ignore */ }
  return false;
}

async function handleInkwellLumaFields(page: PageOrFrame, guest: Resident): Promise<void> {
  if (!isInkwellLumaEvent(page)) return;

  const derivedLocation = inferLocationFromPhone(guest.phone || '');

  await fillByLabel(page, ['where are you located', 'city & country', 'city', 'location'], derivedLocation, 'Location');
  await chooseLumaOptions(page, 'Industry/ Sector?', ['Entertainment']);
  await chooseLumaOptions(page, "Which best describes where you're at professionally", getInkwellProfessionalLevel(guest));
  await chooseLumaOptions(page, 'Will this be your first time attending Inkwell Beach', ['No']);
  await chooseLumaOptions(page, 'How did you hear about Inkwell Beach', ['Word of Mouth']);
  await chooseLumaOptions(page, "Which day's programming are you most excited about", getInkwellExcitedDays(guest));
  await fillTextareaByQuestion(page, 'What are you hoping to take away from Inkwell Beach', getInkwellTakeawayAnswer(guest));
  await fillTextareaByQuestion(page, 'Is there a partnership, collaboration or connection you are hoping to make', getInkwellConnectionAnswer(guest));
  await fillTextareaByQuestion(
    page,
    'Do you have any accessibility needs we should be aware of',
    'No accessibility requirements.'
  );
  await chooseLumaOptions(page, 'Can we contact you about future Can: Diversity Collective', ['Yes']);
  await chooseLumaOptions(
    page,
    'Would you like to set up a meeting with our partnerships team while at Inkwell Beach',
    ['Yes']
  );
}

function isLumaEvent(page: PageOrFrame): boolean {
  return page.url().toLowerCase().includes('luma.com/');
}

async function openLumaRegistration(page: Page): Promise<void> {
  if (!isLumaEvent(page)) return;

  const hasVisibleForm = await page.locator(
    'input[name="name"]:visible, input[type="email"]:visible, input[name*="registration_answers" i]:visible, button[type="submit"]:visible'
  ).count().catch(() => 0);
  if (hasVisibleForm > 0) return;

  const button = page.getByRole('button', { name: /request to join|register|join waitlist|apply to join/i }).first();
  if (await button.count() === 0 || !(await button.isVisible().catch(() => false))) return;

  // Luma often hides the actual form behind a modal opened from the event page.
  console.log('  [luma] opening registration modal');
  await button.click({ force: true });
  await page.waitForTimeout(1500);
}

async function handleGenericLumaFields(page: PageOrFrame, guest: Resident): Promise<void> {
  if (!isLumaEvent(page)) return;

  await fillTextInputByQuestion(page, 'Referred by', 'George Guise', 'Referred By');
  if (guest.linkedinUrl) {
    await fillTextInputByQuestion(page, 'Please attach your LinkedIn profile', guest.linkedinUrl, 'LinkedIn');
  }
}

// ─── CORE FILL UTILITIES ──────────────────────────────────────────────────────

async function findAndFill(page: PageOrFrame, selectors: string[], value: string, fieldName: string): Promise<boolean> {
  for (const selector of selectors) {
    try {
      const el = await page.$(selector);
      if (el && await el.isVisible() && await el.isEnabled()) {
        await el.click({ force: true });
        await el.fill(value);
        console.log(`  [text] ${fieldName}: "${value}"`);
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}

async function fillByLabel(page: PageOrFrame, labelTexts: string[], value: string, fieldName: string): Promise<boolean> {
  for (const labelText of labelTexts) {
    try {
      const loc = page.getByLabel(labelText, { exact: false });
      if (await loc.count() > 0 && await loc.first().isVisible()) {
        await loc.first().click();
        await loc.first().fill(value);
        console.log(`  [label] ${fieldName} ("${labelText}"): "${value}"`);
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}

// ─── TEXTAREA HANDLER ─────────────────────────────────────────────────────────

async function fillTextareas(page: PageOrFrame, guest: Resident): Promise<void> {
  const textareas = await page.$$('textarea:visible');
  for (const ta of textareas) {
    try {
      if (!(await ta.isVisible()) || !(await ta.isEnabled())) continue;

      // Try to determine what this textarea is asking by finding its label
      const id = await ta.getAttribute('id');
      const name = await ta.getAttribute('name') || '';
      const placeholder = await ta.getAttribute('placeholder') || '';
      const ariaLabel = await ta.getAttribute('aria-label') || '';

      let labelText = ariaLabel || placeholder || name;

      // Try to find associated <label> element
      if (id) {
        try {
          const labelEl = await page.$(`label[for="${id}"]`);
          if (labelEl) labelText = (await labelEl.textContent() || '').trim();
        } catch { /* ignore */ }
      }

      // Also check for nearby label/heading text
      if (!labelText) {
        try {
          const nearby = await ta.evaluate((_el: Element) => {
            const parent = _el.closest('div, section, fieldset');
            if (!parent) return '';
            const label = parent.querySelector('label, legend, h3, h4, p');
            return label ? (label.textContent || '').trim() : '';
          });
          if (nearby) labelText = nearby;
        } catch { /* ignore */ }
      }

      const answer = getTextareaAnswer(labelText, guest);
      await ta.click({ force: true });
      await ta.fill(answer);
      console.log(`  [textarea] "${labelText || 'unknown'}": filled`);
    } catch { /* skip */ }
  }
}

// ─── RADIO BUTTON HANDLER ─────────────────────────────────────────────────────

async function handleRadioButtons(page: PageOrFrame, guest: Resident): Promise<void> {
  // Group radios by name attribute
  const radios = await page.$$('input[type="radio"]:visible');
  const groups: Record<string, ElementHandle[]> = {};

  for (const radio of radios) {
    try {
      const name = await radio.getAttribute('name') || 'unnamed';
      if (!groups[name]) groups[name] = [];
      groups[name].push(radio);
    } catch { /* skip */ }
  }

  for (const [groupName, buttons] of Object.entries(groups)) {
    try {
      // If one is already checked, leave it
      let alreadyChecked = false;
      for (const btn of buttons) {
        if (await btn.isChecked()) { alreadyChecked = true; break; }
      }
      if (alreadyChecked) continue;

      // Get labels for each option to pick the most appropriate
      const options: { el: ElementHandle; label: string }[] = [];
      for (const btn of buttons) {
        let label = '';
        try {
          const id = await btn.getAttribute('id');
          const value = await btn.getAttribute('value') || '';
          if (id) {
            const labelEl = await page.$(`label[for="${id}"]`);
            if (labelEl) label = (await labelEl.textContent() || '').trim();
          }
          if (!label) {
            // Try sibling text
            label = await btn.evaluate((el: Element) => {
              const next = el.nextSibling;
              if (next && next.nodeType === 3) return (next.textContent || '').trim();
              const sibling = el.parentElement?.querySelector('label, span');
              return sibling ? (sibling.textContent || '').trim() : '';
            });
          }
          if (!label) label = value;
          options.push({ el: btn, label: label.toLowerCase() });
        } catch { /* skip */ }
      }

      if (options.length === 0) continue;

      // Preferred terms based on group name context
      const gName = groupName.toLowerCase();
      let preferredTerms: string[] = [];

      if (/attend|format|type|mode/i.test(gName)) {
        preferredTerms = ['in-person', 'in person', 'attend', 'physical', 'yes', 'all'];
      } else if (/gender/i.test(gName)) {
        preferredTerms = ['prefer not', 'not to say', 'non-binary', 'other'];
      } else if (/sector|industry/i.test(gName)) {
        preferredTerms = ['marketing', 'media', 'creative', 'advertising', 'technology'];
      } else if (/size/i.test(gName)) {
        preferredTerms = ['1-10', '2-10', '< 10', 'micro', 'small'];
      } else if (/seniority|level|role/i.test(gName)) {
        preferredTerms = ['founder', 'c-suite', 'executive', 'director', 'senior'];
      } else if (/hear|source|referr/i.test(gName)) {
        preferredTerms = ['colleague', 'invitation', 'email', 'linkedin', 'social'];
      } else if (/agree|consent|terms|gdpr/i.test(gName)) {
        preferredTerms = ['yes', 'agree', 'accept', 'i agree'];
      } else {
        // Default: first option or "yes" if available
        preferredTerms = ['yes', 'all', 'any'];
      }

      let chosen = options[0]; // default to first
      for (const term of preferredTerms) {
        const match = options.find(o => o.label.includes(term));
        if (match) { chosen = match; break; }
      }

      await chosen.el.click({ force: true });
      console.log(`  [radio] "${groupName}": selected "${chosen.label}"`);
    } catch { /* skip group */ }
  }
}

// ─── CHECKBOX HANDLER ─────────────────────────────────────────────────────────

async function handleCheckboxes(page: PageOrFrame, guest: Resident): Promise<void> {
  const checkboxes = await page.$$('input[type="checkbox"]:visible');
  const pageUrl = page.url().toLowerCase();
  const isAdobeCannesSignup = pageUrl.includes('canneslions.adobe.com');
  const skipMarketing = pageUrl.includes('events.canva.com');
  const adobeRoleLabels = [
    'creative professional',
    'content creator',
    'marketing professional',
    'press/media professional',
    'executive',
    'other',
  ];
  const adobeRoleChoice = getAdobeRoleChoice(guest);
  let adobeRolePicked = false;

  for (const checkbox of checkboxes) {
    try {
      if (!(await checkbox.isVisible())) continue;
      if (await checkbox.isChecked()) continue; // already ticked

      // Find the label text
      let label = '';
      const id = await checkbox.getAttribute('id');
      const name = await checkbox.getAttribute('name') || '';
      const value = await checkbox.getAttribute('value') || '';

      if (id) {
        const labelEl = await page.$(`label[for="${id}"]`);
        if (labelEl) label = (await labelEl.textContent() || '').trim();
      }
      if (!label) {
        label = await checkbox.evaluate((_el: Element) => {
          const parent = _el.closest('label');
          if (parent) return (parent.textContent || '').trim();
          const sibling = _el.nextElementSibling;
          return sibling ? (sibling.textContent || '').trim() : '';
        });
      }
      if (!label) label = (name + ' ' + value).toLowerCase().trim();

      const l = label.toLowerCase();

      if (isAdobeCannesSignup && adobeRoleLabels.some(role => l.includes(role))) {
        if (l.includes(adobeRoleChoice) && !adobeRolePicked) {
          await checkbox.click({ force: true });
          adobeRolePicked = true;
          console.log(`  [checkbox] ticked Adobe role: "${label.slice(0, 60)}"`);
        } else {
          console.log(`  [checkbox] skipped Adobe role: "${label.slice(0, 60)}"`);
        }
        continue;
      }

      // Always tick: consent, terms, GDPR, privacy (marketing/newsletter excluded for Canva)
      const alwaysTick = [
        'consent', 'agree', 'accept', 'terms', 'condition', 'privacy', 'gdpr',
        'event', 'cannes', 'attend', 'confirm', 'i am', 'i will', 'yes', 'interested',
        ...(skipMarketing ? [] : ['marketing', 'newsletter', 'update']),
      ];

      // Never tick: explicit opt-out / unsubscribe boxes + marketing for Canva
      const neverTick = [
        'opt out', 'do not contact', 'unsubscribe', 'remove me', 'do not send',
        ...(skipMarketing ? ['marketing', 'newsletter', 'update', 'promotional', 'communication', 'email.*from', 'hear.*from', 'latest.*news'] : []),
      ];

      const shouldSkip = neverTick.some(t => l.includes(t));
      if (shouldSkip) {
        console.log(`  [checkbox] skipped (opt-out): "${label}"`);
        continue;
      }

      // Tick everything that isn't an explicit opt-out — covers event interest, terms, consent, etc.
      {
        await checkbox.click({ force: true });
        console.log(`  [checkbox] ticked: "${label.slice(0, 60)}"`);
      }
    } catch { /* skip */ }
  }
}

function getAdobeRoleChoice(guest: Resident): string {
  const title = guest.jobTitle.toLowerCase();
  const company = guest.company.toLowerCase();

  if (/(founder|ceo|chief|president|vp|vice president|director|head|lead)/i.test(title)) {
    return 'executive';
  }

  if (/(creator|content|influencer|artist|musician|recording|studio)/i.test(title + ' ' + company)) {
    return 'content creator';
  }

  if (/(brand|marketing|partnership|business|talent|account|sales|advertising)/i.test(title)) {
    return 'marketing professional';
  }

  if (/(creative)/i.test(title)) {
    return 'creative professional';
  }

  if (/(media|press|editorial|journal)/i.test(title + ' ' + company)) {
    return 'press/media professional';
  }

  return 'creative professional';
}

// ─── DATE/TIME SLOT HANDLER ───────────────────────────────────────────────────

async function handleDateTimeSlots(page: PageOrFrame): Promise<void> {
  // Handle session/date picker cards (click-to-select style)
  const sessionCardSelectors = [
    '[class*="session"]:not(input):not(label)',
    '[class*="timeslot"]',
    '[class*="time-slot"]',
    '[class*="slot"]',
    '[data-slot]',
    '[data-session]',
  ];

  for (const sel of sessionCardSelectors) {
    try {
      const cards = await page.$$(sel);
      for (const card of cards) {
        if (await card.isVisible()) {
          // Check if it's selectable (not already selected)
          const isSelected = await card.evaluate((el: Element) =>
            el.classList.contains('selected') || el.classList.contains('active') ||
            el.getAttribute('aria-selected') === 'true'
          );
          if (!isSelected) {
            await card.click({ force: true });
            await page.waitForTimeout(300);
            console.log(`  [session] clicked session card`);
          }
        }
      }
    } catch { /* skip */ }
  }

  // Handle date/time dropdowns — select all sessions or most comprehensive option
  const dateSelects = await page.$$('select');
  for (const sel of dateSelects) {
    try {
      if (!(await sel.isVisible())) continue;
      const name = (await sel.getAttribute('name') || '').toLowerCase();
      const id = (await sel.getAttribute('id') || '').toLowerCase();

      if (!name.match(/date|time|session|slot|when/i) && !id.match(/date|time|session|slot|when/i)) continue;

      const options = await sel.$$eval('option', opts =>
        opts.map(o => ({ value: (o as any).value, text: ((o as any).textContent || '').trim().toLowerCase() }))
          .filter(o => o.value && o.value.trim() !== '')
      );
      if (!options.length) continue;

      // Prefer "all sessions", "full event", or first available
      const allOpt = options.find(o => o.text.includes('all') || o.text.includes('full') || o.text.includes('both'));
      const chosen = allOpt || options[0];
      await sel.selectOption(chosen.value);
      console.log(`  [date/time] selected: "${chosen.text}"`);
    } catch { /* skip */ }
  }
}

// ─── DROPDOWN HANDLER ─────────────────────────────────────────────────────────

async function handleDropdowns(page: PageOrFrame, guest: Resident): Promise<void> {
  const selects = await page.$$('select:visible');

  for (const sel of selects) {
    try {
      if (!(await sel.isVisible())) continue;

      const name = (await sel.getAttribute('name') || '').toLowerCase();
      const id = (await sel.getAttribute('id') || '').toLowerCase();
      const context = name + ' ' + id;

      // Already handled by date handler — skip
      if (/date|time|session|slot|when/.test(context)) continue;

      const currentValue = await sel.inputValue();
      if (currentValue) continue; // already has a selection

      const options = await sel.$$eval('option', opts =>
        opts.map(o => ({ value: (o as any).value, text: ((o as any).textContent || '').trim() }))
          .filter(o => o.value && o.value.trim() !== '')
      );
      if (!options.length) continue;

      // Determine which preference list to use
      let preferenceKey = 'industry';
      if (/size|employee|staff|headcount/.test(context)) preferenceKey = 'company_size';
      else if (/seniority|level|grade/.test(context)) preferenceKey = 'seniority';
      else if (/decision|budget|authority/.test(context)) preferenceKey = 'decision';
      else if (/hear|source|referr|know/.test(context)) preferenceKey = 'how_heard';
      else if (/attend|format|mode|type/.test(context)) preferenceKey = 'attendance_type';
      else if (/country|nation|region|location/.test(context)) {
        preferenceKey = guest.location.includes('USA') || guest.location.includes('New York') ? 'country_us' : 'country';
      }

      const preferred = DROPDOWN_PREFERENCES[preferenceKey] || DROPDOWN_PREFERENCES.industry;
      let chosen = options[0];
      for (const term of preferred) {
        const match = options.find(o => o.text.toLowerCase().includes(term) || o.value.toLowerCase().includes(term));
        if (match) { chosen = match; break; }
      }

      await sel.selectOption(chosen.value);
      console.log(`  [dropdown] "${context}": "${chosen.text}"`);
    } catch { /* skip */ }
  }
}

// ─── CONDITIONAL INPUT HANDLER ───────────────────────────────────────────────
// Runs AFTER radio buttons — catches text/email inputs revealed by radio selections
// e.g. "If yes, please specify *" fields that only appear once a radio is clicked.

async function fillConditionalInputs(page: PageOrFrame, guest: Resident): Promise<void> {
  // Selectors for all standard text/email/tel inputs
  const knownSelectors = [
    ...FIELD_SELECTORS.firstName,
    ...FIELD_SELECTORS.lastName,
    ...FIELD_SELECTORS.fullName,
    ...FIELD_SELECTORS.email,
    ...FIELD_SELECTORS.company,
    ...FIELD_SELECTORS.jobTitle,
    ...FIELD_SELECTORS.phone,
    ...FIELD_SELECTORS.linkedin,
    ...FIELD_SELECTORS.website,
  ];

  // Find all visible required text/email/url inputs
  const inputs = await page.$$('input[type="text"]:visible, input[type="email"]:visible, input[type="url"]:visible, input[type="tel"]:visible');

  for (const input of inputs) {
    try {
      if (!(await input.isVisible()) || !(await input.isEnabled())) continue;

      // Skip if already filled
      const currentValue = await input.inputValue();
      if (currentValue && currentValue.trim().length > 0) continue;

      // Skip if this is a known structured field (name, email, company, etc.)
      // that would already have been handled above
      const isKnownField = await input.evaluate((el: Element, selectors: string[]) => {
        return selectors.some(sel => {
          try { return el.matches(sel); } catch { return false; }
        });
      }, knownSelectors);
      if (isKnownField) continue;

      // Determine the label for this input
      let labelText = '';
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name') || '';
      const placeholder = await input.getAttribute('placeholder') || '';
      const ariaLabel = await input.getAttribute('aria-label') || '';

      if (id) {
        try {
          const labelEl = await page.$(`label[for="${id}"]`);
          if (labelEl) labelText = (await labelEl.textContent() || '').trim();
        } catch { /* ignore */ }
      }
      if (!labelText) {
        labelText = ariaLabel || placeholder;
      }
      if (!labelText) {
        // Check parent container for nearby label/heading
        labelText = await input.evaluate((_el: Element) => {
          const parent = _el.closest('div, section, fieldset, li');
          if (!parent) return '';
          const label = parent.querySelector('label, legend, h3, h4, h5, p, span');
          return label ? (label.textContent || '').trim() : '';
        });
      }
      if (!labelText) labelText = name;

      const label = labelText.toLowerCase();
      const fullName = `${guest.firstName} ${guest.lastName}`.trim();

      // Map label patterns to appropriate answers
      let answer = '';

      if (/specify|elaborate|detail|describe|explain/i.test(label)) {
        answer = `${guest.jobTitle} at ${guest.company}. Based in ${guest.location}, attending Cannes Lions 2026 to connect with creative and brand industry leaders.`;
      } else if (/company|organisation|employer/i.test(label)) {
        answer = guest.company;
      } else if (/title|role|position|job/i.test(label)) {
        answer = guest.jobTitle;
      } else if (/linkedin/i.test(label)) {
        if (!guest.linkedinUrl) continue;
        answer = guest.linkedinUrl;
      } else if (/name/i.test(label)) {
        answer = fullName;
      } else if (/city|location|based/i.test(label)) {
        answer = guest.location;
      } else if (/how.*hear|referr|source|find out/i.test(label)) {
        answer = 'Invitation from a colleague in the industry.';
      } else if (/interest|topic|focus|area/i.test(label)) {
        answer = 'Brand strategy, creative culture, AI in marketing, diversity in creative industries.';
      } else if (/diet|food|allergi/i.test(label)) {
        answer = 'No dietary requirements.';
      } else if (/access|special|requirement/i.test(label)) {
        answer = 'No specific requirements.';
      } else if (/message|comment|anything|note|additional/i.test(label)) {
        answer = 'Looking forward to connecting with the community at Cannes. Thank you for the invitation.';
      } else {
        // Generic fallback — use full name + context
        answer = `${fullName}, ${guest.jobTitle} at ${guest.company}.`;
      }

      await input.click({ force: true });
      await input.fill(answer);
      console.log(`  [conditional input] "${labelText || name || 'unknown'}": filled`);
    } catch { /* skip */ }
  }
}

// ─── MULTI-STEP NAVIGATION ────────────────────────────────────────────────────

async function isOnFinalPage(page: PageOrFrame): Promise<boolean> {
  for (const sel of FIELD_SELECTORS.submit) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible() && await btn.isEnabled()) return true;
    } catch { /* continue */ }
  }
  return false;
}

async function clickNext(page: PageOrFrame): Promise<boolean> {
  for (const sel of FIELD_SELECTORS.next) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible() && await btn.isEnabled()) {
        console.log(`  [nav] clicking Next/Continue`);
        await btn.click();
        await page.waitForTimeout(2000);
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}

// ─── ACTIVE FRAME DETECTION ──────────────────────────────────────────────────
// After clicking a CTA, the checkout form may load inside an iframe (e.g. Eventbrite widget).
// This returns the frame containing the active registration form, or falls back to the main page.

async function getRegistrationFrame(page: Page): Promise<PageOrFrame> {
  const frames = page.frames();
  // Prefer frames whose URL looks like a checkout or registration flow
  for (const frame of frames) {
    if (frame === page.mainFrame()) continue;
    try {
      const url = frame.url();
      if (/checkout|register|order|ticket|rsvp/i.test(url)) {
        const hasInput = await frame.$('input, button[type="submit"], button:has-text("Register"), button:has-text("Place")');
        if (hasInput) {
          console.log(`  [iframe] using checkout frame: ${url}`);
          return frame;
        }
      }
    } catch { /* ignore */ }
  }
  // Check all non-main frames for any interactive registration UI
  for (const frame of frames) {
    if (frame === page.mainFrame()) continue;
    try {
      const hasBtn = await frame.$('button:has-text("Register"), button:has-text("Place Order"), button:has-text("Place Free Order"), button[type="submit"]');
      if (hasBtn && await hasBtn.isVisible()) {
        console.log(`  [iframe] found interactive frame: ${frame.url()}`);
        return frame;
      }
    } catch { /* ignore */ }
  }
  return page;
}

// ─── FILL ONE PAGE OF FORM ────────────────────────────────────────────────────

async function fillFormPage(page: PageOrFrame, guest: Resident): Promise<void> {
  const fullName = `${guest.firstName} ${guest.lastName}`.trim();

  // ── Name fields
  const filledFirst = await fillByLabel(page, ['first name', 'given name', 'first'], guest.firstName, 'First Name');
  const filledLast = await fillByLabel(page, ['last name', 'surname', 'family name', 'last'], guest.lastName || guest.firstName, 'Last Name');

  if (!filledFirst && !filledLast) {
    const filledFull = await fillByLabel(page, ['full name', 'your name', 'name'], fullName, 'Full Name');
    if (!filledFull) {
      await findAndFill(page, FIELD_SELECTORS.firstName, guest.firstName, 'First Name');
      await findAndFill(page, FIELD_SELECTORS.lastName, guest.lastName || guest.firstName, 'Last Name');
    }
  } else {
    if (!filledFirst) await findAndFill(page, FIELD_SELECTORS.firstName, guest.firstName, 'First Name');
    if (!filledLast) await findAndFill(page, FIELD_SELECTORS.lastName, guest.lastName || guest.firstName, 'Last Name');
  }

  // ── Email
  const filledEmail = await fillByLabel(page, ['work email', 'business email', 'email address', 'email', 'e-mail'], guest.email, 'Email');
  if (!filledEmail) await findAndFill(page, FIELD_SELECTORS.email, guest.email, 'Email');
  await fillByLabel(page, ['personal email', 'alternate email'], guest.email, 'Personal Email');

  // ── Company
  const filledCompany = await fillByLabel(page, ['company', 'organisation', 'organization', 'employer', 'company name'], guest.company, 'Company');
  if (!filledCompany) await findAndFill(page, FIELD_SELECTORS.company, guest.company, 'Company');

  // ── Job title
  const filledTitle = await fillByLabel(page, ['job title', 'your title', 'title', 'role', 'position', 'job role'], guest.jobTitle, 'Job Title');
  if (!filledTitle) await findAndFill(page, FIELD_SELECTORS.jobTitle, guest.jobTitle, 'Job Title');

  // ── Phone (fallback to a plausible UK number if none on file)
  const phoneValue = guest.phone || '+44 7700 900000';
  const filledPhone = await fillByLabel(page, ['phone', 'telephone', 'mobile', 'phone number', 'contact number'], phoneValue, 'Phone');
  if (!filledPhone) await findAndFill(page, FIELD_SELECTORS.phone, phoneValue, 'Phone');

  // ── LinkedIn
  if (guest.linkedinUrl) {
    const filledLinkedIn = await fillByLabel(page, ['linkedin', 'linkedin url', 'linkedin profile', 'linkedin.com'], guest.linkedinUrl, 'LinkedIn');
    if (!filledLinkedIn) await findAndFill(page, FIELD_SELECTORS.linkedin, guest.linkedinUrl, 'LinkedIn');
  }

  // ── Website
  if (guest.website) {
    const filledWeb = await fillByLabel(page, ['website', 'company website', 'url', 'web address'], guest.website, 'Website');
    if (!filledWeb) await findAndFill(page, FIELD_SELECTORS.website, guest.website, 'Website');
  }

  // ── Location
  await fillByLabel(page, ['city', 'location', 'where are you based', 'country', 'region'], guest.location, 'Location');

  // ── Dropdowns
  await handleDropdowns(page, guest);

  // ── Date/time slots
  await handleDateTimeSlots(page);

  // ── Radio buttons first — so conditional fields become visible before we sweep
  await handleRadioButtons(page, guest);
  await page.waitForTimeout(600); // allow conditional fields to animate in

  // ── Event-specific custom controls
  await handleGenericLumaFields(page, guest);
  await handleInkwellLumaFields(page, guest);
  await handleCanvaEventFields(page, guest);

  // ── Conditional text inputs revealed by radio selections
  // e.g. "If yes, please specify *" fields that appear after clicking "yes"
  await fillConditionalInputs(page, guest);

  // ── Textareas (after radios so conditional textareas are also caught)
  await fillTextareas(page, guest);

  // ── Checkboxes
  await handleCheckboxes(page, guest);
}

// ─── REGISTER ONE GUEST ────────────────────────────────────────────────────────

async function registerGuest(
  page: Page,
  url: string,
  guest: Resident,
  index: number,
  total: number,
  interactive = false
): Promise<'success' | 'failed'> {
  const label = `${guest.firstName} ${guest.lastName}`.trim();
  console.log(`\n[${index + 1}/${total}] Registering ${label} <${guest.email}>`);

  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  try {
    const isCanva = url.toLowerCase().includes('events.canva.com');
    await page.goto(url, { waitUntil: isCanva ? 'networkidle' : 'domcontentloaded', timeout: 45000 });
    // Extra wait for JS-heavy pages to render their forms (Canva needs longer)
    await page.waitForTimeout(isCanva ? 6000 : 3000);
    if (isCanva) {
      // Wait for any visible interactive element as a signal the app has booted
      await page.waitForSelector('button, input, a[role="button"]', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }

    // Check for bot challenge on initial load
    if (interactive) await handleBotChallengeIfPresent(page, label);

    // Dismiss cookie/consent banners before anything else
    const cookieDismissSelectors = [
      'button:has-text("Accept all")',
      'button:has-text("Accept All")',
      'button:has-text("Accept cookies")',
      'button:has-text("I accept")',
      'button:has-text("I Agree")',
      'button:has-text("Agree")',
      'a:has-text("I Agree")',
      'a:has-text("Agree")',
      '#onetrust-accept-btn-handler',
      '.cc-accept',
      'button[id*="accept" i][class*="cookie" i]',
      '[class*="agree" i]',
      '[class*="accept" i][class*="btn" i]',
    ];
    for (const sel of cookieDismissSelectors) {
      try {
        const btn = await page.$(sel);
        if (btn && await btn.isVisible()) {
          await btn.click();
          console.log(`  Dismissed cookie banner`);
          await page.waitForTimeout(1000);
          break;
        }
      } catch { /* ignore */ }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${index + 1}-before.png`) });
    await openLumaRegistration(page);

    // Check for a registration-specific form (email input or named first/last name fields)
    // Intentionally excludes generic search bars and nav inputs
    const hasRegistrationForm = await page.$(
      'input[type="email"], input[name*="email" i], input[name*="first" i], input[name*="last" i], form input[type="text"]'
    );
    if (!hasRegistrationForm) {
      const ctaSelectors = [
        // Most specific / Eventbrite-first — buttons take priority over anchors to avoid nav links
        'button:has-text("Reserve a spot")',
        'button:has-text("Get tickets")',
        'button:has-text("Get Tickets")',
        'button:has-text("Register Now")',
        'button:has-text("REGISTER NOW")',
        'button:has-text("Register for free")',
        'button:has-text("Register for Free")',
        'button:has-text("Save my spot")',
        'button:has-text("Save My Spot")',
        'button:has-text("RSVP")',
        'button:has-text("Register")',
        'button:has-text("Sign up")',
        'button:has-text("Sign Up")',
        'button:has-text("Apply")',
        'button:has-text("Attend")',
        'button:has-text("Tickets")',
        'button:has-text("Join Mailing List")',
        'button:has-text("JOIN MAILING LIST")',
        'a:has-text("Join Mailing List")',
        'a:has-text("JOIN MAILING LIST")',
        'a:has-text("Join mailing list")',
        'button:has-text("Subscribe")',
        'a:has-text("Subscribe")',
        // Anchors last — limited to href-based ones to avoid nav/header text links
        'a[href*="checkout" i]', 'a[href*="register" i]',
        // Broad text anchors only as last resort
        'a:has-text("Register Now")', 'a:has-text("REGISTER NOW")',
      ];
      for (const sel of ctaSelectors) {
        try {
          const cta = await page.$(sel);
          if (cta && await cta.isVisible()) {
            console.log(`  Clicking CTA: ${sel}`);
            await cta.click();
            await page.waitForTimeout(3000);
            
            // Handle Eventbrite quantity selector if it appeared
            try {
              const quantitySelect = await page.$('select[name*="quantity" i], select[id*="quantity" i]');
              if (quantitySelect) {
                await quantitySelect.selectOption("1");
                console.log('  Selected quantity: 1');
                await page.waitForTimeout(500);
              } else {
                // Try to find a "+" button or a "1" option in a custom dropdown
                const plusBtn = await page.$('button[aria-label*="increase" i], button[class*="plus" i]');
                if (plusBtn) {
                  await plusBtn.click();
                  console.log('  Clicked plus button for quantity');
                  await page.waitForTimeout(500);
                }
              }
              
              // If we clicked Get Tickets and a "Checkout" or "Register" button appeared in a modal
              const checkoutBtn = await page.$('button:has-text("Checkout"), button:has-text("Register")');
              if (checkoutBtn && await checkoutBtn.isVisible()) {
                await checkoutBtn.click();
                console.log('  Clicked Checkout/Register after quantity');
                await page.waitForTimeout(3000);
              }
            } catch (qErr: any) {
              console.log(`  (Note: No quantity selector found or failed: ${qErr.message})`);
            }

            // Check for secondary CTAs that appear after the first click
            // e.g. Eventbrite "Register your interest" button
            const secondaryCtas = [
              'button:has-text("Register your interest")',
              'button:has-text("Register Interest")',
              'a:has-text("Register your interest")',
              'button:has-text("Continue to checkout")',
              'button:has-text("Checkout")',
              'button:has-text("Proceed to checkout")',
            ];
            for (const secondarySel of secondaryCtas) {
              try {
                const secondaryBtn = await page.$(secondarySel);
                if (secondaryBtn && await secondaryBtn.isVisible()) {
                  console.log(`  Clicking secondary CTA: ${secondarySel}`);
                  await secondaryBtn.click();
                  await page.waitForTimeout(3000);
                  break;
                }
              } catch { /* try next */ }
            }

            break;
          }
        } catch { /* try next */ }
      }
    }

    try { await page.waitForSelector('input', { timeout: 8000 }); } catch { /* continue */ }
    await page.waitForTimeout(1000);

    // Detect if the checkout form loaded inside an iframe (e.g. Eventbrite widget)
    const activePage = await getRegistrationFrame(page);

    // ── Multi-step form loop
    let pageNum = 1;
    const MAX_PAGES = 10;

    while (pageNum <= MAX_PAGES) {
      console.log(`  [page ${pageNum}] filling...`);
      await fillFormPage(activePage, guest);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${index + 1}-page${pageNum}-filled.png`) });

      // Check if we're on the final page (has submit button)
      const onFinalPage = await isOnFinalPage(activePage);

      if (onFinalPage) {
        // Submit
        let submitted = false;
        for (const selector of FIELD_SELECTORS.submit) {
          try {
            const btn = await activePage.$(selector);
            if (btn && await btn.isVisible() && await btn.isEnabled()) {
              console.log(`  [submit] clicking: ${selector}`);
              await btn.click();
              await page.waitForTimeout(4000);
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${index + 1}-submitted.png`) });
              submitted = true;
              break;
            }
          } catch { /* try next */ }
        }

        if (!submitted) {
          console.log(`  WARNING: Could not find submit button — pausing 5s for manual review`);
          await page.waitForTimeout(5000);
          return 'failed';
        }

        // ── Verify confirmation — check for error messages on the page
        const pageContent = await page.content();
        const errorPatterns = [
          /there were some errors/i,
          /please (fill|complete|correct)/i,
          /please enter/i,
          /invalid/i,
          /valid linkedin/i,
          /field.*required/i,
          /required field/i,
          /this field is required/i,
          /please select/i,
          /please provide/i,
        ];
        // Check page title / heading for success signal
        const pageTitle = await page.title();
        const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 1000));

        const hasError = errorPatterns.some(p => p.test(bodyText));
        const hasConfirmation = /thank you|you're (all set|registered|confirmed)|registration (confirmed|successful|complete|pending)|we('ve| have) received|request has been submitted/i.test(bodyText);

        if (hasError) {
          console.log(`  ⚠️  Submit error detected on page — registration likely failed`);
          console.log(`  Page snippet: ${bodyText.slice(0, 300)}`);
          return 'failed';
        }

        if (hasConfirmation) {
          console.log(`  ✅ Confirmation detected: "${pageTitle}"`);
        } else {
          console.log(`  ⚠️  No clear confirmation detected — check screenshot`);
        }

        break;
      }

      // Not on final page — try to go to next step
      const navigated = await clickNext(activePage);
      if (!navigated) {
        // No path forward means we never reached a submittable state.
        console.log(`  No Next or Submit found on page ${pageNum} — cannot complete registration`);
        return 'failed';
      }
      pageNum++;
    }

    console.log(`  Done for ${label}`);
    return 'success';

  } catch (err: any) {
    console.error(`  FAILED for ${label}: ${err.message}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${index + 1}-error.png`) }).catch(() => {});
    return 'failed';
  }
}

// ─── UPDATE REGISTRATION LOG ───────────────────────────────────────────────────

function updateRegistrationLog(eventName: string, eventUrl: string, guestName: string, status: 'success' | 'failed'): void {
  try {
    const raw = fs.readFileSync(REGISTRATIONS_LOG, 'utf-8');
    const log = JSON.parse(raw) as { events: any[] };

    let event = log.events.find((e: any) => e.eventUrl === eventUrl);
    if (!event) {
      event = { eventName, eventUrl, addedDate: new Date().toISOString().slice(0, 10), registrations: {} };
      log.events.push(event);
    }

    event.registrations[guestName] = { status, date: new Date().toISOString().slice(0, 10) };
    fs.writeFileSync(REGISTRATIONS_LOG, JSON.stringify(log, null, 2));
  } catch (err: any) {
    console.warn(`  Could not update registration log: ${err.message}`);
  }
}

// ─── PROGRAMMATIC EXPORT ───────────────────────────────────────────────────────

export async function registerAllResidents(
  url: string,
  eventName: string,
  residents: Resident[] = RESIDENTS
): Promise<{ name: string; status: string }[]> {
  const session = await createRegistrarSession();
  const page = session.page;
  const results: { name: string; status: string }[] = [];

  for (let i = 0; i < residents.length; i++) {
    const guest = residents[i];
    const status = await registerGuest(page, url, guest, i, residents.length);
    const guestName = `${guest.firstName} ${guest.lastName}`.trim();
    results.push({ name: guestName, status });
    updateRegistrationLog(eventName, url, guestName, status);

    if (i < residents.length - 1) await page.waitForTimeout(2000);
  }

  await session.context.close();
  if (session.browser) await session.browser.close();
  return results;
}

// ─── MAIN (CLI) ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find(a => a.startsWith('--url='))?.replace('--url=', '') ||
                 args[args.indexOf('--url') + 1];
  const eventNameFlagIndex = args.indexOf('--event');
  const eventNameArg = args.find(a => a.startsWith('--event='))?.replace('--event=', '') ||
                       (eventNameFlagIndex >= 0 ? args[eventNameFlagIndex + 1] : undefined) ||
                       urlArg ||
                       'Unknown Event';

  // --skip "First Last" to exclude specific residents (comma-separated or repeated flags)
  const skipNames: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skip' && args[i + 1]) {
      skipNames.push(...args[i + 1].split(',').map(s => s.trim().toLowerCase()));
    } else if (args[i].startsWith('--skip=')) {
      skipNames.push(...args[i].replace('--skip=', '').split(',').map(s => s.trim().toLowerCase()));
    }
  }

  if (!urlArg) {
    console.error('Usage: npx ts-node --project tsconfig.json src/tools/event-registrar.ts --url "https://..." [--skip "First Last"]');
    process.exit(1);
  }

  const residentsToRegister = skipNames.length > 0
    ? RESIDENTS.filter(r => !skipNames.includes(`${r.firstName} ${r.lastName}`.trim().toLowerCase()))
    : RESIDENTS;

  if (skipNames.length > 0) {
    console.log(`Skipping: ${skipNames.join(', ')}`);
  }

  console.log(`\nIndvstry Power House — Event Registrar`);
  console.log(`URL: ${urlArg}`);
  console.log(`Registering ${residentsToRegister.length} residents\n`);

  // interactive mode when running with a visible browser (HEADLESS=false or Chrome profile)
  const interactive = process.env.HEADLESS === 'false' || !!(process.env.CHROME_USER_DATA && process.env.CHROME_CHANNEL);

  const session = await createRegistrarSession();
  const page = session.page;
  const results: { name: string; status: string }[] = [];

  for (let i = 0; i < residentsToRegister.length; i++) {
    const guest = residentsToRegister[i];
    const status = await registerGuest(page, urlArg, guest, i, residentsToRegister.length, interactive);
    const guestName = `${guest.firstName} ${guest.lastName}`.trim();
    results.push({ name: guestName, status });
    updateRegistrationLog(eventNameArg, urlArg, guestName, status);

    if (i < residentsToRegister.length - 1) await page.waitForTimeout(2000);
  }

  console.log('\n─── RESULTS ─────────────────────────────────────');
  for (const r of results) {
    console.log(`${r.status === 'success' ? '✅' : '❌'} ${r.name} — ${r.status}`);
  }

  console.log('\nBrowser open for 30s — review then close.');
  await page.waitForTimeout(30000);
  await session.context.close();
  if (session.browser) await session.browser.close();
}

if (require.main === module) {
  main().catch(err => { console.error('Fatal:', err); process.exit(1); });
}
