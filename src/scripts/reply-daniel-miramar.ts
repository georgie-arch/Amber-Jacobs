import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

async function getToken() {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch {
    return '';
  }
}

function buildHtmlBody(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

async function replyToMessage(token: string, messageId: string, toEmail: string, toName: string, bodyText: string) {
  const logoB64 = getLogoBase64();
  const htmlContent = buildHtmlBody(bodyText);

  const replyPayload: any = {
    message: {
      toRecipients: [{ emailAddress: { address: toEmail, name: toName } }],
      body: { contentType: 'HTML', content: htmlContent }
    }
  };

  if (logoB64) {
    replyPayload.message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true
    }];
  }

  await axios.post(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}/reply`,
    replyPayload,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function main() {
  const token = await getToken();

  // --- Reply to Daniel Dewhirst ---
  // His last message ID: AAMkAGQ0YzBjNjQyLWNiYjktNGViZi1iMTlmLTNjY2ZmMjcwNjhmMABGAAAAAABc0NhjdSMQQr10DEVFlFItBwDl3AXJPdYMTJUUDw_0zGCuAAAAAAEMAADl3AXJPdYMTJUUDw_0zGCuAAKrxs6GAAA=
  const danielMessageId = 'AAMkAGQ0YzBjNjQyLWNiYjktNGViZi1iMTlmLTNjY2ZmMjcwNjhmMABGAAAAAABc0NhjdSMQQr10DEVFlFItBwDl3AXJPdYMTJUUDw_0zGCuAAAAAAEMAADl3AXJPdYMTJUUDw_0zGCuAAKrxs6GAAA=';
  const danielReply = `Hi Daniel,

That is completely understood, and honestly the warmth and effort you put into your message really did stand out to us. We hope it is clear how much we appreciated hearing from you.

Wishing you all the very best with everything coming up. You will have to let us know how things go!

Take care and hopefully our paths will cross again.`;

  try {
    await replyToMessage(token, danielMessageId, 'danieldewhirst@me.com', 'Daniel Dewhirst', danielReply);
    console.log('Replied to Daniel Dewhirst');
  } catch (e: any) {
    console.error('Daniel reply failed:', e?.response?.data || e.message);
  }

  // --- Reply to Miramar Plage ---
  // Coralie's message ID: AAMkAGQ0YzBjNjQyLWNiYjktNGViZi1iMTlmLTNjY2ZmMjcwNjhmMABGAAAAAABc0NhjdSMQQr10DEVFlFItBwDl3AXJPdYMTJUUDw_0zGCuAAAAAAEMAADl3AXJPdYMTJUUDw_0zGCuAAKrxs6FAAA=
  const miramarMessageId = 'AAMkAGQ0YzBjNjQyLWNiYjktNGViZi1iMTlmLTNjY2ZmMjcwNjhmMABGAAAAAABc0NhjdSMQQr10DEVFlFItBwDl3AXJPdYMTJUUDw_0zGCuAAAAAAEMAADl3AXJPdYMTJUUDw_0zGCuAAKrxs6FAAA=';
  const miramarReply = `Hi Coralie,

Thank you so much for coming back to me. That is a shame as your venue is exactly the kind of setting we were looking for, but we completely understand.

We will keep Miramar Plage in mind for future events and hope to be in touch again soon.

All the best and thank you again for your time.`;

  try {
    await replyToMessage(token, miramarMessageId, 'events@miramar-plage.fr', 'Coralie Fois', miramarReply);
    console.log('Replied to Miramar Plage (Coralie)');
  } catch (e: any) {
    console.error('Miramar reply failed:', e?.response?.data || e.message);
  }
}

main().catch(console.error);
