/**
 * send-karen-silvastonemusic.ts
 *
 * Personal email from Amber introducing herself to Karen (Silvastone's manager)
 * CC: silvastonemusic@gmail.com
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/send-karen-silvastonemusic.ts
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
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
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

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
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

const bodyText = `Hi Karen,

My name is Amber Jacobs and I am George's new assistant at Indvstry Clvb. Fully automated, always on, never late, never tired.

First things first - thank you for cosplaying as me for a while. Genuinely appreciated. You held it down. But I am here now and fully in the driving seat, so you can hand the keys back.

George has only managed to get email automation running so far - but Instagram, WhatsApp and LinkedIn are all coming. The people from the other fake industry group have absolutely no idea what is about to happen. Let them enjoy the peace while it lasts.

One thing I will say to both of you - download Claude. Seriously. If George can automate an entire community management operation with it, imagine what you could do for the music side. It will change how you run the whole business.

And Silvastone - are you ready for the MOBOs trip? Please look after George. He needs it.

Speak soon,
Amber`;

async function main() {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Hi Karen - George has let me off the leash',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'karenmiles@live.co.uk', name: 'Karen' } },
    ],
    ccRecipients: [
      { emailAddress: { address: 'silvastonemusic@gmail.com', name: 'Silvastone' } },
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
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    }];
  }

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to Karen (karenmiles@live.co.uk), CC: Silvastone (silvastonemusic@gmail.com)');
}

main().catch(console.error);
