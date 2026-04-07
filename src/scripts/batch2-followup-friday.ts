/**
 * batch2-followup-friday.ts
 *
 * Short follow-up to Batch 2 contacts emailed 24 March 2026.
 * Scheduled: Friday 27 March 2026
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/batch2-followup-friday.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GEORGE_CALENDAR = 'https://calendly.com/itsvisionnaire/30min';

const CONTACTS = [
  { name: 'Jane', email: 'jane.ostler@kantar.com' },
  { name: 'Michael', email: 'mbarrett@magnite.com' },
  { name: 'Gary', email: 'gary.vaynerchuk@vaynermedia.com' },
  { name: 'Bob', email: 'bobpittman@iheartmedia.com' },
  { name: 'Judann', email: 'jpollack@adage.com' },
];

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
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
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
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

function buildBody(firstName: string): string {
  return `Hi ${firstName},

Just following up on the note I sent across earlier this week about Indvstry Power House at Cannes Lions 2026.

We have a small number of partnership packages remaining and would love to explore whether there is a fit. If you are open to a quick call, you can grab a time here:
${GEORGE_CALENDAR}

Happy to answer any questions by email too.`;
}

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const contact of CONTACTS) {
    const message: any = {
      subject: 'Following up -- Indvstry Power House, Cannes Lions 2026',
      body: { contentType: 'HTML', content: buildHtml(buildBody(contact.name)) },
      toRecipients: [{ emailAddress: { address: contact.email, name: contact.name } }],
      from: {
        emailAddress: {
          address: process.env.EMAIL_USER || '',
          name: 'Amber Jacobs',
        },
      },
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

    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log(`✅ Sent to ${contact.name} <${contact.email}>`);
      sent++;
    } catch (err: any) {
      console.error(`❌ Failed: ${contact.email}`, err?.response?.data || err.message);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ ${sent}/${CONTACTS.length} follow-up emails sent.`);
}

main().catch(console.error);
