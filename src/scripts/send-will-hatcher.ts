import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const FROM_NAME = 'Amber Jacobs';
const FROM_ADDRESS = 'access@indvstryclvb.com';

async function main() {
  const to = 'willonius@gmail.com';
  const subject = 'Re: Cannes Lions Panel — Indvstry Power House';
  const body = `Hi Will,

I have to be honest with you — I am a massive fan. BBL Drizzy is an absolute banger. I still remember when it dropped and the moment it took off. The way it cut through culture so fast, got Drake himself referencing it, and sparked that whole conversation around AI and creative authorship... that was a genuinely historic moment. The fact that I am typing to someone Drake and the greats have put on their radar is not lost on me at all.

TIME 100, AdAge Power Tech, 500k monthly Spotify listeners doing comedy music — your profile is extraordinary and the intersection of humour, film and AI storytelling is exactly the kind of voice we want in our world.

On the panel front, our speaker programme is fully booked for this year, but you are absolutely top of our list the moment anything opens up. We will be in touch.

In the meantime, we would love to have you at our Cannes week events and would really love to link up in person:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era — right up your alley.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. A culturally grounded three-course dinner at sunset for founders, creatives and industry builders. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Our founder George Guise would genuinely love to connect with you in Cannes. He is someone who deeply respects what you have built and I know a conversation between you two would be worth having.

Hope to see you there, Will.

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
