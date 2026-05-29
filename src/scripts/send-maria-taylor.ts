import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'maria@wearecreativemedia.org',
    'Re: Cannes — Indvstry Power House Update',
    `Hi Maria,

Hope you are well and things are coming together on your end as we get closer!

Things are looking really exciting from our side. We are still in active conversations with potential sponsors around a dedicated panel at our own villa, so that piece is moving in the right direction. More to share on that soon.

On the LinkedIn and Netflix conversations — did you ever hear back from them? We would love to know if there is an opportunity to host something at either of their spaces. If they are open to it we would be more than happy to collaborate and bring our community into it. Across all of our Cannes activations we already have around 300 sign-ups, so we have a real, engaged audience that will show up for anything additional we announce. That kind of reach should be a compelling case for any brand partner.

On the people you had in mind for the cohort — the only remaining route of entry at the villa is a room. That is the last mode of access we have available and we would love to have the right people in the house. Here are the details:

Indvstry Power House — Private Villa Residency
Dates: 21-26 June 2026 (Cannes Lions activities run 22-26 June)
Rooms from £1,500 — includes your official Cannes delegate pass (worth €5,000), private room in a 7-bedroom luxury villa, private pool, daily transport to La Croisette, curated event calendar and RSVPs, Diaspora Dinner ticket, closing party access and networking app credentials. Only 7 spots and very limited availability remaining.
Book here: https://lu.ma/t4ek2yn7

We also have three open activations during the week we would love to see you and your people at:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording and virtual panel from Spotify Beach. Creators, culture, music and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Let me know where things stand and let's make sure we are fully aligned before we get on the ground.

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Maria Taylor' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
