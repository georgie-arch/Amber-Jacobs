/**
 * email-judy-lee-pinterest.ts
 *
 * Personalised outreach to Judy Lee (Sr. Director, Global Brand Experiences @ Pinterest)
 * about the Indvstry Power House activation at Cannes Lions 2026.
 *
 * Scheduled to send Tuesday 24 March 2026 at 10:00am EDT (14:00 UTC).
 * Run via the scheduler or manually:
 *   npx ts-node --project tsconfig.json src/scripts/email-judy-lee-pinterest.ts
 */

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
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

const bodyText = `Hi Judy,

I've been following what your team builds and the through-line is always the same — you don't just show up at cultural moments, you create the conditions for people to genuinely feel something inside them. Manifestival, Possibility Place in London, the way you've consistently built spaces that are inclusive and co-created rather than performed. That's a rare thing in this industry and it doesn't go unnoticed.

I'm reaching out because we're doing something at Cannes Lions 2026 that sits in exactly the same territory, and the moment I started mapping who we'd want in the room, Pinterest came up immediately.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated space where 30 of the most interesting people in creative culture, advertising, and brand come together for five days of real conversation, collaboration, and connection. Less conference, more living room. The kind of environment where the conversations that actually matter happen — because there's no stage, no pitch energy, just the right people with the space to think.

The reason your "Make It Real" positioning resonates so strongly with what we're building is that the people in our villa are exactly that — creative directors, founders, filmmakers, photographers who have spent years turning inspiration into something tangible. It is, in the most literal sense, a Pinterest board brought to life.

What I'd love to explore with you is two things. First, if Pinterest has senior creative talent or cultural figures attending Cannes, we would love to host them at the villa — it's a completely different energy to the beach activations, private and intimate, and the kind of place where genuine relationships form. Second, we think there's a compelling co-hosted moment to be had — a panel or mixer around creative community and what it actually takes to build culture from the inside. Your perspective on what makes a creative space work versus simply performing that would resonate deeply with our room.

Partnership snapshot for Judy's team: ${DECK_BASE_URL}/deck/pinterest

Full sponsorship scope: ${CANVA_DECK}

And more about the Power House here: https://powerhouse.indvstryclvb.com

If this is something you'd like to explore further, we'd love to set up a call with our events lead George, who is driving the whole activation. You can book directly into his calendar here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Judy.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Cannes 2026 — from one creative house to another',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'jlee@pinterest.com', name: 'Judy Lee' } },
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

  console.log('✅ Email sent to Judy Lee at jlee@pinterest.com');
}

main().catch(console.error);
