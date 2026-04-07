#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────
// Send a targeted LinkedIn message to a specific profile
// Run: npm run linkedin:message
// ─────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import AmberAgent from '../agent/amber';
import { setupDatabase } from '../database/migrations';
import { logger } from '../utils/logger';

const PROFILE_SLUG = 'malcolm-olagundoye';
const COOKIE = process.env.LINKEDIN_LI_AT_COOKIE || '';
const CSRF = (process.env.LINKEDIN_CSRF_TOKEN || '').replace(/^"|"$/g, '');

const HEADERS = {
  'Cookie': `li_at=${COOKIE}; JSESSIONID="${CSRF}"`,
  'Csrf-Token': CSRF,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'X-Li-Lang': 'en_US',
  'X-Restli-Protocol-Version': '2.0.0',
  'Accept': 'application/vnd.linkedin.normalized+json+2.1'
};

// ─── Step 1: Resolve vanity URL to profile URN ───────────────────

async function resolveProfileUrn(slug: string): Promise<{ urn: string; name: string } | null> {
  try {
    const response = await axios.get(
      `https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${slug}`,
      { headers: HEADERS }
    );

    const data = response.data;
    const urnRef = data?.data?.['*elements']?.[0] || '';
    const included = data?.included || [];
    const profile = included.find((e: any) => e.entityUrn === urnRef || e.entityUrn?.includes('fsd_profile'));

    if (urnRef) {
      const name = profile
        ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
        : slug.replace(/-/g, ' ');
      return { urn: urnRef, name };
    }

    return null;
  } catch (error: any) {
    logger.error('Could not resolve profile URN:', error?.response?.status, error?.response?.data || error.message);
    return null;
  }
}

// ─── Step 2: Send message via Voyager API ────────────────────────

async function sendMessage(recipientUrn: string, message: string): Promise<boolean> {
  try {
    await axios.post(
      'https://www.linkedin.com/voyager/api/messaging/conversations',
      {
        keyVersion: 'LEGACY_INBOX',
        message: {
          body: { text: message },
          originToken: `msg-${Date.now()}`
        },
        recipients: [recipientUrn]
      },
      { headers: { ...HEADERS, 'Content-Type': 'application/json' } }
    );
    return true;
  } catch (err1: any) {
    // Fallback — try dash messaging endpoint
    try {
      await axios.post(
        'https://www.linkedin.com/voyager/api/voyagerMessagingDashMessengerMessages?action=createMessage',
        {
          message: { body: { text: message } },
          conversationId: null,
          recipients: [recipientUrn],
          originToken: `msg-${Date.now()}`
        },
        { headers: { ...HEADERS, 'Content-Type': 'application/json' } }
      );
      return true;
    } catch (err2: any) {
      logger.error('Message send failed:', err2?.response?.status, err2?.response?.data || err2.message);
      return false;
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  💼  LinkedIn Message — Amber Jacobs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  setupDatabase();
  const agent = new AmberAgent();

  // Resolve profile
  console.log(`🔍 Looking up linkedin.com/in/${PROFILE_SLUG}...`);
  const profile = await resolveProfileUrn(PROFILE_SLUG);

  if (!profile) {
    console.error('❌ Could not find profile. Check the slug or your session cookie.');
    process.exit(1);
  }

  console.log(`✅ Found: ${profile.name} (${profile.urn})\n`);

  const firstName = profile.name.split(' ')[0] || 'Malcolm';

  // Draft message via Amber
  const context = `Reaching out to invite ${profile.name} to our next Indvstry Clvb event. Keep it personal, warm and exciting. Tell them it's going to be fun. No self-introduction, no sign-off name. Just address them as ${firstName} and get straight to the invite.`;

  const response = await agent.draftOutreach(
    {
      first_name: firstName,
      last_name: profile.name.split(' ').slice(1).join(' '),
      linkedin_url: `https://www.linkedin.com/in/${PROFILE_SLUG}/`,
      source: 'linkedin_direct'
    },
    context,
    'linkedin'
  );

  console.log('📝 Drafted message:\n');
  console.log('─────────────────────────────────────');
  console.log(response.message);
  console.log('─────────────────────────────────────\n');

  // Send it
  console.log(`📤 Sending to ${profile.name}...`);
  const sent = await sendMessage(profile.urn, response.message);

  if (sent) {
    console.log(`✅ Message sent to ${profile.name} on LinkedIn`);
  } else {
    console.log('❌ Send failed — message drafted above, you can send manually.');
  }

  agent.close();
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

main().catch(err => {
  logger.error('Script failed:', err);
  process.exit(1);
});
