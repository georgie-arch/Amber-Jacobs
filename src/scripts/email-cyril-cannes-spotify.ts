import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

const bodyText = `Hey Cyril,

Hope you're good. I texted you but haven't heard back. Give me a call when you get a chance.

Wanted to flag a couple of things:

First, I've secured a podcast slot with Spotify on the Monday of Cannes Lions (22 June). I'd love to know if that's of any interest to you, or if you have any guests you think would be worth putting forward. Would be good to get the right people on it.

Second, I have a call with DEPT Agency tomorrow and I need some new speaker names to bring to the table. If you have anyone you can suggest, let's get that locked in before I jump on the call.

Speak soon,

George
Indvstry Clvb`;

async function main() {
  const token = await getAccessToken();

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject: 'Quick one — Spotify podcast slot + DEPT speakers',
        body: { contentType: 'Text', content: bodyText },
        toRecipients: [{ emailAddress: { address: 'cyrillutterodt@gmail.com', name: 'Cyril' } }],
        from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to Cyril from George.');
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
