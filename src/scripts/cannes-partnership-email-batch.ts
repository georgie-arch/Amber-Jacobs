/**
 * cannes-partnership-email-batch.ts
 *
 * Sends Cannes Lions partnership outreach to:
 * - Influential
 * - PayPal Ads
 * - The Washington Post
 *
 * Each company gets 3 recipients with a short, direct pitch that links
 * to the Power House deck and website and opens the door to a partnership call.
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/cannes-partnership-email-batch.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_URL = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/view';
const SITE_URL = 'https://powerhouse.indvstryclvb.com';
const CALENDAR_URL = 'https://calendly.com/itsvisionnaire/30min';

type Recipient = {
  name: string;
  email: string;
  company: string;
  subject: string;
  body: string;
};

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
  } catch {
    return '';
  }
}

function buildHtml(body: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${body.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body>
</html>`;
}

function bodyTemplate(firstName: string, hook: string): string {
  return `Hi ${firstName},

${hook}

We are building Indvstry Power House for Cannes Lions 2026, a private villa activation for a deliberately small group of senior creative and marketing leaders. It is a high-trust room for proper conversations, not a noisy sponsorship package.

If it feels relevant, I would love to share the deck and talk through what a partnership could look like.

Deck: ${DECK_URL}
Website: ${SITE_URL}
Call: ${CALENDAR_URL}

George`;
}

const RECIPIENTS: Recipient[] = [
  {
    name: 'Ryan Detert',
    email: 'rdetert@influential.co',
    company: 'Influential',
    subject: 'Influential x Indvstry Power House - Cannes Lions 2026',
    body: bodyTemplate(
      'Ryan',
      'Your comment about the Influential CES Party List - "comment below and I\'ll message it over" - is exactly the kind of network-first thinking that makes your Cannes footprint work. Influential already knows how to build a room people want to be in.'
    ),
  },
  {
    name: 'Chris Poydenis',
    email: 'cpoydenis@influential.co',
    company: 'Influential',
    subject: 'A Cannes partnership idea for Influential',
    body: bodyTemplate(
      'Chris',
      'Your role across revenue and partnerships at Influential is exactly why I wanted to reach out. Cannes is a rare moment where the right room can turn into real business, and Influential has already shown it understands how to shape that room.'
    ),
  },
  {
    name: 'Tara Rothman',
    email: 'trothman@influential.co',
    company: 'Influential',
    subject: 'Influential Beach / Power House conversation for Cannes',
    body: bodyTemplate(
      'Tara',
      'Your team\'s Cannes presence has become one of the more recognisable beach activations at the festival. That line between creator network, culture and commercial value is exactly where Power House lives too.'
    ),
  },
  {
    name: 'Geoff Seeley',
    email: 'gseeley@paypal.com',
    company: 'PayPal',
    subject: 'PayPal Ads x Indvstry Power House - Cannes Lions 2026',
    body: bodyTemplate(
      'Geoff',
      'Your recent move to lead PayPal\'s global marketing gives the brand a sharp point of view for Cannes, and it fits the way PayPal Ads is showing up in the market. The PayPal story is strongest when it is tied to culture, trust and clear commercial intent.'
    ),
  },
  {
    name: 'Mark Grether',
    email: 'mark.grether@paypal.com',
    company: 'PayPal',
    subject: 'PayPal Ads at Cannes Lions 2026',
    body: bodyTemplate(
      'Mark',
      'Your line about PayPal Ads being built on transaction data rather than on-site inventory is still one of the clearest statements in commerce media. That is a strong Cannes story, and it is exactly the kind of perspective that belongs in our villa.'
    ),
  },
  {
    name: 'Jillian Kranz',
    email: 'jillian.kranz@paypal.com',
    company: 'PayPal',
    subject: 'A Cannes room for PayPal Ads',
    body: bodyTemplate(
      'Jillian',
      'Your LinkedIn post about the PayPal Ads team being in Miami Beach to talk about what is next for commerce, retail and media was the right tone. Cannes is another one of those moments, and the room we are building is designed for exactly that kind of conversation.'
    ),
  },
  {
    name: 'Johanna Mayer-Jones',
    email: 'johanna.mayer-jones@washingtonpost.com',
    company: 'The Washington Post',
    subject: 'The Washington Post x Indvstry Power House - Cannes Lions 2026',
    body: bodyTemplate(
      'Johanna',
      'Your point that advertisers can play a real role in supporting journalism and news organisations is the right lens for this conversation. That is the kind of strategic partnership thinking we want to build around at Cannes.'
    ),
  },
  {
    name: 'Gemma Floyd',
    email: 'gemma.floyd@washingtonpost.com',
    company: 'The Washington Post',
    subject: 'Cannes partnership idea for The Washington Post',
    body: bodyTemplate(
      'Gemma',
      'The Post has been showing up at Cannes with a clear point of view rather than just a logo, and that is why I wanted to reach out. The room we are building gives brands and publishers access to the people shaping culture, media and advertising.'
    ),
  },
  {
    name: 'Washington Post Partnerships',
    email: 'partnerships@washpost.com',
    company: 'The Washington Post',
    subject: 'Partnership idea for The Washington Post at Cannes Lions 2026',
    body: bodyTemplate(
      'team',
      'The Post\'s Cannes programming around creators, journalism and AI is a strong sign of where the conversation is going. We would love to explore a partnership angle that builds on that point of view and gives you access to a genuinely senior room.'
    ),
  },
];

async function sendEmail(token: string, recipient: Recipient): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: Record<string, unknown> = {
    subject: recipient.subject,
    body: { contentType: 'HTML', content: buildHtml(recipient.body) },
    toRecipients: [{ emailAddress: { address: recipient.email, name: recipient.name } }],
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

async function main(): Promise<void> {
  const token = await getToken();
  let sent = 0;

  for (const recipient of RECIPIENTS) {
    try {
      await sendEmail(token, recipient);
      sent++;
      console.log(`[${sent}/${RECIPIENTS.length}] Sent to ${recipient.name} <${recipient.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${recipient.name} <${recipient.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\nDone. ${sent}/${RECIPIENTS.length} emails sent.`);
}

main().catch(console.error);
