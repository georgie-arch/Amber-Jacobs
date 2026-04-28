/**
 * email-waterfall.ts
 *
 * Waterfall email finder — tries multiple providers in sequence, stopping
 * the moment one returns a valid result. Preserves rare credits by trying
 * highest-volume free tiers first.
 *
 * Waterfall order (highest free credits → most precious):
 *   1. VoilaNorbert    (~50/month)
 *   2. Prospeo         (20-50/month)
 *   3. Hunter          (50/month, resets 22nd)
 *   4. Anymail Finder  (20/month, verified-only — no charge if not found)
 *   5. Dropcontact     (~50/month, async with polling)
 *   6. Findymail       (25 remaining)
 *   7. ContactOut      (10-40/month)
 *   8. Lusha           (5-50/month)
 *   9. RocketReach     (5/month — save for C-suite)
 *
 * Usage:
 *   import { findEmail } from './email-waterfall';
 *   const result = await findEmail('Jamie', 'Iannone', 'ebay.com');
 *   // { email: 'jiannone@ebay.com', confidence: 96, source: 'hunter' }
 *
 * CLI:
 *   RUN_LOOKUP="First|Last|domain.com" npx ts-node --project tsconfig.json src/integrations/email-waterfall.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export interface LookupResult {
  email: string;
  confidence: number;
  source: string;
}

// ─── INDIVIDUAL PROVIDER FUNCTIONS ───────────────────────────────────────────

async function tryProspeo(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.PROSPEO_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.post(
      'https://api.prospeo.io/email-finder',
      { first_name: firstName, last_name: lastName, company: domain },
      { headers: { 'X-KEY': key, 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    const email = r.data?.response?.email;
    const status = r.data?.response?.email_status;
    if (email && status !== 'invalid') {
      return { email, confidence: status === 'valid' ? 90 : 60, source: 'prospeo' };
    }
  } catch {}
  return null;
}

async function tryHunter(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.HUNTER_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.get('https://api.hunter.io/v2/email-finder', {
      params: { domain, first_name: firstName, last_name: lastName, api_key: key },
      timeout: 8000,
    });
    const email = r.data?.data?.email;
    const score = r.data?.data?.score;
    if (email) return { email, confidence: score ?? 70, source: 'hunter' };
  } catch {}
  return null;
}

async function tryAnymailFinder(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.ANYMAIL_FINDER_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.post(
      'https://api.anymailfinder.com/v5.0/search/person.json',
      { full_name: `${firstName} ${lastName}`, domain },
      { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    const email = r.data?.email;
    const result = r.data?.result;
    if (email && result === 'found') {
      return { email, confidence: 85, source: 'anymail_finder' };
    }
  } catch {}
  return null;
}

async function tryFindymail(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.FINDYMAIL_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.post(
      'https://app.findymail.com/api/search',
      { name: `${firstName} ${lastName}`, domain },
      { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    const email = r.data?.email;
    if (email) return { email, confidence: 80, source: 'findymail' };
  } catch {}
  return null;
}

async function tryContactOut(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.CONTACTOUT_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.get('https://api.contactout.com/v1/people/email', {
      params: { first_name: firstName, last_name: lastName, company_domain: domain },
      headers: { token: key },
      timeout: 8000,
    });
    const emails: string[] = r.data?.profile?.emails ?? [];
    const work = emails.find(e => e.includes(domain)) || emails[0];
    if (work) return { email: work, confidence: 75, source: 'contactout' };
  } catch {}
  return null;
}

async function tryLusha(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.LUSHA_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.get('https://api.lusha.com/person', {
      params: { firstName, lastName, company: domain },
      headers: { api_key: key },
      timeout: 8000,
    });
    const emails: any[] = r.data?.emails ?? [];
    const work = emails.find((e: any) => e.type === 'work') || emails[0];
    if (work?.email) return { email: work.email, confidence: 80, source: 'lusha' };
  } catch {}
  return null;
}

async function tryRocketReach(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.ROCKETREACH_API_KEY;
  if (!key) return null;
  try {
    const company = domain.replace(/\.(com|io|co\.uk|org|net|co|agency|ai|us)$/, '');
    const r = await axios.get('https://api.rocketreach.co/api/v2/lookupProfile', {
      params: { name: `${firstName} ${lastName}`, current_employer: company },
      headers: { 'Api-Key': key },
      timeout: 12000,
    });
    const emails: string[] = r.data?.emails ?? [];
    const work = emails.find(e => e.includes(domain)) || emails[0];
    if (work) return { email: work, confidence: 75, source: 'rocketreach' };
  } catch {}
  return null;
}

async function tryVoilaNorbert(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.VOILANORBERT_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.post(
      'https://api.voilanorbert.com/2018-01-08/search/name',
      `name=${encodeURIComponent(`${firstName} ${lastName}`)}&domain=${encodeURIComponent(domain)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: { username: 'api', password: key },
        timeout: 10000,
      }
    );
    const email = r.data?.email?.value;
    const score = r.data?.email?.score;
    if (email) return { email, confidence: score ?? 75, source: 'voilanorbert' };
  } catch {}
  return null;
}

async function tryDropcontact(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.DROPCONTACT_API_KEY;
  if (!key) return null;
  try {
    // Step 1: submit
    const submit = await axios.post(
      'https://api.dropcontact.com/batch',
      { data: [{ first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, website: domain }], siren: false },
      { headers: { 'X-Access-Token': key, 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    const requestId = submit.data?.request_id;
    if (!requestId) return null;

    // Step 2: poll (max 5 attempts, 2s apart)
    for (let i = 0; i < 5; i++) {
      await new Promise(res => setTimeout(res, 2000));
      const poll = await axios.get(`https://api.dropcontact.com/batch/${requestId}`, {
        headers: { 'X-Access-Token': key },
        timeout: 8000,
      });
      if (poll.data?.success && poll.data?.data?.[0]) {
        const contact = poll.data.data[0];
        const emails: any[] = contact.email ?? [];
        const best = emails.find((e: any) => e.qualification === 'professional') || emails[0];
        if (best?.email) return { email: best.email, confidence: best.confidence ?? 75, source: 'dropcontact' };
        break;
      }
    }
  } catch {}
  return null;
}

async function trySkrapp(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.SKRAPP_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.post(
      'https://api.skrapp.io/api/v2/find',
      { firstName, lastName, domain },
      { headers: { 'X-Access-Key': key, 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    const email = r.data?.email?.address;
    const score = r.data?.email?.score;
    if (email) return { email, confidence: score ?? 70, source: 'skrapp' };
  } catch {}
  return null;
}

async function tryGetProspect(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.GETPROSPECT_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.post(
      'https://api.getprospect.com/public/v1/email/find',
      { firstName, lastName, domain },
      { headers: { apiKey: key, 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    const email = r.data?.email;
    const status = r.data?.status;
    if (email && status !== 'invalid') return { email, confidence: 80, source: 'getprospect' };
  } catch {}
  return null;
}

async function tryKaspr(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.KASPR_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.post(
      'https://api.kaspr.io/v1/email-finder',
      { firstName, lastName, company_domain: domain },
      { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 8000 }
    );
    const email = r.data?.email;
    if (email) return { email, confidence: 80, source: 'kaspr' };
  } catch {}
  return null;
}

async function tryUpLead(firstName: string, lastName: string, domain: string): Promise<LookupResult | null> {
  const key = process.env.UPLEAD_API_KEY;
  if (!key) return null;
  try {
    const r = await axios.get('https://api.uplead.com/v2/person-search', {
      params: { first_name: firstName, last_name: lastName, domain },
      headers: { 'X-API-Key': key },
      timeout: 8000,
    });
    const person = r.data?.data?.items?.[0];
    const email = person?.email;
    if (email) return { email, confidence: 85, source: 'uplead' };
  } catch {}
  return null;
}

// ─── WATERFALL ────────────────────────────────────────────────────────────────

const PROVIDERS: Array<(fn: string, ln: string, domain: string) => Promise<LookupResult | null>> = [
  tryVoilaNorbert,  // ~50/month
  tryProspeo,       // 20-50/month
  tryHunter,        // 50/month (resets 22nd)
  tryAnymailFinder, // 20/month (verified only — free if not found)
  tryDropcontact,   // ~50/month (async)
  tryFindymail,     // 25 remaining
  tryContactOut,    // 10-40/month
  tryLusha,         // 5-50/month
  tryRocketReach,   // 5/month — most precious, save for C-suite
];

export async function findEmail(
  firstName: string,
  lastName: string,
  domain: string,
  verbose = false
): Promise<LookupResult | null> {
  for (const provider of PROVIDERS) {
    const name = provider.name.replace('try', '').toLowerCase();
    if (verbose) process.stdout.write(`  trying ${name}... `);
    try {
      const result = await provider(firstName, lastName, domain);
      if (result) {
        if (verbose) console.log(`✓ found: ${result.email} (${result.confidence}%)`);
        return result;
      } else {
        if (verbose) console.log('not found');
      }
    } catch (err: any) {
      if (verbose) console.log(`error: ${err.message}`);
    }
  }
  return null;
}

// ─── BATCH LOOKUP ─────────────────────────────────────────────────────────────

export async function findEmailsBatch(
  contacts: Array<{ firstName: string; lastName: string; domain: string; name?: string }>
): Promise<Array<{ name: string; email: string | null; confidence: number; source: string }>> {
  const results = [];
  for (const c of contacts) {
    const displayName = c.name || `${c.firstName} ${c.lastName}`;
    process.stdout.write(`[${contacts.indexOf(c) + 1}/${contacts.length}] ${displayName} | ${c.domain} → `);
    const result = await findEmail(c.firstName, c.lastName, c.domain);
    if (result) {
      console.log(`${result.email} (${result.source}, ${result.confidence}%)`);
      results.push({ name: displayName, email: result.email, confidence: result.confidence, source: result.source });
    } else {
      console.log('NOT FOUND');
      results.push({ name: displayName, email: null, confidence: 0, source: 'none' });
    }
    await new Promise(res => setTimeout(res, 600));
  }
  return results;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
// RUN_LOOKUP="First|Last|domain.com" npx ts-node --project tsconfig.json src/integrations/email-waterfall.ts

if (process.env.RUN_LOOKUP) {
  const [fn, ln, domain] = process.env.RUN_LOOKUP.split('|');
  console.log(`\nLooking up: ${fn} ${ln} @ ${domain}\n`);
  findEmail(fn, ln, domain, true)
    .then(r => {
      if (r) console.log(`\nResult: ${r.email} (source: ${r.source}, confidence: ${r.confidence}%)`);
      else console.log('\nResult: NOT FOUND across all providers');
    })
    .catch(console.error);
}
