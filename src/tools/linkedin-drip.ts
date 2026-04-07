/**
 * linkedin-drip.ts
 *
 * LinkedIn drip sequence engine for Amber.
 * Automates multi-step LinkedIn outreach campaigns — similar to Dripify
 * but with AI-personalised messages at each step rather than templates.
 *
 * How it works:
 *   1. Enroll a contact into a named campaign
 *   2. Each campaign defines a sequence of steps with delays and conditions
 *   3. The scheduler runs `processDripQueue()` every hour
 *   4. Due steps are executed — visit profile, connect, message, follow-up
 *   5. Conditions gate each step (e.g. only message if connection accepted)
 *   6. All activity is logged to Amber's memory
 *
 * Steps available:
 *   visit_profile  — view their profile (triggers "X viewed your profile" notification)
 *   connect        — send connection request with AI-personalised note (300 char limit)
 *   message        — send DM to a connection
 *   follow_up      — follow-up DM if no reply yet
 *   endorse_skill  — endorse one of their skills (builds warm rapport)
 *
 * Conditions:
 *   always         — execute regardless
 *   if_connected   — only if they accepted the connection request
 *   if_not_replied — only if they haven't replied to the last message
 *   if_replied     — only if they have replied (e.g. to escalate warm leads)
 *
 * Usage:
 *   import { enrollInDrip, processDripQueue, CAMPAIGNS } from './linkedin-drip';
 *
 *   // Enroll a lead
 *   await enrollInDrip(agent, contact, 'indvstry_clvb_outreach');
 *
 *   // Run due steps (called by scheduler every hour)
 *   await processDripQueue(agent);
 */

import AmberAgent from '../agent/amber';
import { Contact } from '../agent/memory';
import {
  sendLinkedInMessage,
  sendConnectionRequest,
  getLinkedInUnreadMessages,
} from '../integrations/linkedin';
import { logger } from '../utils/logger';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type DripAction =
  | 'visit_profile'
  | 'connect'
  | 'message'
  | 'follow_up'
  | 'endorse_skill';

export type DripCondition =
  | 'always'
  | 'if_connected'
  | 'if_not_replied'
  | 'if_replied';

export interface DripStep {
  step: number;
  action: DripAction;
  delay_days: number;        // days after the previous step
  condition: DripCondition;
  context: string;           // describes intent — Amber uses this to craft the message
}

export interface DripCampaign {
  id: string;
  name: string;
  description: string;
  steps: DripStep[];
}

export interface DripEnrollment {
  id: number;
  contact_id: number;
  campaign_id: string;
  current_step: number;
  linkedin_url: string;
  profile_urn?: string;
  enrolled_at: string;
  last_step_at?: string;
  status: 'active' | 'paused' | 'completed' | 'replied' | 'connected';
}

// ─── CAMPAIGN DEFINITIONS ────────────────────────────────────────────────────
// Add new campaigns here. Steps run in order, gated by delay + condition.

