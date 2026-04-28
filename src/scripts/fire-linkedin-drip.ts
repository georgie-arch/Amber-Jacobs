/**
 * fire-linkedin-drip.ts
 *
 * Sends LinkedIn connection requests to all contacts in cannes-linkedin-outreach.json.
 * Safe daily limits, resume support, human-like delays.
 *
 * Progress is saved after every send — safe to Ctrl+C and resume.
 *
 * Run:   npx ts-node --project tsconfig.json src/scripts/fire-linkedin-drip.ts
 * Flags: --limit=N    Override per-run cap (default 50)
 *        --dry-run    Log what would be sent without touching LinkedIn
 *        --offset=N   Skip first N contacts (manual override)
 */

import fs from 'fs';
import path from 'path';
import { getLinkedInBrowser, browserSendConnectionRequest, closeBrowser } from '../integrations/linkedin-browser';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const OUTREACH_FILE  = path.resolve(__dirname, '../data/cannes-linkedin-outreach.json');
const PROGRESS_FILE  = path.resolve(__dirname, '../data/linkedin-drip-progress.json');

const DEFAULT_LIMIT  = 15;    // Conservative daily limit — LinkedIn flags >20/day from automation
const MIN_DELAY_MS   = 5 * 60_000;   // 5 min minimum between connections
const MAX_DELAY_MS   = 10 * 60_000;  // 10 min maximum — looks like real browsing
// Longer pause every 5 sends — mimics taking a break / reading feed
const SHORT_PAUSE_MS = 20 * 60_000; // 20 min rest every 5 sends

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface OutreachRecord {
  name: string;
  firstName: string;
  title: string;
  company: string;
  linkedin: string;
  segment: string;
  connectionRequest: string;
  dmMessage: string;
}

interface ProgressEntry {
  name: string;
  linkedin: string;
  status: 'sent' | 'skipped' | 'failed' | 'pending' | 'already_connected';
  sentAt?: string;
  error?: string;
}

interface ProgressFile {
  lastRun: string;
  totalSent: number;
  entries: Record<string, ProgressEntry>; // keyed by linkedin URL
}

// ─── PROGRESS HELPERS ────────────────────────────────────────────────────────

function loadProgress(): ProgressFile {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return { lastRun: '', totalSent: 0, entries: {} };
  }
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

