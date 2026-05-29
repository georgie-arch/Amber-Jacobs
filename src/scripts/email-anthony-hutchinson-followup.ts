/**
 * Follow-up email to Anthony Hutchinson (tmpflagship@gmail.com) from George
 * Sends villa residency link, sponsorship deck link, and attaches the full overview PDF
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-anthony-hutchinson-followup.ts
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
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const emailBody = `Hi Anthony,

Really great speaking with you the other day. I wanted to follow up and make sure you have everything you need on our end.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of senior creative directors, CMOs, founders and cultural leaders. I have attached our full overview deck so you can get a proper feel for what we are building, and I have also included the link to our sponsorship deck below in case you have any partners or sponsors in your network who might be a fit for the week.

Sponsorship deck: https://canva.link/j9tgb9z2annevnz

For the villa residency itself, we still have a limited number of spots available. The package runs from 21 to 26 June and includes full access to all Power House programming, private dinners, closed-door sessions, and a curated network of some of the most senior people at Lions. Packages start from £1,500. You can find all the details and enquire directly here: https://lu.ma/t4ek2yn7

If you know anyone in your network who would be a great fit, whether as a resident, a sponsor or a brand partner for the week, we would love the introduction. And you can always find out more about what we do at www.indvstryclvb.com.

Really looking forward to seeing you in Cannes. It is going to be a brilliant week.`;

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  // Load the PDF attachment
  const pdfPath = '/Users/georgeguise/Downloads/power house Project/Decks/POWER HOUSE DECK (whole Overview).pdf';
  let pdfB64 = '';
  try {
    pdfB64 = fs.readFileSync(pdfPath).toString('base64');
    console.log('PDF loaded successfully');
  } catch (err) {
    console.warn('Could not load PDF — sending without attachment');
  }

  const message: any = {
    subject: 'Indvstry Power House — Cannes Lions 2026',
    body:    { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'tmpflagship@gmail.com', name: 'Anthony Hutchinson' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
  };

  const attachments: any[] = [];

  if (logoB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    });
  }

  if (pdfB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'Indvstry Power House — Overview.pdf',
      contentType:   'application/pdf',
      contentBytes:  pdfB64,
      isInline:      false,
    });
  }

  if (attachments.length) message.attachments = attachments;

  try {
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Sent to Anthony Hutchinson <tmpflagship@gmail.com>');
  } catch (err: any) {
    console.error(`FAILED: ${err?.response?.data?.error?.message || err.message}`);
  }
}

send().catch(console.error);
