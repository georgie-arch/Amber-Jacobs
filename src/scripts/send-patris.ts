import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'patrisg@spotify.com',
    'Re: Indvstry Power House x Spotify Beach — Dear Gatekeeper',
    `Hi Patris,

Thanks a million for being so accommodating with the last minute name changes and for sorting out Jodie's email address — really appreciate you making that happen smoothly.

I have now let all the speakers know to look out for the invitation email, so they should be on the lookout.

Quick question on that: is the invitation valid just for the period we will be recording, or does it cover the full day/week at Spotify Beach? Just want to make sure I brief the team and speakers correctly.

Also — and no pressure at all on this one, just leaving no stone unturned — any chance we could get 3 of our team into the concert you are hosting? Completely understand if that is not possible, just thought I would ask!

Thanks again, Patris. Really looking forward to it.

George Guise
Founder, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Patris' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
