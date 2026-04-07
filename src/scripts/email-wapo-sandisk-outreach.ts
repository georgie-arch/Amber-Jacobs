/**
 * email-wapo-sandisk-outreach.ts
 *
 * Partnership pitch emails to 5 Cannes decision-makers whose LinkedIn
 * profiles were unreachable via automation (private profiles).
 *
 * Washington Post:
 *   Johanna Mayer-Jones  — Global Chief Advertising Officer
 *   Gemma Floyd          — Global Head of Sales / Cannes Lions Speaker
 *
 * SanDisk:
 *   Heidi Arkinstall     — VP Global Consumer Brand & Digital Marketing
 *   Joel Davis           — VP Creative & Brand, Global Corporate Marketing
 *   Brian Pridgeon       — Director, Product Marketing & Community Creations
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/email-wapo-sandisk-outreach.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { enrichContactEmail } from '../integrations/hunter';

dotenv.config();

const DECK_BASE_URL    = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const CANVA_DECK       = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const POWERHOUSE_SITE  = 'https://powerhouse.indvstryclvb.com';
const GEORGE_CALENDAR  = 'https://calendly.com/itsvisionnaire/30min';

// ─── CONTACTS ────────────────────────────────────────────────────────────────

const CONTACTS = [
  {
    firstName: 'Johanna',
    lastName: 'Mayer-Jones',
    title: 'Global Chief Advertising Officer',
    company: 'The Washington Post',
    domain: 'washingtonpost.com',
    emailFallback: 'johanna.mayer-jones@washingtonpost.com',
  },
  {
    firstName: 'Gemma',
    lastName: 'Floyd',
    title: 'Global Head of Sales',
    company: 'The Washington Post',
    domain: 'washingtonpost.com',
    emailFallback: 'gemma.floyd@washingtonpost.com',
  },
  {
    firstName: 'Heidi',
    lastName: 'Arkinstall',
    title: 'VP, Global Consumer Brand and Digital Marketing',
    company: 'SanDisk',
    domain: 'sandisk.com',
    emailFallback: 'heidi.arkinstall@sandisk.com',
  },
  {
    firstName: 'Joel',
    lastName: 'Davis',
    title: 'VP, Creative & Brand, Global Corporate Marketing',
    company: 'SanDisk',
    domain: 'sandisk.com',
    emailFallback: 'joel.davis@sandisk.com',
  },
  {
    firstName: 'Brian',
    lastName: 'Pridgeon',
    title: 'Director, Product Marketing & Community Creations',
    company: 'SanDisk',
    domain: 'sandisk.com',
    emailFallback: 'brian.pridgeon@sandisk.com',
  },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

// ─── HTML BUILDER ─────────────────────────────────────────────────────────────

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

// ─── EMAIL SENDER ─────────────────────────────────────────────────────────────

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  body: string
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: Record<string, unknown> = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
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
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── EMAIL BODIES ─────────────────────────────────────────────────────────────

function bodyJohannaMayerJones(): string {
  return `Hi Johanna,

The Washington Post's Cannes presence is one of the more considered ones in media. You show up with a point of view, not just a logo, which is exactly the kind of partnership energy we are looking for at the Power House.

I am reaching out because we are building something at Cannes Lions 2026 that I think is worth a conversation.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets in. The villa is 30 minutes from the festival by car.

For The Washington Post, I think the most interesting angle is access to the room: founders, creators, and senior brand decision-makers who are not reachable in the main festival environment. Whether that is a co-hosted session, a branded dinner, or a presence at our Diaspora Dinner on June 23 at Epi Beach, we can build something that makes sense for where The Post is going as a media brand.

Partnership deck: ${DECK_BASE_URL}/deck/washingtonpost

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to connect directly. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function bodyGemmaFloyd(): string {
  return `Hi Gemma,

Speaking at the Washington Post's Cannes programming puts you in a rare position: someone who both shapes the editorial conversation and drives the commercial relationships that make it possible. That combination is exactly what we want in the Power House.

I am reaching out because we are building something at Cannes Lions 2026 that I think aligns with how you think about brand partnerships.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and real connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access. The villa is 30 minutes from the festival by car.

For The Washington Post, the conversation I would love to have is around what a partnership looks like that goes beyond the standard Cannes sponsorship. The room we are building is the right audience for the Post's advertising story, and the format gives you access to those relationships in a way the festival floor does not.

Partnership deck: ${DECK_BASE_URL}/deck/washingtonpost

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George is the right person to take this forward. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function bodyHeidiArkinstall(): string {
  return `Hi Heidi,

SanDisk's pivot to putting content creators and filmmakers at the centre of the brand story is one of the sharper moves in the hardware space right now. It is the kind of positioning that belongs at Cannes Lions, not just at CES, and I think the Power House is the right room for that conversation.

I am reaching out because we are building something at Cannes Lions 2026 that I think is worth SanDisk's attention.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets in. The villa is 30 minutes from the festival by car.

The crowd is hand-picked: the creators, founders, and brand decision-makers that SanDisk wants proximity to. A partnership with the Power House gives you access to that room in a way no standard Cannes package comes close to replicating.

Partnership deck: ${DECK_BASE_URL}/deck/sandisk

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to connect. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function bodyJoelDavis(): string {
  return `Hi Joel,

The SanDisk rebrand was a proper statement: a hardware brand deciding it belongs in the creative and cultural conversation, not just on the shelf. That kind of thinking is exactly what the Power House is built around, and I think there is a real conversation to be had.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits right at the intersection of where SanDisk is going as a brand.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and real connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

A partnership with the Power House puts SanDisk in the room with the creators, agencies, and brand leaders who are already part of your world. Whether that is a co-hosted session, a curated dinner, or a broader presence across the week, we can shape something that reflects where the brand is now.

Partnership deck: ${DECK_BASE_URL}/deck/sandisk

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to have a proper conversation. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function bodyBrianPridgeon(): string {
  return `Hi Brian,

Building community around creators and getting go-to-market right for filmmakers and content professionals is genuinely hard to do well. The work you are doing at SanDisk sits at the intersection of product, culture, and community in a way that most hardware brands never get close to.

I am reaching out because we are building something at Cannes Lions 2026 that I think is directly relevant to that world.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets in. The villa is 30 minutes from the festival by car.

The room is the people SanDisk's creator strategy is built to reach: independent creators, agency creative directors, and brand marketing leaders. A partnership gives you access to that room in a format that actually creates relationships.

Partnership deck: ${DECK_BASE_URL}/deck/sandisk

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George is the right person to talk through what a partnership could look like. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const EMAIL_BODIES: Record<string, () => string> = {
  'Johanna': bodyJohannaMayerJones,
  'Gemma':   bodyGemmaFloyd,
  'Heidi':   bodyHeidiArkinstall,
  'Joel':    bodyJoelDavis,
  'Brian':   bodyBrianPridgeon,
};

const SUBJECTS: Record<string, string> = {
  'Johanna': 'Cannes 2026 - Power House partnership, The Washington Post',
  'Gemma':   'Cannes 2026 - Power House + The Washington Post',
  'Heidi':   'Cannes 2026 - Power House partnership, SanDisk',
  'Joel':    'Cannes 2026 - a conversation worth having, SanDisk',
  'Brian':   'Cannes 2026 - Power House x SanDisk',
};

async function main(): Promise<void> {
  console.log('\n📧  Power House — WaPo & SanDisk Email Outreach');
  console.log('━'.repeat(55));
  console.log(`Time: ${new Date().toLocaleString()}\n`);

  console.log('🔑 Getting Outlook token...');
  const token = await getToken();
  console.log('✅ Token ready\n');

  let sent = 0;
  let failed = 0;

  for (const contact of CONTACTS) {
    console.log(`\n[${CONTACTS.indexOf(contact) + 1}/${CONTACTS.length}] ${contact.firstName} ${contact.lastName}`);
    console.log(`     ${contact.title} — ${contact.company}`);

    // Find email via Hunter, fall back to pattern guess
    process.stdout.write('     Looking up email... ');
    let email = contact.emailFallback;
    try {
      const enriched = await enrichContactEmail(contact.firstName, contact.lastName, contact.domain);
      if (enriched?.email) {
        email = enriched.email;
        console.log(`${email} (Hunter: ${enriched.confidence}% confidence)`);
      } else {
        console.log(`not found — using fallback: ${email}`);
      }
    } catch {
      console.log(`Hunter error — using fallback: ${email}`);
    }

    const subject = SUBJECTS[contact.firstName];
    const body    = EMAIL_BODIES[contact.firstName]();

    process.stdout.write('     Sending email... ');
    try {
      await sendEmail(token, email, `${contact.firstName} ${contact.lastName}`, subject, body);
      console.log('✅ Sent');
      sent++;
    } catch (err: any) {
      console.log(`❌ Failed: ${err.response?.data?.error?.message || err.message}`);
      failed++;
    }

    if (CONTACTS.indexOf(contact) < CONTACTS.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log('\n' + '━'.repeat(55));
  console.log(`📊 Done. ${sent} sent, ${failed} failed.\n`);

  if (sent > 0) {
    console.log('Follow-up schedule:');
    console.log('  Washington Post — follow up ~Wed 8 Apr if no reply');
    console.log('  SanDisk         — follow up ~Wed 8 Apr if no reply');
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
