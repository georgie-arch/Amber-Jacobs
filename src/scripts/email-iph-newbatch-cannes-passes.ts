/**
 * New outreach batch — IPH villa residency + 21 Cannes Lions passes
 * Short and sweet: are you coming to Cannes? Join as resident or activate at the villa.
 * We have 21 Lions passes to collaborate on + full villa activation platform.
 * From George. Sponsorship deck included.
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
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

function buildBody(firstName: string, company: string): string {
  return `Hi ${firstName},

Hope you are well. I am George Guise, founder of Indvstry Clvb.

I am reaching out because we are building something genuinely exciting at Cannes Lions this June and I think there is a strong fit with ${company}.

Indvstry Power House is our private villa activation running alongside Cannes Lions from 21 to 26 June. A luxury villa just outside Cannes, a curated group of residents, private events and a week of dinners and conversations with some of the most senior people in global media, marketing and culture. More here: Powerhouse.indvstryclvb.com

Two things I wanted to put to you:

First, if you are heading to Cannes this year, we would love to explore whether you want to join us as a villa resident, or whether ${company} has any activation plans we could support. The villa is set up perfectly to host private events, branded dinners and exclusive moments throughout the week.

Second, we were gifted 21 Cannes Lions festival delegate passes this year by the Lions team, each worth over 5,000 euros. We would love to find a way to collaborate with ${company} to put some of these in the hands of the right people on your team, alongside an event activation at the villa.

I have attached our latest sponsorship deck here: https://canva.link/j9tgb9z2annevnz

Would love to find 20 minutes to talk it through. Happy to connect however works best for you.`;
}

interface Contact {
  firstName: string;
  name: string;
  email: string;
  company: string;
}

const contacts: Contact[] = [
  // ── New Batch: High-Profile ──────────────────────────────────────────────
  { firstName: 'Ndidi',     name: 'Ndidi Oteh',          email: 'ndidi.oteh@accenture.com',           company: 'Accenture Song' },
  { firstName: 'Francis',   name: 'Francis Stones',       email: 'francis.stones@tiktok.com',          company: 'TikTok' },
  { firstName: 'Martin',    name: 'Sir Martin Sorrell',   email: 'martin.sorrell@s4capital.com',       company: 'S4 Capital' },
  { firstName: 'Dan',       name: 'Dan Slivjanovski',     email: 'dan.slivjanovski@doubleverify.com',  company: 'DoubleVerify' },
  { firstName: 'Stuart',    name: 'Stuart Flint',         email: 'stuart.flint@doubleverify.com',      company: 'DoubleVerify' },
  { firstName: 'Anna',      name: 'Anna Forbes',          email: 'anna.forbes@doubleverify.com',       company: 'DoubleVerify' },
  { firstName: 'Sam',       name: 'Sam Mathie',           email: 'sam.mathie@unilever.com',            company: 'Unilever' },
  { firstName: 'Thibault',  name: 'Thibault Hennion',     email: 'thibault.hennion@unlimitail.com',    company: 'Unlimitail' },
  { firstName: 'Ana Laura', name: 'Ana Laura Zain',       email: 'ana.zain@pentaleap.com',             company: 'Pentaleap' },
  { firstName: 'Terry',     name: 'Terry Kawaja',         email: 'terry.kawaja@lumapartners.com',      company: 'LUMA Partners' },

  // ── MSQ Executive & Leadership ──────────────────────────────────────────
  { firstName: 'Peter',     name: 'Peter Reid',           email: 'peter.reid@msqpartners.com',         company: 'MSQ' },
  { firstName: 'Kate',      name: 'Kate Howe',            email: 'kate.howe@msqpartners.com',          company: 'MSQ' },
  { firstName: 'Bart',      name: 'Bart Michels',         email: 'bart.michels@msqpartners.com',       company: 'MSQ' },
  { firstName: 'Joanna',    name: 'Joanna Lyall',         email: 'joanna.lyall@msqpartners.com',       company: 'MSQ' },
  { firstName: 'Ben',       name: 'Ben Rudman',           email: 'ben.rudman@msqpartners.com',         company: 'MSQ' },
  { firstName: 'Aaron',     name: 'Aaron Lang',           email: 'aaron.lang@msqpartners.com',         company: 'MSQ' },
  { firstName: 'Justin',    name: 'Justin Cox',           email: 'justin.cox@msqpartners.com',         company: 'MSQ' },
  { firstName: 'Tamsin',    name: 'Tamsin James',         email: 'tamsin.james@msqpartners.com',       company: 'MSQ' },
  { firstName: 'Fergus',    name: 'Fergus Dyer Smith',    email: 'fergus.dyersmith@msqpartners.com',   company: 'MSQ' },
  { firstName: 'Kate',      name: 'Kate MacNevin',        email: 'kate.macnevin@steinias.com',         company: 'Stein / MSQ' },
  { firstName: 'Tom',       name: 'Tom Stein',            email: 'tom.stein@steinias.com',             company: 'Stein' },
  { firstName: 'Jeremy',    name: 'Jeremy Davis',         email: 'jeremy.davis@steinias.com',          company: 'Stein' },
  { firstName: 'Taryn',     name: 'Taryn Crouthers',      email: 'taryn.crouthers@bigspaceship.com',   company: 'Big Spaceship' },
  { firstName: 'Raphael',   name: 'Raphael Bouquillon',   email: 'raphael.bouquillon@bigspaceship.com',company: 'Big Spaceship' },
  { firstName: 'Marina',    name: 'Marina Hidalgo',       email: 'marina.hidalgo@thegateworldwide.com',company: 'The Gate London' },
  { firstName: 'Darryl',    name: 'Darryl Newton',        email: 'darryl.newton@m3labs.global',        company: 'M3 Labs' },
  { firstName: 'Matt',      name: 'Matt Williams',        email: 'matt.williams@smarts.agency',        company: 'Smarts' },
  { firstName: 'Nat',       name: 'Nat Moores',           email: 'nat.moores@smarts.agency',           company: 'Smarts' },
  { firstName: 'Eric',      name: 'Eric Stoll',           email: 'eric.stoll@msqpartners.com',         company: 'MSQ DX Americas' },
  { firstName: 'Elliott',   name: 'Elliott Brown',        email: 'elliott.brown@msqpartners.com',      company: 'MSQ DX Americas' },
  { firstName: 'Jessica',   name: 'Jessica Quiroga',      email: 'jessica.quiroga@msqpartners.com',    company: 'MSQ DX Americas' },
  { firstName: 'Devon',     name: 'Devon Foley',          email: 'devon.foley@steinias.com',           company: 'Stein' },
];

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const c of contacts) {
    try {
      const message: any = {
        subject: `Indvstry Power House, Cannes Lions 2026 — 21 festival passes + villa activation`,
        body: { contentType: 'HTML', content: buildHtml(buildBody(c.firstName, c.company)) },
        toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
        from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
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
      sent++;
      console.log(`[${sent}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }
    await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent}/${contacts.length} sent.`);

  console.log('\n--- LINKEDIN OUTREACH REQUIRED (no reliable email) ---');
  console.log('Neal Mohan          — https://www.linkedin.com/in/nealmohan/');
  console.log('Bowen Yang          — https://www.linkedin.com/in/bowenyang/');
  console.log('Ilona Maher         — https://www.linkedin.com/in/ilona-maher-27a371131/');
  console.log('Gabby Logan OBE     — https://www.linkedin.com/in/gabby-logan-obe-3b2a0918/');
  console.log('Eleanor Lloyd Malcolm — https://www.linkedin.com/in/eleanorlloydmalcolm/');
  console.log('Adam Rowles         — https://www.linkedin.com/in/adamrowles/');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
