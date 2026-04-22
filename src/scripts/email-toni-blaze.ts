/**
 * Email to Toni Blaze Ibekwe (ex Editor in Chief, Wondaland Magazine)
 * Toniblazeibekwe@gmail.com — IPH villa residency, delegate pass, strategic partnership
 * From George.
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
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const body = `Hi Toni,

It was amazing touching base with you last week. Really glad we had the call — it felt like a genuinely exciting conversation and I have been thinking about it since.

As I mentioned, we are hosting Indvstry Power House alongside Cannes Lions from 21 to 26 June this year. A luxury private villa just outside Cannes, a curated group of residents, private dinners and events throughout the week with some of the most senior people in global media, marketing and culture. You can view our latest sponsorship deck here — this is what we are currently sharing with potential partners: https://canva.link/j9tgb9z2annevnz

You can also see everything we have put together at: Powerhouse.indvstryclvb.com

Beyond the villa itself, we have been gifted 21 Cannes Lions festival delegate passes this year by the Lions team, each worth £5,000. We are using these strategically — placing them with the right people who can help us build meaningful brand partnerships around the activation.

Based on your background and experience, and particularly after hearing about what you and Lisa are building together with the new agency, I genuinely think you are the right person to have in this conversation. Cannes Lions is exactly the environment where the brands and creators you will be working with are all in one place at the same time. The relationships and conversations that come out of a week like that can define what the next year looks like.

I am very open to extending one of our delegate passes to you — worth £5,000 for the full festival — on the basis that you are able to bring this in front of brands who would have a genuine interest in activating with us at the villa. I think the fit is there and I would love to explore what that looks like together.

Would be great to get on another call and talk through the details. Let me know what works for you.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Great to connect — Indvstry Power House, Cannes Lions 2026',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: 'Toniblazeibekwe@gmail.com', name: 'Toni Blaze' } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
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
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Sent to Toni Blaze <Toniblazeibekwe@gmail.com>');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
