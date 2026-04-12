import twilio from 'twilio';
import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';
import AmberAgent from '../agent/amber';
import { logger } from '../utils/logger';

dotenv.config();

// ─────────────────────────────────────────────────────────────────
// WHATSAPP INTEGRATION
// Two options are supported:
//   A) Twilio WhatsApp Sandbox (easiest to get started)
//   B) Meta WhatsApp Business API (direct, more features)
// ─────────────────────────────────────────────────────────────────

// ─── OPTION A: TWILIO ────────────────────────────────────────────
// Client is created lazily to avoid crashing on import when credentials are absent/invalid

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !sid.startsWith('AC')) return null;
  try {
    return twilio(sid, token);
  } catch {
    return null;
  }
}

export async function sendWhatsAppViaTwilio(to: string, message: string): Promise<boolean> {
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    logger.warn('Twilio not configured');
    return false;
  }

  try {
    // Format number
    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      to: toFormatted,
      body: message
    });

    logger.info(`✅ WhatsApp (Twilio) sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('Twilio WhatsApp failed:', error);
    return false;
  }
}

// ─── OPTION B: META WHATSAPP BUSINESS API ────────────────────────

export async function sendWhatsAppViaMeta(to: string, message: string): Promise<boolean> {
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
    logger.warn('Meta WhatsApp API not configured');
    return false;
  }

  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const cleanNumber = to.replace(/\D/g, '');

    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: cleanNumber,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`✅ WhatsApp (Meta) sent to ${to}`);
    return true;
  } catch (error: any) {
    logger.error('Meta WhatsApp failed:', error.response?.data || error.message);
    return false;
  }
}

// ─── SEND WHATSAPP (auto-selects provider) ───────────────────────

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  // Prefer Meta direct if configured
  if (process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return sendWhatsAppViaMeta(to, message);
  }
  return sendWhatsAppViaTwilio(to, message);
}

// ─── TWILIO WEBHOOK HANDLER ──────────────────────────────────────

export function setupWhatsAppWebhooks(app: express.Application, agent: AmberAgent): void {
  
  // ── Twilio webhook ──
  app.post('/webhooks/whatsapp/twilio', async (req, res) => {
    const from = req.body.From?.replace('whatsapp:', '') || '';
    const body = req.body.Body || '';
    const profileName = req.body.ProfileName || '';

    logger.info(`📱 WhatsApp (Twilio) from ${from}: ${body.substring(0, 50)}`);

    // Always acknowledge Twilio immediately — avoids 15s webhook timeout
    // (especially important when PC tools are in use)
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);

    // Process and reply asynchronously via Twilio API
    setImmediate(async () => {
      try {
        const amberResponse = await agent.handleInbound({
          platform: 'whatsapp',
          from: {
            first_name: profileName.split(' ')[0] || 'there',
            last_name: profileName.split(' ').slice(1).join(' ') || undefined,
            whatsapp_number: from,
            phone: from,
            source: 'whatsapp'
          },
          content: body,
          message_type: 'dm',
          thread_id: from,
          message_id: req.body.SmsMessageSid
        });

        if (amberResponse && !amberResponse.requires_approval) {
          await sendWhatsAppViaTwilio(from, amberResponse.message);
          logger.info(`📤 Reply sent to ${from}`);
        } else if (amberResponse) {
          logger.info(`⏳ Reply queued for approval`);
        }
      } catch (err: any) {
        logger.error(`❌ Failed to process message from ${from}:`, err.message);
      }
    });
  });

  // ── Meta WhatsApp webhook verification (both paths for compatibility) ──
  const metaVerifyHandler = (req: express.Request, res: express.Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      logger.info('✅ WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  };
  app.get('/webhooks/whatsapp/meta', metaVerifyHandler);
  app.get('/webhook', metaVerifyHandler); // alias registered in Meta dashboard

  // ── Meta WhatsApp events ──
  const metaEventHandler = async (req: express.Request, res: express.Response) => {
    res.sendStatus(200); // Always respond immediately

    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        const messages = value?.messages || [];

        for (const msg of messages) {
          if (msg.type !== 'text') continue;

          const contactInfo = value.contacts?.find((c: any) => c.wa_id === msg.from) || {};
          const name = contactInfo.profile?.name || '';

          logger.info(`📱 WhatsApp (Meta) from ${name || msg.from}: ${msg.text?.body?.substring(0, 50)}`);

          const amberResponse = await agent.handleInbound({
            platform: 'whatsapp',
            from: {
              first_name: name.split(' ')[0] || 'there',
              last_name: name.split(' ').slice(1).join(' ') || undefined,
              whatsapp_number: msg.from,
              phone: msg.from,
              source: 'whatsapp'
            },
            content: msg.text?.body || '',
            message_type: 'dm',
            thread_id: msg.from,
            message_id: msg.id
          });

          if (amberResponse && !amberResponse.requires_approval) {
            await sendWhatsAppViaMeta(msg.from, amberResponse.message);
          }
        }
      }
    }
  };
  app.post('/webhooks/whatsapp/meta', metaEventHandler);
  app.post('/webhook', metaEventHandler); // alias registered in Meta dashboard

  logger.info('✅ WhatsApp webhook routes registered');
}

// ─── SEND BROADCAST ─────────────────────────────────────────────

export async function sendWhatsAppBroadcast(
  numbers: string[],
  message: string,
  delayMs = 2000
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const number of numbers) {
    const success = await sendWhatsApp(number, message);
    if (success) sent++;
    else failed++;
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  logger.info(`📊 Broadcast complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}

// ─── PROCESS WHATSAPP LEADS ──────────────────────────────────────
// Runs pending WhatsApp follow-ups from the follow-up queue

