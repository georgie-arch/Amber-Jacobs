import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const GEORGE = { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' };

async function main() {
  const sent = await sendEmail(
    'matt.tuffuor@eventbrite.com',
    'Re: Cannes Lions — Yes, Let\'s Make It Happen',
    `Hey Matt,

Yes, absolutely let's make it happen. I would love to have a couple of Eventbrite people on the ground experiencing everything firsthand.

Slots across our activations are limited but I can personally make sure they get approved so that is not something to worry about. Just get me the names when you are ready and I will handle it from my side.

Here is what we have lined up during the week:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Spotify Beach. Live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Three-course dinner at sunset for founders, creatives and industry builders. €100, limited seats.
RSVP: https://lu.ma/5vmr7s6f

One more thing, if the team end up wanting official Cannes delegate passes we do have a limited number available as part of a package. I cannot guarantee they will still be there if the decision takes a while, so worth flagging it now while there is still something to offer. Just let me know and we can put something together.

Excited to have Eventbrite in the room. Let's do this.

George Guise
Founder, Indvstry Clvb`,
    'access@indvstryclvb.com',
    GEORGE
  );

  console.log(sent ? '✅ Sent to Matt at Eventbrite' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
