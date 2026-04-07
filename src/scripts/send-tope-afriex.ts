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

const bodyText = `Hi Tope,

Been a while - hope you are well and things are moving at Afriex.

Came across this piece earlier and immediately thought of you:

Africa's Creative Economy Could Reach $200bn - If Markets Capture the Value
https://furtherafrica.com/2026/02/23/africa-creative-economy-200bn-2030/

The part about payment infrastructure being the central reason value keeps leaking outward really landed. African creatives and producers are driving enormous cultural and economic output globally right now - Afrobeats, Nollywood, fashion, digital content - but so much of the economic return does not make it back to the people generating it. The piece frames it well: the talent and the moment are there, the financial rails are not keeping up.

That is exactly the territory we have been working in with Indvstry Exchange. We are building something in East Africa specifically for the creative community there - connecting producers, artists, and creative professionals to networks, platforms, and infrastructure that can actually support them at scale. The payment layer is one of the things we keep coming back to and Afriex has always felt like a natural fit for what we are trying to do.

I also heard that you reached out to my partner Ralph recently about getting involved with Indvstry Exchange - really glad that connection happened. Things are still very much moving and there is definitely a way to bring Afriex into this properly.

Would be great to catch up and talk through it. Do you have some time in the next couple of weeks?

George`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Checking in  -  this article made me think of you',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'tope@afriex.co', name: 'Tope' } },
    ],
    ccRecipients: [
      { emailAddress: { address: 'ralphb@vuga.org', name: 'Ralph' } },
    ],
    from: {
      emailAddress: {
        address: process.env.EMAIL_USER || '',
        name: 'George Guise',
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

  await axios.post(
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('✅ Sent to Tope Alabi <tope@afriex.co>');
}

main().catch(console.error);
