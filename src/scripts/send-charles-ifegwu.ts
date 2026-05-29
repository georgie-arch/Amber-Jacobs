import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'charles@itsconvergence.com',
    'Re: Speaker Slot — Indvstry Power House, Cannes',
    `Hi Charles,

Thank you for reaching out and for thinking of us.

I do have to let you know that the slot has now been filled — we moved quickly on it and the programme for the week is fully booked.

That said, please do send over the names of who you have in mind. We have another panel in the pipeline and if the right fit is there we would absolutely want to consider them. The more we know about their profile, following and areas of expertise the better.

In the meantime, we have a strong lineup of activations during Cannes week that are still open:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. A culturally grounded three-course dinner at sunset for founders, creatives and industry builders from the diaspora. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Looking forward to hearing who you have in mind, Charles.

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Charles' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
