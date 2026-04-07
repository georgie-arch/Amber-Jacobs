/**
 * send-denise-boateng.ts
 *
 * Personal email from George to Denise Boateng (Cannes Lions / Informa)
 * CC: Cyril Utterodt
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/send-denise-boateng.ts
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

const bodyText = `Hi Denise,

I have been meaning to write this for a little while - Cyril and I both wanted to say a proper thank you for taking the time to meet with us in person a few weeks ago. It genuinely meant a lot. You are one of those people who brings real warmth and intention to everything you do, and the guidance and perspective you shared with us that day was invaluable. The work you do for people and communities does not go unnoticed.

I wanted to update you on where things stand on our end. We have now officially announced our activation for Cannes Lions 2026 - Indvstry Power House - and things are moving quickly. We are really excited about what this year looks like.

But honestly, the bigger conversation I want to have is about next year. We want to get the ball rolling now rather than scrambling in the spring. As I recall from our meeting, you mentioned there was someone on the Cannes Lions side who would be the right person to introduce us to - someone who could really push things forward when it comes to us getting on the official programme. That introduction would mean a great deal to us if you are still open to making it.

Our vision for next year is significantly more ambitious. We are planning workshops, activations, and a full programme in the AI automation space - and we are thinking of bringing speakers of real weight to the table, including the CEO of Highfield AI and others at that level. We genuinely believe this sits naturally within what Cannes Lions stands for and we want to build it properly from the inside out.

Would love to find a time to catch up with you soon and talk through all of this. Even a quick call would be brilliant.

Thank you again, Denise - for your time, your warmth, and everything you do.

George`;

async function main() {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Great meeting you - and what is next for us at Cannes Lions',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'Denise.Boateng@informa.com', name: 'Denise' } },
    ],
    ccRecipients: [
      { emailAddress: { address: 'Cyrillutterodt@gmail.com', name: 'Cyril' } },
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

  console.log('Email sent to Denise Boateng (CC: Cyril Utterodt)');
}

main().catch(console.error);
