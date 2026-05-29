/**
 * Newsletter list — Cannes Lions 7-week check-in
 * Ask if they have base sorted, share WhatsApp group + Diaspora Dinner
 * From: Amber Jacobs <amber@indvstryclvb.com>
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-newsletter-cannes-checkin.ts
 * Scheduled: 9am BST 6 May 2026 via macOS `at`
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailFrom } from '../integrations/email';

const FROM_ADDRESS = 'amber@indvstryclvb.com';
const FROM_NAME    = 'Amber Jacobs';

const LEADS: { name: string; email: string }[] = [
  { name: 'there',      email: 'disguiseme@hotmail.com' },
  { name: 'Jay',        email: 'jay@ceek.com' },
  { name: 'there',      email: 'jacqueokaka46@gmail.com' },
  { name: 'there',      email: 'hello@chanstudio.co' },
  { name: 'Shanice',    email: 'shanice@kallure.co.uk' },
  { name: 'Bukunmi',    email: 'bukunmi_eni@yahoo.com' },
  { name: 'there',      email: 'paulanzamb@gmail.com' },
  { name: 'there',      email: 'darrenkombe@icloid.com' },
  { name: 'there',      email: 'sda@dunmomi.com' },
  { name: 'Sophie',     email: 'sophie@wordonthecurb.co.uk' },
  { name: 'Monica',     email: 'monicacavasino@gmail.com' },
  { name: 'Savannah',   email: 'savannah-adams@live.co.uk' },
  { name: 'Christina',  email: 'christinaminshull@thebrandaudit.uk' },
  { name: 'Emma',       email: 'emmahvengaard@gmail.com' },
  { name: 'there',      email: 'chamwillock@gmail.com' },
  { name: 'there',      email: 'jowong@whoisjowong.co.uk' },
  { name: 'there',      email: 'cincio85@gmail.com' },
  { name: 'Eleanor',    email: 'eleanor.thornton-firkin@ipsos.com' },
  { name: 'Tariq',      email: 'tariqwest19@gmail.com' },
  { name: 'Brittany',   email: 'hello@brittanylashae.com' },
  { name: 'there',      email: 'abeglover@outlook.com' },
  { name: 'Che',        email: 'che.wheatley@ft.com' },
  { name: 'Lorraine',   email: 'lorraine@lorrainewright.co.uk' },
  { name: 'Marie',      email: 'marie@glowconsultancy.london' },
  { name: 'there',      email: 'mis.eventz@live.co.uk' },
  { name: 'Pritesh',    email: 'pritesh@pritspr.com' },
  { name: 'Mario',      email: 'mario.pican2023@stud.umfcd.ro' },
  { name: 'Michael',    email: 'michael_glover@live.co.uk' },
  { name: 'there',      email: 'sys659@hotmail.com' },
  { name: 'Ayesha',     email: 'ayeshataylorcamara@gmail.com' },
  { name: 'Lynda',      email: 'lyndakungu@gmail.com' },
  { name: 'Tamay',      email: 'tamay@w2smarketing.com' },
  { name: 'Divine',     email: 'divinekatolo6@gmail.com' },
  { name: 'Charlene',   email: 'charleneanncabral@gmail.com' },
  { name: 'Lilian',     email: 'lilianchesh@gmail.com' },
  { name: 'Terry',      email: 'terrykangwana@gmail.com' },
  { name: 'Njeri',      email: 'njericynthia01@gmail.com' },
  { name: 'there',      email: 'bayle@puravidallc.org' },
  { name: 'Eliana',     email: 'eliana@audion.fm' },
  { name: 'Valentina',  email: 'valentina.carcione@esn.it' },
  { name: 'there',      email: 'dbeglinton@gmail.com' },
  { name: 'Chris',      email: 'chris_cordelluk@hotmail.com' },
  { name: 'there',      email: 'officiallymalek@gmail.com' },
  { name: 'Rabea',      email: 'rabea.akkas@gmail.com' },
  { name: 'Malachi',    email: 'malachifagan@outlook.com' },
  { name: 'Daisy',      email: 'daisy@dave.sport' },
  { name: 'Ren',        email: 'ren.kainth@fenestra.io' },
  { name: 'Chrissie',   email: 'chrissiedeor@gmail.com' },
  { name: 'Tasha',      email: 'tashaklondon@gmail.com' },
  { name: 'Rebecca',    email: 'rebecca.pnwoodley@gmail.com' },
  { name: 'Nicolette',  email: 'nicolettealexandrabritocruz@gmail.com' },
  { name: 'Fabricio',   email: 'fabriciolisboa0@outlool.com' },
  { name: 'Katrina',    email: 'katrinaappie@yahoo.com' },
  { name: 'there',      email: 'nanakinqg@gmail.com' },
  { name: 'Barbara',    email: 'barbara@brownstone.co.uk' },
  { name: 'Lynne',      email: 'lynne.egwuekwe@gmail.com' },
  { name: 'there',      email: 'momanyiofficial@gmail.com' },
  { name: 'Nishant',    email: 'jha.nishant@hotmail.com' },
  { name: 'there',      email: 'nkeirukaw@gmail.com' },
  { name: 'there',      email: 'deebrownee@outlook.com' },
  { name: 'Thembisa',   email: 'thembisa@caspianfilms.net' },
  { name: 'Jost',       email: 'jost.maximilian@yahoo.de' },
  { name: 'there',      email: 'dwayman0182@gmail.com' },
  { name: 'Liza',       email: 'lizaforeman@gmail.com' },
  { name: 'Irene',      email: 'irenemoncada5@gmail.com' },
  { name: 'Michelle',   email: 'michellebrondum@gmail.com' },
  { name: 'Fiona',      email: 'fiona.e.mcbean@gmail.com' },
  { name: 'Tenille',    email: 'tenilleclarke1@gmail.com' },
  { name: 'Giovanna',   email: 'giovannamaddalena@masinafilm.com' },
  { name: 'Rebecca',    email: 'rebecca.darcy-howard@lexical-llama.com' },
  { name: 'York',       email: 'york-fabianraabe@gmx.de' },
  { name: 'Robin',      email: 'robin.miller@axum.earth' },
  { name: 'Sherkera',   email: 'sherkerawilson@yahoo.com' },
  { name: 'there',      email: 'panayiota@gmail.com' },
  { name: 'Adrienne',   email: 'adrienne@atrium-pr.com' },
  { name: 'there',      email: 'tr@intertwinedagency.com' },
  { name: 'Jacqueline', email: 'jacqueline.shaw@gmail.com' },
  { name: 'April',      email: 'aprilpricemarketing@gmail.com' },
  { name: 'Tendai',     email: 'tendai.pottinger@hotmail.com' },
  { name: 'Nadia',      email: 'nadia@ohsoconnected.com' },
  { name: 'there',      email: 'sunnlys.studio@gmail.com' },
  { name: 'Rosie',      email: 'rosieferdincruz@gmail.com' },
  { name: 'there',      email: 'breakingnewsarabia@gmail.com' },
  { name: 'Sagal',      email: 'sagalabdullahi1@gmail.com' },
  { name: 'Aisha',      email: 'aishascotland100@icloud.com' },
  { name: 'Natalie',    email: 'natalie@liquidviolet.co.uk' },
  { name: 'Noor',       email: 'noor@thedigitalvoice.co.uk' },
  { name: 'there',      email: 'confidentlyyou111@gmail.com' },
  { name: 'Tracy',      email: 'tracykintu@gmail.com' },
  { name: 'Leanne',     email: 'leanne@alieent.com' },
  { name: 'Carol',      email: 'carol.akinye@gmail.com' },
  { name: 'Trish',      email: 'trishwilliams16@aol.com' },
  { name: 'Jeff',       email: 'jeff@extrategicculture.com' },
  { name: 'Diana',      email: 'diana@extrategicculture.com' },
  { name: 'there',      email: 'liliupcopy@gmail.com' },
  { name: 'there',      email: 'hoss@hope-advisory.com' },
  { name: 'there',      email: 'satumaru@gmail.com' },
  { name: 'there',      email: 'shiikane@gmail.com' },
  { name: 'Terri',      email: 'terri_martin@hotmail.co.uk' },
  { name: 'there',      email: 'anietieudoh101@gmail.com' },
  { name: 'there',      email: 'khieracornwall@gmail.com' },
  { name: 'there',      email: 'd.biancuzzi@gmail.com' },
  { name: 'Kristie',    email: 'kristie.g@exf.studio' },
  { name: 'Lana',       email: 'lana@alert.hr' },
  { name: 'Stefanie',   email: 'stefanie@themarketeergroup.com' },
  { name: 'there',      email: 'sonstiges098@gmail.com' },
  { name: 'Jessica',    email: 'info@jessicavrogers.co.uk' },
  { name: 'there',      email: 'hello@densalazar.co.uk' },
  { name: 'there',      email: 'officialmstmari@gmail.com' },
  { name: 'there',      email: 'hassynain@gmail.com' },
  { name: 'Lily',       email: 'lilyannx78@gmail.com' },
  { name: 'Marta',      email: 'martad.producion@gmail.com' },
  { name: 'there',      email: 'shriosai.sidheswar@gmail.com' },
  { name: 'Johanne',    email: 'johanne@ampupyourvoice.com' },
  { name: 'there',      email: 'pboyle@dstillery.com' },
  { name: 'Rianne',     email: 'riannerowe@gmail.com' },
  { name: 'Andreea',    email: 'andreea.pr.beauty@gmail.com' },
  { name: 'there',      email: 'jphfarber@gmail.com' },
  { name: 'Ashley',     email: 'ashley.makuh@crossmedia.com' },
  { name: 'Estefania',  email: 'estefania.lopez.col@gmail.com' },
  { name: 'there',      email: 'info@arethestudio.com' },
  { name: 'there',      email: 'jj@foundationhopi.com' },
  { name: 'there',      email: 'mcastro@ddbcentro.com' },
  { name: 'Jean',       email: 'jean-marc@viber.com' },
  { name: 'there',      email: 'hagamos@xlgrandesideas.com' },
  { name: 'there',      email: 'gmkk21@gmail.com' },
  { name: 'Richa',      email: 'richajain022@gmail.com' },
  { name: 'Maddie',     email: 'maddiebasso@hotmail.com' },
  { name: 'Gabe',       email: 'gabe@gabbcon.com' },
  { name: 'there',      email: 'pvm@linkedin.com' },
  { name: 'there',      email: 'timmsstephen@hotmail.com' },
  { name: 'Daisy',      email: 'daisy@dace.sport' },
  { name: 'there',      email: 'officialmstmari@gmail.con' },
  { name: 'Catherine',  email: 'catherine.byrne@cunninghamcontracts.com' },
  { name: 'Twanna',     email: 'twanna@leagueofindustrymoms.com' },
  { name: 'Carmen',     email: 'carmengperez@yahoo.com' },
  { name: 'Ali',        email: 'ali_sayadizadeh@hotmail.co.uk' },
  { name: 'Hazel',      email: 'hazel.broadley@lexical-llama.com' },
  { name: 'there',      email: 'krispykarni@gmail.com' },
  { name: 'Muriel',     email: 'muriel@movingcraft.com' },
  { name: 'there',      email: 'mmcgoldrick@pharosiq.com' },
  { name: 'Ashley',     email: 'ashley@lumapartners.com' },
  { name: 'Jonathan',   email: 'jonathanmbenga1@hotmail.com' },
  { name: 'there',      email: 'iam@branoberes.com' },
  { name: 'there',      email: 'pl@makesense.dk' },
  { name: 'Stephen',    email: 'stephen.maher@thegateworldwide.com' },
  { name: 'Cindy',      email: 'cindy@helmutmacagency.com' },
  { name: 'Joy',        email: 'management.joymngodo@gmail.com' },
  { name: 'Jawauna',    email: 'jawauna@jmillette.com' },
  { name: 'Valerie',    email: 'valerie@batrice.com' },
  { name: 'Dinah',      email: 'dinah@avenirnetwork.com' },
  { name: 'there',      email: 'kwproductionss1@gmail.com' },
  { name: 'there',      email: 'rilewis.enterprises@gmail.com' },
  { name: 'Andy',       email: 'andy.dougan@paradise.london' },
  { name: 'there',      email: 'montanajacobowitzbiz@gmail.com' },
  { name: 'Nishma',     email: 'nishma@glittersphere.com' },
  { name: 'there',      email: 'mabikae@aol.com' },
  { name: 'Ian',        email: 'ian@sqreem.com' },
  { name: 'Marcus',     email: 'marcus@wearegoldenisle.com' },
  { name: 'Jenna',      email: 'jenna.inganamort@sportbeach' },
  { name: 'there',      email: 'minvest6@gmail.com' },
  { name: 'Justin',     email: 'justy3n3@gmail.com' },
  { name: 'Samina',     email: 'saminamughaltd@gmail.com' },
  { name: 'there',      email: 'contact@queensunlimitedinc.com' },
  { name: 'Sydney',     email: 'sydney.michelledesigns@gmail.com' },
  { name: 'Sonia',      email: 'soniabendjaffer@protonmail.ch' },
  { name: 'Anwar',      email: 'anwarhossenfilmmaker@gmail.com' },
  { name: 'there',      email: 'sprabhunaik@gmail.com' },
  { name: 'Richard',    email: 'richard.davis@51tocarbonzero.com' },
  { name: 'there',      email: 'vegaschips@msn.com' },
  { name: 'there',      email: 'tmwatts29@gmail.com' },
  { name: 'Leslie',     email: 'hello@lesliekwan.com' },
  { name: 'there',      email: 'karmaproent@gmail.com' },
  { name: 'there',      email: 'r.bernardstevenson@hotmail.co.uk' },
  { name: 'there',      email: 'lmye.info@gmail.com' },
  { name: 'Rebecca',    email: 'rebecca@gsdstudio.co' },
  { name: 'Takara',     email: 'b.takara@outlook.com' },
  { name: 'Freya',      email: 'freyaselassie@gmail.com' },
  { name: 'there',      email: 'kdean@realchemistry.com' },
  { name: 'Autumn',     email: 'autumn@kglfwd.com' },
  { name: 'Leila',      email: 'fisherleila@icloud.com' },
  { name: 'Kim',        email: 'kim.allain@pitch.co.uk' },
];

function buildEmail(firstName: string): { subject: string; body: string } {
  const subject = 'Cannes Lions is 7 weeks away. Have you sorted your base?';

  const body = `Hi ${firstName},

Quick one from me at Indvstry Clvb.

Cannes Lions is just 7 weeks away and I wanted to check in. Have you sorted where you are staying?

If not, we have two rooms left at Indvstry Power House, our curated villa residency running 21 to 26 June on the Riviera. It is a beautiful space with a great group of creative founders and brand leaders. You can take a look here: https://canva.link/56bgbawj3ctalgu

We also have a WhatsApp group you can join now to stay up to speed with everything happening around Cannes Lions this year, events, activations, meetups and more. Tap to join: https://chat.whatsapp.com/KVaeMkXsnsd0bQhGHCNdhB

One thing worth putting on your radar now: we have a dinner event at Cannes on 23 June that you can secure your spot at today. It is an intimate dinner designed to get you on a power table with the right people. Secure your seat before it fills up: https://luma.com/5vmr7s6f

If you have any questions or want to know more about any of it, just reply here. Happy to help.

Amber`;

  return { subject, body };
}

async function main() {
  console.log(`Sending Cannes check-in to ${LEADS.length} newsletter subscribers from ${FROM_ADDRESS}...`);
  console.log();

  let sent = 0;
  let failed = 0;

  for (const lead of LEADS) {
    const { subject, body } = buildEmail(lead.name);
    const ok = await sendEmailFrom(lead.email, subject, body, FROM_ADDRESS, FROM_NAME);
    if (ok) {
      console.log(`  Sent    -> ${lead.name} <${lead.email}>`);
      sent++;
    } else {
      console.error(`  FAILED  -> ${lead.name} <${lead.email}>`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log();
  console.log(`Done. Sent: ${sent} / ${LEADS.length}. Failed: ${failed}.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
