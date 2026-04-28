/**
 * email-cannes-batch6-manual-finds.ts
 *
 * 23 Cannes Lions 2026 speakers/leaders — emails found manually by George.
 * C-suite format: short, direct, value-first, RSVP proposition included.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-cannes-batch6-manual-finds.ts
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
    name:    'Martin Sorrell',
    email:   'martin@s4capital.com',
    subject: 'A private base at Cannes — worth knowing about',
    body: `Hi Martin,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of agency group leaders and brand CMOs are using the space for private sessions and roundtables away from the Palais.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so the right meetings are already in the diary before you arrive.

Given your session on the programme and your work at S4 Capital, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Mark Ritson',
    email:   'mark@minimba.com',
    subject: 'Cannes Lions — a private space and the fringe handled',
    body: `Hi Mark,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of marketing leaders and educators are using the space for private sessions and roundtables during the week.

There are over 2,500 events happening that week. We curate and manage RSVPs to the priority fringe sessions for our residents so you do not have to navigate the programme yourself.

Given your session on the programme and your work at Mini MBA, it felt right to reach out. Happy to share more if of interest.`,
  },
  {
    name:    'Susan Credle',
    email:   's.credle@interpublic.com',
    subject: 'A private base at Cannes and the fringe taken care of',
    body: `Hi Susan,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of network CCOs and agency leaders are using the space for private roundtables and client sessions during the week.

With over 2,500 events on the schedule, we also manage RSVPs to the priority fringe sessions for our residents so the sessions that matter are already confirmed before you arrive.

Given your session on the programme and your leadership at IPG, we thought it worth reaching out. Happy to share details.`,
  },
  {
    name:    'Tiffany Rolfe',
    email:   'tiffany.rolfe@rga.com',
    subject: 'A proper creative base at Cannes this year',
    body: `Hi Tiffany,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, full content capture facilities and a no-pitch policy. A number of agency CCOs and creative leaders are using the space for private sessions and recordings during the week.

There are over 2,500 events that week. We handle RSVPs to the priority fringe sessions for our residents so nothing worth attending gets missed.

Given your work at R/GA and your session on the programme, it felt right to reach out. Happy to send more detail.`,
  },
  {
    name:    'Nick Pringle',
    email:   'nick.pringle@rga.com',
    subject: 'Cannes Lions — a private villa and the week sorted',
    body: `Hi Nick,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of creative and agency leaders are using the space for private roundtables and client sessions.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions for our residents so nothing important gets lost in the noise.

Given your work at R/GA and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'David Sandstrom',
    email:   'david.sandstrom@klarna.com',
    subject: 'A private base at Cannes — and the fringe calendar handled',
    body: `Hi David,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of brand and product leaders are using it as a working base for private client sessions away from the Palais.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so you arrive with the right sessions already locked in.

Given your work at Klarna and your session on the programme, we thought it worth a note. Happy to share more.`,
  },
  {
    name:    'Shilpa Sinha',
    email:   'shilpasinha@google.com',
    subject: 'A private space at Cannes — and the week taken care of',
    body: `Hi Shilpa,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of platform and brand leaders are using the space for private roundtables and sessions during the week.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions on behalf of our residents so the sessions worth attending are already in the diary.

Given your session on the programme and your work at Google, we thought it worth reaching out. Happy to send more detail.`,
  },
  {
    name:    'Kathryn Jacob',
    email:   'kathryn.jacob@crl.com',
    subject: 'Cannes Lions — a private base worth knowing about',
    body: `Hi Kathryn,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of senior industry leaders are using the space for private roundtables and sessions away from the Palais.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so nothing important gets missed.

Given your session on the programme, it felt right to reach out. Happy to share more if of interest.`,
  },
  {
    name:    'Billy Bohan',
    email:   'billy.bohan@virginvoyages.com',
    subject: 'A private setup at Cannes — and the fringe sorted',
    body: `Hi Billy,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of brand and marketing leaders are using the space as a proper working base during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so you are not spending time navigating the programme yourself.

Given your work at Virgin Voyages and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Nik',
    email:   'nik@nativeforeign.tv',
    subject: 'A creative base at Cannes — and the fringe handled',
    body: `Hi Nik,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content capture facilities and a no-pitch policy. A number of creative founders and directors are using the space as a base for private sessions during the week.

With over 2,500 events on the schedule, we also manage RSVPs to the priority fringe sessions for our residents so the right things are already in the diary.

Given your work at Native Foreign and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Patricia McDonald',
    email:   'patricia.mcdonald@dentsu.com',
    subject: 'Cannes Lions — a private base and the fringe taken care of',
    body: `Hi Patricia,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of agency and network leaders are using the space for private roundtables and client sessions away from the Palais.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so the sessions that matter are already confirmed before you arrive.

Given your work at Dentsu and your session on the programme, we thought it worth reaching out. Happy to share details.`,
  },
  {
    name:    'Amiyra Perkins',
    email:   'amiyraperkins@pinterest.com',
    subject: 'A private base at Cannes and the week handled',
    body: `Hi Amiyra,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of platform and brand leaders are using the space for private sessions and roundtables during the week.

With over 2,500 events on the schedule, we also handle priority fringe RSVPs for our residents so nothing worth attending gets missed.

Given your work at Pinterest and your session on the programme, it felt right to reach out. Happy to share more if of interest.`,
  },
  {
    name:    'David Tiltman',
    email:   'david.tiltman@warc.com',
    subject: 'Cannes Lions — a private space and the fringe calendar sorted',
    body: `Hi David,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of industry analysts, editors and brand leaders are using the space as a base for private sessions and roundtable conversations during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents, which given the scale of the programme is no small thing.

Given your work at WARC and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Neo',
    email:   'neo@mcsaatchigroup.co.za',
    subject: 'A private base at Cannes — worth knowing about',
    body: `Hi Neo,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of agency creative leaders are using the space for private roundtables and client sessions away from the Palais.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so you arrive with the right meetings already in place.

Given your work at M&C Saatchi Group and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'David',
    email:   'david@orchardcreative.com',
    subject: 'Cannes Lions — a private creative space and the fringe handled',
    body: `Hi David,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of creative founders and directors are using the space for private sessions and recordings during the week.

With over 2,500 events on the schedule, we also manage RSVPs to the priority fringe sessions for our residents.

Given your work at Orchard Creative and your session on the programme, it felt right to reach out. Happy to share more if of interest.`,
  },
  {
    name:    'Richard',
    email:   'richard@aceofhearts.co',
    subject: 'A private base at Cannes and the fringe sorted',
    body: `Hi Richard,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of agency founders and independent creative leaders are using the space as a working base during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so nothing important falls through the cracks.

Given your work at Ace of Hearts and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Sergio Gordilho',
    email:   'sgordilho@africa.com.br',
    subject: 'A private base at Cannes — and the week taken care of',
    body: `Hi Sergio,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of CCOs and agency leaders are using the space for private sessions and roundtables during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so the right meetings are already in place before you arrive.

Given your work at Africa and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Pita Alberto',
    email:   'pita.alberto@ndb.int',
    subject: 'Cannes Lions — a private space worth knowing about',
    body: `Hi Pita,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of senior leaders from across finance, brand and creative are using the space for private roundtables and sessions during the week.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions for our residents.

Given your session on the programme and your work at NDB, it felt right to reach out. Happy to share more if of interest.`,
  },
  {
    name:    'Sidnei Franca',
    email:   'sidnei_franca@barry-callebaut.com',
    subject: 'A private setup at Cannes and the fringe handled',
    body: `Hi Sidnei,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of brand and marketing leaders are using the space as a working base away from the Palais during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so the sessions worth attending are already confirmed.

Given your work at Barry Callebaut and your session on the programme, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Jiro Murayama',
    email:   'jiro.murayama@dentsu.co.jp',
    subject: 'A private base at Cannes Lions — and the week handled',
    body: `Hi Jiro,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of network and agency leaders are using the space for private sessions and roundtables away from the Palais.

With over 2,500 events on the schedule, we also handle RSVPs to the priority fringe sessions for our residents so you arrive with the right meetings already in place.

Given your work at Dentsu and your session on the programme, it felt right to reach out. Happy to share more if useful.`,
  },
  {
    name:    'Shimazu',
    email:   'shimazu.r-cy@nhk.or.jp',
    subject: 'Cannes Lions — a private space and the fringe sorted',
    body: `Hi Shimazu,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of senior media and broadcasting leaders are using the space for private sessions and roundtables during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so you can focus on what matters rather than navigating the programme.

Given your session on the programme and your work at NHK, it felt right to reach out. Happy to share more.`,
  },
  {
    name:    'Adams',
    email:   'adams@ffive.com',
    subject: 'A private base at Cannes — worth knowing about',
    body: `Hi Adams,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of creative and agency leaders are using the space as a proper working base during the week.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so nothing worth attending gets missed.

Given your session on the programme and your work at Ffive, it felt right to reach out. Happy to share more if of interest.`,
  },
  {
    name:    'Sergio Estreitinho',
    email:   's.estreitinho@lrworld.com',
    subject: 'Cannes Lions — a private space and the fringe handled',
    body: `Hi Sergio,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. A number of industry leaders are using the space for private roundtables and sessions away from the festival floor.

There are over 2,500 events happening that week. We handle RSVPs to the priority fringe sessions for our residents so you arrive knowing exactly where you need to be.

Given your session on the programme and your work at LR World, it felt right to reach out. Happy to share more.`,
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
