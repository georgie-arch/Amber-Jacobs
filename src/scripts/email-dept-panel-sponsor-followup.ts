/**
 * email-dept-panel-sponsor-followup.ts
 *
 * Follow-up to all IPH sponsorship + partnership leads.
 * Announces the INDVSTRY Power House x DEPT Agency panel at Cannes Lions 2026.
 * Invites them to attend + keeps the partnership door open.
 *
 * Panel: "The Algorithm Doesn't Know Your Culture: Building Trust in the Age of AI"
 * Date:  Wednesday 24 June 2026, 15:00-15:45
 * Venue: DEPT Secret Garden, 5 Rdpt Duboys d'Angers, Cannes
 * Link:  Powerhouse.indvstryclvb.com/deptagency
 *
 * EXCLUDED: @deptagency.com | @canneslions.com
 * FROM:     Amber Jacobs <amber@indvstryclvb.com>
 *
 * Dry run:  DRY_RUN=true npx ts-node --project tsconfig.json src/scripts/email-dept-panel-sponsor-followup.ts
 * Run:      npx ts-node --project tsconfig.json src/scripts/email-dept-panel-sponsor-followup.ts
 * Single:   SEND_ONLY=email@example.com npx ts-node --project tsconfig.json src/scripts/email-dept-panel-sponsor-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PANEL_LINK   = 'Powerhouse.indvstryclvb.com/deptagency';
const CALENDLY     = 'https://calendly.com/itsvisionnaire/30min';
const FLYER_PATH   = path.resolve('/Users/georgeguise/Downloads/our cannes activation flyers/1.png');

// Domains to never send to
const EXCLUDED_DOMAINS = ['deptagency.com', 'canneslions.com'];

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

// ─── HTML ─────────────────────────────────────────────────────────────────────

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

  const p = (text: string) =>
    `<p style="margin:0 0 14px 0;">${text}</p>`;

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

// ─── CONTACTS ─────────────────────────────────────────────────────────────────

interface Contact {
  firstName: string;
  name:      string;
  email:     string;
}

// All IPH sponsorship + partnership leads. Deduplicated by email below.
const RAW_CONTACTS: Contact[] = [

  // ── Batch 1 / sponsor-followup-friday ──────────────────────────────────────
  { firstName: 'Jason',     name: 'Jason Melissos',     email: 'Jason_melissos@diesel.com' },
  { firstName: 'Amy',       name: 'Amy Hawkins',         email: 'Amy.hawkins@ogilvy.com' },
  { firstName: 'Oyin',      name: 'Oyin Akiniyi',        email: 'Oyin.akiniyi@pernod-ricard.com' },
  { firstName: 'Bethany',   name: 'Bethany Walker',      email: 'Bethany.walker@pernod-ricard.com' },
  { firstName: 'Liam',      name: 'Liam Holyoak-Rackal', email: 'Liam.holyoak-rackal@pernod-ricard.com' },
  { firstName: 'Jordan',    name: 'Jordan',              email: 'Jordan@thepom.co' },
  { firstName: 'Pippa',     name: 'Pippa',               email: 'Pippa@thepom.co' },
  { firstName: 'Frank',     name: 'Frank',               email: 'Frank@ucherum.com' },
  { firstName: 'Calum',     name: 'Calum Hudson',        email: 'Chudson@eventbrite.com' },
  { firstName: 'Matt',      name: 'Matt Tuffuor',        email: 'Matt.tuffuor@eventbrite.com' },
  { firstName: 'Michael',   name: 'Michael',             email: 'Michael@dayslikethisbrunch.co.uk' },
  { firstName: 'Ellie',     name: 'Ellie Heatrick',      email: 'Ellie.heatrick@whatsapp.com' },
  { firstName: 'Lucy',      name: 'Lucy Street',         email: 'Lstreet@adobe.com' },
  { firstName: 'Katy',      name: 'Katy Frost',          email: 'Katy_frost@cotyinc.com' },
  { firstName: 'Leoni',     name: 'Leoni',               email: 'Leoni@weshft.co' },
  { firstName: 'Kevin',     name: 'Kevin Gomez',         email: 'kevin.gomez@theroofgardens.com' },
  { firstName: 'Ben',       name: 'Ben Marett',          email: 'Ben.marett@auvodka.co.uk' },
  { firstName: 'Max',       name: 'Max Merttens',        email: 'Max.merttens@nandos.co.uk' },
  { firstName: 'Tally',     name: 'Tally Sapp',          email: 'Talisap@nandos.co.uk' },
  { firstName: 'Lucia',     name: 'Lucia Des',           email: 'Lucia.des@sohohouse.com' },
  { firstName: 'Gina',      name: 'Gina Powell',         email: 'Gina.powell@gymshark.com' },
  { firstName: 'Carl',      name: 'Carl Young',          email: 'Carl.young@vevo.com' },
  { firstName: 'Yomi',      name: 'Yomi Ogunsola',       email: 'Yomi.ogunsola@vevo.com' },
  { firstName: 'Troy',      name: 'Troy Antunes',        email: 'Troy.antunes@yourichrecords.com' },
  { firstName: 'Rosie',     name: 'Rosie Karaca',        email: 'Rosie.karaca@b-theagency.com' },
  { firstName: 'Harry',     name: 'Harry',               email: 'Harry@wearemirchi.com' },
  { firstName: 'Mubi',      name: 'Mubi Ali',            email: 'Mubi.ali@reebok.com' },
  { firstName: 'Munashe',   name: 'Munashe Ashlyn',      email: 'Munashe.ashlyn@highsnobiety.com' },
  { firstName: 'Aneta',     name: 'Aneta',               email: 'Aneta@labrumlondon.com' },
  { firstName: 'Dominique', name: 'Dominique Gardiner',  email: 'Dominique.gardiner@superdry.com' },
  { firstName: 'Danielle',  name: 'Danielle Anastasiou', email: 'Danielle.anastasiou@superdry.com' },
  { firstName: 'Katie',     name: 'Katie Pollard',       email: 'Katie.pollard@superdry.com' },
  { firstName: 'Damian',    name: 'Damian Malontie',     email: 'Damian.malontie@converse.com' },
  { firstName: 'Diruja',    name: 'Diruja Sabesan',      email: 'Dirujan.sabesan@lemon-pepper.co.uk' },
  { firstName: 'Caroline',  name: 'Caroline Gautier',    email: 'Caroline@carolinegautier.com' },
  { firstName: 'Vanessa',   name: 'Vanessa',             email: 'Vanessa@sanecommunications.com' },
  { firstName: 'Chloe',     name: 'Chloe',               email: 'Chloe@sanecommunications.com' },
  { firstName: 'Danielle',  name: 'Danielle',            email: 'Danielle@sanecommunications.com' },
  { firstName: 'Lauren',    name: 'Lauren S',            email: 'Laurens@taste-pr.com' },
  { firstName: 'Caitlin',   name: 'Caitlin W',           email: 'Caitlinw@taste-pr.com' },
  { firstName: 'Becca',     name: 'Becca Fergus',        email: 'Becca.fergus@mslgroup.com' },
  { firstName: 'Nia',       name: 'Nia Feisal',          email: 'Nia.feisal@mslgroup.com' },
  { firstName: 'Hayley',    name: 'Hayley Ticehurst',    email: 'Hayley.ticehurst@mslgroup.com' },
  { firstName: 'Jon',       name: 'Jon',                 email: 'Jon@thelighthouse.com' },
  { firstName: 'Ally',      name: 'Ally',                email: 'Ally@brixtonfinishingschool.org' },
  { firstName: 'Amy',       name: 'Amy Tyrer',           email: 'Atyrer@bacardi.com' },
  { firstName: 'Madison',   name: 'Madison Hahn',        email: 'Madison.hahn@nike.com' },
  { firstName: 'Levi',      name: 'Levi',                email: 'Levi@bluemarlinibiza.london' },
  { firstName: 'Lucy',      name: 'Lucy',                email: 'Lucy@zero21brands.com' },
  { firstName: 'Ibukun',    name: 'Ibukun Oluwayomi',    email: 'Ibukun.oluwayomi@apollongroup.io' },

  // ── Batch 2 ────────────────────────────────────────────────────────────────
  { firstName: 'Jane',    name: 'Jane Ostler',      email: 'jane.ostler@kantar.com' },
  { firstName: 'Michael', name: 'Michael Barrett',  email: 'mbarrett@magnite.com' },
  { firstName: 'Gary',    name: 'Gary Vaynerchuk',  email: 'gary.vaynerchuk@vaynermedia.com' },
  { firstName: 'Bob',     name: 'Bob Pittman',      email: 'bobpittman@iheartmedia.com' },
  { firstName: 'Judann',  name: 'Judann Pollack',   email: 'jpollack@adage.com' },

  // ── email-iph-cannes-partnership-pitch ─────────────────────────────────────
  { firstName: 'David',   name: 'David Tiltman',             email: 'david.tiltman@warc.com' },
  { firstName: 'Karl',    name: 'Karl Marsden',              email: 'karl@contagious.com' },
  { firstName: 'Nisha',   name: 'Nisha Stephen',             email: 'nisha@effie.org' },
  { firstName: 'Katie',   name: 'Katie Flash',               email: 'Katie.Flash@Informa.com' },
  { firstName: 'Robert',  name: 'Robert Rose',               email: 'robert.rose@contentmarketinginstitute.com' },
  { firstName: 'Marcel',  name: 'Marcel Marcondes',          email: 'marcel.marcondes@ab-inbev.com' },
  { firstName: 'Hermann', name: 'Hermann Deininger',         email: 'hermann.deininger@adidas-group.com' },
  { firstName: 'Tor',     name: 'Tor Myhren',                email: 'tor.myhren@apple.com' },
  { firstName: 'Joel',    name: 'Joel Yashinsky',            email: 'joel.yashinsky@rbi.com' },
  { firstName: 'Bram',    name: 'Bram Westenbrink',          email: 'b.westenbrink@heineken.com' },
  { firstName: 'Erika',   name: 'Erika Intiso',              email: 'erika.intiso@inter.ikea.com' },
  { firstName: 'Todd',    name: 'Todd Kaplan',               email: 'todd.kaplan@kraftheinzcompany.com' },
  { firstName: 'Gulen',   name: 'Gulen Bengi',               email: 'g.bengi@effem.com' },
  { firstName: 'Morgan',  name: 'Morgan Flatley',            email: 'morgan.flatley@mcdonalds.com' },
  { firstName: 'Nicole',  name: 'Nicole Graham',             email: 'n.graham@nike.com' },
  { firstName: 'Marc',    name: 'Marc Pritchard',            email: 'marc.pritchard@pg.com' },
  { firstName: 'Esi',     name: 'Esi Eggleston Bracey',      email: 'esi.bracey@unilever.com' },
  { firstName: 'Acuity',  name: 'Acuity Pricing Team',       email: 'info@acuitypricing.com' },

  // ── email-sponsor-partner-3rd-wave ─────────────────────────────────────────
  { firstName: 'Carleigh', name: 'Carleigh Jaques',   email: 'cjaques@visa.com' },
  { firstName: 'Raja',     name: 'Raja Rajamannar',   email: 'raja.rajamannar@mastercard.com' },
  { firstName: 'Orson',    name: 'Orson Francescone', email: 'orson.francescone@ft.com' },
  { firstName: 'Rob',      name: 'Rob Wilk',          email: 'robw@microsoft.com' },
  { firstName: 'Marc',     name: 'Marc Sternberg',    email: 'marc@brand-innovators.com' },
  { firstName: 'Laurent',  name: 'Laurent Ezekiel',   email: 'laurent.ezekiel@wpp.com' },
  { firstName: 'Sofia',    name: 'Sofia Hernandez',   email: 'sofia.hernandez@tiktok.com' },
  { firstName: 'Matt',     name: 'Matt Devitt',       email: 'matt.devitt@nielsen.com' },
  { firstName: 'Mike',     name: 'Mike Romoff',       email: 'mromoff@reddit.com' },
  { firstName: 'Ben',      name: 'Ben Skinazi',       email: 'bskinazi@equativ.com' },
  { firstName: 'Claire',   name: 'Claire Paull',      email: 'clairepaull@amazon.com' },
  { firstName: 'Diana',    name: 'Diana Littman',     email: 'diana.littman@adweek.com' },
  { firstName: 'Javier',   name: 'Javier Campopiano', email: 'javier.campopiano@mccann.com' },
  { firstName: 'Anjali',   name: 'Anjali Sud',        email: 'asud@tubi.tv' },

  // ── email-brand-partner-batch-may14 ────────────────────────────────────────
  // Lovable
  { firstName: 'Ceci',      name: 'Ceci Stallsmith',    email: 'ceci@lovable.dev' },
  { firstName: 'Elena',     name: 'Elena Verna',         email: 'elena@lovable.dev' },
  { firstName: 'Theo',      name: 'Theo Daniellot',      email: 'theo@lovable.dev' },
  // Higgsfield AI
  { firstName: 'Vladimir',  name: 'Vladimir Karyshev',   email: 'vkaryshev@higgsfield.ai' },
  { firstName: 'Jasmyn',    name: 'Jasmyn Jarnigan',     email: 'jjarnigan@higgsfield.ai' },
  { firstName: 'Kevin',     name: 'Kevin Kim',            email: 'kkim@higgsfield.ai' },
  // Epidemic Sound
  { firstName: 'Justin',    name: 'Justin Chacona',      email: 'justin.chacona@epidemicsound.com' },
  { firstName: 'Bertrand',  name: 'Bertrand Etienne',    email: 'bertrand.etienne@epidemicsound.com' },
  { firstName: 'Sara',      name: 'Sara Borsvik',        email: 'sara.borsvik@epidemicsound.com' },
  // Otter.ai
  { firstName: 'Chang',     name: 'Chang Chen',          email: 'chang@otter.ai' },
  { firstName: 'Marie',     name: 'Marie Abesiamis',     email: 'marie@otter.ai' },
  { firstName: 'Kenny',     name: 'Kenny Scannell',      email: 'kenny@otter.ai' },
  // Dazed Media
  { firstName: 'Sophie',    name: 'Sophie McElligott',   email: 'sophie.mcelligott@dazedmedia.com' },
  { firstName: 'Dan',       name: 'Dan Fitzgerald',      email: 'dan.fitzgerald@dazedmedia.com' },
  { firstName: 'Lucy',      name: 'Lucy Warwick',        email: 'lucy.warwick@dazedmedia.com' },
  // BuzzBallz
  { firstName: 'Merrilee',  name: 'Merrilee Kick',       email: 'merrilee.kick@buzzballz.com' },
  { firstName: 'Tracy',     name: 'Tracy Frisbie',       email: 'tracy.frisbie@buzzballz.com' },
  { firstName: 'Yashika',   name: 'Yashika Maru',        email: 'yashika.maru@buzzballz.com' },
  // OpenAI
  { firstName: 'Gary',      name: 'Gary Briggs',         email: 'gary.briggs@openai.com' },
  { firstName: 'Elke',      name: 'Elke Karstens',       email: 'elke.karstens@openai.com' },
  { firstName: 'Michael',   name: 'Michael Tabtabai',    email: 'michael.tabtabai@openai.com' },
  // Luma AI
  { firstName: 'Jason',     name: 'Jason Day',           email: 'jason.day@lumalabs.ai' },
  { firstName: 'Caroline',  name: 'Caroline Ingeborn',   email: 'caroline.ingeborn@lumalabs.ai' },
  { firstName: 'Verena',    name: 'Verena Puhm',         email: 'verena.puhm@lumalabs.ai' },
  // Lu.ma
  { firstName: 'Victor',    name: 'Victor Pontis',       email: 'victor@lu.ma' },
  { firstName: 'Dan',       name: 'Dan Liu',             email: 'dan@lu.ma' },
  { firstName: 'there',     name: 'Lu.ma Partnerships',  email: 'partnerships@lu.ma' },
  // ClickUp
  { firstName: 'Kyle',      name: 'Kyle Coleman',        email: 'KColeman@clickup.com' },
  { firstName: 'Jeff',      name: 'Jeff de Ruyter',      email: 'JdeRuyter@clickup.com' },
  { firstName: 'Gaurav',    name: 'Gaurav Agarwal',      email: 'GAgarwal@clickup.com' },
  // Crowe Media
  { firstName: 'Anna',      name: 'Anna Crowe',          email: 'anna.crowe@crowepr.com' },
  { firstName: 'Natalia',   name: 'Natalia Barclay',     email: 'natalia.barclay@crowepr.com' },
  { firstName: 'Alex',      name: 'Alex Meyers',         email: 'alex.meyers@crowepr.com' },
  // Free Bean Coffee
  { firstName: 'Adam',      name: 'Adam Korsunsky',      email: 'adam@freebean.co' },
  { firstName: 'Brett',     name: 'Brett Korsunsky',     email: 'brett@freebean.co' },
  { firstName: 'Jett',      name: 'Jett Zimmerman',      email: 'jett@freebean.co' },
  // Airwallex
  { firstName: 'Jon',       name: 'Jon Stona',           email: 'jon.stona@airwallex.com' },
  { firstName: 'James',     name: 'James Elias',         email: 'james.elias@airwallex.com' },
  { firstName: 'Ravi',      name: 'Ravi Adusumilli',     email: 'ravi.adusumilli@airwallex.com' },
  // Nift
  { firstName: 'Saket',     name: 'Saket Mehta',         email: 'saket.mehta@gonift.com' },
  { firstName: 'Kathryn',   name: 'Kathryn Maguire',     email: 'kathryn.maguire@gonift.com' },
  { firstName: 'Rob',       name: 'Rob Lynch',           email: 'rob.lynch@gonift.com' },
  // ElevenLabs
  { firstName: 'Dustin',    name: 'Dustin Blank',        email: 'dustin.blank@elevenlabs.io' },
  { firstName: 'Luke',      name: 'Luke Harries',        email: 'luke.harries@elevenlabs.io' },
  { firstName: 'Nicolo',    name: 'Nicolo Rossi',        email: 'nicolo.rossi@elevenlabs.io' },
  // Suno AI
  { firstName: 'Jeremy',    name: 'Jeremy Sirota',       email: 'jeremy.sirota@suno.com' },
  { firstName: 'Paul',      name: 'Paul Sinclair',       email: 'paul.sinclair@suno.com' },
  { firstName: 'Mikey',     name: 'Mikey Shulman',       email: 'mikey.shulman@suno.com' },
  // Runway AI
  { firstName: 'Jamie',     name: 'Jamie Umpherson',     email: 'jamie.umpherson@runwayml.com' },
  { firstName: 'Emily',     name: 'Emily Golden',        email: 'emily.golden@runwayml.com' },
  { firstName: 'Cristobal', name: 'Cristobal Valenzuela',email: 'cristobal.valenzuela@runwayml.com' },
  // Base44
  { firstName: 'Shay',      name: 'Shay Korin',          email: 'shay@base44.com' },
  { firstName: 'Shaked',    name: 'Shaked Vered',        email: 'shaked@base44.com' },
  { firstName: 'Guy',       name: 'Guy Gallant',         email: 'guy@base44.com' },

  // ── email-new-brands-iph-outreach-may16 ────────────────────────────────────
  // Fabletics
  { firstName: 'Carly',     name: 'Carly Gomez',         email: 'carly.gomez@fabletics.com' },
  { firstName: 'Meera',     name: 'Meera Bhatia',        email: 'meera.bhatia@fabletics.com' },
  { firstName: 'Michael',   name: 'Michael Gorodetskiy', email: 'michael.gorodetskiy@fabletics.com' },
  // C4 Energy / Nutrabolt
  { firstName: 'Robert',    name: 'Robert Zajac',        email: 'robert.zajac@nutrabolt.com' },
  { firstName: 'Katie',     name: 'Katie Geyer',         email: 'katie.geyer@nutrabolt.com' },
  { firstName: 'Doss',      name: 'Doss Cunningham',     email: 'doss.cunningham@nutrabolt.com' },
  // DraftKings
  { firstName: 'Stephanie', name: 'Stephanie Sherman',   email: 'stephanie.sherman@draftkings.com' },
  { firstName: 'Ezra',      name: 'Ezra Kucharz',        email: 'ezra.kucharz@draftkings.com' },
  { firstName: 'Jason',     name: 'Jason Robins',        email: 'jason.robins@draftkings.com' },
  // Qatar Airways
  { firstName: 'Babar',     name: 'Babar Rahman',        email: 'babar.rahman@qatarairways.com.qa' },
  { firstName: 'Rebecca',   name: 'Rebecca Thompson',    email: 'rebecca.thompson@qatarairways.com.qa' },
  { firstName: 'Thierry',   name: 'Thierry Antinori',    email: 'thierry.antinori@qatarairways.com.qa' },
  // EasyJet
  { firstName: 'Robert',    name: 'Robert Birge',        email: 'robert.birge@easyjet.com' },
  { firstName: 'Chris',     name: 'Chris Brown',         email: 'chris.brown@easyjet.com' },
  { firstName: 'Johan',     name: 'Johan Lundgren',      email: 'johan.lundgren@easyjet.com' },
  // Ryanair
  { firstName: 'Dara',      name: 'Dara Brady',          email: 'dara.brady@ryanair.com' },
  { firstName: 'Emer',      name: 'Emer Traynor',        email: 'emer.traynor@ryanair.com' },
  { firstName: 'Michael',   name: "Michael O'Leary",     email: 'michael.oleary@ryanair.com' },
  // Wizz Air
  { firstName: 'Boglarka',  name: 'Boglarka Spak',       email: 'boglarka.spak@wizzair.com' },
  { firstName: 'Jozsef',    name: 'Jozsef Varadi',       email: 'jozsef.varadi@wizzair.com' },
  { firstName: 'Marion',    name: 'Marion Geoffroy',     email: 'marion.geoffroy@wizzair.com' },
  // SiriusXM
  { firstName: 'Denise',    name: 'Denise Karkos',       email: 'denise.karkos@siriusxm.com' },
  { firstName: 'Rolanda',   name: 'Rolanda Gaines',      email: 'rolanda.gaines@siriusxm.com' },
  { firstName: 'Kimberly',  name: 'Kimberly Wilson',     email: 'kimberly.wilson@siriusxm.com' },
  // Verizon
  { firstName: 'Leslie',    name: 'Leslie Berland',      email: 'leslie.berland@verizon.com' },
  { firstName: 'Justin',    name: 'Justin Toman',        email: 'justin.toman@verizon.com' },
  { firstName: 'Mary',      name: 'Mary Sagripanti',     email: 'mary.sagripanti@verizon.com' },
  // Burn Boot Camp
  { firstName: 'Trisha',    name: 'Trisha Pena',         email: 'trisha.pena@burnbootcamp.com' },
  { firstName: 'Devan',     name: 'Devan Kline',         email: 'devan.kline@burnbootcamp.com' },
  { firstName: 'Morgan',    name: 'Morgan Kline',        email: 'morgan.kline@burnbootcamp.com' },
  // Authentic Brands Group
  { firstName: 'Nick',      name: 'Nick Woodhouse',      email: 'nick.woodhouse@authentic.com' },
  { firstName: 'Natasha',   name: 'Natasha Fishman',     email: 'natasha.fishman@authentic.com' },
  { firstName: 'Alexandra', name: 'Alexandra Taylor',    email: 'alexandra.taylor@authentic.com' },
];

// Deduplicate by normalised email, and strip excluded domains
function buildContacts(): Contact[] {
  const seen   = new Set<string>();
  const result: Contact[] = [];

  for (const c of RAW_CONTACTS) {
    const lower = c.email.toLowerCase().trim();
    if (seen.has(lower)) continue;
    const domain = lower.split('@')[1] || '';
    if (EXCLUDED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
      console.log(`  Excluded (domain): ${c.name} <${c.email}>`);
      continue;
    }
    seen.add(lower);
    result.push({ ...c, email: c.email.trim() });
  }

  return result;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const dryRun   = process.env.DRY_RUN === 'true';
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();

  const contacts = buildContacts();
  const toSend   = sendOnly ? contacts.filter(c => c.email.toLowerCase() === sendOnly) : contacts;

  if (toSend.length === 0) {
    console.log(`No contacts matched SEND_ONLY="${process.env.SEND_ONLY}".`);
    process.exit(1);
  }

  console.log(`\nINDVSTRY Power House x DEPT Agency — panel follow-up`);
  console.log(`Contacts: ${toSend.length} (from ${RAW_CONTACTS.length} raw, after dedup + exclusions)`);

  if (dryRun) {
    console.log('\nDRY RUN — recipients:\n');
    toSend.forEach((c, i) => console.log(`  [${i + 1}] ${c.name} <${c.email}>`));
    console.log(`\nTotal: ${toSend.length}`);
    return;
  }

  const flyerB64 = getFlyerBase64();
  const logoB64  = getLogoBase64();
  const subject  = 'INDVSTRY Power House x DEPT Agency — Cannes Lions, June 24';

  console.log('\nFetching auth token...');
  const token = await getToken();
  console.log('Auth OK. Sending...\n');

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < toSend.length; i++) {
    const c = toSend[i];

    const message: any = {
      subject,
      body: { contentType: 'HTML', content: buildHtml(c.firstName) },
      toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
      from:         { emailAddress: { address: process.env.EMAIL_USER || 'amber@indvstryclvb.com', name: 'Amber Jacobs' } },
      attachments:  [] as any[],
    };

    // Inline logo
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

    // Flyer attachment
    if (flyerB64) {
      message.attachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name:          'INDVSTRY-PowerHouse-DEPT-Panel-Cannes-2026.png',
        contentType:   'image/png',
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
      console.log(`  [${sent + failed}/${toSend.length}] Sent   -> ${c.name} <${c.email}>`);
    } catch (err: any) {
      failed++;
      const msg = err?.response?.data?.error?.message || err.message || String(err);
      console.error(`  [${sent + failed}/${toSend.length}] FAILED -> ${c.name} <${c.email}> — ${msg}`);
    }

    if (i < toSend.length - 1) await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed out of ${toSend.length}.`);
  if (failed > 0) console.log('Check failed emails above and re-send with SEND_ONLY=email@example.com if needed.');
}

main().catch(err => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
