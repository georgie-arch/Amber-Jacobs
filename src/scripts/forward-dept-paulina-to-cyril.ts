/**
 * forward-dept-paulina-to-cyril.ts
 *
 * 1. Find all emails FROM Paulina Prystupa (DEPT) in inbox
 * 2. Find all emails George sent TO Paulina in sent items
 * 3. Forward them all to Cyril with covering context
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/forward-dept-paulina-to-cyril.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CYRIL = { address: 'cyrillutterodt@gmail.com', name: 'Cyril' };
const PAULINA_EMAIL = 'paulina.prystupa@deptagency.com';

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

async function getMessages(token: string, query: string, folder = 'inbox'): Promise<any[]> {
  const url = folder === 'sentitems'
    ? `https://graph.microsoft.com/v1.0/me/mailFolders/sentitems/messages?$search="${query}"&$top=20&$select=id,subject,receivedDateTime`
    : `https://graph.microsoft.com/v1.0/me/messages?$search="${query}"&$top=20&$select=id,subject,receivedDateTime`;

  const r = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' }
  });
  return r.data.value || [];
}

async function forwardMessage(token: string, msgId: string, comment: string): Promise<void> {
  await axios.post(
    `https://graph.microsoft.com/v1.0/me/messages/${msgId}/forward`,
    {
      toRecipients: [{ emailAddress: CYRIL }],
      comment,
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function sendCoveringEmail(token: string): Promise<void> {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi Cyril,<br><br>

    Forwarding you the full email thread with Paulina from DEPT so you can see the full picture of what has been discussed.<br><br>

    A couple of things to flag:<br><br>

    <strong>DEPT</strong> — they want to speak on Thursday. Our deck for them is here:<br>
    <a href="https://powerhouse.indvstryclvb.com/deptagency" style="color:#1a1a1a;">powerhouse.indvstryclvb.com/deptagency</a><br><br>

    <strong>Eventbrite</strong> — they want to speak today at 3pm if you are up for it. Our deck for them is here:<br>
    <a href="https://powerhouse.indvstryclvb.com/eventbrite" style="color:#1a1a1a;">powerhouse.indvstryclvb.com/eventbrite</a><br><br>

    Let me know if you need anything else ahead of either call.
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body>
</html>`;

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject: 'DEPT + Eventbrite — threads for your review',
        body: { contentType: 'HTML', content: html },
        toRecipients: [{ emailAddress: CYRIL }],
        from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
      }
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Covering email sent to Cyril.');
}

async function main() {
  const token = await getToken();

  // 1. Send covering email first
  await sendCoveringEmail(token);

  // 2. Emails FROM Paulina (inbox)
  console.log('\nSearching for emails from Paulina...');
  const fromPaulina = await getMessages(token, `from:${PAULINA_EMAIL}`);
  console.log(`Found ${fromPaulina.length} email(s) from Paulina.`);

  for (const msg of fromPaulina) {
    await forwardMessage(
      token,
      msg.id,
      'Cyril — this is what DEPT has been saying. Forwarding for your review.'
    );
    console.log(`Forwarded to Cyril: "${msg.subject}" (${msg.receivedDateTime?.slice(0, 10)})`);
    await new Promise(res => setTimeout(res, 800));
  }

  // 3. Emails George sent TO Paulina (sent items)
  console.log('\nSearching for emails George sent to Paulina...');
  const toPaulina = await getMessages(token, `to:${PAULINA_EMAIL}`, 'sentitems');
  console.log(`Found ${toPaulina.length} email(s) sent to Paulina.`);

  for (const msg of toPaulina) {
    await forwardMessage(
      token,
      msg.id,
      'Cyril — this is what George sent to Paulina at DEPT. Forwarding for your review.'
    );
    console.log(`Forwarded to Cyril: "${msg.subject}" (${msg.receivedDateTime?.slice(0, 10)})`);
    await new Promise(res => setTimeout(res, 800));
  }

  const total = fromPaulina.length + toPaulina.length;
  console.log(`\nDone. Covering email + ${total} thread email(s) forwarded to Cyril.`);
}

main().catch((err) => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
