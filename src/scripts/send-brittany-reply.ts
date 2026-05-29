import dotenv from 'dotenv';
dotenv.config();

import { sendEmailViaGraph } from '../integrations/email';

const body = `Hi Brittany,

Thank you so much for reaching out, and for the warm intro from Tiffany. Really appreciate you taking the time.

Your background is genuinely impressive. The pay gap study with MSL is exactly the kind of work that moves real conversations forward, and Gage sounds like an exciting build. The creator economy has needed something like that for a long time.

I have to be honest with you though: our speaker programme for the Power House is full. We locked the lineup a few weeks back and I would not want to make a promise we cannot deliver on.

That said, we would love for you to experience the week with us. We have three events happening at Cannes that would be a great fit for you and the conversations you are in:

Dear Gatekeeper
Monday 22 June, 10am
Spotify Beach
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture
Wednesday 24 June, 3pm - 3:45pm
DEPT Secret Garden
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner
Tuesday 23 June, 6pm - 9pm
Register: https://lu.ma/5vmr7s6f

Please come along to any or all of them. These are the conversations that matter, and the room will be full of exactly the kind of people you should be in the same space with.

We will absolutely keep you on our radar for future programming. The work you are doing at the intersection of creator equity and AI is right in our lane.

Looking forward to hopefully crossing paths in Cannes.`;

(async () => {
  const ok = await sendEmailViaGraph(
    'brittany@theinfluencerleague.com',
    'Re: Speaking at Indvstry Power House, Cannes Lions 2026',
    body,
    { fromName: 'Amber Jacobs', fromAddress: process.env.EMAIL_USER || 'access@indvstryclvb.com' }
  );
  if (ok) {
    console.log('Email sent to Brittany Bright.');
  } else {
    console.error('Send failed — check logs above.');
    process.exit(1);
  }
})();
