/**
 * Targeted search for Paula Grunfeld, Ruben Schreurs, Serhat Ekinci, Andrew Buckman inbound emails
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/search-paula-ruben-serhat-andrew.ts
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

async function searchMessages(token: string, query: string) {
  const url = `https://graph.microsoft.com/v1.0/me/messages?$search="${encodeURIComponent(query)}"&$select=from,subject,receivedDateTime,bodyPreview&$top=8`;
  const r = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.value || [];
}

async function run() {
  const token = await getToken();

  const searches = [
    { label: 'Paula Grunfeld (direct)',    query: 'from:bunnycreative.com' },
    { label: 'Paula Grunfeld (name)',       query: 'Paula Grunfeld Cannes' },
    { label: 'Ruben Schreurs (direct)',     query: 'from:ebiquity.com' },
    { label: 'Ruben Schreurs (name)',       query: 'Ruben Schreurs' },
    { label: 'Serhat Ekinci (direct)',      query: 'from:omnicomgroup.com' },
    { label: 'Serhat Ekinci (name)',        query: 'Serhat Ekinci' },
    { label: 'Andrew Buckman (direct)',     query: 'from:publisher-collective.com' },
    { label: 'Andrew Buckman (name)',       query: 'Andrew Buckman' },
  ];

  for (const s of searches) {
    console.log(`\n--- ${s.label} ---`);
    try {
      const msgs = await searchMessages(token, s.query);
      if (msgs.length === 0) {
        console.log('  No results.');
      } else {
        for (const msg of msgs) {
          const addr = msg.from?.emailAddress?.address || '';
          const name = msg.from?.emailAddress?.name || '';
          if (!addr.includes('access@indvstryclvb') && !addr.includes('EXCHANGELABS')) {
            console.log(`  FROM: ${name} <${addr}>`);
            console.log(`  Subject: ${msg.subject}`);
            console.log(`  Date: ${msg.receivedDateTime}`);
            console.log(`  Preview: ${msg.bodyPreview?.substring(0, 120)}`);
          }
        }
      }
    } catch (e: any) {
      console.error(`  Error: ${e?.response?.data?.error?.message || e.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

run().catch(console.error);
