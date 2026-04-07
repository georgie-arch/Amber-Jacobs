/**
 * check-inbox-replies.ts
 * Fetch recent inbox messages to identify auto-replies and OOO responses.
 * Run: npx ts-node --project tsconfig.json src/scripts/check-inbox-replies.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Read offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

async function main() {
  const token = await getToken();
  const since = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
  const r = await axios.get(
    `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$filter=receivedDateTime ge ${since}&$orderby=receivedDateTime desc&$top=100&$select=subject,from,receivedDateTime,bodyPreview,body`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const emails = r.data.value;
  console.log(`Found ${emails.length} emails in the last 8 hours:\n`);
  for (const e of emails) {
    console.log('---');
    console.log(`FROM: ${e.from?.emailAddress?.name} <${e.from?.emailAddress?.address}>`);
    console.log(`SUBJECT: ${e.subject}`);
    console.log(`RECEIVED: ${e.receivedDateTime}`);
    console.log(`PREVIEW: ${e.bodyPreview?.substring(0, 600)}`);
    console.log('');
  }
}
main().catch(console.error);
