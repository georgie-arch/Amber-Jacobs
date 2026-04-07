/**
 * email-powerhouse-cold-outreach.ts
 *
 * Cold outreach to heads of marketing at 5 brands re: Indvstry Power House, Cannes Lions 2026.
 * From: George Guise
 *
 * Recipients:
 *   - Mélanie Lafarge (POSCA / Mitsubishi Pencil Europe) — melaniel@uniball.fr
 *   - Antoine Le Nel (Revolut) — antoine.lenel@revolut.com
 *   - Nick Karrat (StockX) — nickkarrat@stockx.com
 *   - Peter Kingsley (Logitech G) — pkingsley@logitech.com
 *   - Murielle Dessenis (Monkey 47 / Pernod Ricard) — murielle.dessenis@pernod-ricard.com
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-powerhouse-cold-outreach.ts
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
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
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
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

function buildBody(firstName: string, company: string): string {
  return `Hi ${firstName},

I wanted to reach out because we are doing something really exciting at Cannes Lions this year and I think ${company} would be a natural fit.

Indvstry Power House is a private villa activation running alongside Cannes Lions - five days of curated events, closed-door conversations and genuine connection with some of the most senior creative and marketing leaders at the festival. We have a strong lineup already in place and are building something that goes well beyond the usual Croisette noise.

You can see what we are building here: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you to talk through how ${company} could be involved. Are you open to a call?

George`;
}

const SUBJECT = 'Indvstry Power House - Cannes Lions 2026';

const recipients = [
  { name: 'Melanie Lafarge', firstName: 'Melanie', company: 'POSCA', email: 'melaniel@uniball.fr' },
  { name: 'Antoine Le Nel', firstName: 'Antoine', company: 'Revolut', email: 'antoine.lenel@revolut.com' },
  { name: 'Nick Karrat', firstName: 'Nick', company: 'StockX', email: 'nickkarrat@stockx.com' },
  { name: 'Peter Kingsley', firstName: 'Peter', company: 'Logitech', email: 'pkingsley@logitech.com' },
  { name: 'Murielle Dessenis', firstName: 'Murielle', company: 'Monkey 47', email: 'murielle.dessenis@pernod-ricard.com' },
];

async function main() {
  const token = await getToken();

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const body = buildBody(r.firstName, r.company);
    await sendEmail(token, r.email, r.name, SUBJECT, body);
    console.log(`[${i + 1}/${recipients.length}] Sent to ${r.name} <${r.email}>`);
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\nDone. 5 emails sent.');
}

main().catch(console.error);
