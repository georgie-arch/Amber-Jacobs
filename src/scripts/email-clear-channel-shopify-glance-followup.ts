/**
 * email-clear-channel-shopify-glance-followup.ts
 *
 * 7-day follow-up to the initial Power House outreach sent 26 March 2026.
 * Recipients: Dan Levi (Clear Channel), Jessica Williams (Shopify), Mansi Jain (Glance AI)
 *
 * Run:      npx ts-node --project tsconfig.json src/scripts/email-clear-channel-shopify-glance-followup.ts
 * Test one: SEND_ONLY=dan npx ts-node --project tsconfig.json src/scripts/email-clear-channel-shopify-glance-followup.ts
 * Scheduled: Thursday 2 April 2026 at 12:03pm BST (11:03am UTC)
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CALENDLY  = 'https://calendly.com/itsvisionnaire/30min';
const DECK_URL  = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const WEBSITE   = 'https://www.indvstryclvb.com';
const SEND_ONLY = process.env.SEND_ONLY?.toLowerCase() || null;

interface Contact {
  key: string;
  name: string;
  email: string;
  subject: string;
  bodyText: string;
}

const CONTACTS: Contact[] = [
  {
    key: 'dan',
    name: 'Dan',
    email: 'dan.levi@clearchannel.com',
    subject: 'Re: Indvstry Power House, Cannes 2026 - partnership',
    bodyText: `Hi Dan,

Just following up on the note I sent across last week about Indvstry Power House at Cannes Lions 2026.

We still have a small number of partnership packages available and think there is a strong fit with what Clear Channel is building into this year's festival. Happy to keep it to a 20-minute call if that is easier.

You can grab a time here: ${CALENDLY}

Or take a look at the deck if you have not had a chance yet: ${DECK_URL}

Best,
Amber`,
  },
  {
    key: 'jessica',
    name: 'Jessica',
    email: 'jessica@shopify.com',
    subject: 'Re: Indvstry Power House, Cannes 2026 - partnership',
    bodyText: `Hi Jessica,

Just a quick follow-up on the note I sent last week about Indvstry Power House at Cannes Lions 2026.

We are finalising our partnership packages now and wanted to make sure this landed with you before we close things out. Even a 20-minute call to see if there is a fit would be great.

Grab a time here: ${CALENDLY}

Deck here if useful: ${DECK_URL}

Best,
Amber`,
  },
  {
    key: 'mansi',
    name: 'Mansi',
    email: 'mansi.jain@inmobi.com',
    subject: 'Re: Indvstry Power House, Cannes 2026 - partnership',
    bodyText: `Hi Mansi,

Just following up on the note I sent last week about Indvstry Power House at Cannes Lions 2026.

We are getting close to finalising activations for the villa and wanted to make sure Glance AI had the chance to be part of the conversation before we confirm everything. The fit feels genuine - happy to walk through it on a quick call.

Grab a time here: ${CALENDLY}

Deck here if you have not seen it yet: ${DECK_URL}

Best,
Amber`,
  },
];

// ---------------------------------------------------------------------------
// Helpers
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

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${contact.bodyText.replace(/\n/g, '<br>')}</div>
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

  const token   = await getToken();
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

  console.log(`\n${sent}/${targets.length} follow-up emails sent.`);
}

main().catch(console.error);
