/**
 * Follow-up to 2 SXSW London contacts checking in on plans
 * and whether Indvstry Clvb can still contribute to the festival.
 *
 *   1. Laura Carolina Uccello — laura.uccello@sxswlondon.com
 *   2. Aran Hayashi           — aran.hayashi@sxswlondon.com
 *
 * From: George Guise (access@indvstryclvb.com)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-sxsw-london-followup-may15.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CAL_LINK = 'https://calendly.com/itsvisionnaire/30min';

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

interface Contact {
  firstName: string;
  fullName:  string;
  email:     string;
}

const contacts: Contact[] = [
  { firstName: 'Laura', fullName: 'Laura Carolina Uccello', email: 'laura.uccello@sxswlondon.com' },
  { firstName: 'Aran',  fullName: 'Aran Hayashi',           email: 'aran.hayashi@sxswlondon.com'  },
];

function buildBody(firstName: string): string {
  return `Hi ${firstName},

I hope things are going well and the SXSW London planning is coming together nicely. I wanted to check in and see how the programme is shaping up for this year.

We spoke earlier in the year about Indvstry Clvb potentially contributing to the festival and I wanted to revisit that conversation. Our community of creative professionals, founders and brand leaders is exactly the audience SXSW London is built for, and I think there is still a genuinely interesting way for us to be involved — whether that is through programming, community activation, or something else entirely.

Is there still an opportunity for us to play a role this year? I am very open to what that looks like and happy to work around whatever stage the planning is at.

If it is easier to get on a quick call and talk through it:
${CAL_LINK}

Would love to find a way to make it happen.`;
}

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;
  let failed = 0;

  for (const c of contacts) {
    try {
      const message: any = {
        subject: 'SXSW London — checking in',
        body:    { contentType: 'HTML', content: buildHtml(buildBody(c.firstName)) },
        toRecipients: [{ emailAddress: { address: c.email, name: c.fullName } }],
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

      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      sent++;
      console.log(`[${sent}/${contacts.length}] Sent to ${c.fullName} <${c.email}>`);
    } catch (err: any) {
      failed++;
      console.error(`FAILED: ${c.fullName} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
}

sendAll().catch(console.error);
