/**
 * Reply to Lance Frank (lance@beehiiv.com) re: Darren Chait, CMO
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-lance-beehiiv-reply.ts
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
    ${p('Hi Lance,')}
    ${p('Great question, and yes, absolutely. Darren sounds like exactly the right fit for what we are building at the Power House.')}
    ${p('Just so you know where things currently stand: we have put Tyler forward as a potential panellist for DEPT Agency\'s The Secret Garden activation. That one is still in the selection process on their end, so we will circle back to you as soon as we hear from the DEPT team.')}
    ${p('In the meantime, I wanted to flag two things for Darren specifically.')}
    ${p('We are hosting a private dinner on the Tuesday evening of Lions week (23 June) exclusively for Power House residents and their guests. It is an intimate, closed-door evening designed for the kind of conversation that does not happen on the Croisette.')}
    ${p('We are also recommending that Darren attends the <strong>Diaspora Dinner</strong> that same evening. This is one of the standout dinners of the week, a curated room of CEOs, CMOs and senior C-suite leaders from across the industry. The calibre of the guest list makes it genuinely worth attending, and it is a rare opportunity to be in a room that size with that level of seniority in one place. Tickets are available here: <a href="https://lu.ma/5vmr7s6f" style="color:#1a1a1a;">https://lu.ma/5vmr7s6f</a>')}
    ${p('Happy to put Darren\'s name forward for panel consideration too once we hear back from the DEPT team.')}
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

  const message: any = {
    subject: 'Re: TUESDAY, JUNE 23 — Darren Chait & Power House',
    body:    { contentType: 'HTML', content: buildHtml() },
    toRecipients: [{ emailAddress: { address: 'lance@beehiiv.com', name: 'Lance Frank' } }],
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

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Sent to Lance Frank <lance@beehiiv.com>');
}

send().catch(console.error);
