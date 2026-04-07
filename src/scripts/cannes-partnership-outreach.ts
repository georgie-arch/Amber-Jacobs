/**
 * cannes-partnership-outreach.ts
 *
 * Sends LinkedIn connection requests to 5 Cannes decision-makers
 * with a partnership pitch angle for Indvstry Power House.
 *
 * Contacts:
 *   Washington Post — Johanna Mayer-Jones, Gemma Floyd
 *     (Suzi Watford already DM'd — skip)
 *   SanDisk — Heidi Arkinstall, Joel Davis, Brian Pridgeon
 *
 * After connecting, each is enrolled in cannes_residency drip
 * so Amber follows up once they accept.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/cannes-partnership-outreach.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import AmberAgent from '../agent/amber';
import { getLinkedInBrowser, browserSendConnectionRequest, browserSendMessage, browserCheckIsConnected, closeBrowser } from '../integrations/linkedin-browser';
import { enrollInDrip } from '../tools/linkedin-drip';
import { logger } from '../utils/logger';

// ─── TARGETS ─────────────────────────────────────────────────────────────────

const CONTACTS = [
  // Washington Post
  {
    firstName: 'Johanna',
    lastName: 'Mayer-Jones',
    headline: 'Global Chief Advertising Officer at The Washington Post',
    company: 'The Washington Post',
    profileUrl: 'https://www.linkedin.com/in/johanna-mayer-jones-68724617',
    about: 'Global Chief Advertising Officer. Oversees all advertising strategy and client partnerships including Cannes Lions activations.',
  },
  {
    firstName: 'Gemma',
    lastName: 'Floyd',
    headline: 'Global Head of Sales at The Washington Post | Cannes Lions Speaker',
    company: 'The Washington Post',
    profileUrl: 'https://www.linkedin.com/in/gemmafloyd13',
    about: 'Global Head of Sales managing advertising partnerships. Speaker at Washington Post Cannes Lions programming.',
  },
  // SanDisk
  {
    firstName: 'Heidi',
    lastName: 'Arkinstall',
    headline: 'VP, Global Consumer Brand and Digital Marketing at SanDisk',
    company: 'SanDisk',
    profileUrl: 'https://www.linkedin.com/in/heidi-arkinstall-2573453',
    about: 'VP Global Consumer Brand and Digital Marketing. Forbes CMO Next 2021. Leads SanDisk brand strategy targeting content creators, filmmakers and AI creators.',
  },
  {
    firstName: 'Joel',
    lastName: 'Davis',
    headline: 'VP, Creative & Brand, Global Corporate Marketing at SanDisk',
    company: 'SanDisk',
    profileUrl: 'https://www.linkedin.com/in/joel-davis-0638a83',
    about: 'VP Creative and Brand overseeing creative strategy, events, social, and marketing operations. Led the SanDisk rebranding initiative. Responsible for festival sponsorships and creative industry activations.',
  },
  {
    firstName: 'Brian',
    lastName: 'Pridgeon',
    headline: 'Director, Product Marketing & Community Creations at SanDisk',
    company: 'SanDisk',
    profileUrl: 'https://www.linkedin.com/in/brian-pridgeon-144b582',
    about: 'Director Product Marketing and Community Creations. Manages creator partnerships, influencer relationships and go-to-market for content creators and filmmakers.',
  },
];

// ─── MESSAGE GENERATION ───────────────────────────────────────────────────────

async function generatePartnershipDM(
  agent: AmberAgent,
  contact: typeof CONTACTS[0]
): Promise<string> {
  const prompt = `You are Amber Jacobs, Community Manager at Indvstry Clvb, founded by George Guise.

You are sending a LinkedIn DM to ${contact.firstName} ${contact.lastName}, ${contact.headline} at ${contact.company}. You are already connected.

Their background: ${contact.about}

The pitch: Indvstry Power House is our private villa at Cannes Lions 2026. A strategic cultural hub — curated panels, activations and intimate gatherings with founders, creators and the people who actually move culture forward. The crowd is hand-picked. Brands that partner with us get access to that room and that energy, in a way that no standard Cannes sponsorship package can offer.

Write a direct LinkedIn message. Rules:
- 3-4 sentences max
- Open with something specific to their role or their company's Cannes presence
- Make clear this is a partnership conversation, not a pitch deck request
- End with a simple CTA — a quick call, or asking if they're heading to Cannes
- Warm and direct, not corporate
- No em dashes (—)
- No quotes around the message
- Return ONLY the message text`;

  try {
    const response = await agent.generateResponse(prompt, 0);
    return (response.message || '').trim();
  } catch {
    return `Hi ${contact.firstName}, we're building Indvstry Power House at Cannes Lions 2026, a private villa that functions as a strategic cultural hub with curated panels and activations. The brands partnering with us get access to a crowd you can't buy through a standard Cannes package. Would love to explore what that looks like for ${contact.company}. Are you heading to Cannes this year?`;
  }
}

// ─── CONNECTION NOTE GENERATION ───────────────────────────────────────────────

async function generateConnectionNote(
  agent: AmberAgent,
  contact: typeof CONTACTS[0]
): Promise<string> {
  const prompt = `You are Amber Jacobs, Community Manager at Indvstry Clvb, founded by George Guise.

You are sending a LinkedIn CONNECTION REQUEST (note must be under 280 characters) to ${contact.firstName} ${contact.lastName}, ${contact.headline} at ${contact.company}.

Their background: ${contact.about}

Context: Indvstry Power House is our private villa at Cannes Lions 2026. A strategic cultural hub where creators, founders and culture-shapers gather. Brands partner with us to get access to that room and that crowd.

Write a connection note. Rules:
- STRICT maximum 275 characters
- Reference their role or work naturally
- Mention Cannes or cultural events
- Hint at the partnership angle without pitching hard
- Sound human, not like a pitch
- No em dashes (—)
- Return ONLY the note text`;

  try {
    const response = await agent.generateResponse(prompt, 0);
    return (response.message || '').trim().substring(0, 275);
  } catch {
    return `Hi ${contact.firstName}, your work at ${contact.company} is exactly the world we're building around at Indvstry Power House, our Cannes Lions 2026 villa. Would love to connect ahead of the festival.`.substring(0, 275);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏛️  Indvstry Power House — Partnership Connection Requests');
  console.log('━'.repeat(60));
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('Note: Suzi Watford (WaPo) already DM\'d — skipping\n');

  const agent = new AmberAgent();

  console.log('🌐 Launching browser session...');
  const browser = await getLinkedInBrowser();
  console.log('✅ Browser ready\n');

  const results: Array<{ name: string; company: string; action: string; success: boolean }> = [];

  for (let i = 0; i < CONTACTS.length; i++) {
    const contact = CONTACTS[i];
    console.log(`\n[${i + 1}/${CONTACTS.length}] ${contact.firstName} ${contact.lastName}`);
    console.log(`     ${contact.headline}`);
    console.log(`     ${contact.profileUrl}`);

    // Check if already connected — route to DM instead of connection request
    process.stdout.write('     Checking connection status... ');
    const alreadyConnected = await browserCheckIsConnected(browser, contact.profileUrl);
    console.log(alreadyConnected ? 'already connected (will DM)' : 'not connected (will send request)');

    let sent = false;
    let actionTaken = 'Connect';

    if (alreadyConnected) {
      actionTaken = 'DM';
      process.stdout.write('     Drafting partnership DM... ');
      const dm = await generatePartnershipDM(agent, contact);
      console.log('done\n');
      console.log('     MESSAGE:');
      console.log(`     "${dm}"\n`);
      process.stdout.write('     Sending DM... ');
      sent = await browserSendMessage(browser, contact.profileUrl, dm);
      console.log(sent ? '✅ Sent' : '⚠️  Not sent');
    } else {
      process.stdout.write('     Drafting connection note... ');
      const note = await generateConnectionNote(agent, contact);
      console.log('done\n');
      console.log(`     NOTE (${note.length} chars):`);
      console.log(`     "${note}"\n`);
      process.stdout.write('     Sending connection request... ');
      sent = await browserSendConnectionRequest(browser, contact.profileUrl, note);
      console.log(sent ? '✅ Sent' : '⚠️  Not sent (check above for reason)');
    }

    if (sent) {
      try {
        const mockContact = {
          id: Date.now() + i,
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: '',
          company: contact.company,
          linkedin_url: contact.profileUrl,
          source: 'linkedin' as const,
          status: 'lead' as const,
          score: 85,
          notes: `Cannes partnership lead. ${contact.headline}`,
        };
        await enrollInDrip(agent, mockContact as any, 'cannes_residency');
        console.log('     📥 Enrolled in drip — Amber follows up once they accept');
      } catch (e: any) {
        logger.warn(`Drip enrollment failed: ${e.message}`);
      }
    }

    results.push({
      name: `${contact.firstName} ${contact.lastName}`,
      company: contact.company,
      action: actionTaken,
      success: sent,
    });

    if (i < CONTACTS.length - 1) {
      const wait = 20000 + Math.floor(Math.random() * 10000);
      console.log(`     Waiting ${Math.round(wait / 1000)}s...\n`);
      await new Promise(r => setTimeout(r, wait));
    }
  }

  await closeBrowser();

  console.log('\n' + '━'.repeat(60));
  console.log('📊 Summary\n');

  const sent = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Actions completed: ${sent.length}/${CONTACTS.length}`);
  for (const r of sent) console.log(`  ✅ ${r.name} — ${r.company} (${r.action})`);

  if (failed.length > 0) {
    console.log(`\nNot sent: ${failed.length}`);
    for (const r of failed) console.log(`  ⚠️  ${r.name} — ${r.company}`);
    console.log('\n  Possible reasons: profile private, already connected, or li_at expired.');
  }

  if (sent.length > 0) {
    console.log('\n📅 Next steps (automated via drip engine):');
    console.log('   When they accept → Amber sends partnership DM within 2 days');
    console.log('   No reply in 4 days → short follow-up');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  closeBrowser().catch(() => {});
  process.exit(1);
});
