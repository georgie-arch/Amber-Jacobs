#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────
// Cannes Lions Outreach — Find & connect with Cannes attendees
// Run: npm run cannes:outreach
// ─────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import AmberAgent from '../agent/amber';
import { setupDatabase } from '../database/migrations';
import { runCannesLionsOutreach } from '../integrations/linkedin';
import { logger } from '../utils/logger';

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🦁  Cannes Lions Outreach — Amber Jacobs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  setupDatabase();
  const agent = new AmberAgent();

  await runCannesLionsOutreach(agent);

  agent.close();
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

main().catch(err => {
  logger.error('Cannes outreach failed:', err);
  process.exit(1);
});
