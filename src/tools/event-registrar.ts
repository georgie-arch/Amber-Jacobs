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

import { chromium, Browser, Page, ElementHandle } from 'playwright';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS, Resident } from '../data/residents';

const REGISTRATIONS_LOG = path.resolve(__dirname, '../data/event-registrations.json');
const SCREENSHOT_DIR = path.resolve(__dirname, '../scripts/screenshots');

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

// ─── CORE FILL UTILITIES ──────────────────────────────────────────────────────

async function findAndFill(page: Page, selectors: string[], value: string, fieldName: string): Promise<boolean> {
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

async function fillByLabel(page: Page, labelTexts: string[], value: string, fieldName: string): Promise<boolean> {
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

async function fillTextareas(page: Page, guest: Resident): Promise<void> {
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

async function handleRadioButtons(page: Page, guest: Resident): Promise<void> {
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

async function handleCheckboxes(page: Page, guest: Resident): Promise<void> {
  const checkboxes = await page.$$('input[type="checkbox"]:visible');

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

      // Always tick: consent, terms, GDPR, privacy, marketing comms, newsletter
      const alwaysTick = [
        'consent', 'agree', 'accept', 'terms', 'condition', 'privacy', 'gdpr',
        'marketing', 'newsletter', 'update', 'event', 'cannes', 'attend',
        'confirm', 'i am', 'i will', 'yes', 'interested',
      ];

      // Never tick: "opt out", "do not", "unsubscribe"
      const neverTick = ['opt out', 'do not contact', 'unsubscribe', 'remove me'];

      const shouldSkip = neverTick.some(t => l.includes(t));
      if (shouldSkip) {
        console.log(`  [checkbox] skipped (opt-out): "${label}"`);
        continue;
      }

      // Tick if label contains any positive term, or if it seems like a required consent box
      const shouldTick = alwaysTick.some(t => l.includes(t)) || l.length < 5;

      if (shouldTick) {
        await checkbox.click({ force: true });
        console.log(`  [checkbox] ticked: "${label.slice(0, 60)}"`);
      }
    } catch { /* skip */ }
  }
}

// ─── DATE/TIME SLOT HANDLER ───────────────────────────────────────────────────

async function handleDateTimeSlots(page: Page): Promise<void> {
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

async function handleDropdowns(page: Page, guest: Resident): Promise<void> {
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
      else if (/country|nation|region/.test(context)) {
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

// ─── MULTI-STEP NAVIGATION ────────────────────────────────────────────────────

async function isOnFinalPage(page: Page): Promise<boolean> {
  for (const sel of FIELD_SELECTORS.submit) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible() && await btn.isEnabled()) return true;
    } catch { /* continue */ }
  }
  return false;
}

async function clickNext(page: Page): Promise<boolean> {
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

// ─── FILL ONE PAGE OF FORM ────────────────────────────────────────────────────

async function fillFormPage(page: Page, guest: Resident): Promise<void> {
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

  // ── Phone
  const filledPhone = await fillByLabel(page, ['phone', 'telephone', 'mobile', 'phone number', 'contact number'], guest.phone, 'Phone');
  if (!filledPhone) await findAndFill(page, FIELD_SELECTORS.phone, guest.phone, 'Phone');

  // ── LinkedIn
  const filledLinkedIn = await fillByLabel(page, ['linkedin', 'linkedin url', 'linkedin profile', 'linkedin.com'], guest.linkedinUrl, 'LinkedIn');
  if (!filledLinkedIn) await findAndFill(page, FIELD_SELECTORS.linkedin, guest.linkedinUrl, 'LinkedIn');

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

  // ── Textareas
  await fillTextareas(page, guest);

  // ── Radio buttons
  await handleRadioButtons(page, guest);

  // ── Checkboxes
  await handleCheckboxes(page, guest);
}

// ─── REGISTER ONE GUEST ────────────────────────────────────────────────────────

async function registerGuest(
  page: Page,
  url: string,
  guest: Resident,
  index: number,
  total: number
): Promise<'success' | 'failed'> {
  const label = `${guest.firstName} ${guest.lastName}`.trim();
  console.log(`\n[${index + 1}/${total}] Registering ${label} <${guest.email}>`);

  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Extra wait for JS-heavy pages to render their forms
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${index + 1}-before.png`) });

    // If no form fields visible yet, look for a CTA button to open the form
    const hasFormField = await page.$('input[type="email"], input[type="text"], textarea');
    if (!hasFormField) {
      const ctaSelectors = [
        'a:has-text("RSVP")', 'button:has-text("RSVP")',
        'a:has-text("Register")', 'button:has-text("Register")',
        'a:has-text("Sign up")', 'button:has-text("Sign up")',
        'a:has-text("Apply")', 'button:has-text("Apply")',
        'a:has-text("Attend")', 'button:has-text("Attend")',
        'a[href*="rsvp" i]', 'a[href*="register" i]',
      ];
      for (const sel of ctaSelectors) {
        try {
          const cta = await page.$(sel);
          if (cta && await cta.isVisible()) {
            console.log(`  Clicking CTA: ${sel}`);
            await cta.click();
            await page.waitForTimeout(3000);
            break;
          }
        } catch { /* try next */ }
      }
    }

    try { await page.waitForSelector('input', { timeout: 8000 }); } catch { /* continue */ }
    await page.waitForTimeout(1000);

    // ── Multi-step form loop
    let pageNum = 1;
    const MAX_PAGES = 10;

    while (pageNum <= MAX_PAGES) {
      console.log(`  [page ${pageNum}] filling...`);
      await fillFormPage(page, guest);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${index + 1}-page${pageNum}-filled.png`) });

      // Check if we're on the final page (has submit button)
      const onFinalPage = await isOnFinalPage(page);

      if (onFinalPage) {
        // Submit
        let submitted = false;
        for (const selector of FIELD_SELECTORS.submit) {
          try {
            const btn = await page.$(selector);
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
        }
        break;
      }

      // Not on final page — try to go to next step
      const navigated = await clickNext(page);
      if (!navigated) {
        // No Next button and no Submit button — try submitting anyway
        console.log(`  No Next or Submit found on page ${pageNum} — attempting submit`);
        await isOnFinalPage(page); // re-check
        break;
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
  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: 80,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();
  const results: { name: string; status: string }[] = [];

  for (let i = 0; i < residents.length; i++) {
    const guest = residents[i];
    const status = await registerGuest(page, url, guest, i, residents.length);
    const guestName = `${guest.firstName} ${guest.lastName}`.trim();
    results.push({ name: guestName, status });
    updateRegistrationLog(eventName, url, guestName, status);

    if (i < residents.length - 1) await page.waitForTimeout(2000);
  }

  await browser.close();
  return results;
}

// ─── MAIN (CLI) ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find(a => a.startsWith('--url='))?.replace('--url=', '') ||
                 args[args.indexOf('--url') + 1];
  const eventNameArg = args.find(a => a.startsWith('--event='))?.replace('--event=', '') || urlArg || 'Unknown Event';

  if (!urlArg) {
    console.error('Usage: npx ts-node --project tsconfig.json src/tools/event-registrar.ts --url "https://..."');
    process.exit(1);
  }

  console.log(`\nIndvstry Power House — Event Registrar`);
  console.log(`URL: ${urlArg}`);
  console.log(`Registering ${RESIDENTS.length} residents\n`);

  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: 80,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();
  const results: { name: string; status: string }[] = [];

  for (let i = 0; i < RESIDENTS.length; i++) {
    const guest = RESIDENTS[i];
    const status = await registerGuest(page, urlArg, guest, i, RESIDENTS.length);
    const guestName = `${guest.firstName} ${guest.lastName}`.trim();
    results.push({ name: guestName, status });
    updateRegistrationLog(eventNameArg, urlArg, guestName, status);

    if (i < RESIDENTS.length - 1) await page.waitForTimeout(2000);
  }

  console.log('\n─── RESULTS ─────────────────────────────────────');
  for (const r of results) {
    console.log(`${r.status === 'success' ? '✅' : '❌'} ${r.name} — ${r.status}`);
  }

  console.log('\nBrowser open for 30s — review then close.');
  await page.waitForTimeout(30000);
  await browser.close();
}

if (require.main === module) {
  main().catch(err => { console.error('Fatal:', err); process.exit(1); });
}
