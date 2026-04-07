/**
 * email-powerhouse-batch2.ts
 *
 * Brand-customised Power House partnership pitches to:
 *   - Jane Ostler (Kantar)       — jane.ostler@kantar.com
 *   - Michael Barrett (Magnite)  — mbarrett@magnite.com
 *   - Gary Vaynerchuk (VaynerMedia) — gary.vaynerchuk@vaynermedia.com
 *   - Bob Pittman (iHeartMedia)  — bobpittman@iheartmedia.com
 *   - Judann Pollack (Ad Age)    — jpollack@adage.com
 *
 * Each email links to a brand-themed deck page unique to that company.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch2.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const DECK_BASE_URL = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';

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
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── EMAIL BODIES ──────────────────────────────────────────────────────────

// KANTAR — Jane Ostler, EVP Global Thought Leadership
// Known for: Creative Effectiveness Awards at Cannes, BrandZ, Link AI creative testing
const kantarBody = `Hi Jane,

The Kantar Creative Effectiveness Awards have become one of the most credible measures of what actually works in advertising at Cannes — and the BrandZ conversations you lead there carry real weight in a festival that is not always known for intellectual rigour. That combination of data and cultural fluency is genuinely rare.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside the kind of thinking Kantar brings to the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door conversation, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access.

What I would love to explore with you is a co-hosted session inside the villa around creative effectiveness and brand building — the data-led conversation that sits at the heart of everything Kantar does at Cannes, but in a format where it can go much deeper than a standard panel allows. Your perspective on what separates brand-building work from short-term noise is exactly the kind of provocation our room would benefit from.

I have put together a bespoke deck for Kantar so you can see exactly what we have built: ${DECK_BASE_URL}/deck/kantar

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House here: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to have a proper conversation about what we could design together. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Jane.`;

// MAGNITE — Michael Barrett, CEO
// Known for: leading CTV/programmatic, The Converge summit at Cannes, streaming monetisation
const magniteBody = `Hi Michael,

The Converge summit Magnite runs at Cannes has carved out a genuinely distinct space in the festival calendar — the quality of conversation around CTV and programmatic monetisation that you bring together there is different to most of what happens on the Croisette, and it shows in who shows up.

I am reaching out because we are building something that sits in complementary territory for Cannes Lions 2026, and I think there is a natural overlap worth exploring.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated residence in the hills above Cannes hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation and real collaboration. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who we bring into the space.

What I would love to put to you is a co-hosted session inside the villa around the future of premium video and what the next chapter of audience attention looks like for brands. The people in our house are the CMOs and creative leaders actually making those investment decisions. Getting Magnite into that room, in a format that goes deeper than a panel, feels like something worth a conversation.

I have built a bespoke deck specifically for Magnite — you can view it here: ${DECK_BASE_URL}/deck/magnite

Full sponsorship scope: ${CANVA_DECK}

And the Power House: https://powerhouse.indvstryclvb.com

If this resonates, our events lead George would love to walk you through the full activation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting, Michael.`;

// VAYNERMEDIA — Gary Vaynerchuk, CEO
// Known for: Cannes Lions keynotes, social-first creative, VaynerMedia's agency work, Gary's personal brand
const vaynerBody = `Hi Gary,

You have been one of the most consistent voices at Cannes Lions for a decade now — and the message has not changed because you were right early: attention is the asset, platform fluency is the skill, and most of the industry is still catching up. The fact that you keep coming back to the room to say it again says a lot about your commitment to moving the industry forward.

I am reaching out because we are building something at Cannes Lions 2026 that is very much in that spirit.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of real conversation, away from the noise of the Croisette. No panels that feel like press conferences. No networking that goes nowhere. We hold over 75,000 euros in Cannes Lions delegate passes and the house runs on one principle: the right people in the right room.

What I would love to explore with you is a session inside the villa. The honest version of what is coming for the creator economy, what attention will look like in 2028, where agencies need to move — the conversation you have been trying to get the industry to have for years, but with 30 people who are actually ready for it.

Here is a bespoke deck we built for VaynerMedia: ${DECK_BASE_URL}/deck/vaynermedia

Full sponsorship scope: ${CANVA_DECK}

And the Power House site: https://powerhouse.indvstryclvb.com

If this is a fit, our events lead George would love to get five minutes with you. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts, Gary.`;

// iHEARTMEDIA — Bob Pittman, Executive Chairman & CEO
// Known for: iHeart's massive podcast/radio reach, Cannes presence, audio-first media
const iheartBody = `Hi Bob,

iHeartMedia's Cannes presence has consistently made the case for audio in a visual-first festival — and the fact that it keeps resonating year after year shows how well the team understands that the most powerful medium is the one that reaches people where they actually live their lives. That is a harder argument to make in Cannes than it sounds, and you make it well.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside what iHeart brings to the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door conversation, shared meals, and real connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access to the space.

What I would love to explore is a co-hosted session inside the villa around the future of audio and what it means for brand storytelling in a world drowning in visual noise. The argument for audio has never been stronger — and the people in our house are the brand leaders who need to hear it from the source.

I have built a bespoke deck for iHeartMedia so you can see exactly what we have put together: ${DECK_BASE_URL}/deck/iheartmedia

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House: https://powerhouse.indvstryclvb.com

If this is something you would like to explore, our events lead George would love to walk you through the full picture. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Bob.`;

// AD AGE — Judann Pollack, Editor-in-Chief
// Known for: Ad Age's comprehensive Cannes coverage, Small Agency Awards, the Creativity Awards
const adageBody = `Hi Judann,

Ad Age's coverage of Cannes Lions is the definitive record of what actually mattered that week — and the way your team frames the festival gives the industry the context it needs to make sense of it all. The Creativity Awards have a weight and integrity that comes from decades of editorial commitment, and that does not happen by accident.

I am reaching out because we are building something at Cannes Lions 2026 that I think deserves to be part of that conversation — and I want to explore whether there is a natural editorial or partnership moment here.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door conversation, away from the Croisette. We hold over 75,000 euros in Cannes Lions delegate passes and the activation is built around the conversations the industry needs to have but rarely gets the space for.

What I would love to explore with you is either editorial coverage of the Power House programme — access for an Ad Age journalist to the sessions and conversations happening inside the villa — or a co-branded content moment that puts Ad Age's voice at the centre of what we are building. The calibre of people in our house is exactly the kind of access your readers want.

Here is a bespoke deck for Ad Age so you can see the full picture: ${DECK_BASE_URL}/deck/adage

Full sponsorship scope: ${CANVA_DECK}

And the Power House site: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to have a proper conversation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Judann.`;

// ─── RECIPIENTS ────────────────────────────────────────────────────────────

interface Recipient {
  name: string;
  email: string;
  subject: string;
  body: string;
}

const recipients: Recipient[] = [
  {
    name: 'Jane Ostler',
    email: 'jane.ostler@kantar.com',
    subject: 'Cannes 2026 — Creative Effectiveness meets Power House, Jane',
    body: kantarBody,
  },
  {
    name: 'Michael Barrett',
    email: 'mbarrett@magnite.com',
    subject: 'Cannes 2026 — a conversation from the Power House, Michael',
    body: magniteBody,
  },
  {
    name: 'Gary Vaynerchuk',
    email: 'gary.vaynerchuk@vaynermedia.com',
    subject: 'Cannes 2026 — the room you have been trying to build, Gary',
    body: vaynerBody,
  },
  {
    name: 'Bob Pittman',
    email: 'bobpittman@iheartmedia.com',
    subject: 'Cannes 2026 — audio inside the Power House, Bob',
    body: iheartBody,
  },
  {
    name: 'Judann Pollack',
    email: 'jpollack@adage.com',
    subject: 'Cannes 2026 — Power House + Ad Age, Judann',
    body: adageBody,
  },
];

// ─── SEND ──────────────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();

  const sendOnly = process.env.SEND_ONLY?.toLowerCase();
  const toSend = sendOnly
    ? recipients.filter(r => r.name.toLowerCase().startsWith(sendOnly))
    : recipients;

  for (const r of toSend) {
    await sendEmail(token, r.email, r.name, r.subject, r.body);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    if (toSend.indexOf(r) < toSend.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log(`\n✅ ${toSend.length} email(s) sent.`);
}

main().catch(console.error);
