import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ─── CONFIG ──────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!;
const WA_BASE = 'https://graph.facebook.com/v18.0';

// ─── AMBER'S SYSTEM PROMPT ───────────────────────────────────────

const SYSTEM_PROMPT = `You are Amber Jacobs, Community Manager at Indvstry Clvb — a digital private members club for creative professionals. You are responding via WhatsApp.

Your tone: Warm, direct, culturally aware. You sound like a real person, never robotic, never corporate.

About Indvstry Clvb:
- A digital private members club for creative professionals
- Members get: exclusive events, a curated network, resources, mentorship, and collaboration opportunities
- Membership is by application — quality over quantity
- Founded by George Guise
- Tone: confident, creative, exclusive but not elitist

Membership:
- Standard: £15.90/mo | £104.81/6mo | £157.02/year (best value)
- Elite: £249.99/mo | £607.29/3mo
- Book a call: https://calendar.app.google/t3KmgEHdeiAi6MGm7
- Apply: indvstryclvb.com/apply

Voice rules (strictly follow these):
- This is WhatsApp — keep replies SHORT. 1-4 sentences max unless they ask a detailed question.
- Write like a real person texting, not writing an email
- No bullet points in casual replies — use natural sentences
- Never use em dashes (—) — use commas instead
- No corporate words: leverage, synergy, circle back, touch base, value-add
- Use their first name if you know it, but only once
- Sign off as Amber only, no job title
- One emoji max, and only if it feels natural

Respond ONLY with the message text itself — no JSON, no labels, no quotes around it.`;

// ─── WHATSAPP API HELPERS ────────────────────────────────────────

async function sendTextMessage(to: string, text: string): Promise<void> {
  const res = await fetch(`${WA_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text, preview_url: false },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${err}`);
  }
}

async function sendImageMessage(to: string, imageUrl: string, caption?: string): Promise<void> {
  const res = await fetch(`${WA_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: imageUrl, ...(caption && { caption }) },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp image send failed (${res.status}): ${err}`);
  }
}

async function sendDocumentMessage(
  to: string,
  docUrl: string,
  filename: string,
  caption?: string
): Promise<void> {
  const res = await fetch(`${WA_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: { link: docUrl, filename, ...(caption && { caption }) },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp document send failed (${res.status}): ${err}`);
  }
}

async function markAsRead(messageId: string): Promise<void> {
  await fetch(`${WA_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

async function getMediaUrl(mediaId: string): Promise<string> {
  const res = await fetch(`${WA_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const data = (await res.json()) as { url: string };
  return data.url;
}

// ─── CLAUDE ──────────────────────────────────────────────────────

async function generateReply(
  senderName: string,
  messageContent: string,
  messageType: string
): Promise<string> {
  const userPrompt =
    messageType === 'text'
      ? `${senderName} just messaged on WhatsApp: "${messageContent}"`
      : `${senderName} sent ${messageType === 'image' ? 'an image' : `a ${messageType}`} on WhatsApp. ${messageContent ? `Their caption was: "${messageContent}"` : 'No caption.'}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}

// ─── PROCESS INBOUND MESSAGE ──────────────────────────────────────

async function processMessage(message: any, senderName: string): Promise<string> {
  const type: string = message.type;

  console.log(`Processing ${type} from ${senderName} (${message.from})`);

  switch (type) {
    case 'text': {
      const text = message.text?.body || '';
      return generateReply(senderName, text, 'text');
    }

    case 'image': {
      const caption = message.image?.caption || '';
      // Optionally fetch the image URL for processing
      // const mediaUrl = await getMediaUrl(message.image.id);
      return generateReply(senderName, caption, 'image');
    }

    case 'audio':
    case 'voice': {
      return generateReply(senderName, '', 'voice message');
    }

    case 'video': {
      const caption = message.video?.caption || '';
      return generateReply(senderName, caption, 'video');
    }

    case 'document': {
      const filename = message.document?.filename || 'a document';
      return generateReply(senderName, filename, 'document');
    }

    case 'sticker': {
      return generateReply(senderName, '', 'sticker');
    }

    case 'location': {
      const lat = message.location?.latitude;
      const lon = message.location?.longitude;
      return generateReply(senderName, `location (${lat}, ${lon})`, 'location');
    }

    case 'interactive': {
      // Button reply or list reply
      const reply =
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.title ||
        '';
      return generateReply(senderName, reply, 'text');
    }

    case 'order': {
      return generateReply(senderName, 'an order', 'order');
    }

    default: {
      console.log(`Unhandled message type: ${type}`);
      return generateReply(senderName, '', `${type} message`);
    }
  }
}

// ─── LAMBDA HANDLER ───────────────────────────────────────────────

export const handler = async (event: any): Promise<any> => {
  const method =
    event.requestContext?.http?.method || event.httpMethod || 'GET';
  const queryParams = event.queryStringParameters || {};

  // ─── WEBHOOK VERIFICATION (GET) ────────────────────────────────
  if (method === 'GET') {
    const mode = queryParams['hub.mode'];
    const token = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return { statusCode: 200, body: challenge };
    }

    console.warn('Webhook verification failed — token mismatch');
    return { statusCode: 403, body: 'Forbidden' };
  }

  // ─── INCOMING EVENTS (POST) ────────────────────────────────────
  if (method === 'POST') {
    let body: any;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
      console.error('Failed to parse request body');
      return { statusCode: 400, body: 'Bad Request' };
    }

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages: any[] = value?.messages || [];

    // No messages (status update, read receipt, etc.) — acknowledge and return
    if (!messages.length) {
      return { statusCode: 200, body: 'OK' };
    }

    const message = messages[0];
    const from: string = message.from;
    const messageId: string = message.id;

    // Get sender name from contacts metadata
    const contacts: any[] = value?.contacts || [];
    const senderName: string = contacts[0]?.profile?.name || 'there';

    // Mark as read immediately (shows double blue tick)
    await markAsRead(messageId).catch(() => {}); // Non-fatal

    try {
      const reply = await processMessage(message, senderName);

      if (reply) {
        await sendTextMessage(from, reply);
        console.log(`Replied to ${senderName} (${from}): ${reply.substring(0, 80)}...`);
      }
    } catch (err: any) {
      console.error('Error processing/replying:', err.message);
      // Don't reply with error — fail silently, log to CloudWatch
    }

    // Always return 200 to Meta — otherwise they retry indefinitely
    return { statusCode: 200, body: 'OK' };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};

// ─── HELPER EXPORTS (for calling from other parts of Amber) ──────

export { sendTextMessage, sendImageMessage, sendDocumentMessage };
