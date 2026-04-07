/**
 * cannes-linkedin-connect.ts
 *
 * Finds 3 senior Cannes Lions attendees on LinkedIn, drafts
 * AI-personalised connection notes, and sends the requests live.
 *
 * After sending, enrolls each person in the cannes_residency drip
 * campaign (skipping the connect step — already done).
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/cannes-linkedin-connect.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import AmberAgent from '../agent/amber';
import { findCannesLionsLeads, LinkedInProfile } from '../integrations/linkedin';
import { getLinkedInBrowser, browserSendConnectionRequest, closeBrowser } from '../integrations/linkedin-browser';
import { enrollInDrip } from '../tools/linkedin-drip';
import { logger } from '../utils/logger';

// ─── 3 KNOWN CANNES LIONS LEADS AS FALLBACK ──────────────────────
// Used if Apify doesn't return results in time.
// Senior creatives who attend Cannes annually.

const FALLBACK_LEADS: LinkedInProfile[] = [
  {
    name: 'Johanna Mayer-Jones',
    firstName: 'Johanna',
    lastName: 'Mayer-Jones',
    headline: 'Global Chief Advertising Officer at The Washington Post',
    company: 'The Washington Post',
    location: 'New York, NY',
    profileUrl: 'https://www.linkedin.com/in/johanna-mayer-jones-68724617',
    connections: 3000,
    about: 'Global Chief Advertising Officer at The Washington Post. Oversees client partnerships, revenue operations, data solutions and advertising strategy including Cannes Lions activations.',
    industry: 'Media',
  },
  {
    name: 'Suzi Watford',
    firstName: 'Suzi',
    lastName: 'Watford',
    headline: 'Chief Strategy Officer at The Washington Post | Brand & Events',
    company: 'The Washington Post',
    location: 'New York, NY',
    profileUrl: 'https://www.linkedin.com/in/suzi-watford-18547817',
    connections: 3000,
    about: 'Chief Strategy Officer at The Washington Post responsible for brand identity, marketing and events — including Cannes Lions presence and sponsorships. Former CMO at Wall Street Journal.',
    industry: 'Media',
  },
  {
    name: 'Gemma Floyd',
    firstName: 'Gemma',
    lastName: 'Floyd',
    headline: 'Global Head of Sales, The Washington Post | Cannes Lions Speaker',
    company: 'The Washington Post',
    location: 'New York, NY',
    profileUrl: 'https://www.linkedin.com/in/gemmafloyd13',
    connections: 2000,
    about: 'Global Head of Sales at The Washington Post. Leads 20+ global sales team for advertising partnerships. Speaker at Washington Post Cannes Lions 2025 programming.',
    industry: 'Media',
  },
];

async function generateConnectionNote(agent: AmberAgent, lead: LinkedInProfile): Promise<string> {
  const prompt = `You are Amber Jacobs, Community Manager at Indvstry Clvb — a curated digital private members club for creative professionals, founded by George Guise. You're sending a LinkedIn connection request to ${lead.firstName} ${lead.lastName}.

Their profile:
- Role: ${lead.headline}
- Company: ${lead.company}
- Location: ${lead.location}
- About: ${lead.about || 'Not available'}

Context: Indvstry Clvb is hosting the Power House — a private villa at Cannes Lions 2026 for senior creatives, brand leaders and media executives. It's a curated home base, limited to a small group of the right people.

Write a warm, genuine connection note. Rules:
- Maximum 280 characters (strict LinkedIn limit)
- Reference their Cannes role specifically and our Cannes presence
- Sound like a real person reaching out, not a marketing pitch
- No hard pitch — just open a door to a conversation
- No em dashes (—)
- Return ONLY the note text, nothing else`;

  try {
    const response = await agent.generateResponse(prompt, 0);
    const note = (response.message || '').trim().substring(0, 280);
    return note;
  } catch (err: any) {
    // Fallback note if AI fails
    return `Hi ${lead.firstName}, I came across your profile — your work in creative and culture is exactly the world we're building around at Indvstry Clvb. Would love to connect ahead of Cannes.`.substring(0, 280);
  }
}

async function main() {
  console.log('\n🦁 Cannes Lions — LinkedIn Connection Script');
  console.log('━'.repeat(50));
  console.log(`Time: ${new Date().toLocaleString()}\n`);

  const agent = new AmberAgent();

  // ─── 1. Find leads ───────────────────────────────────────────
  console.log('🔍 Searching for Cannes Lions leads via Apify...');
  console.log('   (This may take 1-2 minutes — will fall back to known profiles if slow)\n');

  let leads: LinkedInProfile[] = [];

  try {
    // 90 second timeout on Apify
    const apifyPromise = findCannesLionsLeads(6); // get 6, take best 3
    const timeout = new Promise<LinkedInProfile[]>((resolve) =>
      setTimeout(() => resolve([]), 90000)
    );
    const apifyLeads = await Promise.race([apifyPromise, timeout]);

    if (apifyLeads.length >= 3) {
      leads = apifyLeads.slice(0, 3);
      console.log(`✅ Apify found ${apifyLeads.length} leads — using top 3\n`);
    } else {
      console.log(`⚠️  Apify returned ${apifyLeads.length} leads — using known Cannes profiles as fallback\n`);
      leads = FALLBACK_LEADS;
    }
  } catch (err: any) {
    console.log(`⚠️  Apify error (${err.message}) — using known Cannes profiles\n`);
    leads = FALLBACK_LEADS;
  }

  // ─── 2. Launch browser ──────────────────────────────────────
  console.log('🌐 Launching browser session...');
  const browser = await getLinkedInBrowser();
  console.log('✅ Browser ready\n');

  // ─── 3. Preview + send ───────────────────────────────────────
  const results: Array<{ lead: LinkedInProfile; note: string; sent: boolean }> = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    console.log(`\n[${i + 1}/3] ${lead.firstName} ${lead.lastName}`);
    console.log(`     ${lead.headline}`);
    console.log(`     ${lead.company} | ${lead.location}`);
    console.log(`     ${lead.profileUrl}`);

    // Generate connection note
    process.stdout.write('     Drafting connection note... ');
    const note = await generateConnectionNote(agent, lead);
    console.log('done\n');
    console.log(`     NOTE (${note.length} chars):`);
    console.log(`     "${note}"\n`);

    // Send via browser
    process.stdout.write('     Sending connection request... ');
    const sent = await browserSendConnectionRequest(browser, lead.profileUrl, note);
    console.log(sent ? '✅ Sent' : '⚠️  Not sent (profile may be Follow-only, or already connected)');

    results.push({ lead, note, sent });

    // Enroll in drip — skip step 1 (visit_profile already implied) and step 2 (connect just sent)
    if (sent) {
      try {
        const contact = {
          id: Date.now() + i,
          first_name: lead.firstName,
          last_name: lead.lastName,
          email: lead.email || '',
          company: lead.company,
          linkedin_url: lead.profileUrl,
          source: 'linkedin' as const,
          status: 'lead' as const,
          score: 75,
          notes: `Cannes Lions lead. ${lead.headline}`,
        };
        await enrollInDrip(agent, contact as any, 'cannes_residency');
        console.log('     📥 Enrolled in cannes_residency drip (follow-up in 2 days if they connect)');
      } catch (err: any) {
        console.log(`     ⚠️  Drip enrollment failed: ${err.message}`);
      }
    }

    // Human-like pause between requests (15-25s)
    if (i < leads.length - 1) {
      const wait = 15000 + Math.floor(Math.random() * 10000);
      console.log(`     Waiting ${Math.round(wait / 1000)}s before next profile...\n`);
      await new Promise(r => setTimeout(r, wait));
    }
  }

  // ─── 3. Summary ──────────────────────────────────────────────
  console.log('\n' + '━'.repeat(50));
  console.log('📊 Summary\n');

  const sent = results.filter(r => r.sent);
  const failed = results.filter(r => !r.sent);

  console.log(`✅ Requests sent: ${sent.length}/3`);
  for (const r of sent) {
    console.log(`   • ${r.lead.firstName} ${r.lead.lastName} — ${r.lead.company}`);
  }

  if (failed.length > 0) {
    console.log(`\n⚠️  Not sent: ${failed.length}`);
    for (const r of failed) {
      console.log(`   • ${r.lead.firstName} ${r.lead.lastName}`);
    }
    console.log('\n   Possible reasons: Follow-only profile, already connected, or li_at cookie expired.');
    console.log('   Refresh LINKEDIN_LI_AT_COOKIE in .env if all failed.');
  }

  await closeBrowser();

  if (sent.length > 0) {
    console.log('\n📅 Next steps (handled automatically by drip engine):');
    console.log('   • If they accept: Amber messages them in 2 days (Power House pitch)');
    console.log('   • If no reply in 4 days: short follow-up sent');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
