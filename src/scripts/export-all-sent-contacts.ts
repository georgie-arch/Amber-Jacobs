/**
 * export-all-sent-contacts.ts
 *
 * Crawls every email ever sent from George's Outlook account and builds
 * a complete, de-duplicated list of every person we have ever emailed.
 *
 * Output:
 *   src/data/all-sent-contacts.csv   — opens in Excel / Sheets
 *   src/data/all-sent-contacts.json  — machine-readable for Amber
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/export-all-sent-contacts.ts
 *
 * Progress is printed live — it will page through every message in Sent Items.
 * On a large mailbox this can take a few minutes.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const OUTPUT_DIR = path.resolve(__dirname, '../data');
const CSV_PATH = path.join(OUTPUT_DIR, 'all-sent-contacts.csv');
const JSON_PATH = path.join(OUTPUT_DIR, 'all-sent-contacts.json');

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Read offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ContactRecord {
  name: string;
  email: string;
  firstEmailed: string;   // ISO date of earliest email to them
  lastEmailed: string;    // ISO date of most recent email to them
  timesEmailed: number;
}

// ─── FETCH ALL SENT MESSAGES (paginated) ──────────────────────────────────────

async function fetchAllSentMessages(token: string): Promise<void> {
  // Map of email (lowercase) → ContactRecord
  const contacts = new Map<string, ContactRecord>();

  const baseUrl: string =
    'https://graph.microsoft.com/v1.0/me/mailFolders/SentItems/messages' +
    '?$select=toRecipients,ccRecipients,sentDateTime' +
    '&$top=500' +
    '&$orderby=sentDateTime asc';

  let nextUrl: string | null = baseUrl;
  let page = 1;
  let totalMessages = 0;

  console.log('Fetching sent items — this may take a few minutes on a large mailbox...\n');

  while (nextUrl) {
    const currentUrl: string = nextUrl;
    process.stdout.write(`  Page ${page} — ${totalMessages} messages processed, ${contacts.size} unique contacts so far...\r`);

    const res = await axios.get<{ value: any[]; '@odata.nextLink'?: string }>(currentUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const messages: any[] = res.data.value || [];
    totalMessages += messages.length;

    for (const msg of messages) {
      const sentDate: string = msg.sentDateTime || '';

      // Collect all recipients (To + CC)
      const allRecipients: any[] = [
        ...(msg.toRecipients || []),
        ...(msg.ccRecipients || []),
      ];

      for (const r of allRecipients) {
        const email: string = (r.emailAddress?.address || '').toLowerCase().trim();
        const name: string  = (r.emailAddress?.name || '').trim();

        if (!email || !email.includes('@')) continue;

        // Skip our own address
        const ownEmail = (process.env.EMAIL_USER || '').toLowerCase();
        if (email === ownEmail) continue;

        // Skip obvious automated/noreply addresses
        if (/noreply|no-reply|donotreply|mailer-daemon|postmaster|bounce|notifications@|newsletter@|alerts@/.test(email)) continue;

        const existing = contacts.get(email);
        if (!existing) {
          contacts.set(email, {
            name,
            email,
            firstEmailed: sentDate,
            lastEmailed: sentDate,
            timesEmailed: 1,
          });
        } else {
          // Update with better name if current one is blank
          if (!existing.name && name) existing.name = name;

          // Track first and last contact dates
          if (sentDate && (!existing.firstEmailed || sentDate < existing.firstEmailed)) {
            existing.firstEmailed = sentDate;
          }
          if (sentDate && (!existing.lastEmailed || sentDate > existing.lastEmailed)) {
            existing.lastEmailed = sentDate;
          }

          existing.timesEmailed++;
        }
      }
    }

    // Follow pagination
    nextUrl = res.data['@odata.nextLink'] || null;
    page++;

    // Brief pause to avoid throttling
    if (nextUrl) await sleep(200);
  }

  // Clear the progress line
  process.stdout.write('\n');

  const contactList = Array.from(contacts.values())
    .sort((a, b) => {
      // Sort by last emailed date, most recent first
      if (a.lastEmailed > b.lastEmailed) return -1;
      if (a.lastEmailed < b.lastEmailed) return 1;
      return 0;
    });

  console.log(`\nTotal messages scanned: ${totalMessages}`);
  console.log(`Unique contacts found:  ${contactList.length}\n`);

  // ── Write CSV
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const csvHeader = 'Name,Email,First Emailed,Last Emailed,Times Emailed\n';
  const csvRows = contactList.map(c => {
    const name  = `"${c.name.replace(/"/g, '""')}"`;
    const email = `"${c.email}"`;
    const first = c.firstEmailed ? new Date(c.firstEmailed).toLocaleDateString('en-GB') : '';
    const last  = c.lastEmailed  ? new Date(c.lastEmailed).toLocaleDateString('en-GB')  : '';
    return `${name},${email},${first},${last},${c.timesEmailed}`;
  }).join('\n');

  fs.writeFileSync(CSV_PATH, csvHeader + csvRows, 'utf-8');
  console.log(`CSV saved:  ${CSV_PATH}`);

  // ── Write JSON
  fs.writeFileSync(JSON_PATH, JSON.stringify(contactList, null, 2), 'utf-8');
  console.log(`JSON saved: ${JSON_PATH}`);

  // ── Summary breakdown
  const byYear: Record<string, number> = {};
  for (const c of contactList) {
    const year = c.firstEmailed ? new Date(c.firstEmailed).getFullYear().toString() : 'unknown';
    byYear[year] = (byYear[year] || 0) + 1;
  }

  console.log('\n─── Contacts first emailed by year ─────────────────');
  for (const year of Object.keys(byYear).sort()) {
    console.log(`  ${year}: ${byYear[year]} contacts`);
  }

  // Top 10 most emailed
  const top10 = [...contactList].sort((a, b) => b.timesEmailed - a.timesEmailed).slice(0, 10);
  console.log('\n─── Top 10 most emailed contacts ───────────────────');
  for (const c of top10) {
    console.log(`  ${c.name || c.email} — ${c.timesEmailed} emails`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nIndvstry Clvb — Full Sent Mail Contact Export');
  console.log('═'.repeat(50));

  if (!process.env.OUTLOOK_CLIENT_ID || !process.env.OUTLOOK_REFRESH_TOKEN) {
    console.error('Missing Outlook credentials in .env (OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, OUTLOOK_TENANT_ID, OUTLOOK_REFRESH_TOKEN)');
    process.exit(1);
  }

  console.log('Authenticating with Microsoft Graph API...');
  const token = await getAccessToken();
  console.log('Authenticated.\n');

  await fetchAllSentMessages(token);

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
