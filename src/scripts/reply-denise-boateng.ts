/**
 * reply-denise-boateng.ts
 *
 * Reply to Denise Boateng (Informa/Cannes Lions) thread.
 * Recap of what was discussed re: official CL27 programming partnership.
 * From: George Guise | CC: Cyril
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/reply-denise-boateng.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MESSAGE_ID = 'AAMkAGQ0YzBjNjQyLWNiYjktNGViZi1iMTlmLTNjY2ZmMjcwNjhmMABGAAAAAABc0NhjdSMQQr10DEVFlFItBwDl3AXJPdYMTJUUDw_0zGCuAAAAAAEMAADl3AXJPdYMTJUUDw_0zGCuAAKxIbq0AAA=';

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

const body = `Hi Denise,

Thank you so much for getting back to us - and July works perfectly, that is exactly when we are planning to kick these conversations off.

Here is a quick recap of what we covered when we met:

The core conversation was around how we get Indvstry Clvb onto the official Cannes Lions programme as a proper partner for CL27 - not just running an activation alongside the festival, but being inside it. We spoke about the fact that AfriCannes went through a specific route last year to get on the official programming, and you mentioned there was a team or contact on the Cannes Lions side who would be the right people for us to speak to about that same pathway. That introduction is really what we are hoping you can help us with when the time is right.

We already have plans outlined for what we want to bring to CL27 - workshops, activations and a structured programme we are building with partners - so when July comes we will be ready to have a proper, well-prepared conversation with whoever the right people are on your side.

Would you be open to making that introduction in July? We would come fully prepared.

Thank you again Denise, really appreciate you.

George`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const reply: any = {
    message: {
      subject: 'Re: Great meeting you - and what is next for us at Cannes Lions',
      body: { contentType: 'HTML', content: buildHtml(body) },
      toRecipients: [{ emailAddress: { address: 'Denise.Boateng@informa.com', name: 'Denise Boateng' } }],
      ccRecipients: [{ emailAddress: { address: 'Cyrillutterodt@gmail.com', name: 'Cyril' } }],
      from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
    },
  };

  if (logoB64) {
    reply.message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    `https://graph.microsoft.com/v1.0/me/messages/${MESSAGE_ID}/reply`,
    reply,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Reply sent to Denise Boateng <Denise.Boateng@informa.com>, CC: Cyril');
}

main().catch(console.error);
