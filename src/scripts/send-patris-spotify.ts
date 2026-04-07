/**
 * send-patris-spotify.ts
 * Email to Patris Gordon, Head of Podcast Operations at Spotify.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logo = getLogoBase64();
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logo ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />` : ''}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const body = `Hi Patris,

Hope you had a great Easter break!

Just wanted to reach out and say thank you for a brilliant event at the Spotify office last week. The Behind the ERG evening was genuinely inspiring. Great energy, great people, and real hospitality. Appreciated being in the room.

It actually got me thinking. As I mentioned when we met, I run Indvstry Clvb and we have a content series called Dear Gatekeeper, conversations with people who have navigated the creative industry and made it. Here is a quick taster:

https://youtube.com/shorts/-wQynBNkvxw?feature=shared

And a full episode: https://youtu.be/Kv4z7VD7Pbg?si=cIapXrAsLZTBTI11

We are heading to Cannes Lions this year and planning to record a few interviews with founders and C-suite personalities while we are there. We would love to explore whether there is an opportunity to use Spotify's space for one or two slots. I wanted to ask what your plans are around any podcast recording or content activation at Cannes this year, felt like a natural conversation to have.

On our end we are running Indvstry Power House, a private villa activation at Cannes Lions 2026 bringing together the most interesting people across creativity, media and brand. More here: https://powerhouse.indvstryclvb.com

Would love to get on a quick call if you have time. Happy to work around your schedule.

George`;

async function main() {
  const token = await getAccessToken();
  const logo = getLogoBase64();

  const message: any = {
    subject: 'Great to meet you - Cannes + Dear Gatekeeper',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: 'patrisg@spotify.com', name: 'Patris Gordon' } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
  };

  if (logo) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logo,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Sent to Patris Gordon at Spotify.');
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
