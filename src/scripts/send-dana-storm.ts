import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'dsantiago@raptive.com',
    'Re: Diaspora Dinner — Indvstry Power House, Cannes',
    `Hi Dana,

Great to hear you are considering it! To answer your question — the dinner is not on the Croisette itself. The venue is Épi Beach, which is about 7 minutes from Cannes by train and around a 15-minute Uber ride. It is a beautiful beachside setting and honestly the slightly removed location is part of what makes the evening feel special — it is a proper reset from the festival buzz.

Here is what to expect on the night:

The Diaspora Dinner is one night during Cannes Lions week that is intentional, intimate and culturally grounded. It is a three-course dinner at sunset for founders, creatives, CEOs and industry builders from the diaspora community. The atmosphere is laid-back luxury — sun-kissed, sophisticated and very much about real conversation rather than networking for the sake of it. Think 80 of the most interesting people at the festival, all in one room, with no agenda other than to connect meaningfully.

Tickets are €100 and include the full three-course dinner. Spaces are strictly limited so if you are thinking about it, sooner is better.

RSVP here: https://lu.ma/5vmr7s6f

We also have two other activations during the week if you want to make more of your time in Cannes:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording and virtual panel from Spotify Beach. Creators, culture, music and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

And absolutely no pressure on the cancellation front — if anything changes just let us know and we will fill the seat. But do grab it while you can.

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Dana' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
