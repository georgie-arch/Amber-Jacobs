import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const TO = {
  name: 'Laura Carolina Uccello',
  firstName: 'Laura',
  email: 'laura.uccello@sxswlondon.com',
};

const CC = [
  { address: 'press@sxswlondon.com', name: 'SXSW London Press' },
  { address: 'partnerships@sxswlondon.com', name: 'SXSW London Partnerships' },
];

async function getToken(scope: string): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.access_token;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch {
    return '';
  }
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
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function hasReply(token: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/me/messages?$search=\"${TO.email}\"&$top=25&$select=id,from,subject,receivedDateTime`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const messages = response.data.value || [];
    return messages.some((message: any) => {
      const from = (message.from?.emailAddress?.address || '').toLowerCase();
      return from === TO.email.toLowerCase();
    });
  } catch {
    return false;
  }
}

async function sendFollowUp(token: string, subject: string, body: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: TO.email, name: TO.name } }],
    ccRecipients: CC.map((recipient) => ({ emailAddress: recipient })),
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
}

async function main(): Promise<void> {
  const readToken = await getToken('https://graph.microsoft.com/Mail.ReadWrite offline_access');
  const replied = await hasReply(readToken);

  if (replied) {
    console.log(`Reply already received from ${TO.email} — no follow-up sent.`);
    return;
  }

  const sendToken = await getToken('https://graph.microsoft.com/Mail.Send offline_access');
  const subject = 'Following up on DEI-led access + press pass request for SXSW London';
  const body = `Hi ${TO.firstName},

Just following up on my note from last week in case it got buried.

We would still love to explore whether there is a route for SXSW London to support a small allocation of Indvstry Clvb community passes, alongside press access for our media and content team.

The core idea is simple: bring more of London's underrepresented but genuinely culture-shaping creatives into the room, and make sure the festival is being documented and amplified by the communities actually driving the city's creative energy.

If there is any possibility of making this work, even as a small exception request at this stage, we would be very happy to manage vetting, selection and coordination on our side.

Would love to hear your thoughts when you have a moment.

Best,

Amber`;

  await sendFollowUp(sendToken, subject, body);
  console.log(`Sent follow-up to ${TO.name} <${TO.email}>`);
}

main().catch((error) => {
  const detail = error?.response?.data || error?.message || error;
  console.error(detail);
  process.exit(1);
});
