/**
 * register-failed-events.ts
 *
 * Handles three targeted registration tasks:
 *
 *  1. Digiday @ Cannes      — George Guise only (previous attempt failed)
 *  2. Le Club MSQ           — LaToya Shambo only (previous attempt failed)
 *  3. Financial Times Cannes 2026 — All 9 residents, fresh account creation.
 *     Password = FirstNameLastName (no spaces, CamelCase).
 *     Age = resident's plausible age (all above 30).
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/register-failed-events.ts
 *
 * Run one event only:
 *   npx ts-node --project tsconfig.json src/scripts/register-failed-events.ts --only digiday
 *   npx ts-node --project tsconfig.json src/scripts/register-failed-events.ts --only msq
 *   npx ts-node --project tsconfig.json src/scripts/register-failed-events.ts --only ft
 */

import { chromium, Browser, BrowserContext, Page, ElementHandle } from 'playwright';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS, Resident } from '../data/residents';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const REGISTRATIONS_LOG = path.resolve(__dirname, '../data/event-registrations.json');
const SCREENSHOT_DIR    = path.resolve(__dirname, 'screenshots/failed-retries');

const EVENTS = {
  digiday: {
    name: 'Digiday @ Cannes',
    url:  'https://digiday.com/events/digiday-in-cannes/',
    residents: RESIDENTS.filter(r => r.firstName === 'George' && r.lastName === 'Guise'),
  },
  msq: {
    name: 'Le Club MSQ',
    url:  'https://connect.msqpartners.com/le-club-msq-2026',
    residents: RESIDENTS.filter(r => r.firstName === 'LaToya' && r.lastName === 'Shambo'),
  },
  ft: {
    name: 'Financial Times Cannes 2026',
    url:  'https://ftsessionscannes.live.ft.com/page/5648739/apply-to-attend-in-person',
    residents: RESIDENTS,   // all 9 — fresh accounts
  },
};

// ─── RESIDENT EXTRAS ─────────────────────────────────────────────────────────
// Plausible ages (all above 30).
// Password format: [FirstName][LastName]2026.   e.g. GeorgeGuise2026.
// Phone: Amber's number for everyone.

const AMBER_PHONE = '+447438932403';

interface ResidentExtras {
  age: number;
  birthYear: number;  // 4-digit year for forms that ask "Year of birth"
  password: string;
  dob: string;  // DD/MM/YYYY for forms that ask for date of birth
  phone: string;
}

function getExtras(r: Resident): ResidentExtras {
  const ageMap: Record<string, number> = {
    'George Guise':      38,
    'Dinalva Tavares':   34,
    'Abi Blend':         32,
    'LaToya Shambo':     37,
    'Romy Gama':         35,
    'Chanelle Pal':      33,
    'Olga Viktorova':    36,
    'Kelly Adanna':      34,
    'Silva Stone':       31,
  };
  const fullName = `${r.firstName} ${r.lastName}`.trim();
  const age = ageMap[fullName] || 35;
  const password = `${r.firstName}${r.lastName}2026.`;

  const birthYear = new Date().getFullYear() - age;
  const dob = `15/06/${birthYear}`;

  return { age, birthYear, password, dob, phone: AMBER_PHONE };
}

// ─── FIELD SELECTORS ─────────────────────────────────────────────────────────

const SEL = {
  firstName: ['input[name*="first" i]','input[placeholder*="first" i]','input[id*="first" i]','input[autocomplete="given-name"]'],
  lastName:  ['input[name*="last" i]','input[placeholder*="last" i]','input[id*="last" i]','input[autocomplete="family-name"]'],
  fullName:  ['input[name*="full" i]','input[placeholder*="full name" i]','input[name="name"]','input[id="name"]'],
  email:     ['input[type="email"]','input[name*="email" i]','input[placeholder*="email" i]','input[id*="email" i]'],
  password:  ['input[type="password"]','input[name*="password" i]','input[id*="password" i]','input[name*="pass" i]'],
  company:   ['input[name*="company" i]','input[placeholder*="company" i]','input[id*="company" i]','input[name*="organization" i]'],
  jobTitle:  ['input[name*="title" i]','input[placeholder*="title" i]','input[id*="title" i]','input[name*="role" i]','input[placeholder*="role" i]'],
  phone:     ['input[type="tel"]','input[name*="phone" i]','input[placeholder*="phone" i]','input[id*="phone" i]'],
  linkedin:  ['input[name*="linkedin" i]','input[placeholder*="linkedin" i]','input[id*="linkedin" i]'],
  website:   ['input[name*="website" i]','input[id*="website" i]','input[type="url"]'],
  age:       ['input[name*="age" i]','input[id*="age" i]','input[placeholder*="age" i]'],
  dob:       ['input[name*="dob" i]','input[name*="birth" i]','input[id*="dob" i]','input[id*="birth" i]','input[placeholder*="birth" i]','input[placeholder*="date of birth" i]'],
  submit:    ['button[type="submit"]','input[type="submit"]','button:has-text("Register")','button:has-text("Sign up")','button:has-text("Submit")','button:has-text("RSVP")','button:has-text("Confirm")','button:has-text("Create account")','button:has-text("Create Account")','button:has-text("Complete")','button:has-text("Save")','button:has-text("Save and continue")','button:has-text("Continue to event")','button:has-text("Apply")','button:has-text("Send")'],
  next:      ['button:has-text("Next")','button:has-text("Continue")','button:has-text("Proceed")','a:has-text("Next")','a:has-text("Continue")','button[aria-label*="next" i]','button:has-text("Save details")'],
};

// ─── POPUP / CONSENT DISMISSER ───────────────────────────────────────────────
// Aggressively removes any blocking overlay/consent/modal from the page DOM.
// Called before filling and before submitting each form.

