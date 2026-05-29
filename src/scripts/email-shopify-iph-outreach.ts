/**
 * Shopify IPH partnership outreach — 3 personalised emails
 * Jessica Williams, Brennan Loh, Anne Marie Al-Borno
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-shopify-iph-outreach.ts
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

const contacts = [
  {
    name:    'Jessica Williams',
    email:   'jessica.williams@shopify.com',
    subject: 'Shopify x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jessica,

I came across your upcoming session at Cannes Lions 2026 on building billion-view content ecosystems alongside Adobe, and it immediately made me think of what we are putting together at the Power House that same week.

We are running Indvstry Power House — a private villa activation during Lions week, 21 to 26 June, just outside the Palais. A curated residency for a small group of senior creative, brand and media leaders. Private dinners, closed-door conversations, and a genuinely intimate base away from the main festival floor.

Given Shopify's focus on the creator-to-founder shift (your Creatorpreneurs panel last year was one of the most talked-about sessions at Lions 2025), the Power House feels like a natural environment for Shopify to be present in. The people in the room are exactly the builders and decision-makers your brand resonates with most.

We are looking for a select number of brand partners to be part of the week's programming and would love to explore what a Shopify presence inside the villa could look like, whether that is a breakfast, a session, branding throughout the residency, or something else entirely.

Would love to get 20 minutes on a call with our founder George if this feels worth exploring. He is easy to reach here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name:    'Brennan Loh',
    email:   'brennan.loh@shopify.com',
    subject: 'Shopify x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Brennan,

I saw your post about Feastables hitting 400 million lifetime orders on Shopify and the way you framed it around entrepreneurship being the most future-proof skill in an AI economy. That framing is exactly the energy we are building around at Indvstry Power House this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency for a carefully curated group of founders, senior brand leaders and creative executives. Private dinners, closed conversations, a proper base outside the noise of the Palais, and a room full of the kind of people who are actually building things.

The connection to Shopify feels obvious. The merchants and founders your brand celebrates are the exact same people who make up this room. A Shopify presence at the Power House, whether as a dinner host, a session partner, or a branded moment during the week, would land in front of exactly the right audience in exactly the right setting.

We have a small number of partnership spots available and wanted to put this in front of you directly.

If it is worth a conversation, our founder George is available here: https://calendly.com/itsvisionnaire/30min

Happy to share more details on the programme and the people involved.`,
  },
  {
    name:    'Anne Marie Al-Borno',
    email:   'anne-marie.al-borno@shopify.com',
    subject: 'Shopify x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Anne Marie,

I have been following your work on Shopify's experiential programme and the way you have been building out the Connect events globally. The level of intentionality behind those activations is exactly the kind of thinking we are trying to bring to what we are doing at Cannes Lions this year.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa activation just outside the Palais, designed as a curated residency for a small group of senior brand, creative and media leaders. Private dinners, dedicated programming, and a genuinely high-quality base during the festival week.

As the person responsible for Shopify's experiential presence globally, I wanted to put this in front of you directly. We have a limited number of brand partnership spots available for the week and Shopify would be a natural fit for what we are building. The audience in the room, founders, CMOs, creative directors and agency leads, is exactly the kind of environment where a Shopify activation lands with real impact rather than festival noise.

If this is relevant to your Cannes planning, our founder George would love to connect and walk through what the opportunity looks like in detail. You can grab time directly here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts.`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const c of contacts) {
    try {
      const message: any = {
        subject: c.subject,
        body:    { contentType: 'HTML', content: buildHtml(c.body) },
        toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
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

      sent++;
      console.log(`[${sent}/3] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < contacts.length) await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\nDone. ${sent}/3 sent.`);
}

sendAll().catch(console.error);
