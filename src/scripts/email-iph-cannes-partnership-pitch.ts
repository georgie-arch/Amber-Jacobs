/**
 * email-iph-cannes-partnership-pitch.ts
 *
 * Partnership pitch to 18 senior brand and industry contacts —
 * inviting them to host events or partner with Indvstry Power House
 * at Cannes Lions 2026 (21-26 June), private villa activation.
 *
 * Targets: WARC, Contagious, Effie, TMRE, CMI, Acuity Pricing (industry)
 *          + AB InBev, Adidas, Apple, Burger King, Heineken, IKEA,
 *            Kraft Heinz, Mars, McDonald's, Nike, P&G, Unilever (brands)
 *
 * Run:     npx ts-node --project tsconfig.json src/scripts/email-iph-cannes-partnership-pitch.ts
 * Single:  SEND_ONLY=marcel npx ts-node --project tsconfig.json src/scripts/email-iph-cannes-partnership-pitch.ts
 * Dry run: DRY_RUN=true npx ts-node --project tsconfig.json src/scripts/email-iph-cannes-partnership-pitch.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ─── OUTLOOK AUTH ─────────────────────────────────────────────────

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

// ─── HTML BUILDER ─────────────────────────────────────────────────

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
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

async function send(token: string, to: string, toName: string, subject: string, body: string): Promise<void> {
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

// ─── CONSTANTS ────────────────────────────────────────────────────

const POWERHOUSE = 'https://powerhouse.indvstryclvb.com';
const CALENDLY = 'https://calendly.com/itsvisionnaire/30min';

// ─── RECIPIENTS ───────────────────────────────────────────────────

interface Recipient {
  key: string;
  name: string;
  firstName: string;
  company: string;
  title: string;
  email: string;
  opening: string;       // personalised first paragraph
  eventIdea: string;     // bespoke event format suggestion
}

const recipients: Recipient[] = [

  // ── INDUSTRY / MEDIA ────────────────────────────────────────────

  {
    key: 'david_warc',
    name: 'David Tiltman',
    firstName: 'David',
    company: 'WARC',
    title: 'Chief Content & Customer Officer',
    email: 'david.tiltman@warc.com',
    opening: `WARC's Creative Impact stream at Cannes has become one of the most substantive things at the festival — the research, the effectiveness frameworks, the conversations that actually help people make the case for creativity internally. It's genuinely useful in a way that most festival content isn't.`,
    eventIdea: `a WARC-hosted intelligence briefing or breakfast inside the villa — your editorial shaping the conversation, our house providing the room and a curated senior guest list`,
  },
  {
    key: 'karl_contagious',
    name: 'Karl Marsden',
    firstName: 'Karl',
    company: 'Contagious',
    title: 'CEO',
    email: 'karl@contagious.com',
    opening: `Contagious has always been the sharpest read on what's actually moving in creative culture — and the Cannes Deconstructed format proves there's a real appetite for that kind of rigorous, editorial perspective on the festival. It's exactly what people need after a week of noise.`,
    eventIdea: `a Contagious-curated evening session inside the villa — an intimate debrief format with 25-30 of the most senior creatives and marketers in the house`,
  },
  {
    key: 'nisha_effie',
    name: 'Nisha Stephen',
    firstName: 'Nisha',
    company: 'Effie LIONS Foundation',
    title: 'Programs Lead',
    email: 'nisha@effie.org',
    opening: `The Effie LIONS Foundation is building something genuinely important at the intersection of creativity and effectiveness — and Cannes is the perfect moment to bring that conversation to a room of brand leaders who care deeply about both.`,
    eventIdea: `an Effie-hosted effectiveness roundtable inside the villa — a closed-door, senior conversation about what it actually takes to build work that wins both creatively and commercially`,
  },
  {
    key: 'katie_tmre',
    name: 'Katie Flash',
    firstName: 'Katie',
    company: 'TMRE / Informa',
    title: 'Event Director',
    email: 'Katie.Flash@Informa.com',
    opening: `TMRE has built a genuinely respected community around insights and analytics — the kind of rigorous, senior audience that's increasingly relevant to brand leaders making decisions about data, AI, and the future of consumer understanding. Cannes is where those worlds are starting to converge.`,
    eventIdea: `a TMRE-hosted insights breakfast inside the villa — bringing together senior CMOs and insights leaders for a conversation that doesn't usually happen at a creative festival`,
  },
  {
    key: 'robert_cmi',
    name: 'Robert Rose',
    firstName: 'Robert',
    company: 'Content Marketing Institute',
    title: 'Chief Strategy Advisor',
    email: 'robert.rose@contentmarketinginstitute.com',
    opening: `CMI has spent 15 years defining what great content strategy looks like — and the conversation about content, creativity, and AI is one of the most charged at Cannes right now. The senior marketers in our house are asking exactly the questions CMI has always been built to answer.`,
    eventIdea: `a CMI-hosted content strategy session inside the villa — a senior, intimate format where the content and creativity conversation goes somewhere more substantive than a main stage panel`,
  },
  {
    key: 'acuity',
    name: 'Acuity Pricing Team',
    firstName: 'team',
    company: 'Acuity Pricing',
    title: 'Leadership',
    email: 'info@acuitypricing.com',
    opening: `Acuity Pricing sits at a fascinating intersection for brand leaders right now — pricing intelligence, competitive data, and the commercial levers that CMOs are increasingly being held accountable for. The Cannes audience is more commercially minded than it used to be, and that's exactly where your story lands.`,
    eventIdea: `a hosted breakfast or workshop session inside the villa — bringing pricing and brand strategy into the same room for a conversation that doesn't usually happen at a creative festival`,
  },

  // ── GLOBAL BRANDS ───────────────────────────────────────────────

  {
    key: 'marcel',
    name: 'Marcel Marcondes',
    firstName: 'Marcel',
    company: 'AB InBev',
    title: 'Global Chief Marketing Officer',
    email: 'marcel.marcondes@ab-inbev.com',
    opening: `AB InBev has been one of the most consistently creative brands at Cannes for years — back-to-back Creative Marketer of the Year, and now you're on the jury shaping what creative brand excellence looks like in 2026. That's a significant position to be in, and the conversations happening around it deserve a setting that matches the ambition.`,
    eventIdea: `an AB InBev-hosted evening at the villa — a curated mixer or dinner where the Creative Brand story lands with the 25-30 most senior marketers and creatives in the house`,
  },
  {
    key: 'hermann',
    name: 'Hermann Deininger',
    firstName: 'Hermann',
    company: 'Adidas',
    title: 'Chief Marketing Officer',
    email: 'hermann.deininger@adidas-group.com',
    opening: `Adidas's creative output over the last few years has been a masterclass in how a heritage brand stays genuinely relevant — from the Gazelle resurgence to the cultural work across football, basketball, and music. At Cannes, that kind of brand conviction carries real weight in the rooms that matter.`,
    eventIdea: `an Adidas-hosted creative evening inside the villa — an intimate gathering of the industry's most senior creative and marketing leaders where the brand story lands the way it deserves to`,
  },
  {
    key: 'tor',
    name: 'Tor Myhren',
    firstName: 'Tor',
    company: 'Apple',
    title: 'VP Marketing Communications',
    email: 'tor.myhren@apple.com',
    opening: `Apple's Cannes presence has always been understated by design — which makes the work land harder when it does appear. The industry watches Apple more closely than almost anyone else in Cannes week, precisely because you don't need to be everywhere.`,
    eventIdea: `a private Apple-curated evening inside the villa — an invitation-only gathering of the most senior creative and brand leaders at the festival, in a setting that reflects the same standards Apple brings to everything else`,
  },
  {
    key: 'joel',
    name: 'Joel Yashinsky',
    firstName: 'Joel',
    company: 'Burger King',
    title: 'Chief Marketing Officer',
    email: 'joel.yashinsky@rbi.com',
    opening: `Burger King has one of the most storied creative legacies at Cannes — Titanium Grand Prix, Creative Marketer of the Year, work that genuinely changed how the industry thinks about challenger brand strategy. That's a legacy worth activating in the right setting, not just celebrating.`,
    eventIdea: `a Burger King-hosted evening inside the villa — the kind of irreverent, high-energy creative dinner that fits the brand perfectly, with 25-30 of the most senior creative leaders in the industry`,
  },
  {
    key: 'bram',
    name: 'Bram Westenbrink',
    firstName: 'Bram',
    company: 'Heineken',
    title: 'Chief Commercial Officer',
    email: 'b.westenbrink@heineken.com',
    opening: `Heineken's creative work at Cannes is consistently among the most celebrated in the room — 27 Lions in 2025, and a brand that has made culture-led marketing look effortless for over a decade. The story of how Heineken keeps producing work that resonates globally is one the industry genuinely wants to hear.`,
    eventIdea: `a Heineken-hosted evening inside the villa — a beautifully hosted mixer or dinner for the most senior marketing and creative leaders at the festival, where the Heineken story gets the setting it deserves`,
  },
  {
    key: 'erika',
    name: 'Erika Intiso',
    firstName: 'Erika',
    company: 'IKEA',
    title: 'Managing Director, IKEA Marketing & Communication',
    email: 'erika.intiso@inter.ikea.com',
    opening: `IKEA's marketing has become one of the most studied cases in brand building — the democratic design principles, the long-term consistency, and the way the brand has navigated digital transformation while staying genuinely loved. At Cannes, that kind of brand wisdom is exactly what rooms full of senior marketers want access to.`,
    eventIdea: `an IKEA-hosted creative morning inside the villa — an intimate breakfast or discussion format where IKEA's approach to brand, design, and long-term thinking can go deeper than a festival panel allows`,
  },
  {
    key: 'todd',
    name: 'Todd Kaplan',
    firstName: 'Todd',
    company: 'Kraft Heinz',
    title: 'Chief Marketing Officer, North America',
    email: 'todd.kaplan@kraftheinzcompany.com',
    opening: `Kraft Heinz's approach to culture-led marketing — real-time brand moments, leaning into what consumers are actually talking about — has made you one of the most watched CMO voices at Cannes over the last two years. The conversation about defending creativity in the age of data is one of the most important at the festival right now.`,
    eventIdea: `a Kraft Heinz-hosted session inside the villa — an intimate format where your perspective on creativity, culture, and effectiveness can go somewhere it doesn't get to on a main stage`,
  },
  {
    key: 'gulen',
    name: 'Gülen Bengi',
    firstName: 'Gülen',
    company: 'Mars',
    title: 'Lead Global Chief Marketing Officer',
    email: 'g.bengi@effem.com',
    opening: `Mars has been building one of the most compelling cases for brand world-building at scale — the work across Snickers, M&M's, and the broader portfolio shows what it looks like when a global company genuinely commits to creative consistency. That story deserves the right room to land in.`,
    eventIdea: `a Mars-hosted evening inside the villa — a curated dinner or mixer with 25-30 of the most senior brand and creative leaders at the festival, in a setting that matches the ambition of the work`,
  },
  {
    key: 'morgan',
    name: 'Morgan Flatley',
    firstName: 'Morgan',
    company: "McDonald's",
    title: 'Global Chief Marketing Officer',
    email: 'morgan.flatley@mcdonalds.com',
    opening: `McDonald's is one of the most consistently celebrated creative brands at Cannes — Creative Marketer of the Year, iconic campaign after iconic campaign, and a marketing team that has made the golden arches feel genuinely culturally alive in a way few brands at that scale manage. That's a creative story worth telling in the right setting.`,
    eventIdea: `a McDonald's-hosted evening inside the villa — an intimate gathering of the festival's most senior creative and marketing leaders, where the McDonald's brand story gets the conversation it deserves`,
  },
  {
    key: 'nicole',
    name: 'Nicole Graham',
    firstName: 'Nicole',
    company: 'Nike',
    title: 'EVP & Chief Marketing Officer',
    email: 'n.graham@nike.com',
    opening: `Nike has won more Grands Prix at Cannes than any brand in history — and the launch of LIONS Sport makes 2026 the most significant Cannes for Nike in years. The conversation about sport, creativity, and culture is one that the most senior marketers at the festival will want to be part of.`,
    eventIdea: `a Nike-hosted evening inside the villa — a curated gathering of the festival's most senior creative and cultural leaders, timed around the LIONS Sport launch and the conversation Nike is best placed to lead`,
  },
  {
    key: 'marc',
    name: 'Marc Pritchard',
    firstName: 'Marc',
    company: 'Procter & Gamble',
    title: 'Chief Brand Officer',
    email: 'marc.pritchard@pg.com',
    opening: `Your Cannes keynotes have become one of the most anticipated moments at the festival — "consistent, persistent", the case for brand building over short-termism, the challenge to raise the creative bar. It's rare for a CMO voice to move the needle the way yours does, and the industry listens because the work backs it up.`,
    eventIdea: `a P&G-hosted breakfast conversation inside the villa — a small, senior format where your perspective on brand building, creativity, and what the industry needs to do differently can go deeper than a main stage allows`,
  },
  {
    key: 'esi',
    name: 'Esi Eggleston Bracey',
    firstName: 'Esi',
    company: 'Unilever',
    title: 'Chief Growth & Marketing Officer',
    email: 'esi.bracey@unilever.com',
    opening: `Unilever's 2024 Creative Marketer of the Year win was a statement — not just about the campaigns, but about what a multi-brand portfolio looks like when marketing is genuinely taken seriously at the top. The transformation story under your leadership is one of the most compelling in the industry right now.`,
    eventIdea: `a Unilever-hosted evening inside the villa — an intimate dinner with 25-30 of the most senior creative and marketing leaders at the festival, where Unilever's brand-building story lands with the people who are watching most closely`,
  },

];

// ─── EMAIL COPY ───────────────────────────────────────────────────

function buildBody(r: Recipient): string {
  return `Hi ${r.firstName},

My name is Amber Jacobs, Community Manager at Indvstry Clvb.

${r.opening}

I'm reaching out because we've secured a private villa at Cannes Lions 2026, and we'd love to explore a partnership with ${r.company}.

Indvstry Power House is a curated villa residency running 21-26 June — a private space for 25-30 of the most senior creative, marketing, and brand leaders at the festival. We hold an ERA partnership with over EUR 75,000 in delegate passes, and The Shade Borough (900k+ Instagram) as our media partner. The house is designed for the conversations that don't happen on the Croisette — intimate, senior, genuinely useful.

We'd love to host ${r.eventIdea} as part of the week.

What we offer partners:
- Exclusive use of the villa for your event (morning, afternoon or evening slot)
- Curated guest list of 25-30 senior festival attendees matched to your brief
- Full event production and hosting support from our team
- Amplification via The Shade Borough's media network before and after
- EUR 75k in delegate pass access to draw from for your guests

Full details on the house: ${POWERHOUSE}

Would you or someone on your team be open to a 15-minute call with our founder George to explore what this could look like? You can book directly here: ${CALENDLY}

Looking forward to hearing from you, ${r.firstName}.`;
}

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.env.DRY_RUN === 'true';
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();
  const toSend = sendOnly ? recipients.filter(r => r.key === sendOnly) : recipients;

  if (toSend.length === 0) {
    console.log(`No recipient found for SEND_ONLY=${sendOnly}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`\nDRY_RUN — would send to ${toSend.length} recipients:\n`);
    toSend.forEach(r => console.log(`  ${r.name} <${r.email}> (${r.company})`));
    return;
  }

  console.log(`\nSending ${toSend.length} IPH partnership pitch emails...\n`);
  const token = await getToken();
  let sent = 0;

  for (let i = 0; i < toSend.length; i++) {
    const r = toSend[i];
    const subject = `Cannes Lions 2026 — hosting an event at Indvstry Power House, ${r.firstName}`;
    const body = buildBody(r);

    try {
      await send(token, r.email, r.name, subject, body);
      sent++;
      console.log(`  [${sent}/${toSend.length}] Sent to ${r.name} <${r.email}> (${r.company})`);
    } catch (err: any) {
      console.error(`  FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (i < toSend.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log(`\nDone. ${sent}/${toSend.length} emails sent.`);
}

main().catch(console.error);
