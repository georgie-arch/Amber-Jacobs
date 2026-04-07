#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────
// Indvstry Power House — CMO Outreach at Cannes Lions
// Targets senior marketing leaders who activate at Cannes
// Run: npm run powerhouse:outreach
// ─────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import AmberAgent from '../agent/amber';
import { setupDatabase } from '../database/migrations';
import { scrapeLinkedInProfiles, sendConnectionRequest, LinkedInProfile } from '../integrations/linkedin';
import { logger } from '../utils/logger';

// ─── Target search queries — CMOs activating at Cannes ───────────

const SEARCH_QUERIES = [
  'CMO Cannes Lions activation',
  'Chief Marketing Officer Cannes Lions',
  'CMO beach Cannes Lions festival',
  'VP Marketing Cannes Lions panel',
  'Chief Marketing Officer creative festival',
  'CMO brand activation Cannes',
  'Global CMO advertising Cannes',
  'Head of Marketing Cannes Lions speaker'
];

// ─── Powerhouse programme context ────────────────────────────────

const POWERHOUSE_CONTEXT = `
You are reaching out to a senior marketing leader (CMO or equivalent) who activates at Cannes Lions.

You are inviting them to the INDVSTRY POWER HOUSE — a brand new programme by Indvstry Clvb specifically for senior-level creatives and marketing leaders.

Key details about the Power House:
- It is a residence programme for senior creative leaders
- Exclusive, invite-only
- Designed for people operating at the highest level of the creative industry
- Link for more info: powerhouse.indvstryclvb.com

Tone: Direct, confident, peer-to-peer. You're not pitching to them — you're inviting them as an equal. They are exactly who this is built for. Be brief. No fluff. Make them feel seen and chosen.

LINKEDIN RULE: Address them by first name only. No self-introduction. No sign-off. Just the message.
`;

// ─── Find CMOs activating at Cannes ──────────────────────────────

async function findCannesCMOs(maxResults = 30): Promise<LinkedInProfile[]> {
  logger.info('🎯 Searching for CMOs activating at Cannes Lions...');
  const profiles: LinkedInProfile[] = [];

  for (const query of SEARCH_QUERIES.slice(0, 4)) {
    logger.info(`  Searching: "${query}"`);
    const results = await scrapeLinkedInProfiles(query, Math.ceil(maxResults / 4));
    profiles.push(...results);
    await sleep(3000);
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = profiles.filter(p => {
    if (!p.profileUrl || seen.has(p.profileUrl)) return false;
    seen.add(p.profileUrl);
    return true;
  });

  // Filter for senior titles
  const seniorTitles = ['cmo', 'chief marketing', 'vp marketing', 'vice president marketing', 'global head of marketing', 'head of marketing', 'marketing director', 'svp marketing'];
  const senior = unique.filter(p =>
    seniorTitles.some(t => p.headline.toLowerCase().includes(t))
  );

  logger.info(`Found ${unique.length} profiles, ${senior.length} are senior marketing leaders`);
  return senior.length > 0 ? senior : unique;
}

// ─── Draft and send outreach ──────────────────────────────────────

async function runPowerhouseOutreach(agent: AmberAgent): Promise<void> {
  const leads = await findCannesCMOs(30);

  logger.info(`\n🏛️  Starting Indvstry Power House outreach to ${leads.length} CMOs...\n`);

  let connected = 0;

  for (const lead of leads) {
    logger.info(`📋 ${lead.firstName} ${lead.lastName} — ${lead.headline} at ${lead.company}`);

    const contact = {
      first_name: lead.firstName,
      last_name: lead.lastName,
      linkedin_url: lead.profileUrl,
      company: lead.company,
      job_title: lead.headline,
      industry: lead.industry,
      source: 'powerhouse_cannes_outreach'
    };

    const context = `${POWERHOUSE_CONTEXT}

About this person:
- Name: ${lead.firstName} ${lead.lastName}
- Role: ${lead.headline}
- Company: ${lead.company}
- Location: ${lead.location}
${lead.about ? `- About them: "${lead.about.substring(0, 200)}"` : ''}

Reference their seniority and Cannes connection. Invite them to the Power House residence. Include the link: powerhouse.indvstryclvb.com`;

    const response = await agent.draftOutreach(contact, context, 'linkedin');

    console.log('\n─────────────────────────────────────────────');
    console.log(`TO: ${lead.firstName} ${lead.lastName} (${lead.headline})`);
    console.log('─────────────────────────────────────────────');
    console.log(response.message);
    console.log('─────────────────────────────────────────────\n');

    if (process.env.AUTO_SEND === 'true' && lead.profileUrl) {
      const note = response.message.substring(0, 300);
      const sent = await sendConnectionRequest(lead.profileUrl, note);
      if (sent) {
        connected++;
        logger.info(`✅ Connection request sent (${connected}/20)`);
      }
    } else {
      logger.info(`⏳ AUTO_SEND=false — message drafted above, set AUTO_SEND=true to send automatically`);
    }

    if (connected >= 20) {
      logger.warn('⚠️  Daily connection limit reached (20) — stopping');
      break;
    }

    await sleep(5000);
  }

  logger.info(`\n✅ Power House outreach complete — ${connected} connection requests sent`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏛️   Indvstry Power House — Cannes CMO Outreach');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  setupDatabase();
  const agent = new AmberAgent();

  await runPowerhouseOutreach(agent);

  agent.close();
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

main().catch(err => {
  logger.error('Powerhouse outreach failed:', err);
  process.exit(1);
});
