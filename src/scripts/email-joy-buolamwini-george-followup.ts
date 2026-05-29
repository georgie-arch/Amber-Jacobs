/**
 * George follows up directly with Dr. Joy Buolamwini re: DEPT Secret Garden panel.
 * Amber had sent the original outreach — this is George reaching out personally.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-joy-buolamwini-george-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

const body = `Hi Joy,

My name is George Guise, founder of Indvstry Clvb. I know my colleague Amber reached out a little while ago, but I wanted to drop you a note directly.

We are hosting a panel called "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions on Wednesday 25 June. It is one of the most senior, invite-only rooms at the festival and the conversation is built around the kind of work you have been leading with the Algorithmic Justice League.

I wanted to ask directly: is there any interest on your end? Even a quick reply either way would be really appreciated.

George Guise
Founder, Indvstry Clvb
Powerhouse.indvstryclvb.com`;

async function main() {
  const token = await getAccessToken();

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject: 'DEPT Secret Garden panel — Cannes Lions 2026',
        body: { contentType: 'Text', content: body },
        toRecipients: [{ emailAddress: { address: 'press@poetofcode.com', name: 'Dr. Joy Buolamwini' } }],
        from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to Dr. Joy Buolamwini from George.');
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
