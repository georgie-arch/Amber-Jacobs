/**
 * email-iph-gate-msq-smarts-outreach.ts
 *
 * IPH outreach to 12 contacts from The Gate London, M3 Labs, Smarts,
 * MSQ DX Americas and Stein — inviting them to Indvstry Power House at
 * Cannes Lions 2026 (21-26 Jun), with a secondary mention of the
 * Diaspora Dinner on 23 Jun.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-iph-gate-msq-smarts-outreach.ts
 * Single: SEND_ONLY=helen npx ts-node --project tsconfig.json src/scripts/email-iph-gate-msq-smarts-outreach.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ─── OUTLOOK AUTH ─────────────────────────────────────────────────

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

// ─── HTML BUILDER ─────────────────────────────────────────────────

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
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function send(token: string, to: string, toName: string, subject: string, body: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
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
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── CONSTANTS ────────────────────────────────────────────────────

const POWERHOUSE = 'https://powerhouse.indvstryclvb.com';
const DIASPORA_DINNER = 'https://lu.ma/5vmr7s6f';
const RESIDENCY = 'https://lu.ma/t4ek2yn7';
const CALENDLY = 'https://calendly.com/itsvisionnaire/30min';

// ─── RECIPIENTS ───────────────────────────────────────────────────

interface Recipient {
  key: string;
  name: string;
  firstName: string;
  company: string;
  title: string;
  email: string;
}

const recipients: Recipient[] = [
  // The Gate London
  { key: 'helen',    name: 'Helen James',    firstName: 'Helen',    company: 'The Gate London', title: 'CEO',             email: 'helen.james@thegateworldwide.com' },
  { key: 'stephen',  name: 'Stephen Maher',  firstName: 'Stephen',  company: 'The Gate London', title: 'Chair',           email: 'stephen.maher@thegateworldwide.com' },
  { key: 'kit',      name: 'Kit Altin',       firstName: 'Kit',      company: 'The Gate London', title: 'CSO',             email: 'kit.altin@thegateworldwide.com' },
  { key: 'lucas',    name: 'Lucas Peon',      firstName: 'Lucas',    company: 'The Gate London', title: 'CCO',             email: 'lucas.peon@thegateworldwide.com' },
  { key: 'marina',   name: 'Marina Hidalgo',  firstName: 'Marina',   company: 'The Gate London', title: 'Growth Director', email: 'marina.hidalgo@thegateworldwide.com' },
  // M3 Labs
  { key: 'darryl',   name: 'Darryl Newton',   firstName: 'Darryl',   company: 'M3 Labs',         title: 'CEO',             email: 'darryl.newton@m3labs.global' },
  // Smarts
  { key: 'matt',     name: 'Matt Williams',   firstName: 'Matt',     company: 'Smarts',          title: 'Global Marketing Director', email: 'matt.williams@smarts.agency' },
  { key: 'nat',      name: 'Nat Moores',      firstName: 'Nat',      company: 'Smarts',          title: 'Brand Futures Director',    email: 'nat.moores@smarts.agency' },
  // MSQ DX Americas
  { key: 'eric',     name: 'Eric Stoll',      firstName: 'Eric',     company: 'MSQ DX Americas', title: 'CEO',             email: 'eric.stoll@msqpartners.com' },
  { key: 'elliott',  name: 'Elliott Brown',   firstName: 'Elliott',  company: 'MSQ DX Americas', title: 'VP, Growth',      email: 'elliott.brown@msqpartners.com' },
  { key: 'jessica',  name: 'Jessica Quiroga', firstName: 'Jessica',  company: 'MSQ DX Americas', title: 'Head of Marketing', email: 'jquiroga@arke.com' },
  // Stein
  { key: 'devon',    name: 'Devon Foley',     firstName: 'Devon',    company: 'Stein',           title: 'Account Supervisor', email: 'devon.foley@steinias.com' },
];

// ─── EMAIL COPY ───────────────────────────────────────────────────

function buildBody(r: Recipient): string {
  return `Hi ${r.firstName},

I hope you're well. My name is Amber Jacobs, Community Manager at Indvstry Clvb.

I'm reaching out because we're taking Indvstry Power House to Cannes Lions 2026, and given your work at ${r.company} I wanted to make sure you heard about it directly.

We've secured a private villa for the full Cannes Lions week (21-26 June) — a curated residency for senior creative, media and marketing leaders who want something more meaningful than the standard festival circuit. Intimate conversations, genuinely interesting people across brand, agency and culture, and a week designed to actually move something forward.

If you're heading to Cannes this year, I'd love to get you on the radar:

Villa residency (21-26 June) — spots are very limited: ${RESIDENCY}

We're also hosting the Diaspora Dinner on Tuesday 23 June, 6-9pm — our first event of the week, bringing together creative and cultural leaders for an evening of real conversation. Open to all: ${DIASPORA_DINNER}

More on Indvstry Power House: ${POWERHOUSE}

Happy to connect you with our founder George for a quick call if either feels right: ${CALENDLY}

Are you heading to Cannes this year?`;
}

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();
  const toSend = sendOnly ? recipients.filter(r => r.key === sendOnly) : recipients;

  if (toSend.length === 0) {
    console.log(`No recipient found for SEND_ONLY=${sendOnly}`);
    process.exit(1);
  }

  console.log(`\nSending ${toSend.length} IPH invite emails...\n`);
  const token = await getToken();
  let sent = 0;

  for (let i = 0; i < toSend.length; i++) {
    const r = toSend[i];
    const subject = `Cannes 2026 — are you heading out this year, ${r.firstName}?`;
    const body = buildBody(r);

    try {
      await send(token, r.email, r.name, subject, body);
      sent++;
      console.log(`  [${sent}/${toSend.length}] Sent to ${r.name} <${r.email}>`);
    } catch (err: any) {
      console.error(`  FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (i < toSend.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log(`\nDone. ${sent}/${toSend.length} emails sent.`);
}

main().catch(console.error);
