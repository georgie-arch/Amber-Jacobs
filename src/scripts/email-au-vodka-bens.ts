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

const body = (firstName: string) => `Hi ${firstName},

I wanted to reach out about something we are building at Cannes Lions this June that I think AU Vodka should be part of.

Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at Cannes. The kind of room where the next generation of brand partnerships get made.

AU Vodka as the spirit of the villa is the most natural fit I can think of. The brand, the aesthetic, the energy - it all belongs in that setting. And the content and crowd that comes with it is the kind of visibility that no campaign budget can replicate.

We are looking at a few different ways a brand like AU Vodka could integrate - from being the official spirit of the villa and our events throughout the week, to co-branded activations and content moments with the creators and leaders in the room. Happy to put together something specific once we have spoken.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

George`;

async function sendEmail(token: string, to: string, toName: string, firstName: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: 'Indvstry Power House x AU Vodka - Cannes Lions 2026',
    body: { contentType: 'HTML', content: buildHtml(body(firstName)) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
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
}

async function main() {
  const token = await getToken();

  await sendEmail(token, 'Ben.Welsh@auvodka.com', 'Ben Welsh', 'Ben');
  console.log('Sent to Ben Welsh <Ben.Welsh@auvodka.com>');

  await new Promise(resolve => setTimeout(resolve, 2000));

  await sendEmail(token, 'ben@auvodka.com', 'Ben Geall', 'Ben');
  console.log('Sent to Ben Geall <ben@auvodka.com>');

  console.log('\nDone.');
}

main().catch(console.error);
