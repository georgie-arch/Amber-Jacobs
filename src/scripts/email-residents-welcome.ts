/**
 * Welcome emails to all IPH residents from Amber
 * Covers: event registrations, BlackAt verification, timeline, brand partnership ask
 * Gmail users (Romy, Olga, Kelly) get an indvstryclvb.com email workaround note
 * Anthony Okoro gets a delegate-pass-only version (not a villa resident)
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

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
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  body: string
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
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

function buildVillaBody(
  firstName: string,
  events: string[],
  isGmailUser: boolean
): string {
  const eventListText = events.map(e => `- ${e}`).join('\n');

  const gmailNote = isGmailUser ? `
ONE QUICK NOTE ON YOUR EMAIL

A number of the Cannes events we are registering people for require a professional or company email address. Because you are registered with a Gmail address, we may hit some restrictions on certain platforms. We are looking at setting you up with an @indvstryclvb.com email address that we can use for registrations on your behalf. If that would be helpful, just say the word and we will get that sorted for you right away.
` : '';

  return `Hi ${firstName},

I am Amber, community manager at Indvstry Clvb. I am reaching out on behalf of George and the whole team to formally welcome you to Indvstry Power House. We are genuinely so excited to have you with us in Cannes this June and we cannot wait to see what this week becomes together.

George is putting together something really special and you are a big part of why. Seven curated residents, one luxury villa just outside Cannes, a private pool, and a full week of events, dinners and the kind of conversations that actually make a difference. Villa residency runs from 21 to 26 June 2026 alongside Cannes Lions.
${gmailNote}
EVENT REGISTRATIONS

We have been getting you registered for a strong programme of events across Lions week. Here is where things stand so far:

${eventListText}

We will keep working through more events as they open up and will send updates as we lock in more. A handful of registrations are still pending confirmation from organizers, so a few more should come through over the next few weeks.

BLACKAT

We have also registered you on BlackAt (blkat.org), a professional network for Black creatives and executives across the industry. You should have received a verification email from them. Please check your inbox (and your spam folder just in case) and click the verification link to complete your registration. Once you are in, it is a great way to stay across any BlackAt-hosted events and activations during Cannes week.

WHAT IS COMING NEXT

- First week of May: Your Cannes Lions delegate pass details will come through
- Mid-May: Introductions to your fellow residents so you can get to know each other before the villa
- End of May: Full villa address, arrival details and everything you need for the week

BRAND PARTNERSHIPS

George and the team are still actively building brand partnerships and sponsorships for the villa. If you have any existing brand relationships that could be a good fit, or any companies you think would love to be involved, please do flag them. We are very open to making introductions and building those conversations together.

Any questions at all, just reply here or drop me a message directly. We are so looking forward to having you there.`;
}

function buildAnthonyBody(events: string[]): string {
  const eventListText = events.map(e => `- ${e}`).join('\n');

  return `Hi Anthony,

I am Amber, community manager at Indvstry Clvb. George asked me to reach out and formally welcome you to the Indvstry Power House experience at Cannes Lions this June.

We have lined you up with a Cannes Lions delegate pass and have been working on getting you registered for a strong programme of events across the week. Here is where things stand so far:

${eventListText}

We will keep adding to this as more events open up and will send you updates as we go.

BLACKAT

We have also registered you on BlackAt (blkat.org), a professional network for Black creatives and executives in the industry. You should have received a verification email from them. Please check your inbox (and your spam folder just in case) and click the verification link to complete your registration. It is a great way to stay across BlackAt-hosted events and activations during Cannes week.

WHAT IS COMING NEXT

- First week of May: Your Cannes Lions delegate pass details will come through
- Closer to the week: Any additional event confirmations and logistics

If there is anything specific you are hoping to get out of the week, or anyone you would love to be introduced to ahead of time, just let me know and I will do what I can.

Looking forward to seeing you in Cannes.`;
}

// ─── RESIDENT DATA ────────────────────────────────────────────────────────────

const COMMON_EVENTS = [
  'FQ Beach @ Cannes Lions 2026',
  'Adweek House @ Cannes 2026',
  'DEPT Agency @ Cannes Lions 2026',
  'The Cannes Social 2026 (ExchangeWire)',
  'AI & Tech Sandbox @ Cannes Lions 2026',
  'Pinterest Manifestival @ Cannes Lions 2026',
  'ADWEEK House',
  'Brands & Culture Villa',
  'Cannes Lions Creators Beach',
  'Digiday @ Cannes',
  'Maison New Digital Age',
  'The LWS Salon',
  'Cannes Brand Leaders Dinner',
  'Cannes Marketing Leaders Brunch',
  'Cannes Panel & Cocktail Reception (Digiday)',
  'Le Club MSQ',
  'Cocktail Hour in Cannes',
  'WIN Lounge',
  'Sport Beach',
];

// FT Cannes succeeded for all villa residents except LaToya
const WITH_FT = ['Financial Times Cannes 2026', ...COMMON_EVENTS];

interface ResidentEmail {
  firstName: string;
  email: string;
  events: string[];
  isGmail: boolean;
  isVilla: boolean;
}

const RESIDENTS_TO_EMAIL: ResidentEmail[] = [
  {
    firstName: 'Dinalva',
    email: 'contact@missdinalva.com',
    events: WITH_FT,
    isGmail: false,
    isVilla: true,
  },
  {
    firstName: 'Abi',
    email: 'Abi@cr8focus.com',
    events: WITH_FT,
    isGmail: false,
    isVilla: true,
  },
  {
    firstName: 'LaToya',
    email: 'latoya.shambo@blackgirldigital.com',
    events: COMMON_EVENTS,
    isGmail: false,
    isVilla: true,
  },
  {
    firstName: 'Romy',
    email: 'romydegama@gmail.com',
    events: WITH_FT,
    isGmail: true,
    isVilla: true,
  },
  {
    firstName: 'Chanelle',
    email: 'hello@chanstudio.co',
    events: WITH_FT,
    isGmail: false,
    isVilla: true,
  },
  {
    firstName: 'Olga',
    email: 'olga.viktrv@gmail.com',
    events: WITH_FT,
    isGmail: true,
    isVilla: true,
  },
  {
    firstName: 'Kelly',
    email: 'adacollective300@gmail.com',
    events: WITH_FT,
    isGmail: true,
    isVilla: true,
  },
  {
    firstName: 'Silva',
    email: 'Me@silvastonemusic.com',
    events: WITH_FT,
    isGmail: false,
    isVilla: true,
  },
  {
    firstName: 'Anthony',
    email: 'aokoro@ebay.com',
    events: COMMON_EVENTS,
    isGmail: false,
    isVilla: false,
  },
];

async function main() {
  console.log('Sending welcome emails to IPH residents...\n');
  const token = await getToken();

  for (const r of RESIDENTS_TO_EMAIL) {
    const subject = r.isVilla
      ? `Welcome to Indvstry Power House, ${r.firstName}`
      : `Indvstry Power House, Cannes Lions 2026 -- Welcome, ${r.firstName}`;

    const body = r.isVilla
      ? buildVillaBody(r.firstName, r.events, r.isGmail)
      : buildAnthonyBody(r.events);

    await sendEmail(token, r.email, r.firstName, subject, body);
    console.log(`Sent to ${r.firstName} <${r.email}>`);
    await new Promise(res => setTimeout(res, 1500));
  }

  console.log('\nAll 9 welcome emails sent.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
