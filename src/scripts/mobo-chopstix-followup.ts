/**
 * mobo-chopstix-followup.ts
 *
 * Follow-up email to MOBO if no reply received by Tuesday 24 March 2026.
 * Checks the inbox for any reply from kanya@mobo.com or mark@mobo.com.
 * Only sends the follow-up if no reply has been received.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/mobo-chopstix-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access',
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

function buildHtml(text: string): string {
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

async function hasReply(token: string): Promise<boolean> {
  try {
    // Search for any message from either MOBO contact about this subject
    const r = await axios.get(
      `https://graph.microsoft.com/v1.0/me/messages?$search="mobo"&$top=20&$select=id,from,subject,receivedDateTime`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const msgs = r.data.value || [];
    return msgs.some((m: any) => {
      const from: string = m.from?.emailAddress?.address?.toLowerCase() || '';
      return from.includes('mobo.com');
    });
  } catch {
    return false;
  }
}

const followUpBody = `Hi Kanya, hi Mark,

Just following up on my email from Sunday. We wanted to check in regarding ticket availability for Chopstix (@chopstiiiix) and his stylist at the MOBOs.

It would mean a lot to the team to be there and we would love to make it work. Please do let me know if you are able to accommodate them.

Thank you so much.`;

async function main() {
  const token = await getToken();

  const replied = await hasReply(token);
  if (replied) {
    console.log('✅ MOBO have already replied — no follow-up needed.');
    return;
  }

  const logoB64 = getLogoBase64();
  const message: any = {
    subject: 'Following Up — Ticket Request for Chopstix (Burna Boy) | MOBO Awards',
    body: { contentType: 'HTML', content: buildHtml(followUpBody) },
    toRecipients: [
      { emailAddress: { address: 'kanya@mobo.com', name: 'Kanya' } },
      { emailAddress: { address: 'mark@mobo.com', name: 'Mark' } },
    ],
    from: {
      emailAddress: {
        address: process.env.EMAIL_USER || '',
        name: 'Amber Jacobs',
      },
    },
  };

  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('✅ MOBO follow-up sent to kanya@mobo.com and mark@mobo.com');
}

main().catch(console.error);
