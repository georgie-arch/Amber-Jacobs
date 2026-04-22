/**
 * One-off: Send special offer email to Anthony Okoro with invoice attachments
 * Run: npx ts-node src/scripts/send-anthony-okoro-email.ts
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
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

  const invoice1Path = path.resolve('/Users/georgeguise/Downloads/Invoice-NIDDIS1H-0004.pdf');
  const invoice2Path = path.resolve('/Users/georgeguise/Downloads/Invoice-NIDDIS1H-0002.pdf');

  const invoice1B64 = fs.readFileSync(invoice1Path).toString('base64');
  const invoice2B64 = fs.readFileSync(invoice2Path).toString('base64');

  const bodyText = `Hi Anthony,

Following on from our WhatsApp conversation, I've put together a special offer just for you with one-off payment links so you can lock things in easily.

I've also done the prices at the best we can offer, so what you see below is our absolute best rate. VAT is included in both invoices.

Here are your two options:

<strong>Option 1 - RSVPs + Delegate Pass</strong>
Includes your done-for-you RSVPs and your Cannes Lions delegate pass.
Total: $3,162.72 USD (inc. 20% VAT)
Secure your spot: <a href="https://buy.stripe.com/6oU4gyh0C52D8dJdVFbQY00">https://buy.stripe.com/6oU4gyh0C52D8dJdVFbQY00</a>

<strong>Option 2 - Indvstry RSVPs Only</strong>
Done-for-you RSVPs to the Indvstry Clvb events at Cannes.
Total: $1,455.06 USD (inc. 20% VAT)
Secure your spot: <a href="https://buy.stripe.com/dRmcN4bGi7aLbpVcRBbQY01">https://buy.stripe.com/dRmcN4bGi7aLbpVcRBbQY01</a>

I know you're weighing up both options and honestly, Option 1 is the one to go for if you want the full Cannes experience. The delegate pass alone makes it worth it, and having everything handled for you means you can just show up and be present.

That said, whichever you choose, please do secure it as soon as you can. These are one-off links created just for you and spots are limited.

Both invoices are attached for your records.

Any questions, just reply here or ping me on WhatsApp.

Speak soon,
Amber
Indvstry Clvb`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${bodyText.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties.</p>
  </div>
</body>
</html>`;

  const message = {
    subject: 'Your special offer for IPH x Cannes Lions, Anthony',
    body: { contentType: 'HTML', content: htmlBody },
    toRecipients: [{ emailAddress: { address: 'toni.okoro@gmail.com' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'Amber Jacobs' } },
    attachments: [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'Invoice-NIDDIS1H-0004.pdf',
        contentType: 'application/pdf',
        contentBytes: invoice1B64
      },
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'Invoice-NIDDIS1H-0002.pdf',
        contentType: 'application/pdf',
        contentBytes: invoice2B64
      }
    ]
  };

  console.log('Sending email to toni.okoro@gmail.com...');
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent successfully to Anthony Okoro.');
}

sendEmail().catch(err => {
  console.error('Failed to send email:', err?.response?.data || err.message);
  process.exit(1);
});
