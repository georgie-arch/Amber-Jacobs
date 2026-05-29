/**
 * Search inbox for bounced emails and delivery failures from outreach campaigns
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/search-bounced-unsent.ts
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

async function search(token: string, query: string) {
  const url = `https://graph.microsoft.com/v1.0/me/messages?$search="${encodeURIComponent(query)}"&$select=from,subject,receivedDateTime,bodyPreview&$top=20`;
  const r = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.value || [];
}

async function run() {
  const token = await getToken();

  const queries = [
    { label: 'Delivery failures / bounces',        query: 'Undeliverable' },
    { label: 'Mailer daemon / bounce',              query: 'Mail Delivery Failed' },
    { label: 'No such user bounces',                query: 'User unknown' },
    { label: 'Address not found bounces',           query: 'address not found' },
    { label: 'Delivery status notification',        query: 'Delivery Status Notification' },
  ];

  console.log('\n===== BOUNCED / UNDELIVERED OUTREACH EMAILS =====\n');

  for (const q of queries) {
    console.log(`\n--- ${q.label} ---`);
    try {
      const msgs = await search(token, q.query);
      if (msgs.length === 0) {
        console.log('  No results.');
      } else {
        for (const msg of msgs) {
          const addr = msg.from?.emailAddress?.address || '';
          const name = msg.from?.emailAddress?.name || '';
          console.log(`  FROM: ${name} <${addr}>`);
          console.log(`  Subject: ${msg.subject}`);
          console.log(`  Date: ${msg.receivedDateTime}`);
          console.log(`  Preview: ${msg.bodyPreview?.substring(0, 200)}`);
          console.log();
        }
      }
    } catch (e: any) {
      console.error(`  Error: ${e?.response?.data?.error?.message || e.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

run().catch(console.error);
