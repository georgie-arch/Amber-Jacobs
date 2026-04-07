/**
 * cannes-iph-leads-outreach.ts
 *
 * Generic outreach to IPH_Cannes_2026_Leads.pdf contacts.
 * Sent as Amber Jacobs. One template for residency leads, one for media/Tier 3.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const VILLA_URL  = 'https://lu.ma/t4ek2yn7';
const DINNER_URL = 'https://lu.ma/5vmr7s6f';
const PH_URL     = 'https://powerhouse.indvstryclvb.com';

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  tier: 1 | 2 | 3;
}

// Generic residency body
function residencyBody(c: Contact): string {
  return `Hi ${c.firstName},

I am Amber, community manager at Indvstry Clvb.

We are running Indvstry Power House at Cannes Lions this June, a private villa residency and activation for senior leaders across brand, media, entertainment and creative. Seven rooms, an official Cannes delegate pass included, daily transport to La Croisette, and a curated week designed around the right people being in the right place.

Given your work at ${c.company} we think you would be a strong fit for the room.

Full details and room booking here: ${VILLA_URL}

We are also hosting the Diaspora Dinner on 23 June, an intimate evening for founders, executives and creative leaders during Cannes week. Tickets here: ${DINNER_URL}

Happy to send more information or get on a call if useful.

Amber`;
}

// Media/partnership body for Tier 3
function mediaBody(c: Contact): string {
  return `Hi ${c.firstName},

I am Amber, community manager at Indvstry Clvb.

We are running Indvstry Power House at Cannes Lions this June, a private villa activation for senior media, brand and entertainment leaders. Alongside that we are hosting the Diaspora Dinner on 23 June, a curated evening for founders and industry figures during the festival week.

We would love to explore a media partnership or coverage opportunity with ${c.company} around the activation. It feels like a natural story for your audience.

More on what we are building here: ${PH_URL}

Happy to share more detail or get on a call.

Amber`;
}

const CONTACTS: Contact[] = [
  // TIER 1
  { firstName: 'Sydne',     lastName: 'Mullings',     email: 'sydne.mullings@microsoft.com',     company: 'Microsoft',           role: 'GM Americas Central Marketing',                   tier: 1 },
  { firstName: 'Brad',      lastName: 'Haugen',       email: 'brad.haugen@lionsgate.com',         company: 'Lionsgate',           role: 'EVP Digital Strategy & Growth',                   tier: 1 },
  { firstName: 'Sam',       lastName: 'Register',     email: 'sam.register@warnerbros.com',       company: 'Warner Bros',         role: 'President, Animation & Cartoon Network',          tier: 1 },
  { firstName: 'Rob',       lastName: 'Wade',         email: 'rob.wade@fox.com',                  company: 'Fox Entertainment',   role: 'CEO',                                             tier: 1 },
  { firstName: 'Dhar',      lastName: 'Mann',         email: 'dhar@dharmannstudios.com',          company: 'Dhar Mann Studios',   role: 'Founder',                                         tier: 1 },
  { firstName: 'Shira',     lastName: 'Lazar',        email: 'shira@whatstrending.com',           company: "What's Trending",     role: 'Founder & CEO',                                   tier: 1 },
  // TIER 2
  { firstName: 'Clare',     lastName: 'Phillips',     email: 'clare.phillips@adobe.com',          company: 'Adobe',               role: 'Social & Influencer Director',                    tier: 2 },
  { firstName: 'Mazviona',  lastName: 'Madzima',      email: 'mazviona.madzima@google.com',       company: 'YouTube',             role: 'Senior Strategic Partner Manager',                tier: 2 },
  { firstName: 'Joe',       lastName: 'Lamb',         email: 'joe.lamb@arcademedia.co.uk',        company: 'Arcade Media',        role: 'MD Commercial',                                   tier: 2 },
  { firstName: 'Leon',      lastName: 'Harlow',       email: 'leon.harlow@ymu.com',               company: 'YMU',                 role: 'Commercial Director',                             tier: 2 },
  { firstName: 'Gracie',    lastName: 'Schram',       email: 'gracie.schram@epidemicsound.com',   company: 'Epidemic Sound',      role: 'Head of Strategic Creator Initiatives',           tier: 2 },
  { firstName: 'Dunia',     lastName: 'McNeily',      email: 'dunia.mcneily@3arts.com',           company: '3 Arts Entertainment','role': 'Partner',                                       tier: 2 },
  { firstName: 'Kudzi',     lastName: 'Chikumbu',     email: 'kudzi.chikumbu@tubi.tv',            company: 'Tubi',                role: 'VP Creator Partnerships',                         tier: 2 },
  { firstName: 'Yongsoo',   lastName: 'Kim',          email: 'yongsoo.kim@webtoon.com',           company: 'Webtoon Entertainment','role': 'President',                                    tier: 2 },
  { firstName: 'Tony',      lastName: 'Vassiliadis',  email: 'tony.vassiliadis@fox.com',          company: 'Fox Entertainment',   role: 'EVP Operations & Strategy',                       tier: 2 },
  { firstName: 'Jessica',   lastName: 'Joseph',       email: 'jessica@season25.com',              company: 'Season25',            role: 'Founder',                                         tier: 2 },
  { firstName: 'Josh',      lastName: 'Richards',     email: 'josh@crosscheckstudios.com',        company: 'CrossCheck Studios',  role: 'Founder & Creator',                               tier: 2 },
  // TIER 3 — media/partnership angle
  { firstName: 'Steven',    lastName: 'Bertoni',      email: 'steven.bertoni@forbes.com',         company: 'Forbes',              role: 'Editor, Social Media & 30U30',                    tier: 3 },
  { firstName: 'Alex',      lastName: 'Brownsell',    email: 'alex.brownsell@warc.com',           company: 'WARC Media',          role: 'Head of Content',                                 tier: 3 },
  { firstName: 'Lina',      lastName: 'Renzina',      email: 'lina.renzina@patreon.com',          company: 'Patreon',             role: 'Head of Top Creator Management',                  tier: 3 },
  { firstName: 'Shukri',    lastName: 'Dirie',        email: 'shukri.dirie@bbc.co.uk',            company: 'BBC Studios TalentWorks', role: 'Development Producer',                       tier: 3 },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logo = getLogoBase64();
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logo ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />` : ''}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function sendEmail(token: string, c: Contact): Promise<boolean> {
  const logo = getLogoBase64();
  const body = c.tier === 3 ? mediaBody(c) : residencyBody(c);
  const subject = c.tier === 3
    ? 'Indvstry Power House — Cannes Lions 2026 media partnership'
    : 'Cannes Lions 2026 — private villa residency';

  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: c.email, name: `${c.firstName} ${c.lastName}` } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };

  if (logo) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logo,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return true;
}

async function main() {
  console.log('\nIndvstry Power House — IPH Leads Outreach');
  console.log('═'.repeat(50));
  console.log(`Sending to ${CONTACTS.length} contacts as Amber Jacobs\n`);

  const token = await getAccessToken();
  let sent = 0, failed = 0;

  for (const c of CONTACTS) {
    const name = `${c.firstName} ${c.lastName}`;
    process.stdout.write(`  [T${c.tier}] ${name} <${c.email}>... `);
    try {
      await sendEmail(token, c);
      console.log('sent');
      sent++;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`FAILED: ${msg}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 700));
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`Done: ${sent} sent, ${failed} failed\n`);
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
