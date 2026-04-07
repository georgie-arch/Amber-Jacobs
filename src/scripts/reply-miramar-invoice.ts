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
  } catch { return ''; }
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

async function main() {
  const token = await getToken();

  // Get the latest message in the Miramar thread to reply to
  const searchRes = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="miramar"&$top=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const msgs = searchRes.data.value || [];
  // Sort by date descending to find the latest
  msgs.sort((a: any, b: any) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime());

  // Find the latest message in the thread (from Coralie or our own sent reply)
  const latestMsg = msgs[0];
  console.log(`Replying to: ${latestMsg.subject} | From: ${latestMsg.from?.emailAddress?.address} | ${latestMsg.receivedDateTime}`);

  const bodyText = `Hi Coralie,

Thank you so much for letting us know. We completely understand and appreciate you getting back to us.

If anything changes and you are able to accommodate a group of 30 on the 23rd June, please do not hesitate to send over a quote or invoice and we will review it straight away. We would love to make it work if the opportunity arises.

Thank you again and we hope to be in touch soon.`;

  const logoB64 = getLogoBase64();
  const replyPayload: any = {
    message: {
      toRecipients: [{ emailAddress: { address: 'events@miramar-plage.fr', name: 'Coralie Fois' } }],
      body: { contentType: 'HTML', content: buildHtmlBody(bodyText) }
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
    `https://graph.microsoft.com/v1.0/me/messages/${latestMsg.id}/reply`,
    replyPayload,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Reply sent to Coralie at Miramar Plage');
}

main().catch(console.error);
