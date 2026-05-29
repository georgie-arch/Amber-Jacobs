import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const AMBER = { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' };

async function main() {
  const sent = await sendEmail(
    'justin@bingeworthyvideo.com',
    'Re: Cannes Lions — You Are Already In, Justin',
    `Hi Justin,

Love what you are doing with Bingeworthy, and yes, you are already on our radar!

Just to confirm, you are already locked in as a speaker for Dear Gatekeeper at Spotify Beach on Monday 22 June. Here is the landing page for the event where you can register and share with your audience: https://powerhouse.indvstryclvb.com/spotify

One thing, if you have any updated photos you would like us to use for promotional materials around the event, send them over and we will swap them in. No rush but sooner is better as we start pushing things out.

Also, I sent you all the details about joining Indvstry Clvb over on WhatsApp. Give that a read when you get a chance and feel free to hit me back on there with any questions.

Here is everything else we have going on at Cannes that is open to you:

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

And one more thing. We have one room remaining at our private villa for the week. Since you already have your Creator Pass sorted, we can make this work for you at £1,599, room only. It includes a private room in a 7-bedroom luxury villa with a pool, daily transport to La Croisette, curated event calendar, Diaspora Dinner access and closing party credentials. Just say the word and we will send over a promo code to get you booked in.
Villa details: https://lu.ma/t4ek2yn7

Let us know if you have any questions and we will see you in Cannes!

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    AMBER
  );

  console.log(sent ? '✅ Sent to Justin Diego' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
