/**
 * Villa residency follow-up — all leads from the interest form
 * Angle: brands finalising Cannes plans, only 2 rooms left, Spotify + TikTok activation incoming
 * From: Amber Jacobs <amber@indvstryclvb.com>
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-villa-leads-followup.ts
 * Scheduled: 9am BST 6 May 2026 via macOS `at`
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailFrom } from '../integrations/email';

const FROM_ADDRESS = 'amber@indvstryclvb.com';
const FROM_NAME    = 'Amber Jacobs';

const LEADS: { name: string; email: string }[] = [
  { name: 'Venus',     email: 'venusashu1@gmail.com' },
  { name: 'Frank',     email: 'frankskully@hotmail.com' },
  { name: 'LaToya',    email: 'latoyaharding89@gmail.com' },
  { name: 'Sabina',    email: 'sabina.jasinska25@gmail.com' },
  { name: 'Anais',     email: 'Anais603@gmail.com' },
  { name: 'Melissa',   email: 'Letswork@macomedia.co.uk' },
  { name: 'Tola',      email: 'tola.m@hotmail.com' },
  { name: 'Gilda',     email: 'gildavallem@gmail.com' },
  { name: 'Cassy',     email: 'Hello@cassyisabella.com' },
  { name: 'Nico',      email: 'Nicorose92@icloud.com' },
  { name: 'Daisy',     email: 'daisy@dave.sports' },
  { name: 'Isabel',    email: 'isabel.lamers@gmail.com' },
  { name: 'Sabrina',   email: 'sfearonmelville@gmail.com' },
  { name: 'Ashley',    email: 'abrooks@michelemariepr.com' },
  { name: 'Karen',     email: 'karen-grillo@hotmail.co.uk' },
  { name: 'Naomi',     email: 'niluyomade@gmail.com' },
  { name: 'Marian',    email: 'marianjsreynolds@gmail.com' },
  { name: 'Katie',     email: 'klangers@hotmail.com' },
  { name: 'Angela',    email: 'angelanjerik@gmail.com' },
  { name: 'Anwar',     email: 'anwarhossenfilmmaker@gmail.com' },
  { name: 'Elizabeth', email: 'Elizabeth@bunastreetcollective.com' },
  { name: 'Wesley',    email: 'enquiriesmrw9ine@gmail.com' },
  { name: 'Elizabeth', email: 'E.ogunkoya@hotmail.com' },
  { name: 'Jonathan',  email: 'jonathanmbenga1@hotmail.com' },
  { name: 'Christina', email: 'christinangoyi@gmail.com' },
  { name: 'James',     email: 'James@urbansyndicate.co.uk' },
  { name: 'Aileen',    email: 'aileen.phan1996@gmail.com' },
  { name: 'Dinesh',    email: 'dineshj@ndtv.com' },
  { name: 'Martha',    email: 'info@everydaymolo.com' },
  { name: 'Eliana',    email: 'eclopesdasilva@gmail.com' },
  { name: 'Tamika',    email: 'Hello@culture-deluxe.com' },
  { name: 'Bonnae',    email: 'Bonnaeogunlade@omc.com' },
  { name: 'Shireen',   email: 'crowninggreatnesscic@gmail.com' },
  { name: 'Betul',     email: 'betulsusamis@gmail.com' },
  { name: 'Sherkera',  email: 'Sherkerawilson@yahoo.com' },
  { name: 'Ingrid',    email: 'ingrid@kensingtongrey.co' },
  { name: 'Tia',       email: 'tiakaycee12@gmail.com' },
  { name: 'Charlotte', email: 'charlotte@stylecartel.com' },
  { name: 'Ro',        email: 'rolaurren@gmail.com' },
  { name: 'Maria',     email: 'maria@wearecreativemedia.org' },
  { name: 'Anam',      email: 'anam@thehanginghouse.com' },
  { name: 'Musa',      email: 'msahmad0015@gmail.com' },
  { name: 'Jim',       email: 'Jim@iqzone.com' },
];

function buildEmail(firstName: string): { subject: string; body: string } {
  const subject = 'Cannes is coming together fast. Two rooms left.';

  const body = `Hi ${firstName},

Hope you're doing well.

Brands and agencies are locking in their plans for Cannes Lions right now, and I wanted to reach out before the last two spots at Indvstry Power House are gone.

You showed interest earlier and we have been holding off on these final rooms while things came together. A couple of exciting things worth knowing about:

We are about to go live with a brand collaboration activation in partnership with Spotify and TikTok during the festival. Residents will be right at the centre of it.

And as a reminder, here is what the stay includes:

A £5,000 delegate pass included in your residency
A curated programme of exclusive events across the week
A villa full of creative founders, directors and brand leaders
A brilliant base just minutes from La Croisette

Everyone needs somewhere great to stay in Cannes. We would love it to be with us, surrounded by interesting people doing creative things.

If you have not spoken with George yet, you can book a quick call here:
https://calendly.com/itsvisionnaire/30min

Or take a look at the full residency deck:
https://canva.link/56bgbawj3ctalgu

These last two spots will go quickly. Now is the time to sort it.

Amber`;

  return { subject, body };
}

async function main() {
  console.log(`Sending villa follow-up to ${LEADS.length} leads from ${FROM_ADDRESS}...`);
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