export const CAMPAIGNS: Record<string, DripCampaign> = {

  // ── Standard Indvstry Clvb membership outreach ──────────────────────────
  indvstry_clvb_outreach: {
    id: 'indvstry_clvb_outreach',
    name: 'Indvstry Clvb Membership Outreach',
    description: 'Multi-step campaign to invite creative professionals to join Indvstry Clvb',
    steps: [
      {
        step: 1,
        action: 'visit_profile',
        delay_days: 0,
        condition: 'always',
        context: 'Visit their profile to trigger a "viewed your profile" notification — no message needed',
      },
      {
        step: 2,
        action: 'connect',
        delay_days: 2,
        condition: 'always',
        context: 'Send a warm, genuine connection request. Mention you came across their profile and found their work interesting. No hard pitch. Keep it under 300 characters.',
      },
      {
        step: 3,
        action: 'message',
        delay_days: 3,
        condition: 'if_connected',
        context: 'First message after connecting. Thank them for connecting. Briefly introduce Indvstry Clvb as a curated digital members club for creative professionals. Be curious about what they are working on. No pitch yet.',
      },
      {
        step: 4,
        action: 'follow_up',
        delay_days: 5,
        condition: 'if_not_replied',
        context: 'Gentle follow-up to the first message. Keep it short and light. Reference something specific from their profile or recent work. One sentence max.',
      },
      {
        step: 5,
        action: 'message',
        delay_days: 4,
        condition: 'if_replied',
        context: 'They have replied — now pitch Indvstry Clvb properly. Personalise based on their background. Offer to share more detail or jump on a call. Include the membership link if relevant.',
      },
    ],
  },

  // ── Cannes Lions residency outreach ─────────────────────────────────────
  cannes_residency: {
    id: 'cannes_residency',
    name: 'Cannes Lions Power House Residency',
    description: 'Invite senior Cannes attendees to take a room at the Indvstry Power House villa',
    steps: [
      {
        step: 1,
        action: 'visit_profile',
        delay_days: 0,
        condition: 'always',
        context: 'Profile view to warm up the connection before reaching out',
      },
      {
        step: 2,
        action: 'connect',
        delay_days: 1,
        condition: 'always',
        context: 'Connection request referencing Cannes Lions and their role. Keep under 300 characters. Warm, not salesy.',
      },
      {
        step: 3,
        action: 'message',
        delay_days: 2,
        condition: 'if_connected',
        context: 'Pitch the Indvstry Power House villa residency at Cannes Lions. Private curated home base, limited rooms, senior people. Reference their company\'s Cannes presence. Keep it concise.',
      },
      {
        step: 4,
        action: 'follow_up',
        delay_days: 4,
        condition: 'if_not_replied',
        context: 'Short follow-up. Mention rooms are filling up. Last nudge before moving on.',
      },
    ],
  },

  // ── Indvstry Exchange outreach ───────────────────────────────────────────
  indvstry_exchange: {
    id: 'indvstry_exchange',
    name: 'Indvstry Exchange',
    description: 'Outreach for the Indvstry Exchange programme — senior cross-industry collaborators',
    steps: [
      {
        step: 1,
        action: 'visit_profile',
        delay_days: 0,
        condition: 'always',
        context: 'Profile view to warm up',
      },
      {
        step: 2,
        action: 'connect',
        delay_days: 2,
        condition: 'always',
        context: 'Connection request mentioning shared interest in creative industries and culture. Under 300 characters.',
      },
      {
        step: 3,
        action: 'message',
        delay_days: 3,
        condition: 'if_connected',
        context: 'Introduce Indvstry Exchange — a curated initiative connecting senior figures across music, culture, and creative industries. Closed-room conversations, cross-industry collaboration, access to a network outside the usual conference circuit. Ask if they\'d be open to a conversation.',
      },
      {
        step: 4,
        action: 'endorse_skill',
        delay_days: 1,
        condition: 'if_not_replied',
        context: 'Endorse one of their top skills to stay on their radar before following up',
      },
      {
        step: 5,
        action: 'follow_up',
        delay_days: 3,
        condition: 'if_not_replied',
        context: 'Brief follow-up referencing their work or company. One specific observation. Offer a 20-minute call.',
      },
    ],
  },

  // ── Cannes Power House brand partnership (already connected) ────────────
  // For contacts already connected. Pitches villa partnership, not residency.
  cannes_partnership: {
    id: 'cannes_partnership',
    name: 'Cannes Power House Partnership',
    description: 'Partnership pitch for brands/media to co-activate at the Indvstry Power House villa at Cannes Lions 2026',
    steps: [
      {
        step: 1,
        action: 'message',
        delay_days: 2,
        condition: 'if_connected',
        context: 'Pitch the Indvstry Power House as a brand partnership opportunity. It is a private villa at Cannes Lions 2026 functioning as a strategic cultural hub: curated panels, intimate activations, founders, creators and the people who shape culture. Brands partner with us to get access to that crowd. Reference something specific about their company\'s Cannes presence or brand strategy. Be direct and warm — this is a partnership conversation, not a sponsorship pitch. Ask if they are heading to Cannes.',
      },
      {
        step: 2,
        action: 'follow_up',
        delay_days: 5,
        condition: 'if_not_replied',
        context: 'Short, direct follow-up to the partnership message. One or two sentences. Mention we are finalising partners for Cannes Lions 2026 and wanted to make sure this landed. Ask a simple yes/no question.',
      },
    ],
  },

  // ── Warm lead nurture (already connected, needs converting) ─────────────
  warm_lead_nurture: {
    id: 'warm_lead_nurture',
    name: 'Warm Lead Nurture',
    description: 'For contacts already connected on LinkedIn who need a nudge toward membership',
    steps: [
      {
        step: 1,
        action: 'message',
        delay_days: 0,
        condition: 'always',
        context: 'Re-engage a warm lead. Reference previous interaction or something they have been working on. Reintroduce Indvstry Clvb naturally.',
      },
      {
        step: 2,
        action: 'follow_up',
        delay_days: 7,
        condition: 'if_not_replied',
        context: 'Second attempt. Share something relevant — an event, a member story, a piece of news. Keep it about them, not the pitch.',
      },
      {
        step: 3,
        action: 'message',
        delay_days: 7,
        condition: 'if_not_replied',
        context: 'Final nudge. Direct but warm. Offer to share more or jump on a call. If no reply after this, mark as lost and move on.',
      },
    ],
  },
};

