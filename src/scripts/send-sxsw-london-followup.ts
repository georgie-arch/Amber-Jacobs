import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const RECIPIENT = {
  name: process.env.RECIPIENT_NAME || 'Aran Hayashi',
  firstName: process.env.RECIPIENT_FIRST_NAME || 'Aran',
  email: process.env.RECIPIENT_EMAIL || 'aran.hayashi@sxswlondon.com',
};

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
    toRecipients: [{ emailAddress: { address: RECIPIENT.email, name: RECIPIENT.name } }],
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
  const subject = 'Checking in on SXSW London + delegate passes';
  const body = `Hi ${RECIPIENT.firstName},

I hope you are having a great week and that the SXSW London campus rollout is moving along smoothly.

I just wanted to check in and see how things are going on your side.

Following our previous conversations, I also wanted to revisit the idea of a Community Access Partnership between SXSW London and Indvstry Clvb for the upcoming June edition.

As you know, SXSW is at its best when the right people are in the room, the ones who bridge the gap between tech, culture, and high-level creativity. At Indvstry Clvb, we have a vetted cohort of creators and innovators who are exactly the kind of frontier thinkers your sessions are designed for.

We would love to secure an allocation of 20 Delegate Passes for our 2026 cohort.

The reason it feels like a strong fit is simple: our members do not just attend, they actively shape the energy in the room. They are entrepreneurs, producers, and tech leads who naturally drive conversations between sessions. They also create authentic, high-quality social content that would amplify the Shoreditch campus experience to the right UK creative audience. And more broadly, giving access to our community helps SXSW London feel embedded in the city's real creative ecosystem.

If there is a way to make the tickets happen, we would be very glad to handle the vetting and registration on our side so it is seamless for your team.

Would love to hear how things are looking from your end.

Best,

Amber`;

  const token = await getToken();
  await sendEmail(token, subject, body);
  console.log(`Sent to ${RECIPIENT.name} <${RECIPIENT.email}>`);
}

main().catch((error) => {
  const detail = error?.response?.data || error?.message || error;
  console.error(detail);
  process.exit(1);
});
