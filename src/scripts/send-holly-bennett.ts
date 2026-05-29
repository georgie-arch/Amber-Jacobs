import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
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
  return response.data.access_token;
}

async function main() {
  const FROM_ADDRESS = 'access@indvstryclvb.com';
  const FROM_NAME = 'George Guise';
  const CALENDLY = 'https://calendly.com/itsvisionnaire/30min';

  const attachmentPath = '/Users/georgeguise/Downloads/Cannes Blacklist Watch Party - GENuine Agency.pdf';
  const attachmentBytes = fs.readFileSync(attachmentPath).toString('base64');
  const attachmentName = path.basename(attachmentPath);

  const bodyText = `Hi Holly,

It was such a pleasure meeting you yesterday at the Lions Sport Sundowner! Thanks again for the invite back to the office for the cheeky after-party — definitely a highlight of the evening.

As mentioned, I'd love to see how we can align our plans for Cannes. We are going quite big this year with the INDVSTRY Power House, including a series of World Cup watch parties and high-level panels with partners like Spotify and DEPT®.

I've attached our deck to this email so you can get a full sense of the villa activation and the programming we have scheduled.

I'm keen to hear what you and the other co-founders have in the works. I'd also love to be put in touch with your team who will be on the ground so we can coordinate and see where we can build together.

Let me know if you have a window to jump on a quick call before we head out — you can book directly here: ${CALENDLY} — or we can just carve out some time once we're on the Croisette.

Best,
George`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${bodyText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(CALENDLY, `<a href="${CALENDLY}" style="color:#1a1a1a;">${CALENDLY}</a>`)
    .replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
  </div>
</body>
</html>`;

  const accessToken = await getAccessToken();

  const message = {
    subject: 'Following up: Lions Sport Sundowner / INDVSTRY Power House @ Cannes',
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: [
      { emailAddress: { address: 'holly.bennett@50-sport.com' } },
      { emailAddress: { address: 'holly.bennett@50sport.com' } },
    ],
    from: { emailAddress: { address: FROM_ADDRESS, name: FROM_NAME } },
    attachments: [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: attachmentName,
        contentType: 'application/pdf',
        contentBytes: attachmentBytes,
      },
    ],
  };

  console.log('Sending to holly.bennett@50-sport.com + holly.bennett@50sport.com...');

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  console.log('✅ Email sent to Holly Bennett with PDF attachment');
}

main().catch(err => {
  console.error('❌ Error:', err?.response?.data || err.message);
  process.exit(1);
});
