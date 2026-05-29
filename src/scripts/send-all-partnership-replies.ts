import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const AMBER = { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' };
const GEORGE = { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' };

const emails = [

  // ── DANNY SINGH — Greater London Authority ──────────────────────────────
  {
    to: 'danny.singh@london.gov.uk',
    subject: 'RE: Partnership Opportunity – Indvstry Exchange',
    from: GEORGE,
    body: `Hi Danny,

Thanks for coming back to me, and apologies for any lack of clarity in the original message.

Indvstry Clvb is a digital private members club for creative professionals — think founders, CMOs, agency leaders, and culture builders. The Indvstry Exchange is our community platform where members connect, collaborate, and access opportunities across the creative and cultural industries.

What I had in mind was exploring a partnership between what we are building and Black on the Square — specifically around audience crossover, shared programming or co-branded activations. The two communities feel genuinely complementary and I think there is a real conversation worth having.

Would you be open to a quick call to explore further? Happy to work around your schedule.

George Guise
Founder, Indvstry Clvb`,
  },

  // ── NOAH WASHINGTON — Fanbase ───────────────────────────────────────────
  {
    to: 'noah.washington@fanbase.app',
    subject: 'Re: Following up on our offer',
    from: GEORGE,
    body: `Hi Noah,

Just circling back on this — wanted to check in and see if you had a chance to land on a decision. No pressure either way, just keen to keep the conversation moving before Cannes.

Let me know where things stand when you get a moment.

George Guise
Founder, Indvstry Clvb`,
  },

  // ── ADA COLLECTIVE / KELLY ──────────────────────────────────────────────
  {
    to: 'adacollective300@gmail.com',
    subject: 'Re: Power House updates + an exciting opportunity',
    from: AMBER,
    body: `Hi Kelly,

Great question — happy to clarify.

When we talk about brand collaborations at Power House, we mean opportunities for brands and collectives to have a visible, meaningful presence during Cannes Lions week. That could look like co-hosting one of our panels, being featured as a partner at the Diaspora Dinner, activating within the villa space, or being spotlighted to our network of founders, CMOs, and creative leaders who are all in the room.

It is less about traditional sponsorship and more about authentic integration — putting the right brands and voices in front of the right people in a setting that actually generates real relationships.

Would it be helpful to jump on a quick call so I can walk you through the options in more detail? Happy to find a time that works.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── CHANELLE PAL ────────────────────────────────────────────────────────
  {
    to: 'hello@chanstudio.co',
    subject: 'Re: Everything that comes with Indvstry Power House at Cannes Lions 2026',
    from: AMBER,
    body: `Hi Chanelle,

Love the energy — COUNT ME IN is exactly what we like to hear!

We will be in touch shortly with all the details for the podcast collaboration and your involvement in the week. In the meantime, if you have not already sorted your villa accommodation, you can secure your room here: https://lu.ma/t4ek2yn7 — rooms start at £1,500 and include your official delegate pass (worth €5,000), daily transport to La Croisette and full access to our event calendar.

We also have a few key activations during the week we would love to have you at:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording from Spotify Beach on creators, culture and breaking through gatekeeping.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
DEPT® Secret Garden. AI era brand trust with top creators and culture leaders.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Intimate sunset dinner for founders, creatives and industry builders. €100 general admission.
RSVP: https://lu.ma/5vmr7s6f

More to follow very soon. So glad you are in!

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── ROMY GAMA ───────────────────────────────────────────────────────────
  {
    to: 'romydegama@gmail.com',
    subject: 'Re: Power House updates + an exciting opportunity',
    from: AMBER,
    body: `Hi Romy,

So glad to hear this resonated — and yes, we can absolutely look at updating your pass to the Creator Pass. I will flag that with the team and come back to you to confirm.

On the podcast: we would love to have you involved. The episode will be recorded live from Spotify Beach on Monday 22 June — the event is called Dear Gatekeeper and it is focused on creators, culture, music and breaking through gatekeeping in the digital era. You can register here to secure your spot: https://powerhouse.indvstryclvb.com/spotify

We also have two other activations during the week we would love to see you at:

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. Three-course dinner at sunset. €100 general admission.
RSVP: https://lu.ma/5vmr7s6f

Send over any ideas you have for the podcast — we are very open to collaboration. More details coming your way soon.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── JONELLE AWOMOYI ─────────────────────────────────────────────────────
  {
    to: 'hello@jonelleawomoyi.com',
    subject: 'Re: Following up — Indvstry Power House, Cannes Lions 2026',
    from: AMBER,
    body: `Hi Jonelle,

Wonderful to hear from you, and please do pass our warmest regards right back!

The timing sounds perfect — being there from the 21st through to the 26th puts you right in the heart of everything. And the ERG press programme sounds like a brilliant complementary thread to what we are building.

We would love to have you across our activations during the week:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording and virtual panel from Spotify Beach. Creators, culture, music and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. Authentic brand trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. A culturally grounded three-course dinner at sunset for founders, creatives and industry builders. €100 general admission, spaces are limited.
RSVP: https://lu.ma/5vmr7s6f

Would also love to explore how you can be more actively involved in the week beyond attending. Let's find a moment to connect — happy to jump on a quick call if that helps.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── KRISTINA CORNIEL ────────────────────────────────────────────────────
  {
    to: 'cornielkbc@gmail.com',
    subject: 'Re: Indvstry Power House Speaker Interest',
    from: AMBER,
    body: `Hi Kristina,

Thank you so much for reaching out. 815k across Instagram and TikTok with brand partnerships including Airbnb, Apple and Google? That is a seriously impressive portfolio, and the travel and creator economy lens is right in our world.

I have to be honest with you: our speaker programme is now fully booked for the week. It was a very competitive shortlist and there were more brilliant voices than we had slots for. You are absolutely on our radar and if anything opens up you will be the first we contact.

In the meantime, we would love to have you at our Cannes week activations:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording from Spotify Beach on creators, culture, music and breaking through gatekeeping in the digital era.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
DEPT® Secret Garden. A conversation on authentic brand trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Intimate three-course sunset dinner for founders, creatives and industry builders. €100 general admission.
RSVP: https://lu.ma/5vmr7s6f

Hope to see you there, Kristina.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── LAURA ROMANIN (via Josh EA) ─────────────────────────────────────────
  {
    to: 'laromanin@icloud.com',
    subject: 'Re: Spotify Beach Cannes Speaker — Laura Romanin',
    from: AMBER,
    body: `Hi Josh,

Thank you for sending Laura's details across — the recommerce and vintage space is a genuinely interesting angle and the work on The Looped In Edit sounds great.

I do have to be upfront: our speaker programme for the week is now fully booked. It was an incredibly competitive process and we had more strong profiles than we had slots for. Laura is firmly on our radar and we will be in touch as soon as anything opens up for future programming.

In the meantime, we would love to have Laura at our Cannes week events:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording from Spotify Beach on creators, culture, music and breaking through gatekeeping.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
DEPT® Secret Garden. Authentic brand trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Intimate sunset dinner for founders, creatives and industry builders. €100 general admission.
RSVP: https://lu.ma/5vmr7s6f

Hope to see her there.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── JESSICA JOSEPH / CHARLOTTE MAIR ────────────────────────────────────
  {
    to: 'jessica@season25.com',
    subject: 'Re: Charlotte Mair — Cannes 2026',
    from: AMBER,
    body: `Hi Jessica,

Thank you for the introduction — Charlotte's background sounds genuinely compelling. Building a successful agency and then leading in the creator B2B space is a trajectory a lot of people in our community respect and relate to.

I do have to be straightforward with you: our speaker slots are now fully booked for the week. It was a very competitive field and we received a huge number of strong applications. Charlotte is absolutely someone we want to keep in our world and we will be in touch when new opportunities come up.

In the meantime, we would love for Charlotte to join us at our Cannes activations:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Live podcast recording from Spotify Beach on creators, culture, music and breaking through gatekeeping.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
DEPT® Secret Garden. Authentic brand trust in the AI era — a great room for someone in Charlotte's space.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Intimate sunset dinner for founders, creatives and industry builders. €100 general admission.
RSVP: https://lu.ma/5vmr7s6f

Hope to see you both there.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── MERYL BLAU — Univ. Miami + Mia Rafowitz (Droga5) ───────────────────
  {
    to: 'mblau@miami.edu',
    subject: 'Re: A private space at Cannes — speakers and founders in the room',
    from: GEORGE,
    body: `Hi Meryl,

Absolutely — Mia is more than welcome. The Creative Director of Droga5 is exactly the kind of person we want in that room.

Please have her RSVP here and we will hold a seat for her: https://lu.ma/5vmr7s6f

Looking forward to having you both there.

George Guise
Founder, Indvstry Clvb`,
  },

  // ── LORIE ACIO — Lede Company ───────────────────────────────────────────
  {
    to: 'lorie.acio@ledecompany.com',
    subject: 'Re: Cannes x Lede Clients',
    from: AMBER,
    body: `Hi Lorie,

Thank you for checking in. Whenever your clients confirm their availability, the dinner RSVP link is here: https://lu.ma/5vmr7s6f — spaces are limited so the sooner the better.

On speaking opportunities: we will absolutely keep you posted. The programme is full for this year but you will be the first to know when we open up programming for future events.

Looking forward to it!

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
