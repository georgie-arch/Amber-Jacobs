/**
 * get-email-body.ts — fetch full body of a specific email by subject/sender
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
    `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$filter=receivedDateTime ge ${since} and from/emailAddress/address eq 'eliana@audion.fm'&$select=subject,from,receivedDateTime,body`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const emails = r.data.value;
  for (const e of emails) {
    console.log(`FROM: ${e.from?.emailAddress?.name} <${e.from?.emailAddress?.address}>`);
    console.log(`SUBJECT: ${e.subject}`);
    // Strip HTML tags for readability
    const text = e.body?.content?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`BODY:\n${text}`);
  }
}
main().catch(console.error);
