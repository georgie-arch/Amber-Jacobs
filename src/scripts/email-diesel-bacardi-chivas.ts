/**
 * Personalised Cannes outreach to:
 *   - Jason Melissos (Diesel)       — Jason_Melissos@diesel.com
 *   - Amy Hawkins (Bacardi/Ogilvy)  — amy.hawkins@ogilvy.com
 *   - Oyin Akiniyi (Chivas)         — Oyin.Akiniyi@pernod-ricard.com
 *   - Bethany Walker (Chivas)       — bethany.walker@pernod-ricard.com
 *
 * From: George Guise
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

// ─── JASON MELISSOS — DIESEL ─────────────────────────────────────────────────

const jasonBody = `Hi Jason,

The SS26 activation in Milan was hard to ignore - egg-shaped pods at Diesel HQ, then an egg hunt scattered across the city from gardens to theatres to landmark piazzas. That is exactly the kind of brand thinking that earns attention rather than buys it.

I wanted to reach out because we are building something at Cannes Lions this June that sits in that same spirit. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The infrastructure is in place - what we are building now is the right brand partnerships to sit inside it.

Diesel and Cannes is a conversation worth having. The crowd in that villa - founders, creative directors, brand leads - is exactly the room where the next generation of cultural partnerships gets made. And a brand that stages an egg hunt across Milan knows how to make a moment land.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

George`;

// ─── AMY HAWKINS — BACARDI / OGILVY ─────────────────────────────────────────

const amyBody = `Hi Amy,

Bacardi has always understood that the brand lives in the culture, not the campaign - and the work coming out of Ogilvy on that account reflects exactly that. You build things that feel like they belong somewhere real.

I wanted to reach out because we are building something at Cannes Lions this June that I think Bacardi should be part of. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The infrastructure is in place and we are now bringing in the right brand partners to sit inside it.

Bacardi as the spirit of that villa - with the content, the crowd and the culture that comes with it - feels like a natural fit. The people in that room are the ones who make the decisions that shape what culture looks like next year.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

George`;

// ─── OYIN AKINIYI — CHIVAS ───────────────────────────────────────────────────

const oyinBody = `Hi Oyin,

The Chivas x Ferrari partnership was a serious move - putting Charles Leclerc at the centre of a brand that has always been about ambition and rising. It shows exactly the kind of cultural thinking that makes Chivas different in that category.

I wanted to reach out because we are building something at Cannes Lions this June that I think sits right in that same territory. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The infrastructure is in place - what we are now building is the right brand partners to sit inside it.

Chivas in that room, with that crowd - founders, creative directors, brand leads from some of the biggest names in the industry - is the kind of cultural placement that no campaign can replicate. And given your role shaping the conversations around this brand, I think you would find the room genuinely valuable too.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

George`;

// ─── BETHANY WALKER — CHIVAS ─────────────────────────────────────────────────

const bethBody = `Hi Bethany,

The way Chivas has been moving recently - the Ferrari partnership, Charles Leclerc as brand ambassador, the experiential push - it is clear there is serious ambition behind how this brand is being positioned. The category does not usually think this boldly.

I wanted to reach out because we are building something at Cannes Lions this June that I think is worth Chivas being part of. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The infrastructure is in place - we are now bringing in the right brand partners to sit inside it.

Chivas as the whisky of the villa, in a room full of the people who shape brand and cultural strategy at the biggest companies in the world, feels like exactly the kind of placement that earns long-term relevance. Not an ad. A room.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

George`;

// ─── MAIN ────────────────────────────────────────────────────────────────────

const RECIPIENTS = [
  { name: 'Jason Melissos', email: 'Jason_Melissos@diesel.com', body: jasonBody },
  { name: 'Amy Hawkins', email: 'amy.hawkins@ogilvy.com', body: amyBody },
  { name: 'Oyin Akiniyi', email: 'Oyin.Akiniyi@pernod-ricard.com', body: oyinBody },
  { name: 'Bethany Walker', email: 'bethany.walker@pernod-ricard.com', body: bethBody },
];

const SUBJECT = 'Indvstry Power House - Cannes Lions 2026';

async function main() {
  const token = await getToken();

  for (let i = 0; i < RECIPIENTS.length; i++) {
    const r = RECIPIENTS[i];
    await sendEmail(token, r.email, r.name, SUBJECT, r.body);
    console.log(`[${i + 1}/${RECIPIENTS.length}] Sent to ${r.name} <${r.email}>`);
    if (i < RECIPIENTS.length - 1) await new Promise(res => setTimeout(res, 2000));
  }

  console.log('\nDone. 4 emails sent.');
}

main().catch(console.error);
