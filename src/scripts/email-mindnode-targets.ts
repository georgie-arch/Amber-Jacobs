/**
 * email-mindnode-targets.ts
 *
 * Personalised Power House outreach to 33 senior targets from the
 * INDVSTRY Power House Cannes 2026 Sponsor & Partner Targets MindNode.
 *
 * Each email references a real, recent (Jan-Mar 2026) activity or quote
 * from the recipient or their company to drive open and response rates.
 *
 * Scheduled: Wednesday 25 March 2026 at 11:00am UTC (11am UK / GMT)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-mindnode-targets.ts
 * Single: SEND_ONLY=nicola npx ts-node --project tsconfig.json src/scripts/email-mindnode-targets.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const GEORGE_CALENDAR = 'https://calendly.com/itsvisionnaire/30min';

// ─── AUTH ────────────────────────────────────────────────────────────────────

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

// ─── HTML BUILDER ─────────────────────────────────────────────────────────────

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

// ─── RECIPIENT TYPE ───────────────────────────────────────────────────────────

interface Recipient {
  name: string;
  email: string;
  subject: string;
  body: string;
  cc?: { address: string; name: string }[];
}

// ─── EMAIL BODIES ──────────────────────────────────────────────────────────────

// META
const nicolaMendelsohnBody = `Hi Nicola,

I saw your quote from Cannes Lions last year - "AI isn't replacing creativity, it's scaling it" - and it stuck with me. That tension between scale and genuine creative quality is exactly what the most interesting conversations at Cannes keep circling back to.

I'm reaching out because we are building Indvstry Power House, a private villa activation running alongside Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door dinners, sessions and genuine connection. We hold over 75,000 euros in delegate passes and are deliberate about who gets access.

We have a small number of partnership packages available and would love to explore whether Meta would be a fit. Our sponsorship deck is here:
${CANVA_DECK}

Would you or someone on your team be open to a quick call? You can book directly here:
${GEORGE_CALENDAR}`;

const helenMaBody = `Hi Helen,

I am reaching out about Indvstry Power House, our private villa activation at Cannes Lions 2026. We are bringing together 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa - closed-door sessions, curated dinners and genuine connection away from the festival floor.

With Meta's AI advertising products reshaping how brands think about scale and performance, we think there is a really interesting conversation to be had inside the villa. The audience is exactly the room where those conversations matter most.

We have a small number of partnership packages available. Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick chat to explore if there is a fit? You can book a time here:
${GEORGE_CALENDAR}`;

// SPOTIFY
const bridgetEvansBody = `Hi Bridget,

I loved your recent post on video advertising on Spotify and the work you've been doing helping brands shape their 2026 plans through Wrapped for Advertisers. The idea of giving brands real audience insight rather than just impressions is exactly the kind of thinking our community responds to.

I'm reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of curated dinners, sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access.

We would love to explore whether Spotify would want to be a partner in the room. Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book directly here:
${GEORGE_CALENDAR}`;

const emmaVaughnBody = `Hi Emma,

I am reaching out about Indvstry Power House, our private villa activation running alongside Cannes Lions 2026. We are bringing 30 of the most senior creative, marketing and cultural leaders together for five days at an exclusive villa - the kind of environment where the most interesting content and partnership conversations actually happen.

Given your work on Spotify's content business development, we think there is a really natural fit here. The villa is exactly the room where those deals and creative collaborations get their start.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call to explore? Book a time here:
${GEORGE_CALENDAR}`;

const keyanaKashfiBody = `Hi Keyana,

Your work leading experiential and content production at Spotify is exactly the kind of thinking we are building Indvstry Power House around. This is not a conference sponsorship - it is a curated five-day villa experience at Cannes Lions 2026 hosting 30 of the most senior creative and marketing leaders in the industry.

Think closed-door sessions, curated dinners, genuine moments that get people talking. The kind of environment you build for your own activations.

We have a small number of partnership packages available. Our deck is here:
${CANVA_DECK}

Would love to get on a call and walk you through it. Book a time here:
${GEORGE_CALENDAR}`;

const kayHsuBody = `Hi Kay,

Cannes Lions is your territory - and the Creative Lab you run at Spotify is exactly the kind of thinking that deserves a room beyond the main festival floor.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026 hosting 30 of the most senior creative, marketing and cultural leaders for five days. Closed-door sessions, curated dinners, genuine connection. We hold over 75,000 euros in delegate passes and are intentional about who we bring into the house.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// LINKEDIN
const jessicaJensenBody = `Hi Jessica,

Your post on what it takes for marketing leaders to thrive in 2026 - the shift to B2H thinking, authenticity over automation - is a conversation that needs a room to match it.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of curated dinners, closed-door sessions and genuine connection. The audience is exactly the community LinkedIn's work is built for.

We have a small number of partnership packages available. Our sponsorship deck is here:
${CANVA_DECK}

Would love to explore if there is a fit. Book a call here:
${GEORGE_CALENDAR}`;

const matthewDerellaBody = `Hi Matthew,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa - the kind of high-trust environment where the most valuable B2B conversations actually happen.

The audience is exactly LinkedIn's core constituency - CMOs, heads of strategy, creative and culture leaders from the most influential brands and agencies in the industry.

We have a small number of partnership packages available. Our deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

const danielleDamianoBody = `Hi Danielle,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. Given your work leading global event strategy at LinkedIn, I thought this was worth putting on your radar.

We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa - curated dinners, closed-door sessions, genuine moments. The kind of event that generates the conversations that matter.

We have a small number of partnership packages available. Our deck is here:
${CANVA_DECK}

Would you be open to a quick call to explore? Book here:
${GEORGE_CALENDAR}`;

const allysonHugleyBody = `Hi Allyson,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. The 30 senior leaders we are bringing into the villa are exactly the audience your customer insights work is built to understand - CMOs, heads of strategy, senior creative leaders from brands and agencies at the top of the industry.

We have a small number of partnership packages available and would love to explore a fit. Our deck is here:
${CANVA_DECK}

Would you be open to a quick chat? Book here:
${GEORGE_CALENDAR}`;

// DISNEY ADVERTISING
const ritaFerroBody = `Hi Rita,

Your announcement at CES in January - Disney on track for 75% automation by 2027, vertical video coming to Disney+ and the new AI video generation tools for brands - set the tone for where advertising is heading in 2026. The industry is paying attention.

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and curated dinners. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access.

We have a small number of partnership packages available. Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call to explore? Book here:
${GEORGE_CALENDAR}`;

const danaMcGrawBody = `Hi Dana,

Your point at CES in January resonated with me - "our industry has had a tendency to favour last-touch attribution, but when we are creating conversation, building awareness and driving action, the story of that holistic impact should be clear." That is exactly the kind of thinking that deserves a bigger platform.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. The villa is where those measurement conversations get real traction.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick chat? Book here:
${GEORGE_CALENDAR}`;

const jamiePowerBody = `Hi Jamie,

I am reaching out about Indvstry Power House, our private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa - curated dinners, closed-door sessions, genuine connection.

Given Disney's Cannes presence and your work in addressable sales, we think there is a really strong fit here. The audience inside the villa is exactly the senior decision-maker group that addressable conversations are built around.

We have a small number of partnership packages available. Our deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// LIVERAMP
const vihanSharmaBody = `Hi Vihan,

Your quote from the AI marketplace announcement in January stuck with me - "The ability for AI systems to safely and seamlessly access and leverage premium, permissioned data will redefine how enterprises build intelligence." That conversation is only going to get louder at Cannes this year.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. The villa is exactly the room where that data and AI conversation needs to happen.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

const scottHoweBody = `Hi Scott,

Congratulations on the IAB Service of Excellence award last month - recognition well earned for the work LiveRamp has done building the foundations of how data moves safely through the industry.

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. Given LiveRamp's donation of AI standards to the IAB Tech Lab, there is a real conversation to be had inside the villa about where the ecosystem is heading.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// PAYPAL ADS
const markGretherBody = `Hi Mark,

Your Transaction Graph launch in January was a strong statement - "unlike walled-garden platforms that only see activity within their own ecosystem, PayPal's Transaction Graph connects verified purchases across tens of millions of merchants." That kind of differentiated data story deserves the right room at Cannes.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// EXPEDIA
const arianeGorinBody = `Hi Ariane,

You said it well on CNBC in February - consumers are continuing to spend on travel. And the audience we are bringing to Cannes this June are exactly those consumers - senior creative and marketing leaders who travel, spend and engage at the highest level.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior leaders in culture, brand and media for five days at an exclusive villa. Curated dinners, closed-door sessions, genuine connection.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call to explore? Book here:
${GEORGE_CALENDAR}`;

const jochenKoedijkBody = `Hi Jochen,

The OpenAI case study on how Expedia is using AI to power its marketing evolution is a great example of the kind of thinking that is reshaping how the industry operates. That conversation is going to be front and centre at Cannes this year.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. The villa is exactly the room where those next-generation marketing conversations get real.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// COMCAST (Jon Gieselman)
const jonGieselmanBody = `Hi Jon,

Congratulations on the new role at Comcast - Chief Growth Officer is exactly the kind of mandate that puts you at the intersection of brand, product and performance. I imagine Cannes is already in the diary.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. With your background in growth and brand at Expedia and Apple, I think you would find the room genuinely compelling.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// GWI
const jasonManderBody = `Hi Jason,

Your CES session on the hidden marketing trends shaping 2026 - social, AI and consumer behaviour shifting faster than most brands are ready for - is exactly the kind of intelligence our community needs to hear directly. Not in a panel, but in a room.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of curated dinners, closed-door sessions and genuine connection. The audience your data is built to understand is exactly who will be in the house.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// ROBLOX (Jerret West)
const jerretWestBody = `Hi Jerret,

The conversation around gaming culture and brand storytelling has been building for years - but at Cannes 2026 it feels like it is finally going to land in the main conversation in a serious way. With Roblox's scale and the audience you are building around, the timing feels right.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa. Closed-door sessions, curated dinners, genuine connection. The kind of room where the gaming and culture conversation gets taken seriously.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// VEVO
const kevinMcGurnBody = `Hi Kevin,

Music video culture is having a moment - and Cannes Lions is where the creative and advertising industries come together to make sense of it. The audience we are building at Indvstry Power House is exactly the room where that conversation belongs.

We are building a private villa activation at Cannes Lions 2026, hosting 30 of the most senior creative, marketing and cultural leaders for five days. Closed-door sessions, curated dinners, genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

const robGilliesBody = `Hi Rob,

As someone running Vevo's UK and international business, Cannes is the week where the most important relationships in the industry come together. We want to make sure Vevo is in the right room.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa. Curated dinners, closed-door sessions, genuine moments.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call to explore? Book here:
${GEORGE_CALENDAR}`;

// MONKS
const victorKnaapBody = `Hi Victor,

Your CES dual-track on bridging futurism and function - making AI actually work for brands rather than just talk about it - is exactly the kind of grounded thinking the industry needs more of. The villa is where that conversation gets real traction.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. The room is exactly the audience Monks is built to work with.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

const justinBillingsleyBody = `Hi Justin,

The work you and the team did at CES with Adobe - showing how AI creative tools actually function in practice rather than in theory - is exactly the conversation our community wants to have at Cannes. Not on a stage. In a room.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa. The audience is exactly the C-suite you are built to grow with.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

const daveMeekerBody = `Hi Dave,

AI innovation in the creative industry is the conversation at Cannes 2026 - and the most interesting version of that conversation will not happen on the main stage. It will happen in rooms like ours.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. With your work on AI innovation at Monks, there is a real story to tell in that room.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// EXPERIAN
const gregKoernerBody = `Hi Greg,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection.

Given Experian's marketing services work and how data storytelling is reshaping brand strategy, the villa is exactly the room where those conversations get real traction with the right decision-makers.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

const budiTanziBody = `Hi Budi,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa.

With your work on Experian's product side, the intersection of data, identity and brand strategy is a live conversation in the room we are building. The audience is exactly the group that turns those insights into action.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// YMU
const maryBekhaitBody = `Hi Mary,

Your announcement in January about YMU Ventures was a genuinely exciting move - "influence now compounds into ownership, IP and enterprise" is exactly the right framing for where talent and culture is heading. That conversation needs a room at Cannes.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection. The crossover between talent, culture and brand is central to what we are building.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// TRAINLINE
const lindsaySheridanBody = `Hi Lindsay,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa.

The Cannes audience is a natural fit for Trainline's advertising story - these are senior professionals who travel regularly, engage with premium brands and make decisions that shape campaigns. We have a small number of partnership packages available and would love to explore if there is a fit.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// MAGNITE
const kristenWilliamsBody = `Hi Kristen,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection.

Cannes is where the biggest CTV and programmatic partnership conversations get started - and the villa is exactly the intimate, high-access environment where Magnite's partnerships story lands best.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

const seanBuckleyBody = `Hi Sean,

I am reaching out because we are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days at an exclusive villa. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access.

The CTV and revenue conversations that define Cannes for Magnite are exactly what the villa is built around - the right people, the right environment, the real conversations.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// XBOX / MICROSOFT
const marcosWaltenbergBody = `Hi Marcos,

Gaming culture is one of the most significant creative forces shaping brand strategy right now - and Cannes 2026 feels like the year it properly lands in the main conversation. The audience we are bringing to the villa includes some of the most senior brand and creative leaders in the industry.

We are building Indvstry Power House, a private villa activation at Cannes Lions 2026. We are hosting 30 of the most senior creative, marketing and cultural leaders for five days of closed-door sessions and genuine connection.

Our sponsorship deck is here:
${CANVA_DECK}

Would you be open to a quick call? Book here:
${GEORGE_CALENDAR}`;

// ─── RECIPIENTS LIST ──────────────────────────────────────────────────────────

const recipients: Recipient[] = [
  // META
  {
    name: 'Nicola',
    email: 'nicola.mendelsohn@meta.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: nicolaMendelsohnBody,
  },
  {
    name: 'Helen',
    email: 'helen.ma@meta.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: helenMaBody,
  },
  // SPOTIFY
  {
    name: 'Bridget',
    email: 'bridget.evans@spotify.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: bridgetEvansBody,
  },
  {
    name: 'Emma',
    email: 'emma.vaughn@spotify.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: emmaVaughnBody,
  },
  {
    name: 'Keyana',
    email: 'keyana.kashfi@spotify.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: keyanaKashfiBody,
  },
  {
    name: 'Kay',
    email: 'kay.hsu@spotify.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: kayHsuBody,
  },
  // LINKEDIN
  {
    name: 'Jessica',
    email: 'jessica.jensen@linkedin.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: jessicaJensenBody,
  },
  {
    name: 'Matthew',
    email: 'matthew.derella@linkedin.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: matthewDerellaBody,
  },
  {
    name: 'Danielle',
    email: 'danielle.damiano@linkedin.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: danielleDamianoBody,
  },
  {
    name: 'Allyson',
    email: 'allyson.hugley@linkedin.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: allysonHugleyBody,
  },
  // DISNEY ADVERTISING
  {
    name: 'Rita',
    email: 'rita.ferro@disney.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: ritaFerroBody,
  },
  {
    name: 'Dana',
    email: 'dana.mcgraw@disney.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: danaMcGrawBody,
  },
  {
    name: 'Jamie',
    email: 'jamie.power@disney.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: jamiePowerBody,
  },
  // LIVERAMP
  {
    name: 'Vihan',
    email: 'vihan.sharma@liveramp.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: vihanSharmaBody,
  },
  {
    name: 'Scott',
    email: 'scott.howe@liveramp.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: scottHoweBody,
  },
  // PAYPAL ADS
  {
    name: 'Mark',
    email: 'mark.grether@paypal.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: markGretherBody,
  },
  // EXPEDIA
  {
    name: 'Ariane',
    email: 'ariane.gorin@expediagroup.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: arianeGorinBody,
  },
  {
    name: 'Jochen',
    email: 'jochen.koedijk@expediagroup.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: jochenKoedijkBody,
  },
  // COMCAST
  {
    name: 'Jon',
    email: 'jon.gieselman@comcast.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: jonGieselmanBody,
  },
  // GWI
  {
    name: 'Jason',
    email: 'jason.mander@gwi.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: jasonManderBody,
  },
  // ROBLOX
  {
    name: 'Jerret',
    email: 'jerret.west@roblox.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: jerretWestBody,
  },
  // VEVO
  {
    name: 'Kevin',
    email: 'kevin.mcgurn@vevo.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: kevinMcGurnBody,
  },
  {
    name: 'Rob',
    email: 'rob.gillies@vevo.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: robGilliesBody,
  },
  // MONKS
  {
    name: 'Victor',
    email: 'victor.knaap@monks.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: victorKnaapBody,
  },
  {
    name: 'Justin',
    email: 'justin.billingsley@monks.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: justinBillingsleyBody,
  },
  {
    name: 'Dave',
    email: 'dave.meeker@monks.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: daveMeekerBody,
  },
  // EXPERIAN
  {
    name: 'Greg',
    email: 'greg.koerner@experian.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: gregKoernerBody,
  },
  {
    name: 'Budi',
    email: 'budi.tanzi@experian.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: budiTanziBody,
  },
  // YMU
  {
    name: 'Mary',
    email: 'mary.bekhait@ymugroup.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: maryBekhaitBody,
  },
  // TRAINLINE
  {
    name: 'Lindsay',
    email: 'lindsay.sheridan@thetrainline.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: lindsaySheridanBody,
  },
  // MAGNITE
  {
    name: 'Kristen',
    email: 'kristen.williams@magnite.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: kristenWilliamsBody,
  },
  {
    name: 'Sean',
    email: 'sean.buckley@magnite.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: seanBuckleyBody,
  },
  // XBOX / MICROSOFT
  {
    name: 'Marcos',
    email: 'marcos.waltenberg@microsoft.com',
    subject: 'Indvstry Power House, Cannes 2026 - partnership',
    body: marcosWaltenbergBody,
  },
];

// ─── SEND ─────────────────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();

  const toSend = sendOnly
    ? recipients.filter(r => r.name.toLowerCase().startsWith(sendOnly))
    : recipients;

  let sent = 0;

  for (const r of toSend) {
    const message: any = {
      subject: r.subject,
      body: { contentType: 'HTML', content: buildHtml(r.body) },
      toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
      from: {
        emailAddress: {
          address: process.env.EMAIL_USER || '',
          name: 'Amber Jacobs',
        },
      },
    };

    if (r.cc) {
      message.ccRecipients = r.cc.map(c => ({ emailAddress: c }));
    }

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

    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log(`✅ Sent to ${r.name} <${r.email}>`);
      sent++;
    } catch (err: any) {
      console.error(`❌ Failed: ${r.email}`, err?.response?.data || err.message);
    }

    await new Promise(res => setTimeout(res, 800));
  }

  console.log(`\n✅ ${sent}/${toSend.length} emails sent.`);
}

main().catch(console.error);
