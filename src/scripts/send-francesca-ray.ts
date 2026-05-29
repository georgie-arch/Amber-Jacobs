import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const FROM_NAME = 'Amber Jacobs';
const FROM_ADDRESS = 'access@indvstryclvb.com';

const emails = [
  {
    to: 'francesca@onegirl-oneworld.com',
    subject: 'Re: Speaker Slot at Indvstry Power House, Cannes',
    body: `Hi Francesca,

Thank you so much for reaching out, and for the kind words. Your work sounds incredible. Covering Cannes independently from a creator POV, and then turning that into a 60-page guide? That is exactly the kind of initiative we love to see.

On the speaking slot, we don't have any open positions at this stage, but you are absolutely on our radar. If anything opens up for creator-focused programming, you will be the first to know.

In the meantime, we would love to have you across our Cannes week activations:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era. Featuring Silvastone, Justin Diego, Jodie Taylor, and Justtt Juiceee, moderated by Dinalva Tavares.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation with leaders from Doosan Bobcat, Black Girl Digital, top creators and culture innovators on building authentic brand trust in the AI era.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. An intentional, culturally grounded three-course dinner at sunset for founders, creatives and industry builders from the diaspora. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Also, if you know anyone in your network who would benefit from a fully immersive Cannes experience, we still have a handful of spots left at the Indvstry Power House villa. It includes an official delegate pass (worth €5,000), daily transport to La Croisette, curated event access, and a private room in a luxury 7-bedroom villa. Rooms from £1,500. Only 7 spots in total, so very limited.
Details here: https://lu.ma/t4ek2yn7

Would love to see you there, Francesca.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },
  {
    to: 'ray@spokenformanagement.com',
    subject: 'Re: Cannes Speaker Consideration — Indvstry Power House',
    body: `Hi Ray,

Thank you again for sharing these profiles. Your work at the intersection of SEO, AEO, and creator-led brand trust is exactly the space we are focused on, and Jenny's clinical and neurodiverse lens on sustainable performance is genuinely rare. The industry talks a lot about burnout but very few people bring a psychiatric occupational therapist's perspective to the room.

I wanted to come back to you honestly: we have now filled our speaker programme for the week and don't have any remaining slots. But both you and Jenny are firmly on our radar for future programming and we will be in touch as soon as anything opens up.

What we do have is a strong lineup of events during Cannes week, and we would love to have you both there:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era. Featuring Silvastone, Justin Diego, Jodie Taylor, and Justtt Juiceee, moderated by Dinalva Tavares.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. Bringing together leaders from Doosan Bobcat, Black Girl Digital, top creators and culture innovators to discuss how brands build authentic trust in the AI era.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. An intentional, culturally grounded three-course dinner at sunset for founders, creatives and industry builders from the diaspora. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

We also have a handful of spots remaining at the Indvstry Power House villa. If anyone in your network is looking for a fully immersive Cannes base, it includes an official delegate pass (worth €5,000), daily transport to La Croisette, curated event access, and a private room in a luxury 7-bedroom villa. Rooms from £1,500. Only 7 spots total.
Details here: https://lu.ma/t4ek2yn7

Hope to see you both out there, Ray.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },
];

async function main() {
  for (const email of emails) {
    console.log(`\nSending to ${email.to}...`);
    const sent = await sendEmail(
      email.to,
      email.subject,
      email.body,
      FROM_ADDRESS,
      { fromName: FROM_NAME, fromAddress: FROM_ADDRESS }
    );
    if (sent) {
      console.log(`✅ Sent to ${email.to}`);
    } else {
      console.error(`❌ Failed to send to ${email.to}`);
      process.exit(1);
    }
  }
  console.log('\nAll done.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
