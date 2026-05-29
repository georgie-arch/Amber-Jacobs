/**
 * Entertainment streaming IPH partnership outreach — 30 emails across 15 platforms
 * Netflix, Disney+, Apple TV+, HBO Max, ESPN, Prime Video, Paramount+,
 * Peacock, Showtime, Crunchyroll, Tubi, AMC+, FuboTV, Starz, Hulu
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-entertainment-streaming-iph-outreach.ts
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

  // ─── NETFLIX ────────────────────────────────────────────────────────────────
  {
    name: 'Marian Lee', email: 'marian.lee@netflix.com',
    subject: 'Netflix x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Marian,

Your line that fandom solves almost all known problems is one of the most concise and useful things anyone in marketing has said in recent years. The way you have built Netflix's brand around culture creation and immersion rather than just content distribution is genuinely distinctive. That philosophy is what I want to talk to you about in the context of Cannes Lions this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural tastemakers. The people in this room are exactly the kind of culture-shaping audience that Netflix's fandom strategy is built around.

The opportunity is a Netflix-branded activation inside the villa during the week. A private screening, a dinner tied to a major Netflix title, a content moment, or a broader presence throughout the residency. Cannes Lions is the most documented and most shared week in the global creative calendar. An immersive Netflix moment in a room of the people who shape cultural conversations feels deeply aligned with everything you have been building.

Our full sponsorship deck is here: https://canva.link/j9tgb9z2annevnz and more about us at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Magno Herran', email: 'magno.herran@netflix.com',
    subject: 'Netflix x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Magno,

As VP of Global Brand and Partnership Marketing at Netflix you sit at the exact intersection of what we want to build at Cannes Lions this June and I wanted to reach out directly.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. This is not a badge-and-lanyard event. It is a carefully curated, intimate residency where the most senior people at Lions come together in a private setting for real conversations and real connection.

A Netflix brand partnership inside the Power House during Lions week, whether through a title activation, a private screening, a branded dinner or a broader presence throughout the residency, gives Netflix direct access to the creative industry audience that shapes how culture moves from the industry into the mainstream. The same audience your partnership strategy is designed to reach.

We have a limited number of brand partnership spots available for the week. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── DISNEY+ ────────────────────────────────────────────────────────────────
  {
    name: 'Asad Ayaz', email: 'asad.ayaz@disney.com',
    subject: 'Disney+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Asad,

The scale of what you have overseen across Disney Entertainment Marketing, particularly navigating the Disney+ and Hulu integration while keeping the brand identity of each distinct, is one of the more complex and impressive marketing challenges of recent years. Cannes Lions is the moment where that integrated story can be told in front of exactly the right room.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. Private dinners, closed programming, and the most intimate base during the most important week in the global creative calendar.

A Disney+ activation inside the Power House, whether a title moment, a private screening, a branded dinner or a broader presence across the week, lands in front of the people who shape how the industry thinks about storytelling, streaming and premium entertainment. We have a limited number of brand partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Barrie Gruner', email: 'barrie.gruner@disney.com',
    subject: 'Hulu x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Barrie,

As EVP of Hulu Marketing you are overseeing the brand's identity during one of its most significant moments of evolution and Cannes Lions 2026 is the right stage to amplify that story.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. Intimate, curated, invite-only. The room where the most important Lions conversations actually happen.

A Hulu-branded activation inside the Power House, a title activation, a branded dinner, a private screening or a broader presence throughout the week, puts Hulu directly in front of the creative and brand leaders whose tastes and decisions shape how streaming is talked about, written about and positioned across the industry. We have a limited number of brand partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to your thoughts.`,
  },

  // ─── APPLE TV+ ──────────────────────────────────────────────────────────────
  {
    name: 'Ricky Strauss', email: 'ricky.strauss@apple.com',
    subject: 'Apple TV+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Ricky,

Apple TV+ has built one of the most critically respected content slates in streaming, and the marketing challenge has always been converting that critical prestige into mainstream cultural conversation. Cannes Lions is one of the few environments where that conversion happens naturally and we have a specific opportunity to put in front of you ahead of June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural tastemakers. The people in this room are exactly the audience for whom Apple TV+ critical quality resonates most. They are also among the most influential voices in shaping how premium content is discussed across the creative industry.

A branded Apple TV+ moment inside the Power House, whether tied to a specific title, a private screening evening, a dinner or a broader presence across the week, is the kind of intimate, high-quality activation that sits naturally alongside the Apple TV+ brand. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Karin Gilford', email: 'karin.gilford@apple.com',
    subject: 'Apple TV+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Karin,

As VP of Apple TV+ you oversee the product and its positioning in one of the most competitive streaming landscapes in the world. Cannes Lions is the moment in the global creative calendar where that positioning can be reinforced and amplified with exactly the right audience.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. Intimate, invite-only, and genuinely high-quality. The setting mirrors what Apple TV+ stands for and the room is full of the people who shape industry perception of premium entertainment.

A branded Apple TV+ activation inside the Power House during Lions week, a title activation, private screening, branded dinner or a presence throughout the residency, gives the platform a Cannes moment that matches its quality positioning. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── HBO MAX ────────────────────────────────────────────────────────────────
  {
    name: 'Twyla Huang-DiSimone', email: 'twyla.huang-disimone@wbd.com',
    subject: 'HBO Max x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Twyla,

The rebrand back to HBO Max is a powerful signal and the way you have been building WBD's brand solutions around the prestige of the HBO name is a story that deserves a stage as significant as the brand itself. Cannes Lions 2026 is that stage and we have something specific to put in front of you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural tastemakers. Intimate, invite-only, and built around the quality of conversation and connection it creates.

An HBO Max activation inside the Power House, a title moment, a private screening, a branded dinner tied to a flagship series, or a broader presence throughout the week, lands in a room of exactly the creative and brand leadership that HBO Max's premium positioning speaks to. We have a limited number of brand partnership spots available for the week.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'JB Perrette', email: 'jb.perrette@wbd.com',
    subject: 'HBO Max x Indvstry Power House — Cannes Lions 2026',
    body: `Hi JB,

As President and CEO of Global Streaming and Games at Warner Bros. Discovery, the Cannes Lions window sits directly in your brief. The week of 21 to 26 June is one of the most concentrated moments of senior brand, creative and media leadership anywhere in the world and we have a specific opportunity to bring HBO Max into the heart of it.

We are running Indvstry Power House at Cannes Lions 2026 — a private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. Intimate, invite-only, built for quality conversation. The kind of environment that reflects exactly what the HBO Max brand stands for.

An HBO Max partnership inside the Power House during Lions week, whether as a title activation, a private screening, a branded dinner or a broader presence across the residency, positions HBO Max directly in front of the people who shape how the industry talks about premium streaming. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to connect. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── ESPN ───────────────────────────────────────────────────────────────────
  {
    name: 'Seth Ader', email: 'seth.ader@espn.com',
    subject: 'ESPN x Indvstry Power House — World Cup Watch Party at Cannes Lions 2026',
    body: `Hi Seth,

There is a window in June 2026 that sits at the intersection of two of the biggest cultural moments of the year and I want to talk to you about owning it.

FIFA World Cup 2026 matches will be running throughout the week of Cannes Lions, 22 to 26 June. The most senior creative, brand and media leaders in the world will all be in the South of France. And we are running Indvstry Power House — a private villa residency just outside the Palais where those leaders gather for private dinners, closed programming and genuine connection.

The opportunity is an ESPN-powered World Cup watch party at the Power House or on a private yacht during Lions week. Invite-only. Curated audience. CMOs, creative directors, founders and agency leaders watching the World Cup together, powered by ESPN, in the most photographed and most documented week in global brand culture. It is the kind of activation that sits at the exact crossroads of sport, culture and brand that ESPN is built for.

As VP of Brand Marketing at ESPN this feels like it lands squarely in your brief. We have a limited number of platform partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Jo Fox', email: 'jo.fox@espn.com',
    subject: 'ESPN x Indvstry Power House — World Cup Watch Party at Cannes Lions 2026',
    body: `Hi Jo,

This is a message about a very specific convergence of timing that I think is worth your attention.

FIFA World Cup 2026 matches will be live throughout Cannes Lions week, 22 to 26 June. The most senior creative, brand and media leaders in the world are in the South of France. We are running Indvstry Power House — a private villa residency just outside the Palais.

The activation we want to build with ESPN is a World Cup watch party inside that week. At the Power House villa or on a private yacht on the Riviera. Invite-only. CMOs, creative directors, founders and media leaders watching the World Cup together, powered by ESPN, captured and shared during the most documented week in global brand culture. Sport, creativity and culture converging in a setting that only Cannes can provide.

As SVP of Marketing at ESPN you understand better than most the value of owning a cultural moment at the intersection of sports and brand. This is that moment. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to your thoughts.`,
  },

  // ─── PRIME VIDEO ────────────────────────────────────────────────────────────
  {
    name: 'Claire Paull', email: 'claire.paull@amazon.com',
    subject: 'Prime Video x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Claire,

Amazon's presence at Cannes Lions 2025 was one of the most talked-about of the festival and the way you articulated the intersection of storytelling, entertainment and advertising solutions set a high bar for what a platform presence at Lions can look like. We want to build on that conversation.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. The intimate counterpart to the scale of a festival main stage.

A Prime Video activation inside the Power House, a title moment, a private screening tied to a flagship series, a branded dinner or a broader presence throughout the residency, gives Prime Video direct access to the creative and brand leadership that drives both content conversation and advertising investment. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Danielle Carney', email: 'danielle.carney@amazon.com',
    subject: 'Prime Video x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Danielle,

As Head of US Video and Sports Sales at Amazon Ads you sit at the intersection of streaming, live sport and brand partnerships. Cannes Lions 2026 is the week where all three of those worlds collide and I want to put a specific opportunity in front of you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. This is the room where the people who make advertising investment decisions gather in a private, high-quality setting during Lions week.

A Prime Video presence inside the Power House, whether tied to sports content, a flagship title, a branded dinner or a broader activation across the week, gives Amazon's video and advertising story direct access to exactly the right decision-making audience. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to your thoughts.`,
  },

  // ─── PARAMOUNT+ ─────────────────────────────────────────────────────────────
  {
    name: 'Tiffany Smith-Anoa\'i', email: 'tiffany.smith-anoai@paramount.com',
    subject: 'Paramount+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Tiffany,

Your work building content engagement and industry partnerships at Paramount has been consistent and the depth of the content slate you are working with, from Star Trek to Yellowstone to the Paramount+ originals library, gives you one of the richest activation toolkits in the streaming space. Cannes Lions is the right stage for that toolkit.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. Private dinners, closed-door programming and a room full of the most engaged and connected leaders in the global creative industry.

A Paramount+ activation inside the Power House, a title moment, a branded screening, a dinner tied to a flagship series or a broader presence throughout the week, lands in front of exactly the creative industry audience that shapes how streaming platforms are perceived and discussed. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Chris McCarthy', email: 'chris.mccarthy@paramount.com',
    subject: 'Paramount+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Chris,

As President and CEO of Paramount Media Networks you have one of the most diverse and culturally rich content portfolios in the industry. From MTV to Comedy Central to Showtime to Paramount+ there are very few organisations that can claim the same breadth of cultural impact. Cannes Lions is the moment where that story can be told in the most concentrated room of creative and brand leaders in the world.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. Intimate, invite-only, and genuinely high-quality.

A Paramount+ presence inside the Power House, whether across multiple brands in the portfolio, tied to a specific title, a branded dinner or a broader activation during the week, positions Paramount's creative and cultural range in front of exactly the right room. We have a limited number of brand partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── PEACOCK ────────────────────────────────────────────────────────────────
  {
    name: 'Shannon Willett', email: 'shannon.willett@nbcuniversal.com',
    subject: 'Peacock x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Shannon,

Your work positioning Peacock's live programming, particularly around the Olympics, as the differentiator in a crowded streaming landscape has been sharp. The insight that live, in-the-moment content creates a different kind of attention and loyalty is exactly the thinking behind what we are building at Indvstry Power House during Cannes Lions this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural leaders. Private dinners, closed-door programming, and a room where the most important Lions conversations happen in real time.

A Peacock activation inside the Power House, whether tied to a live content moment, a branded dinner, a title activation or a broader presence throughout the week, gives Peacock direct access to the creative and brand leadership audience that shapes industry perception of streaming. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Alison Levin', email: 'alison.levin@nbcuniversal.com',
    subject: 'Peacock x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Alison,

As President of Advertising and Partnerships at NBCUniversal you are responsible for building the commercial relationships that sit underneath one of the most diverse media portfolios in the industry. Cannes Lions is the week where those relationships are made and deepened and we have a specific opportunity to bring Peacock into the heart of it.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. The most senior room at the festival, in the most intimate setting.

A Peacock partnership inside the Power House during Lions week gives the platform direct access to the advertising and brand leadership that drives streaming investment decisions. A title activation, branded dinner, live content moment or broader presence across the residency, this is the kind of environment where the commercial conversations you are building happen naturally. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to your thoughts.`,
  },

  // ─── SHOWTIME ───────────────────────────────────────────────────────────────
  {
    name: 'Kevin Arrix', email: 'kevin.arrix@paramount.com',
    subject: 'Showtime / Paramount+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Kevin,

As EVP of Paramount Advertising you are building the commercial layer across one of the richest content portfolios in the industry. Showtime's prestige drama brand, now amplified through the Paramount+ platform, has a story that deserves a premium stage at Cannes Lions this year.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. Intimate, invite-only, and built for quality.

A Showtime or Paramount+ activation inside the Power House, a private screening of a flagship drama, a branded dinner, a title moment tied to a premier series or a broader presence across the week, lands in front of the creative industry audience that has always been Showtime's most engaged. The people in this room set the tone for how premium content is discussed, championed and invested in across the industry.

We have a limited number of brand partnership spots available. Full sponsorship deck: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Amy Israel', email: 'amy.israel@paramount.com',
    subject: 'Showtime x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Amy,

As EVP of Scripted Programming at Showtime you have overseen some of the most culturally significant drama of the past several years. The Showtime brand is synonymous with quality, edge and prestige and Cannes Lions is the one week of the year where that brand can speak directly to the creative and cultural leaders who have always been its most natural audience.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. Private dinners, closed-door programming, and a room where conversations about culture, creativity and great content happen naturally.

A Showtime activation inside the Power House, a private screening of a flagship title, a dinner tied to a premier series or a broader branded presence during the week, creates the kind of intimate, immersive content moment that the Showtime brand was built for. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── CRUNCHYROLL ────────────────────────────────────────────────────────────
  {
    name: 'Joanne Waage', email: 'joanne.waage@crunchyroll.com',
    subject: 'Crunchyroll x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Joanne,

Anime has crossed fully into mainstream brand culture and Crunchyroll is at the centre of that shift. The way the platform has grown from a niche community into a globally recognised cultural force is one of the most compelling brand stories in streaming. Cannes Lions 2026 is the right stage to tell that story to the people who shape the global creative industry.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. The people in this room are at the forefront of how brand culture moves, and many of them are already part of the global anime conversation whether they frame it that way or not.

A Crunchyroll activation inside the Power House, a title moment, a themed dinner, an immersive branded experience or a broader presence throughout the week, would be a genuinely unexpected and culturally sharp statement at Lions. We have a limited number of brand partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Asa Suehira', email: 'asa.suehira@crunchyroll.com',
    subject: 'Crunchyroll x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Asa,

As Chief Content Officer at Crunchyroll you have a front-row seat to one of the most remarkable cultural movements in entertainment. Anime's integration into mainstream brand culture and global youth identity is a story that is only accelerating and Cannes Lions is the moment where that story lands with the most senior creative and brand leaders in the world.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. Intimate, invite-only, and built around genuine cultural exchange.

A Crunchyroll presence inside the Power House during Lions week, whether as a title activation, a themed dinner, an immersive content moment or a broader branded presence, would be one of the most culturally distinct activations at the festival. The room is full of people who are already influenced by the cultural forces Crunchyroll sits at the centre of, even if they do not always know it yet. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── TUBI ───────────────────────────────────────────────────────────────────
  {
    name: 'Nicole Parlapiano', email: 'nicole.parlapiano@tubi.tv',
    subject: 'Tubi x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Nicole,

The brand voice you have built for Tubi is one of the most distinctive in streaming. Irreverent, confident, self-aware. The way Tubi has leaned into the tension between free and premium rather than shying away from it is genuinely smart brand strategy. Cannes Lions is the room where the people who appreciate that kind of strategic clarity gather and I want to put an opportunity in front of you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. Intimate, invite-only, and full of the people who talk about brand strategy at the highest level.

A Tubi activation inside the Power House during Lions week, whether a branded evening, a title spotlight, a dinner with the Tubi voice front and centre, or a broader presence throughout the residency, is the kind of unexpected, high-quality moment that cuts through festival noise in exactly the way Tubi's brand is built to do. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Anjali Sud', email: 'anjali.sud@tubi.tv',
    subject: 'Tubi x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Anjali,

Tubi's growth under your leadership as a free, ad-supported platform that has become genuinely culturally relevant is one of the more interesting streaming stories of the past few years. The argument that you do not need a subscription to have a great content experience is starting to win and Cannes Lions is the right stage to put that story in front of the people who shape how the industry thinks about streaming.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural tastemakers. The most senior and engaged room at the festival.

A Tubi partnership inside the Power House during Lions week, a branded activation, a dinner, a title moment or a broader presence throughout the residency, positions Tubi directly in the creative industry conversation at the most important moment of the year. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── AMC+ ───────────────────────────────────────────────────────────────────
  {
    name: 'Kim Kelleher', email: 'kim.kelleher@amcnetworks.com',
    subject: 'AMC+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Kim,

As President of Commercial Revenue and Partnerships at AMC Networks you have built one of the most credible brand partnership operations in streaming around a content slate that punches significantly above its weight culturally. The Walking Dead universe, Better Call Saul, Anne Rice's Interview with a Vampire. These are titles that define prestige for their audiences. Cannes Lions is the moment where that prestige translates directly into commercial and brand opportunity.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. Intimate, invite-only, and built for quality conversation.

An AMC+ activation inside the Power House during Lions week, a title moment, a branded dinner tied to a flagship series, a private screening or a broader presence throughout the residency, lands in front of exactly the creative and brand leadership that AMC Networks' content speaks to most deeply. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Evan Adlman', email: 'evan.adlman@amcnetworks.com',
    subject: 'AMC+ x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Evan,

As EVP of Commercial Sales and Revenue Operations at AMC Networks you work across one of the most distinctive content portfolios in the industry. The AMC+ brand carries genuine cultural weight and Cannes Lions is the environment where that weight is recognised and valued most.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. The most intimate and senior gathering during Lions week.

An AMC+ activation inside the Power House, a title moment, a branded dinner, a private screening tied to a flagship series or a broader presence throughout the residency, gives AMC Networks a Cannes moment that sits naturally alongside the prestige of the content brand. We have a limited number of partnership spots available for the week.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── FUBOTV ─────────────────────────────────────────────────────────────────
  {
    name: 'David Gandler', email: 'david.gandler@fubo.tv',
    subject: 'FuboTV x Indvstry Power House — World Cup Watch Party at Cannes Lions 2026',
    body: `Hi David,

FuboTV was built on the belief that sports-first streaming would define the future of how people watch live content. FIFA World Cup 2026 is arguably the biggest validation of that thesis in the platform's history and it happens to coincide with Cannes Lions week, 22 to 26 June, the most senior gathering of brand and creative leaders in the world. I want to talk to you about owning that overlap.

We are running Indvstry Power House at Cannes Lions 2026, a private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. We want to build a FuboTV-powered World Cup watch party at the Power House or on a private yacht during the week. Invite-only. The most senior creative and brand audience in the world, watching the World Cup live together, powered by FuboTV.

Cannes is the most documented week in global brand culture and a FuboTV activation at the centre of it, during the World Cup, is a statement that directly validates everything the platform stands for. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Denis Kondrashov', email: 'denis.kondrashov@fubo.tv',
    subject: 'FuboTV x Indvstry Power House — World Cup Watch Party at Cannes Lions 2026',
    body: `Hi Denis,

I want to put a very specific and time-relevant opportunity in front of you ahead of Cannes Lions this June.

FIFA World Cup 2026 matches will be running throughout Cannes Lions week, 22 to 26 June. The most senior creative, brand and media leaders in the world will be in the South of France. We are running Indvstry Power House, a private villa residency just outside the Palais, and we want to build a FuboTV-powered World Cup watch party inside that week.

The activation idea is simple. An invite-only gathering at the Power House or on a private yacht, bringing CMOs, creative directors, founders and agency leaders together to watch World Cup matches live, powered by FuboTV. The most sports-forward streaming platform, at the intersection of sport, culture and brand, during the most documented week of the global creative calendar.

FuboTV's brand is built on live sports and this is the kind of activation that tells that story in the most compelling environment possible. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to your thoughts.`,
  },

  // ─── STARZ ──────────────────────────────────────────────────────────────────
  {
    name: 'Jeffrey Hirsch', email: 'jeffrey.hirsch@starz.com',
    subject: 'Starz x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jeffrey,

Starz has built an incredibly loyal audience around its programming, particularly around the Power universe and the culturally resonant stories that speak to underrepresented communities. That audience and those stories deserve a moment on the most senior creative stage in the world and Cannes Lions 2026 is that moment.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. Intimate, invite-only, and built around the quality and depth of conversation.

A Starz activation inside the Power House during Lions week, a title moment, a branded dinner, a private screening tied to a flagship series or a broader presence throughout the residency, positions Starz directly in front of the creative and brand leadership that shapes how culturally significant content is championed and discussed. We have a limited number of partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name: 'Tom Cianciolo', email: 'tom.cianciolo@starz.com',
    subject: 'Starz x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Tom,

As EVP and CMO of Starz you are building the marketing identity of a platform with one of the most culturally distinct content slates in premium streaming. The Power universe, Outlander, the consistently strong slate of Black-led and female-led stories. There is a real brand story to tell here and Cannes Lions is the environment where that story lands with the most impact.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural tastemakers. The most intimate and senior room at the festival.

A Starz activation inside the Power House during Lions week, a title moment, a branded dinner tied to a flagship series, a private screening or a broader branded presence throughout the residency, creates a Cannes moment that reflects the cultural depth and specificity that the Starz brand is known for. We have a limited number of brand partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
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
