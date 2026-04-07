/**
 * email-fashion-brands-cannes.ts
 *
 * Outreach to fashion brands/press contacts re: creator styling at Indvstry Power House, Cannes 2026.
 * From: Amber Jacobs
 *
 * Recipients:
 *   - LaQuan Smith PR (Purple PR)         — LAQUANSMITH@PURPLEPR.COM
 *   - Norma Kamali press                   — 1PRESS@NORMAKA-MALI.COM
 *   - Charlotte Bristow (Michael Kors)     — CHARLOTTE.BRISTOW@MICHAELKORS.COM
 *   - Cucculelli Shaheen press             — PRESS@CU-SH.COM
 *   - Dennis Basso (Anchor Communication) — DENNISBASSO@AN-CHORCOMMUNICATION.COM
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-fashion-brands-cannes.ts
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

const SUBJECT = 'Indvstry Power House x Cannes Lions 2026 - Creator Styling Opportunity';

const laquanBody = `Hi,

I wanted to reach out on behalf of Indvstry Power House about an opportunity we think is a brilliant fit for LaQuan Smith this summer.

We are taking a curated group of creators to Cannes Lions this June through Indvstry Power House - our private villa activation running alongside the festival. It is five days of events, content and culture in the south of France with some of the most influential creative people in the room.

LaQuan Smith's aesthetic - bold, sensual, unapologetically glamorous - is made for a moment like Cannes. The opportunity is getting those pieces on the right creators in the right setting, with editorial-quality content being made organically throughout the week. For a brand worn by Beyonce and Rihanna, Cannes in June is the natural next chapter.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a quick call to talk through what this could look like. Are you open to it?

Amber`;

const normaBody = `Hi,

I wanted to reach out about an opportunity we think is a wonderful fit for Norma Kamali this summer.

We are taking a curated group of creators to Cannes Lions this June through Indvstry Power House - our private villa activation running alongside the festival. Five days of events, content and culture in the south of France with some of the most influential creative people in the room.

Norma Kamali's legacy of innovative, body-confident design feels perfectly at home in a setting like Cannes - and we would love to get those pieces on creators who can bring them to life in a way that feels authentic, not staged. Organic, editorial-quality content from the Croisette, made by people who genuinely love the brand.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a quick call to talk through what this could look like. Are you open to it?

Amber`;

const michaelKorsBody = `Hi Charlotte,

I wanted to reach out about a creator content opportunity we think is a great fit for Michael Kors this summer.

We are taking a curated group of creators to Cannes Lions this June through Indvstry Power House - our private villa activation running alongside the festival. Five days of events, content and culture in the south of France with some of the most senior creative and marketing leaders in the room.

Michael Kors and Cannes are a natural pairing - the brand's effortless luxury translates beautifully in that setting. The opportunity is getting key pieces on creators who are already embedded in that world, with real UGC being made throughout the week in one of the most photographed locations on the planet.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a quick call to explore what involvement could look like. Are you open to it?

Amber`;

const cucculelliBody = `Hi,

I wanted to reach out about an opportunity we think is a stunning fit for Cucculelli Shaheen this summer.

We are taking a curated group of creators to Cannes Lions this June through Indvstry Power House - our private villa activation running alongside the festival. Five days of events, content and culture in the south of France with some of the most influential creative people in the room.

Cucculelli Shaheen's couture evening wear was made for a setting like Cannes - the craftsmanship, the detail, the way each piece commands a room. Getting those gowns on creators at a private villa in the south of France, with editorial content being made naturally throughout the week, feels like the kind of placement that speaks for itself.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a quick call to talk through what this could look like. Are you open to it?

Amber`;

const dennisBassoBody = `Hi,

I wanted to reach out about an opportunity we think is a perfect fit for Dennis Basso this summer.

We are taking a curated group of creators to Cannes Lions this June through Indvstry Power House - our private villa activation running alongside the festival. Five days of events, content and culture in the south of France with some of the most influential creative and cultural leaders in the room.

Dennis Basso's luxury eveningwear and outerwear has always lived on the most glamorous stages in the world - Cannes is the natural next one. Getting those pieces on creators at our villa, with authentic, editorial-quality content being made throughout the week, is the kind of visibility that no campaign can replicate.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a quick call to explore what this could look like. Are you open to it?

Amber`;

const recipients = [
  { name: 'LaQuan Smith PR', email: 'LAQUANSMITH@PURPLEPR.COM', body: laquanBody },
  { name: 'Norma Kamali Press', email: '1PRESS@NORMAKA-MALI.COM', body: normaBody },
  { name: 'Charlotte Bristow', email: 'CHARLOTTE.BRISTOW@MICHAELKORS.COM', body: michaelKorsBody },
  { name: 'Cucculelli Shaheen Press', email: 'PRESS@CU-SH.COM', body: cucculelliBody },
  { name: 'Dennis Basso', email: 'DENNISBASSO@AN-CHORCOMMUNICATION.COM', body: dennisBassoBody },
];

async function main() {
  const token = await getToken();

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    await sendEmail(token, r.email, r.name, SUBJECT, r.body);
    console.log(`[${i + 1}/${recipients.length}] Sent to ${r.name} <${r.email}>`);
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\nDone. 5 emails sent.');
}

main().catch(console.error);
