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

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendWhatsAppViaTwilio(to: string, message: string): Promise<boolean> {
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
    // Validate Twilio signature in production!
    const from = req.body.From?.replace('whatsapp:', '') || '';
    const body = req.body.Body || '';
    const profileName = req.body.ProfileName || '';

    logger.info(`📱 WhatsApp (Twilio) from ${from}: ${body.substring(0, 50)}`);

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
      // Reply via TwiML
      res.set('Content-Type', 'text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(amberResponse.message)}</Message>
</Response>`);
    } else {
      res.set('Content-Type', 'text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
      
      // Queue for approval
      if (amberResponse) {
        logger.info(`⏳ WhatsApp reply queued for approval`);
      }
    }
  });

  // ── Meta WhatsApp webhook verification ──
  app.get('/webhooks/whatsapp/meta', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      logger.info('✅ WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  // ── Meta WhatsApp events ──
  app.post('/webhooks/whatsapp/meta', async (req, res) => {
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
  });

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

// ─── HELPERS ────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
