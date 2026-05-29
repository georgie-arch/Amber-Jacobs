import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';
import AmberAgent from '../agent/amber';
import { logger } from '../utils/logger';

dotenv.config();

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

// ─── KEYWORD TRIGGERS ────────────────────────────────────────────
// When someone comments a trigger word on any post, Amber sends
// them a private DM reply using Instagram's private_replies endpoint.
// This works even if the user has never messaged us before.

const CANNES_DM = `Hey! Thanks for the comment. Here's everything about the Indvstry Power House at Cannes Lions 2026 — our private villa activation bringing together the most senior creative and marketing leaders for the week. All the details are here: https://powerhouse.indvstryclvb.com — Amber x`;

const MEMBERSHIP_DM = `Hey! Thanks for reaching out. Indvstry Clvb is a digital private members club for creative professionals — exclusive events, a curated network, mentorship and collaboration opportunities. Apply here: https://indvstryclvb.com/apply or grab a call with our founder George: https://calendly.com/itsvisionnaire/30min — Amber x`;

const KEYWORD_TRIGGERS: Record<string, string> = {
  CANNES: CANNES_DM,
  POWERHOUSE: CANNES_DM,
  VILLA: CANNES_DM,
  JOIN: MEMBERSHIP_DM,
  MEMBERSHIP: MEMBERSHIP_DM,
  APPLY: MEMBERSHIP_DM,
  MEMBER: MEMBERSHIP_DM,
};

async function handleCommentKeyword(
  commentId: string,
  commentText: string,
  commenterName: string
): Promise<boolean> {
  const upper = commentText.trim().toUpperCase();

  for (const [keyword, dmMessage] of Object.entries(KEYWORD_TRIGGERS)) {
    if (upper.includes(keyword)) {
      logger.info(`🔑 Keyword "${keyword}" detected from ${commenterName} — sending private reply DM`);
      try {
        // Use private_replies endpoint — works for any commenter, no prior DM needed
        await axios.post(
          `${GRAPH_API}/${commentId}/private_replies`,
          { message: dmMessage },
          { params: { access_token: ACCESS_TOKEN } }
        );
        logger.info(`✅ Private reply DM sent for keyword "${keyword}"`);
        return true;
      } catch (err: any) {
        logger.error(`Private reply DM failed:`, err.response?.data || err.message);
      }
    }
  }
  return false;
}

// ─── GET DMs (Instagram Inbox) ───────────────────────────────────

export async function getInstagramDMs(): Promise<any[]> {
  if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) {
    logger.warn('Instagram credentials not configured');
    return [];
  }

  try {
    const response = await axios.get(
      `${GRAPH_API}/${BUSINESS_ACCOUNT_ID}/conversations`,
      {
        params: {
          access_token: ACCESS_TOKEN,
          fields: 'messages{message,from,created_time}',
          platform: 'instagram'
        }
      }
    );

    return response.data?.data || [];
  } catch (error: any) {
    logger.error('Error fetching Instagram DMs:', error.response?.data || error.message);
    return [];
  }
}

// ─── SEND DM ────────────────────────────────────────────────────

export async function sendInstagramDM(recipientIgId: string, message: string): Promise<boolean> {
  if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) return false;

  try {
    await axios.post(
      `${GRAPH_API}/${BUSINESS_ACCOUNT_ID}/messages`,
      {
        recipient: { id: recipientIgId },
        message: { text: message }
      },
      { params: { access_token: ACCESS_TOKEN } }
    );

    logger.info(`✅ Instagram DM sent to ${recipientIgId}`);
    return true;
  } catch (error: any) {
    logger.error('Instagram DM failed:', error.response?.data || error.message);
    return false;
  }
}

// ─── GET COMMENTS ON POSTS ───────────────────────────────────────

export async function getRecentPostComments(postId: string): Promise<any[]> {
  if (!ACCESS_TOKEN) return [];

  try {
    const response = await axios.get(
      `${GRAPH_API}/${postId}/comments`,
      {
        params: {
          access_token: ACCESS_TOKEN,
          fields: 'text,username,id,timestamp,from'
        }
      }
    );

    return response.data?.data || [];
  } catch (error: any) {
    logger.error('Error fetching comments:', error.response?.data || error.message);
    return [];
  }
}

// ─── REPLY TO COMMENT ────────────────────────────────────────────

export async function replyToComment(commentId: string, message: string): Promise<boolean> {
  if (!ACCESS_TOKEN) return false;

  try {
    await axios.post(
      `${GRAPH_API}/${commentId}/replies`,
      { message },
      { params: { access_token: ACCESS_TOKEN } }
    );

    logger.info(`✅ Replied to Instagram comment ${commentId}`);
    return true;
  } catch (error: any) {
    logger.error('Comment reply failed:', error.response?.data || error.message);
    return false;
  }
}

