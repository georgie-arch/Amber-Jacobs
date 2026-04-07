/**
 * Scheduled 10am send — Cannes outreach batch
 * Calculates delay from now to 10:00 BST and fires then.
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

async function send(token: string, to: string, toName: string, subject: string, body: string): Promise<void> {
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

const SUBJECT = 'Indvstry Power House - Cannes Lions 2026';

const emails = [
  {
    name: 'Andreas Georghiades',
    email: 'Andreas.georghiades@fujifilm.com',
    body: `Hi Andreas,

Fujifilm's community-first approach to photography has always stood apart - the X100VI going viral is proof that when a brand earns genuine love from its community, the culture does the marketing for you.

I wanted to reach out because we are building something at Cannes Lions this June that I think Fujifilm should be part of. Indvstry Power House is our private villa activation alongside the festival - five days with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Cannes is one of the most photographed moments of the year. Fujifilm in that room, with those creators and leaders, feels like a natural fit.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Sophie Winter',
    email: 'Sophie.winter@giorgioarmani.co.uk',
    body: `Hi Sophie,

With Armani marking its 50th anniversary this year, the brand is in a moment that very few in fashion ever reach - and the cultural conversation around that legacy is one worth being part of at Cannes Lions.

Indvstry Power House is our private villa activation alongside the festival this June - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Armani Exchange and Cannes is a pairing that makes sense. Would love to explore what involvement could look like.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Anthony Page',
    email: 'anthony.page@puma.com',
    body: `Hi Anthony,

Puma's Go Wild strategy has been one of the boldest brand plays in sport this cycle - building a platform designed to carry through 2025 and 2026 across every major moment on the calendar shows serious long-term thinking.

I wanted to reach out about something we are building at Cannes Lions this June. Indvstry Power House is our private villa activation alongside the festival - five days with some of the most senior creative and marketing leaders at Cannes. We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Puma and Cannes is a conversation worth having. Would love to explore what involvement could look like.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Tom Prior',
    email: 'tom.prior@axelarigato.com',
    body: `Hi Tom,

The Footnotes campaign was genuinely brilliant - turning London streets into live stages, musicians playing on corners, making footwear feel like a cultural movement rather than a product. That is exactly the kind of thinking that earns attention.

I wanted to reach out because we are building something at Cannes Lions this June that sits in that same spirit. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Axel Arigato and Cannes is a natural conversation. Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

More here: https://powerhouse.indvstryclvb.com

George`
  },
  {
    name: 'Daniella Meurke',
    email: 'daniella.meurke@axelarigato.com',
    body: `Hi Daniella,

Axel Arigato has been building one of the most interesting brand stories in footwear right now - the Footnotes campaign, the music and movement angle, the street-level cultural positioning. It feels like a brand that knows exactly where it belongs.

I wanted to reach out about something we are building at Cannes Lions this June. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

I think Axel Arigato should be in that room. Would love to explore what involvement could look like.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Lorna Smith',
    email: 'Lorna.smith@anker.com',
    body: `Hi Lorna,

Anker has quietly become one of the most trusted tech brands in the world by doing the basics brilliantly and letting the product speak - in a space full of noise, that kind of brand clarity is rare.

I wanted to reach out about something we are building at Cannes Lions this June. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative, marketing and brand leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

The creators and content makers coming through that villa are exactly the kind of people who live and work with Anker products every day. Getting the brand in front of that room feels like a natural fit.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Fernando',
    email: 'fernando@hj-pr.com',
    body: `Hi Fernando,

Sprayground's London Fashion Week debut for SS26 was a statement moment - a brand that started in streetwear showing up at LFW on its own terms, closing with a live performance. That is not a brand following the rules, that is a brand setting them.

I wanted to reach out about something we are building at Cannes Lions this June. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Sprayground and Cannes is a conversation worth having. Would love to explore what a collaboration could look like.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Holly',
    email: 'hollypr@sprayground.com',
    body: `Hi Holly,

Sprayground's LFW SS26 debut was one of the more interesting moments from the week - a streetwear brand arriving at fashion week on its own terms, with a live performance to close. The energy in that room was earned, not manufactured.

I wanted to reach out because we are building something at Cannes Lions this June that I think Sprayground should be across. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Would love to explore what a Cannes collaboration could look like. Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

More here: https://powerhouse.indvstryclvb.com

George`
  },
  {
    name: 'Eugene Cariaga',
    email: 'Eugene.cariaga@gettyimages.com',
    body: `Hi Eugene,

Twenty-plus years building Getty's sport and entertainment partnerships across EMEA - the Olympics, Rugby World Cup, some of the biggest visual moments in sport - that is a career built on understanding where culture and image intersect.

I wanted to reach out about something we are building at Cannes Lions this June. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

The visual story of what we are building is a compelling one and I think there is a natural conversation to have about how Getty could be part of documenting or partnering on it.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Tsidi Dagadu',
    email: 'tdagadu@moethennessy.com',
    body: `Hi Tsidi,

Hennessy's Made for More campaign with Tems was a powerful piece of work - rooting the brand in African cultural pride and creativity in a way that felt genuine rather than performative. That is exactly the kind of brand thinking that resonates long after the campaign ends.

I wanted to reach out because we are building something at Cannes Lions this June that sits in that same cultural territory. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Hennessy in that room, with that crowd, feels like a natural and powerful moment. Would love to explore what involvement could look like.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Benjamin Smith',
    email: 'Bsmith@moethennessy.com',
    body: `Hi Benjamin,

Hennessy has been doing something genuinely interesting lately - the Made for More campaign, the cultural partnerships, the focus on authentic community rather than just reach. It is a luxury brand that has figured out how to stay relevant without losing what makes it special.

I wanted to reach out about something we are building at Cannes Lions this June. Indvstry Power House is our private villa activation alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. We have secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

Hennessy as part of that week in Cannes - in a room that shapes what brand culture looks like for the next year - feels like exactly the right placement. Would love to explore what involvement could look like.

More here: https://powerhouse.indvstryclvb.com - Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`
  },
];

function msUntil10amBST(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(10, 0, 0, 0); // 10:00:00 local time
  const diff = target.getTime() - now.getTime();
  return diff > 0 ? diff : 0;
}

async function sendAll(): Promise<void> {
  const token = await getToken();
  for (let i = 0; i < emails.length; i++) {
    const e = emails[i];
    await send(token, e.email, e.name, SUBJECT, e.body);
    console.log(`[${i + 1}/${emails.length}] Sent to ${e.name} <${e.email}>`);
    if (i < emails.length - 1) await new Promise(res => setTimeout(res, 1500));
  }
  console.log('\nDone. 11 emails sent.');
}

const delay = msUntil10amBST();
const minutesLeft = Math.round(delay / 60000);

if (delay > 0) {
  console.log(`Scheduled. Sending in ${minutesLeft} minute(s) at 10:00am BST...`);
  setTimeout(sendAll, delay);
} else {
  console.log('10am already passed — sending immediately.');
  sendAll();
}
