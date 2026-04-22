/**
 * Pre-Cannes Lions mixer venue enquiries
 * Targets: The Conduit, The Lavery, The Department Store
 * Proposed date: weekend of 6-7 June 2026 (second weekend before Cannes Lions)
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const targets = [
  {
    to: 'event@theconduit.com',
    name: 'The Conduit Events Team',
    venueName: 'The Conduit',
    body: `Hi,

I am reaching out to enquire about hosting a private mixer at The Conduit and wanted to check on availability.

I run Indvstry Clvb, a private members community for senior creative and brand professionals across media, marketing, technology and culture. Every year our community heads to Cannes Lions in June and we like to bring people together in London beforehand for a send-off moment before everyone disperses to the south of France.

This year we are looking to host a pre-Cannes Lions mixer for our community on the weekend of 6 or 7 June 2026, the second weekend before Cannes Lions kicks off on 22 June. It would be an intimate gathering of senior industry people, the kind of crowd that fits naturally with The Conduit's ethos.

We are flexible on format and open to understanding what you can accommodate, whether that is a private dining room, a standing reception space or something else entirely. We would love to hear what works best on your end.

Could you let me know if you have availability that weekend and what options might be possible? Happy to jump on a call to talk through the details.

George Guise
Founder, Indvstry Clvb`,
  },
  {
    to: 'Events@thelavery.co.uk',
    name: 'The Lavery Events Team',
    venueName: 'The Lavery',
    body: `Hi,

I am reaching out to enquire about hosting a private event at The Lavery and wanted to check on availability.

I run Indvstry Clvb, a private members community for senior creative and brand professionals across media, marketing, technology and culture. Every year our community heads to Cannes Lions in June and we like to bring people together in London beforehand as a send-off before everyone travels to the south of France.

This year we are looking to host a pre-Cannes Lions mixer for our community on the weekend of 6 or 7 June 2026, the second weekend before Cannes Lions begins on 22 June. It would be an intimate, curated gathering of senior industry people, relaxed in feel but with a strong crowd.

We are flexible on format and would love to understand what The Lavery can accommodate, whether that is a private reception, a seated dinner or a standing drinks event. Happy to work around what suits the space best.

Could you let me know if you have availability that weekend and what the options look like? Happy to get on a call to discuss.

George Guise
Founder, Indvstry Clvb`,
  },
  {
    to: 'Sabrina@thedepartmentstore.com',
    name: 'Sabrina',
    venueName: 'The Department Store',
    body: `Hi Sabrina,

I am reaching out to enquire about hosting a private event at The Department Store and wanted to check on availability.

I run Indvstry Clvb, a private members community for senior creative and brand professionals across media, marketing, technology and culture. Every year our community heads to Cannes Lions in June and we like to bring people together in London beforehand for a send-off mixer before everyone makes the trip to the south of France.

This year we are looking to host a pre-Cannes Lions mixer on the weekend of 6 or 7 June 2026, the second weekend before Cannes Lions starts on 22 June. It would be an intimate gathering of senior industry people, the kind of creative crowd that feels right at home in a space like The Department Store.

We are open on format and happy to work around what the space suits best, whether that is a standing reception, private drinks or something more relaxed. I would love to hear what you have available and what might work.

Could you let me know if that weekend is free and what options are on the table? Happy to jump on a call to talk it through.

George Guise
Founder, Indvstry Clvb`,
  },
];

async function sendEmail(token: string, target: typeof targets[0]): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: `Indvstry Clvb — Pre-Cannes Lions Mixer, Weekend of 6-7 June 2026`,
    body: { contentType: 'HTML', content: buildHtml(target.body) },
    toRecipients: [{ emailAddress: { address: target.to, name: target.name } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
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
}

async function main() {
  const token = await getToken();

  for (const target of targets) {
    await sendEmail(token, target);
    console.log(`Sent to ${target.venueName} <${target.to}>`);
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\nAll 3 sent.');
}

main().catch(console.error);
