/**
 * test-linkedin-drip.ts
 *
 * Quick smoke test for the LinkedIn drip engine.
 * Creates a fake test contact, enrolls them in a campaign,
 * then runs processDripQueue() to confirm the mechanics work.
 *
 * Set DRY_RUN=true (default) to preview without hitting LinkedIn.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/test-linkedin-drip.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import AmberAgent from '../agent/amber';
import { enrollInDrip, processDripQueue, getDripCampaignStatus, CAMPAIGNS } from '../tools/linkedin-drip';
import { logger } from '../utils/logger';

// Force dry-run unless explicitly overridden
if (!process.env.DRIP_LIVE) {
  process.env.DRY_RUN = 'true';
}

async function main() {
  console.log('\n🧪 LinkedIn Drip Engine — Test Run');
  console.log('━'.repeat(50));
  console.log(`Mode: ${process.env.DRIP_LIVE ? '🔴 LIVE' : '🟡 DRY RUN (no messages sent)'}\n`);

  // ─── 1. List available campaigns ─────────────────────────────
  console.log('📋 Available campaigns:');
  for (const [id, campaign] of Object.entries(CAMPAIGNS)) {
    console.log(`  • ${id} — ${campaign.name} (${campaign.steps.length} steps)`);
    for (const step of campaign.steps) {
      console.log(`      Step ${step.step}: ${step.action} (day +${step.delay_days}, condition: ${step.condition})`);
    }
  }
  console.log();

  // ─── 2. Init agent ───────────────────────────────────────────
  console.log('🤖 Initialising Amber agent...');
  const agent = new AmberAgent();
  console.log('✅ Agent ready\n');

  // ─── 3. Create a test contact ─────────────────────────────────
  const testContact = {
    id: 9999,
    first_name: 'Test',
    last_name: 'Contact',
    email: 'test@example.com',
    company: 'Test Corp',
    linkedin_url: 'https://www.linkedin.com/in/test-contact',
    source: 'linkedin' as const,
    status: 'lead' as const,
    score: 70,
    notes: 'Test contact for drip engine smoke test',
  };

  console.log(`👤 Test contact: ${testContact.first_name} ${testContact.last_name} @ ${testContact.company}`);
  console.log(`   LinkedIn: ${testContact.linkedin_url}\n`);

  // ─── 4. Enroll in campaign ────────────────────────────────────
  const campaignId = 'indvstry_clvb_outreach';
  console.log(`📥 Enrolling in campaign: ${campaignId}...`);

  try {
    await enrollInDrip(agent, testContact as any, campaignId);
    console.log('✅ Enrolled successfully\n');
  } catch (err: any) {
    console.error(`❌ Enrollment failed: ${err.message}`);
    process.exit(1);
  }

  // ─── 5. Check campaign status ─────────────────────────────────
  console.log('📊 Drip campaign status after enrollment:');
  try {
    const allStatus = getDripCampaignStatus(agent);
    const status = allStatus[campaignId] || { enrolled: 0, dueNow: 0, upcoming: 0 };
    console.log(`   Enrolled:  ${status.enrolled}`);
    console.log(`   Due now:   ${status.dueNow}`);
    console.log(`   Upcoming:  ${status.upcoming}\n`);
  } catch (err: any) {
    console.warn(`⚠️  Status check failed: ${err.message}\n`);
  }

  // ─── 6. Run the drip queue ────────────────────────────────────
  console.log('🔗 Running processDripQueue()...');
  try {
    await processDripQueue(agent);
    console.log('\n✅ Drip queue processed successfully');
  } catch (err: any) {
    console.error(`❌ processDripQueue failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }

  // ─── 7. Final status ──────────────────────────────────────────
  console.log('\n📊 Final campaign status:');
  try {
    const allStatus = getDripCampaignStatus(agent);
    const status = allStatus[campaignId] || { enrolled: 0, dueNow: 0, upcoming: 0 };
    console.log(`   Enrolled:  ${status.enrolled}`);
    console.log(`   Due now:   ${status.dueNow}`);
    console.log(`   Upcoming:  ${status.upcoming}`);
  } catch (err: any) {
    console.warn(`⚠️  Status check failed: ${err.message}`);
  }

  console.log('\n✅ Drip engine smoke test complete');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