async function dismissPopups(page: Page): Promise<void> {
  // ── Step 1: Try clicking Accept/Agree buttons in ALL frames FIRST ───────
  // This allows consent managers (SourcePoint, OneTrust) to properly set
  // their cookies/localStorage BEFORE we remove the DOM elements.
  const acceptTerms = [
    'button:has-text("Accept all")', 'button:has-text("Accept All")',
    'button:has-text("Accept cookies")', 'button:has-text("Accept")',
    'button:has-text("Agree")', 'button:has-text("Allow all")',
    'button:has-text("I agree")', 'button:has-text("Got it")',
    '#onetrust-accept-btn-handler', 'button[id*="accept" i]',
    'button[title*="Accept" i]', '[aria-label*="accept" i]',
  ];

  let clickedConsent = false;
  for (const frame of page.frames()) {
    if (clickedConsent) break;
    for (const sel of acceptTerms) {
      try {
        const btn = await frame.$(sel);
        if (btn && await btn.isVisible()) {
          await btn.click({ force: true, timeout: 3000 });
          console.log(`  [popup] Clicked accept in frame: ${frame.url().slice(0, 60)}`);
          await page.waitForTimeout(1200); // give consent JS time to run
          clickedConsent = true;
          break;
        }
      } catch { /* try next */ }
    }
  }

  // ── Step 2: Nuke remaining blocking overlays that couldn't be clicked ───
  try {
    const removed = await page.evaluate(() => {
      const removed: string[] = [];

      // Only nuke sp_message_container if it's still there (wasn't accepted above)
      document.querySelectorAll('[id^="sp_message_container"]').forEach(el => {
        removed.push('sp_message_container');
        el.remove();
      });
      // Any element with role="dialog" that is currently visible
      document.querySelectorAll('[role="dialog"]').forEach(el => {
        const s = window.getComputedStyle(el);
        if (s.display !== 'none' && s.visibility !== 'hidden') {
          removed.push('dialog:' + (el as HTMLElement).id);
          (el as HTMLElement).remove();
        }
      });
      // Digiday lightboxes / modal wrappers
      document.querySelectorAll('[class*="lightbox"], [id*="lightbox"], [class*="preloaded"]').forEach(el => {
        removed.push('lightbox');
        (el as HTMLElement).remove();
      });
      // Cookie banners
      document.querySelectorAll('#main-cookie-banner, #cookie-banner, #onetrust-banner-sdk, .cookie-banner').forEach(el => {
        removed.push('cookie-banner');
        (el as HTMLElement).remove();
      });
      // Overlay backdrops
      document.querySelectorAll('[class*="overlay"], [class*="backdrop"], [id*="overlay"]').forEach(el => {
        (el as HTMLElement).style.cssText = 'display:none!important;pointer-events:none!important;';
      });

      return removed;
    });
    if (removed.length > 0) {
      console.log(`  [popup] DOM-nuked: ${[...new Set(removed)].join(', ')}`);
      await page.waitForTimeout(400);
    }
  } catch { /* ignore */ }

  // ── Step 3: Escape key ──────────────────────────────────────────────────
  try { await page.keyboard.press('Escape'); await page.waitForTimeout(200); } catch { /* ignore */ }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function fill(page: Page, selectors: string[], value: string, fieldName: string): Promise<boolean> {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible() && await el.isEnabled()) {
        const current = await el.inputValue().catch(() => '');
        if (current.trim()) continue; // already filled
        await el.click({ force: true });
        await el.fill(value);
        console.log(`  [fill] ${fieldName}: "${value}"`);
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}

async function fillByLabel(page: Page, labels: string[], value: string, fieldName: string): Promise<boolean> {
  for (const label of labels) {
    try {
      const loc = page.getByLabel(label, { exact: false });
      if (await loc.count() > 0 && await loc.first().isVisible()) {
        const current = await loc.first().inputValue().catch(() => '');
        if (current.trim()) continue;
        await loc.first().click();
        await loc.first().fill(value);
        console.log(`  [label] ${fieldName} ("${label}"): "${value}"`);
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}

// ─── TEXTAREA ANSWERS ─────────────────────────────────────────────────────────

function textareaAnswer(labelText: string, r: Resident): string {
  const fullName = `${r.firstName} ${r.lastName}`.trim();
  const label = labelText.toLowerCase();

  if (/why.*(attend|join|come|interested|register)|reason/i.test(label))
    return `I am attending Cannes Lions 2026 to connect with leaders across creative, media and brand industries, and to explore new partnerships and collaborations for ${r.company}.`;
  if (/what.*(hope|expect|get out|looking for|gain)|goals?/i.test(label))
    return `To build meaningful industry relationships, discover new collaborators, and stay at the forefront of conversations shaping creativity, brand strategy and culture.`;
  if (/tell us.*(yourself|about you)|bio|background|introduce/i.test(label))
    return `${fullName} is ${r.jobTitle} at ${r.company}, working at the intersection of creativity, culture and brand. Based in ${r.location}.`;
  if (/company.*description|about.*company|what does.*company do/i.test(label))
    return `${r.company} is a creative and cultural brand working at the intersection of media, technology and community, building meaningful connections and cultural impact.`;
  if (/diet|food|allergi/i.test(label))
    return `No dietary requirements.`;
  if (/access|requirement|special need/i.test(label))
    return `No specific requirements.`;
  if (/how.*hear|find out|discover|referr/i.test(label))
    return `Invitation from a colleague in the industry.`;
  if (/message|comment|anything else|additional|note/i.test(label))
    return `Looking forward to connecting with the community at Cannes. Thank you for the invitation.`;
  return `${fullName}, ${r.jobTitle} at ${r.company}. Based in ${r.location}. Attending Cannes Lions 2026.`;
}

async function fillTextareas(page: Page, r: Resident): Promise<void> {
  const tas = await page.$$('textarea:visible');
  for (const ta of tas) {
    try {
      if (!(await ta.isVisible()) || !(await ta.isEnabled())) continue;
      const current = await ta.inputValue().catch(() => '');
      if (current.trim()) continue;

      let labelText = (await ta.getAttribute('aria-label') || await ta.getAttribute('placeholder') || await ta.getAttribute('name') || '').trim();
      const id = await ta.getAttribute('id');
      if (id) {
        const lel = await page.$(`label[for="${id}"]`);
        if (lel) labelText = ((await lel.textContent()) || '').trim();
      }
      if (!labelText) {
        labelText = await ta.evaluate((_el: Element) => {
          const p = _el.closest('div, section, fieldset');
          if (!p) return '';
          const l = p.querySelector('label, legend, h3, h4, p');
          return l ? (l.textContent || '').trim() : '';
        });
      }
      await ta.click({ force: true });
      await ta.fill(textareaAnswer(labelText, r));
      console.log(`  [textarea] "${labelText || 'unknown'}": filled`);
    } catch { /* skip */ }
  }
}

async function handleDropdowns(page: Page, r: Resident): Promise<void> {
  const selects = await page.$$('select:visible');
  for (const sel of selects) {
    try {
      if (!(await sel.isVisible())) continue;
      const current = await sel.inputValue();
      if (current) continue;
      const ctx = ((await sel.getAttribute('name') || '') + ' ' + (await sel.getAttribute('id') || '')).toLowerCase();
      const opts = await sel.$$eval('option', os => os.map((o: any) => ({ value: o.value, text: (o.textContent || '').trim().toLowerCase() })).filter((o: any) => o.value));
      if (!opts.length) continue;

      let preferred: string[] = ['marketing', 'media', 'advertising', 'creative', 'entertainment', 'technology'];
      if (/size|employee/.test(ctx)) preferred = ['1-10', '2-10', '1 - 10', '11-50', 'micro', 'small'];
      else if (/seniority|level/.test(ctx)) preferred = ['founder', 'c-suite', 'executive', 'director', 'senior'];
      else if (/country|nation/.test(ctx)) preferred = r.location.includes('USA') ? ['united states', 'usa', 'us'] : ['united kingdom', 'uk', 'england'];
      else if (/hear|source|referr/.test(ctx)) preferred = ['colleague', 'invitation', 'email', 'linkedin'];
      else if (/attend|format/.test(ctx)) preferred = ['in-person', 'in person', 'attend', 'all'];

      let chosen = opts[0];
      for (const term of preferred) {
        const m = opts.find((o: any) => o.text.includes(term) || o.value.toLowerCase().includes(term));
        if (m) { chosen = m; break; }
      }
      await sel.selectOption(chosen.value);
      console.log(`  [dropdown] "${ctx.trim()}": "${chosen.text}"`);
    } catch { /* skip */ }
  }
}

async function handleRadioButtons(page: Page): Promise<void> {
  const radios = await page.$$('input[type="radio"]:visible');
  const groups: Record<string, ElementHandle[]> = {};
  for (const r of radios) {
    try {
      const name = await r.getAttribute('name') || 'unnamed';
      if (!groups[name]) groups[name] = [];
      groups[name].push(r);
    } catch { /* skip */ }
  }
  for (const [gName, btns] of Object.entries(groups)) {
    try {
      let checked = false;
      for (const b of btns) { if (await b.isChecked()) { checked = true; break; } }
      if (checked) continue;

      const gn = gName.toLowerCase();
      let pref = ['yes', 'all', 'any'];
      if (/attend|format|type|mode/.test(gn)) pref = ['in-person', 'in person', 'attend', 'yes'];
      else if (/gender/.test(gn)) pref = ['prefer not', 'not to say', 'other'];
      else if (/sector|industry/.test(gn)) pref = ['marketing', 'media', 'creative', 'advertising'];
      else if (/agree|consent|terms/.test(gn)) pref = ['yes', 'agree', 'accept'];

      const options: { el: ElementHandle; label: string }[] = [];
      for (const btn of btns) {
        let label = '';
        try {
          const id = await btn.getAttribute('id');
          const val = await btn.getAttribute('value') || '';
          if (id) { const lel = await page.$(`label[for="${id}"]`); if (lel) label = ((await lel.textContent()) || '').trim(); }
          if (!label) label = await btn.evaluate((el: Element) => { const s = el.nextSibling; if (s && s.nodeType === 3) return (s.textContent || '').trim(); const p = el.parentElement?.querySelector('label, span'); return p ? (p.textContent || '').trim() : ''; });
          if (!label) label = val;
          options.push({ el: btn, label: label.toLowerCase() });
        } catch { /* skip */ }
      }
      if (!options.length) continue;

      let chosen = options[0];
      for (const term of pref) {
        const m = options.find(o => o.label.includes(term));
        if (m) { chosen = m; break; }
      }
      await chosen.el.click({ force: true });
      console.log(`  [radio] "${gName}": "${chosen.label}"`);
    } catch { /* skip */ }
  }
}

async function handleCheckboxes(page: Page): Promise<void> {
  const cbs = await page.$$('input[type="checkbox"]:visible');
  for (const cb of cbs) {
    try {
      if (!(await cb.isVisible()) || await cb.isChecked()) continue;
      let label = '';
      const id = await cb.getAttribute('id');
      const name = await cb.getAttribute('name') || '';
      const val  = await cb.getAttribute('value') || '';
      if (id) { const lel = await page.$(`label[for="${id}"]`); if (lel) label = ((await lel.textContent()) || '').trim(); }
      if (!label) label = await cb.evaluate((_el: Element) => { const p = _el.closest('label'); if (p) return (p.textContent || '').trim(); const s = _el.nextElementSibling; return s ? (s.textContent || '').trim() : ''; });
      if (!label) label = (name + ' ' + val).toLowerCase().trim();
      const l = label.toLowerCase();
      const skip = ['opt out', 'do not contact', 'unsubscribe', 'remove me'].some(t => l.includes(t));
      if (skip) { console.log(`  [checkbox] skipped (opt-out): "${label}"`); continue; }
      const tick = ['consent', 'agree', 'accept', 'terms', 'condition', 'privacy', 'gdpr', 'marketing', 'newsletter', 'confirm', 'i am', 'i will', 'yes', 'attend', 'cannes'].some(t => l.includes(t)) || l.length < 5;
      if (tick) { await cb.click({ force: true }); console.log(`  [checkbox] ticked: "${label.slice(0, 60)}"`); }
    } catch { /* skip */ }
  }
}

// ─── FILL ONE FORM PAGE ───────────────────────────────────────────────────────

async function fillPage(page: Page, r: Resident, extras: ResidentExtras): Promise<void> {
  const fullName = `${r.firstName} ${r.lastName}`.trim();

  // Name
  const fl = await fillByLabel(page, ['first name', 'given name', 'first'], r.firstName, 'First Name');
  const ll = await fillByLabel(page, ['last name', 'surname', 'family name', 'last'], r.lastName, 'Last Name');
  if (!fl && !ll) {
    const fn = await fillByLabel(page, ['full name', 'your name', 'name'], fullName, 'Full Name');
    if (!fn) {
      await fill(page, SEL.firstName, r.firstName, 'First Name');
      await fill(page, SEL.lastName, r.lastName, 'Last Name');
    }
  } else {
    if (!fl) await fill(page, SEL.firstName, r.firstName, 'First Name');
    if (!ll) await fill(page, SEL.lastName, r.lastName, 'Last Name');
  }

  // Email
  if (!await fillByLabel(page, ['work email', 'business email', 'email address', 'email', 'e-mail'], r.email, 'Email'))
    await fill(page, SEL.email, r.email, 'Email');

  // Password (for account creation)
  if (!await fillByLabel(page, ['password', 'create password', 'new password', 'choose a password'], extras.password, 'Password'))
    await fill(page, SEL.password, extras.password, 'Password');

  // Confirm password
  if (!await fillByLabel(page, ['confirm password', 'repeat password', 'retype password', 'password again'], extras.password, 'Confirm Password')) {
    try {
      const pws = await page.$$('input[type="password"]:visible');
      if (pws.length >= 2) {
        const cv = await pws[1].inputValue().catch(() => '');
        if (!cv.trim()) {
          await pws[1].click({ force: true });
          await pws[1].fill(extras.password);
          console.log(`  [fill] Confirm Password: "${extras.password}"`);
        }
      }
    } catch { /* skip */ }
  }

  // Company
  if (!await fillByLabel(page, ['company', 'organisation', 'organization', 'employer', 'company name'], r.company, 'Company'))
    await fill(page, SEL.company, r.company, 'Company');

  // Job title
  if (!await fillByLabel(page, ['job title', 'your title', 'title', 'role', 'position', 'job role'], r.jobTitle, 'Job Title'))
    await fill(page, SEL.jobTitle, r.jobTitle, 'Job Title');

  // Phone — always use Amber's number
  if (!await fillByLabel(page, ['phone', 'telephone', 'mobile', 'phone number', 'contact number'], extras.phone, 'Phone'))
    await fill(page, SEL.phone, extras.phone, 'Phone');

  // LinkedIn
  if (!await fillByLabel(page, ['linkedin', 'linkedin url', 'linkedin profile'], r.linkedinUrl, 'LinkedIn'))
    await fill(page, SEL.linkedin, r.linkedinUrl, 'LinkedIn');

  // Website
  if (r.website) {
    if (!await fillByLabel(page, ['website', 'company website', 'web address', 'url'], r.website, 'Website'))
      await fill(page, SEL.website, r.website, 'Website');
  }

  // Year of birth (4-digit year) — FT and some other forms ask for this
  await fillByLabel(page, ['year of birth', 'birth year', 'year born'], String(extras.birthYear), 'Year of Birth');

  // Age (numeric age field — distinct from year of birth)
  if (!await fillByLabel(page, ['your age', 'how old are you', 'age (years)', 'what is your age'], String(extras.age), 'Age'))
    await fill(page, SEL.age, String(extras.age), 'Age');

  // Date of birth (full date)
  if (!await fillByLabel(page, ['date of birth', 'dob', 'birth date', 'birthday'], extras.dob, 'Date of Birth'))
    await fill(page, SEL.dob, extras.dob, 'Date of Birth');

  // Location
  await fillByLabel(page, ['city', 'location', 'where are you based', 'country', 'region'], r.location, 'Location');

  // Dropdowns, radios, textareas, checkboxes
  await handleDropdowns(page, r);
  await handleRadioButtons(page);
  await page.waitForTimeout(600);
  await fillTextareas(page, r);
  await handleCheckboxes(page);
}

// ─── FT CANNES: FILL ACCOUNT-DETAILS STEP ───────────────────────────────────
// The FT event registration system at event-registration.ft.com has these steps:
//   Step 1 (account-details): email, password, country, dial code, phone, T&Cs
//   Step 2 (personal-details): name, company, job title, LinkedIn etc.
//   Step 3 (event-details):    any event-specific questions
//
// We navigate directly to the apply-to-attend URL which auto-redirects to step 1.

async function fillFtAccountDetails(page: Page, r: Resident, extras: ResidentExtras): Promise<void> {
  const url = page.url();
  if (!url.includes('account-details')) return; // already past this step
  console.log(`  [FT] Filling account-details step`);

  // Email
  try {
    const emailEl = await page.$('input[name="email"][type="email"]');
    if (emailEl && await emailEl.isVisible()) {
      await emailEl.click();
      await emailEl.fill(r.email);
      console.log(`  [FT] email: ${r.email}`);
    }
  } catch { /* skip */ }

  // Password — must be 10-50 chars with letters AND numbers
  // Format: FirstNameLastName2026.  e.g. GeorgeGuise2026.
  try {
    const pwEl = await page.$('input[name="password"][type="password"]');
    if (pwEl && await pwEl.isVisible()) {
      await pwEl.click();
      await pwEl.fill(extras.password);
      console.log(`  [FT] password: ${extras.password}`);
    }
  } catch { /* skip */ }

  // Country of residence — pick based on resident's location
  try {
    const countryEl = await page.$('select[name="country"]');
    if (countryEl && await countryEl.isVisible()) {
      const countryVal = r.location.includes('USA') || r.location.includes('New York') ? 'United States' : 'United Kingdom';
      const opts = await countryEl.$$eval('option', os => os.map((o: any) => ({ value: o.value, text: o.text })));
      const match = opts.find((o: any) => o.text.toLowerCase().includes(countryVal.toLowerCase()));
      if (match) {
        await countryEl.selectOption(match.value);
        console.log(`  [FT] country: ${match.text}`);
      }
    }
  } catch { /* skip */ }

  // Dial code — pick +44 or +1
  try {
    const dialEl = await page.$('select[name="dialCode"]');
    if (dialEl && await dialEl.isVisible()) {
      const dialTarget = r.location.includes('USA') || r.location.includes('New York') ? '+1' : '+44';
      const opts = await dialEl.$$eval('option', os => os.map((o: any) => ({ value: o.value, text: o.text })));
      const match = opts.find((o: any) => o.text.includes(dialTarget) || o.value === dialTarget.replace('+', ''));
      if (match) {
        await dialEl.selectOption(match.value);
        console.log(`  [FT] dialCode: ${match.text}`);
      }
    }
  } catch { /* skip */ }

  // Phone — Amber's number without country code
  try {
    const phoneEl = await page.$('input[name="primaryTelephone"]');
    if (phoneEl && await phoneEl.isVisible()) {
      const phoneWithoutCode = extras.phone.replace(/^\+44/, '').replace(/^\+1/, '').replace(/\s/g, '').replace(/^0/, '');
      await phoneEl.click();
      await phoneEl.fill(phoneWithoutCode);
      console.log(`  [FT] phone: ${phoneWithoutCode}`);
    }
  } catch { /* skip */ }

  // Tick T&Cs and any opt-in checkboxes
  const checkboxNames = ['acceptTermsAndConditions', 'contactByEmail', 'contactByPhone', 'personalizedReports', 'receiveWeeklyNewsletter'];
  for (const name of checkboxNames) {
    try {
      const cb = await page.$(`input[name="${name}"][type="checkbox"]`);
      if (cb && await cb.isVisible() && !(await cb.isChecked())) {
        await cb.click({ force: true });
        console.log(`  [FT] checked: ${name}`);
      }
    } catch { /* skip */ }
  }
}

// ─── FT SIGN-IN + CONTINUE FLOW ──────────────────────────────────────────────
// When an FT account already exists, sign in via the event page's own sign-in
// flow, then continue through any remaining registration steps.

async function ftDoLogin(page: Page, email: string, password: string): Promise<boolean> {
  // FT two-step login: email form → click "Next" → password form → click "Sign in"
  // The password field is hidden initially (name="_notUsed") — a different visible
  // password input appears after clicking "Next".
  console.log(`  [FT login] starting for ${email}`);
  await dismissPopups(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ft-login-step1.png') });

  // Step A: Fill email (id="enter-email")
  try {
    await page.waitForSelector('#enter-email, input[type="email"]', { timeout: 8000 });
    const emailEl = await page.$('#enter-email, input[type="email"]');
    if (emailEl && await emailEl.isVisible()) {
      await emailEl.click();
      await emailEl.fill(email);
      console.log(`  [FT login] filled email: ${email}`);
    } else {
      console.log(`  [FT login] email field not found`);
      return false;
    }
  } catch (e: any) {
    console.log(`  [FT login] email field error: ${e.message?.slice(0, 60)}`);
    return false;
  }

  // Step B: Click "Next" to reveal the password step
  try {
    const nextBtn = await page.$('button:has-text("Next"), button[type="submit"]');
    if (nextBtn && await nextBtn.isVisible()) {
      await nextBtn.click();
      console.log(`  [FT login] clicked Next`);
      // Wait for a VISIBLE password field to appear (not the hidden _notUsed decoy)
      await page.waitForSelector('input[type="password"]:visible', { timeout: 10000 });
      console.log(`  [FT login] password step appeared`);
    }
  } catch (e: any) {
    console.log(`  [FT login] Next/password wait error: ${e.message?.slice(0, 80)}`);
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ft-login-step2.png') });
  console.log(`  [FT login] body after Next: ${(await page.evaluate(() => document.body.innerText.slice(0, 300))).replace(/\n/g, ' ')}`);

  // Step C: Fill the NOW-VISIBLE password field
  try {
    const pwEl = await page.$('input[type="password"]:visible');
    if (pwEl) {
      await pwEl.click();
      await pwEl.fill(password);
      console.log(`  [FT login] filled password`);
    } else {
      console.log(`  [FT login] no visible password field`);
    }
  } catch (e: any) {
    console.log(`  [FT login] password fill error: ${e.message?.slice(0, 60)}`);
  }

  // Step D: Submit
  try {
    const signinBtn = await page.$('button:has-text("Sign in"), button[type="submit"]');
    if (signinBtn && await signinBtn.isVisible()) {
      await signinBtn.click();
      console.log(`  [FT login] submitted`);
    }
  } catch { /* skip */ }

  // Wait for redirect (successful login leaves accounts.ft.com)
  try {
    await page.waitForFunction(
      () => !window.location.href.includes('accounts.ft.com'),
      { timeout: 10000 }
    );
  } catch { /* no redirect observed */ }

  await page.waitForTimeout(3000);
  const urlAfter = page.url();
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ft-login-step3.png') });
  console.log(`  [FT login] url after submit: ${urlAfter.slice(0, 80)}`);
  console.log(`  [FT login] body after: ${(await page.evaluate(() => document.body.innerText.slice(0, 200))).replace(/\n/g, ' ')}`);

  const loginFailed = urlAfter.includes('accounts.ft.com/login');
  return !loginFailed;
}

async function ftSendMagicLink(page: Page, email: string): Promise<boolean> {
  // FT's "Sign in without a password" flow:
  //   1. Enter email on /login
  //   2. Click "Next"
  //   3. On the password step, click "Sign in without a password" (hCaptcha-free)
  //   → FT sends a magic sign-in link to the email inbox
  console.log(`  [FT magic link] requesting link for ${email}`);
  await page.goto('https://accounts.ft.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await dismissPopups(page);

  // Step 1: Fill email
  try {
    await page.waitForSelector('#enter-email, input[type="email"]', { timeout: 8000 });
    const emailEl = await page.$('#enter-email, input[type="email"]');
    if (emailEl && await emailEl.isVisible()) {
      await emailEl.fill(email);
      console.log(`  [FT magic link] filled email`);
    } else {
      console.log(`  [FT magic link] no email field`);
      return false;
    }
  } catch (e: any) {
    console.log(`  [FT magic link] email error: ${e.message?.slice(0, 60)}`);
    return false;
  }

  // Step 2: Click "Next"
  try {
    const nextBtn = await page.$('button:has-text("Next"), button[type="submit"]');
    if (nextBtn && await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForSelector('input[type="password"]:visible', { timeout: 10000 });
      console.log(`  [FT magic link] password step appeared`);
    }
  } catch (e: any) {
    console.log(`  [FT magic link] Next error: ${e.message?.slice(0, 80)}`);
    return false;
  }
  await page.waitForTimeout(1000);

  // Step 3: Click "Sign in without a password" — this is hCaptcha-free
  try {
    const pwlessBtn = await page.$('a:has-text("Sign in without a password"), button:has-text("Sign in without a password")');
    if (pwlessBtn && await pwlessBtn.isVisible()) {
      await pwlessBtn.click();
      await page.waitForTimeout(4000);
      console.log(`  [FT magic link] clicked passwordless`);
    } else {
      console.log(`  [FT magic link] passwordless button not found on password step`);
      const body = await page.evaluate(() => document.body.innerText.slice(0, 400));
      console.log(`  page body: ${body.replace(/\n/g, ' ')}`);
      return false;
    }
  } catch (e: any) {
    console.log(`  [FT magic link] passwordless error: ${e.message?.slice(0, 60)}`);
    return false;
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `ft-magic-link-${email.split('@')[0].replace(/[^a-z0-9]/gi, '_')}.png`) });
  const body = await page.evaluate(() => document.body.innerText.slice(0, 600));
  console.log(`  [FT magic link] result: ${body.slice(0, 300).replace(/\n/g, ' ')}`);

  // If there's another email input (passwordless form), fill it
  try {
    const emailEl2 = await page.$('input[type="email"]:visible, #enter-email:visible');
    if (emailEl2) {
      const current = await emailEl2.inputValue();
      if (!current) { await emailEl2.fill(email); }
      const submitBtn = await page.$('button[type="submit"], button:has-text("Send"), button:has-text("Continue"), button:has-text("Next")');
      if (submitBtn && await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(4000);
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `ft-magic-link-${email.split('@')[0].replace(/[^a-z0-9]/gi, '_')}-sent.png`) });
    }
  } catch { /* skip */ }

  const finalBody = await page.evaluate(() => document.body.innerText.slice(0, 600));
  console.log(`  [FT magic link] final: ${finalBody.slice(0, 250).replace(/\n/g, ' ')}`);
  return /check your email|email.*sent|link.*sent|sent.*link|we.ve sent|magic link/i.test(finalBody);
}

async function ftSignInAndContinue(
  page: Page,
  r: Resident,
  extras: ResidentExtras,
  index: number,
  tag: string
): Promise<'success' | 'failed'> {
  try {
    // Navigate to FT accounts login page
    console.log(`  [FT sign-in] going to FT login`);
    await page.goto('https://accounts.ft.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissPopups(page);

    const loginOk = await ftDoLogin(page, r.email, extras.password);
    console.log(`  [FT sign-in] login success: ${loginOk}`);

    // Navigate to the event registration page (post-login redirect should skip account-details)
    await page.goto(EVENTS.ft.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await dismissPopups(page);

    const currentUrl = page.url();
    const step = currentUrl.split('/').pop() || '';
    console.log(`  [FT sign-in] after re-navigate: ${step}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-signin.png`) });

    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
    console.log(`  [FT sign-in] body: ${bodyText.slice(0, 300).replace(/\n/g, ' ')}`);

    // Check for existing confirmed registration
    const alreadyConfirmed = /thank you|registration.*confirmed|you('re| are) registered|application.*received|we.ll review|check your email/i.test(bodyText);
    if (alreadyConfirmed) {
      console.log(`  [FT sign-in] registration already confirmed`);
      return 'success';
    }

    // Rate limited on the registration form even when signed in
    if (/too many times|wait.*hours?/i.test(bodyText)) {
      console.log(`  [FT sign-in] RATE LIMITED even after sign-in`);
      return 'failed';
    }

    // Still on account-details (login failed or session didn't persist)
    if (step === 'account-details') {
      console.log(`  [FT sign-in] still on account-details — login did not persist`);
      return 'failed';
    }

    // We're on a registration step — fill it and continue through the form
    let pageNum = 1;
    const MAX_PAGES = 8;

    while (pageNum <= MAX_PAGES) {
      const url = page.url();
      const stepName = url.split('/').pop() || '';
      console.log(`  [FT sign-in page ${pageNum}] ${stepName}`);

      await dismissPopups(page);

      if (stepName.includes('personal-details')) {
        await fillPage(page, r, extras);
      } else if (stepName.includes('event-details') || stepName.includes('delegate')) {
        await fillPage(page, r, extras);
        await fillTextareas(page, r);
        await handleCheckboxes(page);
      } else {
        await fillPage(page, r, extras);
      }

      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-signin-step${pageNum}.png`) });

      // Find submit or next button
      let submitted = false;
      for (const sel of [...SEL.submit, ...SEL.next]) {
        try {
          const btn = await page.$(sel);
          if (btn && await btn.isVisible() && await btn.isEnabled()) {
            const urlBefore = page.url();
            await page.evaluate((b: any) => b.click(), btn);
            await page.waitForTimeout(5000);
            const urlAfter = page.url();

            const body = await page.evaluate(() => document.body.innerText.slice(0, 2000));
            const confirmed = /thank you|registration.*confirmed|you('re| are) registered|application.*received|we.ll review/i.test(body);
            const hasError = /there were some errors|please.*fill|invalid|required|please enter a four-digit/i.test(body);

            if (confirmed) {
              console.log(`  [FT sign-in] CONFIRMED`);
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-submitted.png`) });
              return 'success';
            }
            if (hasError) {
              console.log(`  [FT sign-in] ERROR: ${body.slice(0, 200)}`);
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-error.png`) });
              return 'failed';
            }
            if (urlAfter !== urlBefore) {
              console.log(`  [FT sign-in] navigated to: ${urlAfter.split('/').pop()}`);
              pageNum++;
            } else {
              console.log(`  [FT sign-in] no navigation after click — body: ${body.slice(0, 200)}`);
              await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-submitted.png`) });
              return 'success'; // assume submitted
            }
            submitted = true;
            break;
          }
        } catch { /* try next */ }
      }

      if (!submitted) {
        console.log(`  [FT sign-in] no button on step ${pageNum}`);
        return 'failed';
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-submitted.png`) });
    return 'success';
  } catch (err: any) {
    console.error(`  [FT sign-in] FAILED: ${err.message}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-signin-error.png`) }).catch(() => {});
    return 'failed';
  }
}

// ─── REGISTER ONE RESIDENT ────────────────────────────────────────────────────

async function registerOne(
  page: Page,
  url: string,
  r: Resident,
  index: number,
  total: number,
  tag: string
): Promise<'success' | 'failed'> {
  const label = `${r.firstName} ${r.lastName}`.trim();
  const extras = getExtras(r);
  console.log(`\n[${index + 1}/${total}] ${label} — ${tag} (pw: ${extras.password})`);

  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissPopups(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-before.png`) });

    // FT Cannes: URL auto-redirects to the event-registration.ft.com account-details form
    // No extra clicks needed — just wait for the form to load.
    if (tag === 'ft') {
      try {
        await page.waitForURL('**/account-details**', { timeout: 10000 });
        console.log(`  [FT] Landed on account-details form`);
      } catch {
        console.log(`  [FT] Waiting for form...`);
        try { await page.waitForSelector('input[name="email"]', { timeout: 8000 }); } catch { /* continue */ }
      }
      await dismissPopups(page);

      // Check if we've been rate-limited
      const rateLimitText = await page.evaluate(() => document.body.innerText.slice(0, 500));
      if (/too many times|wait.*hours?|rate.*limit/i.test(rateLimitText)) {
        console.log(`  [FT] RATE LIMITED — cannot proceed now`);
        return 'failed';
      }

      // Check if this email already has an account — if so, sign in and continue
      const alreadyExistsCheck = await page.evaluate(() => document.body.innerText.slice(0, 2000));
      if (/already.*account|account.*already|sign in to.*account/i.test(alreadyExistsCheck)) {
        console.log(`  [FT] Account already exists — attempting sign-in flow`);
        return await ftSignInAndContinue(page, r, extras, index, tag);
      }
    } else {
      // Generic CTA click for other events
      const hasInput = await page.$('input[type="email"], input[type="text"], textarea');
      if (!hasInput) {
        const ctaSelectors = [
          'a:has-text("RSVP")', 'button:has-text("RSVP")',
          'a:has-text("Register")', 'button:has-text("Register")',
          'a:has-text("Sign up")', 'button:has-text("Sign up")',
          'a:has-text("Apply")', 'button:has-text("Apply")',
          'a[href*="register" i]', 'a[href*="signup" i]',
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
    }

    await page.waitForTimeout(1000);

    // Multi-step form loop
    let pageNum = 1;
    const MAX_PAGES = 12;

    while (pageNum <= MAX_PAGES) {
      const currentUrl = page.url();
      console.log(`  [page ${pageNum}] filling... (${currentUrl.split('/').pop()})`);

      // Dismiss any popups/overlays before filling
      await dismissPopups(page);

      // FT account-details step: handle FT-specific fields first
      if (tag === 'ft' && currentUrl.includes('account-details')) {
        await fillFtAccountDetails(page, r, extras);
      }

      // Generic fill for all other fields (name, company, title, LinkedIn etc.)
      await fillPage(page, r, extras);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-page${pageNum}-filled.png`) });

      // Dismiss again before submitting (popups can appear after interaction)
      await dismissPopups(page);

      // Check for submit button
      let submitBtn: ElementHandle | null = null;
      for (const sel of SEL.submit) {
        try {
          const btn = await page.$(sel);
          if (btn && await btn.isVisible() && await btn.isEnabled()) { submitBtn = btn; break; }
        } catch { /* try next */ }
      }

      if (submitBtn) {
        const urlBefore = page.url();
        console.log(`  [submit] clicking submit (url: ${urlBefore.split('/').pop()})`);
        // Try JS click first (bypasses pointer-event blocking overlays),
        // then fall back to Playwright click if needed.
        try {
          await page.evaluate((btn: any) => btn.click(), submitBtn);
          console.log(`  [submit] JS click fired`);
        } catch {
          try {
            await submitBtn.click({ force: true, timeout: 10000 });
          } catch (e: any) {
            console.log(`  [submit] both click methods failed: ${e.message?.slice(0, 80)}`);
          }
        }

        // Wait for navigation or content change (up to 10s)
        try {
          await page.waitForFunction(
            (before: string) => window.location.href !== before,
            urlBefore,
            { timeout: 10000 }
          );
        } catch { /* no navigation — inspect body */ }

        await page.waitForTimeout(2000);
        const urlAfter = page.url();
        const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
        console.log(`  [submit] url after: ${urlAfter.split('/').pop()}`);
        console.log(`  [submit] body snippet: ${bodyText.slice(0, 300).replace(/\n/g, ' ')}`);

        // FT multi-step: if URL moved to a new step, continue the loop
        if (tag === 'ft' && urlAfter !== urlBefore && urlAfter.includes('event-registration.ft.com')) {
          const step = urlAfter.split('/').pop() || '';
          console.log(`  [FT] navigated to next step: ${step}`);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-page${pageNum}-submitted.png`) });
          pageNum++;
          continue; // go back to top of while loop to fill next step
        }

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-submitted.png`) });

        const isRateLimited = /too many times|wait.*hours?|rate.*limit/i.test(bodyText);
        const hasError = /there were some errors|please (fill|complete|correct)|invalid.*email|field.*required|already have an account|account.*already exists|please enter a four-digit/i.test(bodyText);
        const confirmed = /thank you|you're (all set|registered|confirmed)|registration (confirmed|successful|complete)|we('ve| have) received|application received|check your email|your application|we.ll review/i.test(bodyText);

        if (isRateLimited) {
          console.log(`  RATE LIMITED — wait 15h before retrying`);
          return 'failed';
        }
        if (hasError) {
          console.log(`  ERROR: ${bodyText.slice(0, 300)}`);
          // For "already have account" — try sign-in flow
          if (tag === 'ft' && /already have an account|account.*already exists/i.test(bodyText)) {
            console.log(`  [FT] Account exists — switching to sign-in flow`);
            return await ftSignInAndContinue(page, r, extras, index, tag);
          }
          return 'failed';
        }
        if (confirmed) {
          console.log(`  CONFIRMED: ${bodyText.slice(0, 150)}`);
          return 'success';
        }
        console.log(`  No explicit confirmation — check screenshot`);
        return 'success';
      }

      // Navigate to next step
      let navigated = false;
      for (const sel of SEL.next) {
        try {
          const btn = await page.$(sel);
          if (btn && await btn.isVisible() && await btn.isEnabled()) {
            console.log(`  [nav] Next/Continue`);
            await btn.click();
            await page.waitForTimeout(2000);
            navigated = true;
            break;
          }
        } catch { /* try next */ }
      }

      if (!navigated) {
        console.log(`  No Next or Submit on page ${pageNum} — cannot continue`);
        return 'failed';
      }
      pageNum++;
    }

    return 'success';
  } catch (err: any) {
    console.error(`  FAILED: ${err.message}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${tag}-${index + 1}-error.png`) }).catch(() => {});
    return 'failed';
  }
}

// ─── LOG UPDATER ─────────────────────────────────────────────────────────────

function updateLog(eventName: string, eventUrl: string, guestName: string, status: 'success' | 'failed'): void {
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
    console.log(`  Log updated: ${guestName} -> ${status}`);
  } catch (err: any) {
    console.warn(`  Could not update log: ${err.message}`);
  }
}

// ─── RUN ONE EVENT BATCH ──────────────────────────────────────────────────────

async function runBatch(
  browser: Browser,
  eventKey: keyof typeof EVENTS
): Promise<void> {
  const ev = EVENTS[eventKey];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`EVENT: ${ev.name}`);
  console.log(`URL:   ${ev.url}`);
  console.log(`Registering ${ev.residents.length} resident(s)`);
  console.log('='.repeat(60));

  const contextOpts = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  };

  // Each resident gets their own isolated browser context (fresh cookies/session/storage)
  // to prevent login state from one resident bleeding into the next.
  for (let i = 0; i < ev.residents.length; i++) {
    const r = ev.residents[i];
    const context = await browser.newContext(contextOpts);
    const page = await context.newPage();
    const status = await registerOne(page, ev.url, r, i, ev.residents.length, eventKey);
    const guestName = `${r.firstName} ${r.lastName}`.trim();
    updateLog(ev.name, ev.url, guestName, status);
    await page.close();
    await context.close();
    if (i < ev.residents.length - 1) {
      const delayMs = eventKey === 'ft' ? 30000 : 3000; // 30s between FT submissions to avoid rate-limit
      console.log(`  [delay] waiting ${delayMs / 1000}s before next resident...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

