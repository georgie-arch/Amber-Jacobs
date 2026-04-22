/**
 * send-patris-spotify-followup.ts
 *
 * Follow-up from George to Patris Gordon (Spotify) after their call last week.
 * Shares powerhouse.indvstryclvb.com/spotify and the deck.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/send-patris-spotify-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

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
      scope: 'https://graph.microsoft.com/Mail.Send Mail.ReadWrite offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

function buildHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi Patris,<br><br>

    Thank you for your time on our call last week. Really enjoyed the conversation and appreciated you taking the time.<br><br>

    Since we spoke I have worked our idea into a deck you can read through and share with your team:<br><br>

    <a href="https://powerhouse.indvstryclvb.com/spotify" style="color:#1a1a1a;">powerhouse.indvstryclvb.com/spotify</a><br><br>

    Would be great to touch base soon and keep the conversation going. Let me know when works.
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
}

async function main() {
  const token = await getToken();

  // Try to reply in existing thread first
  const search = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="from:patrisg@spotify.com"&$top=1&$select=id,subject,conversationId`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );

  const messages = search.data.value;

  if (messages && messages.length > 0) {
    const msgId = messages[0].id;
    console.log(`Found thread: "${messages[0].subject}" — replying in-thread.`);

    await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${msgId}/reply`,
      {
        message: {
          body: { contentType: 'HTML', content: buildHtml() },
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    console.log('Reply sent to Patris Gordon in-thread from George.');
  } else {
    console.log('No existing thread found — sending as fresh email.');

    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        message: {
          subject: 'Great speaking last week — next steps',
          body: { contentType: 'HTML', content: buildHtml() },
          toRecipients: [{ emailAddress: { address: 'patrisg@spotify.com', name: 'Patris Gordon' } }],
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    console.log('Fresh email sent to Patris Gordon from George.');
  }
}

main().catch((err) => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
