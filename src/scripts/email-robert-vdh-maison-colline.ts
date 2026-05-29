/**
 * Outreach to Robert Van Den Heuvel re: Maison de la Colline x Indvstry Power House
 * Sending to publicisgroupe.com (best guess) + avolve.io (startup)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-robert-vdh-maison-colline.ts
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

function buildHtml(): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const p = (text: string) => `<p style="margin:0 0 14px 0;">${text}</p>`;

  const content = `
    ${p('Hi Robert,')}
    ${p('My name is Amber Jacobs and I am reaching out from Indvstry Clvb.')}
    ${p('We are running <strong>Indvstry Power House</strong> — a private villa activation during Cannes Lions 2026, 21 to 26 June. A curated residency for a small group of senior creative, cultural and brand leaders, set just outside the Palais. Private dinners, closed-door conversations, and a proper base away from the main festival noise.')}
    ${p('We came across Maison de la Colline and we think it would be a natural fit as a wine partner for the experience. The villa setting, the intimacy of the programming, and the calibre of the people in the room feel genuinely aligned with what the brand represents.')}
    ${p('We are looking for a wine partner to be present throughout the week — bottles at dinners, branding in the space, and association with some of the most senior creative and marketing leaders at Lions. It is a small room by design, but the quality of the audience and the access it provides is significant.')}
    ${p('Would love to have a quick conversation if this feels like something worth exploring. You can book a call directly with our founder George here: <a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">calendly.com/itsvisionnaire/30min</a>')}
    ${p('Looking forward to hearing from you.')}
  `;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${content}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  const subject = 'Maison de la Colline x Indvstry Power House — Cannes Lions 2026';

  const recipients = [
    { address: 'robert.vandenheuvel@publicisgroupe.com', name: 'Robert Van Den Heuvel' },
    { address: 'robert@avolve.io',                       name: 'Robert Van Den Heuvel' },
  ];

  for (const to of recipients) {
    const message: any = {
      subject,
      body:    { contentType: 'HTML', content: buildHtml() },
      toRecipients: [{ emailAddress: to }],
      from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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
      console.log(`Sent to ${to.address}`);
    } catch (err: any) {
      console.error(`FAILED ${to.address}: ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(r => setTimeout(r, 1500));
  }
}

send().catch(console.error);
