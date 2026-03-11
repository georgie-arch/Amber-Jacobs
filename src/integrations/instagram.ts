import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';
import AmberAgent from '../agent/amber';
import { logger } from '../utils/logger';

dotenv.config();

const GRAPH_API = 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

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

// ─── WEBHOOK HANDLER ─────────────────────────────────────────────

export function setupInstagramWebhook(app: express.Application, agent: AmberAgent): void {
  // Webhook verification
  app.get('/webhooks/instagram', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
      logger.info('✅ Instagram webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  // Webhook events
  app.post('/webhooks/instagram', async (req, res) => {
    res.sendStatus(200); // Respond immediately

    const body = req.body;
    if (body.object !== 'instagram') return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          const msg = change.value;
          
          const amberResponse = await agent.handleInbound({
            platform: 'instagram',
            from: {
              first_name: msg.contacts?.[0]?.profile?.name?.split(' ')[0] || 'there',
              instagram_handle: msg.contacts?.[0]?.profile?.name,
              source: 'instagram_dm'
            },
            content: msg.messages?.[0]?.text?.body || '',
            message_type: 'dm',
            thread_id: msg.messages?.[0]?.context?.id,
            message_id: msg.messages?.[0]?.id
          });

          if (amberResponse && !amberResponse.requires_approval) {
            await sendInstagramDM(msg.sender?.id, amberResponse.message);
          }
        }
      }
    }
  });

  logger.info('✅ Instagram webhook routes registered at /webhooks/instagram');
}
