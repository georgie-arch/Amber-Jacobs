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
      scope: 'https://graph.microsoft.com/Mail.Send offline_access'
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

async function main() {
  const token = await getToken();

  const bodyText = `Hi LaToya,

We just wanted to take a moment to say a huge thank you for securing your room at the villa. It genuinely means the world to us and we cannot wait to have you there.

Indvstry Power House is going to be something really special — the kind of week that stays with you long after you have left Cannes. As part of your booking you have everything covered: your villa room, daily transfers between the villa and the Croisette, and your Cannes Lions delegate pass, so you can show up, connect, and fully immerse yourself in the experience without having to think about the logistics.

We want to make sure the week is everything you are hoping for and more, so George, our founder, would love to jump on a quick 30-minute call with you before the event. Even just to properly introduce himself, hear a bit about you and your work, and make sure we are doing everything we can to make this one of the best weeks of your year.

If you are up for it, you can book a time that suits you directly here:
https://calendly.com/itsvisionnaire/30min

No pressure at all, but we would really love to connect before Cannes.

Thank you again, LaToya. We are so excited.`;

  const logoB64 = getLogoBase64();
  const message: any = {
    subject: 'Welcome to Indvstry Power House, LaToya!',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [{ emailAddress: { address: 'latoya.shambo@blackgirldigital.com', name: 'LaToya' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'Amber Jacobs' } }
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
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to LaToya at latoya.shambo@blackgirldigital.com');
}

main().catch(console.error);
