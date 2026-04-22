/**
 * send-anthony-okoro-updated-invoices.ts
 * Send updated invoices to Anthony Okoro, CC Aokoro@ebay.com
 * Run: npx ts-node --project tsconfig.json src/scripts/send-anthony-okoro-updated-invoices.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

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
    Hi Anthony,<br><br>

    Hope you are well. As requested, I have updated the invoices and attached them here for your review.<br><br>

    Please let us know if there is anything else you need from our end.
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

  const inv5 = fs.readFileSync('/Users/georgeguise/Downloads/Invoice-NIDDIS1H-0005.pdf').toString('base64');
  const inv6 = fs.readFileSync('/Users/georgeguise/Downloads/Invoice-NIDDIS1H-0006.pdf').toString('base64');
  console.log('Invoices loaded.');

  // Try to reply in existing thread
  const search = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="from:toni.okoro@gmail.com"&$top=1&$select=id,subject`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );

  const messages = search.data.value;
  const attachments = [
    {
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'Invoice-NIDDIS1H-0005.pdf',
      contentType: 'application/pdf',
      contentBytes: inv5,
    },
    {
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'Invoice-NIDDIS1H-0006.pdf',
      contentType: 'application/pdf',
      contentBytes: inv6,
    },
  ];

  if (messages && messages.length > 0) {
    const msgId = messages[0].id;
    console.log(`Found thread: "${messages[0].subject}" — replying.`);

    await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${msgId}/reply`,
      {
        message: {
          body: { contentType: 'HTML', content: html },
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
          ccRecipients: [{ emailAddress: { address: 'Aokoro@ebay.com', name: 'Anthony Okoro' } }],
          attachments,
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Reply sent to Anthony Okoro (CC: Aokoro@ebay.com) with updated invoices.');
  } else {
    console.log('No existing thread — sending fresh email.');
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        message: {
          subject: 'Updated invoices — IPH x Cannes Lions',
          body: { contentType: 'HTML', content: html },
          toRecipients: [{ emailAddress: { address: 'toni.okoro@gmail.com', name: 'Anthony Okoro' } }],
          ccRecipients: [{ emailAddress: { address: 'Aokoro@ebay.com', name: 'Anthony Okoro' } }],
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
          attachments,
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Fresh email sent to Anthony Okoro (CC: Aokoro@ebay.com) with updated invoices.');
  }
}

main().catch(err => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
