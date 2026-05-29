/**
 * Post-call follow-up to Anthony Hutchinson (Tmpflagship@gmail.com) from George.
 * Acknowledges call, his juicing business + Cannes team history, pivots to
 * villa event partnership for his network, Diaspora Dinner invite, sponsorship deck.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-anthony-hutchinson-post-call.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(body: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const formatted = body
    .split('\n\n')
    .map(para => `<p style="margin:0 0 14px 0;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${formatted}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const emailBody = `Hi Anthony,

Really great speaking with you last week. I loved hearing about the juicing business and it was brilliant learning about all the amazing work you have done for the Cannes team over the years. That kind of experience and insider knowledge of how the festival really operates is genuinely rare.

I completely understand you are finding your own way with accommodation and a pass this year. Completely fine. But I did want to flag something that might be a better fit for where you are at.

At Indvstry Power House we are not just hosting residents. We are also opening the villa up for brand activations and private events throughout the week. If you have people in your network who are looking for a private, well-located space to host their own event during Cannes Lions, whether that is a dinner, a brand experience, a closed-door session or a creative activation, we would love to explore a partnership. It is a great way to bring your network into the Power House energy without needing to commit to a full residency yourself.

I would also love to have you at our Diaspora Dinner on Tuesday 23 June, 6 to 9pm in Cannes. It is one of the highlights of the week. A proper sit-down dinner with founders, senior brand leaders and industry builders from the diaspora community. Very intentional, very intimate. You can grab your ticket here:
https://lu.ma/5vmr7s6f

And here are a couple of links to give you the full picture of what we are building this year:

Sponsorship and partnership deck: https://canva.link/j9tgb9z2annevnz
Power House info: https://lu.ma/t4ek2yn7

Finally, give us a follow on Instagram to stay up to date with everything we have coming up across the Cannes week:
@indvstryclvb

Looking forward to seeing you in the south of France, Anthony.`;

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Great speaking with you last week',
    body:    { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'Tmpflagship@gmail.com', name: 'Anthony Hutchinson' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
  };

  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    }];
  }

  try {
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Sent to Anthony Hutchinson <Tmpflagship@gmail.com>');
  } catch (err: any) {
    console.error(`FAILED: ${err?.response?.data?.error?.message || err.message}`);
  }
}

send().catch(console.error);
