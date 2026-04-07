import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import AmberAgent from '../agent/amber';
import { readUnrepliedEmails, sendPendingEmailFollowUps } from '../integrations/email';
import { processInstagramActivity, sendInstagramWelcomeDMs } from '../integrations/instagram';
import { findCreativeLeads, processLinkedInLeads, replyToLinkedInMessages } from '../integrations/linkedin';
import { processWhatsAppLeads, manageGroupChat, sendProactiveWhatsAppOutreach } from '../integrations/whatsapp';
import { runMemberHealthCheck } from './member-manager';
import { sendEmail } from '../integrations/email';
import { runAndAlertHealthCheck } from '../utils/alerting';
import { processDripQueue } from './linkedin-drip';
import { logger } from '../utils/logger';

dotenv.config();

export function startScheduler(agent: AmberAgent): void {
  logger.info('⏰ Starting Amber\'s task scheduler...');

  // ─── EVERY 15 MINUTES: Read & reply to emails ────────────────
  cron.schedule('*/15 * * * *', async () => {
    logger.info('📧 Checking email inbox...');
    await readUnrepliedEmails(agent);
  });

  // ─── EVERY 30 MINUTES: Send queued email follow-ups ──────────
  cron.schedule('*/30 * * * *', async () => {
    logger.info('📨 Sending pending email follow-ups...');
    await sendPendingEmailFollowUps(agent);
  });

  // ─── EVERY 30 MINUTES: Instagram DMs + comment replies ───────
  cron.schedule('*/30 * * * *', async () => {
    logger.info('📸 Checking Instagram activity...');
    await processInstagramActivity(agent);
  });

  // ─── EVERY HOUR: Instagram welcome DMs for new followers ─────
  cron.schedule('0 * * * *', async () => {
    logger.info('👋 Sending Instagram welcome DMs...');
    await sendInstagramWelcomeDMs(agent);
  });

  // ─── EVERY HOUR: Chase leads via pending follow-ups ──────────
  cron.schedule('15 * * * *', async () => {
    logger.info('📋 Chasing leads — processing pending follow-ups...');
    await agent.processPendingFollowUps();
  });

  // ─── EVERY HOUR: Reply to LinkedIn messages ───────────────────
  cron.schedule('30 * * * *', async () => {
    logger.info('💼 Checking LinkedIn messages...');
    await replyToLinkedInMessages(agent);
  });

  // ─── EVERY HOUR: LinkedIn drip sequence engine ───────────────
  cron.schedule('50 * * * *', async () => {
    logger.info('🔗 Processing LinkedIn drip queue...');
    await processDripQueue(agent);
  });

  // ─── EVERY HOUR: WhatsApp lead assistance ────────────────────
  cron.schedule('45 * * * *', async () => {
    logger.info('📱 Assisting WhatsApp leads...');
    await processWhatsAppLeads(agent);
  });

  // ─── EVERY 2 HOURS: WhatsApp group chat management ───────────
  cron.schedule('0 */2 * * *', async () => {
    logger.info('💬 Managing WhatsApp group chat...');
    await manageGroupChat(agent);
  });

  // ─── DAILY 9AM (weekdays): LinkedIn lead discovery ───────────
  cron.schedule('0 9 * * 1-5', async () => {
    logger.info('🔍 Running LinkedIn lead discovery...');
    const leads = await findCreativeLeads({
      roles: ['creative director', 'designer', 'filmmaker', 'musician', 'founder', 'photographer'],
      location: 'London',
      maxResults: 15
    });
    await processLinkedInLeads(agent, leads);
    logger.info(`✅ LinkedIn: discovered ${leads.length} potential leads`);
  });

  // ─── DAILY 11AM (weekdays): Proactive WhatsApp outreach ──────
  cron.schedule('0 11 * * 1-5', async () => {
    logger.info('📤 Sending proactive WhatsApp outreach...');
    await sendProactiveWhatsAppOutreach(agent);
  });

  // ─── DAILY 10AM: Member health check ─────────────────────────
  cron.schedule('0 10 * * *', async () => {
    await runMemberHealthCheck(agent);
  });

  // ─── EVERY MONDAY 8AM: Weekly summary to George ──────────────
  cron.schedule('0 8 * * 1', async () => {
    await sendWeeklySummaryToGeorge(agent);
  });

  // ─── DAILY 7AM: Service health check + alert George if issues ─
  cron.schedule('0 7 * * *', async () => {
    await runAndAlertHealthCheck();
  });

  // ─── DAILY 10AM: Sponsor outreach batch (50/day) ──────────────
  cron.schedule('0 10 * * *', async () => {
    logger.info('📨 Running daily sponsor outreach batch...');
    await runSponsorOutreachBatch();
  });

  // ─── DAILY 8AM: Power House outreach reply tracker ───────────────
  cron.schedule('0 8 * * *', async () => {
    logger.info('🔍 Checking Power House outreach replies...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/check-powerhouse-replies.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8' }
      );
    } catch (err: any) { logger.error('Reply check failed:', err.message); }
  });

  // ─── TUESDAY 24 MAR 2026: POWER HOUSE OUTREACH — 17 BRANDS ──────
  // Staggered by recipient timezone. All land at 10am local time.
  // EU (CET=UTC+1): Ben Skinazi/Equativ, Damian Bradfield/WeTransfer → 09:00 UTC
  // UK (GMT=UTC+0):  Laurent Ezekiel/WPP, Orson Francescone/FT       → 10:00 UTC
  // US EDT (UTC-4):  Everyone NYC-based                                → 14:00 UTC
  // US PDT (UTC-7):  Anjali Sud/Tubi, Claire Paull/Amazon             → 17:00 UTC

  const OUTREACH = path.resolve(__dirname, '../scripts/email-cannes-powerhouse-outreach.ts');
  const runOutreach = (key: string) => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${OUTREACH}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: key } }
      );
      logger.info(`✅ Outreach sent: ${key}`);
    } catch (err: any) { logger.error(`Outreach failed (${key}):`, err.message); }
  };

  // 09:00 UTC — EU contacts (10am CET)
  cron.schedule('0 9 * * 2', async () => {
    ['ben', 'damian'].forEach(runOutreach);
  });

  // 10:00 UTC — London contacts (10am GMT)
  cron.schedule('0 10 * * 2', async () => {
    ['laurent', 'orson'].forEach(runOutreach);
  });

  // 13:00 UTC — US EDT stagger 1 (9am EDT — early risers)
  cron.schedule('0 13 * * 2', async () => {
    ['marc_p', 'raja'].forEach(runOutreach);  // Marc Pritchard / Raja Rajamannar
  });

  // 14:00 UTC — US EDT stagger 2 (10am EDT — main batch)
  cron.schedule('0 14 * * 2', async () => {
    ['javier', 'elizabeth', 'diana', 'mike', 'matt', 'sofia', 'marc_s', 'rob', 'carleigh'].forEach(runOutreach);
  });

  // 17:00 UTC — US PDT (10am Pacific — Tubi/Amazon)
  cron.schedule('0 17 * * 2', async () => {
    ['anjali', 'claire'].forEach(runOutreach);
  });

  // ─── TUESDAY 24 MAR 2026: CANNES PARTNER OUTREACH BATCH ──────────
  // 5 personalised Power House panel pitches — staggered every 30 min
  // Shannon Montoya/Yahoo (NY, EST-4):   10am EDT = 14:00 UTC
  // Beth Sidhu/Stagwell (NY, EST-4):     10am EDT = 14:30 UTC
  // James Rooke/FreeWheel (NY, EST-4):   10am EDT = 15:00 UTC
  // Jeremy Miller/Dentsu (London, UTC):  10am GMT  = 10:00 UTC
  // Charlotte Rambaud/Havas (Paris,CET): 10am CET  = 09:30 UTC

  cron.schedule('0 10 * * 2', async () => {  // Jeremy Miller / Dentsu (10:00 UTC = 10am London)
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Sending Jeremy Miller / Dentsu outreach...');
    const { execSync } = require('child_process');
    try {
      execSync(`npx ts-node --project tsconfig.json -e "
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
// Run only Jeremy Miller
" 2>&1`, { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8' });
    } catch {}
    // Run the full batch — each send is independent
    try {
      execSync(
        `SEND_ONLY=jeremy npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/email-cannes-partners-batch.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: 'jeremy' } }
      );
    } catch (err: any) { logger.error('Jeremy Miller email failed:', err.message); }
  });

  cron.schedule('30 9 * * 2', async () => {  // Charlotte Rambaud / Havas (09:30 UTC = 10am Paris)
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Sending Charlotte Rambaud / Havas outreach...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/email-cannes-partners-batch.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: 'charlotte' } }
      );
    } catch (err: any) { logger.error('Charlotte Rambaud email failed:', err.message); }
  });

  cron.schedule('0 14 * * 2', async () => {  // Shannon Montoya / Yahoo (14:00 UTC = 10am EDT)
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Sending Shannon Montoya / Yahoo outreach...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/email-cannes-partners-batch.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: 'shannon' } }
      );
    } catch (err: any) { logger.error('Shannon Montoya email failed:', err.message); }
  });

  cron.schedule('30 14 * * 2', async () => {  // Beth Sidhu / Stagwell (14:30 UTC = 10:30am EDT)
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Sending Beth Sidhu / Stagwell outreach...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/email-cannes-partners-batch.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: 'beth' } }
      );
    } catch (err: any) { logger.error('Beth Sidhu email failed:', err.message); }
  });

  cron.schedule('0 15 * * 2', async () => {  // James Rooke / FreeWheel (15:00 UTC = 11am EDT)
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Sending James Rooke / FreeWheel outreach...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/email-cannes-partners-batch.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: 'james' } }
      );
    } catch (err: any) { logger.error('James Rooke email failed:', err.message); }
  });

  // ─── TUESDAY 24 MAR 2026 10AM CET (09:00 UTC): Dimi Albers / DEPT ───
  // Cannes Power House panel pitch to DEPT Global CEO
  cron.schedule('0 9 * * 2', async () => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Sending Dimi Albers / DEPT outreach...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/email-dimi-albers-dept.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8' }
      );
      logger.info('✅ Dimi Albers email sent');
    } catch (err: any) {
      logger.error('Dimi Albers email failed:', err.message);
    }
  });

  // ─── TUESDAY 24 MAR 2026 10AM EDT (14:00 UTC): Judy Lee / Pinterest ──
  // Personalised Power House outreach to Sr. Director of Global Brand Experiences
  cron.schedule('0 14 * * 2', async () => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Sending Judy Lee / Pinterest outreach...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/email-judy-lee-pinterest.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8' }
      );
      logger.info('✅ Judy Lee email sent');
    } catch (err: any) {
      logger.error('Judy Lee email failed:', err.message);
    }
  });

  // ─── TUESDAY 24 MAR 2026 9AM: MOBO follow-up (one-shot) ───────
  // Sends follow-up to MOBO if no reply received from kanya/mark
  cron.schedule('0 9 * * 2', async () => {
    const today = new Date();
    // Only fire on Tuesday 24 March 2026
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    logger.info('📧 Running MOBO follow-up check...');
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/mobo-chopstix-followup.ts')}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8' }
      );
      logger.info('✅ MOBO follow-up complete');
    } catch (err: any) {
      logger.error('MOBO follow-up failed:', err.message);
    }
  });

  // ─── MONDAY 30 MAR 2026: POWER HOUSE BATCH 3 — META, LINKEDIN, SPOTIFY ──
  // Damien Baines / Meta (Menlo Park, PT = UTC-7):    8am PT  = 15:00 UTC
  // Alex Macnamara / LinkedIn (Sunnyvale, PT = UTC-7): 8am PT = 15:00 UTC
  // Sydney Pringle + Brian Berner / Spotify (NYC, ET = UTC-4): 8am ET = 12:00 UTC

  const BATCH3 = path.resolve(__dirname, '../scripts/email-powerhouse-batch3.ts');
  const runBatch3 = (key: string) => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 30) return;
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${BATCH3}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: key } }
      );
      logger.info(`✅ Batch3 outreach sent: ${key}`);
    } catch (err: any) { logger.error(`Batch3 outreach failed (${key}):`, err.message); }
  };

  // 12:00 UTC — Sydney Pringle + Brian Berner / Spotify (8am NYC/ET)
  cron.schedule('0 12 * * 1', async () => { runBatch3('sydney'); });

  // 15:00 UTC — Damien Baines / Meta + Alex Macnamara / LinkedIn (8am PT)
  cron.schedule('0 15 * * 1', async () => { runBatch3('damien'); runBatch3('alex'); });

  // ─── TUESDAY 24 MAR 2026: POWER HOUSE BATCH 2 ────────────────────
  // Kantar, Magnite, VaynerMedia, iHeartMedia, Ad Age
  // Jane Ostler/Kantar (London, GMT = UTC): 10am GMT = 10:00 UTC
  // Michael Barrett/Magnite, Gary Vaynerchuk/VaynerMedia, Bob Pittman/iHeart,
  // Judann Pollack/Ad Age (all New York, EDT = UTC-4): 10am EDT = 14:00 UTC

  const BATCH2 = path.resolve(__dirname, '../scripts/email-powerhouse-batch2.ts');
  const runBatch2 = (key: string) => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 24) return;
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${BATCH2}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: key } }
      );
      logger.info(`✅ Batch2 outreach sent: ${key}`);
    } catch (err: any) { logger.error(`Batch2 outreach failed (${key}):`, err.message); }
  };

  // 10:00 UTC — Jane Ostler / Kantar (10am London)
  cron.schedule('0 10 * * 2', async () => { runBatch2('jane'); });

  // 14:00 UTC — Michael Barrett / Magnite, Gary Vaynerchuk / VaynerMedia (10am EDT)
  cron.schedule('0 14 * * 2', async () => { runBatch2('michael'); runBatch2('gary'); });

  // 14:30 UTC — Bob Pittman / iHeartMedia (10:30am EDT — stagger)
  cron.schedule('30 14 * * 2', async () => { runBatch2('bob'); });

  // 15:00 UTC — Judann Pollack / Ad Age (11am EDT — stagger)
  cron.schedule('0 15 * * 2', async () => { runBatch2('judann'); });

  // ─── WEDNESDAY 1 APR 2026: POWER HOUSE BATCH 4 — 17 BRANDS ──────────────
  // CET (UTC+1): Deezer, Acast, Epidemic Sound                → 07:00 UTC
  // GMT (UTC+0): Joe Hadley/Spotify Music, Billion Dollar Boy → 08:00 UTC
  // ET  (UTC-4): Roc Nation, Sony Music, Inkwell Beach,       → 12:00 UTC
  //              614 Group, Propeller Group, Epic Games
  // PT  (UTC-7): Google, Snapchat, Canva, Netflix,            → 15:00 UTC
  //              Roblox, OpenAI

  const BATCH4 = path.resolve(__dirname, '../scripts/email-powerhouse-batch4.ts');
  const runBatch4 = (key: string) => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 25) return;
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${BATCH4}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: key } }
      );
      logger.info(`✅ Batch4 outreach sent: ${key}`);
    } catch (err: any) { logger.error(`Batch4 outreach failed (${key}):`, err.message); }
  };

  // 07:00 UTC — CET contacts (8am local)
  cron.schedule('0 7 25 3 *', async () => {
    ['deezer', 'acast', 'epidemic'].forEach(runBatch4);
  });

  // 08:00 UTC — GMT contacts (8am local)
  cron.schedule('0 8 25 3 *', async () => {
    ['joe', 'edward'].forEach(runBatch4);
  });

  // 12:00 UTC — ET contacts (8am EDT)
  cron.schedule('0 12 25 3 *', async () => {
    ['roc', 'sony', 'adrianne', '614', 'propeller', 'epic'].forEach(runBatch4);
  });

  // 15:00 UTC — PT contacts (8am PDT)
  cron.schedule('0 15 25 3 *', async () => {
    ['cannes', 'david', 'jimmy', 'marian', 'roblox', 'openai'].forEach(runBatch4);
  });

  // ─── MONDAY 6 APR 2026: POWER HOUSE BATCH 5 — 9 BRANDS ──────────────────
  // CET (UTC+1): Heineken, Adidas                          → 07:00 UTC
  // GMT (UTC+0): Diageo, Unilever, Clear Channel           → 08:00 UTC
  // ET  (UTC-4): Coca-Cola, AB InBev, L'Oreal              → 12:00 UTC
  // PT  (UTC-7): Nike                                      → 15:00 UTC

  const BATCH5 = path.resolve(__dirname, '../scripts/email-powerhouse-batch5.ts');
  const runBatch5 = (key: string) => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 25) return;
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${BATCH5}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: key } }
      );
      logger.info(`✅ Batch5 outreach sent: ${key}`);
    } catch (err: any) { logger.error(`Batch5 outreach failed (${key}):`, err.message); }
  };

  // 07:00 UTC — CET contacts (8am local)
  cron.schedule('0 7 25 3 *', async () => {
    ['nabil', 'valentina'].forEach(runBatch5);
  });

  // 08:00 UTC — GMT contacts (8am local)
  cron.schedule('0 8 25 3 *', async () => {
    ['cristina', 'esi', 'clear'].forEach(runBatch5);
  });

  // 12:00 UTC — ET contacts (8am EDT)
  cron.schedule('0 12 25 3 *', async () => {
    ['manuel', 'marcel', 'adam'].forEach(runBatch5);
  });

  // 15:00 UTC — PT contacts (8am PDT)
  cron.schedule('0 15 25 3 *', async () => {
    ['nike'].forEach(runBatch5);
  });

  // ─── WEDNESDAY 8 APR 2026: POWER HOUSE BATCH 6 — 13 BRANDS ──────────────
  // CET (UTC+1): LVMH, Gucci, Chanel, Prada, Philipp Plein,   → 07:00 UTC
  //              BMW, Mercedes-Benz
  // GMT (UTC+0): Revolut                                       → 08:00 UTC
  // ET  (UTC-4): Ritz-Carlton, Rosewood, JP Morgan             → 12:00 UTC
  // PT  (UTC-7): Stripe, Uber                                  → 15:00 UTC

  const BATCH6 = path.resolve(__dirname, '../scripts/email-powerhouse-batch6.ts');
  const runBatch6 = (key: string) => {
    const today = new Date();
    if (today.getFullYear() !== 2026 || today.getMonth() !== 2 || today.getDate() !== 25) return;
    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${BATCH6}`,
        { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', env: { ...process.env, SEND_ONLY: key } }
      );
      logger.info(`✅ Batch6 outreach sent: ${key}`);
    } catch (err: any) { logger.error(`Batch6 outreach failed (${key}):`, err.message); }
  };

  // 07:00 UTC — CET contacts (8am local) — Wed 25 Mar
  cron.schedule('0 7 25 3 *', async () => {
    ['mathilde', 'gucci', 'chanel', 'prada', 'philipp', 'bmw', 'mercedes'].forEach(runBatch6);
  });

  // 08:00 UTC — GMT contacts (8am local) — Wed 25 Mar
  cron.schedule('0 8 25 3 *', async () => {
    ['revolut'].forEach(runBatch6);
  });

  // 12:00 UTC — ET contacts (8am EDT) — Wed 25 Mar
  cron.schedule('0 12 25 3 *', async () => {
    ['ritz', 'rosewood', 'jp'].forEach(runBatch6);
  });

  // 15:00 UTC — PT contacts (8am PDT) — Wed 25 Mar
  cron.schedule('0 15 25 3 *', async () => {
    ['stripe', 'uber'].forEach(runBatch6);
  });

  // ─── MONDAY 13 APR 2026: POWER HOUSE BATCH 7 — MAJOR_BRAND ──────────────
  // Mon 13 Apr: MAJOR_BRAND contacts only
  // Wed 16 Apr: ADTECH + AGENCY contacts
  // Mon 20 Apr: MEDIA_PUBLISHER + COMMUNITY_DEI contacts
  // Wed 23 Apr: INDUSTRY_ASSOC + CANNES_ACTIVATION contacts
  //
  // Each date fires at 4 staggered UTC times by recipient timezone:
  //   07:00 UTC — EU  contacts (8am CET)
  //   08:00 UTC — UK  contacts (8am GMT/BST)
  //   12:00 UTC — ET  contacts (8am EDT)
  //   15:00 UTC — PT  contacts (8am PDT)

  const BATCH7 = path.resolve(__dirname, '../scripts/email-powerhouse-batch7.ts');
  const runBatch7 = (category: string, timezone: string) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth(); // 0-indexed
    const d = today.getDate();

    const isValidDate =
      (category === 'MAJOR_BRAND'                       && y === 2026 && m === 2 && d === 26) ||
      (category === 'ADTECH'                             && y === 2026 && m === 2 && d === 28) ||
      (category === 'AGENCY'                             && y === 2026 && m === 2 && d === 28) ||
      (category === 'MEDIA_PUBLISHER'                    && y === 2026 && m === 2 && d === 30) ||
      (category === 'COMMUNITY_DEI'                      && y === 2026 && m === 2 && d === 30) ||
      (category === 'INDUSTRY_ASSOC'                     && y === 2026 && m === 2 && d === 26) ||
      (category === 'CANNES_ACTIVATION'                  && y === 2026 && m === 2 && d === 26);

    if (!isValidDate) return;

    const { execSync } = require('child_process');
    try {
      execSync(
        `npx ts-node --project tsconfig.json ${BATCH7}`,
        {
          cwd: path.resolve(__dirname, '../../'),
          encoding: 'utf-8',
          env: { ...process.env, CATEGORY: category, TIMEZONE: timezone },
        }
      );
      logger.info(`✅ Batch7 sent: ${category} / ${timezone}`);
    } catch (err: any) {
      logger.error(`Batch7 failed (${category} / ${timezone}):`, err.message);
    }
  };

  // Monday 13 Apr 2026 — MAJOR_BRAND
  cron.schedule('0 7 26 3 *', async () => { runBatch7('MAJOR_BRAND', 'EU'); });
  cron.schedule('0 8 26 3 *', async () => { runBatch7('MAJOR_BRAND', 'UK'); });
  cron.schedule('0 12 26 3 *', async () => { runBatch7('MAJOR_BRAND', 'ET'); });
  cron.schedule('0 15 26 3 *', async () => { runBatch7('MAJOR_BRAND', 'PT'); });

  // Friday 28 Mar 2026 — ADTECH + AGENCY
  cron.schedule('0 7 28 3 *', async () => { runBatch7('ADTECH', 'EU'); runBatch7('AGENCY', 'EU'); });
  cron.schedule('0 8 28 3 *', async () => { runBatch7('ADTECH', 'UK'); runBatch7('AGENCY', 'UK'); });
  cron.schedule('0 12 28 3 *', async () => { runBatch7('ADTECH', 'ET'); runBatch7('AGENCY', 'ET'); });
  cron.schedule('0 15 28 3 *', async () => { runBatch7('ADTECH', 'PT'); runBatch7('AGENCY', 'PT'); });

  // Monday 30 Mar 2026 — MEDIA_PUBLISHER + COMMUNITY_DEI
  cron.schedule('0 7 30 3 *', async () => { runBatch7('MEDIA_PUBLISHER', 'EU'); runBatch7('COMMUNITY_DEI', 'EU'); });
  cron.schedule('0 8 30 3 *', async () => { runBatch7('MEDIA_PUBLISHER', 'UK'); runBatch7('COMMUNITY_DEI', 'UK'); });
  cron.schedule('0 12 30 3 *', async () => { runBatch7('MEDIA_PUBLISHER', 'ET'); runBatch7('COMMUNITY_DEI', 'ET'); });
  cron.schedule('0 15 30 3 *', async () => { runBatch7('MEDIA_PUBLISHER', 'PT'); runBatch7('COMMUNITY_DEI', 'PT'); });

  // Thursday 26 Mar 2026 — INDUSTRY_ASSOC + CANNES_ACTIVATION
  cron.schedule('0 7 26 3 *', async () => { runBatch7('INDUSTRY_ASSOC', 'EU'); runBatch7('CANNES_ACTIVATION', 'EU'); });
  cron.schedule('0 8 26 3 *', async () => { runBatch7('INDUSTRY_ASSOC', 'UK'); runBatch7('CANNES_ACTIVATION', 'UK'); });
  cron.schedule('0 12 26 3 *', async () => { runBatch7('INDUSTRY_ASSOC', 'ET'); runBatch7('CANNES_ACTIVATION', 'ET'); });
  cron.schedule('0 15 26 3 *', async () => { runBatch7('INDUSTRY_ASSOC', 'PT'); runBatch7('CANNES_ACTIVATION', 'PT'); });

  // ─── FRIDAY 27 MAR 2026 08:00 UTC — Villa leads follow-up ───────
  const VILLA_FOLLOWUP = path.resolve(__dirname, '../scripts/email-villa-leads-followup.ts');
  cron.schedule('0 8 27 3 *', async () => {
    const now = new Date();
    if (now.getUTCMonth() !== 2 || now.getUTCDate() !== 27) return;
    logger.info('🏡 Sending villa lead follow-ups...');
    const { execSync } = require('child_process');
    execSync(`RUN_NOW=true npx ts-node --project tsconfig.json ${VILLA_FOLLOWUP}`, {
      cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8', stdio: 'inherit'
    });
  });

  logger.info('✅ Scheduler running — Amber is on duty. All jobs active:');
  logger.info('   📧 Email read/reply     every 15 min');
  logger.info('   📨 Email follow-ups     every 30 min');
  logger.info('   📸 Instagram            every 30 min');
  logger.info('   👋 Instagram welcome    every hour');
  logger.info('   📋 Lead chase           every hour (at :15)');
  logger.info('   💼 LinkedIn replies     every hour (at :30)');
  logger.info('   📱 WhatsApp leads       every hour (at :45)');
  logger.info('   💬 WhatsApp group       every 2 hours');
  logger.info('   🔍 LinkedIn discovery   9am weekdays');
  logger.info('   📤 WhatsApp outreach    11am weekdays');
  logger.info('   🩺 Member health check  10am daily');
  logger.info('   📊 Weekly summary       Monday 8am');
  logger.info('   📨 Sponsor outreach     10am daily (50/day)');
}

// ─── RUN ALL TASKS NOW (manual trigger) ──────────────────────────

export async function runAllTasksNow(agent: AmberAgent): Promise<void> {
  logger.info('🚀 Running all tasks now...');

  const run = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err: any) {
      logger.error(`Task "${label}" failed: ${err.message}`);
    }
  };

  await run('email inbox', () => readUnrepliedEmails(agent));
  await run('email follow-ups', () => sendPendingEmailFollowUps(agent));
  await run('instagram', () => processInstagramActivity(agent));
  await run('instagram welcome DMs', () => sendInstagramWelcomeDMs(agent));
  await run('linkedin replies', () => replyToLinkedInMessages(agent));
  await run('whatsapp leads', () => processWhatsAppLeads(agent));
  await run('whatsapp group', () => manageGroupChat(agent));
  await run('whatsapp outreach', () => sendProactiveWhatsAppOutreach(agent));

  const followUps = await agent.processPendingFollowUps();
  logger.info(`✅ ${followUps.length} follow-ups processed`);

  logger.info('✅ All tasks complete');
}

