import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const AMBER = { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' };

async function main() {
  const sent = await sendEmail(
    'hello@brittanylashae.com',
    'Congratulations! Your Cannes Lions Pass + A Few Things We Need',
    `Hi Brittany,

Congratulations! You have won a delegate pass to Cannes Lions 2026 and we are so excited to have you there. This is going to be an incredible week and you are going to love it.

A few things we need to sort before we get you all set up.

One — Young Lions eligibility.
Cannes Lions offers a Young Lions pass for delegates who are 30 years old or under on the final day of the festival. The festival runs 22-26 June 2026, so the eligibility cutoff is: born on or after 26 June 1995.

If you were born on or after that date, you qualify for the Young Lions pass. If you were born before that date, we will get you set up with a standard delegate pass instead. Both get you full access, so either way you are sorted. Just let us know your date of birth and we will confirm which one applies to you.

Two — Are you confirmed to attend?
We want to make sure everything is in place on your end. Have you secured your flights yet? Please do confirm as soon as possible so we can get your registration moving.

Three — Delegate pass form.
We will be adding you to our backend and the Cannes Lions team will take care of the rest, but we need the following information to fill out your form:

Full legal name (as it appears on your passport)
Date of birth
Nationality
Job title
Company or organisation name
Email address
Phone number
Passport number and expiry date
A professional headshot (passport-style, clear background)

Please reply with all of the above as soon as you can and we will get everything submitted for you.

And while you are at it, here are three activations we have going on during the week that you can RSVP to now:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. A live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Three-course dinner at sunset for founders, creatives and industry builders. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Congratulations again, Brittany. Get that information over to us and let's get you locked in!

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    AMBER
  );

  console.log(sent ? '✅ Sent to Brittany La Shae' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
