import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import AmberAgent, { AmberResponse } from '../agent/amber';
import { logger } from '../utils/logger';

dotenv.config();

// ─── GMAIL OAUTH2 SETUP ─────────────────────────────────────────

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

export async function createEmailTransport() {
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

// ─── SEND EMAIL ─────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  replyTo?: string
): Promise<boolean> {
  try {
    const transport = await createEmailTransport();
    
    await transport.sendMail({
      from: `"${process.env.AMBER_NAME || 'Amber Jacobs'}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: formatEmailHtml(body),
      replyTo: replyTo || process.env.GMAIL_USER
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

// ─── READ INBOX (for inbound handling) ─────────────────────────

export async function readUnrepliedEmails(agent: AmberAgent): Promise<void> {
  try {
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

function formatEmailHtml(text: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.6; }
    .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 13px; }
    .club-name { font-weight: bold; color: #1a1a1a; }
  </style>
</head>
<body>
  ${text.replace(/\n/g, '<br>')}
  <div class="signature">
    <span class="club-name">Indvstry Clvb</span><br>
    Digital Private Members Club for Creative Professionals<br>
    <a href="${process.env.CLUB_WEBSITE || 'https://indvstryclvb.com'}">${process.env.CLUB_WEBSITE || 'indvstryclvb.com'}</a>
  </div>
</body>
</html>
`;
}
