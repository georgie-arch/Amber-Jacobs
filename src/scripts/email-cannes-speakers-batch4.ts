/**
 * email-cannes-speakers-batch4.ts
 *
 * Outreach to 14 Cannes Lions 2026 speakers found via waterfall lookup.
 * C-suite format: short, direct, value-first. Includes RSVP proposition.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-cannes-speakers-batch4.ts
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
  name: string;
  email: string;
  subject: string;
  body: string;
}

const recipients: Recipient[] = [
  {
    name:    'Marc Pritchard',
    email:   'marc.pritchard@pg.com',
    subject: 'A private base at Cannes — and one less thing to manage',
    body: `Hi Marc,

We are running Indvstry Power House during Cannes Lions week — a private 7-bedroom villa with daily shuttles to La Croisette, dedicated content facilities and a strict no-pitch policy. A number of CMOs and senior brand leaders are using it as a proper working base away from the noise of the Palais.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions on behalf of our residents, so you arrive knowing exactly where you need to be without spending hours working through the schedule.

Given your session on the programme and what you have built at P&G, the villa would be a natural fit. Happy to share more if useful.`,
  },
  {
    name:    'Nicola Mendelsohn',
    email:   'nicolamendelsohn@meta.com',
    subject: 'Cannes Lions — a private space worth knowing about',
    body: `Hi Nicola,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. Several platform and agency leaders are using the space for private roundtables and client sessions away from the festival floor.

With over 2,500 events on the schedule that week, we also handle priority fringe RSVPs for our residents so nothing important gets missed.

Given your programme session and your leadership at Meta, it felt right to reach out. Happy to share details if of interest.`,
  },
  {
    name:    'Zena Arnold',
    email:   'zena.arnold@sephora.com',
    subject: 'A quieter base at Cannes — and the fringe events handled',
    body: `Hi Zena,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of CMOs and brand leaders are using it as a proper working base between sessions.

There are over 2,500 events happening that week. We curate and manage RSVPs to the priority fringe sessions for our residents, so you do not have to navigate the schedule yourself.

Given your role at Sephora and your session on the programme, we thought it worth reaching out. Happy to send more detail.`,
  },
  {
    name:    'Joon Silverstein',
    email:   'jsilverstein@tapestry.com',
    subject: 'Cannes Lions — a private base worth having',
    body: `Hi Joon,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. Several CMOs and brand leaders are using the space for private sessions and roundtables away from the Palais.

With over 2,500 events on the schedule that week, we also handle RSVPs to the priority fringe sessions on behalf of our residents, so you can focus on what matters rather than navigating the programme.

Given your session and your work at Tapestry, we thought it was worth a note. Happy to share more.`,
  },
  {
    name:    'Thomas Ranese',
    email:   'thomas_ranese@intuit.com',
    subject: 'A private setup at Cannes — and the fringe calendar taken care of',
    body: `Hi Thomas,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a strict no-pitch policy. A number of senior marketing leaders are using the space for private client sessions and roundtables away from the festival noise.

There are over 2,500 events happening that week. We manage RSVPs to the priority fringe sessions for our residents so the important meetings do not fall through the cracks.

Given your programme session and your work at Intuit, it felt right to reach out. Happy to share details if useful.`,
  },
  {
    name:    'Jessica Apellaniz',
    email:   'jessica.apellaniz@wk.com',
    subject: 'A proper base at Cannes — away from the Palais',
    body: `Hi Jessica,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, full content facilities and a no-pitch policy. A number of agency leaders and creative directors are using it as a base for private sessions and recordings during the week.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions for our residents so nothing worth attending gets missed.

Given your work at Wieden+Kennedy and your session on the programme, this felt worth a note. Happy to send more detail if of interest.`,
  },
  {
    name:    'Mia Rafowitz',
    email:   'mia.rafowitz@droga5.com',
    subject: 'Cannes Lions — a private villa and the fringe handled',
    body: `Hi Mia,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content capture facilities and a no-pitch policy. A number of senior creatives and agency leaders are using the space for private roundtables and client sessions.

There are over 2,500 events that week. We curate and manage the priority fringe RSVPs for our residents, so you arrive with the right sessions already locked in.

Given your session on the programme and your work at Droga5, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Kainaz Karmakar',
    email:   'kainaz.karmakar@ogilvy.com',
    subject: 'A different kind of base at Cannes this year',
    body: `Hi Kainaz,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of senior creatives and CCOs are using the space for private sessions and roundtables away from the Palais.

With over 2,500 events on the schedule, we also manage priority fringe RSVPs for our residents so the sessions that matter are already confirmed before you arrive.

Given your work at Ogilvy and your session on the programme, we thought it worth reaching out. Happy to send more detail.`,
  },
  {
    name:    'Takeshi Sano',
    email:   'takeshi.sano@dentsu.com',
    subject: 'A private base at Cannes Lions — and the week handled',
    body: `Hi Takeshi,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. Several agency and network leaders are using the space for private client sessions and roundtables during the week.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions for our residents, so you are not spending time navigating the programme yourself.

Given your session and your leadership at Dentsu, it felt right to reach out. Happy to share more if useful.`,
  },
  {
    name:    'Ty Heath',
    email:   'theath@linkedin.com',
    subject: 'A private space at Cannes — and the fringe calendar sorted',
    body: `Hi Ty,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of B2B and platform marketing leaders are using the space for private roundtables and sessions during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions on behalf of our residents so the important conversations are already in the diary.

Given your session on the programme and your work at LinkedIn, we thought it worth a note. Happy to share more if of interest.`,
  },
  {
    name:    'Becky Owen',
    email:   'bowen@billiondollarboy.com',
    subject: 'Cannes Lions — a proper base and the fringe taken care of',
    body: `Hi Becky,

We are running Indvstry Power House during Cannes Lions week — a private villa with content capture facilities, daily shuttles to La Croisette and a no-pitch policy. A number of founders and agency leaders are using it as a working base during the week.

With over 2,500 events on the schedule, we also handle priority fringe RSVPs for our residents so nothing important gets lost in the noise.

Given what you have built at Billion Dollar Boy and your session on the programme, the villa felt like a natural fit. Happy to send more detail.`,
  },
  {
    name:    'Brian Cox',
    email:   'brian.cox@manchester.ac.uk',
    subject: 'Something different at Cannes this year',
    body: `Hi Brian,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. The space brings together a cross-disciplinary group of speakers, founders and creatives for private sessions during the week.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions for our residents so you arrive knowing where you need to be.

Given your session on the programme, we thought it worth reaching out. Happy to share more if of interest.`,
  },
  {
    name:    'Meryl Blau',
    email:   'mblau@miami.edu',
    subject: 'A private space at Cannes — speakers and founders in the room',
    body: `Hi Meryl,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. The house brings together a cross-disciplinary group of speakers, educators and industry leaders for private sessions during the week.

There are over 2,500 events happening that week. We handle priority fringe RSVPs for our residents so the sessions worth attending are already locked in before you arrive.

Given your session on the programme and your work at the University of Miami, it felt right to reach out. Happy to send more detail.`,
  },
  {
    name:    'Rafael Gil',
    email:   'rafael.gil@artplan.com.br',
    subject: 'A private base at Cannes and the fringe calendar handled',
    body: `Hi Rafael,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of agency leaders and creative directors from across global markets are using it as a base for private sessions during the week.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions for our residents so nothing important falls through the cracks.

Given your session on the programme and your work at Artplan, we thought it worth reaching out. Happy to share more if useful.`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

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
      console.log(`[${sent}/${recipients.length}] Sent to ${r.name} <${r.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < recipients.length) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\nDone. ${sent}/${recipients.length} emails sent.`);
}

sendAll().catch(console.error);
