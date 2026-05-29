import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'bookings@elmgmtgroup.com',
    'Re: Future Voices Panel — Indvstry Power House',
    `Hi Elayna,

No worries at all — totally understand. Let's stay in touch and make sure we connect on the ground!

Looking forward to meeting you in Cannes.

George Guise
Founder, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Elayna' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
