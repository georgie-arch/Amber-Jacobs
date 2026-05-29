/**
 * George follows up directly with Dara Treseder re: DEPT Secret Garden panel.
 * Amber sent the original outreach + one follow-up — this is George reaching out personally.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-dara-treseder-george-followup.ts
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

const body = `Hi Dara,

My name is George Guise, founder of Indvstry Clvb. My colleague Amber reached out a couple of times about our panel at Cannes Lions, and I wanted to follow up directly.

We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden on Wednesday 25 June. It is one of the most senior, invite-only rooms at the festival and your perspective as a CMO who has consistently put culture at the centre of brand strategy is exactly what this conversation needs.

Wanted to ask directly: is there any interest? Happy to keep it brief or jump on a quick call if that is easier.

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
        toRecipients: [{ emailAddress: { address: 'dara.treseder@autodesk.com', name: 'Dara Treseder' } }],
        from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to Dara Treseder from George.');
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
