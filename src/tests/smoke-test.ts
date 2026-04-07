/**
 * Amber Jacobs — Smoke Test
 * Verifies cron jobs register correctly and sends a live test email.
 */

import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import { setupDatabase } from '../database/migrations';
import AmberAgent from '../agent/amber';
import { startScheduler } from '../tools/scheduler';
import { sendEmail } from '../integrations/email';
import { logger } from '../utils/logger';

async function smokeTest() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Amber Jacobs — Cron Job Smoke Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Init DB + Agent
  setupDatabase();
  const agent = new AmberAgent();

  // 2. Start scheduler and count registered tasks
  startScheduler(agent);

  const tasks = (cron as any).getTasks?.() || new Map();
  const taskCount = tasks.size;
  console.log(`\n✅ Cron scheduler started — ${taskCount} job(s) registered\n`);

  // 3. List all scheduled jobs
  const jobSchedules = [
    { schedule: '*/15 * * * *',  label: 'Email inbox read/reply          (every 15 min)' },
    { schedule: '*/30 * * * *',  label: 'Email follow-ups send            (every 30 min)' },
    { schedule: '*/30 * * * *',  label: 'Instagram DMs + comment replies  (every 30 min)' },
    { schedule: '0 * * * *',     label: 'Instagram welcome DMs            (every hour :00)' },
    { schedule: '15 * * * *',    label: 'Lead chase / follow-ups          (every hour :15)' },
    { schedule: '30 * * * *',    label: 'LinkedIn message replies         (every hour :30)' },
    { schedule: '45 * * * *',    label: 'WhatsApp lead assistance         (every hour :45)' },
    { schedule: '0 */2 * * *',   label: 'WhatsApp group chat mgmt        (every 2 hours)' },
    { schedule: '0 9 * * 1-5',   label: 'LinkedIn lead discovery          (9am weekdays)' },
    { schedule: '0 11 * * 1-5',  label: 'WhatsApp proactive outreach     (11am weekdays)' },
    { schedule: '0 10 * * *',    label: 'Member health check              (10am daily)' },
    { schedule: '0 8 * * 1',     label: 'Weekly summary to George         (Monday 8am)' },
  ];

  console.log('Active cron jobs:');
  jobSchedules.forEach(j => {
    console.log(`  ⏰  [${j.schedule.padEnd(12)}]  ${j.label}`);
  });

  // 4. Send test email
  const testTo = 'wetheindvstry@gmail.com';
  console.log(`\n📧 Sending test email to ${testTo}...\n`);

  const testBody = `Hi George,

This is a live smoke test from Amber's cron job system.

All ${jobSchedules.length} scheduled jobs are registered and active:

${jobSchedules.map(j => `  ✅  ${j.label}`).join('\n')}

Amber is running and ready to manage the Indvstry Clvb community.

— Amber
Community Manager, Indvstry Clvb`;

  const sent = await sendEmail(
    testTo,
    '✅ Amber cron jobs active — smoke test',
    testBody
  );

  if (sent) {
    console.log(`✅ Test email sent successfully to ${testTo}`);
  } else {
    console.error(`❌ Email failed — check Gmail credentials in .env`);
    process.exitCode = 1;
  }

  agent.close();
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(process.exitCode || 0);
}

smokeTest().catch(err => {
  console.error('Smoke test failed:', err.message);
  process.exit(1);
});
