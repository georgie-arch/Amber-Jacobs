import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'nathan@worldwidenate.com',
    'Re: Speaker Interest — Indvstry Power House, Cannes',
    `Hi Nathan,

Thank you so much for reaching out, and thank you to Gayle for the introduction.

I have to say — 85 countries across all 7 continents, multiple Amazon Prime series, and being the founder of the largest gathering of Black surfers in the world? That is an extraordinary body of work and exactly the kind of culturally grounded, globally minded storytelling our community is built around.

I do have to be honest with you though: our speaker slots are now fully booked for the week. It was an incredibly competitive shortlist and there were far more brilliant voices than we had space for. You are absolutely on file and you will be the first we reach out to when new programming opens up — your perspective on travel media, authentic audience building and culturally driven experiences is something we genuinely want in our world.

In the meantime, we would love to have you at our Cannes week activations:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. A culturally grounded three-course dinner at sunset for founders, creatives and industry builders from the diaspora. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Hope to see you there, Nathan.

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Nathan' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
