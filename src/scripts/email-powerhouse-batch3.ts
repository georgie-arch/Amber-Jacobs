/**
 * email-powerhouse-batch3.ts
 *
 * Personalised Power House partnership outreach to:
 *   - Damien Baines (Meta)           -  damien.baines@meta.com
 *   - Alex Macnamara (LinkedIn)      -  alex.macnamara@linkedin.com
 *   - Sydney Pringle (Spotify)       -  sydney.pringle@spotify.com
 *     cc: Brian Berner (Spotify)     -  brian.berner@spotify.com
 *
 * Scheduled: Monday 30 March 2026
 *   - Meta (PT)     → 8:00am PT  = 15:00 UTC
 *   - LinkedIn (PT) → 8:00am PT  = 15:00 UTC
 *   - Spotify (ET)  → 8:00am ET  = 12:00 UTC
 *
 * Run manually:
 *   npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch3.ts
 * Run one recipient:
 *   SEND_ONLY=damien npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch3.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_BASE_URL = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';

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

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  body: string,
  cc?: Array<{ address: string; name: string }>
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };
  if (cc && cc.length > 0) {
    message.ccRecipients = cc.map(c => ({ emailAddress: c }));
  }
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

// ─── EMAIL BODIES ───────────────────────────────────────────────────────────

// META  -  Damien Baines, Head of Experiential & Creative, Global Experiences
// Angle: culture, AI tools, brand co-creation with creators (LinkedIn active Feb 2026)
const metaBody = `Hi Damien,

I have been watching the conversations you have been hosting around culture, creativity, and what genuine co-creation between brands and creators looks like in practice. The through-line across what Meta is building is clear: this is not a company that shows up at cultural moments, it is a company that understands how they get made.

I am reaching out because we are building something at Cannes Lions 2026 that sits in exactly that territory.

Indvstry Power House is a private villa activation running alongside Cannes Lions  -  a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets into the space.

What I would love to explore with you is a co-hosted session inside the villa around the intersection of AI tools and human creative leadership. Not the panel version of that conversation  -  the real one. What it actually means to build creative culture when the tools are changing this fast, and what Meta is seeing from the creators and brand partners who are figuring it out first.

The people in the villa are the CMOs, creative directors, and cultural leaders making the decisions that will define what AI-assisted creativity looks like in practice. Getting Meta into that room, before the Croisette fills up with the same conversation on repeat, feels like a moment worth having.

Partnership snapshot for your team: ${DECK_BASE_URL}/deck/meta

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to get on a call. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Damien.`;

// LINKEDIN  -  Alex Macnamara, Head of Cannes Lions Partnership / B2B Summit Lead
// Angle: B2B Summit, B2B creativity, women in marketing (LinkedIn active Apr 2025)
const linkedinBody = `Hi Alex,

The B2B Summit LinkedIn runs at Cannes has become one of the most genuinely useful things at the festival. The fact that it keeps growing says something about how clearly you understand what that audience actually needs. A senior marketing leader attending Cannes wants to feel that they are in the right room. You have built that for B2B, and it shows.

I am reaching out because we are building something that sits alongside it, and I think there is a conversation worth having.

Indvstry Power House is a private villa activation running alongside Cannes Lions  -  a curated space hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and the whole activation is built around the conversations the industry needs to have but never gets space for on the Croisette.

What I would love to explore with you is a co-hosted session inside the villa around the future of B2B creativity. What it means to build real brand equity in a B2B world, and why the gap between B2B and B2C creative thinking is closing faster than most of the industry has noticed. Your perspective on what LinkedIn is seeing from the marketing leaders who build on your platform is exactly the kind of provocation our room would benefit from.

The B2B Summit and the Power House are complementary  -  different format, different moment, shared audience. What we are proposing is one conversation that gives LinkedIn a presence in a room it is not currently in.

Partnership snapshot for your team: ${DECK_BASE_URL}/deck/linkedin

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House: https://powerhouse.indvstryclvb.com

If this is worth a conversation, our events lead George would love to connect. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts, Alex.`;

// SPOTIFY  -  Sydney Pringle, Experiential Executive Producer
// cc: Brian Berner, Global Head of Advertising Sales & Partnerships
// Angle: Spotify Beach, Gen AI Ads, music partnerships, Loud & Clear 2026 (active Mar 2026)
const spotifyBody = `Hi Sydney,

Spotify Beach is one of the best things Cannes has. The scale of it, the quality of the talent, the way it creates genuine moments rather than just brand proximity to moments  -  it is a masterclass in how to activate at a festival without losing what made the original idea worth doing.

I am reaching out because we are building something at Cannes Lions 2026 that lives in a very different register  -  and I think the two are complementary in a way that is worth exploring.

Indvstry Power House is a private villa activation running alongside Cannes Lions  -  a curated space hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door conversation, shared meals, and real connection. No stages, no ticket-holders. Just the right 30 people in a private residence, 30 minutes from the festival by car, with the space to actually think.

The reason Spotify comes to mind immediately is that the conversation we want to have inside the villa  -  about music, culture, the creator economy, and what brand partnership in audio looks like in 2026  -  is one you are uniquely positioned to lead. Not the panel version. The version where a Spotify voice is in a room with 30 CMOs and creative directors who are actively making decisions about where audio sits in their brand strategy.

Spotify Beach brings the energy. The Power House is where the decisions get made. There is a session to be built here that benefits both.

Partnership snapshot for your team: ${DECK_BASE_URL}/deck/spotify

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to connect. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Sydney.`;

// ─── RECIPIENTS ─────────────────────────────────────────────────────────────

interface Recipient {
  name: string;
  email: string;
  subject: string;
  body: string;
  cc?: Array<{ address: string; name: string }>;
}

const recipients: Recipient[] = [
  {
    name: 'Damien Baines',
    email: 'damien.baines@meta.com',
    subject: 'Cannes 2026  -  AI, creativity and the room where it matters, Damien',
    body: metaBody,
  },
  {
    name: 'Alex Macnamara',
    email: 'alex.macnamara@linkedin.com',
    subject: 'Cannes 2026  -  B2B creativity inside the Power House, Alex',
    body: linkedinBody,
  },
  {
    name: 'Sydney Pringle',
    email: 'sydney.pringle@spotify.com',
    subject: 'Cannes 2026  -  Spotify Beach meets Power House, Sydney',
    body: spotifyBody,
    cc: [{ address: 'brian.berner@spotify.com', name: 'Brian Berner' }],
  },
];

// ─── SEND ────────────────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();

  const sendOnly = process.env.SEND_ONLY?.toLowerCase();
  const toSend = sendOnly
    ? recipients.filter(r => r.name.toLowerCase().startsWith(sendOnly))
    : recipients;

  for (const r of toSend) {
    await sendEmail(token, r.email, r.name, r.subject, r.body, r.cc);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    if (toSend.indexOf(r) < toSend.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log(`\n✅ ${toSend.length} email(s) sent.`);
}

main().catch(console.error);