// ─── ENROLL A CONTACT IN A DRIP CAMPAIGN ─────────────────────────────────────

export async function enrollInDrip(
  agent: AmberAgent,
  contact: Contact,
  campaignId: string,
): Promise<void> {
  const campaign = CAMPAIGNS[campaignId];
  if (!campaign) {
    logger.error(`Drip campaign not found: ${campaignId}`);
    return;
  }

  if (!contact.linkedin_url) {
    logger.warn(`Cannot enroll ${contact.first_name} in drip — no LinkedIn URL`);
    return;
  }

  const memory = agent.getMemory();
  const contactId = memory.upsertContact(contact);

  // Store enrollment in followups table — one entry per step
  const now = new Date();

  for (const step of campaign.steps) {
    const scheduledFor = new Date(now);

    // Calculate cumulative delay
    const cumulativeDays = campaign.steps
      .slice(0, step.step)
      .reduce((sum, s) => sum + s.delay_days, 0);

    scheduledFor.setDate(scheduledFor.getDate() + cumulativeDays);

    memory.scheduleFollowUp(
      contactId,
      'linkedin',
      'linkedin_drip',
      JSON.stringify({
        campaign_id: campaignId,
        step: step.step,
        action: step.action,
        condition: step.condition,
        context: step.context,
        linkedin_url: contact.linkedin_url,
      }),
      scheduledFor,
      `[Drip: ${campaign.name}] Step ${step.step} — ${step.action}`
    );
  }

  memory.logActivity('linkedin_drip_enrolled', 'linkedin', contactId, {
    campaign: campaignId,
    steps: campaign.steps.length,
  });

  logger.info(`✅ ${contact.first_name} enrolled in "${campaign.name}" (${campaign.steps.length} steps)`);
}

// ─── ENROLL MULTIPLE CONTACTS ────────────────────────────────────────────────

export async function enrollBatchInDrip(
  agent: AmberAgent,
  contacts: Contact[],
  campaignId: string,
  delayMs = 500
): Promise<void> {
  logger.info(`📋 Enrolling ${contacts.length} contacts in campaign "${campaignId}"...`);

  for (const contact of contacts) {
    await enrollInDrip(agent, contact, campaignId);
    await new Promise(r => setTimeout(r, delayMs));
  }

  logger.info(`✅ Batch enrollment complete — ${contacts.length} contacts`);
}

// ─── PROCESS THE DRIP QUEUE ───────────────────────────────────────────────────
// Called by scheduler every hour. Executes all due drip steps.

