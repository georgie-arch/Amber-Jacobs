import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const FROM_NAME = 'Amber Jacobs';
const FROM_ADDRESS = 'access@indvstryclvb.com';

async function main() {
  const to = 'sydney.michelledesigns@gmail.com';
  const subject = 'Re: Raffle Competition — Indvstry Power House';
  const body = `Hi Sydney,

Great to hear from you, and yes the raffle is absolutely still open!

Here is the correct link: https://luma.com/38me384c

We would love to hear your pitch. Sydney Michelle and Today's M.I.L.F both sound like brilliant fits for what we are building, so please do not hesitate to submit.

Looking forward to seeing what you bring!

Amber Jacobs
Community Manager, Indvstry Clvb`;

  console.log(`Sending to ${to}...`);
  const sent = await sendEmail(to, subject, body, FROM_ADDRESS, {
    fromName: FROM_NAME,
    fromAddress: FROM_ADDRESS,
  });

  if (sent) {
    console.log(`✅ Sent to ${to}`);
  } else {
    console.error(`❌ Failed to send to ${to}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
