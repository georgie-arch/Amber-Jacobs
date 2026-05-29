import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const AMBER = { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' };

const emails = [

  // ── MARNI EDELHART (Rachel Tipograph / MikMak) ─────────────────────────────
  {
    to: 'marnina@mikmak.com',
    subject: "Re: Rachel Tipograph — The Companies in the Room",
    body: `Hi Marni,

Thanks for following up! Totally understand, Rachel needs to know the room is worth her time and we want to make sure this is the right fit from both sides.

Here is a snapshot of who is confirmed to be at the table: American Express (SVP, Digital Media), Doosan Bobcat (CMO), beehiiv (CEO), Black Girl Digital (Founder/CEO), Ebiquity (Group CEO), Omnicom (Managing Director), Publisher Collective (CEO), and a strong cross-section of senior brand and agency leaders across the Cannes ecosystem. We also have 300+ sign-ups across our activations for the week, so there is a very real, engaged audience around everything we are building.

Let us know if that gives Rachel what she needs to make a call. We would love to have her in the room.

And separately, here are three activations we have going on during the week that are open to you and the MikMak team:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. Live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Three-course dinner at sunset for founders, creatives and industry builders. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

And whatever happens with this panel, we are keeping Rachel on our list for future programming. Would love to have her in our world in a bigger way going forward.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── LORIE ACIO (Alice Ma + Karla Martin / The Lede Company) ───────────────
  {
    to: 'lorie.acio@ledecompany.com',
    subject: "Re: Alice Ma + Karla Martin — On the List",
    body: `Hi Lorie,

Thank you for sharing, both Alice and Karla are genuinely impressive and very much the kind of voices we want in our world.

Our speaker slots are full for this Cannes cycle but I have added both of them to our programming roster and they will be on our radar when new panels come together. The combination of Alice's creator economy lens and Karla's AI safety and digital equity work is a really compelling pairing and I can already see how they could anchor something powerful.

In the meantime, here are three open activations during Cannes week we would love to have Alice, Karla and yourself at:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. Live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Three-course dinner at sunset for founders, creatives and industry builders. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Would love to see you all there!

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── JOANNE BRENNER (Responsible Marketing Advisory) ───────────────────────
  {
    to: 'jo@responsiblem.com',
    subject: "Re: Cannes Lions Speakers — Would Love to Hear More",
    body: `Hi Jo,

Thank you for reaching out! We would love to hear more about your attendees. Do send across their names and a short bio or LinkedIn for each and we will have a proper look.

We are full on programming for this Cannes cycle but we are always building out our roster for future panels and opportunities, and it sounds like your team have exactly the kind of embedded, real-world brand expertise we are looking for. Worth staying in the loop for sure.

In the meantime, here are three open activations during Cannes week that are open to you and your team:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. Live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Three-course dinner at sunset for founders, creatives and industry builders. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Would love to have you all along.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

];

async function main() {
  let success = 0;
  let failed  = 0;

  for (const email of emails) {
    process.stdout.write(`Sending to ${email.to}... `);
    const sent = await sendEmail(
      email.to,
      email.subject,
      email.body,
      'access@indvstryclvb.com',
      AMBER
    );
    if (sent) { console.log('✅'); success++; }
    else       { console.log('❌ FAILED'); failed++; }
  }

  console.log(`\nDone. ${success} sent, ${failed} failed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
