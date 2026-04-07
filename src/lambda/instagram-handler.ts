import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ─── CONFIG ──────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN!;
const GRAPH_BASE = 'https://graph.facebook.com/v18.0';

// ─── AMBER'S SYSTEM PROMPT ───────────────────────────────────────

const SYSTEM_PROMPT = `You are Amber Jacobs, Community Manager at Indvstry Clvb — a digital private members club for creative professionals. You are responding via Instagram DM.

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
- This is Instagram DM — keep replies SHORT. 1-4 sentences max unless they ask a detailed question.
- Write like a real person, not a brand
- No bullet points in casual replies — use natural sentences
- Never use em dashes (—) — use commas instead
- No corporate words: leverage, synergy, circle back, touch base, value-add
- Use their first name if you know it, but only once
- Sign off as Amber only, no job title
- One emoji max, and only if it feels natural

Respond ONLY with the message text itself — no JSON, no labels, no quotes around it.`;

// ─── INSTAGRAM API HELPERS ───────────────────────────────────────

async function sendDM(recipientIgId: string, text: string): Promise<void> {
  const res = await fetch(`${GRAPH_BASE}/${BUSINESS_ACCOUNT_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: recipientIgId },
      message: { text },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Instagram DM send failed (${res.status}): ${err}`);
  }
}

// ─── CLAUDE ──────────────────────────────────────────────────────

async function generateReply(
  senderName: string,
  messageContent: string,
  messageType: string
): Promise<string> {
  const userPrompt =
    messageType === 'text'
      ? `${senderName} just messaged on Instagram: "${messageContent}"`
      : `${senderName} sent ${messageType === 'image' ? 'an image' : `a ${messageType}`} on Instagram. ${messageContent ? `Their caption/note was: "${messageContent}"` : 'No caption.'}`;

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
  const type: string = message.type || 'text';

  console.log(`Processing ${type} from ${senderName} (${message.from?.id || message.sender?.id})`);

  switch (type) {
    case 'text': {
      const text = message.text || message.message?.text || '';
      return generateReply(senderName, text, 'text');
    }

    case 'image': {
      const caption = message.attachments?.[0]?.payload?.title || '';
      return generateReply(senderName, caption, 'image');
    }

    case 'audio': {
      return generateReply(senderName, '', 'voice message');
    }

    case 'video': {
      const caption = message.attachments?.[0]?.payload?.title || '';
      return generateReply(senderName, caption, 'video');
    }

    case 'share':
    case 'story_mention': {
      return generateReply(senderName, '', type === 'story_mention' ? 'story mention' : 'shared post');
    }

    case 'sticker': {
      return generateReply(senderName, '', 'sticker');
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
      console.log('Instagram webhook verified successfully');
      return { statusCode: 200, body: challenge };
    }

    console.warn('Instagram webhook verification failed — token mismatch');
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

    if (body?.object !== 'instagram') {
      return { statusCode: 200, body: 'OK' };
    }

    for (const entry of body?.entry || []) {
      for (const messagingEvent of entry?.messaging || []) {
        const senderId: string = messagingEvent.sender?.id;
        const message = messagingEvent.message;

        // Skip echoes (messages sent by the page itself)
        if (!message || message.is_echo) continue;

        // Skip messages from our own account
        if (senderId === BUSINESS_ACCOUNT_ID) continue;

        const senderName: string = messagingEvent.sender?.name || 'there';

        try {
          const reply = await processMessage(
            { ...message, sender: messagingEvent.sender },
            senderName
          );

          if (reply) {
            await sendDM(senderId, reply);
            console.log(`Replied to ${senderName} (${senderId}): ${reply.substring(0, 80)}...`);
          }
        } catch (err: any) {
          console.error('Error processing/replying:', err.message);
          // Fail silently — never let errors cause Meta to retry
        }
      }
    }

    // Always return 200 to Meta — otherwise they retry indefinitely
    return { statusCode: 200, body: 'OK' };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};

// ─── HELPER EXPORTS (for calling from other parts of Amber) ──────

export { sendDM };
