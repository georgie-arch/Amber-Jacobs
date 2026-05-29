import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'matt@dncr.com',
    'Re: Speaker Interest — Indvstry Power House, Cannes',
    `Hi Matt,

Thank you for reaching out — and 35M+ across platforms is not a small number. The combination of dance/DJ roots, a social media agency and a creator coaching business is a genuinely interesting stack and exactly the kind of multi-dimensional builder perspective our community is drawn to.

I do have to be upfront with you: the slot that was posted has now been filled. We moved quickly on it and the programme for the week is fully booked.

That said, we have another panel in the pipeline and if the profile fits we would absolutely want to consider you for it. I will keep your details on file and be in touch as soon as we have more to share.

In the meantime, we have a strong lineup of activations during Cannes week that are still open — would love to have you at any or all of these:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. A culturally grounded three-course dinner at sunset for founders, creatives and industry builders. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Hope to see you there, Matt.

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Matt' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
