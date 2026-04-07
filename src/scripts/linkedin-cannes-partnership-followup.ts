/**
 * linkedin-cannes-partnership-followup.ts
 *
 * Two things:
 *   1. Send Johanna Mayer-Jones a LinkedIn DM now (cold outreach since connected)
 *   2. Enroll all 5 Cannes contacts in the cannes_partnership drip
 *      — fires partnership pitch DM in 2 days, follow-up in 7 days if no reply
 *
 * Contacts (all now connected to George):
 *   Washington Post: Johanna Mayer-Jones, Gemma Floyd
 *   SanDisk:         Heidi Arkinstall, Joel Davis, Brian Pridgeon
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/linkedin-cannes-partnership-followup.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import AmberAgent from '../agent/amber';
import { getLinkedInBrowser, browserSendMessage, closeBrowser } from '../integrations/linkedin-browser';
import { enrollInDrip } from '../tools/linkedin-drip';
import { logger } from '../utils/logger';
import { Contact } from '../agent/memory';

// ─── CONTACTS ────────────────────────────────────────────────────────────────

const CONTACTS = [
  {
    firstName: 'Johanna',
    lastName: 'Mayer-Jones',
    headline: 'Global Chief Advertising Officer at The Washington Post',
    company: 'The Washington Post',
    profileUrl: 'https://www.linkedin.com/in/johanna-mayer-jones-68724617',
    about: 'Global Chief Advertising Officer. Oversees all advertising strategy and client partnerships including Cannes Lions activations.',
    sendNow: true, // DM immediately — cold outreach since just connected
  },
  {
    firstName: 'Gemma',
    lastName: 'Floyd',
    headline: 'Global Head of Sales at The Washington Post | Cannes Lions Speaker',
    company: 'The Washington Post',
    profileUrl: 'https://www.linkedin.com/in/gemmafloyd13',
    about: 'Global Head of Sales managing advertising partnerships. Speaker at Washington Post Cannes Lions programming.',
    sendNow: false,
  },
  {
    firstName: 'Heidi',
    lastName: 'Arkinstall',
    headline: 'VP, Global Consumer Brand and Digital Marketing at SanDisk',
    company: 'SanDisk',
    profileUrl: 'https://www.linkedin.com/in/heidi-arkinstall-2573453',
    about: 'VP Global Consumer Brand and Digital Marketing. Leads SanDisk brand strategy targeting content creators, filmmakers and AI creators.',
    sendNow: false,
  },
  {
    firstName: 'Joel',
    lastName: 'Davis',
    headline: 'VP, Creative & Brand, Global Corporate Marketing at SanDisk',
    company: 'SanDisk',
    profileUrl: 'https://www.linkedin.com/in/joel-davis-0638a83',
    about: 'VP Creative and Brand. Led the SanDisk rebranding initiative. Responsible for festival sponsorships and creative industry activations.',
    sendNow: false,
  },
  {
    firstName: 'Brian',
    lastName: 'Pridgeon',
    headline: 'Director, Product Marketing & Community Creations at SanDisk',
    company: 'SanDisk',
    profileUrl: 'https://www.linkedin.com/in/brian-pridgeon-144b582',
    about: 'Director Product Marketing and Community Creations. Manages creator partnerships and go-to-market for content creators and filmmakers.',
    sendNow: false,
  },
];

// ─── JOHANNA'S OPENING DM ─────────────────────────────────────────────────────

async function generateJohannaDM(agent: AmberAgent): Promise<string> {
  const prompt = `You are Amber Jacobs, Community Manager at Indvstry Clvb, founded by George Guise.

You have just connected with Johanna Mayer-Jones, Global Chief Advertising Officer at The Washington Post, on LinkedIn. This is your first message to her.

Her background: Global Chief Advertising Officer overseeing all advertising strategy and client partnerships at The Washington Post, including their Cannes Lions activations. The Washington Post is known for a thoughtful, culturally credible Cannes presence.

The pitch: Indvstry Power House is our private villa at Cannes Lions 2026. It is a strategic cultural hub, not a party venue. We curate panels, activations and intimate gatherings with founders, creators and the people who actually move culture forward. The crowd is hand-picked. Brands and media companies that partner with us get access to that room and that energy in a way no standard Cannes sponsorship package can replicate.

Write a warm, direct first message. Rules:
- 3-4 sentences
- Open by referencing The Washington Post's Cannes presence specifically
- Frame this as a partnership conversation, not a pitch
- End with a soft CTA — asking if she is heading to Cannes, or a quick call
- Warm and direct, not corporate
- No em dashes (—)
- No quotes around the message
- Return ONLY the message text`;

  try {
    const response = await agent.generateResponse(prompt, 0);
    return (response.message || '').trim();
  } catch {
    return `Hi Johanna, The Washington Post's Cannes presence is one of the more intentional ones in media, so you are exactly who I wanted to connect with. We are building Indvstry Power House, a private villa at Cannes Lions 2026 that functions as a strategic cultural hub with curated panels, founders, creators and the people genuinely shaping culture. The brands that partner with us get access to that room in a way a standard Cannes package cannot replicate. Are you heading to Cannes next year?`;
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏛️  Cannes Partnership — LinkedIn Follow-up Setup');
  console.log('━'.repeat(55));
  console.log(`Time: ${new Date().toLocaleString()}\n`);

  const agent = new AmberAgent();

  // ── Step 1: Send Johanna's DM now ──────────────────────────
  console.log('PART 1: Sending Johanna Mayer-Jones an opening DM now...');
  console.log('━'.repeat(55));

  const johanna = CONTACTS.find(c => c.firstName === 'Johanna')!;

  console.log('\n🌐 Launching browser...');
  const browser = await getLinkedInBrowser();
  console.log('✅ Browser ready\n');

  process.stdout.write('Drafting message for Johanna... ');
  const johannaDM = await generateJohannaDM(agent);
  console.log('done\n');
  console.log('MESSAGE:');
  console.log(`"${johannaDM}"\n`);

  process.stdout.write('Sending DM... ');
  const sent = await browserSendMessage(browser, johanna.profileUrl, johannaDM);
  console.log(sent ? '✅ Sent' : '⚠️  Not sent — check profile is connected');

  await closeBrowser();

  // ── Step 2: Enroll all 5 in cannes_partnership drip ────────
  console.log('\n\nPART 2: Enrolling all 5 in cannes_partnership drip...');
  console.log('━'.repeat(55));
  console.log('Campaign: cannes_partnership');
  console.log('  Step 1: Partnership DM  — fires in 2 days (if connected)');
  console.log('  Step 2: Follow-up       — fires in 7 days (if no reply)\n');
  console.log('Note: Johanna is already getting a DM today. Her drip step 1');
  console.log('will fire in 2 days as a natural follow-on if she does not reply.\n');

  for (const contact of CONTACTS) {
    process.stdout.write(`  Enrolling ${contact.firstName} ${contact.lastName}... `);
    try {
      // Use LinkedIn URL slug as email placeholder — ensures uniqueness in DB
      const slug = contact.profileUrl.replace(/.*\/in\//, '').replace(/\/$/, '');
      const mockContact = {
        id: 0,
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: `${slug}@linkedin.placeholder`,
        company: contact.company,
        linkedin_url: contact.profileUrl,
        source: 'linkedin' as const,
        status: 'lead' as const,
        notes: `Cannes Power House partnership lead. ${contact.headline}`,
      } as Contact;
      await enrollInDrip(agent, mockContact, 'cannes_partnership');
      console.log('✅');
    } catch (e: any) {
      console.log(`❌ ${e.message}`);
    }
  }

  console.log('\n' + '━'.repeat(55));
  console.log('📅 Schedule summary:\n');
  console.log('  Today       — Johanna DM sent' + (sent ? ' ✅' : ' ⚠️'));
  console.log('  Apr 7       — Partnership DMs fire for all 5 (Johanna\'s = follow-up)');
  console.log('  Apr 12      — Follow-up sent to anyone who hasn\'t replied');
  console.log('\nAll handled automatically by Amber\'s drip engine.');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  closeBrowser().catch(() => {});
  process.exit(1);
});