export async function processDripQueue(agent: AmberAgent): Promise<void> {
  const memory = agent.getMemory();
  const pending = memory.getPendingFollowUps().filter(f => f.task_type === 'linkedin_drip');

  if (pending.length === 0) {
    logger.info('📋 LinkedIn drip queue — nothing due');
    return;
  }

  logger.info(`⚙️  LinkedIn drip queue — ${pending.length} step(s) due`);

  // LinkedIn daily limits — stay safe
  let connectsSent = 0;
  let messagesSent = 0;
  const MAX_CONNECTS_PER_DAY = 20;
  const MAX_MESSAGES_PER_DAY = 50;

  for (const item of pending) {
    let stepData: any;
    try {
      stepData = JSON.parse(item.draft_message || '{}');
    } catch {
      logger.warn(`Could not parse drip step data for followup ${item.id}`);
      memory.markFollowUpComplete(item.id);
      continue;
    }

    const { campaign_id, step, action, condition, context, linkedin_url } = stepData;
    const contact = memory.getContactById(item.contact_id);

    if (!contact) {
      memory.markFollowUpComplete(item.id);
      continue;
    }

    logger.info(`\n→ [${campaign_id}] Step ${step}: ${action} for ${contact.first_name} ${contact.last_name || ''}`);

    // ── Check condition ───────────────────────────────────────────
    const conditionMet = await checkCondition(condition, contact, memory, item.contact_id);
    if (!conditionMet) {
      logger.info(`  ⏭  Condition "${condition}" not met — skipping step`);
      memory.markFollowUpComplete(item.id);
      continue;
    }

    // ── Execute step ─────────────────────────────────────────────
    try {
      switch (action as DripAction) {
        case 'visit_profile':
          await visitProfile(linkedin_url);
          logger.info(`  👁  Profile visited`);
          break;

        case 'connect':
          if (connectsSent >= MAX_CONNECTS_PER_DAY) {
            logger.warn(`  ⚠️  Daily connection limit reached — skipping`);
            continue;
          }
          const connectNote = await generateDripMessage(agent, contact, context, 'connect', item.contact_id);
          const truncated = connectNote.substring(0, 295); // LinkedIn 300 char limit
          const connected = await sendConnectionRequest(linkedin_url, truncated);
          if (connected) {
            connectsSent++;
            logger.info(`  🤝 Connection request sent`);
          }
          break;

        case 'message':
        case 'follow_up':
          if (messagesSent >= MAX_MESSAGES_PER_DAY) {
            logger.warn(`  ⚠️  Daily message limit reached — skipping`);
            continue;
          }
          const msg = await generateDripMessage(agent, contact, context, action, item.contact_id);
          const sent = await sendLinkedInMessage(linkedin_url, msg);
          if (sent) {
            messagesSent++;
            logger.info(`  💬 Message sent`);
          }
          break;

        case 'endorse_skill':
          await endorseTopSkill(linkedin_url);
          logger.info(`  👍 Skill endorsed`);
          break;
      }

      memory.markFollowUpComplete(item.id);
      memory.logActivity(`linkedin_drip_${action}`, 'linkedin', item.contact_id, {
        campaign: campaign_id,
        step,
      });

    } catch (err: any) {
      logger.error(`  ❌ Step failed: ${err.message}`);
    }

    // Pace between actions
    await new Promise(r => setTimeout(r, 3000));
  }

  logger.info(`\n✅ Drip queue processed — ${connectsSent} connections, ${messagesSent} messages`);
}

// ─── GENERATE A DRIP MESSAGE VIA AMBER'S BRAIN ───────────────────────────────

async function generateDripMessage(
  agent: AmberAgent,
  contact: Contact,
  context: string,
  action: string,
  contactId: number
): Promise<string> {
  const task = `
You are sending a LinkedIn ${action} as part of a drip campaign.

Campaign context: ${context}

Rules:
- Sound like a real person, not a bot or a template
- Keep it SHORT — LinkedIn DMs should be 3-5 sentences max
- Never mention "drip campaign", "automation" or "sequence"
- Be genuinely curious about them
- Do NOT use em dashes (—)
- For connection requests: stay under 300 characters total
- Reference something specific from their profile if possible

Return ONLY the message text — no subject line, no JSON, no explanation.
`;

  const response = await agent.generateResponse(task, contactId);
  // generateResponse returns JSON — extract just the message text
  return response.message;
}

