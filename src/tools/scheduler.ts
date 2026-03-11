import cron from 'node-cron';
import dotenv from 'dotenv';
import AmberAgent from '../agent/amber';
import { readUnrepliedEmails } from '../integrations/email';
import { processInstagramActivity } from '../integrations/instagram';
import { findCreativeLeads, processLinkedInLeads } from '../integrations/linkedin';
import { runMemberHealthCheck } from './member-manager';
import { logger } from '../utils/logger';

dotenv.config();

export function startScheduler(agent: AmberAgent): void {
  logger.info('⏰ Starting Amber\'s task scheduler...');

  // ─── EVERY 15 MINUTES: Check email inbox ─────────────────────
  cron.schedule('*/15 * * * *', async () => {
    logger.info('📧 Checking email inbox...');
    await readUnrepliedEmails(agent);
  });

  // ─── EVERY 30 MINUTES: Process Instagram activity ─────────────
  cron.schedule('*/30 * * * *', async () => {
    logger.info('📸 Checking Instagram...');
    await processInstagramActivity(agent);
  });

  // ─── EVERY HOUR: Process pending follow-ups ───────────────────
  cron.schedule('0 * * * *', async () => {
    logger.info('📋 Processing follow-ups...');
    const followUps = await agent.processPendingFollowUps();
    logger.info(`✅ Processed ${followUps.length} follow-ups`);
  });

  // ─── DAILY 9AM: LinkedIn lead discovery ──────────────────────
  cron.schedule('0 9 * * 1-5', async () => { // Weekdays only
    logger.info('🔍 Running LinkedIn lead discovery...');
    const leads = await findCreativeLeads({
      roles: ['creative director', 'designer', 'filmmaker', 'musician', 'founder'],
      location: 'London',
      maxResults: 10
    });
    await processLinkedInLeads(agent, leads);
    logger.info(`✅ LinkedIn: discovered ${leads.length} potential leads`);
  });

  // ─── DAILY 10AM: Member health check ─────────────────────────
  cron.schedule('0 10 * * *', async () => {
    await runMemberHealthCheck(agent);
  });

  // ─── EVERY MONDAY 8AM: Weekly summary to George ──────────────
  cron.schedule('0 8 * * 1', async () => {
    await sendWeeklySummaryToGeorge(agent);
  });

  logger.info('✅ Scheduler running. Amber is on duty.');
}

// ─── RUN ALL TASKS NOW (manual trigger) ──────────────────────────

export async function runAllTasksNow(agent: AmberAgent): Promise<void> {
  logger.info('🚀 Running all tasks now...');
  
  await readUnrepliedEmails(agent);
  await processInstagramActivity(agent);
  
  const followUps = await agent.processPendingFollowUps();
  logger.info(`✅ ${followUps.length} follow-ups processed`);
  
  logger.info('✅ All tasks complete');
}

// ─── WEEKLY SUMMARY ──────────────────────────────────────────────

async function sendWeeklySummaryToGeorge(agent: AmberAgent): Promise<void> {
  logger.info('📊 Generating weekly summary for George...');
  
  const memory = agent.getMemory();
  
  // This would compile stats from the database
  // New leads, new members, engagement metrics, etc.
  const summaryTask = `
Generate a brief weekly summary for George Guise (the founder).
Format it like a quick update from a team member, not a formal report.
Include: what happened this week with community growth, any notable conversations, leads in pipeline, and what's coming up.
Keep it tight — George is busy. Use bullet points. Start with the good stuff.
`;

  const response = await agent.generateResponse(summaryTask);
  
  if (process.env.FOUNDER_EMAIL) {
    const { sendEmail } = require('../integrations/email');
    await sendEmail(
      process.env.FOUNDER_EMAIL,
      'Amber\'s weekly update 📊',
      response.message
    );
  }
}

// ─── RUN IMMEDIATELY if called directly ──────────────────────────

if (process.argv.includes('--run-now')) {
  (async () => {
    const agent = new AmberAgent();
    await runAllTasksNow(agent);
    agent.close();
    process.exit(0);
  })();
}
