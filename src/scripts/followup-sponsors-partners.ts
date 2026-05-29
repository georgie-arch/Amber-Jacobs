/**
 * Follow-up to Cannes Sponsors + Partners Batch + Clear Channel/Shopify/InMobi
 * Original sends: email-cannes-partners-batch.ts (22 Mar), cannes-sponsors-outreach.ts (6 Apr),
 *                 email-clear-channel-shopify-glance.ts (25 Mar, already had one follow-up)
 * New hook: DEPT Secret Garden partnership confirmed.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/followup-sponsors-partners.ts
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
  subject: string;
  angle: string;
}

const contacts: Contact[] = [
  // ── Cannes Partners Batch (22 Mar) ──────────────────────────────────────────
  {
    firstName: 'Shannon',
    name: 'Shannon Montoya',
    email: 'shannon.montoya@yahooinc.com',
    company: 'Yahoo Inc',
    subject: 'Re: Cannes 2026 — an idea off the back of Motel Yahoo, Shannon',
    angle: 'Yahoo has a natural presence at Cannes and we think there is a genuinely interesting fit here',
  },
  {
    firstName: 'Beth',
    name: 'Beth Sidhu',
    email: 'beth.sidhu@stagwellglobal.com',
    company: 'Stagwell Global',
    subject: 'Re: Cannes 2026 — Sport Beach meets Power House, Beth',
    angle: 'Stagwell and Power House are building in the same spirit and we think there is a natural conversation to be had',
  },
  {
    firstName: 'James',
    name: 'James Rooke',
    email: 'james_rooke@comcast.com',
    company: 'Comcast',
    subject: 'Re: Cannes 2026 — a conversation from the Power House, James',
    angle: 'Comcast has the kind of cross-industry reach that would make a Power House partnership genuinely interesting',
  },
  {
    firstName: 'Jeremy',
    name: 'Jeremy Miller',
    email: 'jeremy.miller@dentsu.com',
    company: 'Dentsu',
    subject: 'Re: Cannes 2026 — a creative leaders conversation, Jeremy',
    angle: 'Dentsu sits at exactly the intersection of brand, technology and culture that the Power House is built around',
  },
  {
    firstName: 'Charlotte',
    name: 'Charlotte Rambaud',
    email: 'charlotte.rambaud@havas.com',
    company: 'Havas',
    subject: 'Re: Cannes 2026 — from one Croisette institution to another, Charlotte',
    angle: 'Havas is one of the few agencies whose Cannes presence has real cultural weight and we would love to explore what a Power House partnership could look like',
  },
  // ── Cannes Sponsors Batch (6 Apr) ───────────────────────────────────────────
  {
    firstName: 'Clyde',
    name: 'Clyde Rathbone',
    email: 'clyde@substack.com',
    company: 'Substack',
    subject: 'Re: Cannes Lions 2026 — sponsorship inside the right room',
    angle: 'Substack and the Power House share the same instinct about where the most valuable creative conversations are happening right now',
  },
  {
    firstName: 'Tom',
    name: 'Tom Taraniuk',
    email: 'tom.taraniuk@sumsub.com',
    company: 'Sumsub',
    subject: 'Re: Cannes Lions 2026 — sponsorship inside the right room',
    angle: 'The compliance and identity conversation that Sumsub is leading is exactly what the CMOs and brand leaders inside the Power House are grappling with',
  },
  {
    firstName: 'Rita',
    name: 'Rita Martins',
    email: 'rita.martins@lseg.com',
    company: 'London Stock Exchange Group',
    subject: 'Re: Cannes Lions 2026 — sponsorship inside the right room',
    angle: 'LSEG sits at exactly the intersection of institutional credibility and creative economy that runs through the Power House all week',
  },
  {
    firstName: 'Olivia',
    name: 'Olivia Minnock',
    email: 'olivia@mmob.com',
    company: 'mmob',
    subject: 'Re: Cannes Lions 2026 — sponsorship inside the right room',
    angle: 'mmob is building the kind of embedded financial infrastructure that the technology and brand leaders in residence are actively looking to integrate',
  },
  {
    firstName: 'Jeremy',
    name: 'Jeremy Helfand',
    email: 'jeremy.helfand@amazon.com',
    company: 'Amazon Prime Video',
    subject: 'Re: Cannes Lions 2026 — sponsorship inside the right room',
    angle: 'Prime Video has a Cannes story worth telling and the Power House is one of the most senior rooms to tell it in',
  },
  // ── Clear Channel / Shopify / InMobi (25 Mar, already had one follow-up) ───
  {
    firstName: 'Dan',
    name: 'Dan Levi',
    email: 'dan.levi@clearchannel.com',
    company: 'Clear Channel',
    subject: 'Re: Indvstry Power House, Cannes 2026 - partnership',
    angle: 'Clear Channel has a scale at Cannes that could pair really well with the intimate environment the Power House is building',
  },
  {
    firstName: 'Jessica',
    name: 'Jessica',
    email: 'jessica@shopify.com',
    company: 'Shopify',
    subject: 'Re: Indvstry Power House, Cannes 2026 - partnership',
    angle: "Shopify's creator and commerce story is exactly what the culture-forward leaders in the Power House are paying attention to",
  },
  {
    firstName: 'Mansi',
    name: 'Mansi Jain',
    email: 'mansi.jain@inmobi.com',
    company: 'InMobi / Glance',
    subject: 'Re: Indvstry Power House, Cannes 2026 - partnership',
    angle: "Glance AI's creator economy angle is a natural fit for the conversations running through the Power House all week",
  },
];

async function main() {
  const token  = await getToken();
  const logoB64 = getLogoBase64();

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];

    const body = `Hi ${c.firstName},

Cannes is six weeks away and we are finalising the last few partnership positions for Indvstry Power House, so I wanted to come back one more time.

We still think ${c.angle}. The activation has come together well — we have a headline programming partnership with DEPT Agency's Secret Garden on the Croisette, residents confirmed across the villa, and the programme for the week is strong.

We have a very small number of partnership positions remaining. Once those are gone, that is it. Happy to get on a quick call this week or share more detail over email.

More on what we are building: Powerhouse.indvstryclvb.com`;

    const message: any = {
      subject: c.subject,
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

    console.log(`[${i + 1}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
    if (i < contacts.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log('\nSponsors + Partners follow-ups done.');
}

main().catch(e => { console.error(e?.response?.data || e.message); process.exit(1); });