function saveProgress(progress: ProgressFile): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const offsetArg = args.find(a => a.startsWith('--offset='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : DEFAULT_LIMIT;
  const manualOffset = offsetArg ? parseInt(offsetArg.split('=')[1], 10) : 0;

  if (isDryRun) logger.info('🧪 DRY RUN — no connections will be sent');

  // Only run during UK business hours to mimic natural usage
  const ukHour = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', hour: 'numeric', hour12: false });
  const hour = parseInt(ukHour, 10);
  if (!isDryRun && (hour < 9 || hour >= 18)) {
    logger.warn(`Outside UK business hours (${hour}:xx BST) — exiting. Run between 9am–6pm to avoid detection.`);
    process.exit(0);
  }

  // Load data
  const outreach: OutreachRecord[] = JSON.parse(fs.readFileSync(OUTREACH_FILE, 'utf-8'));
  const progress = loadProgress();

  // Filter to pending contacts only
  const pending = outreach.filter(r => {
    if (!r.linkedin) return false;
    const entry = progress.entries[r.linkedin];
    // Skip if already sent, pending, or already connected
    return !entry || entry.status === 'failed';
  });

  const batch = pending.slice(manualOffset, manualOffset + limit);

  logger.info(`\n${'─'.repeat(60)}`);
  logger.info(`LinkedIn Drip — ${new Date().toISOString()}`);
  logger.info(`Total contacts : ${outreach.length}`);
  logger.info(`Already sent   : ${Object.values(progress.entries).filter(e => e.status === 'sent').length}`);
  logger.info(`Pending        : ${pending.length}`);
  logger.info(`This run cap   : ${limit}`);
  logger.info(`This batch     : ${batch.length}`);
  logger.info(`${'─'.repeat(60)}\n`);

  if (batch.length === 0) {
    logger.info('Nothing to send — all contacts processed.');
    return;
  }

  if (!isDryRun && !process.env.LINKEDIN_LI_AT_COOKIE) {
    logger.error('LINKEDIN_LI_AT_COOKIE not set in .env — cannot proceed.');
    process.exit(1);
  }

  const browser = isDryRun ? null : await getLinkedInBrowser();

  let sentThisRun = 0;
  let skippedThisRun = 0;
  let failedThisRun = 0;

  for (let i = 0; i < batch.length; i++) {
    const record = batch[i];
    const pos = `[${i + 1}/${batch.length}]`;

    logger.info(`\n${pos} ${record.name} (${record.segment})`);
    logger.info(`  ${record.linkedin}`);
    logger.info(`  Note: "${record.connectionRequest.substring(0, 80)}..."`);

    if (isDryRun) {
      logger.info('  [DRY RUN] Would send connection request');
      progress.entries[record.linkedin] = {
        name: record.name,
        linkedin: record.linkedin,
        status: 'pending',
      };
      sentThisRun++;
      continue;
    }

    let success = false;
    let errorMsg = '';

    try {
      success = await browserSendConnectionRequest(browser!, record.linkedin, record.connectionRequest);
    } catch (err: any) {
      errorMsg = err.message;
      logger.error(`  Error: ${errorMsg}`);
    }

    const status: ProgressEntry['status'] = success ? 'sent' : (errorMsg ? 'failed' : 'skipped');

    progress.entries[record.linkedin] = {
      name: record.name,
      linkedin: record.linkedin,
      status,
      sentAt: success ? new Date().toISOString() : undefined,
      error: errorMsg || undefined,
    };

    if (success) {
      progress.totalSent++;
      sentThisRun++;
    } else if (status === 'failed') {
      failedThisRun++;
    } else {
      skippedThisRun++;
    }

    progress.lastRun = new Date().toISOString();
    saveProgress(progress);

    // Every 5 sends take a longer pause to look human
    if (success && sentThisRun % 5 === 0 && i < batch.length - 1) {
      logger.info(`\n  Pausing ${SHORT_PAUSE_MS / 60000} min after every 5 sends...`);
      await new Promise(r => setTimeout(r, SHORT_PAUSE_MS + Math.floor(Math.random() * 30_000)));
      continue;
    }

    // Regular inter-request delay
    if (i < batch.length - 1) {
      const delay = MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
      logger.info(`  Next in ${Math.round(delay / 1000)}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  if (!isDryRun && browser) await closeBrowser();

  // ─── Summary ──────────────────────────────────────────────────────────────
  const totalSent = Object.values(progress.entries).filter(e => e.status === 'sent').length;
  const totalRemaining = outreach.filter(r => {
    const e = progress.entries[r.linkedin];
    return !e || e.status === 'failed';
  }).length;

  logger.info(`\n${'═'.repeat(60)}`);
  logger.info(`Run complete`);
  logger.info(`  Sent this run   : ${sentThisRun}`);
  logger.info(`  Skipped         : ${skippedThisRun}`);
  logger.info(`  Failed          : ${failedThisRun}`);
  logger.info(`  Total sent ever : ${totalSent}`);
  logger.info(`  Remaining       : ${totalRemaining}`);

  if (totalRemaining > 0) {
    const runsLeft = Math.ceil(totalRemaining / limit);
    logger.info(`  Runs to finish  : ~${runsLeft} (at ${limit}/run)`);
    logger.info(`\n  Re-run to continue: npx ts-node --project tsconfig.json src/scripts/fire-linkedin-drip.ts`);
  } else {
    logger.info(`\n  All ${outreach.length} contacts processed.`);
  }
  logger.info(`${'═'.repeat(60)}\n`);
}

main().catch(err => {
  logger.error(`Fatal: ${err.message}`);
  process.exit(1);
});
