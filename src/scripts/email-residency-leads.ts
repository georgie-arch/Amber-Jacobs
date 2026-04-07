/**
 * email-residency-leads.ts
 *
 * Cold outreach to senior industry leads — inviting them to take a room
 * at the Indvstry Clvb Cannes villa (Indvstry Power House), June 2026.
 *
 * Each email is personalised to the recipient's company and role.
 * Hunter.io is used to find email addresses before sending.
 * If Hunter cannot find an address, the contact is logged as SKIPPED.
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/email-residency-leads.ts
 *
 * Dry run (no emails sent, just logs what would go):
 *   DRY_RUN=true npx ts-node --project tsconfig.json src/scripts/email-residency-leads.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { findEmailMultiProvider } from '../integrations/email-enrichment';

dotenv.config();

// ─── HELPERS ────────────────────────────────────────────────────────────────

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

// ─── LEAD DATA ───────────────────────────────────────────────────────────────

interface ResidencyLead {
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  company: string;
  domain: string;
  subject: string;
  body: string;
}

const leads: ResidencyLead[] = [
  {
    firstName: 'Mazviona',
    lastName: 'Madzima',
    fullName: 'Mazviona Madzima',
    title: 'Senior Strategic Partner Manager',
    company: 'YouTube',
    domain: 'google.com',
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
    title: 'MD Commercial',
    company: 'Arcade Media',
    domain: 'arcade.media',
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
    firstName: 'Gracie',
    lastName: 'Schram',
    fullName: 'Gracie Schram',
    title: 'Head of Strategic Creator Initiatives',
    company: 'Epidemic Sound',
    domain: 'epidemicsound.com',
    subject: 'Cannes Lions 2026 - a base worth having',
    body: `Hi Gracie,

I'm Amber, Community Manager at Indvstry Clvb.

We're putting together a curated villa residency at Cannes Lions this June - the Indvstry Power House. A private creative home base for a small number of senior people who want more from the week.

The creator economy conversation is one of the most interesting things happening at Cannes right now, and someone working on strategic creator initiatives at Epidemic Sound is exactly the kind of person we want in the room. The best conversations this week won't be on the Croisette - they'll be in spaces like this.

Still a few residency spots available. Happy to send more detail or jump on a call if it's of interest.

Amber
Indvstry Clvb`,
  },

  {
    firstName: 'Clare',
    lastName: 'Phillips',
    fullName: 'Clare Phillips',
    title: 'Social and Influencer Director',
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

  {
    firstName: 'Sydne',
    lastName: 'Mullings',
    fullName: 'Sydne Mullings',
    title: 'General Manager, Americas Central Marketing',
    company: 'Microsoft',
    domain: 'microsoft.com',
    subject: 'Cannes Lions 2026 - Power House residency + partnership',
    body: `Hi Sydne,

I'm Amber, Community Manager at Indvstry Clvb.

We're running the Indvstry Power House at Cannes Lions this June - a curated villa activation and residency for senior leaders in media, tech, and culture.

Two reasons I'm reaching out to you specifically.

First, we have a small number of residency spots for people who want a private, well-connected base for the week. Microsoft's presence at Cannes is always significant, and at GM level you'll know the meetings that matter rarely happen in the formal spaces. This is where they happen instead.

Second, we're talking to a small number of brand and platform partners about activating at the Power House. Given Microsoft's investment in the creative and marketing space, it felt like a natural conversation to have. The partnership opportunities are tailored - nothing off-the-shelf.

Happy to send over details on both, or jump on a quick call if either is of interest.

Amber
Indvstry Clvb`,
  },

  {
    firstName: 'Leon',
    lastName: 'Harlow',
    fullName: 'Leon Harlow',
    title: 'Commercial Director',
    company: 'YMU',
    domain: 'ymugroup.com',
    subject: 'Cannes Lions 2026 - a room at the Power House',
    body: `Hi Leon,

I'm Amber, Community Manager at Indvstry Clvb.

We're running a curated villa residency at Cannes Lions this June - the Indvstry Power House. A private space for a small number of senior people who want more from the week than the standard circuit.

YMU represents some of the biggest names in the industry, and the commercial conversations that matter at Cannes rarely happen in the formal spaces. We're putting together a room where the right connections happen without the usual noise.

A few spots still available. If Cannes is on the agenda, I'd love to tell you more.

Amber
Indvstry Clvb`,
  },

  {
    firstName: 'Jessica',
    lastName: 'Joseph',
    fullName: 'Jessica Joseph',
    title: 'Founder',
    company: 'Season25',
    domain: 'season25.com',
    subject: 'Cannes Lions 2026 - the Power House',
    body: `Hi Jessica,

I'm Amber, Community Manager at Indvstry Clvb.

We're running a curated villa residency at Cannes Lions this June - the Indvstry Power House. A private creative home base for a small group of founders and senior people who want to get more from the week.

Founders are the core of what Indvstry Clvb is built around - people who are building something, not just attending. Cannes can be genuinely valuable when you're in the right room with the right people, and that's exactly what we're creating.

A limited number of residency spots are available. Happy to tell you more if this is of interest.

Amber
Indvstry Clvb`,
  },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const dryRun = process.env.DRY_RUN === 'true';
  const skipped: string[] = [];

  console.log(`\n🏠 Indvstry Power House — residency lead outreach`);
  console.log(`   ${leads.length} leads | ${dryRun ? 'DRY RUN - no emails will be sent' : 'LIVE SEND'}\n`);

  const token = dryRun ? '' : await getToken();

  for (const lead of leads) {
    console.log(`\n→ ${lead.fullName} (${lead.title}, ${lead.company})`);

    // Find email via Hunter.io
    const enriched = await findEmailMultiProvider(lead.firstName, lead.lastName, lead.domain);

    if (!enriched?.email) {
      console.log(`  ⚠️  No email found — SKIPPED`);
      skipped.push(`${lead.fullName} @ ${lead.company} (domain: ${lead.domain})`);
      continue;
    }

    console.log(`  📧 ${enriched.email} (confidence: ${enriched.confidence}%, source: ${enriched.source})`);

    if (dryRun) {
      console.log(`  ✅ DRY RUN — would send: "${lead.subject}"`);
      continue;
    }

    try {
      await sendEmail(token, enriched.email, lead.fullName, lead.subject, lead.body);
      console.log(`  ✅ Sent`);
    } catch (err: any) {
      console.error(`  ❌ Failed: ${err?.response?.data?.error?.message || err.message}`);
    }

    // Pace sends
    if (leads.indexOf(lead) < leads.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  if (skipped.length > 0) {
    console.log(`\n⚠️  Skipped (no email found):`);
    skipped.forEach(s => console.log(`   - ${s}`));
    console.log(`\nTip: add emails manually or check Hunter.io for these contacts.`);
  }

  console.log(`\n✅ Done.\n`);
}

run().catch(console.error);