// ─── POST COMMENT ON SOMEONE'S POST ─────────────────────────────

export async function commentOnPost(mediaId: string, comment: string): Promise<boolean> {
  if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) return false;

  try {
    await axios.post(
      `${GRAPH_API}/${mediaId}/comments`,
      { message: comment },
      { params: { access_token: ACCESS_TOKEN } }
    );

    logger.info(`✅ Posted comment on ${mediaId}`);
    return true;
  } catch (error: any) {
    logger.error('Post comment failed:', error.response?.data || error.message);
    return false;
  }
}

// ─── GET RECENT MEDIA ────────────────────────────────────────────

export async function getRecentMedia(limit = 10): Promise<any[]> {
  if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) return [];

  try {
    const response = await axios.get(
      `${GRAPH_API}/${BUSINESS_ACCOUNT_ID}/media`,
      {
        params: {
          access_token: ACCESS_TOKEN,
          fields: 'id,caption,media_type,timestamp,comments_count,like_count',
          limit
        }
      }
    );

    return response.data?.data || [];
  } catch (error: any) {
    logger.error('Error fetching media:', error.response?.data || error.message);
    return [];
  }
}

// ─── PROCESS ALL INSTAGRAM ACTIVITY ─────────────────────────────

export async function processInstagramActivity(agent: AmberAgent): Promise<void> {
  logger.info('📸 Processing Instagram activity...');

  // 1. Handle DMs
  const conversations = await getInstagramDMs();
  for (const conv of conversations) {
    const messages = conv.messages?.data || [];
    const latestMessage = messages[0];
    
    if (!latestMessage) continue;
    
    // Only process messages sent TO us (not from us)
    if (latestMessage.from?.id === BUSINESS_ACCOUNT_ID) continue;

    logger.info(`💬 New Instagram DM from ${latestMessage.from?.username || 'unknown'}`);

    const amberResponse = await agent.handleInbound({
      platform: 'instagram',
      from: {
        first_name: latestMessage.from?.name?.split(' ')[0] || latestMessage.from?.username || 'there',
        instagram_handle: latestMessage.from?.username,
        source: 'instagram_dm'
      },
      content: latestMessage.message,
      message_type: 'dm',
      thread_id: conv.id,
      message_id: latestMessage.id
    });

    if (amberResponse && !amberResponse.requires_approval) {
      await sendInstagramDM(latestMessage.from.id, amberResponse.message);
    }
  }

  // 2. Handle Comments on our posts
  const media = await getRecentMedia(5);
  for (const post of media) {
    const comments = await getRecentPostComments(post.id);
    
    for (const comment of comments) {
      if (comment.username === process.env.AMBER_IG_USERNAME) continue; // skip our own comments
      
      logger.info(`💬 Comment from @${comment.username}: ${comment.text.substring(0, 50)}`);

      const amberResponse = await agent.handleInbound({
        platform: 'instagram',
        from: {
          first_name: comment.username,
          instagram_handle: comment.username,
          source: 'instagram_comment'
        },
        content: comment.text,
        message_type: 'comment',
        message_id: comment.id,
        metadata: { post_id: post.id, post_caption: post.caption }
      });

      if (amberResponse && !amberResponse.requires_approval) {
        await replyToComment(comment.id, amberResponse.message);
      }
    }
  }
}

// ─── GET FOLLOWERS COUNT ─────────────────────────────────────────
// Note: Instagram Graph API does not expose a follower list endpoint.
// We can only read the count. Welcome DMs use the webhook approach instead.

export async function getFollowersCount(): Promise<number> {
  if (!ACCESS_TOKEN || !BUSINESS_ACCOUNT_ID) return 0;

  try {
    const response = await axios.get(
      `${GRAPH_API}/${BUSINESS_ACCOUNT_ID}`,
      { params: { access_token: ACCESS_TOKEN, fields: 'followers_count' } }
    );
    return response.data?.followers_count || 0;
  } catch (error: any) {
    logger.error('Error fetching follower count:', error.response?.data || error.message);
    return 0;
  }
}

// ─── SEND WELCOME DMs TO NEW FOLLOWERS ──────────────────────────
// Instagram Graph API has no endpoint to list followers.
// Welcome DMs are sent when a new follower triggers a webhook
// messaging event (they DM us first). This polling fallback is a no-op.

export async function sendInstagramWelcomeDMs(_agent: AmberAgent): Promise<void> {
  logger.info('👋 Instagram welcome DMs: handled via webhook on first DM contact (no follower list API)');
}

// ─── WEBHOOK HANDLER ─────────────────────────────────────────────

