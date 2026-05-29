/**
 * George follows up with Rakia Finley (Coppervine) after no response post-call (~3 weeks).
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-rakia-finley-george-followup.ts
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

const body = `Hi Rakia,

Hope you are doing well. We spoke around three weeks ago and I have not heard back from you since, so I just wanted to check in.

No pressure at all -- I know things get busy. I am just keen to know if you are still interested, or if the timing is off right now. Either way, completely fine, it would just be good to know.

If you want to pick up where we left off, happy to jump on a quick call or keep it over email, whatever works best for you.

George Guise
Founder, Indvstry Clvb`;

async function main() {
  const token = await getAccessToken();

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject: 'Checking in',
        body: { contentType: 'Text', content: body },
        toRecipients: [{ emailAddress: { address: 'rakia@coppervine.io', name: 'Rakia Finley' } }],
        from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Follow-up email sent to Rakia Finley from George.');
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
