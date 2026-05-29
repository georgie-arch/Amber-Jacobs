/**
 * George follows up directly with Asad ur Rehman re: DEPT Secret Garden panel.
 * Amber had sent the original outreach — this is George reaching out personally.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-asad-rehman-george-followup.ts
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

const body = `Hi Asad,

My name is George Guise, founder of Indvstry Clvb. My colleague Amber reached out to you a little while back about our panel at Cannes Lions and I wanted to follow up directly.

We want you for this. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions on Wednesday 25 June — one of the most senior, invite-only rooms at the festival. Your work on media transformation at Unilever and what you are building now with So&So is exactly the kind of real-world perspective this conversation needs.

Would you be up for joining the panel? Happy to jump on a quick call or answer any questions over email.

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
        toRecipients: [{ emailAddress: { address: 'asadchawla@gmail.com', name: 'Asad ur Rehman' } }],
        from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to Asad ur Rehman from George.');
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
