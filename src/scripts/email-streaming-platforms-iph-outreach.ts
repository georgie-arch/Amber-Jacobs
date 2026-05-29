/**
 * Streaming platform IPH partnership outreach — 15 emails across 5 platforms
 * Twitch (3), TikTok LIVE (3), YouTube Live (3), Kick (3), Rumble (3)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-streaming-platforms-iph-outreach.ts
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

  // ─── TWITCH ────────────────────────────────────────────────────────────────
  {
    name:    'Robin Tilotta',
    email:   'robin.tilotta@twitch.tv',
    subject: 'Twitch x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Robin,

I have been following your work positioning Twitch as a cultural platform beyond gaming and the creator and partnership marketing strategy you have built. The argument that live, authentic, community-driven content is where the deepest brand relationships are built is exactly the thinking behind what we are creating at Indvstry Power House this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. But we also want to talk to you about something bigger.

Cannes Lions attracts a significant number of top content creators and streamers every year, and this cycle we have proximity to several who will be in and around the festival. We would love to explore what a Twitch-powered exclusive event looks like at the Power House or on a private yacht during the week. Imagine a closed-door live stream or creator gathering, branded under Twitch, in front of the most senior marketing and creative audience at Lions. An event that puts Twitch at the centre of the creator economy conversation in the most documented week of the global creative calendar.

We have a small number of platform partnership spots available and wanted to put this in front of you directly. Our full sponsorship deck is here: https://canva.link/j9tgb9z2annevnz and you can learn more about us at www.indvstryclvb.com.

Would love to get 20 minutes on a call with our founder George. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name:    'John Koller',
    email:   'john.koller@twitch.tv',
    subject: 'Twitch x Indvstry Power House — Cannes Lions 2026',
    body: `Hi John,

As VP of Global Marketing at Twitch you are the right person to be talking to about what we have in mind for Cannes Lions this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. But the conversation I want to have with you goes beyond the villa.

Cannes attracts major streamers and content creators every year, and we have direct proximity to several who will be at the festival. We want to build a Twitch-powered exclusive event during Lions week, either at the Power House or on a private yacht, that brings creators together in front of the most influential marketing and brand leaders in the world. A closed and curated moment that Twitch owns entirely. The kind of content and brand visibility that does not come from a standard festival sponsorship.

We have a small number of platform partnership spots available for the week. Our sponsorship deck is here: https://canva.link/j9tgb9z2annevnz and more about what we do is at www.indvstryclvb.com.

Would love to get on a call and map out what this could look like. Our founder George is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting.`,
  },
  {
    name:    'Amber Dalton',
    email:   'amber.dalton@twitch.tv',
    subject: 'Twitch x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Amber,

As the person leading global events and sponsorships at Twitch, this is exactly the kind of opportunity you need to hear about before Lions.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, founders and cultural leaders. But what we want to discuss with you is a dedicated Twitch event inside that week.

We have proximity to a number of streamers and content creators who will be at Cannes Lions this cycle. The idea is simple: a Twitch-powered exclusive gathering, either at the Power House villa or on a private yacht during the week. Invite-only. Senior creative industry audience. Real creators in the room. Branded entirely under Twitch. The most naturally documented week in global brand culture, and Twitch at the centre of it.

You handle exactly this kind of activation and this feels like it sits squarely in your brief. We have a limited number of platform partnership spots available for the week.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call and walk through the details. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── TIKTOK LIVE ──────────────────────────────────────────────────────────
  {
    name:    'Sofia Hernandez',
    email:   'sofia.hernandez@tiktok.com',
    subject: 'TikTok LIVE x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Sofia,

Your line about being a participant in culture rather than just a student of it has always stuck with me. It is the clearest articulation of what separates platforms that matter from those that just observe. And it is exactly what we are trying to build at Indvstry Power House this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. But the conversation we want to have with TikTok goes further than the villa.

We have proximity to a number of major content creators and streamers who will be at Cannes Lions this cycle. We want to build a TikTok LIVE powered exclusive event during the week, at the Power House or on a private yacht, bringing creators together with the most senior brand and marketing leaders at the festival. A closed, curated LIVE moment that TikTok owns entirely. The most culturally active week in the global creative calendar, and TikTok at the centre of it.

We have a small number of platform partnership spots available. Our sponsorship deck is here: https://canva.link/j9tgb9z2annevnz and you can find out more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name:    'Erika Lewis',
    email:   'erika.lewis@tiktok.com',
    subject: 'TikTok LIVE x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Erika,

The work you and the team did at Cannes Lions 2025 positioning TikTok as a champion of trendsetters and culture makers landed well. The Cannes Lions stage has become genuinely important for that story and we have something to bring to you ahead of 2026.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency for a curated group of senior creative directors, CMOs, founders and cultural leaders just outside the Palais. And this year we want to build something with TikTok LIVE inside the week.

We have direct proximity to a number of major creators and streamers attending Cannes Lions this cycle. The opportunity is a TikTok LIVE branded exclusive event, either at the Power House villa or on a private yacht during the week. Invite-only. Real creators in front of the most influential marketing audience at the festival. The kind of content and cultural moment that TikTok LIVE is built for, in the most documented week of the creative calendar.

This feels directly in your lane as Head of Cultural Partnerships. We have a limited number of platform spots available for the week.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to your thoughts.`,
  },
  {
    name:    'Rema Vasan',
    email:   'rema.vasan@tiktok.com',
    subject: 'TikTok LIVE x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Rema,

As Head of Business Marketing for North America at TikTok, you understand better than most that the most valuable brand moments right now are not the loudest ones. They are the most contextually relevant ones. That is the thinking behind what we are building at Indvstry Power House at Cannes Lions 2026.

We are running a private villa residency, 21 to 26 June, just outside the Palais. A curated group of senior creative directors, CMOs, founders and brand leaders. Private dinners, closed programming, and direct access to the people who make the decisions that matter to TikTok's business marketing story in North America and globally.

And this year we want to go further. We have proximity to several major creators and streamers who will be at Cannes Lions this cycle and want to build a TikTok LIVE powered exclusive event during the week. A yacht or villa gathering that TikTok owns, with real creators and senior brand leaders in the same room, captured and broadcast in a way that only LIVE can deliver.

We have a limited number of platform partnership spots available. Our sponsorship deck is here: https://canva.link/j9tgb9z2annevnz and more at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── YOUTUBE LIVE ─────────────────────────────────────────────────────────
  {
    name:    'Elizabeth Hartnett',
    email:   'elizabeth.hartnett@google.com',
    subject: 'YouTube Live x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Elizabeth,

Your work at Cannes Lions 2025 making the case for creators as strategic brand allies rather than just content tools was one of the most important conversations at the festival last year. The shift you articulated, from creators being a channel to creators being genuine business partners, is exactly the energy we are building into Indvstry Power House this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and brand leaders. But we want to talk to you about something beyond the residency itself.

We have proximity to a number of major content creators and streamers who will be at Cannes Lions this cycle. We want to build a YouTube Live powered exclusive event during the week, at the Power House villa or on a private yacht, bringing creators together with the most senior marketing and brand audience at the festival. A live, branded, documented moment that YouTube owns in the most culturally active week of the creative calendar.

As Head of Creator Marketing for EMEA, this is your territory. We have a limited number of platform partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to your thoughts.`,
  },
  {
    name:    'Pedro Pina',
    email:   'pedro.pina@google.com',
    subject: 'YouTube Live x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Pedro,

Your headliner keynote at MIPCOM Cannes last year positioned YouTube's role in the creative economy in a way that very few platforms can pull off with that level of authority. The argument that YouTube is not just a platform but the infrastructure of modern creative culture is one that resonates well beyond the stage.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. As VP of YouTube EMEA, Cannes Lions sits squarely in your territory and I want to put a specific opportunity in front of you.

We have direct proximity to a number of major content creators and streamers attending Cannes Lions this cycle. We want to build a YouTube Live branded exclusive event during the week, at the Power House or on a private yacht. An invite-only gathering of creators and senior brand leaders, owned and broadcast by YouTube. The most watched and most documented week in the global creative calendar, and YouTube Live at the centre of it.

We have a limited number of platform partnership spots available for the week.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name:    'Vivien Lewit',
    email:   'vivien.lewit@google.com',
    subject: 'YouTube Live x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Vivien,

As Global Head of Creator and Artist Development at YouTube you sit at the exact intersection of what we want to build at Cannes Lions this June and I wanted to reach out directly.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. But the bigger conversation is about what we build together during the week.

We have direct proximity to a number of major creators and streamers who will be at Cannes Lions this cycle. The opportunity is a YouTube Live powered exclusive event, at the Power House villa or on a private yacht, bringing real creators together with the most senior brand and marketing leaders at the festival. An organic, authentic, documented moment that YouTube owns in the most culturally active week of the creative calendar. The kind of thing that only YouTube Live can credibly produce.

We have a limited number of platform partnership spots available and wanted to put this in front of you ahead of the festival.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── KICK ─────────────────────────────────────────────────────────────────
  {
    name:    'Sara Lee',
    email:   'sara.lee@kick.com',
    subject: 'Kick x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Sara,

The "Stream Your Dream" campaign and the growth you have driven at Kick since joining have been impressive to watch. The positioning of Kick as the platform that genuinely bets on creators rather than constraining them is a story that plays extremely well at a festival like Cannes Lions and I want to put an opportunity in front of you ahead of June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. But the bigger conversation is about what we build with Kick during the week.

We have direct proximity to a number of major streamers and content creators attending Cannes Lions this cycle. The opportunity is a Kick-powered exclusive event, at the Power House villa or on a private yacht, featuring real streamers in front of the most senior marketing and brand audience at the festival. An authentic, invite-only moment that Kick owns entirely. Cannes Lions is the most documented and most shared week in the global creative calendar and it is the right stage for Kick's story to be told to exactly the right room.

We have a small number of platform partnership spots available. Our sponsorship deck is here: https://canva.link/j9tgb9z2annevnz and more about us at www.indvstryclvb.com.

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts.`,
  },
  {
    name:    'Andrew Santamaria',
    email:   'andrew.santamaria@kick.com',
    subject: 'Kick x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Andrew,

As Head of Strategic Partnerships at Kick you are the right person to be speaking to about what we are building at Cannes Lions this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. And we want to build a Kick-powered exclusive event inside the week.

Cannes Lions has become the most important moment in the global creative calendar for brand and creator conversations. We have direct proximity to a number of major streamers attending the festival this year. The idea is a Kick-branded exclusive event, at the Power House villa or on a private yacht, that brings real streamers together with senior brand leaders in an intimate, invite-only setting. The kind of brand moment and content opportunity that sets Kick apart from every other platform at the festival.

This sits directly in your brief as Head of Strategic Partnerships. We have a limited number of platform spots available for the week.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting.`,
  },
  {
    name:    'Paul Chianese',
    email:   'paul.chianese@kick.com',
    subject: 'Kick x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Paul,

As Co-Founder of Kick you have built one of the most genuinely creator-first platforms in streaming and the trajectory since launch has been remarkable. Cannes Lions is the moment this year where that story can land in front of exactly the right audience and we have something specific we want to build with you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. And this year we want to co-create a Kick-powered exclusive event during the week.

We have direct proximity to a number of major streamers and content creators attending Cannes Lions this cycle. The vision is a Kick-branded exclusive, at the Power House or on a private yacht, that brings real streamers into the same room as the most senior marketing and brand leaders at the festival. Cannes is the most documented week in global brand culture and a Kick activation there, done the right way, is a statement moment for the platform on a global stage.

We have a limited number of platform partnership spots available and wanted to bring this to you directly.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },

  // ─── RUMBLE ───────────────────────────────────────────────────────────────
  {
    name:    'Ben Torres Ezrick',
    email:   'ben.ezrick@rumble.com',
    subject: 'Rumble x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Ben,

Congratulations on the CMO role. Your point about free enterprise needing free speech and the way Rumble's marketing needs to clearly communicate what the platform stands for and why it matters is the kind of clarity of purpose that cuts through at an event like Cannes Lions. And Cannes is exactly where I want to start a conversation with you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. The people in this room are the buyers, builders and tastemakers whose perspective on platforms and media shapes the conversations that follow.

And we want to go further. We have proximity to a number of major content creators and streamers attending Cannes Lions this cycle. The opportunity is a Rumble-powered exclusive event at the Power House or on a private yacht during the week. Real creators, senior brand leaders, an invite-only setting, and Rumble at the centre of it. The most documented week in the creative calendar and a moment that tells the Rumble story in exactly the right room.

As your first major act as CMO, Cannes Lions is the right stage. We have a limited number of platform partnership spots available.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
  {
    name:    'Larry Shender',
    email:   'larry.shender@rumble.com',
    subject: 'Rumble x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Larry,

As Head of Brand, Agency and Programmatic Demand Partnerships at Rumble you are the person I need to be speaking to about what we are building at Cannes Lions this June.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, brand leaders and founders. But the bigger opportunity for Rumble goes beyond the residency.

We have direct proximity to a number of major creators and streamers attending Cannes Lions this cycle. The idea is a Rumble-powered exclusive event during the week, at the Power House or on a private yacht, that brings real creators together with the most senior agency and brand leadership at the festival. An invite-only moment that Rumble owns. The kind of environment where the conversations about platform partnerships and programmatic investment actually happen.

Given your focus on brand and agency partnerships this feels like it sits directly in your brief. We have a limited number of platform spots available for the week.

Full sponsorship deck: https://canva.link/j9tgb9z2annevnz
More about us: www.indvstryclvb.com

Our founder George would love to get on a call. He is available here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting.`,
  },
  {
    name:    'Chris Pavlovski',
    email:   'chris.pavlovski@rumble.com',
    subject: 'Rumble x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Chris,

The growth trajectory at Rumble over the past year and the way you have built a platform grounded in genuine creator ownership and free expression is a story that deserves a global stage. Cannes Lions is that stage and we have an opportunity we want to put in front of you directly.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural decision-makers. The room is small by design and the quality of the audience is what sets it apart.

And we want to build something bigger with Rumble during the week. We have proximity to a number of major creators and streamers attending Cannes Lions this cycle. The vision is a Rumble-powered exclusive event, at the Power House or on a private yacht, that brings real creators together with the most influential brand and marketing leaders at the festival. Cannes is the most documented and most shared week in global brand culture. A Rumble activation there, in front of the right room, is a significant statement for the platform at exactly the right moment in its growth.

We have a limited number of platform partnership spots available and wanted to bring this to you personally.

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
      console.log(`[${sent}/${total}] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nDone. ${sent}/${total} sent.`);
}

sendAll().catch(console.error);
