import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

async function main() {
  const sent = await sendEmail(
    'jessica@vanillacooldance.com',
    'Re: Speaker Interest — Indvstry Power House, Cannes',
    `Hi Jessica,

Thank you so much for reaching out, and a big thank you to Estefanía for the introduction.

What you have built with Vanillacooldance is genuinely impressive. Breaking taboos around sexuality, intimacy and identity through cartoons and disruptive storytelling, growing a 90k+ global community while navigating platform censorship, and being named bCreator's Sex and Relationships Creator of the Year? That is a powerful and necessary voice.

I have to be honest with you though: our speaker programme is now fully booked for the week. It was a very competitive shortlist and we had more brilliant people come forward than we had slots for. You are absolutely on our radar and if anything opens up you will be the first we contact.

In the meantime, we would love to have you at our Cannes week activations:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. A culturally grounded three-course dinner at sunset for founders, creatives and industry builders. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Hope to see you there, Jessica.

Amber Jacobs
Community Manager, Indvstry Clvb`,
    'access@indvstryclvb.com',
    { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' }
  );

  console.log(sent ? '✅ Sent to Jessica' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
