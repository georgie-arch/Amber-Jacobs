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

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
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

async function sendEmail(token: string, subject: string, body: string): Promise<void> {
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
  const subject = 'DEI-led community access + press pass request for SXSW London';
  const body = `Hi ${TO.firstName},

I hope you are well.

I am reaching out because Laura Carolina Uccello's role across international and public affairs feels like the most relevant place to direct a DEI-led access request within SXSW London.

At Indvstry Clvb, we work closely with a curated network of culture-shaping creatives, founders, producers and operators across London, with a strong emphasis on representation and making sure high-value rooms include the communities actually shaping the city's future.

We would love to explore whether SXSW London could support us with two things for the June 2026 edition:

1. A small allocation of Indvstry Clvb delegate passes for our community.
2. Press passes for our media and content team so we can document and amplify the festival through a credible cultural lens.

The reason I am framing this through DEI is that our community sits at the intersection of creativity, culture and access. A number of the people we would bring into the room are exactly the emerging and underrepresented voices festivals often say they want in attendance, but who are too often excluded by timing, cost or existing network structures.

We think there is a real opportunity here for SXSW London and Indvstry Clvb to work together in a way that is useful on both sides: stronger representation in the room, authentic amplification across the right creative audience, and meaningful support for the local cultural ecosystem around Shoreditch.

I am aware the official 2026 press pass application deadline was April 20, so I appreciate this would likely need to be treated as an exception request at this point.

If this is something you are open to, we are happy to handle vetting, selection and coordination on our side to keep it lightweight for your team.

Would love to hear whether there is a route to make this happen.

Best,

Amber`;

  const token = await getToken();
  await sendEmail(token, subject, body);
  console.log(`Sent to ${TO.name} <${TO.email}>`);
  console.log(`CC: ${CC.map((recipient) => recipient.address).join(', ')}`);
}

main().catch((error) => {
  const detail = error?.response?.data || error?.message || error;
  console.error(detail);
  process.exit(1);
});
