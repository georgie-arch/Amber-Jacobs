/**
 * sync-event-registrations.ts
 *
 * Master sync script for Indvstry Power House event registrations.
 *
 * How it works:
 *   1. Reads all residents from src/data/residents.ts
 *   2. Reads all events + registration status from src/data/event-registrations.json
 *   3. For each event, finds residents who are still "pending" or missing
 *   4. Runs registrations only for those gaps
 *   5. Updates event-registrations.json with results
 *
 * Run this whenever:
 *   - You add a new resident → they get registered to all existing events
 *   - You add a new event to the JSON → all residents get registered for it
 *   - A previous run partially failed → re-run to fill gaps
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/sync-event-registrations.ts
 *
 *   # Dry run (see what would happen without opening a browser):
 *   npx ts-node --project tsconfig.json src/scripts/sync-event-registrations.ts --dry-run
 *
 *   # Register for a single event only:
 *   npx ts-node --project tsconfig.json src/scripts/sync-event-registrations.ts --event "Financial Times Cannes 2026"
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { RESIDENTS } from '../data/residents';
import { registerAllResidents } from '../tools/event-registrar';

const REGISTRATIONS_LOG = path.resolve(__dirname, '../data/event-registrations.json');

interface EventEntry {
  eventName: string;
  eventUrl: string;
  addedDate: string;
  registrations: Record<string, { status: string; date?: string }>;
}

interface RegistrationsLog {
  events: EventEntry[];
}

function loadLog(): RegistrationsLog {
  const raw = fs.readFileSync(REGISTRATIONS_LOG, 'utf-8');
  return JSON.parse(raw) as RegistrationsLog;
}

function getMissingRegistrations(log: RegistrationsLog): { event: EventEntry; missing: string[] }[] {
  const allResidentNames = RESIDENTS.map(r => `${r.firstName} ${r.lastName}`.trim());
  const gaps: { event: EventEntry; missing: string[] }[] = [];

  for (const event of log.events) {
    const missing = allResidentNames.filter(name => {
      const entry = event.registrations[name];
      return !entry || entry.status === 'pending' || entry.status === 'failed';
    });
    if (missing.length > 0) {
      gaps.push({ event, missing });
    }
  }

  return gaps;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const eventFilter = args.find(a => a.startsWith('--event='))?.replace('--event=', '') ||
                      (args.includes('--event') ? args[args.indexOf('--event') + 1] : null);

  console.log('\nIndvstry Power House — Event Registration Sync');
  console.log('═'.repeat(55));
  console.log(`Residents: ${RESIDENTS.length}`);
  if (dryRun) console.log('Mode: DRY RUN (no browser, no registrations)');
  if (eventFilter) console.log(`Filter: "${eventFilter}" only`);
  console.log('');

  const log = loadLog();
  let gaps = getMissingRegistrations(log);

  if (eventFilter) {
    gaps = gaps.filter(g => g.event.eventName.toLowerCase().includes(eventFilter.toLowerCase()));
  }

  if (gaps.length === 0) {
    console.log('All residents are registered for all events.');
    return;
  }

  // Summary of work to do
  console.log('Gaps found:');
  for (const { event, missing } of gaps) {
    console.log(`\n  ${event.eventName}`);
    console.log(`  ${event.eventUrl}`);
    console.log(`  Missing (${missing.length}): ${missing.join(', ')}`);
  }

  if (dryRun) {
    console.log('\nDry run complete — no registrations submitted.');
    return;
  }

  console.log('\nStarting registrations...\n');

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const { event, missing } of gaps) {
    console.log('\n' + '─'.repeat(55));
    console.log(`Event: ${event.eventName}`);
    console.log(`Registering ${missing.length} residents`);

    // Get the Resident objects for the missing names
    const residentsToRegister = RESIDENTS.filter(r =>
      missing.includes(`${r.firstName} ${r.lastName}`.trim())
    );

    // Filter out residents with no email — can't register without one
    const withEmail = residentsToRegister.filter(r => r.email);
    const noEmail = residentsToRegister.filter(r => !r.email);

    if (noEmail.length > 0) {
      console.log(`  Skipping (no email): ${noEmail.map(r => `${r.firstName} ${r.lastName}`).join(', ')}`);
    }

    if (withEmail.length === 0) {
      console.log('  No residents with email to register — skipping event.');
      continue;
    }

    const results = await registerAllResidents(event.eventUrl, event.eventName, withEmail);

    for (const r of results) {
      const icon = r.status === 'success' ? '✅' : '❌';
      console.log(`  ${icon} ${r.name} — ${r.status}`);
      if (r.status === 'success') totalSuccess++;
      else totalFailed++;
    }

    // Mark no-email residents as skipped in the log
    if (noEmail.length > 0) {
      const raw = fs.readFileSync(REGISTRATIONS_LOG, 'utf-8');
      const currentLog = JSON.parse(raw) as RegistrationsLog;
      const eventEntry = currentLog.events.find(e => e.eventUrl === event.eventUrl);
      if (eventEntry) {
        for (const r of noEmail) {
          const name = `${r.firstName} ${r.lastName}`.trim();
          eventEntry.registrations[name] = { status: 'skipped_no_email' };
        }
        fs.writeFileSync(REGISTRATIONS_LOG, JSON.stringify(currentLog, null, 2));
      }
    }
  }

  console.log('\n' + '═'.repeat(55));
  console.log(`Sync complete: ${totalSuccess} registered, ${totalFailed} failed`);

  if (totalFailed > 0) {
    console.log('Re-run this script to retry failed registrations.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
