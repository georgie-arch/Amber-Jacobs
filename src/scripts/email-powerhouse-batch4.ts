/**
 * email-powerhouse-batch4.ts
 *
 * Brand-customised Power House partnership pitches  -  Batch 4.
 * Wednesday 1 April 2026. Staggered by recipient timezone.
 *
 * Recipients:
 *   CET (07:00 UTC):  Deezer, Acast, Epidemic Sound
 *   GMT (08:00 UTC):  Joe Hadley (Spotify Music), Billion Dollar Boy, Inkwell Beach (ET override  -  see note)
 *   ET  (12:00 UTC):  Roc Nation, Sony Music, Inkwell Beach, 614 Group, Propeller Group, Epic Games
 *   PT  (15:00 UTC):  Google, Snapchat, Canva, Netflix, Roblox, OpenAI
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch4.ts
 * Single: SEND_ONLY=david npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch4.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_BASE_URL = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';

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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  body: string,
  cc?: Array<{ address: string; name: string }>
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };
  if (cc && cc.length > 0) {
    message.ccRecipients = cc.map(c => ({ emailAddress: c }));
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
  await axios.post(
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── EMAIL BODIES ────────────────────────────────────────────────────────────

// GOOGLE  -  Brand Events Team
// Angle: AI in advertising, Google Cafe at Cannes (invite-only), AI creativity
const googleBody = `Hi there,

Google's presence at Cannes Lions has always been one of the most intentional at the festival. The Google Cafe format is genuinely respected - invite-only, high signal, no noise. And the conversations you are now leading around AI and creativity sit at the exact centre of where the industry is heading.

I am reaching out on behalf of Indvstry Power House, a private villa activation running alongside Cannes Lions 2026. We are hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access to the space. The villa is 30 minutes from the festival by car.

The angle I would love to explore with you is a co-hosted session inside the villa around AI and the future of creative production. Not the keynote version of that conversation - the small-room version, where the CMOs and creative leaders in our house can ask the questions they do not want to ask on a panel. Google's perspective on where AI tools are genuinely changing creative work would land powerfully in that format.

I have put together a bespoke deck for Google so you can see exactly what we have built: ${DECK_BASE_URL}/deck/google

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to have a proper conversation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// SNAPCHAT  -  David Roter, VP Global Agency Partnerships
// Angle: Platform growth, AR innovation, agency partnerships
const snapchatBody = `Hi David,

The work you and the team have been doing around AR innovation and agency partnerships has been genuinely impressive to watch. Snapchat has carved out a creative credibility at Cannes that most platforms still aspire to, and the conversations you are leading around next-gen formats are some of the most forward-looking at the festival.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside those conversations.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around what the next chapter of platform-native creativity looks like, and what the agencies in our house should be building for. Your perspective on where AR and immersive formats are going would be a real provocation for the room.

Bespoke deck for Snap: ${DECK_BASE_URL}/deck/snapchat

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

If this resonates, our events lead George would love to walk you through the full activation. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, David.`;

// CANVA  -  Jimmy Knowles, Global Head of Experiential
// Angle: Experiential ROI, KPIs for brand events, creativity at scale
const canvaBody = `Hi Jimmy,

I have been following your work on the experiential side at Canva and the way you are building events that actually earn their keep, not just build awareness but drive real engagement. The questions you have been asking publicly about ROI and KPIs for brand moments are exactly the kind of thinking that is rare in this space.

I am reaching out because we are building something at Cannes Lions 2026 that I think is in that same spirit.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around creativity at scale and what it actually means to democratise design without losing quality. Canva's story is one of the most compelling in the industry right now, and our room is full of the brand leaders who need to hear it directly.

Partnership snapshot for your team: ${DECK_BASE_URL}/deck/canva

Full sponsorship scope: ${CANVA_DECK}

And the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to get on a call. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Jimmy.`;

// NETFLIX  -  Marian Lee, CMO
// Angle: IP activations (Squid Game, Bridgerton), cultural IP storytelling
const netflixBody = `Hi Marian,

Netflix has consistently produced some of the most culturally resonant brand moments at Cannes - from Squid Game to Bridgerton, the IP activations your team builds do not just promote content, they create the conversations the rest of the festival ends up having. That is a very different thing, and it shows in the results.

I am reaching out because we are building something at Cannes Lions 2026 that sits naturally alongside what Netflix brings to the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around the future of IP-led brand storytelling - the honest conversation about what it takes to build cultural moments that actually land, not just generate impressions. The CMOs and creative leaders in our house are exactly the audience for that.

Bespoke deck for Netflix: ${DECK_BASE_URL}/deck/netflix

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

If this resonates, our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Marian.`;

// JOE HADLEY / SPOTIFY  -  Global Head of Music Partnerships
// Angle: ARIA Awards partnership, Loud & Clear 2026, Diaspora Dinner cultural angle
const joeHadleyBody = `Hi Joe,

The work you have been doing around artist sustainability and music partnerships - from the ARIA Awards collaboration to Loud and Clear 2026 - is some of the most substantive the industry has seen on the music side in years. It is clear that Spotify's approach to music partnerships goes well beyond reach numbers, and that is what makes it interesting.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks directly to the cultural angle you work at.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

The angle I would particularly love to explore with you is around our Diaspora Dinner (June 23, Epi Beach) - 50 curated guests celebrating the intersection of music, culture, and diverse creative talent. Your expertise in music partnerships and what it means to build genuinely inclusive cultural moments would resonate powerfully with that room.

A bespoke snapshot for you: ${DECK_BASE_URL}/deck/spotify

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, our events lead George would love to have a conversation. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Joe.`;

// DEEZER  -  Partnerships Team
// Angle: Music streaming, artist partnerships, cultural positioning
const deezerBody = `Hi there,

Deezer's approach to artist partnerships and cultural positioning has always taken the long view - quality over volume, genuine music culture over algorithmic noise. That comes through in the conversations happening around the brand, and it is something that stands out in a crowded streaming landscape.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside where Deezer plays.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted moment inside the villa around music culture, artist sustainability, and what authentic brand partnerships in the streaming world actually look like. The room is full of brand leaders who care about getting this right, and Deezer's perspective would be a genuinely welcome provocation.

Partnership snapshot: ${DECK_BASE_URL}/deck/deezer

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// ACAST  -  Partnerships Team
// Angle: Podcast advertising, creator economy, audio brand partnerships
const acastBody = `Hi there,

Acast has done more than most to professionalise podcast advertising and make the case for audio as a serious brand investment. The creator-first approach you have built is increasingly the model the rest of the industry is trying to catch up with, and the conversations you are leading around the economics of independent audio are genuinely important ones.

I am reaching out because we are building something at Cannes Lions 2026 that I think complements where Acast sits in the creative conversation.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring into the space. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around the creator economy and what it means for brand investment in audio. The CMOs and brand leaders in our house are making the decisions that will shape podcast advertising for the next five years, and Acast's perspective on what actually works belongs in that room.

Partnership snapshot: ${DECK_BASE_URL}/deck/acast

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// ROC NATION  -  Partnerships Team
// Angle: Music, sports management, brand partnerships, cultural influence
const rocNationBody = `Hi there,

Roc Nation's presence in brand partnerships is unlike most in the music and sports management world - the cultural credibility is built in, the network is unmatched, and the approach to brand collaboration consistently goes beyond the transactional. That is a combination very few organisations can claim.

I am reaching out because we are building something at Cannes Lions 2026 that sits squarely at the intersection of culture, brand, and influence.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door conversation and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that brings Roc Nation's cultural weight into the villa - whether through a co-hosted session, a presence at our Diaspora Dinner (June 23, Epi Beach, 50 curated guests), or a broader brand partnership around music and culture at Cannes. The room is exactly the audience for what Roc Nation represents.

Partnership snapshot: ${DECK_BASE_URL}/deck/rocnation

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to have a proper conversation. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// SONY MUSIC  -  Brand Partnerships
// Angle: Artist campaigns, streaming strategy, global music culture
const sonyMusicBody = `Hi there,

Sony Music's approach to brand partnerships has evolved significantly in recent years - the work being done around artist-brand collaboration and streaming strategy is some of the most sophisticated in the industry. When the music side of the business and the brand side genuinely talk to each other, the results show.

I am reaching out because we are building something at Cannes Lions 2026 that I think is a natural fit for Sony Music's presence at the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around music and brand partnerships - what genuine creative collaboration between artists and brands looks like now, and where it is going. The brand leaders in our house are the ones making those investment decisions, and Sony Music's perspective on what works belongs in the room.

Partnership snapshot: ${DECK_BASE_URL}/deck/sonymusic

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// EPIDEMIC SOUND  -  Partnerships Team
// Angle: Creator economy, music licensing, brand content
const epidemicSoundBody = `Hi there,

Epidemic Sound has built something genuinely rare in the music licensing space: a model that works for creators, brands, and artists simultaneously, without compromising any of them. The way you have positioned the brand inside the creator economy has made Epidemic Sound the go-to reference whenever that conversation comes up at industry level.

I am reaching out because we are building something at Cannes Lions 2026 that sits directly in that territory.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around the creator economy, music licensing, and what brand content really needs from audio in 2026. Epidemic Sound's perspective on where this is going is exactly the kind of provocation our room benefits from - and the CMOs and creative leaders in that villa are the ones setting the briefs.

Partnership snapshot: ${DECK_BASE_URL}/deck/epidemicsound

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// BILLION DOLLAR BOY  -  Edward East, Founder & Group CEO
// Angle: Creator economy, Cannes 2026 Creator Fund, US expansion
const edwardEastBody = `Hi Edward,

The Creator Fund initiative you announced for Cannes 2026 - 20 creators, five days, proper immersion - is one of the most forward-looking things any agency has done around the festival in years. It is the kind of move that signals what the industry should be doing, not what it is doing. And the US expansion has been well-executed: you have not diluted what makes BDB distinctive in the process.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside what you are bringing to the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around the creator economy and what it actually means for brand investment decisions. The CMOs in our house are the buyers your clients pitch to - getting that conversation going, honestly, in a room this intimate, could be genuinely valuable for both sides.

Partnership snapshot for BDB: ${DECK_BASE_URL}/deck/billiondollarboy

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to get on a call. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Edward.`;

// INKWELL BEACH  -  Adrianne C. Smith, Founder & CEO
// Angle: DEI at Cannes, Inkwell Beach Davos 2026, Diaspora Dinner connection
const adrianneSmithBody = `Hi Adrianne,

Inkwell Beach has done something genuinely important at Cannes Lions - created a space that holds both the joy and the seriousness of the conversation around inclusion in the creative industry. The Davos 2026 presence shows how far that mission has grown, and the resilience and consistency behind it all is something I have a lot of respect for.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks directly to what Inkwell Beach stands for.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door conversation and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in.

What I would love to explore with you is a deeper collaboration around our Diaspora Dinner on June 23 at Epi Beach - 50 curated guests, celebrating diverse creative talent and the culture behind the work. It feels like a natural home for the Inkwell Beach community, and a partnership that would be meaningful rather than just visible.

There is also a broader Power House conversation worth having - a co-hosted session on what inclusive creative leadership actually looks like in practice, with the senior leaders in our house.

Partnership snapshot for Inkwell Beach: ${DECK_BASE_URL}/deck/inkwellbeach

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Adrianne.`;

// 614 GROUP  -  Team
// Angle: Brand safety, digital advertising, Cannes activation
const group614Body = `Hi there,

614 Group has been one of the most consistent voices on brand safety and responsible digital advertising for years - and the way you bring rigour to those conversations at Cannes, when the rest of the festival is focused on the shiny new thing, is genuinely valuable for the industry.

I am reaching out because we are building something at Cannes Lions 2026 that I think complements that perspective.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around brand safety and what it means for brand-building decisions at senior level. The CMOs and marketing leaders in our house are the ones whose decisions create or solve the brand safety challenges you work on - getting that conversation in a room this intimate feels like something worth a conversation.

Partnership snapshot: ${DECK_BASE_URL}/deck/sixteengroup

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// PROPELLER GROUP  -  Events Team
// Angle: Experiential events, brand activations, Cannes presence
const propellerBody = `Hi there,

Propeller Group's experiential work speaks for itself - the ability to build brand moments that feel both premium and purposeful is harder than it looks, and you have been doing it at Cannes and beyond for long enough to know what actually works versus what just looks good on a brief.

I am reaching out because we are building something at Cannes Lions 2026 that I think is worth a conversation.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

Whether the opportunity is a partnership on the activation itself, a co-hosted moment inside the villa, or bringing your network into the Propeller Group conversation - I would love to explore what makes sense for both sides. The calibre of people in our house and the intimacy of the setting is something the Croisette cannot match.

Partnership snapshot: ${DECK_BASE_URL}/deck/propellergroup

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// EPIC GAMES  -  Partnerships Team
// Angle: Fortnite brand collaborations, gaming culture, metaverse
const epicGamesBody = `Hi there,

Epic Games has done more than any other company to show what brand collaboration inside a gaming environment can actually look like at scale. The Fortnite partnerships have set a new standard for what it means to build cultural moments inside a platform - not just ads, but genuine creative events.

I am reaching out because we are building something at Cannes Lions 2026 that sits at the intersection of gaming culture and senior brand decision-making.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around gaming culture and what it means for brand strategy at the highest level. The CMOs and creative directors in our house are the ones whose budgets and briefs shape what brand collaboration in gaming looks like next - getting Epic Games into that room, in a format this intimate, could be genuinely valuable.

Partnership snapshot: ${DECK_BASE_URL}/deck/epicgames

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// ROBLOX  -  Brand Partnerships Team
// Angle: Creator economy in gaming, brand experiences, Gen Z culture
const robloxBody = `Hi there,

Roblox has built something that most platforms only claim to have: a genuine creator economy that actually works for the people inside it. The brand experiences being built on the platform are some of the most interesting in gaming right now, and the way Roblox has become the reference point for reaching Gen Z authentically is something the advertising industry is still catching up with.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks directly to where that conversation needs to go next.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around Gen Z culture and what authentic brand engagement inside a creator-driven platform really looks like. The CMOs in our house are the ones making those investment decisions, and Roblox's perspective on what works is exactly what that room needs to hear.

Partnership snapshot: ${DECK_BASE_URL}/deck/roblox

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// OPENAI  -  Partnerships Team
// Angle: AI creativity, GPT-4 in brand work, cultural impact of AI
const openaiBody = `Hi there,

OpenAI has moved faster than anyone expected to become a genuine part of the creative industry's working infrastructure. The conversations happening around how GPT models are being used in brand strategy, content production, and creative development are not theoretical any more - they are live, and the industry is trying to figure out what it means in real time.

I am reaching out because we are building something at Cannes Lions 2026 that puts that conversation in the right room.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around AI and the future of creative work. Not the panel version - the real conversation about what the most senior brand leaders and creative directors are actually experiencing, what is working, what is not, and what they need from AI tools that they are not getting yet. OpenAI's presence in that room would be genuinely significant.

Partnership snapshot: ${DECK_BASE_URL}/deck/openai

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// ─── RECIPIENTS ──────────────────────────────────────────────────────────────

interface Recipient {
  name: string;
  email: string;
  subject: string;
  body: string;
  cc?: Array<{ address: string; name: string }>;
}

const recipients: Recipient[] = [
  // CET  -  07:00 UTC
  {
    name: 'Deezer Partnerships Team',
    email: 'partnerships@deezer.com',
    subject: 'Cannes 2026  -  audio culture inside the Power House',
    body: deezerBody,
  },
  {
    name: 'Acast Partnerships Team',
    email: 'partnerships@acast.com',
    subject: 'Cannes 2026  -  podcast culture meets Power House',
    body: acastBody,
  },
  {
    name: 'Epidemic Sound Partnerships',
    email: 'partnerships@epidemicsound.com',
    subject: 'Cannes 2026  -  the sound of the Power House',
    body: epidemicSoundBody,
  },
  // GMT  -  08:00 UTC
  {
    name: 'Joe Hadley',
    email: 'joe.hadley@spotify.com',
    subject: 'Cannes 2026  -  music, culture and the Power House, Joe',
    body: joeHadleyBody,
  },
  {
    name: 'Edward East',
    email: 'edward.east@billiondollarboy.com',
    subject: 'Cannes 2026  -  the creator conversation the industry needs, Edward',
    body: edwardEastBody,
  },
  // ET  -  12:00 UTC
  {
    name: 'Roc Nation Partnerships Team',
    email: 'partnerships@rocnation.com',
    subject: 'Cannes 2026  -  culture, music and the room that matters',
    body: rocNationBody,
  },
  {
    name: 'Sony Music Brand Partnerships',
    email: 'brand.partnerships@sonymusic.com',
    subject: 'Cannes 2026  -  the music industry in the Power House',
    body: sonyMusicBody,
  },
  {
    name: 'Adrianne C. Smith',
    email: 'adrianne@inkwellbeach.com',
    subject: 'Cannes 2026  -  Inkwell Beach and the Power House, Adrianne',
    body: adrianneSmithBody,
  },
  {
    name: '614 Group Team',
    email: 'info@614group.com',
    subject: 'Cannes 2026  -  brand safety inside the Power House',
    body: group614Body,
  },
  {
    name: 'Propeller Group Events Team',
    email: 'hello@propellergroup.com',
    subject: 'Cannes 2026  -  from the Croisette to the Power House',
    body: propellerBody,
  },
  // PT  -  15:00 UTC
  {
    name: 'Cannes Brand Events Team',
    email: 'events@google.com',
    subject: 'Cannes 2026  -  Power House x Google, a conversation worth having',
    body: googleBody,
  },
  {
    name: 'David Roter',
    email: 'droter@snap.com',
    subject: 'Cannes 2026  -  the next gen creative conversation, David',
    body: snapchatBody,
  },
  {
    name: 'Jimmy Knowles',
    email: 'jimmy.knowles@canva.com',
    subject: "Cannes 2026  -  Canva in the room where creative decisions get made, Jimmy",
    body: canvaBody,
  },
  {
    name: 'Marian Lee',
    email: 'marian.lee@netflix.com',
    subject: 'Cannes 2026  -  Netflix IP meets Power House, Marian',
    body: netflixBody,
  },
  {
    name: 'Epic Games Partnerships',
    email: 'partnerships@epicgames.com',
    subject: 'Cannes 2026  -  gaming culture meets the Power House',
    body: epicGamesBody,
  },
  {
    name: 'Roblox Brand Partnerships',
    email: 'partnerships@roblox.com',
    subject: 'Cannes 2026  -  the Gen Z conversation, in the room that matters',
    body: robloxBody,
  },
  {
    name: 'OpenAI Partnerships',
    email: 'partnerships@openai.com',
    subject: 'Cannes 2026  -  AI creativity and the Power House',
    body: openaiBody,
  },
];

// ─── SEND ─────────────────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();

  const sendOnly = process.env.SEND_ONLY?.toLowerCase();
  const toSend = sendOnly
    ? recipients.filter(r => r.name.toLowerCase().startsWith(sendOnly))
    : recipients;

  for (const r of toSend) {
    await sendEmail(token, r.email, r.name, r.subject, r.body, r.cc);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    if (toSend.indexOf(r) < toSend.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log(`\n✅ ${toSend.length} email(s) sent.`);
}

main().catch(console.error);
