/**
 * email-matt-tuffuor-ben-marett.ts
 *
 * Outreach to:
 *   - Matt Tuffuor (Eventbrite) — Matt.tuffuor@eventbrite.com
 *   - Ben Marett (AU Vodka) — ben.marett@auvodka.co.uk
 * Re: Indvstry Power House, Cannes Lions 2026.
 * From: Amber Jacobs
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-matt-tuffuor-ben-marett.ts
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

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function sendEmail(token: string, to: string, toName: string, subject: string, body: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };
  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

const mattBody = `Hi Matt,

Toasted Life has been doing the community-first events work properly for a decade - and the fact you brought it to Kenya, Ghana, Tanzania shows you understand what it means to build something with real cultural intention, not just a guest list.

I wanted to reach out because we are building something at Cannes Lions this year that sits in that same spirit. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events and closed-door conversations with some of the most senior creative and marketing leaders in the room. We would love to explore what Eventbrite's involvement could look like, and honestly, your perspective on community would be invaluable in that space too.

More here: https://powerhouse.indvstryclvb.com

Are you open to a quick call?

Amber`;

const benBody = `Hi Ben,

The Ibiza activations, the Dubai launch, the yacht party - AU Vodka does experiential better than almost anyone in the spirits space right now. You understand that the brand lives in the room, not the ad.

Cannes Lions this June is the next room worth being in. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. AU Vodka as the spirit of that villa, with the content and the crowd that comes with it, feels like a natural moment.

More here: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call?

Amber`;

async function main() {
  const token = await getToken();

  await sendEmail(token, 'Matt.tuffuor@eventbrite.com', 'Matt Tuffuor', 'Indvstry Power House - Cannes Lions 2026', mattBody);
  console.log('Sent to Matt Tuffuor <Matt.tuffuor@eventbrite.com>');

  await new Promise(resolve => setTimeout(resolve, 2000));

  await sendEmail(token, 'ben.marett@auvodka.co.uk', 'Ben Marett', 'Indvstry Power House - Cannes Lions 2026', benBody);
  console.log('Sent to Ben Marett <ben.marett@auvodka.co.uk>');

  console.log('\nDone.');
}

main().catch(console.error);
