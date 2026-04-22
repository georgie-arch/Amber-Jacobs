/**
 * reply-yung-aly-panel.ts
 * Reply to Yung Aly — not paid but delegate pass included
 * Run: npx ts-node --project tsconfig.json src/scripts/reply-yung-aly-panel.ts
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

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi Aly,<br><br>

    To clarify — this is not a paid opportunity, but what we are offering is a delegate pass to the event worth £5,000. That gets you full access to attend Cannes Lions and everything we have programmed at the Power House for the week.<br><br>

    It is a great platform and the room will be full of senior brand and agency leaders. Would love to have you there.
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;

async function main() {
  const token = await getToken();

  const search = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="from:aly@curatedx.co.uk"&$top=1&$select=id,subject`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );

  const messages = search.data.value;

  if (messages && messages.length > 0) {
    const msgId = messages[0].id;
    console.log(`Found thread: "${messages[0].subject}" — replying.`);
    await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${msgId}/reply`,
      {
        message: {
          body: { contentType: 'HTML', content: html },
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Reply sent to Yung Aly.');
  } else {
    console.log('No existing thread found — sending fresh email.');
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        message: {
          subject: 'Re: Cannes Lions 2026 — DEPT\'s Secret Garden panel',
          body: { contentType: 'HTML', content: html },
          toRecipients: [{ emailAddress: { address: 'aly@curatedx.co.uk', name: 'Yung Aly' } }],
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Fresh email sent to Yung Aly.');
  }
}

main().catch(err => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
