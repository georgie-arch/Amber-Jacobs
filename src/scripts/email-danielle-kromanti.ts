/**
 * Outreach to Danielle David, Co-Founder, Kromanti Rum
 * Danielle@kromantirum.com — gifting collaboration for Indvstry Power House
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

const body = `Hi Danielle,

Hope you are well. I wanted to reach out about something I am building this June that I think Kromanti would be a perfect fit for.

As you may know I have been putting together Indvstry Power House, our private villa activation running alongside Cannes Lions 2026 from 21 to 26 June. It is a curated group of seven residents staying in a luxury villa in the south of France, with daily access to the Croisette, private dinners, closed-door sessions and a week of genuine cultural moments with some really notable people across media, brand and the creative industries.

One of the things we are doing is gifting our villa residents and a selection of key speakers and guests a curated welcome package. We would love to include Kromanti Rum in that gifting. The brand, the story, the product, it all fits the room we are building perfectly.

I would love to explore a collaboration where Kromanti provides a number of bottles for the gifting initiative. In return we will make sure the brand is featured properly, whether that is through content created at the villa, coverage in our newsletter which reaches over 15,000 people across the UK creative and brand industry, or social posts from guests and residents. We can put together whatever works best for you.

The villa is a beautiful setting and the people in the room are exactly the kind of audience Kromanti should be in front of.

Would love to have a quick chat and figure out what this could look like. Are you free for a call this week?

George`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Kromanti x Indvstry Power House — Cannes Lions 2026',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: 'Danielle@kromantirum.com', name: 'Danielle David' } }],
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

  console.log('Sent to Danielle David <Danielle@kromantirum.com>');
}

main().catch(console.error);
