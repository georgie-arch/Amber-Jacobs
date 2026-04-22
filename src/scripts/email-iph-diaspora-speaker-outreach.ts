/**
 * email-iph-diaspora-speaker-outreach.ts
 *
 * Outreach to 16 senior media & advertising professionals identified from
 * a speaker/delegate card. Two-offer email:
 *   1. Indvstry Power House villa residency (21-26 Jun, if they're heading to Cannes)
 *   2. Diaspora Dinner — Tue 23 Jun 2026, 6-9pm — https://lu.ma/5vmr7s6f
 *
 * Phase 1: Hunter.io email enrichment (run with DRY_RUN=true to see results first)
 * Phase 2: Send via Outlook Graph API
 *
 * Run (dry):  DRY_RUN=true npx ts-node --project tsconfig.json src/scripts/email-iph-diaspora-speaker-outreach.ts
 * Run (live): npx ts-node --project tsconfig.json src/scripts/email-iph-diaspora-speaker-outreach.ts
 * Single:     SEND_ONLY=luis npx ts-node --project tsconfig.json src/scripts/email-iph-diaspora-speaker-outreach.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { enrichContactEmail } from '../integrations/hunter';

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

// ─── TARGET LIST ──────────────────────────────────────────────────

interface Target {
  key: string;
  firstName: string;
  lastName: string;
  company: string;
  companyDomain: string;
  title: string;
  email?: string; // pre-known or enriched
}

const targets: Target[] = [
  { key: 'luis',      firstName: 'Luis',      lastName: 'Caballero',  company: 'HUGE',             companyDomain: 'hugeinc.com',           title: 'Senior Vice President, Data',                          email: 'lcaballero@hugeinc.com' },
  { key: 'jc',        firstName: 'JC',        lastName: 'Conti',      company: 'VIOOH',            companyDomain: 'viooh.com',             title: 'CEO',                                                  email: 'jc.conti@viooh.com' },
  { key: 'scott',     firstName: 'Scott',     lastName: 'Ensign',     company: 'Butler/Till',      companyDomain: 'butlertill.com',        title: 'Chief Strategy Officer',                               email: 'scott.ensign@butlertill.com' },
  { key: 'amanda',    firstName: 'Amanda',    lastName: 'Grant',      company: 'WPP Media',        companyDomain: 'wppmedia.com',          title: 'EVP, Global Head of Data & Technology Partnerships',   email: 'amanda.grant@wppmedia.com' },
  { key: 'dave',      firstName: 'Dave',      lastName: 'Etherington', company: 'Place Exchange',  companyDomain: 'placeexchange.com',     title: 'Chief Commercial Officer',                             email: 'dave.etherington@placeexchange.com' },
  { key: 'stacey',    firstName: 'Stacey',    lastName: 'Jones',      company: 'Cognitiv',         companyDomain: 'cognitiv.ai',           title: 'Sr. Account Executive',                                email: 'stacey@cognitiv.ai' },
  { key: 'greg',      firstName: 'Greg',      lastName: 'Langer',     company: 'Havas Media Group', companyDomain: 'havasmedia.com',       title: 'VP, Programmatic Supply',                              email: 'greg.langer@havasmedia.com' },
  { key: 'jake',      firstName: 'Jake',      lastName: 'Lazarowitz', company: 'Digitas',          companyDomain: 'digitas.com',           title: 'VP, Media Investment',                                 email: 'jake.lazarowitz@digitas.com' },
  { key: 'ted',       firstName: 'Ted',       lastName: 'McNulty',    company: 'Addaptive',        companyDomain: 'addaptive.com',         title: 'VP, Sales',                                            email: 'ted.mcnulty@addaptive.com' },
  { key: 'seher',     firstName: 'Seher',     lastName: 'Nomani',     company: 'Affinity Global',  companyDomain: 'affinity.com',          title: 'VP, Advertiser Sales',                                 email: 'seher.nomani@affinity.com' },
  { key: 'emily',     firstName: 'Emily',     lastName: 'Proctor',    company: 'OMD',              companyDomain: 'omd.com',               title: 'Managing Director, Data & Technology Solutions',       email: 'emily.proctor@omd.com' },
  { key: 'glenniss',  firstName: 'Glenniss',  lastName: 'Richards',   company: 'Bayer',            companyDomain: 'bayer.com',             title: 'Senior Director, Digital Media Activation',            email: 'glenniss.richards@bayer.com' },
  { key: 'nav',       firstName: 'Nav',       lastName: 'Singh',      company: 'Horizon Media',    companyDomain: 'horizonmedia.com',      title: 'VP, Managing Director Programmatic',                   email: 'nav.singh@horizonmedia.com' },
  { key: 'casey',     firstName: 'Casey',     lastName: 'Squier',     company: 'Quantcast',        companyDomain: 'quantcast.com',         title: 'Head of Sales West',                                   email: 'casey.squier@quantcast.com' },
  { key: 'henry',     firstName: 'Henry',     lastName: 'Webster',    company: 'KSM Media',        companyDomain: 'ksmmedia.com',          title: 'VP, Director Analytics & Insight',                     email: 'hwebster@ksmmedia.com' },
  { key: 'ellie',     firstName: 'Ellie',     lastName: 'Uberto',     company: 'Duluth Trading',   companyDomain: 'duluthtrading.com',     title: 'Director, Marketing',                                  email: 'ellie.uberto@duluthtrading.com' },
];

// ─── EMAIL COPY ───────────────────────────────────────────────────

function buildBody(t: Target): string {
  return `Hi ${t.firstName},

I hope this finds you well. My name is Amber Jacobs, Community Manager at Indvstry Clvb.

I'm reaching out because we're heading to Cannes Lions 2026 with something a little different, and given your work at ${t.company} I thought you'd be the right person to tell about it.

We've secured a private villa for Indvstry Power House during Cannes Lions week (21-26 June) — a curated residency for senior creative and marketing leaders who want something more meaningful than the beach circuit. Think intimate conversations, a genuinely interesting mix of people across brand, media, and culture, and a week that actually moves something forward rather than just celebrating what already happened.

Two things I'd love to flag:

1. Villa residency (21-26 June) — if you're heading to Cannes and want to be part of the house, spots are extremely limited. Full details here: ${RESIDENCY}

2. Diaspora Dinner — Tuesday 23 June, 6-9pm. Our first event of the week, bringing together creative and marketing leaders from across the diaspora and the wider industry for an evening of real conversation. Registration is live: ${DIASPORA_DINNER}

More on the Power House overall: ${POWERHOUSE}

If either feels relevant, I'd love to connect — happy to jump on a quick call with our founder George: ${CALENDLY}

Are you heading to Cannes this year?`;
}

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.env.DRY_RUN === 'true';
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();

  const toProcess = sendOnly ? targets.filter(t => t.key === sendOnly) : targets;

  if (toProcess.length === 0) {
    console.log(`No target found for SEND_ONLY=${sendOnly}`);
    process.exit(1);
  }

  console.log(`\nPhase 1: Enriching emails for ${toProcess.length} targets...\n`);

  // Enrich emails
  const enriched: Array<Target & { resolvedEmail: string | null; confidence: number }> = [];

  for (const t of toProcess) {
    if (t.email) {
      enriched.push({ ...t, resolvedEmail: t.email, confidence: 100 });
      console.log(`  [pre-known] ${t.firstName} ${t.lastName} <${t.email}>`);
      continue;
    }

    const result = await enrichContactEmail(t.firstName, t.lastName, t.companyDomain);
    if (result) {
      enriched.push({ ...t, resolvedEmail: result.email, confidence: result.confidence });
      console.log(`  [${result.source}] ${t.firstName} ${t.lastName} <${result.email}> (${result.confidence}% confidence)`);
    } else {
      enriched.push({ ...t, resolvedEmail: null, confidence: 0 });
      console.log(`  [NOT FOUND] ${t.firstName} ${t.lastName} @ ${t.companyDomain}`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  const found = enriched.filter(e => e.resolvedEmail);
  const missing = enriched.filter(e => !e.resolvedEmail);

  console.log(`\nEnrichment complete: ${found.length} found, ${missing.length} not found`);
  if (missing.length > 0) {
    console.log('Not found:', missing.map(m => `${m.firstName} ${m.lastName} (${m.company})`).join(', '));
  }

  if (dryRun) {
    console.log('\nDRY_RUN=true — skipping send. Set DRY_RUN=false or remove to send.\n');
    console.log('Would send to:');
    found.forEach(e => console.log(`  ${e.firstName} ${e.lastName} <${e.resolvedEmail}> (${e.company})`));
    return;
  }

  console.log(`\nPhase 2: Sending ${found.length} emails...\n`);
  const token = await getToken();
  let sent = 0;

  for (let i = 0; i < found.length; i++) {
    const t = found[i];
    const body = buildBody(t);
    const subject = `Cannes 2026 — are you heading out this year, ${t.firstName}?`;

    try {
      await send(token, t.resolvedEmail!, `${t.firstName} ${t.lastName}`, subject, body);
      sent++;
      console.log(`  [${sent}/${found.length}] Sent to ${t.firstName} ${t.lastName} <${t.resolvedEmail}>`);
    } catch (err: any) {
      console.error(`  FAILED: ${t.firstName} ${t.lastName} <${t.resolvedEmail}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (i < found.length - 1) await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\nDone. ${sent}/${found.length} emails sent.`);
  if (missing.length > 0) {
    console.log(`\nStill need emails for: ${missing.map(m => `${m.firstName} ${m.lastName} (${m.company})`).join(', ')}`);
  }
}

main().catch(console.error);