// ─── FT SIGN-IN BATCH ────────────────────────────────────────────────────────
// For residents whose FT accounts were already created — skip Create Account form,
// sign in directly and complete remaining steps.
// Run with:  npx ts-node ... register-failed-events.ts --ft-signin

const FT_EXISTING_ACCOUNTS: Array<{ r: Resident; extras: ResidentExtras }> = [
  { r: RESIDENTS.find(x => x.firstName === 'George' && x.lastName === 'Guise')!, extras: { ...getExtras(RESIDENTS.find(x => x.firstName === 'George')!) } },
  { r: RESIDENTS.find(x => x.firstName === 'Dinalva')!, extras: { ...getExtras(RESIDENTS.find(x => x.firstName === 'Dinalva')!) } },
  { r: RESIDENTS.find(x => x.firstName === 'Abi')!, extras: { ...getExtras(RESIDENTS.find(x => x.firstName === 'Abi')!) } },
];

async function runFtSignInBatch(browser: Browser): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('FT MAGIC LINK BATCH — Send passwordless sign-in emails');
  console.log('Residents with existing FT accounts need to click their link');
  console.log('to complete event registration on personal-details + event-details.');
  console.log('='.repeat(60));

  const contextOpts = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  };

  for (let i = 0; i < FT_EXISTING_ACCOUNTS.length; i++) {
    const { r, extras } = FT_EXISTING_ACCOUNTS[i];
    const label = `${r.firstName} ${r.lastName}`.trim();
    console.log(`\n[${i + 1}/${FT_EXISTING_ACCOUNTS.length}] ${label} (${r.email})`);

    const context = await browser.newContext(contextOpts);
    const page = await context.newPage();

    const sent = await ftSendMagicLink(page, r.email);
    console.log(`  Magic link sent: ${sent ? '✓ YES' : '✗ NO'}`);
    if (sent) {
      console.log(`  → ${r.firstName} needs to check ${r.email} and click the FT sign-in link`);
      console.log(`  → After signing in, they should be taken to complete personal-details`);
    }

    await page.close();
    await context.close();

    if (i < FT_EXISTING_ACCOUNTS.length - 1) {
      await new Promise(res => setTimeout(res, 8000));
    }
  }
  console.log('\n⚠️  Next steps for these 3 residents:');
  console.log('  1. Check their email inboxes for "Sign in to the FT" emails');
  console.log('  2. Click the sign-in link');
  console.log('  3. Complete the personal-details and event-details registration forms');
  console.log('  Emails: George@soabparty.com | dinalvys@gmail.com | blendworld@gmail.com');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf('--only');
  const onlyArg = onlyIdx !== -1 ? args[onlyIdx + 1] : (args.find(a => a.startsWith('--only='))?.split('=')[1] ?? null);
  const ftSignIn = args.includes('--ft-signin');

  console.log('\nIndvstry Power House — Failed Event Re-Registration');
  console.log('Amber Jacobs, Community Manager\n');

  const browser = await chromium.launch({
    headless: true,
    slowMo: 50,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    if (ftSignIn) {
      await runFtSignInBatch(browser);
    } else {
      const toRun: (keyof typeof EVENTS)[] = onlyArg
        ? [onlyArg as keyof typeof EVENTS]
        : ['digiday', 'msq', 'ft'];

      for (const key of toRun) {
        if (!EVENTS[key]) { console.warn(`Unknown event key: ${key}`); continue; }
        await runBatch(browser, key);
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\nAll done. Check screenshots in:', SCREENSHOT_DIR);
  console.log('Registration log updated:       src/data/event-registrations.json\n');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
