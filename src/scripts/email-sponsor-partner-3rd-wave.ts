/**
 * email-sponsor-partner-3rd-wave.ts
 *
 * 3rd and final touch for senior sponsor/partner contacts (Batch A).
 * Original outreach: March 2026. Follow-up: 14 April 2026.
 * This wave: 13 May 2026 — 6 weeks to Cannes, final push.
 *
 * Sent as George Guise. Short, confident, no desperation.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-sponsor-partner-3rd-wave.ts
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

interface Contact {
  firstName: string;
  name: string;
  email: string;
  company: string;
  subject: string;
}

const contacts: Contact[] = [
  // ── Batch A — Tier 1 senior (original Mar 2026, follow-up Apr 14) ────────────
  {
    firstName: 'Judann',
    name:      'Judann Pollack',
    email:     'jpollack@adage.com',
    company:   'Ad Age',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Bob',
    name:      'Bob Pittman',
    email:     'bobpittman@iheartmedia.com',
    company:   'iHeartMedia',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Gary',
    name:      'Gary Vaynerchuk',
    email:     'gary.vaynerchuk@vaynermedia.com',
    company:   'VaynerMedia',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Michael',
    name:      'Michael Barrett',
    email:     'mbarrett@magnite.com',
    company:   'Magnite',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Jane',
    name:      'Jane Ostler',
    email:     'jane.ostler@kantar.com',
    company:   'Kantar',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Carleigh',
    name:      'Carleigh Jaques',
    email:     'cjaques@visa.com',
    company:   'Visa',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Raja',
    name:      'Raja Rajamannar',
    email:     'raja.rajamannar@mastercard.com',
    company:   'Mastercard',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Orson',
    name:      'Orson Francescone',
    email:     'orson.francescone@ft.com',
    company:   'Financial Times',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Rob',
    name:      'Rob Wilk',
    email:     'robw@microsoft.com',
    company:   'Microsoft',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Marc',
    name:      'Marc Sternberg',
    email:     'marc@brand-innovators.com',
    company:   'Brand Innovators',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Laurent',
    name:      'Laurent Ezekiel',
    email:     'laurent.ezekiel@wpp.com',
    company:   'WPP',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Sofia',
    name:      'Sofia Hernandez',
    email:     'sofia.hernandez@tiktok.com',
    company:   'TikTok',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Matt',
    name:      'Matt Devitt',
    email:     'matt.devitt@nielsen.com',
    company:   'Nielsen',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Mike',
    name:      'Mike Romoff',
    email:     'mromoff@reddit.com',
    company:   'Reddit',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Ben',
    name:      'Ben Skinazi',
    email:     'bskinazi@equativ.com',
    company:   'Equativ',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Claire',
    name:      'Claire Paull',
    email:     'clairepaull@amazon.com',
    company:   'Amazon',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Diana',
    name:      'Diana Littman',
    email:     'diana.littman@adweek.com',
    company:   'Adweek',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Marc',
    name:      'Marc Pritchard',
    email:     'marc.pritchard@pg.com',
    company:   'P&G',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Javier',
    name:      'Javier Campopiano',
    email:     'javier.campopiano@mccann.com',
    company:   'McCann',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
  {
    firstName: 'Anjali',
    name:      'Anjali Sud',
    email:     'asud@tubi.tv',
    company:   'Tubi',
    subject:   'Re: Indvstry Power House — Cannes Lions 2026',
  },
];

async function main() {
  const token  = await getToken();
  const logoB64 = getLogoBase64();

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];

    const body = `Hi ${c.firstName},

I know I have been in touch a couple of times already so I will keep this short.

Cannes is six weeks away. We are finalising the last few partnership positions for Indvstry Power House and I wanted to give you one more chance to be part of it before we close out.

The programme has come together well. We have a confirmed headline partnership with DEPT Agency's Secret Garden on the Croisette, a strong resident group across the villa, and the week is shaping up to be exactly what we set out to build. A very small number of partnership positions are still available.

If there is any interest, even just a quick conversation, now is the time. Happy to jump on a 15-minute call or share more over email.

Powerhouse.indvstryclvb.com

George`;

    const message: any = {
      subject: c.subject,
      body:    { contentType: 'HTML', content: buildHtml(body) },
      toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
      from:         { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
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

    console.log(`[${i + 1}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
    if (i < contacts.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log('\n3rd-wave sponsor/partner follow-up done.');
}

main().catch(e => { console.error(e?.response?.data || e.message); process.exit(1); });
