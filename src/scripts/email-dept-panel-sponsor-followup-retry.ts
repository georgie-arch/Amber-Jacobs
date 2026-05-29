/**
 * email-dept-panel-sponsor-followup-retry.ts
 *
 * Retry for 55 contacts that failed on the first run due to IncomingBytes limit.
 * Uses compressed JPEG flyer (330KB vs 1.4MB) + 2s delay between sends.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-dept-panel-sponsor-followup-retry.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const PANEL_LINK = 'Powerhouse.indvstryclvb.com/deptagency';
const CALENDLY   = 'https://calendly.com/itsvisionnaire/30min';
const FLYER_PATH = path.resolve('/Users/georgeguise/Downloads/our cannes activation flyers/1-compressed.jpg');

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

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function getFlyerBase64(): string {
  try {
    return fs.readFileSync(FLYER_PATH).toString('base64');
  } catch {
    console.warn('Could not load flyer at:', FLYER_PATH);
    return '';
  }
}

function buildHtml(firstName: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const p = (text: string) => `<p style="margin:0 0 14px 0;">${text}</p>`;

  const content = `
    ${p(`Hi ${firstName},`)}
    ${p(`I wanted to reach back out and share something we have been working on for Cannes Lions this year that I think you will want to know about.`)}
    ${p(`We have just launched an exclusive panel session in partnership with DEPT Agency, hosted inside their iconic Secret Garden on the Croisette:`)}
    ${p(`<strong>"The Algorithm Doesn't Know Your Culture: Building Trust in the Age of AI"</strong><br>
        Wednesday 24 June | 15:00 - 15:45<br>
        DEPT Secret Garden, 5 Rdpt Duboys d'Angers, Cannes`)}
    ${p(`The panel brings together leaders from Doosan Bobcat, Black Girl Digital, top creators and culture innovators for a conversation about how brands can build authentic trust in the age of AI. It is exactly the conversation the industry needs to be having right now and the room will be very senior.`)}
    ${p(`Spots are limited. You can apply and find out more here:<br>
        <a href="https://${PANEL_LINK}" style="color:#1a1a1a;font-weight:bold;">https://${PANEL_LINK}</a>`)}
    ${p(`Separately, if a partnership with Indvstry Power House this year is still something you are open to exploring, there is still a small window before Cannes to put something together. It would be great to get 15 minutes with our founder George before the festival.`)}
    ${p(`You can grab a time with him directly here:<br>
        <a href="${CALENDLY}" style="color:#1a1a1a;">${CALENDLY}</a>`)}
    ${p(`Hope to see you on the Croisette.`)}
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
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

interface Contact { firstName: string; name: string; email: string; }

const FAILED_CONTACTS: Contact[] = [
  { firstName: 'Sofia',     name: 'Sofia Hernandez',        email: 'sofia.hernandez@tiktok.com' },
  { firstName: 'Matt',      name: 'Matt Devitt',            email: 'matt.devitt@nielsen.com' },
  { firstName: 'Mike',      name: 'Mike Romoff',            email: 'mromoff@reddit.com' },
  { firstName: 'Ben',       name: 'Ben Skinazi',            email: 'bskinazi@equativ.com' },
  { firstName: 'Claire',    name: 'Claire Paull',           email: 'clairepaull@amazon.com' },
  { firstName: 'Diana',     name: 'Diana Littman',          email: 'diana.littman@adweek.com' },
  { firstName: 'Javier',    name: 'Javier Campopiano',      email: 'javier.campopiano@mccann.com' },
  { firstName: 'Anjali',    name: 'Anjali Sud',             email: 'asud@tubi.tv' },
  { firstName: 'Ceci',      name: 'Ceci Stallsmith',        email: 'ceci@lovable.dev' },
  { firstName: 'Elena',     name: 'Elena Verna',            email: 'elena@lovable.dev' },
  { firstName: 'Theo',      name: 'Theo Daniellot',         email: 'theo@lovable.dev' },
  { firstName: 'Vladimir',  name: 'Vladimir Karyshev',      email: 'vkaryshev@higgsfield.ai' },
  { firstName: 'Jasmyn',    name: 'Jasmyn Jarnigan',        email: 'jjarnigan@higgsfield.ai' },
  { firstName: 'Kevin',     name: 'Kevin Kim',              email: 'kkim@higgsfield.ai' },
  { firstName: 'Justin',    name: 'Justin Chacona',         email: 'justin.chacona@epidemicsound.com' },
  { firstName: 'Bertrand',  name: 'Bertrand Etienne',       email: 'bertrand.etienne@epidemicsound.com' },
  { firstName: 'Sara',      name: 'Sara Borsvik',           email: 'sara.borsvik@epidemicsound.com' },
  { firstName: 'Chang',     name: 'Chang Chen',             email: 'chang@otter.ai' },
  { firstName: 'Marie',     name: 'Marie Abesiamis',        email: 'marie@otter.ai' },
  { firstName: 'Kenny',     name: 'Kenny Scannell',         email: 'kenny@otter.ai' },
  { firstName: 'Sophie',    name: 'Sophie McElligott',      email: 'sophie.mcelligott@dazedmedia.com' },
  { firstName: 'Dan',       name: 'Dan Fitzgerald',         email: 'dan.fitzgerald@dazedmedia.com' },
  { firstName: 'Lucy',      name: 'Lucy Warwick',           email: 'lucy.warwick@dazedmedia.com' },
  { firstName: 'Merrilee',  name: 'Merrilee Kick',          email: 'merrilee.kick@buzzballz.com' },
  { firstName: 'Tracy',     name: 'Tracy Frisbie',          email: 'tracy.frisbie@buzzballz.com' },
  { firstName: 'Yashika',   name: 'Yashika Maru',           email: 'yashika.maru@buzzballz.com' },
  { firstName: 'Gary',      name: 'Gary Briggs',            email: 'gary.briggs@openai.com' },
  { firstName: 'Elke',      name: 'Elke Karstens',          email: 'elke.karstens@openai.com' },
  { firstName: 'Michael',   name: 'Michael Tabtabai',       email: 'michael.tabtabai@openai.com' },
  { firstName: 'Jason',     name: 'Jason Day',              email: 'jason.day@lumalabs.ai' },
  { firstName: 'Caroline',  name: 'Caroline Ingeborn',      email: 'caroline.ingeborn@lumalabs.ai' },
  { firstName: 'Verena',    name: 'Verena Puhm',            email: 'verena.puhm@lumalabs.ai' },
  { firstName: 'Victor',    name: 'Victor Pontis',          email: 'victor@lu.ma' },
  { firstName: 'Dan',       name: 'Dan Liu',                email: 'dan@lu.ma' },
  { firstName: 'there',     name: 'Lu.ma Partnerships',     email: 'partnerships@lu.ma' },
  { firstName: 'Kyle',      name: 'Kyle Coleman',           email: 'KColeman@clickup.com' },
  { firstName: 'Jeff',      name: 'Jeff de Ruyter',         email: 'JdeRuyter@clickup.com' },
  { firstName: 'Gaurav',    name: 'Gaurav Agarwal',         email: 'GAgarwal@clickup.com' },
  { firstName: 'Anna',      name: 'Anna Crowe',             email: 'anna.crowe@crowepr.com' },
  { firstName: 'Natalia',   name: 'Natalia Barclay',        email: 'natalia.barclay@crowepr.com' },
  { firstName: 'Alex',      name: 'Alex Meyers',            email: 'alex.meyers@crowepr.com' },
  { firstName: 'Adam',      name: 'Adam Korsunsky',         email: 'adam@freebean.co' },
  { firstName: 'Brett',     name: 'Brett Korsunsky',        email: 'brett@freebean.co' },
  { firstName: 'Jett',      name: 'Jett Zimmerman',         email: 'jett@freebean.co' },
  { firstName: 'Jon',       name: 'Jon Stona',              email: 'jon.stona@airwallex.com' },
  { firstName: 'James',     name: 'James Elias',            email: 'james.elias@airwallex.com' },
  { firstName: 'Ravi',      name: 'Ravi Adusumilli',        email: 'ravi.adusumilli@airwallex.com' },
  { firstName: 'Saket',     name: 'Saket Mehta',            email: 'saket.mehta@gonift.com' },
  { firstName: 'Kathryn',   name: 'Kathryn Maguire',        email: 'kathryn.maguire@gonift.com' },
  { firstName: 'Rob',       name: 'Rob Lynch',              email: 'rob.lynch@gonift.com' },
  { firstName: 'Dustin',    name: 'Dustin Blank',           email: 'dustin.blank@elevenlabs.io' },
  { firstName: 'Luke',      name: 'Luke Harries',           email: 'luke.harries@elevenlabs.io' },
  { firstName: 'Nicolo',    name: 'Nicolo Rossi',           email: 'nicolo.rossi@elevenlabs.io' },
  { firstName: 'Jeremy',    name: 'Jeremy Sirota',          email: 'jeremy.sirota@suno.com' },
  { firstName: 'Rebecca',   name: 'Rebecca Thompson',       email: 'rebecca.thompson@qatarairways.com.qa' },
];

async function main(): Promise<void> {
  const flyerB64 = getFlyerBase64();
  const logoB64  = getLogoBase64();
  const subject  = 'INDVSTRY Power House x DEPT Agency — Cannes Lions, June 24';

  console.log(`\nRetrying ${FAILED_CONTACTS.length} failed contacts (compressed flyer, 2s delay)...\n`);
  console.log('Fetching auth token...');
  const token = await getToken();
  console.log('Auth OK. Sending...\n');

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < FAILED_CONTACTS.length; i++) {
    const c = FAILED_CONTACTS[i];

    const message: any = {
      subject,
      body: { contentType: 'HTML', content: buildHtml(c.firstName) },
      toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
      from: { emailAddress: { address: process.env.EMAIL_USER || 'amber@indvstryclvb.com', name: 'Amber Jacobs' } },
      attachments: [] as any[],
    };

    if (logoB64) {
      message.attachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name:          'indvstry-logo.png',
        contentType:   'image/png',
        contentBytes:  logoB64,
        contentId:     'indvstry-logo',
        isInline:      true,
      });
    }

    if (flyerB64) {
      message.attachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name:          'INDVSTRY-PowerHouse-DEPT-Panel-Cannes-2026.jpg',
        contentType:   'image/jpeg',
        contentBytes:  flyerB64,
        isInline:      false,
      });
    }

    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      sent++;
      console.log(`  [${i + 1}/${FAILED_CONTACTS.length}] Sent   -> ${c.name} <${c.email}>`);
    } catch (err: any) {
      failed++;
      const msg = err?.response?.data?.error?.message || err.message || String(err);
      console.error(`  [${i + 1}/${FAILED_CONTACTS.length}] FAILED -> ${c.name} <${c.email}> — ${msg}`);
    }

    if (i < FAILED_CONTACTS.length - 1) await new Promise(res => setTimeout(res, 2000));
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed out of ${FAILED_CONTACTS.length}.`);
}

main().catch(err => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
