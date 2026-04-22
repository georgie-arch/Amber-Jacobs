/**
 * send-msq-cannes-invites.ts
 *
 * Researches email addresses for the people shown on the MSQ Cannes page,
 * then invites them to Indvstry Power House and Diaspora Dinner.
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/send-msq-cannes-invites.ts
 *
 * Dry run:
 *   DRY_RUN=true npx ts-node --project tsconfig.json src/scripts/send-msq-cannes-invites.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { findEmailMultiProvider } from '../integrations/email-enrichment';

dotenv.config();

interface Target {
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  company: string;
  domain: string;
  knownEmail?: string;
}

interface SendResult {
  fullName: string;
  company: string;
  title: string;
  domain: string;
  email: string | null;
  source: string;
  verified: boolean;
  status: 'sent' | 'skipped_no_email' | 'failed_send';
}

const POWERHOUSE_SITE = 'https://powerhouse.indvstryclvb.com';
const DIASPORA_DINNER_DATE = 'June 23';
const DIASPORA_DINNER_LOCATION = 'Epi Beach';
const OUTPUT_JSON = path.resolve(__dirname, '../data/msq-cannes-invite-results.json');
const OUTPUT_CSV = path.resolve(__dirname, '../data/msq-cannes-invite-results.csv');

const targets: Target[] = [
  { firstName: 'Peter', lastName: 'Reid', fullName: 'Peter Reid', title: 'Global CEO', company: 'MSQ', domain: 'msqpartners.com' },
  { firstName: 'Kate', lastName: 'Howe', fullName: 'Kate Howe', title: 'Executive Director', company: 'MSQ', domain: 'msqpartners.com' },
  { firstName: 'Bart', lastName: 'Michels', fullName: 'Bart Michels', title: 'Executive Director', company: 'MSQ', domain: 'msqpartners.com' },
  { firstName: 'Joanna', lastName: 'Lyall', fullName: 'Joanna Lyall', title: 'Executive Director', company: 'MSQ', domain: 'msqpartners.com' },
  { firstName: 'Ben', lastName: 'Rudman', fullName: 'Ben Rudman', title: 'Executive Director', company: 'MSQ', domain: 'msqpartners.com' },
  { firstName: 'Aaron', lastName: 'Lang', fullName: 'Aaron Lang', title: 'President, MSQ NA', company: 'MSQ', domain: 'msqpartners.com' },
  { firstName: 'Justin', lastName: 'Cox', fullName: 'Justin Cox', title: 'Chief Strategy Officer, MSQ NA', company: 'MSQ', domain: 'msqpartners.com' },
  { firstName: 'Kate', lastName: 'MacNevin', fullName: 'Kate MacNevin', title: 'Chair, MSQ B2B, CEO', company: 'Stein', domain: 'steinias.com' },
  { firstName: 'Tamsin', lastName: 'James', fullName: 'Tamsin James', title: 'Global Chief Marketing Officer', company: 'MSQ', domain: 'msqpartners.com', knownEmail: 'tamsin.james@msqpartners.com' },
  { firstName: 'Fergus', lastName: 'Dyer Smith', fullName: 'Fergus Dyer Smith', title: 'Global Chief Product Officer', company: 'MSQ', domain: 'msqpartners.com', knownEmail: 'fergus.dyersmith@msqpartners.com' },
  { firstName: 'Tom', lastName: 'Stein', fullName: 'Tom Stein', title: 'Chair & Chief Brand Officer', company: 'Stein', domain: 'steinias.com', knownEmail: 'tom.stein@steinias.com' },
  { firstName: 'Jeremy', lastName: 'Davis', fullName: 'Jeremy Davis', title: 'President EMEA & APAC', company: 'Stein', domain: 'steinias.com', knownEmail: 'jeremy.davis@steinias.com' },
  { firstName: 'Taryn', lastName: 'Crouthers', fullName: 'Taryn Crouthers', title: 'CEO', company: 'Big Spaceship', domain: 'bigspaceship.com' },
  { firstName: 'Raphael', lastName: 'Bouquillon', fullName: 'Raphael Bouquillon', title: 'VP', company: 'Big Spaceship', domain: 'bigspaceship.com' },
  { firstName: 'Eleanor', lastName: 'Lloyd Malcolm', fullName: 'Eleanor Lloyd Malcolm', title: 'CGO', company: 'Forge', domain: 'forgemsq.com' },
  { firstName: 'Adam', lastName: 'Rowles', fullName: 'Adam Rowles', title: 'Head of Bus Dev', company: 'Forge', domain: 'forgemsq.com' },
  { firstName: 'Helen', lastName: 'James', fullName: 'Helen James', title: 'CEO', company: 'The Gate London', domain: 'thegateworldwide.com' },
  { firstName: 'Stephen', lastName: 'Maher', fullName: 'Stephen Maher', title: 'Chair', company: 'The Gate London', domain: 'thegateworldwide.com', knownEmail: 'stephen.maher@thegateworldwide.com' },
  { firstName: 'Kit', lastName: 'Altin', fullName: 'Kit Altin', title: 'CSO', company: 'The Gate London', domain: 'thegateworldwide.com' },
  { firstName: 'Lucas', lastName: 'Peon', fullName: 'Lucas Peon', title: 'CCO', company: 'The Gate London', domain: 'thegateworldwide.com' },
  { firstName: 'Marina', lastName: 'Hidalgo', fullName: 'Marina Hidalgo', title: 'Growth Director', company: 'The Gate London', domain: 'thegateworldwide.com', knownEmail: 'marina.hidalgo@thegateworldwide.com' },
  { firstName: 'Darryl', lastName: 'Newton', fullName: 'Darryl Newton', title: 'CEO', company: 'M3 Labs', domain: 'm3.agency' },
  { firstName: 'Matt', lastName: 'Williams', fullName: 'Matt Williams', title: 'Global Marketing Director', company: 'Smarts', domain: 'smarts.agency' },
  { firstName: 'Nat', lastName: 'Moores', fullName: 'Nat Moores', title: 'Brand Futures Director', company: 'Smarts', domain: 'smarts.agency' },
  { firstName: 'Eric', lastName: 'Stoll', fullName: 'Eric Stoll', title: 'CEO, MSQ DX Americas', company: 'MSQ', domain: 'msqpartners.com', knownEmail: 'eric.stoll@msqpartners.com' },
  { firstName: 'Elliott', lastName: 'Brown', fullName: 'Elliott Brown', title: 'VP, Growth, MSQ DX Americas', company: 'MSQ', domain: 'msqpartners.com', knownEmail: 'elliott.brown@msqpartners.com' },
  { firstName: 'Jessica', lastName: 'Quiroga', fullName: 'Jessica Quiroga', title: 'Head of Marketing, MSQ DX Americas', company: 'MSQ', domain: 'msqpartners.com', knownEmail: 'jessica.quiroga@msqpartners.com' },
  { firstName: 'Devon', lastName: 'Foley', fullName: 'Devon Foley', title: 'Account Supervisor', company: 'Stein', domain: 'steinias.com', knownEmail: 'devon.foley@steinias.com' },
];

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
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
  return response.data.access_token;
}

function getLogoBase64(): string {
  try {
    return fs.readFileSync(
      path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')
    ).toString('base64');
  } catch {
    return '';
  }
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
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
  </div>
</body></html>`;
}

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  body: string
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: {
      emailAddress: {
        address: process.env.EMAIL_USER || '',
        name: 'Amber Jacobs',
      },
    },
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
}

function buildSubject(target: Target): string {
  return `Cannes 2026 - Indvstry Power House and Diaspora Dinner, ${target.firstName}`;
}

function buildBody(target: Target): string {
  return `Hi ${target.firstName},

I wanted to reach out because we are building something at Cannes Lions this June that I think would be genuinely relevant to the people MSQ is bringing to the Croisette.

Indvstry Power House is our private villa activation running alongside the festival - a curated space for senior leaders across creativity, media, technology and culture. It is built around the kind of closed-door conversations, dinners and introductions that do not happen in the usual Cannes flow.

Given your role as ${target.title} at ${target.company}, I would love to invite you to spend time with us at the Power House while you are in Cannes.

I would also love to have you at our Diaspora Dinner on ${DIASPORA_DINNER_DATE} at ${DIASPORA_DINNER_LOCATION}. It is one of the anchor moments of the week for us - a curated room of leaders across brand, agency, media, music and culture.

If useful, more on the Power House is here:
${POWERHOUSE_SITE}

If you are open to it, I can send over the details and make sure you are on the list for the dinner as well.

Amber
Indvstry Clvb`;
}

function writeOutputs(results: SendResult[]): void {
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2) + '\n');

  const escape = (value: string | boolean | null) =>
    `"${String(value ?? '').replace(/"/g, '""')}"`;

  const lines = [
    'Full Name,Company,Title,Domain,Email,Source,Verified,Status',
    ...results.map(result => [
      result.fullName,
      result.company,
      result.title,
      result.domain,
      result.email,
      result.source,
      result.verified,
      result.status,
    ].map(escape).join(',')),
  ];

  fs.writeFileSync(OUTPUT_CSV, lines.join('\n') + '\n');
}

async function main() {
  const dryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true';
  const token = dryRun ? '' : await getToken();
  const results: SendResult[] = [];

  console.log(`\nMSQ Cannes outreach${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(50));

  for (const target of targets) {
    console.log(`\n${target.fullName} — ${target.company}`);

    let email = target.knownEmail || null;
    let source = target.knownEmail ? 'known' : 'not_found';
    let verified = !!target.knownEmail;

    if (!email) {
      const enriched = await findEmailMultiProvider(target.firstName, target.lastName, target.domain);
      if (enriched) {
        email = enriched.email;
        source = enriched.source;
        verified = enriched.verified;
      }
    }

    if (!email) {
      console.log('  Skipped — no email found');
      results.push({
        fullName: target.fullName,
        company: target.company,
        title: target.title,
        domain: target.domain,
        email: null,
        source,
        verified,
        status: 'skipped_no_email',
      });
      continue;
    }

    const subject = buildSubject(target);
    const body = buildBody(target);

    try {
      if (dryRun) {
        console.log(`  DRY RUN — would send to ${email}`);
      } else {
        await sendEmail(token, email, target.fullName, subject, body);
        console.log(`  Sent to ${email}`);
      }

      results.push({
        fullName: target.fullName,
        company: target.company,
        title: target.title,
        domain: target.domain,
        email,
        source,
        verified,
        status: 'sent',
      });
    } catch (error: any) {
      console.log(`  Failed send — ${error.message}`);
      results.push({
        fullName: target.fullName,
        company: target.company,
        title: target.title,
        domain: target.domain,
        email,
        source,
        verified,
        status: 'failed_send',
      });
    }
  }

  writeOutputs(results);

  const sent = results.filter(r => r.status === 'sent').length;
  const skipped = results.filter(r => r.status === 'skipped_no_email').length;
  const failed = results.filter(r => r.status === 'failed_send').length;

  console.log('\nDone');
  console.log(`Sent: ${sent}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Results: ${OUTPUT_JSON}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
