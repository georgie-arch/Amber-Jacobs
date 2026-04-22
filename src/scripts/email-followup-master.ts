/**
 * email-followup-master.ts
 *
 * Master follow-up script for all IPH outreach batches.
 * Applies full exclusion logic: multi-contact CSV, DEPT domain,
 * individual script recipients, and today's Batch 7 re-sends.
 *
 * Usage:
 *   BATCH=A npx ts-node --project tsconfig.json src/scripts/email-followup-master.ts
 *   BATCH=B npx ts-node --project tsconfig.json src/scripts/email-followup-master.ts
 *   BATCH=C npx ts-node --project tsconfig.json src/scripts/email-followup-master.ts
 *   BATCH=D npx ts-node --project tsconfig.json src/scripts/email-followup-master.ts
 *   BATCH=E npx ts-node --project tsconfig.json src/scripts/email-followup-master.ts
 *
 * Batches:
 *   A — Tier 1 senior (24 Mar) — from George
 *   B — MindNode named targets (25 Mar) — from Amber
 *   C — Music & entertainment (28-30 Mar) — from Amber
 *   D — Fashion / agency / PR (31 Mar) — from Amber
 *   E — Residency & misc leads (2-5 Apr) — from Amber
 *
 * Bounce tracking: all failures logged to /tmp/followup-bounces.log
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ─── BOUNCE LOG ──────────────────────────────────────────────────────────────

const BOUNCE_LOG = '/tmp/followup-bounces.log';

function logBounce(email: string, name: string, batch: string, reason: string) {
  const line = `[${new Date().toISOString()}] BATCH:${batch} | ${name} <${email}> | ${reason}\n`;
  fs.appendFileSync(BOUNCE_LOG, line);
}

// ─── EXCLUSION LIST ───────────────────────────────────────────────────────────
// Built from: CSV multi-contact list + individual script recipients + DEPT domain

const EXCLUDED_DOMAINS = new Set([
  'deptagency.com',
]);

const EXCLUDED_EMAILS = new Set([
  // Individual script recipients
  'nfowler@alvarezandmarsal.com', 'nilufar.fowler@wpp.com', 'nilufarfowler@gmail.com',
  'rakia@coppervine.io',
  'paulina.prystupa@deptagency.com',
  'marjan.straathof@deptagency.com',
  'dimi.albers@deptagency.com',
  'joew@canneslions.com', 'jamest@canneslions.com', 'michaelaw@canneslions.com',
  'latoya.shambo@blackgirldigital.com',
  'denise.boateng@informa.com',
  'carel.scheepers@havasmg.co.za',
  'jlee@pinterest.com',
  'che.wheatley@ft.com',
  'matt.tuffuor@eventbrite.com',
  'tope@afriex.co',
  'djsandraomari@gmail.com',
  'greg@beatstars.com', // individual reply sent
  'hello@jonelleawomoyi.com',
  'toni.okoro@gmail.com',
  'emily@viceversastrategy.com',
  'steve@smcacreative.com',
  'cyrillutterodt@gmail.com',
  // Today's Batch 7 re-sends (already received follow-up today)
  'partnerships@apple.com', 'aws-partnerships@amazon.com', 'commercial.partnerships@bbcstudios.com',
  'bmedia@bloomberg.net', 'partnerships@businessinsider.com', 'partnerships@comcast.com',
  'partnerships@criteo.com', 'cannes@deloitte.com', 'partnerships@discord.com',
  'partnerships@doubleverify.com', 'cannes@edelman.com', 'partnerships@forbes.com',
  'partnerships@fortune.com', 'hello@gumgum.com', 'info@harbourviewequity.com',
  'partnerships@horizonmedia.com', 'ibm-cannes@us.ibm.com', 'partnerships@jcdecaux.com',
  'partnerships@nbcuniversal.com', 'partnerships@nvidia.com', 'cannes@omnicomgroup.com',
  'partnerships@paramount.com', 'partnerships@rtl.com', 'cannes@salesforce.com',
  'samsungads@samsung.com', 'partnerships@shopify.com', 'partnerships@siriusxm.com',
  'partnerships@taboola.com', 'partnerships@teads.tv', 'partnerships@televisaunivision.com',
  'advertising@t-mobile.com', 'hello@triplelift.com', 'partnerships@viant.tv',
  'hello@vml.com', 'hello@whalar.com', 'hello@xpland.com',
  'wsj-partnerships@wsj.com', 'partnerships@washpost.com', 'partnerships@weather.com',
  'hello@thedrum.com', 'hello@campaignlive.co.uk', 'partnerships@semafor.com',
  'partnerships@adform.com', 'partnerships@alkimiads.com', 'partnerships@audiencex.com',
  'partnerships@azerion.com', 'partnerships@basis.com', 'partnerships@captify.co.uk',
  'partnerships@celtra.com', 'partnerships@channelfactory.com', 'partnerships@claritas.com',
  'partnerships@cognitiv.ai', 'partnerships@danads.com', 'partnerships@displayce.com',
  'partnerships@dstillery.com', 'partnerships@edo.com', 'partnerships@epsilon.com',
  'partnerships@ex.co', 'partnerships@exchangewire.com', 'partnerships@experian.com',
  'partnerships@fetchrewards.com', 'partnerships@firstpartycapital.com', 'partnerships@gpn.com',
  'partnerships@gwi.com', 'partnerships@integralads.com', 'partnerships@indexexchange.com',
  'partnerships@infillion.com', 'partnerships@inmobi.com', 'partnerships@inmar.com',
  'partnerships@ircode.com', 'partnerships@irisworldwide.com',
  'hello@72point.com', 'hello@adobe.com', 'hello@arthouse.com', 'hello@darkroom.co',
  'hello@digitalvoices.com', 'hello@empower.com', 'hello@fullcourtmarketing.com',
  'hello@humanventures.co', 'hello@influential.co', 'hello@lbbonline.com',
  'hello@limelightplatform.com', 'hello@littlegreycells.com', 'hello@mcsaatchi.com',
  'hello@mediamonks.com', 'hello@medialink.com', 'hello@monks.com', 'hello@msq.com',
  'hello@nosingleindividual.com', 'hello@preagency.net', 'hello@rga.com',
  'hello@razorfish.com', 'hello@realize.com', 'hello@risedigital.com',
  'hello@sparkai.com', 'hello@sparksmarketing.com', 'hello@teamfarner.com',
  'hello@transmission.agency', 'hello@vccp.com', 'hello@whalar.com',
  'editorial@axios.com', 'editorial@bauermedia.co.uk', 'editorial@beet.tv',
  'partnerships@bereal.com', 'editorial@newdigitalage.co.uk',
  'editorial@performancemarketingworld.com', 'editorial@shots.net',
  'editorial@videoweek.tv', 'partnerships@worldmediagroup.org',
  'hello@adtechgod.com', 'editorial@indieagencynews.com',
  'partnerships@advertisingweeklatam.com', 'hello@thenetworkone.com', 'hello@steinias.com',
  'hello@100womenatdavos.com', 'hello@brandsandculture.com', 'hello@culturemix.com',
  'hello@digitalleadingladies.com', 'hello@fusionfashiontech.com',
  'hello@hernextfrontier.com', 'hello@ittakesavillagecollective.com',
  'hello@iwgroupinc.com', 'hello@ladieswhostrategize.com', 'hello@myrunwaygroup.com',
  'hello@pearpop.com', 'hello@pvblic.org', 'hello@sherunsit.org',
  'hello@thefemalequotient.com', 'hello@theshcollective.com', 'hello@thewiesuite.com',
  'hello@unpluggedcollective.com', 'hello@werepresent.co', 'hello@womenandaifutures.com',
  'hello@womeninspiring.net', 'hello@worldwomanfoundation.org',
  'hello@groupblack.co', 'hello@communitylabs.com', 'hello@quintal.io',
  'hello@actresponsible.org', 'hello@amecorg.com', 'hello@adassoc.org.uk',
  'hello@a-p-a.net', 'hello@bain.com', 'hello@bcg.com',
  'hello@consciousadvertising.network', 'hello@fibep.info',
  'hello@gala-marketinglawyers.org', 'hello@iabeurope.eu', 'hello@iapi.ie',
  'hello@iccopr.com', 'hello@mmaglobal.com', 'hello@movementforanopenweb.com',
  'hello@outvertising.org', 'hello@twipn.com', 'hello@ukaeg.co.uk',
  'hello@undp.org', 'hello@wacl.info', 'hello@win-hq.com', 'hello@worldcomgroup.com',
  'hello@geretyawards.com', 'hello@marketingsociety.com', 'hello@themediatrust.org',
  'partnerships@3cventures.com', 'partnerships@arwen.ai', 'partnerships@audiostack.ai',
  'partnerships@brave.com', 'partnerships@beeler.tech', 'partnerships@chezverve.com',
  'partnerships@club5to7.com', 'partnerships@collectively.com',
  'partnerships@commoninterest.com', 'partnerships@converge.events',
  'contact@d-nice.com', 'partnerships@deepbluesports.com',
  'partnerships@digitalfightclub.com', 'partnerships@disrupt.io',
  'partnerships@futureweeklive.com', 'partnerships@goalshouse.com',
  'partnerships@human.security', 'partnerships@hura.com',
  'partnerships@insightslighthouse.com', 'partnerships@jaiunpotedanslacom.fr',
  'partnerships@lavishlifestyles.com', 'partnerships@linqia.com',
  'partnerships@makersai.com', 'partnerships@mca.com', 'partnerships@smg.com',
  'partnerships@sona.com', 'partnerships@socialplus.com',
  'partnerships@stopatnothing.com', 'partnerships@supergreatfantastic.com',
  'partnerships@supernova.io', 'partnerships@tdwco.com', 'partnerships@theberry.com',
  'partnerships@thecreativeforce.com', 'partnerships@thecreativeladder.com',
  'partnerships@theroom.com', 'partnerships@thinkbeyond.com',
  'partnerships@thinkbox.tv', 'partnerships@ultimateasset.com',
  'partnerships@within.co', 'partnerships@woofstudios.com',
]);

// Load multi-contact emails from CSV (timesEmailed > 1)
function loadMultiContactEmails(): Set<string> {
  const csv = fs.readFileSync(path.resolve('src/data/all-sent-contacts.csv'), 'utf8');
  const excluded = new Set<string>();
  csv.trim().split('\n').slice(1).forEach(line => {
    const parts = line.match(/"([^"]*)","([^"]*)",([^,]+),([^,]+),(\d+)/);
    if (!parts) return;
    const times = parseInt(parts[5]);
    if (times > 1) excluded.add(parts[2].toLowerCase().trim());
  });
  return excluded;
}

function isExcluded(email: string, multiContact: Set<string>): boolean {
  const e = email.toLowerCase().trim();
  const domain = e.split('@')[1] || '';
  if (EXCLUDED_DOMAINS.has(domain)) return true;
  if (EXCLUDED_EMAILS.has(e)) return true;
  if (multiContact.has(e)) return true;
  return false;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

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

// ─── HTML BUILDER ─────────────────────────────────────────────────────────────

function buildHtml(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${body.replace(/\n/g, '<br>')}</div>
</body></html>`;
}

function buildHtmlWithFooter(body: string, senderName: string, senderTitle: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${body.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">${senderName}</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">${senderTitle}</p>
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

// ─── SEND ─────────────────────────────────────────────────────────────────────

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  htmlBody: string,
  fromAddress: string,
  fromName: string
): Promise<'sent' | 'bounced'> {
  try {
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        message: {
          subject,
          body: { contentType: 'HTML', content: htmlBody },
          toRecipients: [{ emailAddress: { address: to, name: toName } }],
          from: { emailAddress: { address: fromAddress, name: fromName } },
        },
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return 'sent';
  } catch (err: any) {
    const reason = err?.response?.data?.error?.message || err.message || 'unknown error';
    return 'bounced';
  }
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

function templateGeorgeTier1(firstName: string): string {
  return `Hi ${firstName},

I wanted to follow up on my previous message about Indvstry Power House at Cannes Lions 2026.

We are building something genuinely different during festival week. A private villa activation bringing together 30 of the most senior creative, marketing and cultural leaders for five days of real conversation, shared meals and closed-door sessions. We have 21 official Cannes Lions delegate passes to share with our guests and partners.

I would love to find 15 minutes to walk you through what we are putting together and explore if there is a way to bring [company] into the room.

Are you heading to Cannes this year? Happy to jump on a quick call.

Speak soon,`;
}

function templateAmberPartnership(company: string): string {
  return `Hi there,

I wanted to follow up on my previous message about Indvstry Power House at Cannes Lions 2026.

We are hosting 30 senior creative and marketing leaders at a private villa across festival week and exploring a small number of brand partnerships. We have 21 official Cannes Lions delegate passes and are building an intimate programme of sessions, dinners and curated access for our guests.

Would love to explore if there is something that makes sense for ${company}. Happy to set up a quick call with our founder George if helpful.

Speak soon,`;
}

function templateAmberMusic(firstName: string, company: string): string {
  return `Hi ${firstName},

Just following up on my previous email about Indvstry Power House at Cannes Lions 2026.

Music and streaming companies have a real opportunity at Cannes Lions this year. We are building a private villa activation alongside the festival, bringing senior creative and cultural leaders together across the week, and exploring how we can create meaningful space for the music industry in those conversations.

Would love to explore what a presence at the Power House could look like for ${company}. Are you heading to Cannes this year?

Speak soon,`;
}

function templateAmberFashion(firstName: string, company: string): string {
  return `Hi ${firstName},

Following up on my earlier email about Indvstry Power House at Cannes Lions 2026.

We are creating a private villa activation during festival week, bringing together 30 senior creative, cultural and marketing leaders. Fashion and lifestyle brands are a strong fit for what we are building and I would love to explore whether there is an angle that works for ${company}.

Are you heading to Cannes this year? Happy to set up a quick call.

Speak soon,`;
}

function templateAmberResidency(firstName: string): string {
  return `Hi ${firstName},

Just following up on my previous email about our private villa residency at Cannes Lions 2026.

We still have a small number of rooms available. Each includes an official Cannes Lions delegate pass worth €5,000, daily transport to La Croisette, curated event access and a ticket to our Diaspora Dinner on 23 June. Rooms from £1,500.

Full details here: https://lu.ma/t4ek2yn7

Would love to know if Cannes is on your radar this June.

Speak soon,`;
}

// ─── BATCH CONTACT LISTS ──────────────────────────────────────────────────────

interface Contact {
  name: string;
  firstName: string;
  email: string;
  company: string;
}

// BATCH A — Tier 1 senior (24 Mar) — from George
const batchA: Contact[] = [
  { name: 'Judann Pollack',       firstName: 'Judann',    email: 'jpollack@adage.com',              company: 'Ad Age' },
  { name: 'Bob Pittman',          firstName: 'Bob',       email: 'bobpittman@iheartmedia.com',      company: 'iHeartMedia' },
  { name: 'Gary Vaynerchuk',      firstName: 'Gary',      email: 'gary.vaynerchuk@vaynermedia.com', company: 'VaynerMedia' },
  { name: 'Michael Barrett',      firstName: 'Michael',   email: 'mbarrett@magnite.com',            company: 'Magnite' },
  { name: 'Jane Ostler',          firstName: 'Jane',      email: 'jane.ostler@kantar.com',          company: 'Kantar' },
  { name: 'Charlotte Rambaud',    firstName: 'Charlotte', email: 'charlotte.rambaud@havas.com',     company: 'Havas' },
  { name: 'Jeremy Miller',        firstName: 'Jeremy',    email: 'jeremy.miller@dentsu.com',        company: 'Dentsu' },
  { name: 'James Rooke',          firstName: 'James',     email: 'james_rooke@comcast.com',         company: 'Comcast' },
  { name: 'Beth Sidhu',           firstName: 'Beth',      email: 'beth.sidhu@stagwellglobal.com',   company: 'Stagwell' },
  { name: 'Carleigh Jaques',      firstName: 'Carleigh',  email: 'cjaques@visa.com',                company: 'Visa' },
  { name: 'Raja Rajamannar',      firstName: 'Raja',      email: 'raja.rajamannar@mastercard.com',  company: 'Mastercard' },
  { name: 'Orson Francescone',    firstName: 'Orson',     email: 'orson.francescone@ft.com',        company: 'Financial Times' },
  { name: 'Rob Wilk',             firstName: 'Rob',       email: 'robw@microsoft.com',              company: 'Microsoft' },
  { name: 'Marc Sternberg',       firstName: 'Marc',      email: 'marc@brand-innovators.com',       company: 'Brand Innovators' },
  { name: 'Laurent Ezekiel',      firstName: 'Laurent',   email: 'laurent.ezekiel@wpp.com',         company: 'WPP' },
  { name: 'Sofia Hernandez',      firstName: 'Sofia',     email: 'sofia.hernandez@tiktok.com',      company: 'TikTok' },
  { name: 'Matt Devitt',          firstName: 'Matt',      email: 'matt.devitt@nielsen.com',         company: 'Nielsen' },
  { name: 'Mike Romoff',          firstName: 'Mike',      email: 'mromoff@reddit.com',              company: 'Reddit' },
  { name: 'Ben Skinazi',          firstName: 'Ben',       email: 'bskinazi@equativ.com',            company: 'Equativ' },
  { name: 'Claire Paull',         firstName: 'Claire',    email: 'clairepaull@amazon.com',          company: 'Amazon' },
  { name: 'Diana Littman',        firstName: 'Diana',     email: 'diana.littman@adweek.com',        company: 'Adweek' },
  { name: 'Marc Pritchard',       firstName: 'Marc',      email: 'marc.pritchard@pg.com',           company: 'P&G' },
  { name: 'Javier Campopiano',    firstName: 'Javier',    email: 'javier.campopiano@mccann.com',    company: 'McCann' },
  { name: 'Anjali Sud',           firstName: 'Anjali',    email: 'asud@tubi.tv',                    company: 'Tubi' },
];

// BATCH B — MindNode named targets (25 Mar) — from Amber
const batchB: Contact[] = [
  { name: 'Aran Hayashi',         firstName: 'Aran',      email: 'aran.hayashi@sxswlondon.com',     company: 'SXSW London' },
  { name: 'Marcos Waltenberg',    firstName: 'Marcos',    email: 'marcos.waltenberg@microsoft.com', company: 'Microsoft' },
  { name: 'Scott Howe',           firstName: 'Scott',     email: 'scott.howe@liveramp.com',         company: 'LiveRamp' },
  { name: 'Vihan Sharma',         firstName: 'Vihan',     email: 'vihan.sharma@liveramp.com',       company: 'LiveRamp' },
  { name: 'Jamie Power',          firstName: 'Jamie',     email: 'jamie.power@disney.com',          company: 'Disney' },
  { name: 'Dana McGraw',          firstName: 'Dana',      email: 'dana.mcgraw@disney.com',          company: 'Disney' },
  { name: 'Rita Ferro',           firstName: 'Rita',      email: 'rita.ferro@disney.com',           company: 'Disney' },
  { name: 'Helen Ma',             firstName: 'Helen',     email: 'helen.ma@meta.com',               company: 'Meta' },
  { name: 'Nicola Mendelsohn',    firstName: 'Nicola',    email: 'nicola.mendelsohn@meta.com',      company: 'Meta' },
  { name: 'Dave Meeker',          firstName: 'Dave',      email: 'dave.meeker@monks.com',           company: 'Monks' },
  { name: 'Victor Knaap',         firstName: 'Victor',    email: 'victor.knaap@monks.com',          company: 'Monks' },
  { name: 'Rob Gillies',          firstName: 'Rob',       email: 'rob.gillies@vevo.com',            company: 'Vevo' },
  { name: 'Jerret West',          firstName: 'Jerret',    email: 'jerret.west@roblox.com',          company: 'Roblox' },
  { name: 'Jason Mander',         firstName: 'Jason',     email: 'jason.mander@gwi.com',            company: 'GWI' },
  { name: 'Jon Gieselman',        firstName: 'Jon',       email: 'jon.gieselman@comcast.com',       company: 'Comcast' },
  { name: 'Jochen Koedijk',       firstName: 'Jochen',    email: 'jochen.koedijk@expediagroup.com', company: 'Expedia' },
  { name: 'Ariane Gorin',         firstName: 'Ariane',    email: 'ariane.gorin@expediagroup.com',   company: 'Expedia' },
  { name: 'Budi Tanzi',           firstName: 'Budi',      email: 'budi.tanzi@experian.com',         company: 'Experian' },
  { name: 'Greg Koerner',         firstName: 'Greg',      email: 'greg.koerner@experian.com',       company: 'Experian' },
  { name: 'Mary Bekhait',         firstName: 'Mary',      email: 'mary.bekhait@ymugroup.com',       company: 'YMU' },
  { name: 'Lindsay Sheridan',     firstName: 'Lindsay',   email: 'lindsay.sheridan@thetrainline.com', company: 'Trainline' },
  { name: 'Sean Buckley',         firstName: 'Sean',      email: 'sean.buckley@magnite.com',        company: 'Magnite' },
  { name: 'Kristen Williams',     firstName: 'Kristen',   email: 'kristen.williams@magnite.com',    company: 'Magnite' },
];

// BATCH C — Music & entertainment (28-30 Mar) — from Amber
const batchC: Contact[] = [
  { name: 'Philip Kaplan',        firstName: 'Philip',    email: 'philip@distrokid.com',            company: 'DistroKid' },
  { name: 'Robb McDaniels',       firstName: 'Robb',      email: 'robb.mcdaniels@beatport.com',     company: 'Beatport' },
  { name: 'Nick Williams',        firstName: 'Nick',      email: 'nick.williams@native-instruments.com', company: 'Native Instruments' },
  { name: 'Nicki Shamel',         firstName: 'Nicki',     email: 'nicki.shamel@tunecore.com',       company: 'TuneCore' },
  { name: 'Oliver Stoller',       firstName: 'Oliver',    email: 'oliver.stoller@pioneerdj.com',    company: 'Pioneer DJ' },
  { name: 'Abe Batshon',          firstName: 'Abe',       email: 'abe@beatstars.com',               company: 'BeatStars' },
  { name: 'Ghazi Shami',          firstName: 'Ghazi',     email: 'ghazi@empire.io',                 company: 'EMPIRE' },
  { name: 'Kakul Srivastava',     firstName: 'Kakul',     email: 'kakul.srivastava@splice.com',     company: 'Splice' },
  { name: 'Phil Choi',            firstName: 'Phil',      email: 'pchoi@boomplaymusic.com',         company: 'Boomplay' },
];

// BATCH D — Fashion / agency / PR (31 Mar) — from Amber
const batchD: Contact[] = [
  { name: 'Marco Giuliani',       firstName: 'Marco',     email: 'marcoeg@amazon.co.uk',            company: 'Amazon' },
  { name: 'Octavia Pendrill-Adams', firstName: 'Octavia', email: 'octavia.pendrill-adams@asos.com', company: 'ASOS' },
  { name: 'Dean Koend',           firstName: 'Dean',      email: 'dean@base-hq.com',                company: 'BASE HQ' },
  { name: 'Murielle Dessenis',    firstName: 'Murielle',  email: 'murielle.dessenis@pernod-ricard.com', company: 'Pernod Ricard' },
  { name: 'Peter Kingsley',       firstName: 'Peter',     email: 'pkingsley@logitech.com',          company: 'Logitech' },
  { name: 'Nick Karrat',          firstName: 'Nick',      email: 'nickkarrat@stockx.com',           company: 'StockX' },
  { name: 'Charlotte-Anne Myler', firstName: 'Charlotte', email: 'charlotte-anne.myler@umusic.com', company: 'Universal Music' },
  { name: 'Andrea',               firstName: 'Andrea',    email: 'andrea@ideapr.co.uk',             company: 'Idea PR' },
  { name: 'Eleanor Thornton-Firkin', firstName: 'Eleanor', email: 'eleanor.thornton-firkin@ipsos.com', company: 'Ipsos' },
  { name: 'Ben Geall',            firstName: 'Ben',       email: 'ben@auvodka.com',                 company: 'AU Vodka' },
  { name: 'Ben Welsh',            firstName: 'Ben',       email: 'ben.welsh@auvodka.com',           company: 'AU Vodka' },
  { name: 'P Flynn',              firstName: 'P',         email: 'pflynn@peermusic.com',            company: 'Peer Music' },
  { name: 'Jason Melissos',       firstName: 'Jason',     email: 'jason@humanculture.com',          company: 'Human Culture' },
  { name: 'Henry Bryant',         firstName: 'Henry',     email: 'henry.bryant@jpress.co.uk',       company: 'JPress' },
  { name: 'Jonathan Coote',       firstName: 'Jonathan',  email: 'jonathan@brayandkrais.com',       company: 'Bray & Krais' },
  { name: 'Meesh',                firstName: 'Meesh',     email: 'meesh@colorsxstudios.com',        company: 'Colors x Studios' },
  { name: 'Grace Casely',         firstName: 'Grace',     email: 'grace@andyayim.com',              company: 'Andy Ayim' },
];

// BATCH E — Residency & misc leads (2-5 Apr) — from Amber
const batchE: Contact[] = [
  { name: 'Clare Phillips',       firstName: 'Clare',     email: 'clarep@adobe.com',                company: 'Adobe' },
  { name: 'Joe Lamb',             firstName: 'Joe',       email: 'joe.lamb@wearearcade.co.uk',      company: 'Arcade Media' },
  { name: 'Mazviona Madzima',     firstName: 'Mazviona',  email: 'mazviona.madzima@google.com',     company: 'Google' },
  { name: 'Jessica Joseph',       firstName: 'Jessica',   email: 'jessica@season25.com',            company: 'Season25' },
  { name: 'Leon Harlow',          firstName: 'Leon',      email: 'leon.harlow@ymugroup.com',        company: 'YMU' },
  { name: 'Sydne Mullings',       firstName: 'Sydne',     email: 'sydne.mullings@microsoft.com',    company: 'Microsoft' },
  { name: 'Gracie Schram',        firstName: 'Gracie',    email: 'gracie.schram@epidemicsound.com', company: 'Epidemic Sound' },
  { name: 'Benjamin Smith',       firstName: 'Benjamin',  email: 'bsmith@moethennessy.com',         company: 'Moet Hennessy' },
  { name: 'Eugene Cariaga',       firstName: 'Eugene',    email: 'eugene.cariaga@gettyimages.com',  company: 'Getty Images' },
  { name: 'Lorna Smith',          firstName: 'Lorna',     email: 'lorna.smith@anker.com',           company: 'Anker' },
  { name: 'Daniella Meurke',      firstName: 'Daniella',  email: 'daniella.meurke@axelarigato.com', company: 'Axel Arigato' },
  { name: 'Tom Prior',            firstName: 'Tom',       email: 'tom.prior@axelarigato.com',       company: 'Axel Arigato' },
  { name: 'Sophie Winter',        firstName: 'Sophie',    email: 'sophie.winter@giorgioarmani.co.uk', company: 'Giorgio Armani' },
  { name: 'Tuma Basa',            firstName: 'Tuma',      email: 'tumabasa@google.com',             company: 'Google' },
  { name: 'Brian Pridgeon',       firstName: 'Brian',     email: 'brian.pridgeon@sandisk.com',      company: 'SanDisk' },
  { name: 'Joel Davis',           firstName: 'Joel',      email: 'joel.davis@sandisk.com',          company: 'SanDisk' },
  { name: 'Heidi Arkinstall',     firstName: 'Heidi',     email: 'heidi.arkinstall@sandisk.com',    company: 'SanDisk' },
  { name: 'Gemma Floyd',          firstName: 'Gemma',     email: 'gemma.floyd@washingtonpost.com',  company: 'Washington Post' },
  { name: 'Johanna Mayer-Jones',  firstName: 'Johanna',   email: 'johanna.mayer-jones@washingtonpost.com', company: 'Washington Post' },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const batch = process.env.BATCH || 'A';
  const multiContact = loadMultiContactEmails();

  console.log(`Loading Batch ${batch}...`);
  console.log(`Multi-contact exclusion list: ${multiContact.size} emails`);

  let contacts: Contact[];
  let fromAddress: string;
  let fromName: string;
  let subject: string;
  let getBody: (c: Contact) => string;
  let senderTitle: string;

  switch (batch) {
    case 'A':
      contacts = batchA;
      fromAddress = 'access@indvstryclvb.com';
      fromName = 'George Guise';
      senderTitle = 'Founder, Indvstry Clvb';
      subject = 'Following up — Indvstry Power House x Cannes Lions 2026';
      getBody = (c) => templateGeorgeTier1(c.firstName);
      break;
    case 'B':
      contacts = batchB;
      fromAddress = 'access@indvstryclvb.com';
      fromName = 'Amber Jacobs';
      senderTitle = 'Community Manager, Indvstry Clvb';
      subject = 'Following up — Indvstry Power House x Cannes Lions 2026';
      getBody = (c) => templateAmberPartnership(c.company);
      break;
    case 'C':
      contacts = batchC;
      fromAddress = 'access@indvstryclvb.com';
      fromName = 'Amber Jacobs';
      senderTitle = 'Community Manager, Indvstry Clvb';
      subject = 'Following up — Indvstry Power House x Cannes Lions 2026';
      getBody = (c) => templateAmberMusic(c.firstName, c.company);
      break;
    case 'D':
      contacts = batchD;
      fromAddress = 'access@indvstryclvb.com';
      fromName = 'Amber Jacobs';
      senderTitle = 'Community Manager, Indvstry Clvb';
      subject = 'Following up — Indvstry Power House x Cannes Lions 2026';
      getBody = (c) => templateAmberFashion(c.firstName, c.company);
      break;
    case 'E':
      contacts = batchE;
      fromAddress = 'access@indvstryclvb.com';
      fromName = 'Amber Jacobs';
      senderTitle = 'Community Manager, Indvstry Clvb';
      subject = 'Following up — Indvstry Power House villa residency at Cannes Lions 2026';
      getBody = (c) => templateAmberResidency(c.firstName);
      break;
    default:
      console.error(`Unknown batch: ${batch}. Use A, B, C, D, or E.`);
      process.exit(1);
  }

  // Apply exclusions
  const clean = contacts.filter(c => {
    if (isExcluded(c.email, multiContact)) {
      console.log(`  EXCLUDED: ${c.name} <${c.email}>`);
      return false;
    }
    return true;
  });

  console.log(`\nBatch ${batch}: ${contacts.length} total, ${clean.length} after exclusions\n`);

  if (clean.length === 0) {
    console.log('Nothing to send.');
    return;
  }

  const token = await getToken();
  let sent = 0;
  let bounced = 0;
  const bouncedList: string[] = [];

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    const body = getBody(c);
    const html = buildHtmlWithFooter(body, fromName, senderTitle);
    const result = await sendEmail(token, c.email, c.name, subject, html, fromAddress, fromName);

    if (result === 'sent') {
      console.log(`[${i + 1}/${clean.length}] Sent to ${c.name} <${c.email}>`);
      sent++;
    } else {
      console.log(`[${i + 1}/${clean.length}] BOUNCE: ${c.name} <${c.email}>`);
      logBounce(c.email, c.name, batch, 'send failed');
      bouncedList.push(`${c.name} <${c.email}>`);
      bounced++;
    }

    // Small delay to avoid throttling
    if (i < clean.length - 1) await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nBatch ${batch} done. ${sent} sent, ${bounced} bounced.`);
  if (bouncedList.length > 0) {
    console.log(`\nBounced (logged to ${BOUNCE_LOG}):`);
    bouncedList.forEach(b => console.log(`  ${b}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err?.response?.data?.error?.message || err.message);
  process.exit(1);
});
