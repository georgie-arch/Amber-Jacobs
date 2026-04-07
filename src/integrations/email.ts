import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import axios from 'axios';
import dotenv from 'dotenv';
import AmberAgent, { AmberResponse } from '../agent/amber';
import { logger } from '../utils/logger';

dotenv.config();

// ─── EMAIL TRANSPORT ─────────────────────────────────────────────
// Supports two providers — set EMAIL_PROVIDER in .env:
//   EMAIL_PROVIDER=outlook  → Microsoft 365 via Graph API OAuth2
//   EMAIL_PROVIDER=gmail    → Gmail via OAuth2 (default)

// ─── MICROSOFT GRAPH API EMAIL ───────────────────────────────────
// Used when EMAIL_PROVIDER=outlook
// Bypasses SMTP auth (which Microsoft 365 disables by default)
// Requires: OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, OUTLOOK_TENANT_ID, OUTLOOK_REFRESH_TOKEN

async function getOutlookAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

export async function sendEmailViaGraph(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const accessToken = await getOutlookAccessToken();
    const sender = process.env.EMAIL_USER || '';
    const logoB64 = getLogoBase64();

    const message: any = {
      subject,
      body: { contentType: 'HTML', content: formatEmailHtml(body) },
      toRecipients: [{ emailAddress: { address: to } }],
      from: { emailAddress: { address: sender, name: process.env.AMBER_NAME || 'Amber Jacobs' } }
    };

    if (logoB64) {
      message.attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'indvstry-logo.png',
        contentType: 'image/png',
        contentBytes: logoB64,
        contentId: 'indvstry-logo',
        isInline: true
      }];
    }

    await axios.post(
      `https://graph.microsoft.com/v1.0/me/sendMail`,
      { message },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    logger.info(`✉️  Email sent via Graph API to ${to}: ${subject}`);
    return true;
  } catch (error: any) {
    logger.error('Graph API email failed:', error?.response?.data || error.message);
    return false;
  }
}

export async function createEmailTransport() {
  // Gmail OAuth2
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token as string
    }
  });
}

// Sender address
function senderAddress(): string {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';
  return provider === 'outlook'
    ? (process.env.EMAIL_USER || '')
    : (process.env.GMAIL_USER || '');
}

// ─── SEND EMAIL ─────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  replyTo?: string
): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  // Microsoft 365 — use Graph API (SMTP auth is disabled by default)
  if (provider === 'outlook') {
    return sendEmailViaGraph(to, subject, body);
  }

  // Gmail — use nodemailer OAuth2
  try {
    const transport = await createEmailTransport();
    const from = senderAddress();

    await transport.sendMail({
      from: `"${process.env.AMBER_NAME || 'Amber Jacobs'}" <${from}>`,
      to,
      subject,
      text: body,
      html: formatEmailHtml(body),
      replyTo: replyTo || from
    });

    logger.info(`✉️  Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error('Email send failed:', error);
    return false;
  }
}

// ─── SEND AMBER RESPONSE AS EMAIL ───────────────────────────────

export async function sendAmberEmail(response: AmberResponse, recipientEmail: string): Promise<boolean> {
  if (response.requires_approval) {
    logger.info(`⏳ Email to ${recipientEmail} queued for George's approval`);
    await notifyGeorgeForApproval(response, recipientEmail);
    return false;
  }

  return sendEmail(
    recipientEmail,
    response.subject || 'Message from Indvstry Clvb',
    response.message
  );
}

// ─── NOTIFY GEORGE FOR APPROVAL ─────────────────────────────────

async function notifyGeorgeForApproval(response: AmberResponse, recipient: string): Promise<void> {
  if (!process.env.FOUNDER_EMAIL) return;

  const approvalMessage = `
Hi George,

Amber has drafted a message that needs your approval before sending.

TO: ${recipient}
PLATFORM: ${response.platform}
SUBJECT: ${response.subject || 'N/A'}

--- MESSAGE ---
${response.message}
---------------

AMBER'S NOTES: ${response.tone_notes}
FOLLOW-UP IN: ${response.follow_up_in_days ? `${response.follow_up_in_days} days` : 'none scheduled'}

Reply to this email with APPROVE or REJECT.
(Or set AUTO_SEND=true in .env to skip this step)
`;

  await sendEmail(
    process.env.FOUNDER_EMAIL,
    `[Approval needed] Message to ${recipient}`,
    approvalMessage
  );
}

// ─── OUTLOOK INBOX READER (Microsoft Graph API) ─────────────────
// Fetches unread messages, runs them through Amber, replies in-thread.

