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

const bodyText = `Hi Anna,

The programming Ad Age puts together at Cannes is some of the most substantive at the festival. The CMO roundtables, the Lawn, the Global Leading Women event  -  it all has a seriousness to it that a lot of Cannes activations miss. You clearly understand what the senior marketing audience actually wants from the week, which is why I wanted to reach out directly.

We are building something at Cannes Lions 2026 that I think sits naturally alongside what Ad Age does there  -  and I think there is a conversation worth having about how the two could complement each other.

Indvstry Power House is a private villa activation running alongside Cannes Lions  -  a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets into the space. No stages, no general access. Just the right room.

What I would love to explore with you is a co-hosted session inside the villa built around an Ad Age editorial angle  -  whether that is the future of brand creativity, the CMO agenda for 2026, or something you are already programming for the week. Your voice in a room like that, with 30 decision-makers who are not distracted by the Croisette, feels like a different kind of conversation than the Lawn can offer.

There is also an audience alignment worth noting. The people inside the Power House are the same people Ad Age writes for and programmes for. Getting Ad Age into that room in a more intimate format  -  as a co-host rather than a sponsor wall  -  is a different kind of presence at Cannes.

Partnership snapshot: ${DECK_BASE_URL}/deck/adage

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to get on a call. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts, Anna.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Cannes 2026  -  Ad Age x Power House, Anna',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'asekula@adage.com', name: 'Anna Sekula' } },
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

  console.log('✅ Sent to Anna Sekula <asekula@adage.com>');
}

main().catch(console.error);
