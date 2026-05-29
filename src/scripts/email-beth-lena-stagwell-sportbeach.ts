/**
 * Re-outreach after Stagwell bounce.
 * Beth Sidhu moved to Sport Beach (standalone company) — email her there.
 * Lena Petersen is now Stagwell's Chief Brand & Comms Officer — intro email.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-beth-lena-stagwell-sportbeach.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_LINK = 'https://canva.link/j9tgb9z2annevnz';
const SITE_LINK = 'https://lu.ma/t4ek2yn7';
const CAL_LINK  = 'https://calendly.com/itsvisionnaire/30min';

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
  subject:   string;
  body:      string;
}

const contacts: Contact[] = [
  {
    firstName: 'Beth',
    fullName:  'Beth Sidhu',
    email:     'Beth.Sidhu@SPORTBEACH.com',
    subject:   'Sport Beach x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Beth,

I sent an email to your old Stagwell address and it bounced back pointing me here — which actually makes a lot of sense. Sport Beach becoming its own standalone company is the right move and clearly the natural conclusion of what you have been building there.

I am George Guise, founder of Indvstry Clvb. We spoke earlier in the year — I was reaching out about a potential collaboration between Sport Beach and Indvstry Power House at Cannes Lions 2026.

The short version: we are running a private luxury villa activation 21 to 26 June, hosting a curated group of senior CMOs, creative directors, founders and brand leaders for the week. Think of it as the intimate counterpart to Sport Beach — same audience, completely different energy. No beach, no spectacle, just the right people in a private setting where the conversations can actually go somewhere.

I still think there is a real partnership here, whether that is a co-hosted panel or dinner inside the villa, Sport Beach bringing key guests through our space during the week, or building something together around the sport, culture and brand creativity conversation. The audiences overlap significantly.

Here is our partnership deck and the full Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

Cannes is five weeks away. If you have 20 minutes to talk:
${CAL_LINK}

Would love to make something happen together, Beth.`,
  },

  {
    firstName: 'Lena',
    fullName:  'Lena Petersen',
    email:     'Lena.Petersen@StagwellGlobal.com',
    subject:   'Stagwell x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Lena,

Congratulations on the Chief Brand and Communications Officer role at Stagwell. The timing is interesting — Stagwell has been building serious Cannes presence over the last few years and you are stepping into the brand leadership seat right before Lions.

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa activation, 21 to 26 June, for a curated group of senior CMOs, creative directors, founders and brand leaders. It sits outside the official festival footprint deliberately — it is the space for the conversations that do not happen on a stage.

Stagwell's Cannes presence — across Sport Beach and the agency network — is one of the most ambitious in the industry. I think there is a real opportunity to build something between our two activations. A partnership could look like Stagwell hosting a session or dinner inside the villa, bringing key clients and agency leadership into our space, or co-programming around brand and creative effectiveness themes for the week. The Power House audience and the Stagwell network overlap in exactly the right ways.

Here is our partnership deck and the full Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

If you have 20 minutes before Cannes to talk through what this could look like:
${CAL_LINK}

Would love to find a way to work together, Lena.`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;
  let failed = 0;

  for (const c of contacts) {
    try {
      const message: any = {
        subject: c.subject,
        body:    { contentType: 'HTML', content: buildHtml(c.body) },
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
