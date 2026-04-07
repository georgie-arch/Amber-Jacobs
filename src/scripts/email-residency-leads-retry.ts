/**
 * email-residency-leads-retry.ts
 *
 * Retry send for the 3 leads skipped in the first run due to domain issues.
 *
 * Fixes applied:
 *   Mazviona Madzima  — domain corrected to youtube.com
 *   Joe Lamb          — domain corrected to wearearcade.co.uk
 *   Clare Phillips    — domain kept adobe.com (Snov async retry)
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/email-residency-leads-retry.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { findEmailMultiProvider } from '../integrations/email-enrichment';

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
    return fs.readFileSync(
      path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')
    ).toString('base64');
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
}

// ─── LEADS ───────────────────────────────────────────────────────────────────

const leads = [
  {
    firstName: 'Mazviona',
    lastName: 'Madzima',
    fullName: 'Mazviona Madzima',
    company: 'YouTube',
    domain: 'youtube.com',
    subject: 'Cannes Lions 2026 - a room worth having',
    body: `Hi Mazviona,

I'm Amber, Community Manager at Indvstry Clvb.

We're running a curated villa residency at Cannes Lions this June - the Indvstry Power House. It's a private creative home base for a small group of senior people who want more from Cannes than the beach parties and badge queues.

YouTube's presence at Cannes is always significant, and the conversations that actually move things forward tend to happen in the rooms you choose to be in. This is one of those rooms.

A limited number of residency spots are available. No formal agenda, no brand activations you didn't ask for. Just the right people, the right space, the right week.

If this sounds like your kind of Cannes, I'd love to tell you more. Happy to jump on a quick call or send over the details.

Amber
Indvstry Clvb`,
  },
  {
    firstName: 'Joe',
    lastName: 'Lamb',
    fullName: 'Joe Lamb',
    company: 'Arcade',
    domain: 'wearearcade.co.uk',
    subject: 'Cannes Lions 2026 - residency at the Power House',
    body: `Hi Joe,

I'm Amber, Community Manager at Indvstry Clvb.

We're building a curated villa residency at Cannes Lions this June - the Indvstry Power House. A private base for a small group of senior people who want to get more out of the week than the standard circuit.

At MD level in a commercial role, Cannes is as much about who you spend the week with as what you attend. We're bringing together the kind of people where those conversations happen naturally - no panels, no pitch decks, just the right environment and the right company.

A few residency spots are still available. If Cannes is on your radar this year, worth a quick conversation.

Amber
Indvstry Clvb`,
  },
  {
    firstName: 'Clare',
    lastName: 'Phillips',
    fullName: 'Clare Phillips',
    company: 'Adobe',
    domain: 'adobe.com',
    subject: 'Cannes Lions 2026 - the Power House residency',
    body: `Hi Clare,

I'm Amber, Community Manager at Indvstry Clvb.

We're running a curated villa residency at Cannes Lions this June - the Indvstry Power House. A small, private base for senior people who want a different kind of Cannes week.

Adobe is always one of the strongest presences at Cannes, and Social and Influencer at director level is right at the heart of where the industry is going. We're bringing together people who are actually driving that conversation, not just attending it.

A limited number of spots are available. If this year's Cannes is on your radar, worth a quick conversation.

Amber
Indvstry Clvb`,
  },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const skipped: string[] = [];
  console.log(`\n🔁 Residency leads — retry send (3 leads)\n`);

  const token = await getToken();

  for (const lead of leads) {
    console.log(`\n→ ${lead.fullName} (${lead.company}) — domain: ${lead.domain}`);

    const enriched = await findEmailMultiProvider(lead.firstName, lead.lastName, lead.domain);

    if (!enriched?.email) {
      console.log(`  ⚠️  No email found — SKIPPED`);
      skipped.push(`${lead.fullName} @ ${lead.company}`);
      continue;
    }

    console.log(`  📧 ${enriched.email} (confidence: ${enriched.confidence}%, source: ${enriched.source})`);

    try {
      await sendEmail(token, enriched.email, lead.fullName, lead.subject, lead.body);
      console.log(`  ✅ Sent`);
    } catch (err: any) {
      console.error(`  ❌ Failed: ${err?.response?.data?.error?.message || err.message}`);
    }

    if (leads.indexOf(lead) < leads.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  if (skipped.length > 0) {
    console.log(`\n⚠️  Still skipped:\n${skipped.map(s => `   - ${s}`).join('\n')}`);
  } else {
    console.log(`\n✅ All 3 sent.`);
  }
}

run().catch(console.error);
