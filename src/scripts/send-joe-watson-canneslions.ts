/**
 * send-joe-watson-canneslions.ts
 *
 * Email from George (+ Cyril) to Joe Watson and James Tortice at Cannes Lions
 * CC: Michaela Washmon, Cyril Utterodt
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/send-joe-watson-canneslions.ts
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

const bodyText = `Hi Joe,

Cyril and I just wanted to reach out and say thank you - to you, James, and Michaela - for all the help and support around the villa conversations this year. We genuinely appreciate the time and energy you all put in to explore options with us.

After a lot of back and forth, we have decided to go in a different direction for this year's activation. We are running our own independent programme during festival week and have already got things moving on that front. It was simply a matter of timing rather than anything else.

That said, Cyril and I are very much looking at this as the beginning of something bigger. Our ambition for next year is to go on a completely different level - and we would love to start those conversations now rather than waiting until the spring. What we are building has a genuine place within the official Cannes Lions programme, and we think there is a really interesting opportunity to explore how Indvstry could integrate directly with Cannes Lions rather than operating on the fringe.

We have plans for AI automation panels, creative industry conversations, and a broader programme that we think would sit naturally alongside what Cannes Lions stands for. It would be great to get on a call soon and talk through what that could look like - both for 2027 and potentially for some involvement this June too.

Would love to find a time to connect. Let us know what works.

George and Cyril
Indvstry Clvb`;

async function main() {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Cannes Lions 2026 - thank you + what is next',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'joew@canneslions.com',   name: 'Joe' } },
      { emailAddress: { address: 'jamest@canneslions.com', name: 'James' } },
    ],
    ccRecipients: [
      { emailAddress: { address: 'michaelaw@canneslions.com', name: 'Michaela' } },
      { emailAddress: { address: 'Cyrillutterodt@gmail.com',  name: 'Cyril' } },
    ],
    from: {
      emailAddress: {
        address: process.env.EMAIL_USER || '',
        name: 'George Guise',
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

  console.log('Email sent to Joe Watson + James Tortice (CC: Michaela Washmon, Cyril Utterodt)');
}

main().catch(console.error);
