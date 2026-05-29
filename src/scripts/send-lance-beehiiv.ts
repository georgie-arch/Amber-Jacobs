import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'lance@beehiiv.com',
    'Re: Cannes — Indvstry Power House',
    `Hi Lance,

Really great speaking with you — appreciate you jumping on a call so quickly.

I wanted to come back to you directly and clear something up. I apologise for any confusion around the huddles — I hadn't fully aligned with the team on whether those were going ahead, and it sounds like Amber may have mentioned them before we had fully confirmed the format. That is on me.

Where we have landed is that the Diaspora Dinner on Tuesday 23 June is our main flagship moment of the week. It is an intimate sit-down dinner for some of the most interesting people at the festival — founders, brand leaders, creators and builders. What makes it different from a typical networking dinner is that every attendee gets a 3-minute slot to address the room and share what they are working on. So it is structured enough to be genuinely useful but relaxed enough to feel like a real conversation. That is where the best connections are going to happen.

I would love for Jake to be in that room. He can RSVP here: https://lu.ma/5vmr7s6f

We also have two panels during the week that are well worth attending:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording and virtual panel from Spotify Beach, focused on creators, culture, music and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. Brands, creators and culture innovators on building authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

I am personally looking forward to connecting with you and Jake on the ground in Cannes. I think there is a real conversation to be had.

Speak soon,

George Guise
Founder, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Lance at beehiiv' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