async function readUnrepliedEmailsOutlook(agent: AmberAgent): Promise<void> {
  const senderAddress = process.env.EMAIL_USER || '';

  try {
    const accessToken = await getOutlookAccessToken();

    // Fetch unread messages in inbox, newest first, skip our own sent items
    const listRes = await axios.get(
      'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          $filter: 'isRead eq false',
          $select: 'id,subject,from,body,conversationId,receivedDateTime,toRecipients,internetMessageHeaders',
          $orderby: 'receivedDateTime desc',
          $top: 15,
        },
      }
    );

    const messages: any[] = listRes.data.value || [];

    if (messages.length === 0) {
      logger.info('📬 Outlook inbox — no unread messages');
      return;
    }

    logger.info(`📬 Outlook inbox — ${messages.length} unread message(s)`);

    for (const msg of messages) {
      const fromEmail: string = msg.from?.emailAddress?.address || '';
      const fromName: string = msg.from?.emailAddress?.name || '';

      // Skip emails sent from our own account (drafts / sent loop guard)
      if (fromEmail.toLowerCase() === senderAddress.toLowerCase()) continue;

      // Skip bulk/automated/marketing mail — only process genuine human replies
      if (isAutomatedEmail(fromEmail, msg)) continue;

      const subject: string = msg.subject || '(no subject)';
      const bodyContent: string = stripHtml(msg.body?.content || '');
      const conversationId: string = msg.conversationId || msg.id;

      logger.info(`📧 Processing reply from ${fromEmail}: ${subject}`);

      // Pull thread history so Amber has full context
      const threadContext = await getOutlookThreadContext(accessToken, conversationId, msg.id);

      const taskNote = threadContext
        ? `\n\nThread context (earlier messages in this conversation):\n${threadContext}`
        : '';

      const amberResponse = await agent.handleInbound({
        platform: 'email',
        from: {
          first_name: fromName.split(' ')[0] || fromEmail,
          last_name: fromName.split(' ').slice(1).join(' ') || undefined,
          email: fromEmail,
          source: 'email_inbound',
        },
        content: bodyContent + taskNote,
        subject,
        thread_id: conversationId,
        message_id: msg.id,
      });

      if (amberResponse) {
        if (!amberResponse.requires_approval) {
          // Reply in-thread via Graph API
          await replyOutlookInThread(accessToken, msg.id, amberResponse.message);
          logger.info(`✅ Replied to ${fromEmail} in thread`);
        } else {
          await notifyGeorgeForApproval(amberResponse, fromEmail);
        }
      }

      // Mark as read
      await axios.patch(
        `https://graph.microsoft.com/v1.0/me/messages/${msg.id}`,
        { isRead: true },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    logger.error('Outlook inbox read failed:', error?.response?.data || error.message);
  }
}

// Fetch earlier messages in the same conversation thread for context
async function getOutlookThreadContext(
  accessToken: string,
  conversationId: string,
  currentMessageId: string
): Promise<string | null> {
  try {
    const res = await axios.get(
      'https://graph.microsoft.com/v1.0/me/messages',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          $filter: `conversationId eq '${conversationId}'`,
          $select: 'subject,from,body,sentDateTime',
          $orderby: 'sentDateTime asc',
          $top: 10,
        },
      }
    );

    const thread: any[] = (res.data.value || []).filter((m: any) => m.id !== currentMessageId);
    if (!thread.length) return null;

    return thread.map((m: any) => {
      const from = m.from?.emailAddress?.name || m.from?.emailAddress?.address || 'Unknown';
      const date = m.sentDateTime ? new Date(m.sentDateTime).toDateString() : '';
      const body = stripHtml(m.body?.content || '').substring(0, 300);
      return `[${date}] ${from}: ${body}`;
    }).join('\n\n');
  } catch {
    return null;
  }
}

