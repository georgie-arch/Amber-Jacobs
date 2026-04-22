/**
 * reply-rose-greenwell-ymu.ts
 * Reply to Rose Greenwell (YMU) — invite only
 * Run: npx ts-node --project tsconfig.json src/scripts/reply-rose-greenwell-ymu.ts
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
    Hi Rose,<br><br>

    Thanks for getting in touch. This one is invite only, so access is curated on our end.<br><br>

    If you want to find out more or explore getting involved, feel free to book a quick call with George here: <a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">calendly.com/itsvisionnaire/30min</a>
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
    `https://graph.microsoft.com/v1.0/me/messages?$search="from:Rose.Greenwell@ymugroup.com"&$top=1&$select=id,subject`,
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
    console.log('Reply sent to Rose Greenwell (YMU).');
  } else {
    console.log('No existing thread found — sending fresh email.');
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        message: {
          subject: 'Re: Indvstry Power House',
          body: { contentType: 'HTML', content: html },
          toRecipients: [{ emailAddress: { address: 'Rose.Greenwell@ymugroup.com', name: 'Rose Greenwell' } }],
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Fresh email sent to Rose Greenwell (YMU).');
  }
}

main().catch(err => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
