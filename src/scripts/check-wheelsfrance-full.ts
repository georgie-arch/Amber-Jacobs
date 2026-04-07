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
    `https://graph.microsoft.com/v1.0/me/messages?$search="wheelsfrance"&$top=5`,
    { headers }
  );

  const msgs = res.data.value || [];
  for (const m of msgs) {
    const full = await axios.get(
      `https://graph.microsoft.com/v1.0/me/messages/${m.id}?$select=id,subject,from,receivedDateTime,body,conversationId`,
      { headers }
    );
    const bodyContent = full.data.body?.content || '';
    // Strip HTML tags for readability
    const plainText = bodyContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`\nID: ${m.id}`);
    console.log(`From: ${m.from?.emailAddress?.address}`);
    console.log(`Subject: ${m.subject}`);
    console.log(`Date: ${m.receivedDateTime}`);
    console.log(`Body:\n${plainText.substring(0, 1500)}`);
    console.log('===');
  }
}

main().catch(console.error);
