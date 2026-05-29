/**
 * IPH outreach to Anthony Hutchinson (tmpflagship@gmail.com)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-anthony-hutchinson-iph.ts
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
    ${p('Hi Anthony,')}
    ${p('Quick one, are you still up for joining us at the Indvstry Power House villa in Cannes, 21 to 26 June, with the delegate pass included?')}
    ${p('Spots are very limited and we want to get the right people locked in. If you are keen, book a call with us this week and we can get you sorted.')}
    ${p('<strong><a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">Book here: calendly.com/itsvisionnaire/30min</a></strong>')}
    ${p('The Power House is a curated residency built specifically for founders, entrepreneurs and builders, the people who are actually creating things. It is a private villa just outside the Palais, a proper base with good people, great energy and the kind of conversations that do not happen in the official festival spaces.')}
    ${p('Alongside the residency, we also want to put one event on your radar: the <strong>Diaspora Dinner</strong> on Tuesday 23 June, 6 to 9pm in Cannes. This is one of the standout evenings of the whole week. The room is a mix of founders, CEOs, CMOs and senior leaders from across the industry, genuinely one of the best curated guest lists at Lions. Tickets are available here and we think it is absolutely worth attending: <a href="https://lu.ma/5vmr7s6f" style="color:#1a1a1a;">https://lu.ma/5vmr7s6f</a>')}
    ${p('We cannot wait to meet you in person on the Croisette. Let us know if you have any questions in the meantime.')}
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
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body:    { contentType: 'HTML', content: buildHtml() },
    toRecipients: [{ emailAddress: { address: 'tmpflagship@gmail.com', name: 'Anthony Hutchinson' } }],
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

  console.log('Sent to Anthony Hutchinson <tmpflagship@gmail.com>');
}

send().catch(console.error);
