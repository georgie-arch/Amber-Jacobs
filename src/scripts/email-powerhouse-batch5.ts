/**
 * email-powerhouse-batch5.ts
 *
 * Brand-customised Power House partnership pitches  -  Batch 5.
 * Monday 6 April 2026. Staggered by recipient timezone.
 *
 * Recipients:
 *   CET (07:00 UTC):  Heineken, Adidas
 *   GMT (08:00 UTC):  Diageo (cc: Experiential Lead), Unilever, Clear Channel
 *   ET  (12:00 UTC):  Coca-Cola, AB InBev, L'Oreal
 *   PT  (15:00 UTC):  Nike
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch5.ts
 * Single: SEND_ONLY=manuel npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch5.ts
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

// COCA-COLA  -  Manuel Arroyo, EVP & Global CMO
// Angle: FIFA World Cup 2026 campaign, cultural storytelling, Real Magic
const cocaColaBody = `Hi Manolo,

The Real Magic campaign has done something genuinely difficult: it has given Coca-Cola a platform for cultural storytelling that feels current without abandoning what makes the brand iconic. And with the FIFA World Cup 2026 campaign in full build now, Coca-Cola is about to have one of the biggest cultural moments of any brand this year.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside the conversations you are leading at the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around cultural storytelling at scale - what it takes to build brand meaning across markets when the world is watching. Your perspective on how Coca-Cola navigates that, particularly in a World Cup year, would be exactly what the room needs.

Bespoke deck for Coca-Cola: ${DECK_BASE_URL}/deck/cocacola

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to get on a call. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Manolo.`;

// AB InBev  -  Marcel Marcondes, Global CMO
// Angle: Creative Brand Lion jury (Cannes 2026), Cannes Lions Creative Marketer legacy
const abInBevBody = `Hi Marcel,

Being named to the Creative Brand Lion jury at Cannes 2026 is a real statement of where AB InBev sits in the creative conversation right now. Your track record at the festival speaks for itself, and the work the team has produced consistently earns its attention rather than buying it. That distinction matters, and the industry notices.

I am reaching out because we are building something at Cannes Lions 2026 that I think complements the creative leadership position AB InBev has built at the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around creative brand-building - what it takes to sustain creative ambition at scale, and what the industry can learn from how AB InBev has approached it. Your perspective on the jury process and what separates work that truly moves culture would be a genuinely important conversation in that room.

Bespoke deck for AB InBev: ${DECK_BASE_URL}/deck/abinbev

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Marcel.`;

// HEINEKEN  -  Nabil Nasser, Global Head of Heineken Brand
// Angle: Heineken 0.0, Premier Padel partnership, F1, responsible drinking
const heinekenBody = `Hi Nabil,

Heineken's advertising has been consistently some of the most awarded and most talked-about at Cannes for over a decade - and the brand continues to earn that reputation by doing the harder thing: making responsible drinking genuinely cool rather than preachy. The 0.0 positioning is a masterclass in reframing. The F1 partnership and Premier Padel moves show a brand that knows how to find cultural whitespace before everyone else gets there.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside those conversations.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around brand positioning and cultural relevance - how Heineken thinks about staying genuinely interesting to the next generation of consumers while holding onto what makes the brand iconic.

Bespoke deck for Heineken: ${DECK_BASE_URL}/deck/heineken

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Nabil.`;

// DIAGEO  -  Cristina Diezhandino, CMO (cc: Experiential Lead)
// Angle: Guinness, luxury brand portfolio, inclusive marketing
const diageoBody = `Hi Cristina,

Diageo's portfolio has had an extraordinary run at Cannes Lions in recent years - and the work coming out of Guinness in particular has set a new standard for what storytelling looks like in the drinks category. The commitment to inclusive marketing across the portfolio is real and visible, and it is reflected in the quality of the work.

I am reaching out because we are building something at Cannes Lions 2026 that I think is a natural fit for Diageo's presence at the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that brings Diageo's portfolio into the villa in a meaningful way - whether through a co-hosted dinner with Johnnie Walker or Don Julio as the backdrop, a branded session around inclusive marketing and cultural storytelling, or a broader presence across the week. The room is exactly the right audience for a premium brand conversation.

Bespoke deck for Diageo: ${DECK_BASE_URL}/deck/diageo

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to walk you through the full picture. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Cristina.`;

// UNILEVER  -  Esi Eggleston Bracey, Chief Growth & Marketing Officer
// Angle: Purpose-led marketing, Unilever brand portfolio, Cannes Lions
const unileverBody = `Hi Esi,

Unilever's commitment to purpose-led marketing has been one of the most consistent positions in the industry over the past decade, and watching it translate into genuine creative ambition across such a large and diverse portfolio is something I have a lot of respect for. The Cannes Lions work from the Unilever brands has consistently reflected a belief that doing things right and doing things well are not in conflict.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside the conversations Unilever leads at the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around purpose-led creativity - what it actually means in practice, what the evidence says about its effectiveness, and where it goes next. Your perspective on leading growth and marketing at the scale Unilever operates would be exactly what the room needs.

Bespoke deck for Unilever: ${DECK_BASE_URL}/deck/unilever

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Esi.`;

// L'OREAL  -  Adam Kornblum, Creative & Brand Leader
// Angle: Beauty innovation, AI in beauty, Pinterest Aura Beauty at Cannes
const lorealBody = `Hi Adam,

L'Oreal's creative work at Cannes has consistently shown a brand that understands how to meet cultural moments without manufacturing them. The AI in beauty space is moving fast, and the Pinterest Aura Beauty activation showed real sophistication in how you bring innovation into an experiential context. That combination of editorial credibility and genuine product innovation is rare.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks to where L'Oreal sits in the creative conversation.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a co-hosted session inside the villa around beauty, AI, and what the intersection of technology and human creativity looks like in a category as personal as this one. Your perspective on how L'Oreal navigates that would be a genuine conversation-starter in our room.

Bespoke deck for L'Oreal: ${DECK_BASE_URL}/deck/loreal

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Adam.`;

// ADIDAS  -  Valentina Benitez, Global Director Brand Comms, Originals Collaborations
// Angle: Originals collaborations, cultural partnerships, sports culture
const adidasBody = `Hi Valentina,

The Adidas Originals collaboration programme has become one of the most culturally credible things in the industry - the decisions about who to partner with, and how, are clearly rooted in a genuine understanding of culture rather than just reach metrics. That is harder to get right than most brands admit, and Adidas has been doing it consistently.

I am reaching out because we are building something at Cannes Lions 2026 that sits squarely at the intersection of sport, culture, and brand strategy.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets into the space. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around cultural partnerships and what it means to build brand relevance through collaboration rather than just sponsorship. Your perspective on how Adidas Originals approaches that would be exactly what the senior brand leaders in our house need to hear.

Bespoke deck for Adidas: ${DECK_BASE_URL}/deck/adidas

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Valentina.`;

// NIKE  -  Brand Partnerships Team
// Angle: Sport culture, athlete partnerships, brand storytelling
const nikeBody = `Hi there,

Nike's ability to find and own cultural moments - not just in sport but across music, art, and community - continues to set the standard for what brand storytelling at the highest level looks like. The athlete partnership model has evolved significantly in recent years, and the way Nike uses those relationships to say something true about culture is genuinely distinct.

I am reaching out because we are building something at Cannes Lions 2026 that sits right at the intersection of culture, sport, and senior creative leadership.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around sport culture and what authentic brand storytelling looks like when it is done at the level Nike operates. The creative leaders and CMOs in our house are the industry's best audience for that conversation.

Partnership snapshot: ${DECK_BASE_URL}/deck/nike

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// CLEAR CHANNEL  -  Brand Team
// Angle: OOH media, data-driven outdoor, brand partnerships
const clearChannelBody = `Hi there,

Clear Channel has done more than most to modernise the OOH conversation - the data-driven outdoor positioning is serious and well-evidenced, and the Cannes Lions presence has been a consistent reminder that out-of-home is not just alive but genuinely competitive with digital formats when the work is right.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside the conversations Clear Channel leads at the festival.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around the future of OOH and what data-driven outdoor means for brand strategy at the highest level. The CMOs and media leaders in our house are making the investment decisions that shape what gets built - and Clear Channel's perspective on where that goes next belongs in the room.

Partnership snapshot: ${DECK_BASE_URL}/deck/clearchannel

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
    name: 'Nabil Nasser',
    email: 'nabil.nasser@heineken.com',
    subject: 'Cannes 2026  -  the Power House and the brand behind the best ads, Nabil',
    body: heinekenBody,
  },
  {
    name: 'Valentina Benitez',
    email: 'valentina.benitez@adidas.com',
    subject: 'Cannes 2026  -  culture, sport and the Power House, Valentina',
    body: adidasBody,
  },
  // GMT  -  08:00 UTC
  {
    name: 'Cristina Diezhandino',
    email: 'cristina.diezhandino@diageo.com',
    subject: 'Cannes 2026  -  Diageo\'s portfolio in the right room, Cristina',
    body: diageoBody,
    cc: [{ address: 'amabile.guglielmino-brady@diageo.com', name: 'Amabile Guglielmino-Brady' }],
  },
  {
    name: 'Esi Eggleston Bracey',
    email: 'esi.eggleston-bracey@unilever.com',
    subject: 'Cannes 2026  -  purpose-led creativity at the Power House, Esi',
    body: unileverBody,
  },
  {
    name: 'Clear Channel Brand Team',
    email: 'brand@clearchannel.com',
    subject: 'Cannes 2026  -  OOH meets Power House',
    body: clearChannelBody,
  },
  // ET  -  12:00 UTC
  {
    name: 'Manuel Arroyo',
    email: 'manuel.arroyo@coca-cola.com',
    subject: 'Cannes 2026  -  Real Magic inside the Power House, Manolo',
    body: cocaColaBody,
  },
  {
    name: 'Marcel Marcondes',
    email: 'marcel.marcondes@ab-inbev.com',
    subject: 'Cannes 2026  -  a creative leadership conversation, Marcel',
    body: abInBevBody,
  },
  {
    name: 'Adam Kornblum',
    email: 'adam.kornblum@loreal.com',
    subject: 'Cannes 2026  -  beauty, AI and the Power House, Adam',
    body: lorealBody,
  },
  // PT  -  15:00 UTC
  {
    name: 'Nike Brand Partnerships Team',
    email: 'brand.partnerships@nike.com',
    subject: 'Cannes 2026  -  sport culture inside the Power House',
    body: nikeBody,
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
