import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { AmberMemory, Contact } from './memory';
import { buildContextualPrompt, AMBER_SYSTEM_PROMPT } from './personality';
import { logger } from '../utils/logger';
import { executePcToolSafe, isBridgeConnected } from '../integrations/pc-server';

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

    const senderPhone = incoming.from.phone || incoming.from.whatsapp_number || '';
    const georgePhone = (process.env.GEORGE_PHONE || '+447438932403').replace(/\s/g, '');
    const isGeorge = senderPhone.replace(/\s/g, '') === georgePhone;

    // Upsert contact into memory
    const contactId = this.memory.upsertContact({
      first_name: isGeorge ? 'George' : 'Unknown',
      last_name: isGeorge ? 'Guise' : undefined,
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

    let response: AmberResponse;

    if (isGeorge) {
      // George is talking — switch to personal assistant mode with PC tools
      response = await this.handleGeorge(incoming.content, contactId);
    } else {
      // Regular member / prospect
      const task = `
You've received a ${incoming.message_type || 'message'} via ${incoming.platform}.
Message content: "${incoming.content}"
${incoming.subject ? `Subject: ${incoming.subject}` : ''}

Generate an appropriate reply. Be natural and human. Check their history above.
`;
      response = await this.generateResponse(task, contactId);
    }

    response.requires_approval = !this.autoSend;

    this.memory.logActivity('inbound_handled', incoming.platform, contactId, {
      message_preview: incoming.content.substring(0, 100)
    });

    return response;
  }

  // ─── GEORGE MODE: personal assistant + PC tools ──────────────────

  private async handleGeorge(message: string, contactId: number): Promise<AmberResponse> {
    logger.info(`👑 George mode activated`);

    const bridgeOnline = isBridgeConnected();
    const pcStatus = bridgeOnline
      ? 'PC Bridge is ONLINE. You can control George\'s Mac using the pc_* tools.'
      : 'PC Bridge is OFFLINE. PC tools are unavailable right now (bridge not running on Mac).';

    const systemPrompt = `${AMBER_SYSTEM_PROMPT}

---

## SPECIAL MODE: GEORGE IS MESSAGING YOU

This message is from George Guise — your founder and the person you work for.
You are NOT community managing right now. You are his personal assistant.

Address him as George. Be warm but efficient. Get things done.
Do NOT ask him for his name or number — you know who he is.
Do NOT treat him like a stranger or a member inquiry.

${pcStatus}

When George asks you to do something on his computer, use the PC tools available.
Always confirm what you did after using tools.
If something fails, tell George clearly what went wrong.
`;

    const pcTools: Anthropic.Tool[] = [
      {
        name: 'shell',
        description: 'Run any shell command on George\'s Mac. Use for anything not covered by other tools.',
        input_schema: {
          type: 'object' as const,
          properties: {
            command: { type: 'string', description: 'The shell command to run' },
            timeout_ms: { type: 'number', description: 'Timeout in milliseconds (default 30000)' }
          },
          required: ['command']
        }
      },
      {
        name: 'read_file',
        description: 'Read the contents of a file on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute or ~ path to the file' }
          },
          required: ['path']
        }
      },
      {
        name: 'write_file',
        description: 'Write or create a file on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute or ~ path to the file' },
            content: { type: 'string', description: 'Content to write' }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'list_dir',
        description: 'List files and folders in a directory on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Directory path (use ~ for home)' }
          },
          required: ['path']
        }
      },
      {
        name: 'find_files',
        description: 'Search for files by name or content on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Filename pattern to search for' },
            content: { type: 'string', description: 'Text to search for inside files' },
            path: { type: 'string', description: 'Directory to search in (default: home)' }
          }
        }
      },
      {
        name: 'open_app',
        description: 'Open an application on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Application name (e.g. "Spotify", "Chrome", "Finder")' }
          },
          required: ['name']
        }
      },
      {
        name: 'close_app',
        description: 'Close/quit an application on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Application name to quit' }
          },
          required: ['name']
        }
      },
      {
        name: 'get_clipboard',
        description: 'Get the current clipboard contents from George\'s Mac',
        input_schema: { type: 'object' as const, properties: {} }
      },
      {
        name: 'set_clipboard',
        description: 'Set clipboard contents on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            text: { type: 'string', description: 'Text to copy to clipboard' }
          },
          required: ['text']
        }
      },
      {
        name: 'get_system_info',
        description: 'Get CPU, memory, disk, and uptime info from George\'s Mac',
        input_schema: { type: 'object' as const, properties: {} }
      },
      {
        name: 'get_running_apps',
        description: 'List all currently running applications on George\'s Mac',
        input_schema: { type: 'object' as const, properties: {} }
      },
      {
        name: 'get_active_window',
        description: 'Get the currently active/focused application on George\'s Mac',
        input_schema: { type: 'object' as const, properties: {} }
      },
      {
        name: 'applescript',
        description: 'Run an AppleScript command on George\'s Mac for advanced automation',
        input_schema: {
          type: 'object' as const,
          properties: {
            script: { type: 'string', description: 'The AppleScript to execute' }
          },
          required: ['script']
        }
      },
      {
        name: 'screenshot',
        description: 'Take a screenshot and save it to a file on George\'s Mac',
        input_schema: {
          type: 'object' as const,
          properties: {
            filename: { type: 'string', description: 'Output path (default: /tmp/amber-screen-<timestamp>.png)' }
          }
        }
      }
    ];

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: message }
    ];

    // Tool use loop
    let finalText = '';
    const maxIterations = 10;

    for (let i = 0; i < maxIterations; i++) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        tools: bridgeOnline ? pcTools : [],
        messages
      });

      // Collect any text from this response turn
      const textBlocks = response.content.filter(b => b.type === 'text');
      if (textBlocks.length > 0) {
        finalText = (textBlocks as Anthropic.TextBlock[]).map(b => b.text).join('\n');
      }

      if (response.stop_reason === 'end_turn') break;

      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[];

        // Add assistant message with tool calls
        messages.push({ role: 'assistant', content: response.content });

        // Execute each tool and collect results
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const toolCall of toolUseBlocks) {
          logger.info(`[George] Tool call: ${toolCall.name}`);
          let result: string;
          try {
            result = await executePcToolSafe(toolCall.name, toolCall.input as Record<string, any>);
          } catch (e: any) {
            result = `Error: ${e.message}`;
            logger.error(`[George] Tool ${toolCall.name} failed:`, e.message);
          }
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: result
          });
        }

        messages.push({ role: 'user', content: toolResults });
        continue;
      }

      break;
    }

    return {
      to: 'George',
      platform: 'whatsapp',
      message: finalText || "done",
      tone_notes: 'George mode — personal assistant',
      requires_approval: false  // always auto-send to George
    };
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
