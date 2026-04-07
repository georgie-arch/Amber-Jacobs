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
  const r = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="Industry Exchange"&$top=5&$select=subject,from,receivedDateTime,body`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );
  for (const e of r.data.value) {
    console.log(`FROM: ${e.from?.emailAddress?.address} | SUBJECT: ${e.subject}`);
    const text = e.body?.content?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 800);
    console.log(`BODY: ${text}\n---`);
  }
}
main().catch(console.error);
