#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────
// Indvstry Power House — Brand Partnership Outreach
// Targets CMOs / Heads of Marketing at key brands for Cannes Lions
// Run: npx ts-node src/scripts/iph-brand-outreach.ts
// ─────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailViaGraph } from '../integrations/email';
import { enrichContactEmail } from '../integrations/hunter';
import { logger } from '../utils/logger';

// ─── TARGET CONTACTS ─────────────────────────────────────────────

const TARGETS = [
  {
    firstName: 'Kenny',
    lastName: 'Mitchell',
    title: "SVP & Chief Marketing Officer, Levi's",
    company: "Levi's",
    domain: 'levistrauss.com',
    angle: 'culture',
  },
  {
    firstName: 'Kalysbek',
    lastName: 'Salmakbaev',
    title: 'Chief Marketing Officer',
    company: 'Shopify',
    domain: 'shopify.com',
    angle: 'commerce',
  },
  {
    firstName: 'Barrie',
    lastName: 'Gruner',
    title: 'EVP Marketing & Publicity',
    company: 'Hulu',
    domain: 'hulu.com',
    angle: 'entertainment',
  },
  {
    firstName: 'Andrea',
    lastName: 'Mallard',
    title: 'CMO, Microsoft AI',
    company: 'Microsoft',
    domain: 'microsoft.com',
    angle: 'technology',
  },
];

// ─── EMAIL COPY PER BRAND ANGLE ───────────────────────────────────

function buildEmail(target: typeof TARGETS[0]): { subject: string; body: string } {
  const { firstName, company, angle } = target;

  const subject = `Indvstry Power House x ${company} — Cannes Lions 2026`;

  let hook = '';
  let collab = '';

  if (angle === 'culture') {
    hook = `Levi's has always understood that the best marketing isn't done on a stage - it's done in rooms where the right people are already talking. That's exactly what the Indvstry Power House is built for.`;
    collab = `We'd love to explore what a ${company} activation at the villa could look like - whether that's a branded dinner, a curated mixer with the creative community, or something more bespoke that fits your Cannes calendar.`;
  } else if (angle === 'commerce') {
    hook = `Shopify has built its reputation by putting founders first. The Indvstry Power House at Cannes Lions is doing the same thing - bringing the people who are actually building things into a space designed for real conversations, not conference panels.`;
    collab = `There's a natural fit here - our community is full of founders, creators and independents who are exactly the people Shopify exists to serve. We'd love to explore what a partnership or branded session at the villa could look like.`;
  } else if (angle === 'entertainment') {
    hook = `Hulu is one of the most culturally tuned-in brands at Cannes. The Indvstry Power House is a space that runs at that same frequency - curated, creative, and built for the conversations that don't happen on the main stage.`;
    collab = `We think there's a strong case for Hulu to be part of this. Whether it's a branded evening, a content-led dinner, or a partnership around the week's programming - we're open to building something that works for your Cannes activation.`;
  } else if (angle === 'technology') {
    hook = `Microsoft AI is at the centre of the most important conversation in creativity right now. The Indvstry Power House at Cannes Lions is where the people having that conversation at the highest level are spending their week.`;
    collab = `We'd love to explore how Microsoft AI could be part of the villa - whether that's hosting a session, co-curating an event, or creating a moment that puts AI and creativity in the same room in the right way.`;
  }

  const body = `Hi ${firstName},

${hook}

The Power House is a private villa residence programme running 21-26 June during Cannes Lions - a curated week for senior creative leaders, founders and CMOs. Think intimate dinners, off-record conversations, and the kind of access that only happens when you take the right people out of the conference and put them somewhere they can actually connect.

${collab}

I'd love to get on a call and share more. If it's easier, here's the deck:
https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

Worth 20 minutes?

George Guise
Founder, Indvstry Clvb
https://calendly.com/itsvisionnaire/30min`;

  return { subject, body };
}

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Indvstry Power House — Brand Partnership Outreach');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let sent = 0;
  let failed = 0;

  for (const target of TARGETS) {
    console.log(`\nProcessing: ${target.firstName} ${target.lastName} @ ${target.company}`);

    // Try Hunter to find/verify email
    let email: string | null = null;
    const enriched = await enrichContactEmail(target.firstName, target.lastName, target.domain);

    if (enriched?.email) {
      email = enriched.email;
      console.log(`  Email found: ${email} (${enriched.source}, ${enriched.confidence}% confidence)`);
    } else {
      // Fall back to constructed email based on known domain patterns
      const fallbacks: Record<string, string> = {
        'levistrauss.com': `${target.lastName.toLowerCase()}.${target.firstName.charAt(0).toLowerCase()}@levistrauss.com`,
        'shopify.com': `${target.firstName.toLowerCase()}.${target.lastName.toLowerCase()}@shopify.com`,
        'hulu.com': `${target.firstName.toLowerCase()}.${target.lastName.toLowerCase()}@hulu.com`,
        'microsoft.com': `${target.firstName.toLowerCase()}.${target.lastName.toLowerCase()}@microsoft.com`,
      };
      email = fallbacks[target.domain] || null;
      if (email) {
        console.log(`  Hunter miss — using pattern fallback: ${email}`);
      } else {
        console.log(`  Could not determine email for ${target.firstName} — skipping`);
        failed++;
        continue;
      }
    }

    const { subject, body } = buildEmail(target);

    console.log(`\n  Subject: ${subject}`);
    console.log(`  To: ${email}`);
    console.log('  ---');
    console.log(body);
    console.log('  ---');

    const success = await sendEmailViaGraph(email, subject, body);

    if (success) {
      console.log(`  Sent successfully.`);
      sent++;
    } else {
      console.log(`  Send failed — check Outlook credentials / Graph API logs`);
      failed++;
    }

    // Brief pause between sends
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Done. Sent: ${sent} | Failed/skipped: ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  process.exit(0);
}

main().catch(err => {
  logger.error('Brand outreach failed:', err);
  process.exit(1);
});
