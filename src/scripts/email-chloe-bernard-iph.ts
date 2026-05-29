/**
 * Email to Chloe Bernard (Chloetry@hotmail.co.uk) from George.
 * LinkedIn connection — journalist, festivals background, attending Cannes.
 * Tell her about IPH, invite to residency and Diaspora Dinner.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-chloe-bernard-iph.ts
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

const emailBody = `Hi Chloe,

Great connecting on LinkedIn. Really love your background — festivals, events and journalism is a brilliant combination and exactly the kind of perspective we want around us in Cannes.

Let me tell you what we are doing.

I run Indvstry Clvb, a digital private members club for creative professionals. This June we are taking the community to Cannes Lions with Indvstry Power House, our private villa activation running 21 to 26 June alongside the festival.

The villa is a curated group of creative directors, founders, brand leaders and cultural voices sharing a private luxury residence for the week. It is a proper base, but it is also a community in itself. The kind of people and conversations that do not happen in the official festival spaces.

Here is what the residency includes:

An official Cannes Lions Delegate Pass worth 5,000 euros, included in your stay
A private room in a luxury villa with swimming pool and Mediterranean gardens
Daily transport to La Croisette
A curated event calendar with priority RSVPs to the best brand houses and sessions of the week
Done-for-you event registrations throughout the festival
Access to our Diaspora Dinner and closing party
Networking app credentials
Strategic positioning guidance throughout the week

Rooms start from £1,500. With your background in festivals and events, and the fact you are already heading to Cannes, I think you would get a huge amount out of the week with us. You can find all the details and secure your spot here:
https://lu.ma/t4ek2yn7

I would also love to invite you to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm in Cannes. It is one of the standout evenings of the whole Lions week. An intimate three-course dinner for founders, journalists, creatives and senior industry leaders. 30 guests maximum. Very curated, very intentional. Grab a ticket here:
https://lu.ma/5vmr7s6f

If you want to have a proper conversation before the festival, jump on a quick call with me here:
https://calendly.com/itsvisionnaire/30min

Looking forward to seeing you in the south of France, Chloe.`;

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Great connecting — here is what we are doing at Cannes',
    body:    { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'Chloetry@hotmail.co.uk', name: 'Chloe Bernard' } }],
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
    console.log('Sent to Chloe Bernard <Chloetry@hotmail.co.uk>');
  } catch (err: any) {
    console.error(`FAILED: ${err?.response?.data?.error?.message || err.message}`);
  }
}

send().catch(console.error);
