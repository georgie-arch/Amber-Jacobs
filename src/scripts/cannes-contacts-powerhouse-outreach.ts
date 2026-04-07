/**
 * cannes-contacts-powerhouse-outreach.ts
 *
 * Outreach to George's Cannes contacts about Indvstry Power House.
 * Sent as George Guise.
 *
 * NOTE: Destiny K. Chambers has no email on file — handle via LinkedIn/IG manually.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const DECK_URL = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const SITE_URL = 'https://www.indvstryclvb.com';
const CALENDAR_URL = 'https://calendly.com/itsvisionnaire/30min';

const CONTACTS = [
  {
    firstName: 'Shreyom',
    lastName: 'Ghshoh',
    email: 'shreyom@tasiafilms.com',
    company: 'Tasia Films',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Cindy',
    lastName: 'Hill',
    email: 'cindy@gracemarketingagency.com',
    company: 'Grace Marketing Agency',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Troy',
    lastName: 'Antunes',
    email: 'troy.antunes@yourichrecords.com',
    company: 'YR Records',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Tracy',
    lastName: 'Sturdivant',
    email: 'tracy@wearetheleague.org',
    company: 'The League',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Ross',
    lastName: 'Hyland',
    email: 'Ross.hyland@identitymusic.com',
    company: 'Identity Music',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Aleisia',
    lastName: 'Wright',
    email: 'awright@twelvenote.com',
    company: 'TwelveNote',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Devon',
    lastName: 'Johnson',
    email: 'devon@bomesi.org',
    company: 'BOMESI',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'M',
    lastName: 'Shafique',
    email: 'info@studypartners.co.uk',
    company: 'Study Partners',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Bolanile',
    lastName: 'Olatunji',
    email: 'Bolanile.olatunji@gmail.com',
    company: '',
    metAt: 'Cannes Lions',
  },
  {
    firstName: 'Kathya',
    lastName: '',
    email: 'kathymintsa@gmail.com',
    company: '',
    metAt: 'Cannes Lions',
  },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logo = getLogoBase64();
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logo ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />` : ''}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="${SITE_URL}" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

function buildBody(contact: typeof CONTACTS[0]): string {
  const name = contact.firstName;
  const companyLine = contact.company ? ` at ${contact.company}` : '';

  return `Hi ${name},

Good to connect again -- we met at ${contact.metAt} and I have been meaning to reach back out.

I am building something I think you will want to be part of. Indvstry Power House is our private villa activation at Cannes Lions 2026 -- a curated three-day space bringing together the most interesting people in creativity, media and brand. Think intimate dinners, meaningful conversations and the kind of connections that do not happen on the Croisette.

We have secured 21 passes through the ERA program, and I am looking for the right partners to activate alongside us. Given what you are building${companyLine}, I think there is a real fit here.

Here is the deck: ${DECK_URL}

And the site: ${SITE_URL}

Are you heading to Cannes this year? If so, I would love to get on a quick call and explore what a partnership could look like.

Book a time here: ${CALENDAR_URL}

George`;
}

async function sendEmail(
  token: string,
  contact: typeof CONTACTS[0]
): Promise<boolean> {
  const logo = getLogoBase64();
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const body = buildBody(contact);

  const message: any = {
    subject: 'Indvstry Power House, Cannes 2026 -- want in?',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: contact.email, name: fullName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
  };

  if (logo) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logo,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return true;
}

async function main() {
  console.log('\nIndvstry Power House — Cannes Contacts Outreach');
  console.log('═'.repeat(50));
  console.log(`Sending to ${CONTACTS.length} contacts as George Guise`);
  console.log(`NOTE: Destiny K. Chambers skipped -- no email on file (handle via LinkedIn/IG)\n`);

  const token = await getAccessToken();

  for (const contact of CONTACTS) {
    const display = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    process.stdout.write(`  ${display} <${contact.email}>... `);
    try {
      await sendEmail(token, contact);
      console.log('sent');
    } catch (err: any) {
      console.log(`FAILED -- ${err.response?.data?.error?.message || err.message}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\nDone.');
  console.log('\nPending manual action:');
  console.log('  Destiny K. Chambers -- no email, reach out via LinkedIn or Instagram');
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
