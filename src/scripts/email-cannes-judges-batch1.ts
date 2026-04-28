/**
 * email-cannes-judges-batch1.ts
 *
 * Personalised outreach to Cannes Lions 2026 judges and programme speakers.
 * Segmented by role type:
 *   - Jury Presidents     → Diaspora Dinner + Villa base + RSVP concierge
 *   - Agency CCOs/CEOs    → Villa as content studio / client roundtable + Dinner + RSVP
 *   - Media / Data / Tech → Villa as neutral briefing space + RSVP
 *   - Founders / Creators → Speaker Residency + Dinner + RSVP
 *
 * ⚠️  Recipients marked [DOMAIN UNCERTAIN] have emails whose domain does not
 *     match their listed company. Review before sending.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-cannes-judges-batch1.ts
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

function wrap(body: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${body.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body>
</html>`;
}

interface Recipient {
  name:    string;
  email:   string;
  subject: string;
  body:    string;
}

// ─── TIER 1: JURY PRESIDENTS ──────────────────────────────────────────────────
// These people are on official jury duty all week. They need a quiet space,
// not another pitch meeting. Lead with the villa as a retreat and the dinner
// as a rare chance to be off-duty with the right people.

const recipients: Recipient[] = [
  {
    name:    'Andrés',
    email:   'andresordonez@mccann.com',
    subject: 'A quiet room for jury week at Cannes',
    body: `Hi Andrés,

Congratulations on being named Jury President at Cannes Lions this year.

We are running Indvstry Power House during festival week — a private villa with daily shuttles to La Croisette, AV and content facilities, and a strict no-pitch policy. A number of this year's speakers and jury members are using it as a base to decompress between sessions and host small private meetings away from the Palais.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — roughly 30 guests, entirely off-schedule, with senior creatives and founders who do not often get a room together. Given your programme role and your track record at McCann, you would be exactly the right person there.

One more thing — there are over 2,500 fringe events happening that week and most people miss the ones that matter. We are running a concierge RSVP service for our guests and can handle your registrations so you do not have to.

Happy to share more on any of the above.`,
  },
  {
    name:    'Anupriya',
    email:   'anupriya.acharya@publicismedia.com',
    subject: 'Something worth your time at Cannes — beyond the Palais',
    body: `Hi Anupriya,

Congratulations on your Jury President role at this year's Cannes Lions.

We are running Indvstry Power House during festival week — a private villa with daily shuttles to La Croisette, dedicated content facilities, and a no-pitch policy. Several of this year's jury members and programme speakers are using it as a proper base: quiet, private, and away from the noise of the Croisette.

We are also hosting a private Diaspora Dinner on the evening of Tuesday 23rd June — a small group of senior leaders in a setting that feels nothing like the festival. Given your work across South Asia and your presence on the programme this year, we think you would be exactly the right fit.

We are also offering a fringe event concierge — with 2,500+ events happening that week, we register you for the ones that matter so you do not have to spend time tracking them down.

Worth a quick call if any of this is useful?`,
  },
  {
    name:    'Jessica',
    email:   'jessica.apellaniz@wk.com',
    subject: 'A private base during your jury week',
    body: `Hi Jessica,

Jury President at Cannes Lions — that is a week that will move fast.

We are running Indvstry Power House during festival week: a private villa with daily shuttles to La Croisette, content facilities, and a genuinely no-pitch policy. A quiet room you can rely on when you need to step away from the Palais.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — 30 guests, off-schedule, at the villa. The kind of conversation that does not happen at official events.

And because there are over 2,500 fringe events happening that week, we are offering a concierge RSVP service — we handle the registrations so you show up, not spend your evenings on signup forms.

Happy to share more on any of these.`,
  },
  {
    name:    'Dana',
    email:   'dana.tahir@redhavasme.com',
    subject: 'A dinner you will not find on the official schedule',
    body: `Hi Dana,

We are hosting a private Diaspora Dinner on Tuesday 23rd June during Cannes Lions week — 30 guests, entirely off-schedule, at our villa away from the Croisette.

Given your jury presidency this year and your work at Havas Red, you are exactly the kind of voice we want in that room. It is a small, intentional gathering — no agenda, no pitches, just the right people.

We are also running Indvstry Power House throughout the week as a private base for speakers and jury members who need a proper space: daily shuttles, AV facilities, no-pitch zone.

One thing worth knowing — with 2,500+ fringe events on that week, we are running a concierge RSVP service for our guests. We handle registrations so you do not have to.

Happy to share details on any of the above.`,
  },
  {
    name:    'Tracey',
    email:   'tracey.brader@ddbremedy.co.uk',
    subject: 'A private space at Cannes that works around your schedule',
    body: `Hi Tracey,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content and AV facilities, and a no-pitch policy. It is a proper base for people who want quiet time, a client session away from the Palais, or a space to record something without the background noise of the Croisette.

Given your jury presidency this year and your work at the intersection of strategy and health, the space could be genuinely useful — whether for a focused briefing or simply somewhere to decompress between sessions.

We are also hosting a private Diaspora Dinner on 23rd June for a select group of senior leaders, and running a fringe event RSVP concierge — 2,500+ events happen that week and we handle the registrations so you do not miss the ones worth attending.

Worth five minutes if any of this is relevant?`,
  },

  // ─── TIER 2: AGENCY CCOs ──────────────────────────────────────────────────
  // Lead with villa as a content studio / neutral client space. Diaspora Dinner
  // and RSVP concierge as supporting offers.

  {
    name:    'Krystle',
    email:   'krystle.mullin@johnst.com',
    subject: 'A private content studio at Cannes — worth knowing about',
    body: `Hi Krystle,

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated AV and content capture facilities, daily shuttles to La Croisette, and a strict no-pitch policy.

For agency creative leaders on the programme, we are positioning the space as a private studio: somewhere to record a session, host a small client roundtable, or simply have a proper conversation away from the Palais. Given your role at John St. and your session this year, it felt worth reaching out.

We are also hosting a private Diaspora Dinner on 23rd June — 30 guests, off the official schedule, at the villa.

And as a side note — with over 2,500 fringe events happening that week, we are running a concierge RSVP service for guests so you do not have to spend time on signup forms. Happy to add you.

Worth a quick word?`,
  },
  {
    name:    'Liana',
    email:   'liana.liebenberg@designbridge.com',
    subject: 'A private base for Design Bridge at Cannes',
    body: `Hi Liana,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content facilities, daily shuttles, and a no-pitch policy. A number of creative agencies are using the space for small client sessions and off-schedule recordings away from the noise of the Palais.

Given your work at Design Bridge and Partners and your presence on this year's programme, the space feels like a natural fit — whether for a client briefing, a session capture, or just a proper room to think.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June with a curated group of creative leaders.

One thing worth mentioning — we are running a fringe event RSVP concierge for guests. There are over 2,500 events that week and we handle the registrations so the right ones do not slip through.

Happy to share more.`,
  },
  {
    name:    'Craig',
    email:   'craig.elimeliah@codeandtheory.com',
    subject: 'A space where code and creativity meet at Cannes',
    body: `Hi Craig,

We are running Indvstry Power House during Cannes Lions week — a private villa with content and AV facilities, daily shuttles to La Croisette, and a no-pitch policy. Several digital and technology-led agencies are using the space for client briefings and off-schedule sessions away from the Palais.

Given Code and Theory's positioning and your session on this year's programme, the space could work well — either as a neutral venue for a client conversation or a studio for something you are producing that week.

We are also hosting a private Diaspora Dinner on 23rd June for a small group of senior creative leaders.

Worth noting: we are running a fringe event RSVP concierge for guests — 2,500+ events happen that week and we manage the registrations so you show up to the ones that matter.

Happy to share more if useful.`,
  },
  {
    name:    'Kika',
    email:   'kika.castroviejo@le.pub',
    subject: 'A space for LePub at Cannes — worth five minutes',
    body: `Hi Kika,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content facilities, daily shuttles to La Croisette, and a strict no-pitch policy.

Given LePub's work and your session on the programme, the space feels particularly relevant — whether as a studio for a client recording, a venue for a small private roundtable, or simply a proper base away from the Croisette. We have had a number of agency CCOs use it exactly that way.

We are also hosting a private Diaspora Dinner on the evening of Tuesday 23rd June — 30 guests, off the official schedule.

And with 2,500+ fringe events happening that week, we are running a concierge RSVP service for our guests so the right ones are locked in without the admin.

Happy to share more.`,
  },
  {
    name:    'Hadleigh',
    email:   'hadleigh.sinclair@colensobbdo.co.nz',
    subject: 'A private room at Cannes — and a dinner worth attending',
    body: `Hi Hadleigh,

We are running Indvstry Power House during Cannes Lions week — a private villa with content facilities, daily shuttles to La Croisette, and a no-pitch policy. Coming from New Zealand, having a proper base during the week rather than hunting for meeting rooms makes a real difference.

Given your work at Colenso BBDO and your presence on this year's programme, we thought it worth reaching out. The space works well for small client sessions, recordings, or simply a room where you can have a real conversation.

We are also hosting a private Diaspora Dinner on 23rd June — an intentionally small gathering of senior creative leaders.

We are also running a fringe event concierge for guests — over 2,500 events happen that week and we handle the RSVPs so you do not have to.

Worth a quick word?`,
  },
  {
    name:    'Fabrice',
    email:   'fabrice.plazolles@havasplay.com',
    subject: 'A private production base at Cannes',
    body: `Hi Fabrice,

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated AV and content capture facilities, daily shuttles to La Croisette, and a no-pitch policy.

For someone running Havas Play, the space feels particularly relevant: a proper studio environment away from the festival noise where you can record, produce or host a private session without the Croisette in the background.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June for a small group of senior creative and media leaders.

One useful extra: we are running a fringe event RSVP concierge for our guests. With 2,500+ events on that week, we manage the registrations so you are confirmed for the ones that actually matter.

Happy to share more if useful.`,
  },

  // ─── TIER 3: MEDIA / DATA / TECH ─────────────────────────────────────────
  // Lead with the villa as neutral, no-pitch territory for client briefings
  // and private sessions. RSVP concierge is strong for this audience.

  {
    name:    'Anna',
    email:   'anna.nicanorova@annalect.com',
    subject: 'A neutral space for client conversations at Cannes',
    body: `Hi Anna,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV facilities, and a strict no-pitch policy.

For leaders in data and technology, having a genuinely neutral space — away from the branded beach clubs and the noise of the Palais — makes a real difference when you are trying to have honest client conversations. Given your work at Annalect and your session on this year's programme, the space could be genuinely useful.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June for a small, senior group.

Worth knowing: we are running a fringe event RSVP concierge for guests — 2,500+ events are happening that week and we handle the registrations so you do not miss the ones that matter.

Happy to share more.`,
  },
  {
    name:    'Anisha',
    email:   'anisha.iyer@omd.com',
    subject: 'A private base for OMD at Cannes',
    body: `Hi Anisha,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities, and a no-pitch policy. Several media agency leaders are using the space for client briefings and private sessions away from the Palais.

Given your role leading OMD India and your presence on this year's programme, it felt worth reaching out. The villa works well as a neutral venue for client conversations — no branded environment, no agenda beyond the meeting itself.

We are also hosting a private Diaspora Dinner on 23rd June — a small, curated gathering of senior leaders from across the industry.

We are running a fringe event concierge for guests as well — with over 2,500 events that week, we manage the RSVPs so the key ones are confirmed without the admin.

Worth a quick conversation?`,
  },
  {
    name:    'Dashni',
    email:   'dashni.vilakazi@mediashop.co.za',
    subject: 'A private dinner at Cannes — 23rd June',
    body: `Hi Dashni,

We are hosting a private Diaspora Dinner on Tuesday 23rd June during Cannes Lions week — 30 guests, at our villa away from the Croisette, entirely off the official schedule.

Given your work at The MediaShop and your presence on this year's programme, we think you would be exactly the right person in that room. It is an intentionally small gathering — senior media and creative leaders who do not often get a table together.

We are also running Indvstry Power House as a private base throughout the week — daily shuttles, content facilities, no-pitch zone — if that is useful separately.

And for the week itself: we are running a fringe event RSVP concierge for our guests. With 2,500+ events happening, we handle registrations so you do not miss the ones worth attending.

Happy to share more on any of the above.`,
  },

  // ─── TIER 4: FOUNDERS / INDEPENDENTS ─────────────────────────────────────
  // Lead with the Residency — live in the villa for the week.
  // These contacts benefit most from having a home base.

  {
    name:    'Juliet',
    email:   'juliet@beyondlimits.global',
    subject: 'A home base at Cannes — if you want one',
    body: `Hi Juliet,

We are running Indvstry Power House during Cannes Lions week — a private villa just outside Cannes with daily shuttles to La Croisette, content facilities, and a no-pitch policy.

For founders and independent leaders on the programme, we are offering a small number of speaker residency spots: essentially live in the villa for the week, use it as a workspace and hospitality base, and have a proper home between your sessions rather than paying Cannes hotel rates for a room you rarely see.

Given your work at Beyond Limits Global and your session on this year's programme, it felt like exactly the right fit.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — a small group of senior leaders, off the official schedule.

One more thing: we are running a fringe event RSVP concierge for residents. There are over 2,500 events happening that week — we manage the registrations so you show up to the ones that matter without the admin.

Happy to share more on residency or the dinner.`,
  },
  {
    name:    'Sabaa',
    email:   'sabaa.quao@pluscompany.com',
    subject: 'A base for founders at Cannes — residency and a dinner',
    body: `Hi Sabaa,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities, and a no-pitch policy.

For founders on this year's programme, we are offering a small number of speaker residency spots: live at the villa for the week, use it as your workspace and private base between sessions, and skip the noise of Cannes accommodation entirely.

Given your work at Plusco Venture Studio and your presence on the programme, we think you would be exactly the right fit — both as a resident and in the room we are trying to build.

We are also hosting a private Diaspora Dinner on 23rd June — 30 guests, off the official schedule, senior founders and creative leaders.

Worth knowing: we are running a fringe event RSVP concierge for residents. Over 2,500 events happen that week and we handle your registrations so you do not have to.

Happy to share more.`,
  },

  // ─── TIER 5: UNCERTAIN DOMAIN — REVIEW BEFORE SENDING ────────────────────
  // Emails below do not match the company listed for each contact in the
  // Cannes programme. Verify before running the script.

  {
    // Lauren Kimball — Edelman EVP Experience Design. Domain is uwmidlands.org
    // (United Way Midlands) — possible board/volunteer role. Verify.
    name:    'Lauren',
    email:   'lkimball@uwmidlands.org',
    subject: 'A private space at Cannes — worth knowing about',
    body: `Hi Lauren,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content facilities, daily shuttles to La Croisette, and a no-pitch policy.

For experience design leaders on the programme, the space works particularly well for client sessions and immersive demonstrations away from the Palais — a proper room with full AV rather than a branded tent on the beach.

We are also hosting a private Diaspora Dinner on 23rd June — 30 guests, senior creative and brand leaders, entirely off-schedule.

And a useful extra: we are running a fringe event RSVP concierge for guests — with 2,500+ events that week, we handle the registrations so the right ones are locked in.

Happy to share more.`,
  },
  {
    // Sindhuja Rai — WPP Media Chief Client Officer. Domain is mpowergrowth.com.
    // Likely a personal brand or side venture. Verify before sending.
    name:    'Sindhuja',
    email:   'sindhuja@mpowergrowth.com',
    subject: 'Something worth your time at Cannes',
    body: `Hi Sindhuja,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities, and a strict no-pitch policy. A number of senior media and client services leaders are using the space as a base for private client briefings and off-schedule conversations.

Given your work and your presence on this year's programme, the space feels genuinely relevant.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — a small, curated group of senior industry leaders.

Worth noting: we are running a fringe event RSVP concierge for guests. Over 2,500 events happen that week — we handle the registrations so the right ones are confirmed.

Happy to share more if useful.`,
  },
  {
    // Amanda Morrissey — Global President, iProspect / Dentsu. Domain is amexgbt.com
    // (American Express Global Business Travel). This may be a previous role email
    // or an error. Verify before sending.
    name:    'Amanda',
    email:   'amanda.morrissey@amexgbt.com',
    subject: 'A private base at Cannes for client conversations',
    body: `Hi Amanda,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV facilities, and a no-pitch policy. Several media and growth leaders on the programme are using the space as a neutral venue for client briefings and private sessions.

Given your presence on this year's Cannes programme, the space feels like it could be genuinely useful — particularly as a no-branded, no-agenda environment for the conversations that matter.

We are also hosting a private Diaspora Dinner on 23rd June — 30 guests, senior leaders, entirely off the official schedule.

One more thing: we are running a fringe event RSVP concierge for guests — over 2,500 events that week and we manage the registrations so you do not miss the ones worth attending.

Happy to share more.`,
  },
  {
    // Azhar Siddiqui — MediaPlus Middle East CEO. Domain is researchers.me —
    // appears to be a personal/professional domain. Verify before sending.
    name:    'Azhar',
    email:   'azhar@researchers.me',
    subject: 'A private space at Cannes — and a dinner worth attending',
    body: `Hi Azhar,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities, and a no-pitch policy. Several media leaders and agency CEOs from the MENA region are using the space as a proper base during the festival.

Given your work at MediaPlus Middle East and your presence on this year's programme, we thought it worth reaching out. The villa works well for client briefings and private sessions — neutral ground away from the beach clubs.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — a small, senior group entirely off the official schedule.

Worth knowing: we are running a fringe event RSVP concierge for guests. With 2,500+ events happening that week, we handle the registrations for the ones worth attending.

Happy to share more.`,
  },
  {
    // Matt Murphy — 72andSunny Global CCO. Domain is glossgenius.com
    // (salon software company) — likely an error or outdated address. Verify before sending.
    name:    'Matt',
    email:   'm.murphy@glossgenius.com',
    subject: 'A private space for 72andSunny at Cannes',
    body: `Hi Matt,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content facilities, daily shuttles to La Croisette, and a strict no-pitch policy. A number of independent agency creative leaders on the programme are using it as a base for client sessions and off-schedule recordings.

Given 72andSunny's work and your session this year, the space feels like a natural fit — whether for a client session, a podcast recording or simply somewhere to have a real conversation away from the Palais.

We are also hosting a private Diaspora Dinner on 23rd June for a small group of senior creatives.

And a useful extra: we are running a fringe event RSVP concierge for guests — 2,500+ events happen that week and we handle the registrations so you do not miss the ones that matter.

Happy to share more.`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  console.log(`\nIndvstry Power House — Cannes Judges Outreach Batch 1`);
  console.log(`Sending to ${recipients.length} contacts\n`);

  for (const r of recipients) {
    try {
      const message: any = {
        subject: r.subject,
        body: { contentType: 'HTML', content: wrap(r.body) },
        toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
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
      console.log(`[${sent}/${recipients.length}] Sent  ${r.name} <${r.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < recipients.length) await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent}/${recipients.length} emails sent.`);
}

sendAll().catch(console.error);
