import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

async function getToken() {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
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
  return r.data.access_token;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission. If you received this e-mail in error, please delete immediately.</p>
  </div>
</body></html>`;
}

async function sendEmail(token: string, to: string, toName: string, subject: string, body: string) {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }]
  };

  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true
    }];
  }

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

const vendors = [
  {
    to: 'reservation.epibeach@gmail.com',
    name: 'Nathalie',
    subject: 'Following Up — Dinner Booking 23rd June',
    body: `Hi Nathalie,

Please accept my sincere apologies for the long silence — things have been incredibly hectic on our end over the past couple of months with everything building towards Cannes, and this fell through the cracks.

We are absolutely still committed to Epi Beach for our dinner on the evening of 23rd June and are ready to move forward and lock everything in this week.

I do want to get on a brief call to confirm the final details and sort payment. Our founder George will be joining the call as he will be on the ground in Cannes and will be handling things directly.

You can book a time here: https://calendly.com/itsvisionnaire/30min

I really hope the date is still available for us. Please let me know.`
  },
  {
    to: 'amanda@plagebijou.com',
    name: 'Amanda',
    subject: 'RE: Private Dinner Enquiry — 30 Guests, 23rd June 2026',
    body: `Hi Amanda,

I owe you a proper apology — I am so sorry for going quiet on you. Things became extremely hectic internally and we dropped the ball on this completely.

We are still very keen on Plage Bijou for our dinner on 23rd June (30 guests) and are now ready to move forward. We would love to get on a quick call this week to finalise everything and arrange payment.

Our founder George will be on the ground in Cannes and will be joining the call to lock it all in directly with you.

You can book a time here: https://calendly.com/itsvisionnaire/30min

Thank you for your patience — I hope we can still make this work.`
  },
  {
    to: 'office@eden-cab.com',
    name: 'Eden Cab',
    subject: 'RE: Booking #1213 — Cannes Transportation June 2026',
    body: `Hi,

Sincere apologies for the delay in getting back to you — things have been non-stop on our end building towards the festival.

We are now ready to move forward and lock in the booking. We have a couple of quick questions and would love to get on a brief call this week to finalise everything and confirm payment.

Our founder George will be joining — he will be on the ground in Cannes and will be the main point of contact going forward.

You can book a time here: https://calendly.com/itsvisionnaire/30min

Looking forward to getting this sorted.`
  },
  {
    to: 'transponyx@gmail.com',
    name: 'TranspOnyx',
    subject: 'RE: Group Transfer Quote — Cannes, 22-26 June 2026',
    body: `Hi,

Apologies for the slow response — we have been incredibly busy in the lead-up to Cannes Lions.

We are now ready to proceed and would love to jump on a quick call this week to confirm the final details and get the booking locked in. Our founder George will be joining the call as he will be on the ground for the festival.

You can book a time here: https://calendly.com/itsvisionnaire/30min

Many thanks.`
  },
  {
    to: 'contact@azur-limousines.com',
    name: 'Azur Limousines',
    subject: 'RE: Private Group Transportation Quote — Cannes, June 2026',
    body: `Hi,

Thank you for sending the updated invoice — apologies for the delay in coming back to you.

We are now ready to finalise and would love a brief call this week to confirm the details before processing payment. Our founder George will be joining, as he will be on the ground in Cannes for the dates in question.

You can book a time here: https://calendly.com/itsvisionnaire/30min

Best regards.`
  },
  {
    to: 'info@travel-limousines.com',
    name: 'Travel Limousines',
    subject: 'RE: #13193 — Group Transfer Quote, Cannes 22-26 June 2026',
    body: `Hi Ikhlass,

Apologies for the delay in coming back to you on this — things have been extremely hectic on our end.

We are now ready to move forward and would love to get on a brief call this week to go over the final details and confirm the booking. Our founder George will be joining the call as he will be on the ground in Cannes for the duration.

You can book a time here: https://calendly.com/itsvisionnaire/30min

Looking forward to getting this locked in.`
  }
];

async function main() {
  console.log('Getting access token...');
  const token = await getToken();
  console.log('Token obtained. Sending emails...\n');

  for (const v of vendors) {
    try {
      await sendEmail(token, v.to, v.name, v.subject, v.body);
      console.log(`✅  Sent to ${v.name} <${v.to}>`);
    } catch (err: any) {
      console.error(`❌  Failed for ${v.to}:`, err?.response?.data || err.message);
    }
  }

  console.log('\nDone.');
}

main().catch(console.error);
