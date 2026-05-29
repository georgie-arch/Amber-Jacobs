/**
 * test-apify-outreach.ts
 *
 * Tests the Apify LinkedIn scraper pipeline end-to-end:
 *   1. Calls Apify to scrape LinkedIn profiles for a given search query
 *   2. Shows the results
 *   3. Sends connection requests to the first 2 profiles found
 *      (skips any already in the drip progress file)
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/test-apify-outreach.ts
 *
 * Flags:
 *   --dry-run     Show profiles found but don't send connection requests
 *   --query="X"   Override the search query (default: "creative director London")
 *   --limit=N     Number of Apify results to fetch (default: 10)
 */

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { getLinkedInBrowser, closeBrowser, browserSendConnectionRequest } from '../integrations/linkedin-browser';
import { logger } from '../utils/logger';

const PROGRESS_FILE = path.resolve(__dirname, '../data/linkedin-drip-progress.json');
const args = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const queryArg  = args.find(a => a.startsWith('--query='));
const limitArg  = args.find(a => a.startsWith('--limit='));
const QUERY  = queryArg  ? queryArg.split('=').slice(1).join('=')  : 'creative director London';
const LIMIT  = limitArg  ? parseInt(limitArg.split('=')[1], 10)    : 10;
const OUTREACH_LIMIT = 2; // how many connection requests to actually send

function loadProgress(): Record<string, string> {
  if (!fs.existsSync(PROGRESS_FILE)) return {};
  const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  const map: Record<string, string> = {};
  for (const [url, entry] of Object.entries(data.entries || {})) {
    map[url] = (entry as any).status;
  }
  return map;
}

function saveToProgress(url: string, name: string, status: string, error?: string): void {
  const raw = fs.existsSync(PROGRESS_FILE)
    ? JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    : { lastRun: '', totalSent: 0, entries: {} };

  raw.entries[url] = { name, linkedin: url, status, sentAt: status === 'sent' ? new Date().toISOString() : undefined, error };
  if (status === 'sent') raw.totalSent = (raw.totalSent || 0) + 1;
  raw.lastRun = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(raw, null, 2));
}

// ─── APIFY SCRAPER ────────────────────────────────────────────────────────────

interface ApifyProfile {
  name?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  company?: string;
  location?: string;
  linkedInUrl?: string;
  profileUrl?: string;
  about?: string;
}

