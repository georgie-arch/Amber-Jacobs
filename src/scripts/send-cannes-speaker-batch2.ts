import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { sendEmail } from '../integrations/email';

const AMBER = { fromName: 'Amber Jacobs', fromAddress: 'access@indvstryclvb.com' };

// ── GRAPH API HELPER (for CC support) ────────────────────────────────────────
async function getOutlookAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

async function sendEmailWithCC(
  to: string,
  ccList: string[],
  subject: string,
  body: string,
  fromName: string,
  fromAddress: string
): Promise<boolean> {
  try {
    const accessToken = await getOutlookAccessToken();
    const message = {
      subject,
      body: { contentType: 'Text', content: body },
      toRecipients: [{ emailAddress: { address: to } }],
      ccRecipients: ccList.map(cc => ({ emailAddress: { address: cc } })),
      from: { emailAddress: { address: fromAddress, name: fromName } }
    };
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
    console.log(`  [Graph API] Sent to ${to} (CC: ${ccList.join(', ')})`);
    return true;
  } catch (error: any) {
    console.error('CC email failed:', error?.response?.data || error.message);
    return false;
  }
}

// ── STANDARD EMAILS ───────────────────────────────────────────────────────────

const emails = [

  // ── KRISTINA CORNIEL ──────────────────────────────────────────────────────
  {
    to: 'cornielkbc@gmail.com',
    subject: 'Cannes Lions — Three Activations Worth Your Time',
    body: `Hi Kristina,

Hope you are well! Wanted to make sure you are across everything we have lined up at Cannes this week, especially since one of them is not yet publicly announced and you are getting early access.

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive activation at Spotify Beach. A live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era. We are keeping this close to the chest until next week, but you can grab your spot now.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
Just announced. In partnership with DEPT® Agency at their Secret Garden. A conversation about how brands build authentic trust in the AI era. Very much in your world.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening of the week. Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. 80 people, €100 general admission.
RSVP: https://lu.ma/5vmr7s6f

Would love to see you at all three.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── LAURA ROMANIN ─────────────────────────────────────────────────────────
  {
    to: 'laromanin@icloud.com',
    subject: 'Cannes Lions — Three Events You Should Know About',
    body: `Hi Laura,

Hope you are well and the Cannes prep is coming together! Wanted to make sure you are across everything we have lined up during the week. Two activations to share, including one that is not yet publicly announced, so you are among the first to hear about it.

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive activation at Spotify Beach. A live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era. Goes public next week, but you can register now.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
Just announced. In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening. Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Would love to have you at all three. Hope to see you in Cannes!

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── JONELLE AWOMOYI ───────────────────────────────────────────────────────
  {
    to: 'hello@jonelleawomoyi.com',
    subject: 'Cannes Lions — A Room at Our Villa + Three Events',
    body: `Hi Jonelle,

Hope you are well! So excited you are making it to Cannes this year.

We have been keeping you on our radar for future speaker opportunities and wanted to reach out ahead of the festival with a couple of things.

We know you already have your delegate pass sorted, which is brilliant. But if you are looking for a base for the week, we have one room remaining in our private villa. It is a 7-bedroom luxury residence just outside Cannes with a private pool, daily transport to La Croisette, all event RSVPs handled, Diaspora Dinner access, closing party credentials and a curated calendar of everything worth being in the room for. It is honestly the best way to experience the week.

The room is the only mode of access we have left at that level, so if it is something you would like to explore, you can book a quick call with our founder George here: https://calendly.com/itsvisionnaire/30min

We would also love to have you at our three open activations during the week:

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive Spotify Beach activation. Live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era. Not yet publicly announced, so you are getting early access to register.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Book a call with George whenever you are ready and let us know if you have any questions.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── TASMIN LOCKWOOD ───────────────────────────────────────────────────────
  {
    to: 'journotas@gmail.com',
    subject: 'Cannes Lions — Our Events This Week',
    body: `Hi Tasmin,

Hope you are well! Just wanted to make sure you are across what we have going on at Cannes this week. Two activations to share, one of which is not yet publicly announced so you are getting early access to register.

Dear Gatekeeper — Monday 22 June, 10:00 AM CEST
Our exclusive activation at Spotify Beach. A live podcast recording and virtual panel on creators, culture, music, media and breaking through gatekeeping in the digital era. Goes public next week, but you can secure your spot now.
Register: https://powerhouse.indvstryclvb.com/spotify

The Algorithm Doesn't Know Your Culture — Wednesday 24 June, 3:00-3:45 PM
Just announced. In partnership with DEPT® Agency at their Secret Garden. How brands build authentic trust in the AI era.
Register: https://powerhouse.indvstryclvb.com/deptagency

Diaspora Dinner — Tuesday 23 June, 6:00-9:00 PM
Our most intimate evening. Three-course dinner at sunset for founders, creatives and industry builders from the diaspora. €100 general admission, limited seats.
RSVP: https://lu.ma/5vmr7s6f

Would love to have you there. Let me know if you have any questions!

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

  // ── NADINE ERCKENBRACK (Laura Ness Owens / Doosan Bobcat) ────────────────
  {
    to: 'nadine.erckenbrack@doosan.com',
    subject: "The Algorithm Doesn't Know Your Culture — Flyer + Landing Page for Laura",
    body: `Hi Nadine,

Hope you are doing well! Following up on Laura's confirmed spot on our panel at DEPT® Agency's Secret Garden on Wednesday 24 June.

We now have a dedicated flyer and landing page for the event that the Doosan Bobcat team are very welcome to share with your audience if you would like to amplify the session. You can find it here: https://powerhouse.indvstryclvb.com/deptagency

If your team would also be open to a collaboration post on social media around the panel, we would love to explore that. No pressure at all, just wanted to put it on your radar.

And if a quick prep call ahead of the week would be useful, we are happy to set that up too. Just let us know what works and we will find a time.

Amber Jacobs
Community Manager, Indvstry Clvb`,
  },

];

// ── CC EMAIL: CATHRYN HURDLE + ERIC OMIKUNLE (Joel Bervell / Kensington Grey)
const CATHRYN_JOEL_EMAIL = {
  to:      'cathryn@kensingtongrey.co',
  cc:      ['eric@kensingtongrey.co'],
  subject: "Joel Bervell x DEPT® Panel — Flyer + Landing Page",
  body: `Hi Cathryn,

Hope you are well! Just reaching out ahead of Cannes about Joel's spot on our panel at DEPT® Agency's Secret Garden on Wednesday 24 June.

We now have a dedicated flyer and landing page live for the event and wanted to make sure you had it before anything goes wider: https://powerhouse.indvstryclvb.com/deptagency

You and the team are absolutely welcome to share this with Joel's audience if that works on your end. And if you would like to explore a collaboration post around the panel, we are very open to that too.

We are genuinely thrilled to have Joel in the room for this conversation. He is one of the strongest voices for what we are building and we want to make sure everything is set up properly on his end.

If a quick prep call ahead of the week would be helpful, just let us know and we will make it happen.

Amber Jacobs
Community Manager, Indvstry Clvb`,
};

// ── MAIN ──────────────────────────────────────────────────────────────────────

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

  // CC email — Cathryn (TO) + Eric (CC)
  process.stdout.write(`Sending to ${CATHRYN_JOEL_EMAIL.to} (CC: ${CATHRYN_JOEL_EMAIL.cc.join(', ')})... `);
  const ccSent = await sendEmailWithCC(
    CATHRYN_JOEL_EMAIL.to,
    CATHRYN_JOEL_EMAIL.cc,
    CATHRYN_JOEL_EMAIL.subject,
    CATHRYN_JOEL_EMAIL.body,
    AMBER.fromName,
    AMBER.fromAddress
  );
  if (ccSent) { console.log('✅'); success++; }
  else        { console.log('❌ FAILED'); failed++; }

  console.log(`\nDone. ${success} sent, ${failed} failed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
