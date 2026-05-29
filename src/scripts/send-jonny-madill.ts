import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
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
  return response.data.access_token;
}

async function main() {
  const FROM_ADDRESS = 'access@indvstryclvb.com';
  const FROM_NAME = 'George Guise';
  const CALENDLY = 'https://calendly.com/itsvisionnaire/30min';
  const DECK_LINK = 'https://canva.link/56bgbawj3ctalgu';

  const bodyText = `Hi Jonny,

Great connecting with you on LinkedIn — and sorry again about the venue situation, that is stressful to deal with last minute.

As promised, here is the full deck on the Indvstry Power House villa so you can get a proper sense of the space, layout and everything it comes with:

View the deck here: ${DECK_LINK}
(You can also download the PDF directly from that link)

The villa is a 7-bedroom luxury property with a private pool, indoor and outdoor dining, full event space, AC and WiFi — well set up for a private breakfast of 30-40 people. As I mentioned, the space is absolutely free in the morning window you need (9-11am on Tuesday 23rd) as our programme does not kick off until the evening.

I think this could work really well and would love to lock it in with you. Let's jump on a call — grab a time here that works for you: ${CALENDLY}

Speak soon,

George Guise
Founder, Indvstry Clvb`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    <p>Hi Jonny,</p>
    <p>Great connecting with you on LinkedIn — and sorry again about the venue situation, that is stressful to deal with last minute.</p>
    <p>As promised, here is the full deck on the Indvstry Power House villa so you can get a proper sense of the space, layout and everything it comes with:</p>
    <p style="margin:20px 0;"><a href="${DECK_LINK}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;display:inline-block;">View the Residency Deck</a></p>
    <p style="font-size:12px;color:#888;">(You can also download the PDF directly from that link)</p>
    <p>The villa is a 7-bedroom luxury property with a private pool, indoor and outdoor dining, full event space, AC and WiFi — well set up for a private breakfast of 30-40 people. As I mentioned, the space is absolutely free in the morning window you need (9-11am on Tuesday 23rd) as our programme does not kick off until the evening.</p>
    <p>I think this could work really well and would love to lock it in with you. Let's jump on a call — grab a time here that works for you: <a href="${CALENDLY}" style="color:#1a1a1a;">${CALENDLY}</a></p>
    <p>Speak soon,</p>
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
  </div>
</body>
</html>`;

  const accessToken = await getAccessToken();

  const message = {
    subject: 'Indvstry Power House — Villa Deck + Let\'s Get on a Call',
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: [
      { emailAddress: { address: 'jonny.madill@sheridans.co.uk' } },
    ],
    from: { emailAddress: { address: FROM_ADDRESS, name: FROM_NAME } },
  };

  console.log('Sending to jonny.madill@sheridans.co.uk...');
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  console.log('✅ Email sent to Jonny Madill');
}

main().catch(err => {
  console.error('❌ Error:', err?.response?.data || err.message);
  process.exit(1);
});
