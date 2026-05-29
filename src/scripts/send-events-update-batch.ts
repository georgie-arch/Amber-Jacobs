import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const AMBER = { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' };

// Spotify is not yet publicly announced — framed as exclusive early access
// DEPT is newly announced
// Diaspora Dinner some already know about

const emails = [

  // ── RAY SANG ─────────────────────────────────────────────────────────────
  {
    to: 'ray@spokenformanagement.com',
    subject: 'Cannes Lions — Two New Activations + Early Access to Register',
    from: AMBER,
    body: `Hi Ray,

Hope you are well! Just wanted to make sure you and Jenny are across everything we have going on at Cannes this week — we have two new activations to share, one of which is not yet publicly announced so you are getting early access.

Here is the full lineup:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive activation at Spotify Beach. A live podcast recording and virtual panel focused on creators, culture, music, media, and breaking through gatekeeping in the digital era. We are keeping this one close to the chest until next week's announcement — but you can register now before it goes live publicly.
Register here: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
Just announced. In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era — very relevant for both of your worlds.
Sign up here: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. Limited seats at €100 general admission.
Reserve your spot: https://lu.ma/5vmr7s6f

Please do share these with Jenny too — would love to have you both there.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── FRANCESCA MURRAY ─────────────────────────────────────────────────────
  {
    to: 'francesca@onegirl-oneworld.com',
    subject: 'Cannes Update — New Activations + Early Access',
    from: AMBER,
    body: `Hi Francesca,

Just a quick update to make sure you have the full picture of what we are doing at Cannes. We have two activations to share — one of which is not yet publicly announced, so you are getting early access to register.

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. A live podcast recording and virtual panel on creators, culture, music, media, and breaking through gatekeeping in the digital era. Going public next week — but you can grab your spot now.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
Just announced. In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Intimate three-course sunset dinner for founders, creatives and industry builders. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Hope to see you at all three!

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── MERYL BLAU ───────────────────────────────────────────────────────────
  {
    to: 'mblau@miami.edu',
    subject: 'Cannes Lions — Events for You + Your Students',
    from: AMBER,
    body: `Hi Meryl,

So excited to have you and your cohort coming to Cannes! We wanted to make sure you and your 18 students are across everything we have lined up during the week — including two activations, one of which is not yet publicly announced so you are among the first to hear about it.

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. A live podcast recording and virtual panel on creators, culture, music, media, and breaking through gatekeeping in the digital era. This is going public next week — but you and your students can register now before the announcement goes live.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
Just announced — in partnership with DEPT® Agency at their Secret Garden. Brands, creators and culture innovators on building authentic trust in the AI era. A brilliant session for students to sit in on.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening. Three-course dinner at sunset for founders, creatives and industry builders. €100 general admission, spaces are limited.
RSVP: https://lu.ma/5vmr7s6f

Please do feel free to share these with your students — the more the merrier.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── HANNAH CAMPBELL / AMA HILL ───────────────────────────────────────────
  {
    to: 'hannah@onetwelveagency.com',
    subject: 'Cannes Lions — Events for Ama + Early Access to Register',
    from: AMBER,
    body: `Hi Hannah,

Thank you so much for reaching out about Ama — she sounds like a brilliant fit for our world and we would love to have her in the room.

We wanted to make sure you and Ama are across everything we have going on at Cannes this week. We have two activations to share, one of which is not yet publicly announced so you are getting early access.

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. A live podcast recording and virtual panel focused on creators, culture, music, media, and breaking through gatekeeping in the digital era. This goes public next week — but Ama can register now before the announcement.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
Just announced. In partnership with DEPT® Agency at their Secret Garden. A conversation on how brands build authentic trust in the AI era — right in Ama's world.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Would love to see Ama at all three. Do pass these along to her!

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

];

async function main() {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    process.stdout.write(`Sending to ${email.to}... `);
    const sent = await sendEmail(
      email.to,
      email.subject,
      email.body,
      email.from.fromAddress,
      email.from
    );
    if (sent) {
      console.log('✅');
      success++;
    } else {
      console.log('❌ FAILED');
      failed++;
    }
  }

  console.log(`\nDone. ${success} sent, ${failed} failed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
