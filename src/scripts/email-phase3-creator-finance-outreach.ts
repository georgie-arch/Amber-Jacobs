/**
 * Phase 3 IPH partnership outreach
 * Creator/Tech: Discord (2), Uber Advertising (2), LTK (2), Patreon (2)
 * Finance: Monzo (2), Moneybox (2), Revolut (2), MoneyGram (2), Tide (2),
 *          Curve Card (2), Amex (2), Visa (2), Mastercard (2)
 * Total: 26 emails
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-phase3-creator-finance-outreach.ts
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
    .map(p => `<p style="margin:0 0 14px 0;">${p.replace(/\n/g, '<br>')}</p>`)
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

  // ─── DISCORD ─────────────────────────────────────────────────────────────
  {
    name: 'Meena Mutha', email: 'meena.mutha@discord.com',
    subject: 'Discord x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Meena,

I saw your post about Discord making its advertising presence felt and the work you have been doing building the gaming vertical from the ground up. You are the first sales leadership hire for that vertical and the way you have been scaling it is exactly the kind of bold, category-defining move that resonates with the room we are building at Indvstry Power House.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural leaders. The people in this room sit at the intersection of brand, creativity and digital culture, which is exactly Discord's audience. A Discord activation at the Power House, whether a branded session, an evening of community-driven programming or a broader presence during the week, puts Discord's advertising story in front of the most senior marketing decision-makers at the festival.

We have a limited number of partnership spots available. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Jason Bunge', email: 'jason.bunge@discord.com',
    subject: 'Discord x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jason,

As CMO of Discord you are building the brand at a genuinely interesting inflection point. The platform is moving from a community tool into a full advertising and brand partnership business and Cannes Lions is the most concentrated room of senior marketing decision-makers in the world. We want to put Discord right in the middle of that room.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. Intimate, invite-only, and full of exactly the audience that Discord's advertising proposition is designed for.

A Discord presence at the Power House, whether a branded session, a community-themed evening or a broader activation across the week, gives Discord a Cannes moment that directly supports the platform's brand marketing ambitions. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── UBER ADVERTISING ────────────────────────────────────────────────────
  {
    name: 'Corey Rados', email: 'corey.rados@uber.com',
    subject: 'Uber Advertising x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Corey,

Your quote from Cannes Lions 2025 about putting creators physically in the back seat next to the consumer has stayed with me. The idea that advertising reaches its highest value when it is truly in the moment with the person is exactly the brief we hand every brand partner at Indvstry Power House.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural leaders. The Uber Advertising story, contextual relevance, creative in the moment, reaching people where they actually are, is one that lands naturally in this room. These are the buyers and decision-makers who shape the brands that advertise with Uber.

You were at Cannes last year. You know what the right room looks like. We are that room. We have a limited number of partnership spots available and would love to explore what an Uber Advertising presence inside the Power House could look like.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Mark Grether', email: 'mark.grether@uber.com',
    subject: 'Uber Advertising x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Mark,

As SVP and GM of Uber Advertising you have built one of the most compelling contextual advertising businesses in the industry. The insight that Uber can put brands in the exact moment of a journey, when someone is present and receptive, is a story that deserves the biggest stage. Cannes Lions 2026 is that stage and we have a specific opportunity inside it.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. An Uber Advertising activation inside the Power House, a branded session, a dinner, a creative moment or a broader presence throughout the week, positions Uber Advertising directly in front of the senior brand and marketing leadership that drives advertising investment decisions.

We have a limited number of partnership spots available for the week. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── LTK ─────────────────────────────────────────────────────────────────
  {
    name: 'Reesa Lake', email: 'reesa.lake@ltk.com',
    subject: 'LTK x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Reesa,

I have been following LTK's trajectory and the way you have positioned the platform at CES 2026 as the infrastructure of creator-led commerce was sharp. The argument that creators do not just influence discovery, they drive the full purchase journey, is exactly the conversation happening at the senior level at Cannes Lions.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, agency leads and brand decision-makers. These are the people who set the creator partnership and commerce budgets that flow through LTK. A branded LTK presence inside the Power House, whether a session on the future of creator commerce, a dinner, or a broader activation across the week, positions LTK directly in the room where those decisions are made.

As VP and Head of Creator Agency Partnerships, this feels like it sits directly in your brief. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Amber Venz Box', email: 'amber.venz.box@ltk.com',
    subject: 'LTK x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Amber,

What you have built with LTK is one of the most genuine creator economy success stories of the decade. A platform that started as a personal blog tool and scaled into the infrastructure for creator-led commerce at scale. Cannes Lions is the one week of the year where the senior creative and brand leaders who shape what the creator economy looks like gather in one place. We want LTK to be part of that conversation.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. The room is full of the people who are making creator partnership and commerce investment decisions at the highest level.

An LTK presence inside the Power House during Lions week, whether a session, a dinner, a creator-focused activation or a broader branded presence, puts LTK at the centre of the most important brand and creator economy conversation of the year. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── PATREON ─────────────────────────────────────────────────────────────
  {
    name: 'Leticia Hirabayashi', email: 'leticia.hirabayashi@patreon.com',
    subject: 'Patreon x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Leticia,

Your point about Patreon fans already being deeply engaged in podcasts and video and that deep engagement being the differentiator is exactly the kind of insight that resonates at Cannes Lions. The platform you are acquiring creators onto is the home of the most loyal and commercially valuable audiences in the creator economy. That story deserves the biggest stage.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. The people in this room are making the decisions about where brand investment in the creator economy flows. A Patreon activation inside the Power House, whether a session on creator membership and sustainability, a branded dinner or a broader presence during the week, positions Patreon directly in front of the right audience at the right moment.

We have a limited number of partnership spots available for the week. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Jack Conte', email: 'jack.conte@patreon.com',
    subject: 'Patreon x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jack,

Patreon is one of the most genuinely creator-first businesses ever built and the growth of the membership model as a sustainable alternative to ad-driven monetisation is one of the most important stories in the creator economy right now. Cannes Lions is where the industry comes to talk about the future of creativity and commerce, and Patreon belongs in that conversation at the highest level.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. The people in this room are the ones who shape how the creative industry thinks about creator sustainability, platform relationships and the economics of independent creation.

A Patreon presence at the Power House during Lions week, whether a session, a dinner or a broader activation, creates a Cannes moment that tells the Patreon story in exactly the right room. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── MONZO ───────────────────────────────────────────────────────────────
  {
    name: 'AJ Coyne', email: 'aj.coyne@monzo.com',
    subject: 'Monzo x Indvstry Power House — Cannes Lions 2026',
    body: `Hi AJ,

Monzo has built one of the most distinctive brand voices in financial services, genuinely human, direct, and culturally switched on. That voice resonates with exactly the kind of senior creative and brand leaders who fill the room at Indvstry Power House and I want to put a specific opportunity in front of you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. Intimate, invite-only, and built for quality conversation. The people in this room are opinion-formers who influence how fintech brands are perceived, discussed and adopted at scale.

A Monzo presence at the Power House during Lions week, a branded session, a dinner, a creative activation or a broader partnership across the residency, puts Monzo in the most senior creative industry room in the world at exactly the moment the conversation about the future of money and financial culture is happening. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Emily Suter', email: 'emily.suter@monzo.com',
    subject: 'Monzo x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Emily,

As Director of Brand Marketing at Monzo you are building the identity of a brand that has done something genuinely rare in financial services: made people actually feel something about their bank. That emotional connection and brand quality is what Cannes Lions is all about and I want to put an opportunity in front of you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. The room is full of people who appreciate exactly what Monzo has built on the brand side and who shape how fintech is talked about and adopted across the creative industry.

A Monzo activation inside the Power House during Lions week, whether a session, a branded dinner or a broader presence throughout the residency, creates a high-quality Cannes moment that sits naturally alongside the Monzo brand. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── MONEYBOX ────────────────────────────────────────────────────────────
  {
    name: 'Charlotte Oates', email: 'charlotte.oates@moneyboxapp.com',
    subject: 'Moneybox x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Charlotte,

Moneybox has built a genuinely mission-driven brand around making saving and investing accessible and the way the team has stayed in lockstep with customers through every stage of the journey is a rare thing in fintech. Cannes Lions is the environment where brands like Moneybox get to tell that story to the people who shape how financial culture moves.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. The people in this room are early adopters of values-led brands and influential voices in how financial products are discussed, recommended and adopted across creative and professional networks.

A Moneybox presence at the Power House, whether a session on the future of financial wellbeing, a branded dinner or a broader activation during the week, positions the brand in the most senior creative room of the year. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Ben Stanway', email: 'ben.stanway@moneyboxapp.com',
    subject: 'Moneybox x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Ben,

What you and the team have built with Moneybox, a genuinely trusted savings and investment platform with a loyal community of customers at the centre of everything, is exactly the kind of brand story that lands powerfully at Cannes Lions. This is where the creative and marketing leaders who shape consumer financial culture gather and we want to put Moneybox in that room.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. A Moneybox partnership at the Power House during Lions week gives the brand direct access to the opinion-formers who shape how financial products are talked about and recommended across the industry.

We have a limited number of partnership spots available. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── REVOLUT ─────────────────────────────────────────────────────────────
  {
    name: 'Antoine Le Nel', email: 'antoine.le-nel@revolut.com',
    subject: 'Revolut x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Antoine,

Your point about the Audi F1 partnership being about deep integration rather than just putting a sticker on the car is exactly the mindset we look for in a Power House partner. Surface-level is not what we do either.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. Intimate, invite-only, and built for genuine depth of engagement. Revolut's brand story, global ambition, premium positioning and the boldness of what you have been building with sport and culture, lands perfectly in this room. The people here are exactly the audience that validates Revolut's move from challenger bank to global financial institution.

A Revolut activation inside the Power House, whether a branded session, an exclusive dinner, a product moment or a broader presence throughout the week, creates a Cannes moment that reflects the ambition of the brand. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Fiona Davies', email: 'fiona.davies@revolut.com',
    subject: 'Revolut x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Fiona,

As Head of Growth for UK, Ireland and the Nordics at Revolut, Cannes Lions sits directly in your market and this is one of the most concentrated rooms of influential senior professionals you will find anywhere in Europe. I want to put a specific opportunity in front of you ahead of June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers from across Europe and globally. The people in this room are premium users, early adopters and influential voices who shape how financial products are recommended and adopted across professional networks.

A Revolut presence at the Power House during Lions week, a branded session, an exclusive dinner or a broader activation across the residency, puts Revolut directly in front of exactly the audience your growth strategy is built around. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── MONEYGRAM ───────────────────────────────────────────────────────────
  {
    name: 'Anthony Soohoo', email: 'anthony.soohoo@moneygram.com',
    subject: 'MoneyGram x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Anthony,

The digital transformation story you are driving at MoneyGram, moving from a legacy remittance brand into a genuinely modern digital payment platform, is exactly the kind of brand reinvention narrative that Cannes Lions is made for. The most senior creative and marketing leaders in the world gather there every June and this is the right moment to put MoneyGram in that room.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. A MoneyGram presence at the Power House, whether a session on digital financial inclusion and the future of global payments, a branded dinner or a broader activation across the week, creates a Cannes moment that directly supports the brand's repositioning story.

We have a limited number of partnership spots available. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Pamela Patsley', email: 'pamela.patsley@moneygram.com',
    subject: 'MoneyGram x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Pamela,

MoneyGram's story is one of the most interesting brand transformations in financial services right now. A business built on global remittance that is reinventing itself for a digital, borderless economy. Cannes Lions 2026 is where the most senior creative and brand leaders come to talk about exactly that kind of cultural and commercial evolution.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. The people in this room are the connectors and decision-makers who shape how financial brands are perceived and trusted on a global scale.

A MoneyGram activation inside the Power House during Lions week gives the brand a Cannes presence that directly serves its global repositioning. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── TIDE ────────────────────────────────────────────────────────────────
  {
    name: 'Oliver Prill', email: 'oliver.prill@tide.co',
    subject: 'Tide x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Oliver,

Tide's growth to over 1.5 million business members is a remarkable story and the way you have positioned the platform at the centre of small business financial infrastructure is genuinely compelling. Cannes Lions is where the world's most senior brand, creative and business leaders converge and we want Tide in that room.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. Many of the people in this room are founders and entrepreneurs, exactly Tide's core audience. A Tide presence at the Power House, whether a session on the future of business banking, a branded dinner or a broader activation during the week, connects the brand directly with the decision-making founders who set the tone for how tools like Tide are adopted across the entrepreneurial ecosystem.

We have a limited number of partnership spots available. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Jalin Somaiya', email: 'jalin.somaiya@tide.co',
    subject: 'Tide x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jalin,

Tide's marketing over the past few years has become notably sharper and the way the brand has moved from functional messaging into something with genuine personality and distinctiveness is noticeable. Cannes Lions is where the most senior creative and brand leaders gather and we want to put Tide in that room.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. Many of the people in the villa are founders and business owners, Tide's core audience, and they are also the opinion-formers who shape how fintech tools are recommended and adopted.

A Tide activation inside the Power House during Lions week gives the brand direct access to exactly that audience in a premium, intimate setting. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── CURVE CARD ──────────────────────────────────────────────────────────
  {
    name: 'Shachar Bialick', email: 'shachar.bialick@curve.com',
    subject: 'Curve x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Shachar,

Curve's resilience story is one of the most compelling in fintech. Building something genuinely category-defining, cards on top of cards, and pushing through every obstacle to get there, takes a specific kind of conviction. That same conviction is what draws the audience at Indvstry Power House to the brands they adopt and champion.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. Many of these people are exactly the kind of early adopters and premium users that Curve's growth is built around. A Curve presence at the Power House, whether a session, a branded dinner or a broader activation during the week, connects the brand with the influencers who shape fintech adoption at the highest level.

We have a limited number of partnership spots available. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Nathalie Oestmann', email: 'nathalie.oestmann@curve.com',
    subject: 'Curve x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Nathalie,

As Chief Operating Officer at Curve you sit at the heart of the platform's growth and brand story. Curve Pay, the growing member base, the push toward profitability, these are all markers of a brand that is about to reach genuine mainstream awareness. Cannes Lions is where that next chapter gets in front of the right audience.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. These are exactly the premium, mobile-first, digitally native professionals that Curve is built for. A Curve activation at the Power House during Lions week puts the brand in front of opinion-formers who shape fintech adoption across their professional networks.

We have a limited number of partnership spots available. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── AMEX ────────────────────────────────────────────────────────────────
  {
    name: 'Elizabeth Rutledge', email: 'elizabeth.rutledge@aexp.com',
    subject: 'American Express x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Elizabeth,

Your philosophy of putting the customer at the centre of everything Amex does is one that translates directly into the logic of Indvstry Power House. We are building an experience, not a sponsorship opportunity, and the distinction matters.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. The people in this room are the premium, globally connected, experience-driven professionals that American Express has always been built for. Membership has its privileges, and the Power House is exactly that kind of privileged access.

An Amex activation inside the Power House during Lions week, whether a cardholder-exclusive dinner, a branded session, a concierge-style experience or a broader presence throughout the residency, is the kind of high-quality, intimate brand moment that sits naturally alongside everything Amex stands for. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Jill Hamilton', email: 'jill.hamilton@aexp.com',
    subject: 'American Express x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jill,

American Express has always known how to create experiences that feel genuinely exclusive rather than just expensive and Cannes Lions is one of the best environments in the world for that brand story to be told. We want to explore bringing Amex inside Indvstry Power House this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural tastemakers. Intimate, invite-only, and high quality. The Amex audience personified.

A branded Amex moment inside the Power House, a cardholder-exclusive dining experience, a curated session, a concierge activation or a broader presence throughout the residency, creates exactly the kind of rich, personal brand experience that only Amex can pull off authentically. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── VISA ────────────────────────────────────────────────────────────────
  {
    name: 'Kim Kadlec', email: 'kim.kadlec@visa.com',
    subject: 'Visa x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Kim,

Visa Europe's sponsorship strategy, making sure partnerships go beyond brand visibility to drive genuine relevance and resonance, is exactly the standard we hold ourselves to at Indvstry Power House. We are not interested in logos and lanyards. We build real moments that matter.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders across Europe and globally. This is the most concentrated room of high-value Visa cardholders and commercial decision-makers anywhere in the world during Lions week.

A Visa activation inside the Power House, whether a multi-sensory branded moment, a session on the future of payments and creativity, a dinner or a broader presence throughout the residency, gives Visa a Cannes moment that is genuinely in the moments that matter. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Suzan Kereere', email: 'suzan.kereere@visa.com',
    subject: 'Visa x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Suzan,

As President of Global Markets at Visa you oversee one of the most globally connected brand stories in the payments industry. Cannes Lions is the most globally concentrated moment of senior creative and brand leadership in the year and we want Visa inside the room where those leaders gather.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers from across markets. The intersection of global commerce, creativity and culture that Visa is built for.

A Visa activation at the Power House during Lions week, whether a session, a branded experience, a dinner or a broader presence across the residency, positions Visa at the heart of the most important creative industry conversation of the year. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },

  // ─── MASTERCARD ──────────────────────────────────────────────────────────
  {
    name: 'Raja Rajamannar', email: 'raja.rajamannar@mastercard.com',
    subject: 'Mastercard x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Raja,

You have been one of the most consistent and compelling voices on why Cannes matters, why experiential is not a tactic but a brand philosophy, and why Priceless is one of the most durable ideas in marketing. That thinking is at the core of everything we are building at Indvstry Power House and I want to bring the Mastercard story into our villa this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural tastemakers. Priceless in the most literal sense. The kind of experience that cannot be replicated.

A Mastercard activation inside the Power House during Lions week, building on the Priceless Experiences platform, with a cardholder-exclusive moment, a branded dinner, an immersive session or a broader presence throughout the residency, is a natural extension of everything Mastercard already does at Cannes. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
  {
    name: 'Cheryl Guerin', email: 'cheryl.guerin@mastercard.com',
    subject: 'Mastercard x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Cheryl,

As EVP of Global Brand Strategy and Innovation at Mastercard you sit at the exact intersection of experiential, multisensory brand-building and creative industry leadership. No brand does Cannes better than Mastercard and we want to be part of that story this year.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. Intimate, invite-only, and built around the quality of experience and connection. Everything the Priceless platform stands for in a single, contained setting.

A Mastercard presence inside the Power House during Lions week, whether as a Priceless Experience activation, a cardholder-exclusive evening, a branded dinner or a broader partnership throughout the residency, sits naturally alongside everything Mastercard already builds at Cannes. We have a limited number of brand partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;
  const total = contacts.length;

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
          name: 'indvstry-logo.png', contentType: 'image/png',
          contentBytes: logoB64, contentId: 'indvstry-logo', isInline: true,
        }];
      }
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      sent++;
      console.log(`[${sent}/${total}] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nDone. ${sent}/${total} sent.`);
}

sendAll().catch(console.error);
