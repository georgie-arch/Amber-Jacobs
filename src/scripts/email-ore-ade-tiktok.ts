/**
 * Check-in email to Ore Ade at TikTok (ore.ade@tiktok.com) from George.
 * Casual how are things, how are Cannes plans shaping up.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-ore-ade-tiktok.ts
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
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(body: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const formatted = body
    .split('\n\n')
    .map(para => `<p style="margin:0 0 14px 0;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${formatted}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const emailBody = `Hi Ore,

Hope you are doing well. Just wanted to check in and see how things are going your end.

How are your Cannes plans shaping up? Would love to know what TikTok has in store for Lions this year and whether there is anything worth exploring together while we are all out there.

Always good to catch up — let me know if you are around.`;

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Checking in — Cannes plans?',
    body:    { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'ore.ade@tiktok.com', name: 'Ore Ade' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
  };

  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    }];
  }

  try {
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Sent to Ore Ade <ore.ade@tiktok.com>');
  } catch (err: any) {
    console.error(`FAILED: ${err?.response?.data?.error?.message || err.message}`);
  }
}

send().catch(console.error);
