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

const emailBody = `Hi Sandra,

Thank you so much for agreeing to come on board as a partner for Indvstry Power House at Cannes Lions 2026. We are genuinely excited to have Windrush 1027 Rum as part of this experience and I think the fit is perfect.

Just to confirm the arrangement as we discussed: Windrush 1027 will be providing 15 customised bottles of rum to support the partnership. Our plan is to deliver each bottle alongside a personal invitation note to our villa guests and a selection of key industry speakers attending Cannes Lions this June. Each delivery will be done individually, so every recipient gets a proper branded moment with the bottle rather than a generic package.

A couple of things I wanted to check with you on that front:

Would it be possible to include a mixer alongside each bottle? Something that pairs well with the rum would really elevate the gifting experience. Also, do you have branded packaging or boxes you would like the bottles presented in? We want to make sure everything arrives looking exactly how you want the brand represented.

The plan is for the bottles to come to us first so we can handle the individual sends to guests. If you could ship them to the address below that would be great:

Unity Lounge and Bar
Sports Club Thamesmead
Bayliss Ave
London SE28 8NJ

Beyond the gifting, the main moment for Windrush 1027 will be the event we host at the villa itself. Closer to June I would love to make arrangements for you to ship bottles directly to Cannes so the rum is front and centre at the villa, featured in photos, videos and reels from a beautiful South of France setting with a genuinely notable crowd. That kind of content is rare and I think it will be really powerful for the brand. We can lock in the logistics for that closer to the time once I have the villa address confirmed.

In return for the partnership, here is what we are offering:

A dedicated mention in our newsletter, which reaches over 15,000 people across the creative and brand industry.

Your logo featured on the Indvstry Clvb website and on select event flyers.

Reels and Instagram posts from villa guests and invitees featuring Windrush 1027 at Cannes.

We will tag and credit Windrush 1027 across everything and make sure the brand is represented beautifully throughout.

Please do let me know your thoughts on the mixer and packaging and we can get the details sorted. Really looking forward to building something great together.

George`;

async function main() {
  const token = await getToken();

  const logoB64 = getLogoBase64();
  const message: any = {
    subject: 'Windrush 1027 x Indvstry Power House - Cannes Lions 2026',
    body: { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'sandra@windrush1027.com', name: 'Sandra Omari' } }],
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

  console.log('Sent to Sandra Omari <sandra@windrush1027.com>');
  console.log('Done.');
}

main().catch(console.error);
