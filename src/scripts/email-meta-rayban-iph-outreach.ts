/**
 * Meta Ray-Ban / Oakley Meta partnership outreach — 4 personalised emails
 * Shachar Scott, Kimberley Blanding, Chris Aguiar, Rocco Basilico
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-meta-rayban-iph-outreach.ts
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
    name:    'Shachar Scott',
    email:   'shachar.scott@meta.com',
    subject: 'Ray-Ban Meta x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Shachar,

I have been following your work building the creator strategy around Ray-Ban Meta and the way you have talked about trust being the core currency in this space. The insight that people adopt new wearable behaviour when they see it modelled by someone they actually trust is exactly what we are building around at Indvstry Power House this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, brand leaders and cultural tastemakers. It is a small room by design, 20 to 30 people, but it is exactly the kind of room where genuine organic content is created. Private dinners, closed sessions, the kind of setting where people are present, relaxed and posting in real time.

Cannes is one of the most photographed and most-shared weeks in the creative industry calendar. The people inside the villa are among the most trusted voices in culture and marketing. It feels like a natural home for a Ray-Ban Meta presence.

We would love to explore what a partnership could look like, whether that is a seeding moment, a branded dinner, a session during the week, or something built around capturing authentic content from the room. We have a small number of partnership spots available.

If this is worth a conversation, our founder George is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts.`,
  },
  {
    name:    'Kimberley Blanding',
    email:   'kimberley.blanding@meta.com',
    subject: 'Ray-Ban Meta x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Kimberley,

I saw your quote around the Super Bowl Oakley Meta campaign about choosing authentic people who genuinely love the product. That line stuck with me because it is the exact brief we operate from at Indvstry Power House.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais. We curate a room of 20 to 30 senior creative and brand leaders, founders and cultural decision-makers and build a week of private dinners, programming and genuine connection. These are not influencers with audience deals. They are CMOs, creative directors, agency leads and founders who post because they are genuinely there, genuinely engaged, and trusted by their networks.

Cannes is essentially the creative industry's version of what you built with Spike Lee and Marshawn Lynch, but the stage is the most documented week in global brand culture. A Ray-Ban Meta presence in that room, whether through seeding, a branded moment, or a UGC-focused activation, would land in exactly the right hands in exactly the right environment.

We have a small number of partnership spots available and wanted to put this in front of you directly given the alignment with what you are building.

If it is worth a quick call, our founder George is available here: https://calendly.com/itsvisionnaire/30min

Happy to share more on the programme and the people involved.`,
  },
  {
    name:    'Chris Aguiar',
    email:   'chris.aguiar@meta.com',
    subject: 'Ray-Ban Meta x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Chris,

I watched your interview on the future of AI glasses and the way you talked about contextual, real-world use being the thing that unlocks the category for people. The idea that the glasses come alive when someone is actually out in the world, doing something, is what we are building an activation around at Cannes Lions this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and brand leaders. Private dinners, closed programming, and a room full of exactly the kind of people who set the tone for how the industry thinks about technology and culture.

Cannes week is one of the richest real-world contexts for a wearable activation. Every conversation, dinner and session is happening in a genuinely interesting environment. The people in the room are credible, connected and actively creating content throughout the week. A Ray-Ban Meta seeding or partnership moment inside the villa would be one of the most authentic demonstrations of contextual use you could engineer at Lions.

We have a small number of partnership spots available and this felt directly relevant to what you are building.

If a call makes sense, our founder George is available here: https://calendly.com/itsvisionnaire/30min

Would love to explore what this could look like.`,
  },
  {
    name:    'Rocco Basilico',
    email:   'rocco.basilico@essilorluxottica.com',
    subject: 'Ray-Ban Meta x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Rocco,

I have been following EssilorLuxottica's wearables strategy and the way you have talked about building a multi-brand, multi-technology approach to the category. The speed at which the Ray-Ban Meta and Oakley Meta programmes have scaled is genuinely impressive and Cannes Lions feels like an obvious next stage for what you are building.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais. We curate a small room of 20 to 30 of the most senior creative and brand leaders at Lions, founders, CMOs, creative directors and cultural tastemakers, and build a week of private dinners, closed programming and genuine connection.

The case for a Ray-Ban Meta or Oakley Meta presence at the Power House is straightforward. The people in the room are among the most trusted voices in global brand culture. They are the early adopters and opinion-shapers whose organic content and word of mouth drives category adoption. Cannes is the most photographed week in the creative industry calendar and the villa is where the most unguarded, authentic moments happen.

We have a small number of partnership spots available for the week and wanted to put this in front of you directly. Whether that is a seeding activation, a branded dinner, co-created content, or a wider presence throughout the residency, we are open to building something that works for the programme.

Our founder George would love to talk through what the opportunity looks like. You can book time directly here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
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
      console.log(`[${sent}/4] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < contacts.length) await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\nDone. ${sent}/4 sent.`);
}

sendAll().catch(console.error);
