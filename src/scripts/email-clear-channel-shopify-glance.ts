/**
 * email-clear-channel-shopify-glance.ts
 *
 * Personalised Cannes Lions partnership outreach to:
 *   - Dan Levi (EVP & CMO, Clear Channel Outdoor)
 *   - Jessica Williams (Head of Brand Marketing & Partnerships, Shopify)
 *   - Mansi Jain (COO, Glance AI / InMobi)
 *
 * Each email includes a branded summary card styled to the recipient's company.
 *
 * Run:        npx ts-node --project tsconfig.json src/scripts/email-clear-channel-shopify-glance.ts
 * Test one:   SEND_ONLY=dan npx ts-node --project tsconfig.json src/scripts/email-clear-channel-shopify-glance.ts
 * Scheduled:  Thursday 26 March 2026 at 12:03pm UK / UTC
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CALENDLY   = 'https://calendly.com/itsvisionnaire/30min';
const DECK_URL   = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const WEBSITE    = 'https://www.indvstryclvb.com';
const SEND_ONLY  = process.env.SEND_ONLY?.toLowerCase() || null;

// ---------------------------------------------------------------------------
// Branded summary card HTML — one per company
// ---------------------------------------------------------------------------

// Clear Channel: dark/bold OOH aesthetic — black background, red accent
function summaryCardClearChannel(): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:10px;margin-bottom:28px;overflow:hidden;">
  <tr>
    <td style="padding:28px 28px 12px 28px;">
      <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#E30713;font-family:Arial,sans-serif;">INDVSTRY POWER HOUSE - CANNES LIONS 2026</p>
      <p style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;line-height:1.35;">A curated villa for the people<br>who decide where creativity goes next.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 20px 28px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:28px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#E30713;font-family:Arial,sans-serif;">3</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#999999;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Days</p>
          </td>
          <td style="padding-right:28px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#E30713;font-family:Arial,sans-serif;">50+</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#999999;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Senior Leaders</p>
          </td>
          <td>
            <p style="margin:0;font-size:22px;font-weight:bold;color:#E30713;font-family:Arial,sans-serif;">1</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#999999;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Private Villa</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 24px 28px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px;">
            <a href="${DECK_URL}" style="display:inline-block;background:#E30713;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;padding:10px 20px;border-radius:5px;letter-spacing:0.5px;">View Partnership Deck</a>
          </td>
          <td>
            <a href="${WEBSITE}" style="display:inline-block;background:transparent;border:1px solid #444;color:#cccccc;font-family:Arial,sans-serif;font-size:12px;text-decoration:none;padding:10px 20px;border-radius:5px;">indvstryclvb.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// Shopify: clean, green, creator-forward aesthetic — white/light with Shopify green
function summaryCardShopify(): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f1;border-radius:10px;border-left:4px solid #008060;margin-bottom:28px;overflow:hidden;">
  <tr>
    <td style="padding:28px 28px 12px 28px;">
      <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#008060;font-family:Arial,sans-serif;">INDVSTRY POWER HOUSE - CANNES LIONS 2026</p>
      <p style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#1a1a1a;font-family:Arial,sans-serif;line-height:1.35;">Creative founders. Brand leaders.<br>Culture makers. One villa.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 20px 28px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:28px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#008060;font-family:Arial,sans-serif;">3</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#666666;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Days</p>
          </td>
          <td style="padding-right:28px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#008060;font-family:Arial,sans-serif;">50+</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#666666;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">CMOs and Founders</p>
          </td>
          <td>
            <p style="margin:0;font-size:22px;font-weight:bold;color:#008060;font-family:Arial,sans-serif;">June</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#666666;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Cannes, France</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 24px 28px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px;">
            <a href="${DECK_URL}" style="display:inline-block;background:#008060;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;padding:10px 20px;border-radius:5px;letter-spacing:0.5px;">View Partnership Deck</a>
          </td>
          <td>
            <a href="${WEBSITE}" style="display:inline-block;background:#ffffff;border:1px solid #cccccc;color:#333333;font-family:Arial,sans-serif;font-size:12px;text-decoration:none;padding:10px 20px;border-radius:5px;">indvstryclvb.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// Glance AI: dark purple / tech-forward / AI-fashion aesthetic
function summaryCardGlanceAI(): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1C0B3D;border-radius:10px;margin-bottom:28px;overflow:hidden;">
  <tr>
    <td style="padding:28px 28px 12px 28px;">
      <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#9B5CFF;font-family:Arial,sans-serif;">INDVSTRY POWER HOUSE - CANNES LIONS 2026</p>
      <p style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;line-height:1.35;">Your activation. Your room.<br>The fashion, retail and media leaders who buy.</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 20px 28px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:28px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#9B5CFF;font-family:Arial,sans-serif;">3</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#9999bb;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Days</p>
          </td>
          <td style="padding-right:28px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#9B5CFF;font-family:Arial,sans-serif;">50+</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#9999bb;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Brand Decision-Makers</p>
          </td>
          <td>
            <p style="margin:0;font-size:22px;font-weight:bold;color:#9B5CFF;font-family:Arial,sans-serif;">1</p>
            <p style="margin:2px 0 0 0;font-size:11px;color:#9999bb;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Private Villa, Cannes</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 24px 28px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px;">
            <a href="${DECK_URL}" style="display:inline-block;background:#9B5CFF;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;padding:10px 20px;border-radius:5px;letter-spacing:0.5px;">View Partnership Deck</a>
          </td>
          <td>
            <a href="${WEBSITE}" style="display:inline-block;background:transparent;border:1px solid #4a3070;color:#cccccc;font-family:Arial,sans-serif;font-size:12px;text-decoration:none;padding:10px 20px;border-radius:5px;">indvstryclvb.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

interface Contact {
  key: string;
  name: string;
  email: string;
  subject: string;
  bodyText: string;
  summaryCard: string;
}

const CONTACTS: Contact[] = [
  {
    key: 'dan',
    name: 'Dan',
    email: 'dan.levi@clearchannel.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    summaryCard: summaryCardClearChannel(),
    bodyText: `Hi Dan,

Congratulations on the L. Ray Vahue Award - it is a well-deserved recognition of the work you and the team have done to push OOH forward.

I wanted to reach out about Indvstry Power House - our curated villa activation at Cannes Lions 2026. We bring together CMOs, agency heads, and creative leaders for three days of programming, dinners, and conversations that do not make it onto the main stage.

Given the new chapter Clear Channel is entering with the Mubadala partnership, we think there is a compelling opportunity to co-programme a session around the future of creativity and outdoor. Something that puts Clear Channel at the centre of a room full of the decision-makers who are shaping where creative budgets and ideas go next - in a setting that complements rather than competes with Le Jardin.

I have attached our deck and would love to explore what a partnership could look like. Would you be open to a quick call?

${CALENDLY}

Best,
Amber`,
  },
  {
    key: 'jessica',
    name: 'Jessica',
    email: 'jessica@shopify.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    summaryCard: summaryCardShopify(),
    bodyText: `Hi Jessica,

I caught your recent appearance on Be Anomalous talking about how culture, community and psychology shape the brands we trust - it really resonated, and honestly it describes exactly what we are building at Indvstry Power House.

Power House is our curated villa activation at Cannes Lions 2026 - three days of intimate programming, dinners, and conversations for CMOs, creative founders, and agency leaders. After the creatorpreneur conversation you helped bring to Cannes in 2025, we think there is a natural partnership here.

The room we are putting together - creative founders, brand decision-makers, cultural leaders - is the room Shopify wants to be in. We have a partnership opportunity that would put Shopify at the centre of that conversation in a way that feels genuinely on-brand, not just a logo on a wall.

Would love to get on a quick call and explore what this could look like.

${CALENDLY}

Best,
Amber`,
  },
  {
    key: 'mansi',
    name: 'Mansi',
    email: 'mansi.jain@inmobi.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    summaryCard: summaryCardGlanceAI(),
    bodyText: `Hi Mansi,

The Glance AI launch in February was impressive - the lock screen as an entry point to AI-powered styling is a genuinely different way to reach people, and the Samsung partnership gives it real scale. Naveen's framing of agentic commerce at the India AI Impact Summit has also been one of the sharper articulations of where this is all heading.

I wanted to reach out about Indvstry Power House - our curated villa activation at Cannes Lions 2026. You did the mirror experience at VaynerMedia in 2025 and it clearly landed. Power House would give Glance AI its own room.

We bring together CMOs, creative directors, and brand leaders from fashion, retail, and media for three days of programming and dinners. An experiential activation - AI styling, virtual try-on - in that setting would put Glance AI directly in front of the decision-makers who can bring it into their brands and campaigns. With the US launch still fresh, Cannes is the moment to make that impression.

Would love to get on a call and explore what this could look like.

${CALENDLY}

Best,
Amber`,
  },
];

// ---------------------------------------------------------------------------
// Email builder
// ---------------------------------------------------------------------------

function getLogoBase64(): string {
  try {
    return fs
      .readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png'))
      .toString('base64');
  } catch {
    return '';
  }
}

function buildHtml(contact: Contact): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const bodyHtml = contact.bodyText.replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">

  ${contact.summaryCard}

  <div style="margin-bottom:24px;">${bodyHtml}</div>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="${WEBSITE}" style="color:#1a1a1a;">${WEBSITE.replace('https://', '')}</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>

</body></html>`;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const targets = SEND_ONLY
    ? CONTACTS.filter((c) => c.key === SEND_ONLY)
    : CONTACTS;

  if (targets.length === 0) {
    console.error(`No contact found for SEND_ONLY="${SEND_ONLY}"`);
    process.exit(1);
  }

  const token  = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const contact of targets) {
    const message: any = {
      subject:      contact.subject,
      body:         { contentType: 'HTML', content: buildHtml(contact) },
      toRecipients: [{ emailAddress: { address: contact.email, name: contact.name } }],
      from:         { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
    };

    if (logoB64) {
      message.attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        name:          'indvstry-logo.png',
        contentType:   'image/png',
        contentBytes:  logoB64,
        contentId:     'indvstry-logo',
        isInline:      true,
      }];
    }

    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log(`Sent to ${contact.name} <${contact.email}>`);
      sent++;
    } catch (err: any) {
      console.error(`Failed: ${contact.email}`, err?.response?.data || err.message);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n${sent}/${targets.length} emails sent.`);
}

main().catch(console.error);
