/**
 * One-off: Send Indvstry Power House intro email to Jonelle Awomoyi
 * Run: npx ts-node src/scripts/send-jonelle-email.ts
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

async function sendEmail() {
  console.log('Getting Outlook access token...');
  const accessToken = await getAccessToken();
  console.log('Token obtained.');

  const deckPath = path.resolve('/Users/georgeguise/Downloads/power house Project/Decks/POWER HOUSE DECK - shade borough deck.pdf');
  const deckB64 = fs.readFileSync(deckPath).toString('base64');

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi Jonelle,<br><br>

    I'm Amber, Community Manager at Indvstry Clvb. George passed me your details and asked me to reach out — he wanted to make sure you heard about what we're putting together in Cannes this June.<br><br>

    We're running <strong>Indvstry Power House</strong> — a private villa residency and cultural activation happening across Cannes Lions week, 21-26 June 2026. It's an intimate gathering of 7 senior creatives, founders and executives staying together in a luxury private villa with a pool, daily transport to La Croisette, and a full curated event programme.<br><br>

    The big thing: we've been given 21 official Cannes Lions delegate passes (valued at €5,000 each) and we're sharing them with our villa guests and wider network. Every resident gets one included in their package.<br><br>

    <strong>Here's what residency includes:</strong><br>
    - Official Cannes Lions delegate pass (€5,000 value)<br>
    - Private room in our 7-bedroom luxury villa<br>
    - Daily transport to La Croisette and the Palais<br>
    - Curated RSVPs to priority brand houses, panels and dinners<br>
    - Ticket to our Diaspora Dinner (Tue 23 June)<br>
    - Closing party access and networking app credentials<br><br>

    Rooms start from £1,500 and there are only 7 spots total. A few are already taken.<br><br>

    You can view the full residency page here: <a href="https://lu.ma/t4ek2yn7" style="color:#1a1a1a;">https://lu.ma/t4ek2yn7</a><br><br>

    I've also attached our resident deck so you can get a proper feel for what we're creating.<br><br>

    Are you planning to come to Cannes this year? Would love to know what your plans look like for the week — there may be a great way for us to connect while we're all out there.<br><br>

    And if you'd like to find out more, I'm happy to set up a quick call with someone from our team — just let me know and I'll get something in the diary.<br><br>

    Speak soon,
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;

  const message = {
    subject: 'Indvstry Power House x Cannes Lions 2026 — are you going?',
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: [{ emailAddress: { address: 'hello@jonelleawomoyi.com' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'Amber Jacobs' } },
    attachments: [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'Indvstry Power House - Resident Deck.pdf',
        contentType: 'application/pdf',
        contentBytes: deckB64
      }
    ]
  };

  console.log('Sending email to hello@jonelleawomoyi.com...');
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent successfully to Jonelle Awomoyi.');
}

sendEmail().catch(err => {
  console.error('Failed to send email:', err?.response?.data || err.message);
  process.exit(1);
});
