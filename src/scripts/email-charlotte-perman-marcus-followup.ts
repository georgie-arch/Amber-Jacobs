/**
 * Follow-up to Charlotte Perman (UTA) — Marcus Collins speaker inquiry
 * Charlotte.Perman@unitedtalent.com
 * Marcus added Charlotte after our initial outreach. This email covers full logistics.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-charlotte-perman-marcus-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const OTHER_SPEAKERS   = 'Dara Treseder (CMO, Autodesk), Asad Rehman (VP Global Media, Unilever), Dr. Joy Buolamwini (Founder, Algorithmic Justice League) and Azeem Azhar (Founder, Exponential View)';
const CANNES_PASS_LINK = 'https://www.canneslions.com/festival/passes';

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

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
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
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const body = `Hi Charlotte,

Great to connect. Marcus added you to the thread so I wanted to send all the details across clearly so you have everything you need.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June inside DEPT's Secret Garden at Cannes Lions — one of the most exclusive, invite-only environments at the festival. The audience is global brand, marketing and tech leaders. Marcus's thesis in For The Culture is genuinely the backbone of the conversation we are building, which is why we reached out specifically to him.

Here is everything you need to know:

Format
The panel itself runs for approximately 45 minutes. We would need Marcus for around 2 to 3 hours in total, to allow for setup and any prep beforehand. He is of course free to leave straight after the panel if needed.

What is covered
We are not able to offer a speaker fee, but we are extending a full Cannes Lions delegate pass to Marcus — worth €5,000 — as part of the partnership. You can see exactly what that covers here: ${CANNES_PASS_LINK}

What is not covered
Travel and accommodation are not included on our side. There are no additional appearances, activities or commitments expected beyond the panel itself.

Recording
The session will not be recorded or streamed. It is a fully closed, in-room experience only.

The panel lineup
We are currently in conversation with ${OTHER_SPEAKERS} for the other spots on the panel. We are being very deliberate about the lineup and Marcus is not a courtesy invite — his work is the lens through which the whole conversation is framed.

One more thing — no obligation
DEPT Agency hosts a private dinner for CMOs and CEOs in the Secret Garden during Lions week. It is one of the most prestigious and intimate gatherings at the festival and not something that gets a lot of public visibility. Marcus would receive an invitation. Attendance is entirely optional and there is absolutely no expectation either way.

We would love to get on a quick call to walk through any questions. Happy to work around your schedule.`;

async function main() {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Re: "The Algorithm Doesn\'t Know Your Culture" — panel details for Marcus',
    body:    { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: 'Charlotte.Perman@unitedtalent.com', name: 'Charlotte Perman' } }],
    from:         { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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

  console.log('Sent to Charlotte Perman <Charlotte.Perman@unitedtalent.com>');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
