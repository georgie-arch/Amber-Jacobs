/**
 * email-cannes-rsvp-requests.ts
 *
 * Direct outreach to event organisers at key Cannes Lions 2026 activations,
 * requesting guest list access for George and core team of 5:
 *   1. George Guise       — Founder, Indvstry Clvb
 *   2. Dinalva Tavares    — Brand Partnerships and Events Manager
 *   3. Silva Stone        — Studio Owner, White Hut Studios
 *   4. Abi Blend          — New Business Manager, Cr8 Focus
 *   5. Femi Sani          — Creative Director, Indvstry Clvb
 *
 * FROM: George Guise <access@indvstryclvb.com>
 *
 * NOTE — Form-based events (no direct email):
 *   Amazon Port      → https://amaison-adsevents.com/register
 *   HarbourView      → https://cvent.me/9vPWKy
 *
 * NOTE — No confirmed contact found:
 *   Netflix          → no 2026 event contact publicly listed
 *   PwC Beach        → no named contact found; try pwc.com/cannes
 *   YouTube/Google   → no named contact found for 2026
 *
 * Run:       npx ts-node --project tsconfig.json src/scripts/email-cannes-rsvp-requests.ts
 * Single:    SEND_ONLY=cognitiv npx ts-node --project tsconfig.json src/scripts/email-cannes-rsvp-requests.ts
 * Type-check: npx tsc --noEmit
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const TEAM_LIST = `
1. George Guise — Founder, Indvstry Clvb
2. Dinalva Tavares — Brand Partnerships and Events Manager
3. Silva Stone — Studio Owner, White Hut Studios
4. Abi Blend — New Business Manager, Cr8 Focus
5. Femi Sani — Creative Director`;

// ─── AUTH ────────────────────────────────────────────────────────────────────

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
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 4px 0;"><a href="http://powerhouse.indvstryclvb.com" style="color:#1a1a1a;">powerhouse.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
  </div>
</body></html>`;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface EventContact {
  label:   string;
  to:      string;
  toName:  string;
  subject: string;
  body:    string;
}

// ─── EMAIL BODIES ─────────────────────────────────────────────────────────────

const contacts: EventContact[] = [

  // 1. SPORT BEACH / STAGWELL
  {
    label:   'Sport Beach / Stagwell',
    to:      'SportBeach@stagwellglobal.com',
    toName:  'Sport Beach Team',
    subject: 'Guest list request: Indvstry Power House — Sport Beach, Cannes 2026',
    body: `Hi,

My name is George Guise, Founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this year, a private villa residency hosting ten of the most senior creative and marketing professionals at the festival.

Sport Beach is one of the best activations at Cannes and I wanted to reach out directly to ask whether we could get our core team of five on the guest list for the week.

The team:
${TEAM_LIST}

Please let me know if you need anything further from us. We would love to be in the room.

George Guise`,
  },

  // 2. SPOTIFY — routed to hospitality/general (Keyana already emailed twice today for sponsorship)
  {
    label:   'Spotify Cannes Concert',
    to:      'spotifycannes@spotify.com',
    toName:  'Spotify Cannes Team',
    subject: 'Guest list request: Indvstry Power House — Spotify Beach, Cannes 2026',
    body: `Hi,

My name is George Guise, Founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private villa residency for ten of the most senior creative and marketing professionals at the festival.

The Spotify Beach and concert are highlights of the week and I am reaching out directly to ask if we can get our core team of five on the guest list.

The team:
${TEAM_LIST}

Happy to share more about Indvstry Clvb if it would be helpful. Thank you for considering us.

George Guise`,
  },

  // 3. WSJ JOURNAL HOUSE
  {
    label:   'WSJ Journal House',
    to:      'RSVP@wsj.com',
    toName:  'WSJ Journal House',
    subject: 'Guest list request: Indvstry Power House — Journal House, Cannes 2026',
    body: `Hi,

My name is George Guise, Founder of Indvstry Clvb. Several of our Indvstry Power House residents are already registered for Journal House this year, which we are very much looking forward to.

I wanted to reach out directly to request access for our core team of five for the week, including one additional guest not yet registered.

The team:
${TEAM_LIST}

Please let me know if you need anything from us to confirm their access.

George Guise`,
  },

  // 4. VAYNER MEDIA / CHEZ VAYNER
  {
    label:   'VaynerMedia / Chez Vayner',
    to:      'events@vaynerx.com',
    toName:  'VaynerX Events',
    subject: 'Guest list request: Indvstry Power House — Chez Vayner, Cannes 2026',
    body: `Hi,

My name is George Guise, Founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private villa residency for ten senior creative and marketing professionals attending the festival.

Chez Vayner is one of the most talked-about activations at Cannes every year and we would love to bring our core team along. I am reaching out to ask if we can get five guests on the list.

The team:
${TEAM_LIST}

Happy to share more about who we are if it helps. Thank you.

George Guise`,
  },

  // 5. COGNITIV YACHT — O'LION
  {
    label:   "Cognitiv Yacht O'Lion",
    to:      'jmelancon@cognitiv.ai',
    toName:  'J. Melancon',
    subject: "Guest list request: Indvstry Power House — Cognitiv O'Lion, Cannes 2026",
    body: `Hi,

My name is George Guise, Founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private villa residency bringing together ten senior creative and marketing professionals for the week.

I wanted to reach out directly about the O'Lion yacht activation. The calibre of conversation you host aboard is exactly the kind of thing our team would add to and benefit from. We would love to get five of our core team on the guest list.

The team:
${TEAM_LIST}

Please let me know if you need anything from us.

George Guise`,
  },

  // 6. NIELSEN CANNES
  {
    label:   'Nielsen Cannes',
    to:      'events@nielsen.com',
    toName:  'Nielsen Events',
    subject: 'Guest list request: Indvstry Power House — Nielsen at Cannes Lions 2026',
    body: `Hi,

My name is George Guise, Founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private villa residency hosting ten of the most senior creative and marketing professionals at the festival.

The Nielsen activation is one we would love to bring our core team to. I am reaching out to ask whether we could get five guests on the list for the week.

The team:
${TEAM_LIST}

Happy to share more about Indvstry Clvb or what we are building at Cannes if useful.

George Guise`,
  },

  // 7. BRAND INNOVATORS
  {
    label:   'Brand Innovators',
    to:      'marc@brand-innovators.com',
    toName:  'Marc Sternberg',
    subject: 'Guest list request: Indvstry Power House — Brand Innovators Summit, Cannes 2026',
    body: `Hi Marc,

My name is George Guise, Founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private villa residency hosting ten of the most senior creative and marketing professionals attending the festival.

The Brand Innovators summit is one of the highlights of the week and I wanted to reach out directly to ask if we could get our core team of five on the list for the June dates.

The team:
${TEAM_LIST}

Happy to jump on a quick call if easier. Thank you for considering us.

George Guise`,
  },

];

// ─── SEND ─────────────────────────────────────────────────────────────────────

async function main() {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();

  const toSend = sendOnly
    ? contacts.filter(c => c.label.toLowerCase().includes(sendOnly))
    : contacts;

  console.log(`Sending RSVP requests to ${toSend.length} event contacts from access@indvstryclvb.com...`);
  console.log();

  // Remind about form-based events
  if (!sendOnly) {
    console.log('  NOTE — complete these manually via registration form:');
    console.log('    Amazon Port    -> https://amaison-adsevents.com/register');
    console.log('    HarbourView    -> https://cvent.me/9vPWKy');
    console.log();
    console.log('  NOTE — no public contact found, follow up manually:');
    console.log('    Netflix        -> no 2026 event contact listed');
    console.log('    PwC Beach      -> try pwc.com/cannes for contact');
    console.log('    YouTube/Google -> no named contact found for 2026');
    console.log();
  }

  let sent   = 0;
  let failed = 0;

  for (const c of toSend) {
    const message: any = {
      subject: c.subject,
      body:    { contentType: 'HTML', content: buildHtml(c.body) },
      toRecipients: [{ emailAddress: { address: c.to, name: c.toName } }],
      from: {
        emailAddress: {
          address: process.env.EMAIL_USER || 'access@indvstryclvb.com',
          name:    'George Guise',
        },
      },
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
      console.log(`  Sent    -> [${c.label}] <${c.to}>`);
      sent++;
    } catch (err: any) {
      console.error(`  FAILED  -> [${c.label}] <${c.to}>`, err?.response?.data || err.message);
      failed++;
    }

    await new Promise(res => setTimeout(res, 800));
  }

  console.log();
  console.log(`Done. ${sent}/${toSend.length} sent. Failed: ${failed}.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