export function setupInstagramWebhook(app: express.Application, agent: AmberAgent): void {
  // Webhook verification
  app.get('/webhooks/instagram', (req, res) => {
    const mode = String(req.query['hub.mode'] || '');
    const token = String(req.query['hub.verify_token'] || '');
    const challenge = String(req.query['hub.challenge'] || '');
    const expected = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || '';

    // Log everything so we can see exactly what's being compared in Render logs
    console.log('[IG VERIFY] mode:', mode);
    console.log('[IG VERIFY] token received:', token);
    console.log('[IG VERIFY] token expected:', expected);
    console.log('[IG VERIFY] match:', token === expected);
    console.log('[IG VERIFY] challenge:', challenge);

    if (mode === 'subscribe' && token === expected) {
      logger.info('✅ Instagram webhook verified');
      res.status(200).send(challenge);
    } else {
      logger.warn(`Instagram webhook verification failed — token mismatch or wrong mode`);
      res.sendStatus(403);
    }
  });

  // Webhook events
  app.post('/webhooks/instagram', async (req, res) => {
    res.sendStatus(200); // Respond immediately to Meta — never let it retry

    const body = req.body;
    if (body.object !== 'instagram') return;

    for (const entry of body.entry || []) {

      // ─── COMMENT KEYWORD TRIGGERS ─────────────────────────────
      // Fires when someone comments on any of our posts.
      // Requires 'comments' field subscribed in Meta webhook settings.
      for (const change of entry.changes || []) {
        if (change.field === 'comments') {
          const commentData = change.value;
          const commentId: string = commentData?.id || '';
          const commentText: string = commentData?.text || '';
          const commenterName: string = commentData?.from?.name || commentData?.from?.username || 'there';
          const commenterId: string = commentData?.from?.id || '';

          // Skip our own comments
          if (commenterId === BUSINESS_ACCOUNT_ID) continue;

          if (commentId && commentText) {
            try {
              await handleCommentKeyword(commentId, commentText, commenterName);
            } catch (err: any) {
              logger.error('Comment keyword handler error:', err.message);
            }
          }
        }
      }

      // ─── DIRECT MESSAGES (entry.changes[field=messages]) ─────────
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          const msg = change.value;
          const senderId: string = msg?.sender?.id || '';
          const messageText: string = msg?.message?.text || msg?.message?.attachments?.[0]?.type || '';
          const messageId: string = msg?.message?.mid || '';
          const isEcho: boolean = msg?.message?.is_echo || false;

          if (!senderId || isEcho || senderId === BUSINESS_ACCOUNT_ID) continue;

          try {
            const amberResponse = await agent.handleInbound({
              platform: 'instagram',
              from: {
                first_name: 'there',
                source: 'instagram_dm'
              },
              content: messageText,
              message_type: 'dm',
              message_id: messageId
            });

            if (amberResponse && !amberResponse.requires_approval) {
              await sendInstagramDM(senderId, amberResponse.message);
            }
          } catch (err: any) {
            logger.error('DM handler error:', err.message);
          }
        }
      }

      // ─── DIRECT MESSAGES (entry.messaging — Messenger-style) ──────
      for (const messagingEvent of entry?.messaging || []) {
        const senderId: string = messagingEvent.sender?.id;
        const message = messagingEvent.message;

        if (!message || message.is_echo || senderId === BUSINESS_ACCOUNT_ID) continue;

        const senderName: string = messagingEvent.sender?.name || 'there';

        // Determine content/type — handle story mentions, shares, attachments
        let messageText: string = message.text || '';
        let messageType: string = 'dm';

        if (message.attachments?.length) {
          const attach = message.attachments[0];
          if (attach.type === 'story_mention') {
            messageText = '(mentioned us in their story)';
            messageType = 'story_mention';
          } else if (attach.type === 'share') {
            messageText = attach.payload?.title || '(shared a post)';
            messageType = 'share';
          } else if (attach.type === 'image') {
            messageText = attach.payload?.title || '(sent an image)';
            messageType = 'image';
          } else if (attach.type === 'video') {
            messageText = attach.payload?.title || '(sent a video)';
            messageType = 'video';
          } else if (attach.type === 'audio') {
            messageText = '(sent a voice message)';
            messageType = 'audio';
          }
        }

        try {
          const amberResponse = await agent.handleInbound({
            platform: 'instagram',
            from: {
              first_name: senderName.split(' ')[0] || 'there',
              source: 'instagram_dm'
            },
            content: messageText,
            message_type: messageType,
            message_id: message.mid,
            thread_id: messagingEvent.thread_id
          });

          if (amberResponse && !amberResponse.requires_approval) {
            await sendInstagramDM(senderId, amberResponse.message);
          }
        } catch (err: any) {
          logger.error('Messaging event handler error:', err.message);
        }
      }
    }
  });

  logger.info('✅ Instagram webhook routes registered at /webhooks/instagram');
}
