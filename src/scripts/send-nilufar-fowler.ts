/**
 * send-nilufar-fowler.ts
 *
 * Personal email from George to Nilufar Fowler (WPP)
 * Sending residents deck and Power House info
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/send-nilufar-fowler.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const RESIDENTS_DECK = 'https://www.canva.com/design/DAHDG7zIc5o/4mGYl4LoucAvSTUafp_WhQ/edit?utm_content=DAHDG7zIc5o&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const SPONSOR_DECK   = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';

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

const bodyText = `Hi Nilufar,

Cannot wait to catch up with you -- it is going to be a great one.

I wanted to send over everything you need ahead of Cannes so you have it all in one place.

Here is the residents deck -- it covers the villa, who else is joining us in the house, what the week looks like, and everything you need to know:

${RESIDENTS_DECK}

Indvstry Power House is a curated three-day activation at Cannes Lions 2026 -- a private villa bringing together some of the most interesting people in creativity, media, and brand. Think intimate dinners, good conversations, and the kind of connections that do not happen on the Croisette. You are going to love it.

I have also attached our sponsorship deck in case anyone at WPP or in your network would want to activate at the villa -- we have a few partnership packages remaining and are being selective about who we bring in:

${SPONSOR_DECK}

More details to follow as we get closer -- but do not hesitate to reach out if you have any questions in the meantime.

Cannot wait.

George`;

async function main() {
  const token  = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Indvstry Power House, Cannes 2026 - everything you need to know',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'Nilufar.fowler@wpp.com', name: 'Nilufar' } },
    ],
    ccRecipients: [
      { emailAddress: { address: 'nilufarfowler@gmail.com', name: 'Nilufar' } },
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

  console.log('Email sent to Nilufar Fowler at Nilufar.fowler@wpp.com (CC: nilufarfowler@gmail.com)');
}

main().catch(console.error);
