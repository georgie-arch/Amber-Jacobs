/**
 * Residency interest reminder — leads from interest form export (2026-05-23)
 * Angle: Cannes is close, villa room still available, announcement video live on IG,
 *        first activation confirmed (DEPT Agency panel talk), book a call with George
 * From: Amber Jacobs <amber@indvstryclvb.com>
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-residency-interest-reminder.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailFrom } from '../integrations/email';

const FROM_ADDRESS = 'amber@indvstryclvb.com';
const FROM_NAME    = 'Amber Jacobs';

const LEADS: { name: string; email: string }[] = [
  { name: 'Nene',     email: 'nene@vinecreatives.com' },
  { name: 'Ramatu',   email: 'rkandakai@gmail.com' },
  { name: 'Katie',    email: 'kdean@realchemistry.com' },
  { name: 'Arieth',   email: 'info@arethestudio.com' },
  { name: 'Charlene', email: 'charlene.cabral@uk.telehouse.net' },
  { name: 'Rodrigo',  email: 'rodrigo.casas@vml.com' },
  { name: 'Santosh',  email: 'santosh.meruguuk@gmail.com' },
  { name: 'Shanice',  email: 'shaniceallen15@yahoo.co.uk' },
  { name: 'Skylyn',   email: 'skylynjapolinar@gmail.com' },
  { name: 'Silas',    email: 'silas@poduca.co.uk' },
  { name: 'Shelley',  email: 'shelley@caribbeing.com' },
  { name: 'Sydney',   email: 'sydney.michelledesigns@gmail.com' },
];

function buildEmail(firstName: string): { subject: string; body: string } {
  const subject = 'Cannes is 4 weeks away. We still have a room for you.';

  const body = `Hi ${firstName},

Cannes Lions is almost here and things are really coming together on our end.

I wanted to reach out because you expressed interest in the Indvstry Power House residency earlier this year, and we still have a room available. I did not want you to miss it.

A couple of things worth knowing right now:

We just dropped our official announcement video on Instagram. It gives you a real feel for what we are building this year and who is already coming with us. Go and have a look:
https://www.instagram.com/indvstryclvb/

And we have just confirmed our first activation. We are hosting a panel talk in partnership with DEPT Agency during the festival week. It is going to be one of those rooms where the real conversations happen. Residents will be right there in the middle of it.

If you want to be part of this, the villa is where it all starts. Here is what your residency includes:

A curated villa base just minutes from La Croisette, June 21 to 26
A delegate pass worth up to £5,000 included in your stay
Done-for-you event RSVPs across the week
A house full of creative founders, directors and brand leaders
The DEPT Agency panel talk and our villa closing activation on June 25

Spots are limited and we are close to full. If you are still figuring out your Cannes plans, now is the time to sort it.

Book a room here:
https://lu.ma/t4ek2yn7

Or if you want to talk it through with George first, grab 30 minutes here:
https://calendly.com/itsvisionnaire/30min

Would love to have you with us.

Amber Jacobs
Community Manager, Indvstry Clvb`;

  return { subject, body };
}

async function main() {
  console.log(`Sending residency reminder to ${LEADS.length} leads from ${FROM_ADDRESS}...`);
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
