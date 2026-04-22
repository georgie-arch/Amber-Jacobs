/**
 * LinkedIn outreach — IPH villa + 21 Cannes Lions passes
 * 6 contacts with no reliable email: Neal Mohan, Bowen Yang, Ilona Maher,
 * Gabby Logan, Eleanor Lloyd Malcolm, Adam Rowles
 * Sends connection request (with note) or DM if already connected.
 */

import dotenv from 'dotenv';
import {
  getLinkedInBrowser,
  browserSendConnectionRequest,
  browserSendMessage,
  browserCheckIsConnected,
  closeBrowser,
} from '../integrations/linkedin-browser';
dotenv.config();

const CONNECTION_NOTE = (firstName: string) =>
  `Hi ${firstName}, I'm George Guise, founder of Indvstry Clvb. We're hosting a private villa at Cannes Lions this June with 21 festival delegate passes to gift. Would love to explore a collaboration. More: Powerhouse.indvstryclvb.com`;

const DM = (firstName: string, company: string) =>
  `Hi ${firstName},

I'm George Guise, founder of Indvstry Clvb.

I'm reaching out because we're building something genuinely exciting at Cannes Lions this June and I think there could be a strong fit with ${company}.

Indvstry Power House is our private villa activation running 21-26 June alongside Cannes Lions — a luxury villa just outside Cannes, curated residents, private events and dinners with some of the most senior people in global media, marketing and culture.

Two things I wanted to put to you:

First, if you're heading to Cannes this year, we'd love to explore whether you'd want to join us as a villa resident, or whether ${company} has any activation plans the villa could support.

Second, we were gifted 21 Cannes Lions festival delegate passes by the Lions team this year, each worth over €5,000. We'd love to collaborate with ${company} to put some of these in the right hands on your team, alongside an activation at the villa.

Full details: Powerhouse.indvstryclvb.com

Would love to find 20 minutes to talk it through.

George`;

const TARGETS = [
  {
    name: 'Neal Mohan',
    firstName: 'Neal',
    company: 'YouTube',
    profileUrl: 'https://www.linkedin.com/in/nealmohan/',
  },
  {
    name: 'Bowen Yang',
    firstName: 'Bowen',
    company: 'Saturday Night Live',
    profileUrl: 'https://www.linkedin.com/in/bowenyang/',
  },
  {
    name: 'Ilona Maher',
    firstName: 'Ilona',
    company: 'Team USA Rugby',
    profileUrl: 'https://www.linkedin.com/in/ilona-maher-27a371131/',
  },
  {
    name: 'Gabby Logan',
    firstName: 'Gabby',
    company: 'ITV Sport',
    profileUrl: 'https://www.linkedin.com/in/gabby-logan-obe-3b2a0918/',
  },
  {
    name: 'Eleanor Lloyd Malcolm',
    firstName: 'Eleanor',
    company: 'Forge',
    profileUrl: 'https://www.linkedin.com/in/eleanorlloydmalcolm/',
  },
  {
    name: 'Adam Rowles',
    firstName: 'Adam',
    company: 'Forge',
    profileUrl: 'https://www.linkedin.com/in/adamrowles/',
  },
];

async function main() {
  const browser = await getLinkedInBrowser();
  const results: { name: string; status: string }[] = [];

  for (const t of TARGETS) {
    console.log(`\n[${TARGETS.indexOf(t) + 1}/${TARGETS.length}] ${t.name}`);
    try {
      const isConnected = await browserCheckIsConnected(browser, t.profileUrl);

      if (isConnected) {
        console.log(`  Already connected — sending DM`);
        const ok = await browserSendMessage(browser, t.profileUrl, DM(t.firstName, t.company));
        results.push({ name: t.name, status: ok ? 'dm_sent' : 'dm_failed' });
      } else {
        console.log(`  Not connected — sending connection request with note`);
        const note = CONNECTION_NOTE(t.firstName);
        const ok = await browserSendConnectionRequest(browser, t.profileUrl, note);
        results.push({ name: t.name, status: ok ? 'connect_sent' : 'connect_failed' });
      }
    } catch (err: any) {
      console.error(`  Error: ${err.message}`);
      results.push({ name: t.name, status: 'error' });
    }

    await new Promise(res => setTimeout(res, 4000));
  }

  await closeBrowser();

  console.log('\n─── RESULTS ──────────────────────────────────────');
  for (const r of results) {
    const icon = r.status.includes('sent') ? '✅' : '❌';
    console.log(`${icon} ${r.name} — ${r.status}`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
