/**
 * General IPH outreach — 9 contacts, Cannes Lions 2026
 * Pitch: join Indvstry Power House, villa residency, network, events
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-iph-general-outreach-batch.ts
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

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
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

const contacts: { name: string; email: string; subject: string; body: string }[] = [
  {
    name:    'Denise Stephenson',
    email:   'denise.stephenson@tech-tags.com',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi Denise,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa activation during Lions week, 21 to 26 June, just outside Cannes. It is a curated residency for a small number of senior creative and tech leaders who want more from the week than the standard festival circuit. Private dinners, closed-door conversations, a proper base away from the noise of the Palais, and access to some of the most valuable connections at the festival.

We also run a done-for-you RSVP service for residents — over 2,500 fringe events happen during Lions week and we handle all the registrations so you actually get into the rooms worth being in.

A limited number of residency spots are still available. You can see everything here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Would love to have you as part of this year's programme.`,
  },
  {
    name:    'Kemo',
    email:   'kemo@myomek.com',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi Kemo,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa residency during Lions week, 21 to 26 June. A curated group of senior creative and business leaders, a private base outside the festival, dinners, closed-door conversations, and access to the kind of connections that do not happen in the official spaces.

We also offer a done-for-you RSVP concierge for residents — we handle registrations across the 2,500+ fringe events so you can focus on what matters.

Details and residency link here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Happy to tell you more if it is of interest.`,
  },
  {
    name:    'Lisa Bent',
    email:   'lisa.bent@seenconnects.com',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi Lisa,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa residency during Lions week, 21 to 26 June. The programme brings together a carefully selected group of senior leaders across creativity, culture and media for a week of private dinners, events and genuine conversation, away from the main festival floor.

Given what Seen Connects is building around community and meaningful professional connection, the energy of what we are doing at the Power House feels like a natural fit. This is a room where the right relationships actually form.

We also run a done-for-you RSVP service for residents across the 2,500+ fringe events happening that week.

Everything is here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Would love to have you there.`,
  },
  {
    name:    'Richard Davis',
    email:   'richard.davis@51tocarbonzero.com',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi Richard,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa activation during Lions week, 21 to 26 June. A curated residency for senior leaders across creative industries, sustainability and business who want a proper base and the right conversations during the festival, rather than the standard circuit.

The sustainability and purpose agenda is increasingly central to what Cannes is about — and the conversations that shape it happen in rooms like this. Given the work at 51 to Carbon Zero, I thought this was worth putting in front of you directly.

We also provide a done-for-you RSVP service for residents across the week's 2,500+ fringe events.

Full details and residency here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Happy to tell you more.`,
  },
  {
    name:    'Stanislava Zaharieva',
    email:   'stanislava.zaharieva@informa.com',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi Stanislava,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa residency during Lions week, 21 to 26 June. A curated programme for a small group of senior creative and media leaders, with private dinners, events and closed-door conversations running throughout the week alongside the festival.

Informa's reach across events, media and knowledge makes it one of the most connected organisations in the industry. Given that, I wanted to make sure this landed with the right person ahead of Cannes.

We also run a done-for-you RSVP concierge for residents across the 2,500+ fringe events happening that week — a genuinely useful service for anyone with a full schedule.

All the details are here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Would love to have you involved.`,
  },
  {
    name:    'Jordan',
    email:   'jordan@howlett.io',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jordan,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa residency during Lions week, 21 to 26 June. A curated group of senior creative and agency leaders, a proper base outside the festival, private dinners and the kind of conversations that do not happen in the official spaces at Cannes.

For a studio like Howlett doing sharp creative and digital work, this is exactly the kind of room where the right client and collaborator relationships form. No pitching, no panels — just the right people.

We also handle done-for-you RSVPs for residents across the week's 2,500+ fringe events.

Everything is here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Happy to tell you more if Cannes is on the agenda.`,
  },
  {
    name:    'James Witter',
    email:   'james.witter@pzcussons.com',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi James,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa residency during Lions week, 21 to 26 June. A curated group of senior brand and marketing leaders, private dinners, a proper base outside the Palais, and closed-door conversations with some of the most influential people at the festival.

PZ Cussons builds brands that touch millions of people's daily lives — and Cannes is where the conversations happen that shape how those brands grow over the next decade. We want the right brand-side voices in the room, and this felt like exactly the kind of initiative worth putting in front of you.

We also provide a done-for-you RSVP service for residents across the 2,500+ fringe events happening that week.

Full details here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Would love to have you as part of this year's programme.`,
  },
  {
    name:    'Chris',
    email:   'chris@locksmith.works',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi Chris,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa residency during Lions week, 21 to 26 June. A curated group of senior creative and agency leaders, a proper base outside the festival, private dinners and the kind of conversations that shape what the next year of work looks like.

For a creative studio doing the kind of work Locksmith does, this is the room where the right relationships form — without the noise and formality of the main Cannes circuit.

We also run a done-for-you RSVP concierge for residents across the week's 2,500+ fringe events.

Everything is here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Happy to tell you more if Cannes is on your radar this year.`,
  },
  {
    name:    'V. Fox',
    email:   'vfox@aargroup.co.uk',
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body: `Hi,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House — a private villa residency during Lions week, 21 to 26 June. A curated group of senior creative, marketing and agency leaders in a private space just outside Cannes, with private dinners, events and closed-door conversations running throughout the week.

AAR sits at the heart of how brands and agencies find and build their best relationships. That is exactly the kind of value exchange this room is built around — except without the formal process. The right people, in the right space, with the right amount of time.

We also handle done-for-you RSVPs across the 2,500+ fringe events happening during Lions week for everyone in the programme.

Full details here:

Powerhouse.indvstryclvb.com
Residency: https://lu.ma/t4ek2yn7

Would love to have you there.`,
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
        from:         { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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
      console.log(`[${sent}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < contacts.length) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\nDone. ${sent}/${contacts.length} emails sent.`);
}

sendAll().catch(console.error);
