import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getToken() {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

async function main() {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const res = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="travel limousines"&$top=10`,
    { headers }
  );

  const msgs = res.data.value || [];
  console.log(`Found ${msgs.length} messages:`);
  for (const m of msgs) {
    console.log(`\nID: ${m.id}`);
    console.log(`From: ${m.from?.emailAddress?.name} <${m.from?.emailAddress?.address}>`);
    console.log(`Subject: ${m.subject}`);
    console.log(`Date: ${m.receivedDateTime}`);
    console.log(`Preview: ${m.bodyPreview?.substring(0, 500)}`);
    console.log('---');
  }
}
main().catch(console.error);
