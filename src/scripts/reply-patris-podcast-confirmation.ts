import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MSG_ID = 'AAMkAGQ0YzBjNjQyLWNiYjktNGViZi1iMTlmLTNjY2ZmMjcwNjhmMABGAAAAAABc0NhjdSMQQr10DEVFlFItBwDl3AXJPdYMTJUUDw_0zGCuAAAAAAEMAADl3AXJPdYMTJUUDw_0zGCuAALGhWLXAAA=';

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send Mail.ReadWrite offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

const replyText = `Hi Patris,

Thanks for confirming us for the podcast recording at Cannes. Really appreciate you getting that locked in.

The timing works perfectly for myself and my team. I just need to check in with one of our guests to make sure they can make that slot. I should be able to come back to you with a full confirmation next week or at the beginning of the week after.

In the meantime, here is where we are with the lineup:

Host: Dinalva Tavares, our Indvstry Clvb host

Guests confirmed so far:
- Latoya Shambo, creator of the Creator-Palooza Award Show (Atlanta)
- Anthony Okoro, Head of New Business at eBay
- Cyril Lutterodt, 30 Under 30 VC and founder

We are planning for 1 host and 3 guests. Our crew will be 3 people: a director of photography, a photographer, and a producer. We will bring a hard drive to collect the files on the day.

Myself and the team are genuinely excited about this one. As soon as the final guest confirms I will let you know in good time.

Speak soon,

George
Indvstry Clvb`;

async function main() {
  const token = await getAccessToken();

  await axios.post(
    `https://graph.microsoft.com/v1.0/me/messages/${MSG_ID}/reply`,
    {
      message: {
        from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
        body: { contentType: 'Text', content: replyText },
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Reply sent to Patris Gordon in-thread as George.');
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