// Reply to a specific message in-thread (keeps the conversation together)
async function replyOutlookInThread(
  accessToken: string,
  messageId: string,
  replyText: string
): Promise<void> {
  const logoB64 = getLogoBase64();

  const replyMessage: any = {
    message: {
      body: { contentType: 'HTML', content: formatEmailHtml(replyText) },
      from: {
        emailAddress: {
          address: process.env.EMAIL_USER || '',
          name: process.env.AMBER_NAME || 'Amber Jacobs',
        },
      },
    },
  };

  if (logoB64) {
    replyMessage.message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}/reply`,
    replyMessage,
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );
}

// Detect automated / marketing / bulk emails that Amber should ignore
function isAutomatedEmail(fromEmail: string, msg: any): boolean {
  const email = fromEmail.toLowerCase();

  // No-reply / donotreply senders
  const automatedPatterns = [
    'noreply', 'no-reply', 'donotreply', 'do-not-reply',
    'notifications@', 'notification@', 'newsletter@', 'news@',
    'marketing@', 'info@mail.', 'mail@mail.', 'updates@',
    'subscriptions@', 'digest@', 'alert@', 'alerts@',
    'bounce@', 'mailer@', 'autorespond', 'campaigns@',
  ];
  if (automatedPatterns.some(p => email.includes(p))) return true;

  // Check internet message headers for bulk/list indicators
  const headers: any[] = msg.internetMessageHeaders || [];
  const hasListHeader = headers.some((h: any) =>
    ['List-Unsubscribe', 'List-ID', 'Precedence', 'X-Mailer', 'X-Campaign'].includes(h.name) ||
    (h.name === 'Precedence' && ['bulk', 'list', 'junk'].includes((h.value || '').toLowerCase()))
  );
  if (hasListHeader) return true;

  return false;
}

// Strip HTML tags from email body for plain-text processing
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── READ INBOX (for inbound handling) ──────────────────────────
// Routes to Outlook or Gmail based on EMAIL_PROVIDER in .env

export async function readUnrepliedEmails(agent: AmberAgent): Promise<void> {
  if (process.env.EMAIL_PROVIDER === 'outlook') {
    return readUnrepliedEmailsOutlook(agent);
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_REFRESH_TOKEN) {
    logger.warn('Gmail credentials not configured — skipping inbox read');
    return;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread to:me -from:me',
      maxResults: 10
    });

    const messages = response.data.messages || [];
    
    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full'
      });

      const headers = detail.data.payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const body = extractEmailBody(detail.data.payload);

      // Parse sender info
      const emailMatch = from.match(/<(.+)>/);
      const nameMatch = from.match(/^([^<]+)/);
      const senderEmail = emailMatch ? emailMatch[1].trim() : from.trim();
      const senderName = nameMatch ? nameMatch[1].trim() : '';

      logger.info(`📧 Processing email from ${senderEmail}: ${subject}`);

      const amberResponse = await agent.handleInbound({
        platform: 'email',
        from: {
          first_name: senderName.split(' ')[0] || senderEmail,
          last_name: senderName.split(' ').slice(1).join(' ') || undefined,
          email: senderEmail,
          source: 'email_inbound'
        },
        content: body,
        subject,
        thread_id: detail.data.threadId || undefined,
        message_id: msg.id || undefined
      });

      if (amberResponse) {
        if (!amberResponse.requires_approval) {
          await sendEmail(senderEmail, `Re: ${subject}`, amberResponse.message);
        } else {
          await notifyGeorgeForApproval(amberResponse, senderEmail);
        }
      }

      // Mark as read
      await gmail.users.messages.modify({
        userId: 'me',
        id: msg.id!,
        requestBody: { removeLabelIds: ['UNREAD'] }
      });
    }
  } catch (error) {
    logger.error('Error reading emails:', error);
  }
}

// ─── SEND PENDING EMAIL FOLLOW-UPS ──────────────────────────────

export async function sendPendingEmailFollowUps(agent: AmberAgent): Promise<void> {
  const memory = agent.getMemory();
  const followUps = memory.getPendingFollowUps().filter(f => f.platform === 'email');

  if (followUps.length === 0) {
    logger.info('📬 No pending email follow-ups');
    return;
  }

  logger.info(`📧 Processing ${followUps.length} pending email follow-ups...`);

  for (const followUp of followUps) {
    const contact = memory.getContactById(followUp.contact_id);
    if (!contact?.email) {
      logger.warn(`No email for contact ${followUp.contact_id}, skipping`);
      continue;
    }

    const task = `
Generate a follow-up email.
Task type: ${followUp.task_type}
Draft note: ${followUp.draft_message}
Subject hint: ${followUp.subject || 'Follow up'}

Check their history above. Professional but warm tone. Make it feel personal, not templated.
`;

    const response = await agent.generateResponse(task, followUp.contact_id);

    if (!response.requires_approval) {
      const sent = await sendEmail(
        contact.email,
        response.subject || followUp.subject || 'From Amber @ Indvstry Clvb',
        response.message
      );
      if (sent) {
        memory.markFollowUpComplete(followUp.id);
        memory.logActivity('email_followup_sent', 'email', followUp.contact_id);
      }
    } else {
      await notifyGeorgeForApproval(response, contact.email);
      logger.info(`⏳ Email follow-up to ${contact.email} queued for George's approval`);
    }
  }
}

// ─── HELPERS ────────────────────────────────────────────────────

function extractEmailBody(payload: any): string {
  if (!payload) return '';
  
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    for (const part of payload.parts) {
      const nested = extractEmailBody(part);
      if (nested) return nested;
    }
  }
  
  return '';
}

function getLogoBase64(): string {
  try {
    const logoPath = require('path').resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return require('fs').readFileSync(logoPath).toString('base64');
  } catch {
    return '';
  }
}

function formatEmailHtml(text: string): string {
  const logo = getLogoBase64();
  const logoHtml = logo
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">${process.env.AMBER_NAME || 'Amber Jacobs'}</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;
}
