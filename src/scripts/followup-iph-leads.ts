/**
 * Follow-up to Cannes IPH Leads (original: cannes-iph-leads-outreach.ts, 6 Apr)
 * Tier 1/2: villa residency pitch. Tier 3: media partnership pitch.
 * New hook: DEPT Secret Garden partnership confirmed.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/followup-iph-leads.ts
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
  const logoB64 = getLogoBase64();
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
    <p style="margin:0 0 16px 0;"><a href="https://powerhouse.indvstryclvb.com" style="color:#1a1a1a;">Powerhouse.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
  </div>
</body></html>`;
}

interface Contact {
  firstName: string;
  name: string;
  email: string;
  company: string;
  tier: 1 | 2 | 3;
}

// Tier 1/2 = villa residency. Tier 3 = media partnership.
const contacts: Contact[] = [
  { firstName: 'Sydne',     name: 'Sydne Mullings',    email: 'sydne.mullings@microsoft.com',   company: 'Microsoft',              tier: 1 },
  { firstName: 'Brad',      name: 'Brad Haugen',        email: 'brad.haugen@lionsgate.com',      company: 'Lionsgate',              tier: 1 },
  { firstName: 'Sam',       name: 'Sam Register',       email: 'sam.register@warnerbros.com',    company: 'Warner Bros',            tier: 1 },
  { firstName: 'Rob',       name: 'Rob Wade',           email: 'rob.wade@fox.com',               company: 'Fox Entertainment',      tier: 1 },
  { firstName: 'Dhar',      name: 'Dhar Mann',          email: 'dhar@dharmannstudios.com',       company: 'Dhar Mann Studios',      tier: 1 },
  { firstName: 'Shira',     name: 'Shira Lazar',        email: 'shira@whatstrending.com',        company: "What's Trending",        tier: 1 },
  { firstName: 'Clare',     name: 'Clare Phillips',     email: 'clare.phillips@adobe.com',       company: 'Adobe',                  tier: 2 },
  { firstName: 'Mazviona',  name: 'Mazviona Madzima',   email: 'mazviona.madzima@google.com',    company: 'YouTube',                tier: 2 },
  { firstName: 'Joe',       name: 'Joe Lamb',           email: 'joe.lamb@arcademedia.co.uk',     company: 'Arcade Media',           tier: 2 },
  { firstName: 'Leon',      name: 'Leon Harlow',        email: 'leon.harlow@ymu.com',            company: 'YMU',                    tier: 2 },
  { firstName: 'Gracie',    name: 'Gracie Schram',      email: 'gracie.schram@epidemicsound.com',company: 'Epidemic Sound',         tier: 2 },
  { firstName: 'Dunia',     name: 'Dunia McNeily',      email: 'dunia.mcneily@3arts.com',        company: '3 Arts Entertainment',   tier: 2 },
  { firstName: 'Kudzi',     name: 'Kudzi Chikumbu',     email: 'kudzi.chikumbu@tubi.tv',         company: 'Tubi',                   tier: 2 },
  { firstName: 'Yongsoo',   name: 'Yongsoo Kim',        email: 'yongsoo.kim@webtoon.com',        company: 'Webtoon Entertainment',  tier: 2 },
  { firstName: 'Jessica',   name: 'Jessica Joseph',     email: 'jessica@season25.com',           company: 'Season25',               tier: 2 },
  { firstName: 'Josh',      name: 'Josh Richards',      email: 'josh@crosscheckstudios.com',     company: 'CrossCheck Studios',     tier: 2 },
  { firstName: 'Steven',    name: 'Steven Bertoni',     email: 'steven.bertoni@forbes.com',      company: 'Forbes',                 tier: 3 },
  { firstName: 'Alex',      name: 'Alex Brownsell',     email: 'alex.brownsell@warc.com',        company: 'WARC Media',             tier: 3 },
  { firstName: 'Lina',      name: 'Lina Renzina',       email: 'lina.renzina@patreon.com',       company: 'Patreon',                tier: 3 },
  { firstName: 'Shukri',    name: 'Shukri Dirie',       email: 'shukri.dirie@bbc.co.uk',         company: 'BBC Studios TalentWorks',tier: 3 },
];

function buildResidencyBody(c: Contact): string {
  return `Hi ${c.firstName},

I am following up on a note we sent about Indvstry Power House at Cannes Lions.

We did not hear back and wanted to reach out one more time. Since we wrote, we have confirmed a headline partnership with DEPT Agency's Secret Garden on the Croisette — the activation is taking shape and villa residency spots are filling up quickly. The programming we are building for the week is genuinely strong.

We would love to talk about whether a residency spot could work for you. Happy to answer any questions over email or jump on a quick call.

More on what we are building: Powerhouse.indvstryclvb.com`;
}

function buildMediaBody(c: Contact): string {
  return `Hi ${c.firstName},

I am following up on our note about a potential media partnership around Indvstry Power House at Cannes Lions.

Since we last wrote, we have confirmed a headline programming partnership with DEPT Agency's Secret Garden on the Croisette, one of the most talked-about and genuinely invite-only activations at the festival. The Power House is attracting some strong names and we think there is a story worth covering for ${c.company}.

Is there still any interest in exploring a media or coverage partnership? Happy to share more details.

More on what we are building: Powerhouse.indvstryclvb.com`;
}

async function main() {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const residencySubject = 'Re: Indvstry Power House — Cannes Lions 2026';
  const mediaSubject     = 'Re: Indvstry Power House — Cannes Lions 2026 media partnership';

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];

    const subject = c.tier === 3 ? mediaSubject : residencySubject;
    const body    = c.tier === 3 ? buildMediaBody(c) : buildResidencyBody(c);

    const message: any = {
      subject,
      body: { contentType: 'HTML', content: buildHtml(body) },
      toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
      from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
    };

    if (logoB64) {
      message.attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'indvstry-logo.png',
        contentType: 'image/png',
        contentBytes: logoB64,
        contentId: 'indvstry-logo',
        isInline: true,
      }];
    }

    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    console.log(`[${i + 1}/${contacts.length}] Sent to ${c.name} <${c.email}> (Tier ${c.tier})`);
    if (i < contacts.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log('\nIPH Leads follow-ups done.');
}

main().catch(e => { console.error(e?.response?.data || e.message); process.exit(1); });