async function runApifyScrape(query: string, maxResults: number): Promise<ApifyProfile[]> {
  const apiKey  = process.env.APIFY_API_KEY;
  const actorId = process.env.LINKEDIN_ACTOR_ID || 'dev_fusion~linkedin-profile-scraper';

  if (!apiKey) {
    logger.error('APIFY_API_KEY not set in .env');
    process.exit(1);
  }

  logger.info(`\n🔍 Starting Apify run — query: "${query}", limit: ${maxResults}`);
  logger.info(`   Actor: ${actorId}`);

  // ── Start the run ──────────────────────────────────────────────
  let runId: string;
  try {
    const runRes = await axios.post(
      `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs`,
      {
        searchQueries: [query],
        maxResults,
        scrapeCompanyDetails: false,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );
    runId = runRes.data.data.id;
    logger.info(`   Run started: ${runId}`);
  } catch (err: any) {
    const status = err?.response?.status;
    const body   = JSON.stringify(err?.response?.data || {});
    logger.error(`Apify run start failed (${status}): ${body}`);

    if (status === 404) {
      logger.error(`  Actor "${actorId}" not found. Check LINKEDIN_ACTOR_ID in .env.`);
      logger.error('  Common working actors: apify~linkedin-profile-scraper  or  curious_coder~linkedin-people-search');
    } else if (status === 401 || status === 403) {
      logger.error('  API key rejected. Check APIFY_API_KEY in .env.');
    }
    throw err;
  }

  // ── Poll until complete ─────────────────────────────────────────
  logger.info('   Polling for completion...');
  let attempts = 0;
  const MAX_WAIT = 60; // 10 min max

  while (attempts < MAX_WAIT) {
    await new Promise(r => setTimeout(r, 10000)); // 10s intervals
    attempts++;

    const statusRes = await axios.get(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const runStatus: string = statusRes.data.data.status;
    process.stdout.write(`   [${attempts * 10}s] status: ${runStatus}\r`);

    if (runStatus === 'SUCCEEDED') {
      console.log(''); // newline
      logger.info('   Run succeeded.');
      break;
    } else if (runStatus === 'FAILED' || runStatus === 'ABORTED' || runStatus === 'TIMED-OUT') {
      console.log('');
      logger.error(`   Run ended with status: ${runStatus}`);
      return [];
    }
  }

  // ── Fetch dataset ──────────────────────────────────────────────
  const dataRes = await axios.get(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return dataRes.data as ApifyProfile[];
}

// ─── CONNECTION NOTE GENERATOR ────────────────────────────────────────────────

function buildNote(profile: ApifyProfile): string {
  const firstName = profile.firstName || profile.name?.split(' ')[0] || 'there';
  const headline  = profile.headline || '';
  const company   = profile.company  || '';

  const roleSnippet = headline
    ? `I came across your profile — ${headline.substring(0, 60)} — and it resonated.`
    : `I came across your profile and was impressed by your work.`;

  const note = `Hi ${firstName}! ${roleSnippet} I'm building Indvstry Clvb, a curated digital members club for creative professionals. Would love to connect.`;

  return note.substring(0, 295);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(' Apify Outreach Test');
  console.log(' ' + new Date().toISOString());
  if (DRY_RUN) console.log(' MODE: DRY RUN — no connection requests will be sent');
  console.log('═'.repeat(60) + '\n');

  // Step 1: Scrape
  let profiles: ApifyProfile[] = [];
  try {
    profiles = await runApifyScrape(QUERY, LIMIT);
  } catch {
    logger.error('Apify scrape failed — see above for details');
    process.exit(1);
  }

  if (profiles.length === 0) {
    logger.warn('Apify returned 0 profiles. The actor may not support this query format, or the account needs credits.');
    process.exit(0);
  }

  // Step 2: Show what came back
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Apify returned ${profiles.length} profiles:\n`);
  profiles.forEach((p, i) => {
    const url = p.linkedInUrl || p.profileUrl || '(no URL)';
    const name = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || '(unknown)';
    const headline = (p.headline || '').substring(0, 60);
    const company  = p.company || '';
    console.log(`  ${i + 1}. ${name}`);
    console.log(`     ${headline}${company ? ' @ ' + company : ''}`);
    console.log(`     ${url}`);
  });

  // Step 3: Filter to sendable profiles
  const progress  = loadProgress();
  const sendable  = profiles.filter(p => {
    const url = p.linkedInUrl || p.profileUrl || '';
    if (!url || !url.includes('linkedin.com/in/')) return false;
    const existing = progress[url];
    return !existing || existing === 'failed';
  });

  console.log(`\n${sendable.length} profiles eligible for outreach (not already in progress file)`);

  if (sendable.length === 0) {
    logger.info('All returned profiles already exist in the drip progress file. Done.');
    return;
  }

  const batch = sendable.slice(0, OUTREACH_LIMIT);
  console.log(`\nSending connection requests to first ${batch.length}:\n`);

  if (DRY_RUN) {
    batch.forEach(p => {
      const url  = p.linkedInUrl || p.profileUrl || '';
      const name = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim();
      const note = buildNote(p);
      console.log(`  [DRY RUN] Would connect to: ${name}`);
      console.log(`  URL: ${url}`);
      console.log(`  Note: "${note}"\n`);
    });
    return;
  }

  // Step 4: Fire connection requests
  const browser = await getLinkedInBrowser();
  let sent = 0;
  let failed = 0;

  for (const profile of batch) {
    const url  = profile.linkedInUrl || profile.profileUrl || '';
    const name = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown';
    const note = buildNote(profile);

    logger.info(`\n→ ${name}`);
    logger.info(`  ${url}`);
    logger.info(`  Note: "${note}"`);

    try {
      const ok = await browserSendConnectionRequest(browser, url, note);
      if (ok) {
        sent++;
        saveToProgress(url, name, 'sent');
        logger.info(`  ✅ Connection request sent`);
      } else {
        failed++;
        saveToProgress(url, name, 'skipped');
        logger.warn(`  ⏭  Skipped (already connected / follow-only / button not found)`);
      }
    } catch (err: any) {
      failed++;
      saveToProgress(url, name, 'failed', err.message);
      logger.error(`  ❌ Failed: ${err.message}`);
    }

    if (batch.indexOf(profile) < batch.length - 1) {
      const delay = 60_000 + Math.floor(Math.random() * 60_000); // 1–2 min
      logger.info(`  Waiting ${Math.round(delay / 1000)}s before next send...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  await closeBrowser();

  console.log('\n' + '═'.repeat(60));
  console.log(` Apify outreach test complete`);
  console.log(`   Sent:   ${sent}`);
  console.log(`   Skipped/Failed: ${failed}`);
  console.log('═'.repeat(60) + '\n');
}

main().catch(err => {
  logger.error(`Fatal: ${err.message}`);
  closeBrowser().catch(() => {});
  process.exit(1);
});
