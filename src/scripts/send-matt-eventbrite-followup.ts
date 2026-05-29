import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'matt.tuffuor@eventbrite.com',
    'Re: Following up — Indvstry Power House, Cannes Lions 2026',
    `Hi Matt,

Following up on this one as Cannes is fast approaching and I want to make sure we have not missed a window.

I know you mentioned no one was planning to attend at the time — has that changed at all? Have you had a chance to check back in with the team?

I just need a yes or a no from your side so I can plan accordingly.

In the meantime, here is what we have going on during the week — all open to attend:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording and virtual panel from Spotify Beach. Creators, culture, music and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Intimate three-course sunset dinner for founders, creatives and industry builders. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Would love to have Eventbrite in the room. Let me know either way.

George Guise
Founder, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Matt at Eventbrite' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
