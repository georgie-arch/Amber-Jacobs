import AmberAgent from '../agent/amber';
import { AmberMemory, Contact } from '../agent/memory';
import { sendEmail } from '../integrations/email';
import { sendWhatsApp } from '../integrations/whatsapp';
import { logger } from '../utils/logger';

// ─── ONBOARD NEW MEMBER ─────────────────────────────────────────

export async function onboardNewMember(
  agent: AmberAgent,
  contact: Contact,
  tier = 'standard'
): Promise<void> {
  logger.info(`🎉 Onboarding new member: ${contact.first_name} ${contact.last_name || ''}`);

  const memory = agent.getMemory();

  // 1. Generate and send welcome email
  const welcomeResponse = await agent.welcomeNewMember(contact, tier);
  
  if (contact.email) {
    if (!welcomeResponse.requires_approval) {
      await sendEmail(
        contact.email,
        welcomeResponse.subject || `Welcome to Indvstry Clvb, ${contact.first_name} 🖤`,
        welcomeResponse.message
      );
      logger.info(`✉️  Welcome email sent to ${contact.email}`);
    }
  }

  // 2. WhatsApp welcome if they have a number
  if (contact.phone || contact.whatsapp_number) {
    const whatsappNum = contact.whatsapp_number || contact.phone!;
    const template = memory.fillTemplate('whatsapp_greeting', {
      first_name: contact.first_name,
      context: "You've just been welcomed to Indvstry Clvb. I'm Amber, the community manager."
    });
    
    if (template) {
      await sendWhatsApp(whatsappNum, template.content);
    }
  }

  // 3. Update onboarding stage
  const contactId = memory.upsertContact(contact);
  memory.updateOnboardingStage(contactId, 'intro_sent');
  
  // 4. Schedule onboarding sequence
  scheduleOnboardingSequence(memory, contactId, contact.first_name);

  logger.info(`✅ Onboarding complete for ${contact.first_name}`);
}

// ─── ONBOARDING SEQUENCE ────────────────────────────────────────

function scheduleOnboardingSequence(memory: AmberMemory, contactId: number, firstName: string): void {
  const now = new Date();

  // Day 1: Welcome (already sent above)
  
  // Day 3: Intro to community
  const day3 = new Date(now);
  day3.setDate(day3.getDate() + 3);
  memory.scheduleFollowUp(
    contactId, 'email', 'onboarding',
    `Intro to the Indvstry Clvb community — tell ${firstName} about other members they should meet`,
    day3,
    'Meet the community 👋'
  );

  // Day 7: Check-in (already scheduled in welcomeNewMember, but add context)
  const day7 = new Date(now);
  day7.setDate(day7.getDate() + 7);
  memory.scheduleFollowUp(
    contactId, 'email', 'check_in',
    `Week one check-in. Ask how they're settling in. Ask about upcoming events or connections.`,
    day7,
    "How's your first week going?"
  );

  // Day 14: Event invitation
  const day14 = new Date(now);
  day14.setDate(day14.getDate() + 14);
  memory.scheduleFollowUp(
    contactId, 'email', 'check_in',
    `Invite to upcoming Indvstry Clvb event or gathering. Build excitement.`,
    day14,
    'Something coming up you should know about 🖤'
  );

  // Day 30: Monthly check-in
  const day30 = new Date(now);
  day30.setDate(day30.getDate() + 30);
  memory.scheduleFollowUp(
    contactId, 'email', 'check_in',
    `Month one check-in. Celebrate their first month. Ask what value they've gotten. Offer more.`,
    day30,
    'One month in — how are you finding it?'
  );
}

// ─── RENEWAL MANAGEMENT ─────────────────────────────────────────

export async function processUpcomingRenewals(agent: AmberAgent): Promise<void> {
  const memory = agent.getMemory();
  
  // This query would find members whose renewals are in 14 days
  // Implementation depends on your membership/billing system
  logger.info('💳 Checking upcoming renewals...');
  // TODO: Connect to your billing system (Stripe, etc.)
}

// ─── MEMBER HEALTH CHECK ────────────────────────────────────────

export async function runMemberHealthCheck(agent: AmberAgent): Promise<void> {
  logger.info('🩺 Running member health check...');
  const memory = agent.getMemory();

  // Find inactive members (haven't engaged in 30+ days)
  // Re-engage them with personalised outreach
  // This would query the conversations table for members with no recent activity
  
  logger.info('✅ Member health check complete');
}
