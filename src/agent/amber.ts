import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { AmberMemory, Contact } from './memory';
import { buildContextualPrompt } from './personality';
import { logger } from '../utils/logger';

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export interface AmberResponse {
  to: string;
  platform: string;
  subject?: string;
  message: string;
  tone_notes: string;
  requires_approval: boolean;
  follow_up_in_days?: number;
}

export interface IncomingMessage {
  platform: 'email' | 'linkedin' | 'instagram' | 'whatsapp' | 'telegram';
  from: Partial<Contact>;
  content: string;
  subject?: string;
  thread_id?: string;
  message_id?: string;
  message_type?: string;
  metadata?: object;
}

export class AmberAgent {
  private memory: AmberMemory;
  private autoSend: boolean;

  constructor() {
    this.memory = new AmberMemory();
    this.autoSend = process.env.AUTO_SEND === 'true';
  }

  // ─── CORE: GENERATE RESPONSE ────────────────────────────────────

  async generateResponse(task: string, contactId?: number): Promise<AmberResponse> {
    const contactContext = contactId 
      ? this.memory.buildContactContext(contactId)
      : 'No existing contact — this is a new interaction.';

    const prompt = buildContextualPrompt(contactContext, task);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AmberResponse;
      }
    } catch (e) {
      logger.warn('Could not parse JSON response, wrapping raw text');
    }

    // Fallback: wrap raw text
    return {
      to: 'unknown',
      platform: 'unknown',
      message: text,
      tone_notes: 'raw response',
      requires_approval: true
    };
  }

  // ─── HANDLE INBOUND MESSAGE ─────────────────────────────────────

  async handleInbound(incoming: IncomingMessage): Promise<AmberResponse | null> {
    logger.info(`📥 Inbound message from ${incoming.from.first_name || 'unknown'} via ${incoming.platform}`);

    // Upsert contact into memory
    const contactId = this.memory.upsertContact({
      first_name: 'Unknown',
      ...incoming.from,
      source: incoming.from.source || incoming.platform
    });

    // Log the inbound message
    this.memory.logConversation({
      contact_id: contactId,
      platform: incoming.platform,
      direction: 'inbound',
      message_type: incoming.message_type || 'dm',
      subject: incoming.subject,
      content: incoming.content,
      thread_id: incoming.thread_id,
      message_id: incoming.message_id,
      needs_reply: true,
      metadata: incoming.metadata
    });

    // Build task for Amber
    const task = `
You've received a ${incoming.message_type || 'message'} via ${incoming.platform}.
Message content: "${incoming.content}"
${incoming.subject ? `Subject: ${incoming.subject}` : ''}

Generate an appropriate reply. Be natural and human. Check their history above.
`;

    const response = await this.generateResponse(task, contactId);
    response.requires_approval = !this.autoSend;

    this.memory.logActivity('inbound_handled', incoming.platform, contactId, {
      message_preview: incoming.content.substring(0, 100)
    });

    return response;
  }

  // ─── DRAFT OUTREACH ─────────────────────────────────────────────

  async draftOutreach(contact: Contact, context: string, platform: string): Promise<AmberResponse> {
    const contactId = this.memory.upsertContact(contact);
    this.memory.upsertLead(contactId, 'discovered', 10);

    const linkedInRule = platform === 'linkedin'
      ? `\nLINKEDIN RULE: Start the message by addressing them by first name (e.g. "Hey ${contact.first_name},"). Do NOT introduce yourself, do NOT sign off with your name, do NOT add "— Amber" or any name tag. Just the message, addressed to them.`
      : '';

    const task = `
Draft an outreach message for a potential member.
Platform: ${platform}
Context about why you're reaching out: ${context}

This is someone you think would be great for Indvstry Clvb. Personalise it based on their profile.
Don't oversell. Be curious about them. Keep it concise.${linkedInRule}
`;

    const response = await this.generateResponse(task, contactId);
    
    // Schedule follow-up automatically
    if (response.follow_up_in_days) {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + response.follow_up_in_days);
      this.memory.scheduleFollowUp(
        contactId, platform, 'followup',
        `Follow up on initial outreach to ${contact.first_name}`,
        followUpDate
      );
    }

    return response;
  }

  // ─── WELCOME NEW MEMBER ─────────────────────────────────────────

  async welcomeNewMember(contact: Contact, tier = 'standard'): Promise<AmberResponse> {
    const contactId = this.memory.upsertContact({ ...contact, contact_type: 'member' });
    this.memory.createMember(contactId, tier);
    this.memory.updateOnboardingStage(contactId, 'welcome');

    // Schedule check-in
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + parseInt(process.env.MEMBER_CHECKIN_DAYS || '7'));
    this.memory.scheduleFollowUp(
      contactId, 'email', 'check_in',
      `Week one check-in with new member ${contact.first_name}`,
      checkInDate,
      "Checking in — how's your first week?"
    );

    const template = this.memory.fillTemplate('member_welcome', {
      first_name: contact.first_name,
      club_url: process.env.CLUB_WEBSITE || 'indvstryclvb.com',
      membership_tier: tier
    });

    if (template) {
      this.memory.logActivity('member_welcomed', 'email', contactId);
      return {
        to: contact.first_name,
        platform: 'email',
        subject: template.subject,
        message: template.content,
        tone_notes: 'Standard welcome template',
        requires_approval: !this.autoSend,
        follow_up_in_days: parseInt(process.env.MEMBER_CHECKIN_DAYS || '7')
      };
    }

    // Generate custom welcome if template fails
    const task = `
Generate a welcome email for a new Indvstry Clvb member.
Their membership tier is: ${tier}
Make it feel personal and exciting. Welcome them to the community.
`;
    return this.generateResponse(task, contactId);
  }

  // ─── QUALIFY LEAD ───────────────────────────────────────────────

  async qualifyLead(contact: Contact): Promise<{ score: number; analysis: string; recommended_action: string }> {
    const prompt = `
You are Amber Jacobs, Community Manager at Indvstry Clvb — a digital private members club for creative professionals.

Assess this potential member and score them 0-100 on fit for the club.

Contact details:
- Name: ${contact.first_name} ${contact.last_name || ''}
- Company: ${contact.company || 'unknown'}
- Role: ${contact.job_title || 'unknown'}
- Industry: ${contact.industry || 'unknown'}
- Bio: ${contact.bio || 'no bio'}

Respond in JSON:
{
  "score": number,
  "analysis": "brief analysis of fit",
  "recommended_action": "invite_now | nurture | pass | research_more"
}
`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {}

    return { score: 50, analysis: 'Could not assess', recommended_action: 'research_more' };
  }

  // ─── GENERATE POST/COMMENT ──────────────────────────────────────

  async generateComment(postContent: string, postAuthor: string, platform: string): Promise<string> {
    const prompt = `
You are Amber Jacobs from Indvstry Clvb.

Generate a thoughtful, genuine comment on this ${platform} post by ${postAuthor}.
Post content: "${postContent}"

Rules:
- Sound like a real person, not a brand
- Add value — don't just compliment
- Keep it short (1-3 sentences)
- You can mention Indvstry Clvb very naturally if relevant, but don't force it
- No hashtags in comments

Return just the comment text, nothing else.
`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  }

  // ─── PROCESS PENDING FOLLOW-UPS ─────────────────────────────────

  async processPendingFollowUps(): Promise<AmberResponse[]> {
    const followUps = this.memory.getPendingFollowUps();
    const responses: AmberResponse[] = [];

    for (const followUp of followUps) {
      logger.info(`📋 Processing follow-up for ${followUp.first_name} via ${followUp.platform}`);
      
      const task = `
Generate a follow-up message.
Task type: ${followUp.task_type}
Original note: ${followUp.draft_message}
Platform: ${followUp.platform}

Check their history and craft a relevant, timely message. Be natural.
`;

      const response = await this.generateResponse(task, followUp.contact_id);
      response.requires_approval = !this.autoSend;
      responses.push(response);

      this.memory.markFollowUpComplete(followUp.id);
      this.memory.logActivity('followup_processed', followUp.platform, followUp.contact_id);
    }

    return responses;
  }

  getMemory(): AmberMemory {
    return this.memory;
  }

  close(): void {
    this.memory.close();
  }
}

export default AmberAgent;
