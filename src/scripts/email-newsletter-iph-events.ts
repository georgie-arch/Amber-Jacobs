/**
 * email-newsletter-iph-events.ts
 *
 * Email blast to all Power House newsletter subscribers.
 * Tells them about the events lineup, invites them to attend open events,
 * and nudges the 2 remaining room spots.
 *
 * SOURCE:    /Users/georgeguise/Downloads/newsletter_emails-export-2026-05-26_15-18-30.csv
 * EXCLUDES:  Confirmed residents | invalid email addresses
 * FROM:      Amber Jacobs <amber@indvstryclvb.com>
 *
 * Dry run:  DRY_RUN=true npx ts-node --project tsconfig.json src/scripts/email-newsletter-iph-events.ts
 * Run:      npx ts-node --project tsconfig.json src/scripts/email-newsletter-iph-events.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const BOOKING_LINK  = 'https://lu.ma/t4ek2yn7';
const PANEL_LINK    = 'https://Powerhouse.indvstryclvb.com/deptagency';
const DIASPORA_LINK = 'https://lu.ma/5vmr7s6f';
const CALENDLY      = 'https://calendly.com/itsvisionnaire/30min';
const CSV_PATH      = '/Users/georgeguise/Downloads/newsletter_emails-export-2026-05-26_15-18-30.csv';

// Residents to exclude (lowercase)
const RESIDENT_EMAILS = new Set([
  'george@soabparty.com',
  'contact@missdinalva.com',
  'aokoro@ebay.com',
  'kelly@indvstryclvb.com',
  'latoya.shambo@blackgirldigital.com',
  'info@framrlab.com',
  'hello@chanstudio.co',
  'romy@indvstryclvb.com',
  'me@silvastonemusic.com',
  'abi@cr8focus.com',
]);

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

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function isValidEmail(email: string): boolean {
  const domain = email.split('@')[1] || '';
  if (!domain.includes('.')) return false;                  // no TLD
  if (email.endsWith('.con')) return false;                  // .con typo
  if (domain === 'outlool.com') return false;                // outlool typo
  if (domain === 'sportbeach') return false;                 // no TLD
  return true;
}

// ─── CSV PARSER ───────────────────────────────────────────────────────────────

function loadEmails(): string[] {
  const raw  = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split('\n').slice(1); // skip header
  const seen  = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const parts = line.split(';');
    if (parts.length < 2) continue;
    const email = parts[1].trim().toLowerCase();
    if (!email) continue;
    if (!isValidEmail(email)) continue;
    if (RESIDENT_EMAILS.has(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }

  return result;
}

// ─── HTML ─────────────────────────────────────────────────────────────────────

function buildHtml(): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const p  = (text: string) => `<p style="margin:0 0 14px 0;">${text}</p>`;
  const h2 = (text: string) => `<p style="margin:24px 0 8px 0;font-size:15px;font-weight:bold;color:#1a1a1a;">${text}</p>`;
  const li = (text: string) => `<li style="margin-bottom:8px;">${text}</li>`;

  const content = `
    ${p('Hi,')}
    ${p(`You signed up for updates on <strong>Indvstry Power House</strong> at Cannes Lions 2026 — so here is where things stand with four weeks to go.`)}
    ${p(`The house is almost full. We have <strong>2 rooms remaining</strong> for the full villa residency (21-26 June), and the programme around those five days has come together better than we hoped.`)}

    ${h2('What is included in a residency')}
    ${p(`The villa is a curated, private space for a group of creative directors, founders, CMOs and brand leaders during the most important week of the year in the creative industry. Everything below is part of what residents get access to:`)}
    <ul style="margin:0 0 14px 0;padding-left:20px;">
      ${li('<strong>Private luxury villa</strong> — your base for the week, 21-26 June, Cannes')}
      ${li('<strong>WSJ Journal House</strong> — exclusive access to the Wall Street Journal flagship Cannes activation')}
      ${li('<strong>Ad Age Cannes 2026</strong> — full access to Ad Age programme at the festival')}
      ${li('<strong>AI and Technology Sandbox</strong> — PMG x Google activation, one of the most sought-after invites of the week')}
      ${li('<strong>Canva Creative Cabana</strong> — full creative industry access')}
      ${li('<strong>XP Land Cannes</strong> — curated experience leadership events')}
      ${li('<strong>Later Lounge Cannes</strong> — 22-24 June, exclusive social brand programme')}
      ${li('<strong>Tennis on the Riviera</strong> — hosted by Rennae Stubbs, mornings 22-23 June, Montfleury')}
    </ul>

    ${h2('Open events — anyone can join')}
    ${p(`Two events are open to all. You do not need a room to attend these:`)}

    ${p(`<strong>INDVSTRY Power House x DEPT Agency Panel</strong><br>
        "The Algorithm Doesn't Know Your Culture: Building Trust in the Age of AI"<br>
        Wednesday 24 June | 15:00 - 15:45<br>
        DEPT Secret Garden, 5 Rdpt Duboys d'Angers, Cannes<br>
        <a href="${PANEL_LINK}" style="color:#1a1a1a;">Apply to attend here</a>`)}

    ${p(`<strong>Diaspora Dinner</strong><br>
        Tuesday 23 June | 18:00 - 21:00<br>
        Epi Beach, Cannes (seafront)<br>
        A curated private beach dinner for senior creative and cultural leaders<br>
        <a href="${DIASPORA_LINK}" style="color:#1a1a1a;">RSVP here</a>`)}

    ${h2('2 rooms left')}
    ${p(`If you want the full residency experience — the villa, the full events access and five days on the Croisette with this group — there are only 2 spots remaining. Rooms are <strong>£1,500 to £2,500</strong> for the week.`)}
    ${p(`Book here: <a href="${BOOKING_LINK}" style="color:#1a1a1a;font-weight:bold;">${BOOKING_LINK}</a>`)}
    ${p(`Or if you want to talk it through first, grab 15 minutes with George here:<br>
        <a href="${CALENDLY}" style="color:#1a1a1a;">${CALENDLY}</a>`)}
    ${p(`Hope to see you there.`)}
  `;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${content}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">You are receiving this because you signed up for updates on Indvstry Power House at Powerhouse.indvstryclvb.com. If you no longer wish to receive emails, please reply to unsubscribe.</p>
  </div>
</body></html>`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const dryRun = process.env.DRY_RUN === 'true';
  const emails = loadEmails();

  console.log(`\nIPH newsletter — events update`);
  console.log(`Recipients: ${emails.length}`);

  if (dryRun) {
    console.log('\nDRY RUN — first 10 recipients:\n');
    emails.slice(0, 10).forEach((e, i) => console.log(`  [${i + 1}] ${e}`));
    console.log(`  ... and ${emails.length - 10} more`);
    console.log(`\nTotal: ${emails.length}`);
    return;
  }

  const logoB64 = getLogoBase64();
  const html    = buildHtml(); // same HTML for all (no personalisation — no names in CSV)
  const subject = 'What\'s on at INDVSTRY Power House, Cannes Lions 2026 — 2 rooms left';

  console.log('\nFetching auth token...');
  const token = await getToken();
  console.log('Auth OK. Sending...\n');

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    const message: any = {
      subject,
      body: { contentType: 'HTML', content: html },
      toRecipients: [{ emailAddress: { address: email } }],
      from: { emailAddress: { address: process.env.EMAIL_USER || 'amber@indvstryclvb.com', name: 'Amber Jacobs' } },
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
      sent++;
      console.log(`  [${i + 1}/${emails.length}] Sent   -> ${email}`);
    } catch (err: any) {
      failed++;
      const msg = err?.response?.data?.error?.message || err.message || String(err);
      console.error(`  [${i + 1}/${emails.length}] FAILED -> ${email} — ${msg}`);
    }

    if (i < emails.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed out of ${emails.length}.`);
}

main().catch(err => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
