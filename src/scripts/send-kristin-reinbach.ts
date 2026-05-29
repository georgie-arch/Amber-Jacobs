import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const GEORGE = { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' };

async function main() {
  const sent = await sendEmail(
    'reinbach@overw8.de',
    'Re: Cannes — Quick Update + A Couple of Things',
    `Hi Kristin,

Great to hear from you and glad everything is coming together!

On the Thursday call, nothing specific to prep. I just want to make sure we are fully aligned before we get on the ground in Cannes. Looking forward to it.

Wednesday 24th is confirmed. We are really looking forward to having you in that room and will keep you posted as the details come together closer to the week.

On the dinner, no coupon needed from your end. Just head straight to the RSVP link and grab your spot: https://lu.ma/5vmr7s6f. Spaces are limited so worth locking it in sooner rather than later.

Also wanted to share a couple of things worth having on your radar ahead of the week:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. A live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era. Not yet publicly announced, so you are among the first to hear about it.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. Our panel on how brands build authentic trust in the AI era.
Landing page: https://powerhouse.indvstryclvb.com/deptagency

I am genuinely excited about what we can build together at Cannes. As we talked about on the phone, if anything else comes together on the programming side I will come straight to you. In the meantime we are pushing forward on the sponsorship conversations to make sure we have the right backing behind each activation.

See you Thursday and on the ground in Cannes!

George Guise
Founder, Indvstry Clvb`,
    'access@indvstryclvb.com',
    GEORGE
  );

  console.log(sent ? '✅ Sent to Kristin Reinbach' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