export async function processWhatsAppLeads(agent: AmberAgent): Promise<void> {
  logger.info('📱 Processing WhatsApp leads...');
  const memory = agent.getMemory();

  const whatsappFollowUps = memory.getPendingFollowUps().filter(f => f.platform === 'whatsapp');

  if (whatsappFollowUps.length === 0) {
    logger.info('📬 No pending WhatsApp follow-ups');
    return;
  }

  for (const followUp of whatsappFollowUps) {
    const contact = memory.getContactById(followUp.contact_id);
    if (!contact?.whatsapp_number && !contact?.phone) {
      logger.warn(`No WhatsApp number for contact ${followUp.contact_id}, skipping`);
      continue;
    }

    const number = contact.whatsapp_number || contact.phone!;
    logger.info(`📱 WhatsApp follow-up for ${followUp.first_name}`);

    const task = `
Generate a follow-up WhatsApp message.
Task type: ${followUp.task_type}
Note: ${followUp.draft_message}

Keep it short and conversational — this is WhatsApp, not email. Check their history above.
`;

    const response = await agent.generateResponse(task, followUp.contact_id);

    if (!response.requires_approval) {
      const sent = await sendWhatsApp(number, response.message);
      if (sent) {
        memory.markFollowUpComplete(followUp.id);
        memory.logActivity('whatsapp_followup_sent', 'whatsapp', followUp.contact_id);
      }
    } else {
      logger.info(`⏳ WhatsApp follow-up for ${followUp.first_name} queued for George's approval`);
      logger.info(`Draft: ${response.message.substring(0, 120)}`);
    }
  }
}

// ─── MANAGE GROUP CHAT ───────────────────────────────────────────
// Monitors a WhatsApp group and responds to questions/mentions of Amber or Indvstry Clvb

export async function manageGroupChat(agent: AmberAgent, groupId?: string): Promise<void> {
  const targetGroup = groupId || process.env.WHATSAPP_GROUP_ID;

  if (!targetGroup) {
    logger.warn('WHATSAPP_GROUP_ID not set — group chat management disabled');
    return;
  }

  if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
    logger.warn('Meta WhatsApp API not configured — group chat disabled');
    return;
  }

  logger.info(`💬 Managing WhatsApp group: ${targetGroup}`);

  try {
    // Fetch recent messages in the group via Meta Cloud API
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        params: { group_id: targetGroup, limit: 20 },
        headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
      }
    );

    const messages: any[] = response.data?.data || [];
    const memory = agent.getMemory();

    for (const msg of messages) {
      if (msg.type !== 'text') continue;
      const body: string = msg.text?.body || '';

      // Only respond to questions or direct mentions
      const isMentioned =
        body.toLowerCase().includes('amber') ||
        body.toLowerCase().includes('indvstry') ||
        body.trim().endsWith('?');

      if (!isMentioned) continue;

      // Deduplicate — store a flag in the contact record so we don't reply twice
      const dedupKey = `group_msg_${msg.id}`;
      if (memory.findContact({ whatsapp_number: dedupKey })) continue;

      const senderName: string = msg.from?.name || msg.from || 'a member';
      logger.info(`💬 Group mention from ${senderName}: ${body.substring(0, 60)}`);

      const amberResponse = await agent.handleInbound({
        platform: 'whatsapp',
        from: {
          first_name: senderName.split(' ')[0],
          whatsapp_number: typeof msg.from === 'string' ? msg.from : msg.from?.wa_id || 'unknown',
          source: 'whatsapp_group'
        },
        content: body,
        message_type: 'group',
        thread_id: targetGroup,
        message_id: msg.id
      });

      if (amberResponse && !amberResponse.requires_approval) {
        await sendWhatsAppViaMeta(targetGroup, amberResponse.message);
        // Mark as handled by logging a dummy contact with the dedup key
        memory.upsertContact({ first_name: 'group_dedup', whatsapp_number: dedupKey, source: 'system' });
      }
    }
  } catch (error: any) {
    logger.error('Group chat management error:', error.response?.data || error.message);
  }
}

// ─── PROACTIVE WHATSAPP OUTREACH ─────────────────────────────────
// Sends WhatsApp messages to leads scheduled for 'outreach' tasks

export async function sendProactiveWhatsAppOutreach(agent: AmberAgent): Promise<void> {
  logger.info('📤 Running proactive WhatsApp outreach...');
  const memory = agent.getMemory();

  const outreachItems = memory.getPendingFollowUps().filter(
    f => f.platform === 'whatsapp' && f.task_type === 'outreach'
  );

  if (outreachItems.length === 0) {
    logger.info('📬 No WhatsApp outreach scheduled');
    return;
  }

  for (const item of outreachItems) {
    const contact = memory.getContactById(item.contact_id);
    if (!contact?.whatsapp_number && !contact?.phone) continue;

    const number = contact.whatsapp_number || contact.phone!;
    logger.info(`📤 WhatsApp outreach to ${item.first_name}`);

    const response = await agent.draftOutreach(
      contact,
      item.draft_message,
      'whatsapp'
    );

    if (!response.requires_approval) {
      const sent = await sendWhatsApp(number, response.message);
      if (sent) {
        memory.markFollowUpComplete(item.id);
        memory.logActivity('whatsapp_outreach_sent', 'whatsapp', item.contact_id);
      }
    } else {
      logger.info(`⏳ WhatsApp outreach for ${item.first_name} queued for George's approval`);
      logger.info(`Draft: ${response.message.substring(0, 120)}`);
    }
  }
}

// ─── HELPERS ────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
