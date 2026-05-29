/**
 * Search Outlook inbox for emails related to DEPT Secret Garden panel contacts
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/search-dept-panel-inbox.ts
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

const keywords = [
  'Derrick Downey', 'DualShot',
  'Tyler Denk', 'beehiiv',
  'Rachel Tipograph', 'MikMak',
  'Laura Ness Owens', 'Bobcat',
  'Kerry Parkin', 'Remarkables',
  'Mary Isokariari', 'Socially Curious',
  'Ruben Schreurs', 'Ebiquity',
  'Serhat Ekinci', 'UNITE', 'Omnicom',
  'Andrew Buckman', 'Publisher Collective',
  'Maria Taylor', 'Creative Media Group',
  'Lana Bedekovic', 'Journal.hr',
  'Paula Grunfeld', 'Bunny Creative',
  'Secret Garden', 'DEPT', 'panel',
];

async function searchInbox(token: string, query: string) {
  const url = `https://graph.microsoft.com/v1.0/me/messages?$search="${encodeURIComponent(query)}"&$select=from,subject,receivedDateTime,bodyPreview&$top=5`;
  const r = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return r.data.value || [];
}

async function run() {
  const token = await getToken();
  const seen = new Set<string>();
  const results: { from: string; email: string; subject: string; date: string; preview: string }[] = [];

  // Search by broad terms first
  const broadQueries = ['Secret Garden DEPT', 'DEPT panel Cannes', 'beehiiv', 'MikMak', 'Ebiquity', 'DualShot', 'Remarkables', 'Bobcat Cannes', 'Socially Curious', 'Publisher Collective', 'Bunny Creative'];

  for (const q of broadQueries) {
    try {
      const messages = await searchInbox(token, q);
      for (const msg of messages) {
        const emailAddr = msg.from?.emailAddress?.address || '';
        const name = msg.from?.emailAddress?.name || '';
        if (!seen.has(emailAddr) && emailAddr) {
          seen.add(emailAddr);
          results.push({
            from: name,
            email: emailAddr,
            subject: msg.subject,
            date: msg.receivedDateTime,
            preview: msg.bodyPreview?.substring(0, 120),
          });
        }
      }
    } catch (e: any) {
      console.error(`Search failed for "${q}": ${e?.response?.data?.error?.message || e.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n===== DEPT PANEL — INBOX CONTACTS FOUND =====\n');
  if (results.length === 0) {
    console.log('No results found.');
  } else {
    results.forEach((r, i) => {
      console.log(`[${i + 1}] ${r.from} <${r.email}>`);
      console.log(`    Subject: ${r.subject}`);
      console.log(`    Date: ${r.date}`);
      console.log(`    Preview: ${r.preview}`);
      console.log();
    });
  }
}

run().catch(console.error);
