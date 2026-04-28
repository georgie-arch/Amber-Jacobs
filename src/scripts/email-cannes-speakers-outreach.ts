/**
 * email-cannes-speakers-outreach.ts
 *
 * Personalised outreach to 12 Cannes Lions 2026 official programme speakers.
 * Three angles: Diaspora Dinner invite, Villa Partnership, Speaker Residency.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-cannes-speakers-outreach.ts
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
    name:    'Gugu Mthembu',
    email:   'mgugu@telkom.com',
    subject: 'A dinner you will not find on the official schedule',
    body: `Hi Gugu,

I saw you are speaking at Cannes Lions this year and wanted to reach out with something specific.

We are hosting a private Diaspora Dinner on Tuesday 23rd June — 30 guests, away from the Croisette, at our villa. It is an intentionally small gathering of senior creatives and executives who do not often get a room together. Given your work at Telkom and your voice in the industry, we think you would be exactly the right fit.

No agenda, no pitches. Just the right people in the right room.

If that sounds like your kind of evening, I would love to send you the details.`,
  },
  {
    name:    'Rafael Pitanguy',
    email:   'rafael.pitanguy@vml.com',
    subject: 'A quiet space at Cannes — no pitches, no crowds',
    body: `Hi Rafael,

We are running a private villa activation during Cannes Lions week — Indvstry Power House. We have dedicated shuttles to La Croisette, high-end AV and content capture, and the kind of quiet that is almost impossible to find that week.

A number of agencies are using the space as a neutral ground for client roundtables and small briefings away from the noise of the Palais. If VML needs a space for a 1:1 client session or a podcast recording during the week, it is at your disposal.

Happy to send more detail if it is useful.`,
  },
  {
    name:    'Bertille Toledano',
    email:   'bertille.toledano@betc.com',
    subject: 'A private space at Cannes for your team',
    body: `Hi Bertille,

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated shuttles to La Croisette, content capture facilities, and a no-pitch environment.

We have made the space available to a small number of agency leaders for private client roundtables, team dinners or recordings away from the Croisette chaos. Given the Havas presence at Lions this year, it felt worth reaching out.

Let me know if you would like to know more.`,
  },
  {
    name:    'Sarah Lemarie',
    email:   'sarah.lemarie@publicisgroupe.com',
    subject: 'Private space at Cannes for strategy conversations',
    body: `Hi Sarah,

We are running a private villa activation at Cannes Lions — Indvstry Power House. We have made the space available to a handful of senior strategists and agency leaders for small client roundtables and off-record conversations away from the festival floor.

As Chief Strategy Officer at Publicis France, it felt like a natural fit to reach out. If you need a quiet, high-quality space for a client briefing or a closed session during the week, we can accommodate that.

Happy to share more details if it is of interest.`,
  },
  {
    name:    'Jenni Middleton',
    email:   'jenni.middleton@warc.com',
    subject: 'Something off-schedule at Cannes',
    body: `Hi Jenni,

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated transport to the Palais, content capture facilities and a no-pitch policy.

Given what you cover at WARC, we thought there could be an interesting angle for you — whether that is using the space for a recorded conversation, hosting a small editorial roundtable, or simply having a proper base away from the festival floor.

We are also hosting a private dinner on the 23rd June with a small group of senior industry figures if that is of interest.

Worth a conversation?`,
  },
  {
    name:    'Paul Kemp-Robertson',
    email:   'paul.kemp-robertson@warc.com',
    subject: 'Cannes — a base with content facilities and no noise',
    body: `Hi Paul,

We are running Indvstry Power House at Cannes Lions this year — a private villa with AV and content capture, daily shuttles to La Croisette, and a deliberately no-pitch atmosphere.

Given the content and editorial work you do at WARC, the space could work well for you — whether for a recorded session, a small roundtable or just a proper place to decompress between sessions.

We are hosting a private dinner on 23rd June too, with a tight guest list of senior creatives and executives if that is of interest.`,
  },
  {
    name:    'David Tiltman',
    email:   'david.tiltman@warc.com',
    subject: 'A private dinner at Cannes — 23rd June',
    body: `Hi David,

We are hosting a private Diaspora Dinner on Tuesday 23rd June during Cannes Lions week — small group, away from the Croisette, at our villa. Given your role covering LIONS Intelligence at WARC, you are exactly the kind of person we want in the room.

We are also running Indvstry Power House as a private base throughout the week — daily shuttles to the Palais, content facilities, and quiet space if you need it between sessions.

Let me know if either is of interest.`,
  },
  {
    name:    'Shuji Utsumi',
    email:   'shuji.utsumi@sega.com',
    subject: 'A private dinner at Cannes — worth your time',
    body: `Hi Shuji,

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated shuttles to La Croisette and a no-pitch policy. We are also hosting a small private dinner on 23rd June with a select group of senior executives and creatives.

Given your appearance on the programme this year, we thought it worth reaching out. If you are looking for a genuine break from the official schedule with the right people around the table, this is it.`,
  },
  {
    name:    'Takashi Iizuka',
    email:   'takashi.iizuka@sega.com',
    subject: 'A private villa and dinner at Cannes Lions',
    body: `Hi Takashi,

We are running Indvstry Power House during Cannes Lions week — a private villa base with daily shuttles to the festival. We are hosting a private dinner on Tuesday 23rd June with a small group of senior creatives and executives.

Spotted you on the programme this year and wanted to extend the invitation. If either the dinner or the villa space is of interest, I am happy to share more.`,
  },
  {
    name:    'Ulrike Decoene',
    email:   'ulrike.decoene@axa.com',
    subject: 'Private space and a dinner at Cannes — for your consideration',
    body: `Hi Ulrike,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content facilities, daily shuttles to La Croisette, and space for small private client sessions away from the Palais.

We are also hosting a private dinner on 23rd June with a tight guest list of senior brand and agency leaders. Given your role at AXA, it felt right to reach out about both.

Happy to share more detail.`,
  },
  {
    name:    'Paul Dolan',
    email:   'dolanp@lse.ac.uk',
    subject: 'A private base at Cannes Lions — for speakers',
    body: `Hi Paul,

We have set up a speaker residency at Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to the Palais, a proper workspace, and a no-pitch policy. It is a place for speakers to decompress, take meetings and have a proper base without the noise of the Croisette.

We spotted you on the programme and wanted to offer access. We are also hosting a small private dinner on 23rd June if that is of interest alongside it.`,
  },
  {
    name:    'Tetsuya Honda',
    email:   'honda@hondaoffice.co.jp',
    subject: 'A private base at Cannes for speakers',
    body: `Hi Tetsuya,

We are running a speaker residency at Indvstry Power House during Cannes Lions week — a private villa with shuttles to La Croisette, workspace and a quiet space between sessions. It is a proper base without the chaos of the official schedule.

We also have a private dinner on 23rd June with a small group of senior creatives and founders. Given your background in PR and cultural strategy, the guest list would be right up your street.

Worth a conversation?`,
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
