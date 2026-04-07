/**
 * Cannes outreach:
 *   - Jason Melissos (HumanCulture)     — jason@humanculture.com  — FROM GEORGE
 *   - Michael Amusan (DLT Brunch)       — Michael@dayslikethisbrunch.co.uk — FROM AMBER
 *   - Ellie Heatrick (WhatsApp EMEA)    — ellie.heatrick@whatsapp.com — FROM AMBER
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

function buildHtml(text: string, senderName: string, senderTitle: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">${senderName}</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, ${senderTitle}</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  body: string,
  senderName: string,
  senderTitle: string
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body, senderName, senderTitle) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: senderName } },
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

// ─── JASON MELISSOS — HUMANCULTURE ───────────────────────────────────────────

const jasonBody = `Hi Jason,

What you are building with HumanCulture is exactly the kind of thinking the industry has needed for a long time - mapping qualitative cultural data against performance signals to actually predict what lands before you publish it. The client list speaks for itself: Defected, Jamie xx, Tinie, M&C Saatchi. That is not a startup finding its feet, that is a platform with real traction.

I wanted to reach out because we are building something at Cannes Lions this June that I think is genuinely relevant to what HumanCulture is about. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events and closed-door conversations with some of the most senior creative, marketing and brand leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The people in that room are exactly the ones HumanCulture needs to be in conversation with - the CMOs, creative directors and brand strategists who decide where the next generation of intelligence tools fit into their workflow.

Whether that is as a partner in the villa, a speaker moment, or simply being in the right room at the right time - I think there is something worth exploring here.

More on what we are building: https://powerhouse.indvstryclvb.com

Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`;

// ─── MICHAEL AMUSAN — DAYS LIKE THIS ─────────────────────────────────────────

const michaelBody = `Hi Michael,

From a group of friends frustrated by London's lack of daytime culture to sold-out events in Ibiza, Nigeria and Ghana - DLT has done something that most event brands only talk about. You built something that actually travels because the community is real, not manufactured.

I wanted to reach out because we are taking that same energy somewhere new this summer. Indvstry Power House is our private villa activation running alongside Cannes Lions in the south of France - five days of curated events, dinners and conversations with some of the most senior creative and marketing leaders at the festival.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in Cannes. The crowd in that villa - founders, brand leads, creative directors - is exactly the room DLT should be in a conversation with. And honestly, your perspective on building community properly is exactly the kind of voice we want in the space.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a call and explore what this could look like. Are you open to it? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── ELLIE HEATRICK — WHATSAPP EMEA ──────────────────────────────────────────

const ellieBody = `Hi Ellie,

The Meta AI European launch was a significant moment - navigating that regulatory process and getting it across the line across EMEA is no small thing. It is the kind of work that shapes how an entire region experiences a platform.

I wanted to reach out about something we are building at Cannes Lions this June that I think WhatsApp should be part of. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events and closed-door conversations with some of the most senior creative and marketing leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The people in that room are exactly the kind of creative and brand decision-makers that WhatsApp's business and comms story needs to reach - and Cannes is the moment when those conversations happen.

Whether that is a presence in the villa, a panel moment, or simply being in the right room - I think there is something worth exploring.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();

  await sendEmail(token, 'jason@humanculture.com', 'Jason Melissos', 'Indvstry Power House - Cannes Lions 2026', jasonBody, 'George Guise', 'Founder');
  console.log('Sent to Jason Melissos <jason@humanculture.com>');

  await new Promise(res => setTimeout(res, 2000));

  await sendEmail(token, 'Michael@dayslikethisbrunch.co.uk', 'Michael Amusan', 'Indvstry Power House - Cannes Lions 2026', michaelBody, 'Amber Jacobs', 'Community Manager');
  console.log('Sent to Michael Amusan <Michael@dayslikethisbrunch.co.uk>');

  await new Promise(res => setTimeout(res, 2000));

  await sendEmail(token, 'ellie.heatrick@whatsapp.com', 'Ellie Heatrick', 'Indvstry Power House - Cannes Lions 2026', ellieBody, 'Amber Jacobs', 'Community Manager');
  console.log('Sent to Ellie Heatrick <ellie.heatrick@whatsapp.com>');

  console.log('\nDone. 3 emails sent.');
}

main().catch(console.error);
