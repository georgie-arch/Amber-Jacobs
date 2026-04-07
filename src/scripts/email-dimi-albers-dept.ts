/**
 * email-dimi-albers-dept.ts
 *
 * Personalised outreach to Dimi Albers (Global CEO @ DEPT®)
 * pitching a co-hosted creative leaders panel at Indvstry Power House, Cannes Lions 2026.
 *
 * Scheduled: Tuesday 24 March 2026 at 10:00am CET (09:00 UTC).
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

const bodyText = `Hi Dimi,

I read your quote from the Secret Garden last year and it stuck with me: "We wanted to create a space that brings the noise down and the level of conversation up."

That's exactly what we're building too, and I think there's something worth exploring together.

Indvstry Power House is a private villa activation running alongside Cannes Lions 2026 — a curated space hosting 30 of the most senior creative and marketing leaders across culture, brand, and agency for five days of closed-door conversation, meals, and collaboration. No badge-swapping, no pitching. Just the right people, in the right environment, with the space to actually think.

The reason DEPT comes to mind immediately is that what you built with the Secret Garden isn't what most agencies do at Cannes. You're not performing, you're facilitating — and that takes a very different kind of intention. That's the same instinct behind the Power House.

What I'd love to put to you is a co-hosted panel — something in the territory of creative leadership and what it actually takes to build and sustain great creative culture inside a global agency. Your perspective on DEPT's evolution, how you run creative at scale, how you're thinking about the next generation of creative talent — that would land seriously well with our room. And frankly, the conversation you'd get back from the people in that villa would be worth the trip alone.

The Secret Garden and the Power House aren't in competition — they sit at different ends of the week and attract different moments. What we're proposing is one shared conversation that benefits both.

Partnership snapshot for Dimi's team: ${DECK_BASE_URL}/deck/dept

Full sponsorship scope: ${CANVA_DECK}

And the Power House itself: https://powerhouse.indvstryclvb.com

If this resonates, we'd love to get you on a call with our events lead George who is driving the whole activation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Cannes 2026 — a conversation worth having, Dimi',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'dimi.albers@deptagency.com', name: 'Dimi Albers' } },
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

  console.log('✅ Email sent to Dimi Albers at dimi.albers@deptagency.com');
}

main().catch(console.error);
