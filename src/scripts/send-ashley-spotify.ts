import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_BASE_URL = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';

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

const bodyText = `Hi Ashley,

Spotify Beach is one of the best things Cannes has. The scale of it, the quality of the talent, the way it creates genuine moments rather than just brand proximity to moments  -  it is a masterclass in how to activate at a festival without losing what made the original idea worth doing.

I am reaching out because we are building something at Cannes Lions 2026 that lives in a very different register  -  and I think the two are complementary in a way that is worth exploring.

Indvstry Power House is a private villa activation running alongside Cannes Lions  -  a curated space hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door conversation, shared meals, and real connection. No stages, no ticket-holders. Just the right 30 people in a private residence, 30 minutes from the festival by car, with the space to actually think.

The reason Spotify comes to mind immediately is that the conversation we want to have inside the villa  -  about music, culture, the creator economy, and what brand partnership in audio looks like in 2026  -  is one you are uniquely positioned to lead. Not the panel version. The version where a Spotify voice is in a room with 30 CMOs and creative directors who are actively making decisions about where audio sits in their brand strategy.

Spotify Beach brings the energy. The Power House is where the decisions get made. There is a session to be built here that benefits both.

Partnership snapshot for your team: ${DECK_BASE_URL}/deck/spotify

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to connect. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Ashley.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Cannes 2026  -  Spotify Beach meets Power House, Ashley',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'acarbone@spotify.com', name: 'Ashley' } },
    ],
    from: {
      emailAddress: {
        address: process.env.EMAIL_USER || '',
        name: 'Amber Jacobs',
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

  console.log('✅ Sent to Ashley <acarbone@spotify.com>');
}

main().catch(console.error);
