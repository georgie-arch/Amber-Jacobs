/**
 * Sponsorship outreach to Seth Catalano, Caudalie
 * Seth.catalano@caudalie.com — Indvstry Power House Cannes Lions 2026
 */

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

const body = `Hi Seth,

I am reaching out because I think there is a really strong fit between Caudalie and something we are building this June in the south of France.

I am George Guise, founder of Indvstry Clvb, a private members community for senior creative and brand professionals. This year we are hosting Indvstry Power House, a private villa activation running alongside Cannes Lions 2026 from 21 to 26 June. Seven curated residents, a luxury villa, private pool, and a week of closed-door events, dinners and cultural moments with some of the most senior people in global media, marketing and the creative industries.

The setting, the audience and the aesthetic of what we are building feels completely aligned with Caudalie's world. Cannes Lions week is one of the most significant moments in the brand and creative calendar, and the villa is where the real conversations happen.

We would love to have Caudalie involved as a sponsor for Indvstry Power House. Whether that is through product placement across the villa and our gifting to guests, brand presence at our private Diaspora Dinner on 23 June, or a broader content and visibility partnership, we are open to building something that works for the brand. The audience in the room are exactly the kind of tastemakers and decision-makers Caudalie should be in front of, and the content that comes out of a beautiful South of France setting with this crowd is genuinely compelling.

I also dropped a note to Olivia so you may have already heard about this, but I wanted to reach out to you directly as well.

Would love to get 20 minutes with you to talk through what this could look like. You can book into my calendar here: https://calendly.com/itsvisionnaire/30min

George`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Caudalie x Indvstry Power House — Cannes Lions 2026 Sponsorship',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: 'Seth.catalano@caudalie.com', name: 'Seth Catalano' } }],
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

  console.log('Sent to Seth Catalano <Seth.catalano@caudalie.com>');
}

main().catch(console.error);
