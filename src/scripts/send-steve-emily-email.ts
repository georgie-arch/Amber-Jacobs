/**
 * One-off: Follow-up email to Steve Murray + Emily from George, CC Cyril
 * Run: npx ts-node src/scripts/send-steve-emily-email.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
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
  return response.data.access_token;
}

async function sendEmail() {
  console.log('Getting Outlook access token...');
  const accessToken = await getAccessToken();
  console.log('Token obtained.');

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi Steve and Emily,<br><br>

    Just wanted to follow up and check in. Have you had a chance to discuss the residency and activation internally?<br><br>

    Would be great to get the greenlight from you both so we can start moving things forward. We're just waiting on your response to know if any of these are of interest.<br><br>

    Let me know when you can.<br><br>

    Speak soon,
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;

  const message = {
    subject: 'Indvstry Power House x Cannes Lions — following up',
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: [
      { emailAddress: { address: 'steve@smcacreative.com', name: 'Steve Murray' } },
      { emailAddress: { address: 'emily@viceversastrategy.com', name: 'Emily' } }
    ],
    ccRecipients: [
      { emailAddress: { address: 'cyrillutterodt@gmail.com', name: 'Cyril' } }
    ],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } }
  };

  console.log('Sending email to Steve Murray + Emily (CC: Cyril)...');
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent successfully.');
}

sendEmail().catch(err => {
  console.error('Failed to send email:', err?.response?.data || err.message);
  process.exit(1);
});
