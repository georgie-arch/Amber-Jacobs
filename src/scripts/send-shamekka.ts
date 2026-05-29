import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const FROM_NAME = 'Amber Jacobs';
const FROM_ADDRESS = 'access@indvstryclvb.com';

async function main() {
  const to = 'shamekka@shamekkamarty.com';
  const subject = 'Re: Speaker Interest — Indvstry Power House, Cannes';
  const body = `Hi Shamekka,

Thank you so much for reaching out. Your work is genuinely powerful. The intersection of health advocacy, creator storytelling, chronic illness representation, and sports is not something many people are doing at the level you are. Beyond the Game Health sounds like an incredible platform, and the fact that you have built 97K+ followers around such a purposeful and underrepresented space speaks volumes.

I have to be honest with you though: we have now filled our speaker programme for the week. It was a very competitive shortlist and we received a lot of strong applications. You are absolutely on our radar and if anything opens up you will be the first we call.

In the meantime, we would love to have you at our Cannes week activations:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era — your lived experience angle would add a lot to the room.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. A culturally grounded three-course dinner at sunset for founders, creatives and industry builders. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Looking forward to seeing you there, Shamekka.

Amber Jacobs
Community Manager, Indvstry Clvb`;

  console.log(`Sending to ${to}...`);
  const sent = await sendEmail(to, subject, body, FROM_ADDRESS, {
    fromName: FROM_NAME,
    fromAddress: FROM_ADDRESS,
  });
  if (sent) {
    console.log(`✅ Sent to ${to}`);
  } else {
    console.error(`❌ Failed`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
