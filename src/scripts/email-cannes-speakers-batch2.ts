/**
 * email-cannes-speakers-batch2.ts
 *
 * Personalised outreach to 19 Cannes Lions 2026 programme speakers (batch 2).
 * Angles: Diaspora Dinner, Villa Partnership, Speaker Residency, Fringe Events.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-cannes-speakers-batch2.ts
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
    name:    'Jamie Iannone',
    email:   'jiannone@ebay.com',
    subject: 'A quiet room at Cannes — and a familiar face',
    body: `Hi Jamie,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities and a no-pitch policy.

I wanted to reach out specifically because someone from your team at eBay is already joining us as a resident that week. We thought it worth making sure you had visibility on it.

We are also hosting a private dinner on Tuesday 23rd June with a small group of senior brand and agency leaders. If either is of interest, happy to share more.`,
  },
  {
    name:    'Demis Hassabis',
    email:   'demishassabis@deepmind.com',
    subject: 'Something worth your time at Cannes',
    body: `Hi Demis,

We are running a private villa activation during Cannes Lions week — Indvstry Power House. A small group of senior creatives and tech leaders. Daily shuttles, no-pitch policy, proper quiet.

We are hosting a private dinner on Tuesday 23rd June. Given your session on the programme, we thought you would be exactly the right person in the room.

Worth five minutes?`,
  },
  {
    name:    'Daisy Veerasingham',
    email:   'dveerasingham@ap.org',
    subject: 'A private dinner at Cannes — 23rd June',
    body: `Hi Daisy,

We are hosting a private Diaspora Dinner on Tuesday 23rd June during Cannes Lions week — 30 guests, away from the Croisette, at our villa. Intentionally small, intentionally the right people.

Given your role at AP and your presence on the programme this year, we would love to have you there. No agenda, no pitches.

We are also running the villa as a base throughout the week — content facilities, daily shuttles, quiet space between sessions — if that is useful separately.

Let me know if either works.`,
  },
  {
    name:    'Mimi Turner',
    email:   'mimiturner@linkedin.com',
    subject: 'A proper base at Cannes — away from the noise',
    body: `Hi Mimi,

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette and a no-pitch policy. It is the kind of space that is genuinely hard to find that week.

Given your role at LinkedIn we thought there could be an interesting angle — whether that is space for a small client session, a roundtable, or just a proper base. We are also hosting a private dinner on 23rd June with a tight guest list of senior brand leaders.

Happy to share more if useful.`,
  },
  {
    name:    'Jim Lesser',
    email:   'jim.lesser@servicenow.com',
    subject: 'Private space at Cannes for brand conversations',
    body: `Hi Jim,

We are running Indvstry Power House at Cannes Lions — a private villa with content facilities, daily shuttles to La Croisette, and space for small private client sessions away from the Palais.

As Chief Brand Officer at ServiceNow, with your session on the programme this year, it felt right to reach out. If you need a quiet space for a client briefing or a team dinner during the week, we can accommodate it.

We are also hosting a private dinner on 23rd June. Happy to share details.`,
  },
  {
    name:    'Alex Weller',
    email:   'alex.weller@patagonia.com',
    subject: 'A no-pitch base at Cannes — fits your values',
    body: `Hi Alex,

We are running a speaker residency at Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, a proper workspace, and a strictly no-pitch environment.

Given Patagonia's approach to everything — and your session on the programme — we thought the ethos of what we are doing would resonate with you. It is a genuine alternative to the usual Cannes chaos.

We are also hosting a private dinner on 23rd June if that is of interest separately.`,
  },
  {
    name:    'Corey Martin',
    email:   'corey.martin@allisonworldwide.com',
    subject: 'A dinner worth attending — Cannes, 23rd June',
    body: `Hi Corey,

We are hosting a private Diaspora Dinner on Tuesday 23rd June during Cannes Lions week — 30 guests, private villa, away from the Croisette. The guest list is intentional. Given your work in creator marketing and your presence on the programme, you are exactly who we want in the room.

We are also running the villa as a base throughout the week — daily shuttles, content facilities, no-pitch policy.

Let me know if the dinner or the space is of interest.`,
  },
  {
    name:    'Trevor Robinson',
    email:   'trevor@quietstorm.co.uk',
    subject: 'A dinner you will want to be at — Cannes, 23rd June',
    body: `Hi Trevor,

We are hosting a private Diaspora Dinner on Tuesday 23rd June during Cannes Lions week. 30 people. Private villa. Away from the Croisette. No agenda, no pitches — just the right people finally in the same room.

You are at the top of our list. Given everything you have built with Quiet Storm and your standing in British creative culture, this table would not be complete without you.

Let me know if you are in and I will get you the details.`,
  },
  {
    name:    'Rich Silverstein',
    email:   'rich@goodbysilverstein.com',
    subject: 'A quiet space at Cannes — for the right conversations',
    body: `Hi Rich,

We are running Indvstry Power House during Cannes Lions week — a private villa with content and AV facilities, daily shuttles to La Croisette, and a no-pitch policy. A number of agency leaders are using the space for client roundtables and private sessions away from the Palais.

Given GSP's presence at Lions and your session on the programme, it felt right to reach out. We are also hosting a private dinner on 23rd June with a small group of senior creatives.

Happy to share more if useful.`,
  },
  {
    name:    'Greg Quinton',
    email:   'greg@designbridgeandpartners.com',
    subject: 'Private space at Cannes for your team',
    body: `Hi Greg,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content facilities, daily shuttles to La Croisette, and space for small private client sessions.

As CCO at Design Bridge and Partners, with your session on the programme, it seemed like a natural fit to reach out. If you need a quiet, high-quality space for a client briefing or a team moment during the week, it is available.

We are also hosting a private dinner on 23rd June. Let me know if either is of interest.`,
  },
  {
    name:    'Alex Jenkins',
    email:   'alex@contagious.com',
    subject: 'Something worth covering at Cannes',
    body: `Hi Alex,

We are running Indvstry Power House during Cannes Lions week — a private villa with content capture facilities, daily shuttles to La Croisette, and a no-pitch policy.

Given what Contagious covers, there could be an interesting editorial angle for you — whether that is a recorded conversation, a roundtable with some of the people in the house, or just a proper base away from the festival floor.

We are also hosting a private dinner on 23rd June with a tight guest list of senior creatives and brand leaders. Happy to share more.`,
  },
  {
    name:    'Chloe Markowicz',
    email:   'chloe@contagious.com',
    subject: 'A private base at Cannes — and a dinner worth attending',
    body: `Hi Chloe,

We are running Indvstry Power House during Cannes Lions week — a private villa with content facilities, daily shuttles to La Croisette, and a no-pitch policy.

There could be an interesting editorial angle given what you cover at Contagious — recorded sessions, a small roundtable, or simply a proper base between everything on the programme. We are also hosting a private dinner on 23rd June with a select group of senior creatives.

Worth a conversation?`,
  },
  {
    name:    'Adam Morgan',
    email:   'adam@eatbigfish.com',
    subject: 'A private base at Cannes for speakers',
    body: `Hi Adam,

We have set up a speaker residency at Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to the Palais, workspace, and a no-pitch environment. A proper base for speakers who want quiet between sessions.

Given your session on the programme, we thought it would be of interest. We are also hosting a private dinner on 23rd June with a small group of senior brand thinkers — feels like your kind of table.`,
  },
  {
    name:    'Andrew Tindall',
    email:   'andrew.tindall@system1group.com',
    subject: 'A private space at Cannes for System1',
    body: `Hi Andrew,

We are running Indvstry Power House at Cannes Lions — a private villa with content capture, AV, and daily shuttles to La Croisette. A number of research and effectiveness companies are using the space for private client sessions and roundtables away from the Palais.

Given System1's profile at Lions and your role in global partnerships, it felt right to reach out. If you need a quiet space for a client briefing or a closed roundtable during the week, it is at your disposal.`,
  },
  {
    name:    'Loren Cook',
    email:   'loren.cook@publicis.com',
    subject: 'A quiet space at Cannes for your team',
    body: `Hi Loren,

We are running Indvstry Power House during Cannes Lions week — a private villa with content facilities, daily shuttles to La Croisette, and a no-pitch policy. A number of agency creative directors are using the space for client sessions and private roundtables away from the Palais.

Given your role at Publicis London and your session on the programme, we thought it worth reaching out. We are also hosting a private dinner on 23rd June with a tight guest list of senior creatives.`,
  },
  {
    name:    'Rei Inamoto',
    email:   'rei.inamoto@iandco.com',
    subject: 'A private base at Cannes — worth your time',
    body: `Hi Rei,

We are running Indvstry Power House during Cannes Lions week — a private villa with AV and content facilities, daily shuttles to La Croisette, and a no-pitch policy.

Given the work I&CO does and your session on the programme, the space could work well — whether for a client session, a recorded conversation or just a proper base away from the Croisette. We are also hosting a private dinner on 23rd June with a select group of founders and creative leaders.

Happy to share more.`,
  },
  {
    name:    'Joaquin Cubria',
    email:   'joaquincubria@gut.agency',
    subject: 'A private space at Cannes for GUT',
    body: `Hi Joaquin,

We are running Indvstry Power House during Cannes Lions week — a private villa with content facilities, daily shuttles to La Croisette, and a strictly no-pitch environment. A number of independent agency leaders are using the space for client roundtables and private sessions away from the noise of the Palais.

Given GUT's momentum and your session on the programme, it felt like the right time to reach out. We are also hosting a private dinner on 23rd June with a small group of senior creatives.`,
  },
  {
    name:    'Sam Avivi',
    email:   's.avivi@bayer.com',
    subject: 'A private dinner at Cannes — 23rd June',
    body: `Hi Sam,

We are hosting a private dinner on Tuesday 23rd June during Cannes Lions week — 30 guests, private villa, away from the Croisette. A small group of senior brand and agency leaders. Given your role as CMO at Bayer and your presence on the programme this year, we thought it worth reaching out.

We are also running Indvstry Power House as a private base throughout the week — daily shuttles, content facilities, no-pitch policy — if that is of use separately.`,
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
