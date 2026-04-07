/**
 * exxon-indvstry-exchange-outreach.ts
 *
 * Re-outreach to ExxonMobil contacts about Indvstry Exchange.
 * Short, concise — from Amber Jacobs.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const CONTACTS = [
  { firstName: 'Richard', lastName: 'Barke',      email: 'richard.barke@exxonmobil.com' },
  { firstName: 'Nick',    lastName: 'Scott',       email: 'nick.scott@exxonmobil.com' },
  { firstName: 'Nermeen', lastName: 'El-Nawawi',   email: 'nermeen.el-nawawi@exxonmobil.com' },
  { firstName: 'Shahrukh',lastName: 'Mirza',       email: 'shahrukh.mirza@exxonmobil.com' },
];

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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logo ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />` : ''}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

function buildBody(firstName: string): string {
  return `Hi ${firstName},

I hope you are well.

I wanted to reach out about Indvstry Exchange, a new initiative from Indvstry Clvb connecting brands with a curated network of creative professionals, founders and cultural tastemakers.

Given our previous conversation, I thought it might be of interest. Are you still open to exploring what a partnership could look like?

Happy to share more detail if so.

Amber`;
}

async function sendEmail(token: string, contact: typeof CONTACTS[0]): Promise<boolean> {
  const logo = getLogoBase64();
  const body = buildBody(contact.firstName);

  const message: any = {
    subject: 'Indvstry Exchange — still interested?',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: contact.email, name: `${contact.firstName} ${contact.lastName}` } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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

  return true;
}

async function main() {
  console.log('\nIndvstry Exchange — ExxonMobil Re-outreach');
  console.log('═'.repeat(45));
  console.log(`Sending to ${CONTACTS.length} contacts from Amber Jacobs\n`);

  const token = await getAccessToken();

  for (const contact of CONTACTS) {
    process.stdout.write(`  Sending to ${contact.firstName} ${contact.lastName} <${contact.email}>... `);
    try {
      await sendEmail(token, contact);
      console.log('sent');
    } catch (err: any) {
      console.log(`FAILED — ${err.response?.data?.error?.message || err.message}`);
    }
    // Brief pause between sends
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
