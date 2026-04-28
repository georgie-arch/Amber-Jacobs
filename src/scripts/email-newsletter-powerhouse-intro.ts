/**
 * email-newsletter-powerhouse-intro.ts
 *
 * First contact email to 157 Indvstry Power House newsletter subscribers.
 * Excludes: previously emailed, typo addresses, system addresses.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-newsletter-powerhouse-intro.ts
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

function buildBody(): string {
  return `Hi,

You signed up to hear more about Indvstry Power House. Here is what it looks like.

We have a private 7-bedroom villa in Cannes for the full week of Cannes Lions 2026 (21–26 June). It is not a hotel. It is not a fringe venue for hire. It is a proper residential base with everything sorted so you can focus entirely on the week.

<strong>What is included:</strong>

<ul style="margin:12px 0;padding-left:20px;line-height:2;">
  <li>Accommodation in a private villa (21–26 June)</li>
  <li>A Cannes Lions delegate pass worth over £5,000</li>
  <li>Daily private shuttle to and from La Croisette</li>
  <li>Access to shared lounge, meeting spaces and content facilities on site</li>
  <li>A curated network of creative professionals, founders and brand leaders in the house</li>
  <li><strong>Done-for-you fringe event RSVPs</strong> — there are over 2,500 events happening that week. We register you for the best ones free of charge so you do not have to spend hours working through the schedule yourself</li>
</ul>

If you are going to Cannes, you need somewhere to stay, you need a pass, and you need to get to the Palais without losing an hour each way. Indvstry Power House handles all of that, and makes sure you do not miss the sessions worth attending while you are there.

Spots are priced from £1,500 to £2,500 depending on room. There are 7 spots total. A few are already taken.

<a href="https://canva.link/56bgbawj3ctalgu" style="color:#1a1a1a;font-weight:bold;">View the full resident's deck</a>

<a href="https://lu.ma/t4ek2yn7" style="color:#1a1a1a;font-weight:bold;">Secure your spot</a>

We are also hosting a private <strong>Diaspora Dinner</strong> on Tuesday 23rd June during the week — 30 guests, private villa, no agenda, no pitches. Just the right people in the same room.

<a href="https://lu.ma/5vmr7s6f" style="color:#1a1a1a;font-weight:bold;">Reserve your seat at the dinner</a>

If you would like to talk through either before committing, George (our founder) is happy to jump on a quick call.

<a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;font-weight:bold;">Book a call with George</a>

Happy to answer any questions.`;
}

function wrap(body: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${body.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body>
</html>`;
}

const SKIP = new Set([
  'sherkerawilson@yahoo.com',    // previously emailed
  'jonathanmbenga1@hotmail.com', // previously emailed
  'officialmstmari@gmail.con',   // typo domain
  'pvm@linkedin.com',            // system/non-person address
]);

const emails = [
  'disguiseme@hotmail.com',
  'jay@ceek.com',
  'jacqueokaka46@gmail.com',
  'hello@chanstudio.co',
  'shanice@kallure.co.uk',
  'bukunmi_eni@yahoo.com',
  'paulanzamb@gmail.com',
  'darrenkombe@icloid.com',
  'sda@dunmomi.com',
  'sophie@wordonthecurb.co.uk',
  'monicacavasino@gmail.com',
  'savannah-adams@live.co.uk',
  'christinaminshull@thebrandaudit.uk',
  'emmahvengaard@gmail.com',
  'chamwillock@gmail.com',
  'jowong@whoisjowong.co.uk',
  'cincio85@gmail.com',
  'eleanor.thornton-firkin@ipsos.com',
  'tariqwest19@gmail.com',
  'hello@brittanylashae.com',
  'abeglover@outlook.com',
  'che.wheatley@ft.com',
  'lorraine@lorrainewright.co.uk',
  'marie@glowconsultancy.london',
  'mis.eventz@live.co.uk',
  'pritesh@pritspr.com',
  'mario.pican2023@stud.umfcd.ro',
  'michael_glover@live.co.uk',
  'sys659@hotmail.com',
  'ayeshataylorcamara@gmail.com',
  'lyndakungu@gmail.com',
  'tamay@w2smarketing.com',
  'divinekatolo6@gmail.com',
  'charleneanncabral@gmail.com',
  'lilianchesh@gmail.com',
  'terrykangwana@gmail.com',
  'njericynthia01@gmail.com',
  'bayle@puravidallc.org',
  'eliana@audion.fm',
  'valentina.carcione@esn.it',
  'dbeglinton@gmail.com',
  'chris_cordelluk@hotmail.com',
  'officiallymalek@gmail.com',
  'rabea.akkas@gmail.com',
  'malachifagan@outlook.com',
  'daisy@dave.sport',
  'ren.kainth@fenestra.io',
  'chrissiedeor@gmail.com',
  'tashaklondon@gmail.com',
  'rebecca.pnwoodley@gmail.com',
  'nicolettealexandrabritocruz@gmail.com',
  'fabriciolisboa0@outlool.com',
  'katrinaappie@yahoo.com',
  'nanakinqg@gmail.com',
  'barbara@brownstone.co.uk',
  'lynne.egwuekwe@gmail.com',
  'momanyiofficial@gmail.com',
  'jha.nishant@hotmail.com',
  'nkeirukaw@gmail.com',
  'deebrownee@outlook.com',
  'thembisa@caspianfilms.net',
  'jost.maximilian@yahoo.de',
  'dwayman0182@gmail.com',
  'lizaforeman@gmail.com',
  'irenemoncada5@gmail.com',
  'michellebrondum@gmail.com',
  'fiona.e.mcbean@gmail.com',
  'tenilleclarke1@gmail.com',
  'giovannamaddalena@masinafilm.com',
  'rebecca.darcy-howard@lexical-llama.com',
  'york-fabianraabe@gmx.de',
  'robin.miller@axum.earth',
  'panayiota@gmail.com',
  'adrienne@atrium-pr.com',
  'tr@intertwinedagency.com',
  'jacqueline.shaw@gmail.com',
  'aprilpricemarketing@gmail.com',
  'tendai.pottinger@hotmail.com',
  'nadia@ohsoconnected.com',
  'sunnlys.studio@gmail.com',
  'rosieferdincruz@gmail.com',
  'breakingnewsarabia@gmail.com',
  'sagalabdullahi1@gmail.com',
  'aishascotland100@icloud.com',
  'natalie@liquidviolet.co.uk',
  'noor@thedigitalvoice.co.uk',
  'confidentlyyou111@gmail.com',
  'tracykintu@gmail.com',
  'leanne@alieent.com',
  'carol.akinye@gmail.com',
  'trishwilliams16@aol.com',
  'jeff@extrategicculture.com',
  'diana@extrategicculture.com',
  'liliupcopy@gmail.com',
  'hoss@hope-advisory.com',
  'satumaru@gmail.com',
  'shiikane@gmail.com',
  'terri_martin@hotmail.co.uk',
  'anietieudoh101@gmail.com',
  'khieracornwall@gmail.com',
  'd.biancuzzi@gmail.com',
  'kristie.g@exf.studio',
  'lana@alert.hr',
  'stefanie@themarketeergroup.com',
  'sonstiges098@gmail.com',
  'info@jessicavrogers.co.uk',
  'hello@densalazar.co.uk',
  'officialmstmari@gmail.com',
  'hassynain@gmail.com',
  'lilyannx78@gmail.com',
  'martad.producion@gmail.com',
  'shriosai.sidheswar@gmail.com',
  'johanne@ampupyourvoice.com',
  'pboyle@dstillery.com',
  'riannerowe@gmail.com',
  'andreea.pr.beauty@gmail.com',
  'jphfarber@gmail.com',
  'ashley.makuh@crossmedia.com',
  'estefania.lopez.col@gmail.com',
  'info@arethestudio.com',
  'jj@foundationhopi.com',
  'mcastro@ddbcentro.com',
  'jean-marc@viber.com',
  'hagamos@xlgrandesideas.com',
  'gmkk21@gmail.com',
  'richajain022@gmail.com',
  'maddiebasso@hotmail.com',
  'gabe@gabbcon.com',
  'timmsstephen@hotmail.com',
  'daisy@dace.sport',
  'catherine.byrne@cunninghamcontracts.com',
  'twanna@leagueofindustrymoms.com',
  'carmengperez@yahoo.com',
  'ali_sayadizadeh@hotmail.co.uk',
  'hazel.broadley@lexical-llama.com',
  'krispykarni@gmail.com',
  'muriel@movingcraft.com',
  'mmcgoldrick@pharosiq.com',
  'ashley@lumapartners.com',
  'iam@branoberes.com',
  'pl@makesense.dk',
  'stephen.maher@thegateworldwide.com',
  'cindy@helmutmacagency.com',
  'management.joymngodo@gmail.com',
  'jawauna@jmillette.com',
  'valerie@batrice.com',
  'dinah@avenirnetwork.com',
  'kwproductionss1@gmail.com',
  'rilewis.enterprises@gmail.com',
  'andy.dougan@paradise.london',
  'montanajacobowitzbiz@gmail.com',
  'nishma@glittersphere.com',
  'mabikae@aol.com',
  'ian@sqreem.com',
  'marcus@wearegoldenisle.com',
  'jenna.inganamort@sportbeach',
  'minvest6@gmail.com',
].filter(e => !SKIP.has(e.toLowerCase()));

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  const html    = wrap(buildBody());
  let sent = 0;

  console.log(`Sending to ${emails.length} newsletter subscribers...\n`);

  for (const email of emails) {
    try {
      const message: any = {
        subject: 'Everything that comes with Indvstry Power House at Cannes Lions 2026',
        body: { contentType: 'HTML', content: html },
        toRecipients: [{ emailAddress: { address: email } }],
        from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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

      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      sent++;
      console.log(`[${sent}/${emails.length}] Sent to ${email}`);
    } catch (err: any) {
      console.error(`FAILED: ${email} — ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(res => setTimeout(res, 800));
  }

  console.log(`\nDone. ${sent}/${emails.length} emails sent.`);
}

sendAll().catch(console.error);
