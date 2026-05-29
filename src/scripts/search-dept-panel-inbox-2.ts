/**
 * Second pass — search for remaining DEPT panel contacts not found in first run
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/search-dept-panel-inbox-2.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Read offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

async function searchInbox(token: string, query: string) {
  const url = `https://graph.microsoft.com/v1.0/me/messages?$search="${encodeURIComponent(query)}"&$select=from,subject,receivedDateTime,bodyPreview&$top=5`;
  const r = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.value || [];
}

const targets = [
  { name: 'Derrick Downey',    queries: ['Derrick Downey', 'DualShot'] },
  { name: 'Ruben Schreurs',    queries: ['Ruben Schreurs', 'Ebiquity'] },
  { name: 'Serhat Ekinci',     queries: ['Serhat Ekinci', 'UNITE Omnicom'] },
  { name: 'Andrew Buckman',    queries: ['Andrew Buckman', 'Publisher Collective'] },
  { name: 'Maria Taylor',      queries: ['Maria Taylor', 'Creative Media Group'] },
  { name: 'Lana Bedekovic',    queries: ['Lana Bedekovic', 'Journal.hr'] },
  { name: 'Paula Grunfeld',    queries: ['Paula Grunfeld', 'Bunny Creative'] },
];

async function run() {
  const token = await getToken();

  console.log('\n===== SECOND PASS — DEPT PANEL INBOX SEARCH =====\n');

  for (const target of targets) {
    console.log(`--- ${target.name} ---`);
    let found = false;
    for (const q of target.queries) {
      try {
        const messages = await searchInbox(token, q);
        if (messages.length > 0) {
          for (const msg of messages) {
            const emailAddr = msg.from?.emailAddress?.address || '';
            const name = msg.from?.emailAddress?.name || '';
            console.log(`  FROM: ${name} <${emailAddr}>`);
            console.log(`  Subject: ${msg.subject}`);
            console.log(`  Date: ${msg.receivedDateTime}`);
            console.log(`  Preview: ${msg.bodyPreview?.substring(0, 150)}`);
            console.log();
          }
          found = true;
          break;
        }
      } catch (e: any) {
        console.error(`  Search error for "${q}": ${e?.response?.data?.error?.message || e.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }
    if (!found) console.log('  No emails found in inbox.\n');
  }
}

run().catch(console.error);