// ─── WEEKLY SUMMARY ──────────────────────────────────────────────

async function sendWeeklySummaryToGeorge(agent: AmberAgent): Promise<void> {
  logger.info('📊 Generating weekly summary for George...');

  const summaryTask = `
Generate a brief weekly summary for George Guise (the founder of Indvstry Clvb).
Format it like a quick update from a team member, not a formal report.
Include: community growth this week, any notable conversations, leads in pipeline, and what's coming up.
Keep it tight — George is busy. Use bullet points. Start with the good stuff.
`;

  const response = await agent.generateResponse(summaryTask);

  if (process.env.FOUNDER_EMAIL) {
    await sendEmail(
      process.env.FOUNDER_EMAIL,
      "Amber's weekly update 📊",
      response.message
    );
  }
}

// ─── SPONSOR OUTREACH BATCH ──────────────────────────────────────

async function runSponsorOutreachBatch(): Promise<void> {
  try {
    // Dynamically require the contacts list and sending logic from the outreach script
    // We run it as a child process to keep the scheduler clean
    const { execSync } = require('child_process');
    const result = execSync(
      `npx ts-node --project tsconfig.json ${path.resolve(__dirname, '../scripts/sponsor-outreach.ts')}`,
      { cwd: path.resolve(__dirname, '../../'), encoding: 'utf-8' }
    );
    logger.info('📨 Sponsor outreach batch result:\n' + result);
  } catch (err: any) {
    logger.error('Sponsor outreach batch failed:', err.message);
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
