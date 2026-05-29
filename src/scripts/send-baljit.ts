import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const FROM_NAME = 'Amber Jacobs';
const FROM_ADDRESS = 'access@indvstryclvb.com';

async function main() {
  const to = 'bal@the-remarkables.com';
  const subject = 'Re: Kerry — Indvstry Power House, Cannes';
  const body = `Hi Bal,

Thank you for following up. I really appreciate your patience, and Kerry sounds like a strong profile.

Unfortunately we have now filled our speaker programme for the week and don't have any remaining slots. It was a tough call given the quality of people who came forward. We will absolutely keep Kerry on our radar for future programming and will be in touch as soon as anything opens up.

In the meantime, we would love to have you both across our Cannes week activations:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
A live podcast recording and virtual panel streamed from Spotify Beach, focused on creators, culture, music, media, and breaking through gatekeeping in the digital era. Featuring Silvastone, Justin Diego, Jodie Taylor, and Justtt Juiceee, moderated by Dinalva Tavares.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. A conversation with leaders from Doosan Bobcat, Black Girl Digital, top creators and culture innovators on building authentic brand trust in the AI era.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. An intentional, culturally grounded three-course dinner at sunset for founders, creatives and industry builders from the diaspora. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Hope to see you there, Bal.

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
    console.error(`❌ Failed to send to ${to}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
