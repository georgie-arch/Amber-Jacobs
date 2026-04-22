/**
 * One-off: Follow-up email to Nilufar Fowler from George to lock in a call
 * Run: npx ts-node src/scripts/send-nilufar-followup.ts
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
    Hi Nilufar,<br><br>

    Hope you're doing well. Just wanted to follow up and see if you're free for a call soon. Would be great to catch up and pick up where we left off.<br><br>

    Let me know what works for you and I'll make it happen.<br><br>

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
    subject: 'Catching up',
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: [{ emailAddress: { address: 'nfowler@alvarezandmarsal.com', name: 'Nilufar Fowler' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } }
  };

  console.log('Sending email to nfowler@alvarezandmarsal.com...');
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent successfully to Nilufar Fowler.');
}

sendEmail().catch(err => {
  console.error('Failed to send email:', err?.response?.data || err.message);
  process.exit(1);
});
