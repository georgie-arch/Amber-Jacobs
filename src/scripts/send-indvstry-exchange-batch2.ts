/**
 * Indvstry Exchange Sponsor Outreach — Batch 2
 *   4. Abe Batshon (BeatStars)         abe@beatstars.com
 *   5. Oliver Stoller (Pioneer DJ)     oliver.stoller@pioneerdj.com
 *   6. Nicki Shamel (TuneCore)         nicki.shamel@tunecore.com
 *   7. Nick Williams (Native Instr.)   nick.williams@native-instruments.com
 *   8. Robb McDaniels (Beatport)       robb.mcdaniels@beatport.com
 *   9. Philip Kaplan (DistroKid)       philip@distrokid.com
 *
 * CC: Ralph (ralphb@vuga.org) on all
 * From: George Guise
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK = 'https://www.canva.com/design/DAHASATuBz4/9A20zd1Nyto4mD_qS3LKCg/edit?utm_content=DAHASATuBz4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

// ─── BEATSTARS — Abe Batshon ─────────────────────────────────────────────────

const beatstarsBody = `Hi Abe,

You said it best in your Music Business Worldwide interview last November: "A kid in Lagos can collaborate with an artist in Atlanta in minutes." That line stuck with me - because it is exactly the world we are trying to build on the ground in East Africa.

Something I came across that felt relevant:

https://fexifystudios.com/2025/07/23/sound-engineering-music-tech-in-afr/

The piece nails the gap. The talent is there, BeatStars and platforms like it are how African producers monetise globally - but the training, community infrastructure, and access are not keeping pace. Airbit/BandLab clearly see the same opportunity - they went to zero commission and are targeting Africa with their 60M user base. The producers who find BeatStars first and feel genuinely supported there will stay.

That is the opening we are building with Indvstry Exchange.

An 8-week programme in Kenya this year - online seminars, live writing camps, a producer incubator, ending in a panel talk and concert. Symphonic is our lead sponsor. The Lemonaide acquisition tells me BeatStars is building the full creator stack - a Kenya programme gives you the next generation of East African producers to grow into it.

Full programme details: ${DECK}

Would love to get on a call and walk through what involvement could look like. Do you have time in the next couple of weeks?

George`;

// ─── PIONEER DJ — Oliver Stoller ─────────────────────────────────────────────

const pioneerBody = `Hi Oliver,

I saw your piece on connection and community being the defining marketing priority for 2025 and it resonated. You are clearly thinking about this in the right way - and it makes me think what we are building in Kenya is worth a conversation.

You already know this market. AlphaTheta ran DJ workshops at the Africa Rising Music Conference in Nairobi in February 2025 and the East Africa Pioneer DJ Convention just wrapped its fifth edition at Sarit Centre with 1,500+ attendees from seven countries. Pioneer DJ gear was front and centre. The relationship with East Africa is real.

This piece captures exactly where the scene is heading:

https://mixmag.net/feature/east-africa-dance-electronic-music-infrastructure-ecosystem-kenya-uganda-tanzania-blackout-mixmag

MUZE Club is now the first African venue in DJ Mag's Top 100 since 2015. Koda and Masshouse have opened as dedicated 1,000 and 5,000-capacity electronic venues. Monthly techno nights that once drew under 100 people now run four nights a weekend. Apple just entered the DJ tools space. Denon and Rane are being distributed in Nairobi. The window to deepen Pioneer DJ's community presence before the market matures is right now.

Indvstry Exchange is an 8-week programme in Kenya - online seminars, live writing camps, a producer and songwriter incubator, ending in a concert. This is exactly the kind of infrastructure that builds the next generation of DJs who grow up on Pioneer gear and stay loyal to it. Symphonic is our lead sponsor.

The DJsounds Show relaunch gives you a content engine. The East Africa electronic scene gives you the stories. We give you the room.

Full programme details: ${DECK}

Do you have 30 minutes to talk through it? Happy to work around your schedule.

George`;

// ─── TUNECORE — Nicki Shamel ─────────────────────────────────────────────────

const tunecoreBody = `Hi Nicki,

Saw the 2026 TuneCore Accelerator Report drop last week - 515,000 artists, 24 billion new streams, 17% year-on-year growth. Genuinely impressive numbers.

One thing stood out though. The regional breakdown names the US, Brazil, France, Germany, UK, and Mexico. Africa is not in it. I thought that was interesting given this:

https://musicinafrica.net/magazine/tunecore-report-streaming-surges-91-west-and-east-africa

91% streaming growth in West and East Africa in a single half-year. Kenya's Spotify per-user subscription value up 18.5% - the strongest premium conversion in Sub-Saharan Africa. The artists topping Kenya's Spotify Wrapped 2025 are independent. The audience is there, the spending is there, and the artists who win in that market are exactly the ones TuneCore is built for.

Amuse is moving fast on this - repositioning as label-like artist support in African markets, distributing to Safaricom in Kenya and going beyond platform-only. The independent artist in Nairobi has options now.

Indvstry Exchange is an 8-week programme in Kenya - online seminars, writing camps, a producer and songwriter incubator, ending in a concert. Symphonic is our lead sponsor. A TuneCore partnership here gives you a credible, community-rooted entry point into East Africa that no amount of digital marketing replicates. The artists coming out of this programme need distribution.

Full programme details: ${DECK}

Would love to talk through what a partnership could look like. Do you have time for a quick call?

George`;

// ─── NATIVE INSTRUMENTS — Nick Williams ──────────────────────────────────────

const nativeBody = `Hi Nick,

The Leading Vibe Initiative in Nairobi last September was excellent. Twenty emerging producers and songwriters, Komplete Select access, Viola Karuri and Patricia Kihoro in the room - it was exactly the kind of programme that builds real relationships on the ground rather than just brand presence. The Kenya chapter showed what is possible when Native Instruments shows up with genuine investment.

Something worth flagging on the opportunity ahead:

https://techtrendske.co.ke/2026/03/12/africa-creator-economy-industry/

Africa's creator economy is valued at $3.08 billion today and projected to hit $17.84 billion by 2030 - 28.5% annual growth. The number one barrier cited by African creators is lack of support. Not talent. Not ideas. Support and access. Ableton ran a five-day Instrument Makers Lab at Kilele in Nairobi in February 2025, partnering with Santuri East Africa - the same organisation NI has worked with for years. They showed up in your own network and built something tangible.

The Leading Vibe Initiative opened the door in Kenya. Indvstry Exchange is the next step through it.

We are running an 8-week programme in Kenya - online seminars, live writing camps, a producer and songwriter incubator, ending in a panel talk and concert. Symphonic is our lead sponsor. A Native Instruments partnership here builds directly on what you started in September - the same community, the next chapter.

Full programme details: ${DECK}

Would you have 30 minutes to talk through what continued involvement could look like? I think there is something real here.

George`;

// ─── BEATPORT — Robb McDaniels ───────────────────────────────────────────────

const beatportBody = `Hi Robb,

Your September CEO letter on Beatport embracing new genres was a statement of intent. African music as a formal category, alongside your comments to MBW about "emerging market expansion" and "more interactive experiences" being your two primary focuses - it is a clear direction and it makes sense.

This one is worth reading if you have not seen it already:

https://djmag.com/features/rewiring-nairobi-new-era-electronic-music-kenyas-capital

MUZE Club is now the first African venue in DJ Mag's Top 100 since 2015. New dedicated venues Koda (1,000 cap) and Masshouse (5,000 cap) have opened specifically for the electronic audience. The Kilele Music Tech Summit drew a thousand people to Nairobi and Santuri has trained 500+ DJs - 25% earning more than half their income from music. Beatport went to Johannesburg with Miller Mix. Nairobi is the next city and the infrastructure is already there.

Indvstry Exchange is an 8-week programme in Kenya - online seminars, live writing camps, a producer and songwriter incubator, ending in a concert. Symphonic is our lead sponsor. The DJs and producers coming out of this programme are exactly the audience Beatport's new genre categories and emerging market strategy are built for. Getting Beatport into that room before the market matures is the move.

Full programme details: ${DECK}

Would love to talk through what partnership could look like. Do you have time in the next couple of weeks?

George`;

// ─── DISTROKID — Philip Kaplan ───────────────────────────────────────────────

const distrokidBody = `Hi Philip,

The DistroKid x Spotify South Africa partnership last month was a strong move - workshops in four provinces, local languages, described as "a cultural investment in African music." It was clearly more than a distribution play.

Kenya is the logical next step and the numbers back it up:

https://musicinafrica.net/magazine/tunecore-report-streaming-surges-91-west-and-east-africa

91% streaming growth in West and East Africa in a single half-year. Kenya's Spotify Wrapped 2025 was topped entirely by independent artists - Sauti Sol, Bien, Wakadinali. The independent artist in Nairobi is the growth story and they need distribution infrastructure that actually serves them. TuneCore has had a dedicated team in Nairobi since 2021. They have a head start. But they are a platform. DistroKid's speed and simplicity is a genuine differentiator for a first-generation independent artist who just needs to get their music out and paid.

Indvstry Exchange is an 8-week programme in Kenya - online seminars, live writing camps, a producer and songwriter incubator, ending in a concert. Symphonic is our lead sponsor. The artists coming out of this programme are ready to distribute. A DistroKid partnership here gives you the community infrastructure that took TuneCore four years to build - fast.

Full programme details: ${DECK}

Do you have time for a quick call to talk through it? Would love to hear your thoughts.

George`;

// ─── SEND ────────────────────────────────────────────────────────────────────

interface Recipient {
  name: string;
  email: string;
  subject: string;
  body: string;
}

const recipients: Recipient[] = [
  {
    name: 'Abe Batshon',
    email: 'abe@beatstars.com',
    subject: 'Indvstry Exchange Kenya  -  BeatStars partnership',
    body: beatstarsBody,
  },
  {
    name: 'Oliver Stoller',
    email: 'oliver.stoller@pioneerdj.com',
    subject: 'Indvstry Exchange Kenya  -  Pioneer DJ partnership',
    body: pioneerBody,
  },
  {
    name: 'Nicki Shamel',
    email: 'nicki.shamel@tunecore.com',
    subject: 'Indvstry Exchange Kenya  -  TuneCore partnership',
    body: tunecoreBody,
  },
  {
    name: 'Nick Williams',
    email: 'nick.williams@native-instruments.com',
    subject: 'Indvstry Exchange Kenya  -  Native Instruments partnership',
    body: nativeBody,
  },
  {
    name: 'Robb McDaniels',
    email: 'robb.mcdaniels@beatport.com',
    subject: 'Indvstry Exchange Kenya  -  Beatport partnership',
    body: beatportBody,
  },
  {
    name: 'Philip Kaplan',
    email: 'philip@distrokid.com',
    subject: 'Indvstry Exchange Kenya  -  DistroKid partnership',
    body: distrokidBody,
  },
];

async function sendEmail(token: string, r: Recipient): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: r.subject,
    body: { contentType: 'HTML', content: buildHtml(r.body) },
    toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
    ccRecipients: [{ emailAddress: { address: 'ralphb@vuga.org', name: 'Ralph' } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
  };
  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function main() {
  const token = await getToken();
  for (const r of recipients) {
    await sendEmail(token, r);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    await new Promise(res => setTimeout(res, 1500));
  }
  console.log('\n✅ All 6 sent.');
}

main().catch(console.error);
