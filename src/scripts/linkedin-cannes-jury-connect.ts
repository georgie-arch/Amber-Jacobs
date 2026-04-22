/**
 * Cannes Lions 2026 Jury — LinkedIn Connection Requests + DMs
 *
 * Step 1: Sends personalised connection requests to all 10 jury members.
 * Step 2: If already connected (Message button visible), sends the full DM instead.
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/linkedin-cannes-jury-connect.ts
 *
 * LinkedIn limits: ~20 connection requests/day. 10 is safe.
 * Human-like delays are built into the browser layer.
 */

import dotenv from 'dotenv';
import { getLinkedInBrowser, browserSendConnectionRequest, browserSendMessage, browserCheckIsConnected, closeBrowser } from '../integrations/linkedin-browser';
import { logger } from '../utils/logger';
dotenv.config();

const TARGETS = [
  {
    name: 'Phiona Okumu',
    profileUrl: 'https://www.linkedin.com/in/phiona-okumu',
    jury: 'Entertainment Lions for Music',
    company: 'Spotify',
  },
  {
    name: 'Jason Murison',
    profileUrl: 'https://www.linkedin.com/in/jason-murison',
    jury: 'Print & Publishing',
    company: 'DAMAC Properties',
  },
  {
    name: 'Femi Odugbemi',
    profileUrl: 'https://www.linkedin.com/in/femi-odugbemi',
    jury: 'Film',
    company: 'Zuri24 Media',
  },
  {
    name: 'Andre Athayde',
    profileUrl: 'https://www.linkedin.com/in/andre-athayde',
    jury: 'Creative B2B',
    company: 'Meta',
  },
  {
    name: 'Zizwe Vundla',
    profileUrl: 'https://www.linkedin.com/in/zizwe-vundla',
    jury: 'Brand Experience & Activation',
    company: 'Safaricom / M-Pesa',
  },
  {
    name: 'Chesley Maddox-Dorsey',
    profileUrl: 'https://www.linkedin.com/in/chesley-maddox-dorsey',
    jury: 'Audio & Radio',
    company: 'American Urban Radio Networks',
  },
  {
    name: 'Tim Wasicki',
    profileUrl: 'https://www.linkedin.com/in/tim-wasicki',
    jury: 'Outdoor',
    company: 'OUTFRONT Media',
  },
  {
    name: 'Breana Auberry',
    profileUrl: 'https://www.linkedin.com/in/breana-auberry',
    jury: 'Glass: The Lion for Change',
    company: 'The LEGO Group',
  },
  {
    name: 'Oriane Canfrin',
    profileUrl: 'https://www.linkedin.com/in/oriane-canfrin',
    jury: 'Creative Commerce',
    company: 'Ecobank',
  },
  {
    name: 'Lauren Kimball',
    profileUrl: 'https://www.linkedin.com/in/lauren-kimball',
    jury: 'Industry Craft',
    company: 'Edelman',
  },
];

// Connection request note — max 295 chars, personalised with jury category
function connectionNote(firstName: string, jury: string): string {
  const note = `Hi ${firstName}, I saw you are on the ${jury} jury at Cannes Lions 2026. I am George Guise, founder of Indvstry Clvb. I am hosting a private villa residency and Diaspora Dinner during the week and would love to connect.`;
  return note.substring(0, 295);
}

// Full DM for already-connected profiles
function fullDm(firstName: string, jury: string): string {
  return `Hi ${firstName}, great to be connected. I run Indvstry Clvb, a private members community for senior creative leaders. With you on the ${jury} jury at Cannes Lions this year I wanted to reach out directly. We are hosting Indvstry Power House, a private villa residency 21-26 June with a full Cannes Delegate Pass included, and the Diaspora Dinner on 23 June, a private sunset dinner for leaders from the global creative community. Both very limited. Would love to tell you more: https://lu.ma/t4ek2yn7`;
}

async function main() {
  logger.info('Cannes Lions 2026 Jury — LinkedIn Outreach');
  logger.info(`Targets: ${TARGETS.length}`);

  const browser = await getLinkedInBrowser();

  const results: { name: string; action: string; success: boolean }[] = [];

  for (let i = 0; i < TARGETS.length; i++) {
    const t = TARGETS[i];
    const firstName = t.name.split(' ')[0];
    logger.info(`\n[${i + 1}/${TARGETS.length}] ${t.name} — ${t.profileUrl}`);

    // Check if already connected — if so, send DM directly
    const alreadyConnected = await browserCheckIsConnected(browser, t.profileUrl);

    if (alreadyConnected) {
      logger.info(`  Already connected — sending DM`);
      const dm = fullDm(firstName, t.jury);
      const ok = await browserSendMessage(browser, t.profileUrl, dm);
      results.push({ name: t.name, action: 'dm', success: ok });
    } else {
      const note = connectionNote(firstName, t.jury);
      logger.info(`  Sending connection request (${note.length} chars)`);
      const ok = await browserSendConnectionRequest(browser, t.profileUrl, note);
      results.push({ name: t.name, action: 'connect', success: ok });
    }

    // Pace between profiles — 10-15s human-like gap
    if (i < TARGETS.length - 1) {
      const delay = 10000 + Math.floor(Math.random() * 5000);
      logger.info(`  Waiting ${Math.round(delay / 1000)}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  await closeBrowser();

  console.log('\n─── RESULTS ─────────────────────────────────────');
  for (const r of results) {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.name} — ${r.action} — ${r.success ? 'sent' : 'failed'}`);
  }

  const sent = results.filter(r => r.success).length;
  console.log(`\n${sent}/${results.length} successful`);
}

main().catch(err => {
  logger.error('Fatal:', err.message);
  process.exit(1);
});
