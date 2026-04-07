/**
 * email-che-wheatley-ft.ts
 *
 * Warm outreach to Che Wheatley at the Financial Times.
 * She attended our Diaspora Dinner last year — this is a follow-up
 * proposing a Power House partnership and offering George for FT panels.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-che-wheatley-ft.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_BASE_URL = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const POWERHOUSE = 'https://powerhouse.indvstryclvb.com';
const CALENDLY = 'https://calendly.com/itsvisionnaire/30min';

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
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
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

const bodyText = `Hi Che,

I hope you are well. I have been meaning to reach out since last year's Diaspora Dinner and Cannes is the perfect reason to do it properly.

Having you at the dinner meant a lot to us. It was exactly the kind of evening we wanted it to be — the right people, a real conversation, no performance of it. I hope it landed that way for you too.

We are back at Cannes Lions 2026 and this year we are doing something bigger. Indvstry Power House is a private villa activation running alongside the festival — a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We come with over 75,000 euros in Cannes Lions delegate passes already secured, and we are very deliberate about who gets into the space.

Given our history and what we are both trying to do at Cannes, a partnership feels like a natural conversation to have.

On that note — we also know the FT is looking for people attending Cannes Lions this year ahead of a campaign launching next month, and that you are looking for a host for the People Like Us event as well as speakers for other events that week. Our founder George Guise is absolutely open to being considered for any of those opportunities. He is a natural on a panel — culturally sharp, direct, and not afraid to say the thing other people are thinking. I think he would be a genuine asset to the FT's programming.

In terms of what we can offer you in return: a partnership inside the villa, a presence at the Diaspora Dinner again this year, and access to the room we are building. The FT's voice inside that space would carry real weight.

Partnership snapshot for the FT: ${DECK_BASE_URL}/deck/ft

Full sponsorship scope: ${CANVA_DECK}

And more on the Power House: ${POWERHOUSE}

Would you be open to a quick call with George to talk through both sides of this? His calendar is here: ${CALENDLY}

Really looking forward to reconnecting, Che.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Cannes Lions 2026 — Power House + FT partnership, Che',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [{ emailAddress: { address: 'Che.wheatley@ft.com', name: 'Che Wheatley' } }],
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
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('✅ Email sent to Che Wheatley at Che.wheatley@ft.com');
}

main().catch(console.error);
