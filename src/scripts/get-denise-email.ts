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
    `https://graph.microsoft.com/v1.0/me/messages?$search="Denise.Boateng@informa.com"&$top=5&$select=id,subject,from,receivedDateTime,body,conversationId`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );
  const e = r.data.value.find((m: any) => m.from?.emailAddress?.address?.toLowerCase().includes('boateng'))
    || r.data.value[0];
  if (!e) { console.log('Not found'); return; }
  console.log(`ID: ${e.id}`);
  console.log(`FROM: ${e.from?.emailAddress?.name} <${e.from?.emailAddress?.address}>`);
  console.log(`SUBJECT: ${e.subject}`);
  console.log(`RECEIVED: ${e.receivedDateTime}`);
  const text = e.body?.content?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`\nBODY:\n${text}`);
}
main().catch(console.error);
