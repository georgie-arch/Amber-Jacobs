/**
 * find-dept-email.ts
 * Searches inbox and sent items for any emails to/from DEPT Agency.
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Read offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function searchFolder(token: string, folder: string, label: string): Promise<void> {
  const res = await axios.get(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${folder}/messages`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        $search: '"dept" OR "deptagency"',
        $select: 'subject,from,toRecipients,receivedDateTime,sentDateTime,body',
        $top: 20,
      },
    }
  );

  const messages: any[] = res.data.value || [];
  const dept = messages.filter((m: any) => {
    const from = (m.from?.emailAddress?.address || '').toLowerCase();
    const to = (m.toRecipients || []).map((r: any) => r.emailAddress?.address?.toLowerCase()).join(' ');
    const subject = (m.subject || '').toLowerCase();
    return from.includes('dept') || to.includes('dept') || subject.includes('dept');
  });

  if (dept.length === 0) {
    console.log(`  ${label}: no DEPT emails found`);
    return;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${label} — ${dept.length} email(s) found`);
  console.log('═'.repeat(60));

  for (const m of dept) {
    const date = m.receivedDateTime || m.sentDateTime || '';
    const from = m.from?.emailAddress ? `${m.from.emailAddress.name} <${m.from.emailAddress.address}>` : 'Unknown';
    const to = (m.toRecipients || []).map((r: any) => `${r.emailAddress?.name} <${r.emailAddress?.address}>`).join(', ');
    const body = stripHtml(m.body?.content || '').substring(0, 1500);

    console.log(`\nDate:    ${new Date(date).toLocaleString('en-GB')}`);
    console.log(`From:    ${from}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${m.subject}`);
    console.log(`\n${body}`);
    if (body.length >= 1500) console.log('\n[... truncated — full email longer than shown]');
    console.log('\n' + '─'.repeat(60));
  }
}

async function main() {
  console.log('\nSearching for DEPT Agency emails...\n');
  const token = await getAccessToken();

  await searchFolder(token, 'inbox', 'INBOX');
  await searchFolder(token, 'SentItems', 'SENT');

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
