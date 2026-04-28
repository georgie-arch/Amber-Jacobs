/**
 * email-delegate-pass-residents.ts
 *
 * One-off send: inform villa residents of their Classic Cannes Lions 2026
 * delegate pass, Young Lions eligibility info, and fringe event email note.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-delegate-pass-residents.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

const RECIPIENTS = [
  { name: 'Romy',    email: 'romydegama@gmail.com' },
  { name: 'Olga',    email: 'info@framrlab.com' },
  { name: 'Kelly',   email: 'adacollective300@gmail.com' },
  { name: 'LaToya',  email: 'latoya.shambo@blackgirldigital.com' },
  { name: 'Anthony', email: 'aokoro@ebay.com' },
  { name: 'Will',    email: 'will@theshadeborough.com' },
];

function buildBody(firstName: string): string {
  return `Hi ${firstName},

Exciting news. We have secured you a Classic Delegate Pass for Cannes Lions 2026 in Cannes, 16-20 June.

<b>About your pass:</b>
The Classic Pass gives you full access to everything on the official Cannes Lions programme, including talks, awards ceremonies, masterclasses, and the festival hub. You can read everything included here: <a href="https://www.canneslions.com/festival/buy-a-pass/classic-pass">https://www.canneslions.com/festival/buy-a-pass/classic-pass</a>

<b>Young Lions eligibility (worth knowing):</b>
If you are 30 years old or younger on 26 June 2026, you may qualify for the Young Lions pass instead. If that applies to you, let us know and we can explore that option. If not, the Classic is exactly what you need and what we have locked in for you.

<b>A note on fringe events:</b>
Most of the RSVPs we are securing for you alongside the festival require a professional company email address. If you do not currently have one, we can create one for you under our domain so you can access those events. Please be aware that final entry to fringe events is always at the discretion of the event organiser, based on your profile and the type of attendees they are curating. Your delegate pass, however, guarantees you access to everything on the official Cannes Lions programme.

<b>Next steps:</b>
We will notify you as soon as the Cannes Lions 2026 app goes live. When it does, please register your account using the email address you provided to us, as this is how your pass will be linked. Please keep an eye out for our emails.

Please reply to confirm you have received this and are happy with everything.

Looking forward to seeing you in Cannes.`;
}

function formatHtml(firstName: string): string {
  const body = buildBody(firstName);
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${body.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;
}

async function sendEmail(token: string, to: string, firstName: string): Promise<void> {
  const sender = process.env.EMAIL_USER || '';
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject: 'Your Cannes Lions 2026 Delegate Pass',
        body: { contentType: 'HTML', content: formatHtml(firstName) },
        toRecipients: [{ emailAddress: { address: to } }],
        from: { emailAddress: { address: sender, name: 'Amber Jacobs' } },
      }
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function run() {
  console.log('Getting access token...');
  const token = await getToken();

  for (const r of RECIPIENTS) {
    try {
      await sendEmail(token, r.email, r.name);
      console.log(`Sent to ${r.name} <${r.email}>`);
    } catch (err: any) {
      console.error(`Failed for ${r.name} <${r.email}>:`, err?.response?.data || err.message);
    }
  }

  console.log('Done.');
}

run();
