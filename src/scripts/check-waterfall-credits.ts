/**
 * check-waterfall-credits.ts — check remaining credits for all waterfall providers
 * Run: npx ts-node --project tsconfig.json src/scripts/check-waterfall-credits.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

interface CreditResult {
  service: string;
  status: 'ok' | 'error' | 'no_key';
  remaining: number | string;
  note?: string;
}

async function checkHunter(): Promise<CreditResult> {
  const key = process.env.HUNTER_API_KEY;
  if (!key) return { service: 'Hunter.io', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get(`https://api.hunter.io/v2/account?api_key=${key}`, { timeout: 8000 });
    const d = r.data?.data;
    return { service: 'Hunter.io', status: 'ok', remaining: d?.requests?.available ?? '?', note: `used: ${d?.requests?.used ?? '?'} / total: ${d?.requests?.searches ?? '?'}` };
  } catch (e: any) {
    return { service: 'Hunter.io', status: 'error', remaining: '?', note: e?.response?.data?.errors?.[0]?.details || e.message };
  }
}

async function checkVoilaNorbert(): Promise<CreditResult> {
  const key = process.env.VOILANORBERT_API_KEY;
  if (!key) return { service: 'VoilaNorbert', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://api.voilanorbert.com/2018-01-08/accounts/search', {
      auth: { username: 'api', password: key },
      timeout: 8000,
    });
    const credits = r.data?.credits ?? r.data?.remaining ?? r.data;
    return { service: 'VoilaNorbert', status: 'ok', remaining: JSON.stringify(credits) };
  } catch (e: any) {
    return { service: 'VoilaNorbert', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function checkDropcontact(): Promise<CreditResult> {
  const key = process.env.DROPCONTACT_API_KEY;
  if (!key) return { service: 'Dropcontact', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://api.dropcontact.com/account', {
      headers: { 'X-Access-Token': key },
      timeout: 8000,
    });
    const d = r.data;
    const remaining = d?.credits_left ?? d?.credits ?? d?.remaining ?? JSON.stringify(d);
    return { service: 'Dropcontact', status: 'ok', remaining };
  } catch (e: any) {
    return { service: 'Dropcontact', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function checkProspeo(): Promise<CreditResult> {
  const key = process.env.PROSPEO_API_KEY;
  if (!key) return { service: 'Prospeo', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://api.prospeo.io/user-information', {
      headers: { 'X-KEY': key },
      timeout: 8000,
    });
    const d = r.data?.response;
    const remaining = d?.credits_left ?? d?.available ?? d?.remaining ?? JSON.stringify(d);
    return { service: 'Prospeo', status: 'ok', remaining };
  } catch (e: any) {
    return { service: 'Prospeo', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function checkAnymailFinder(): Promise<CreditResult> {
  const key = process.env.ANYMAIL_FINDER_API_KEY;
  if (!key) return { service: 'Anymail Finder', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://api.anymailfinder.com/v5.0/account', {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 8000,
    });
    const d = r.data;
    const remaining = d?.remaining_searches ?? d?.credits ?? d?.plan_searches_left ?? JSON.stringify(d);
    return { service: 'Anymail Finder', status: 'ok', remaining };
  } catch (e: any) {
    return { service: 'Anymail Finder', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function checkFindymail(): Promise<CreditResult> {
  const key = process.env.FINDYMAIL_API_KEY;
  if (!key) return { service: 'Findymail', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://app.findymail.com/api/user', {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 8000,
    });
    const d = r.data;
    const remaining = d?.credits ?? d?.remaining ?? d?.searches_left ?? JSON.stringify(d);
    return { service: 'Findymail', status: 'ok', remaining };
  } catch (e: any) {
    return { service: 'Findymail', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function checkContactOut(): Promise<CreditResult> {
  const key = process.env.CONTACTOUT_API_KEY;
  if (!key) return { service: 'ContactOut', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://api.contactout.com/v1/me', {
      headers: { token: key },
      timeout: 8000,
    });
    const d = r.data;
    const remaining = d?.credits ?? d?.remaining ?? d?.quota ?? JSON.stringify(d);
    return { service: 'ContactOut', status: 'ok', remaining };
  } catch (e: any) {
    return { service: 'ContactOut', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function checkLusha(): Promise<CreditResult> {
  const key = process.env.LUSHA_API_KEY;
  if (!key) return { service: 'Lusha', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://api.lusha.com/quota', {
      headers: { api_key: key },
      timeout: 8000,
    });
    const d = r.data;
    const remaining = d?.remaining ?? d?.credits ?? d?.quota_left ?? JSON.stringify(d);
    return { service: 'Lusha', status: 'ok', remaining };
  } catch (e: any) {
    return { service: 'Lusha', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function checkRocketReach(): Promise<CreditResult> {
  const key = process.env.ROCKETREACH_API_KEY;
  if (!key) return { service: 'RocketReach', status: 'no_key', remaining: 'N/A' };
  try {
    const r = await axios.get('https://api.rocketreach.co/v2/api/account', {
      headers: { 'Api-Key': key },
      timeout: 8000,
    });
    const d = r.data;
    const remaining = d?.remaining ?? d?.credits ?? d?.lookups_left ?? JSON.stringify(d);
    return { service: 'RocketReach', status: 'ok', remaining };
  } catch (e: any) {
    return { service: 'RocketReach', status: 'error', remaining: '?', note: e?.response?.data?.message || e.message };
  }
}

async function main() {
  console.log('\nChecking credits for all waterfall providers...\n');

  const checks = await Promise.all([
    checkHunter(),
    checkVoilaNorbert(),
    checkDropcontact(),
    checkProspeo(),
    checkAnymailFinder(),
    checkFindymail(),
    checkContactOut(),
    checkLusha(),
    checkRocketReach(),
  ]);

  const pad = (s: string, n: number) => s.padEnd(n);

  console.log(pad('Service', 20) + pad('Status', 10) + pad('Remaining', 20) + 'Notes');
  console.log('─'.repeat(80));

  for (const c of checks) {
    const status = c.status === 'ok' ? '✓' : c.status === 'no_key' ? '—' : '✗';
    console.log(`${pad(c.service, 20)}${pad(status, 10)}${pad(String(c.remaining), 20)}${c.note || ''}`);
  }

  console.log('\nNo key (add to .env when signed up):');
  console.log('  • Skrapp       (SKRAPP_API_KEY)      — 50–100/month');
  console.log('  • GetProspect  (GETPROSPECT_API_KEY) — 50/month');
  console.log('  • Kaspr        (KASPR_API_KEY)        — 5–10/month');
  console.log('  • UpLead       (UPLEAD_API_KEY)       — 5/month');
  console.log('\nNot yet in waterfall (mentioned but not added):');
  console.log('  • Tomba.io     (TOMBA_API_KEY)        — 50–300/month free tier');
  console.log('  • SalesQL      (SALESQL_API_KEY)      — 100/month free tier');
}

main().catch(console.error);
