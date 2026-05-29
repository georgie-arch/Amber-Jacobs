/**
 * Post-call email to Tara (tara@opal22.co.uk) from George.
 * Sends the IPH Residents Only deck, walks through the full package,
 * and asks about her Windrush event in Leicester.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-tara-iph-residents-deck.ts
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

const emailBody = `Hi Tara,

Really great speaking with you the other day. As promised, I have put everything together so you have the full picture in one place.

I have attached our residents deck which gives you the complete breakdown of the experience. Here is everything that is included in your package:

An official Cannes Lions Delegate Pass worth 5,000 euros. This alone covers the cost of the residency.
A private room in our luxury villa complete with swimming pool, Mediterranean gardens and premium amenities.
Daily transport to and from La Croisette throughout the week.
A fully curated event calendar with priority RSVPs to brand houses, panels and activations across the festival.
A ticket to our private Diaspora Dinner on Tuesday 23 June, 6 to 9pm. One of the standout evenings of the whole week.
Access to our closing party.
Networking app credentials giving you access to the full Power House network.
Strategic positioning guidance throughout the week so you get the most out of every day.

Residency packages start from £1,500. You can find all the details and secure your spot here:
https://lu.ma/t4ek2yn7

Tara, I would love to get you confirmed. The group coming together this year is genuinely exciting and I think it would be a brilliant week for you.

On another note, I would love to hear more about your upcoming Windrush event in Leicester. It sounds like something really special and I would love to explore how I can support it. Please do send me the details when you get a chance.

Looking forward to hearing from you.`;

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const deckPath = "/Users/georgeguise/Downloads/power house Project/Decks/POWER HOUSE DECK - RESIDENTS ONLY.pdf";
  let deckB64 = '';
  try {
    deckB64 = fs.readFileSync(deckPath).toString('base64');
    console.log('Residents deck loaded successfully');
  } catch {
    console.warn('Could not load residents deck PDF — sending without attachment');
  }

  const message: any = {
    subject: 'Everything you need — Indvstry Power House, Cannes',
    body:    { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'tara@opal22.co.uk', name: 'Tara' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
  };

  const attachments: any[] = [];

  if (logoB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    });
  }

  if (deckB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'Indvstry Power House — Residents Deck.pdf',
      contentType:   'application/pdf',
      contentBytes:  deckB64,
      isInline:      false,
    });
  }

  if (attachments.length) message.attachments = attachments;

  try {
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Sent to Tara <tara@opal22.co.uk>');
  } catch (err: any) {
    console.error(`FAILED: ${err?.response?.data?.error?.message || err.message}`);
  }
}

send().catch(console.error);