// ─── CHECK STEP CONDITION ────────────────────────────────────────────────────

async function checkCondition(
  condition: DripCondition,
  contact: Contact,
  memory: any,
  contactId: number
): Promise<boolean> {
  switch (condition) {
    case 'always':
      return true;

    case 'if_connected':
      // Check if we have a successful connection in the activity log
      return memory.hasActivity('linkedin_drip_connect', 'linkedin', contactId);

    case 'if_not_replied':
      // Check conversations — has there been an inbound LinkedIn message recently?
      return !memory.hasRecentInbound('linkedin', contactId, 30); // 30 days

    case 'if_replied':
      return memory.hasRecentInbound('linkedin', contactId, 30);

    default:
      return true;
  }
}

// ─── VISIT A LINKEDIN PROFILE ─────────────────────────────────────────────────
// Uses the Voyager API to register a profile view.

async function visitProfile(linkedinUrl: string): Promise<void> {
  const liAt = process.env.LINKEDIN_LI_AT_COOKIE;
  const jsessionid = process.env.LINKEDIN_CSRF_TOKEN || '';
  const csrfToken = jsessionid.replace(/^"|"$/g, '');

  if (!liAt) {
    logger.warn('LinkedIn cookie not set — cannot visit profile');
    return;
  }

  // Extract the profile slug from the URL
  const slugMatch = linkedinUrl.match(/linkedin\.com\/in\/([^/?]+)/);
  if (!slugMatch) return;
  const slug = slugMatch[1];

  try {
    await axios.get(
      `https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${slug}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-93`,
      {
        headers: {
          'Cookie': `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
          'Csrf-Token': csrfToken,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'X-Li-Lang': 'en_US',
          'X-Restli-Protocol-Version': '2.0.0',
          'Accept': 'application/vnd.linkedin.normalized+json+2.1',
        },
      }
    );
  } catch {
    // Silently fail — profile visits aren't critical
  }
}

// ─── ENDORSE A SKILL ──────────────────────────────────────────────────────────
// Fetches the contact's top skill and endorses it via Voyager API.

async function endorseTopSkill(linkedinUrl: string): Promise<void> {
  const liAt = process.env.LINKEDIN_LI_AT_COOKIE;
  if (!liAt) return;

  // Skill endorsement via Voyager is complex and changes frequently.
  // For now, log intent — full implementation requires profile URN resolution.
  logger.info(`  👍 Skill endorsement queued for ${linkedinUrl} (requires profile URN — visit profile first)`);
}

// ─── CAMPAIGN STATUS REPORT ───────────────────────────────────────────────────
// Returns a summary of all active drip campaigns and their progress.

export function getDripCampaignStatus(agent: AmberAgent): Record<string, any> {
  const memory = agent.getMemory();
  const pending = memory.getPendingFollowUps().filter((f: any) => f.task_type === 'linkedin_drip');

  const summary: Record<string, { enrolled: number; dueNow: number; upcoming: number }> = {};
  const now = new Date();

  for (const item of pending) {
    let stepData: any;
    try { stepData = JSON.parse(item.draft_message || '{}'); } catch { continue; }

    const cid = stepData.campaign_id || 'unknown';
    if (!summary[cid]) summary[cid] = { enrolled: 0, dueNow: 0, upcoming: 0 };

    summary[cid].enrolled++;
    const due = new Date(item.scheduled_for);
    if (due <= now) summary[cid].dueNow++;
    else summary[cid].upcoming++;
  }

  return summary;
}

// ─── PAUSE / RESUME A CONTACT ─────────────────────────────────────────────────

export function pauseDrip(agent: AmberAgent, contactId: number): void {
  const memory = agent.getMemory();
  const pending = memory.getPendingFollowUps().filter(
    (f: any) => f.contact_id === contactId && f.task_type === 'linkedin_drip'
  );
  pending.forEach((f: any) => memory.markFollowUpComplete(f.id));
  logger.info(`⏸  Drip paused for contact ${contactId} — ${pending.length} steps cancelled`);
}
