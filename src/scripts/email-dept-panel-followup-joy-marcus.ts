/**
 * Follow-up emails to Dr. Joy Buolamwini and Dr. Marcus Collins
 * Re: Secret Garden panel talk with DEPT Agency at Cannes Lions 2026
 * Following up on original outreach sent via email-dept-panel-speakers.ts
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
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
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
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 16px 0;"><a href="http://Powerhouse.indvstryclvb.com" style="color:#1a1a1a;">Powerhouse.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const followUps = [
  {
    name: 'Dr. Joy Buolamwini',
    email: 'press@poetofcode.com',
    subject: 'Following up — Secret Garden panel, Cannes Lions 2026',
    body: `Hi Joy,

I wanted to follow up on the note we sent a little while ago about our panel at DEPT's Secret Garden at Cannes Lions 2026.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June, in one of the most exclusive, invite-only environments at the festival. The audience is C-suite brand and marketing leaders from across the global industry, and your work with the Algorithmic Justice League and Unmasking AI is exactly the lens this conversation needs.

We would love to have you as a panelist. If this is something you or your team would like to explore, we are happy to jump on a call at a time that suits or answer any questions over email.

More on what we are building: Powerhouse.indvstryclvb.com

We do hope you will consider it.`,
  },
  {
    name: 'Dr. Marcus Collins',
    email: 'collinsm@umich.edu',
    subject: 'Following up — Secret Garden panel, Cannes Lions 2026',
    body: `Hi Marcus,

Just following up on the note we sent about our panel at DEPT's Secret Garden at Cannes Lions 2026.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June inside one of the most exclusive, invite-only environments at the festival. The audience is global brand, marketing and tech leaders and your thesis in For The Culture is genuinely the backbone of the whole conversation we are building.

We would be honoured to have you on the panel. If you or anyone on your team would like to talk through the details, we are happy to jump on a call or answer any questions by email.

More on what we are doing: Powerhouse.indvstryclvb.com

Really hope we can make this work.`,
  },
];

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  for (const f of followUps) {
    const message: any = {
      subject: f.subject,
      body: { contentType: 'HTML', content: buildHtml(f.body) },
      toRecipients: [{ emailAddress: { address: f.email, name: f.name } }],
      from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
    };
    if (logoB64) {
      message.attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'indvstry-logo.png',
        contentType: 'image/png',
        contentBytes: logoB64,
        contentId: 'indvstry-logo',
        isInline: true,
      }];
    }
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log(`Sent to ${f.name} <${f.email}>`);
    await new Promise(res => setTimeout(res, 1500));
  }

  console.log('\nBoth follow-ups sent.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
