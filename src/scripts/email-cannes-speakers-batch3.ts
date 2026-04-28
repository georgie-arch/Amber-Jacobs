/**
 * email-cannes-speakers-batch3.ts
 *
 * Outreach to 5 Cannes Lions 2026 speakers found via waterfall lookup.
 * Monique Nelson, Sergio Garcia, Kerman Romeo, Polly McMorrow, Jon Evans.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-cannes-speakers-batch3.ts
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
    name:    'Monique Nelson',
    email:   'monique.nelson@uwgny.com',
    subject: 'A dinner you will not find on the official schedule',
    body: `Hi Monique,

We are hosting a private Diaspora Dinner on Tuesday 23rd June during Cannes Lions week — 30 guests, private villa, away from the Croisette. No agenda, no pitches. Just the right people finally in the same room.

Given your leadership at UniWorld Group and your standing in the industry, you are exactly who we want at this table. We think you would find the room very familiar.

Let me know if you are in and I will send you everything you need.`,
  },
  {
    name:    'Sergio Garcia',
    email:   'sergio.garcia@ps21.es',
    subject: 'A private space at Cannes — worth five minutes of your time',
    body: `Hi Sergio,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of strategy and agency leaders are using the space for private roundtables and client sessions away from the Palais.

Given your work at PS21 and your session on the programme, it felt right to reach out. We are also hosting a private dinner on 23rd June with a select group of senior creatives.

Happy to share more if useful.`,
  },
  {
    name:    'Kerman Romeo',
    email:   'kerman.romeo@yum.com',
    subject: 'A private base at Cannes — and a dinner worth your time',
    body: `Hi Kerman,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy. A number of CMOs and brand leaders are using the space for private client sessions and roundtables away from the Palais noise.

Given your session on the programme this year, we thought it worth reaching out. We are also hosting a private dinner on 23rd June with a tight guest list of senior brand leaders.

Happy to share more if useful.`,
  },
  {
    name:    'Polly McMorrow',
    email:   'polly@aceofhearts.co',
    subject: 'Something off the official schedule at Cannes',
    body: `Hi Polly,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a strictly no-pitch policy. A number of founders and independent agency leaders are using it as a proper base away from the festival floor.

We are also hosting a private dinner on 23rd June with a small group of senior creatives and founders — feels like your kind of table given what you have built with Ace of Hearts.

Let me know if either is of interest.`,
  },
  {
    name:    'Jon Evans',
    email:   'jon@uncensoredcmo.com',
    subject: 'A content setup at Cannes — no noise, proper facilities',
    body: `Hi Jon,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content capture facilities, daily shuttles to La Croisette and a no-pitch policy.

Given what you do with Uncensored CMO, the space could be a natural fit — whether for recording sessions at Cannes, a small roundtable with a few of the CMOs in the house, or just a proper base between everything on the schedule. The calibre of people coming through the villa that week would make for good content.

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
