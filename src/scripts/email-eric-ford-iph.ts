/**
 * Email to Eric Ford (Kiddford@att.net) from George.
 * Tell him about IPH, invite to Diaspora Dinner and residency.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-eric-ford-iph.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function getToken(): Promise<string> {
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

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(body: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const formatted = body
    .split('\n\n')
    .map(para => `<p style="margin:0 0 14px 0;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${formatted}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const emailBody = `Hi Eric,

Really great connecting and looking forward to our call. I wanted to send over a proper introduction to what we are building ahead of us speaking.

I am the founder of Indvstry Clvb, a digital private members club for creative professionals. This June we are taking the community to Cannes Lions with Indvstry Power House, our flagship activation for the week.

Here is what it is: a private luxury villa running 21 to 26 June alongside Cannes Lions festival. We have assembled a curated group of senior creative directors, CMOs, founders and cultural leaders sharing the house for the week. It is a proper base for the right people during the most important week in the global creative calendar.

Here is what the residency includes:

An official Cannes Lions Delegate Pass worth 5,000 euros, included in your stay
A private room in a luxury villa with swimming pool, Mediterranean gardens and premium amenities
Daily transport to and from La Croisette
A fully curated event calendar with priority RSVPs to the best brand houses and panels of the week
Done-for-you event registrations throughout the festival
Access to our Diaspora Dinner and closing party
Networking app credentials giving you access to the full Power House network
Strategic positioning guidance throughout the week

Rooms start from £1,500. You can find the full details and secure your spot here:
https://lu.ma/t4ek2yn7

I would also love to invite you personally to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm in Cannes. It is one of the most intentional evenings of the whole Lions week. A three-course dinner for founders, CEOs and senior leaders from across the creative and brand industry. Very intimate, 30 guests maximum. The kind of room where the real conversations happen.

Grab your ticket here:
https://lu.ma/5vmr7s6f

I am very much looking forward to our call, Eric. There is a lot to talk about and I think there is a real opportunity for us to do something interesting together.`;

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Great connecting — here is what we are building at Cannes',
    body:    { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'Kiddford@att.net', name: 'Eric Ford' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
  };

  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    }];
  }

  try {
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Sent to Eric Ford <Kiddford@att.net>');
  } catch (err: any) {
    console.error(`FAILED: ${err?.response?.data?.error?.message || err.message}`);
  }
}

send().catch(console.error);
