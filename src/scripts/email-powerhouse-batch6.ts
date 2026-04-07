/**
 * email-powerhouse-batch6.ts
 *
 * Brand-customised Power House partnership pitches  -  Batch 6.
 * Wednesday 8 April 2026. Staggered by recipient timezone.
 *
 * Recipients:
 *   CET (07:00 UTC):  LVMH, Gucci, Chanel, Prada, Philipp Plein, BMW, Mercedes-Benz
 *   GMT (08:00 UTC):  Revolut
 *   ET  (12:00 UTC):  Ritz-Carlton, Rosewood Hotels, JP Morgan Chase
 *   PT  (15:00 UTC):  Stripe, Uber
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch6.ts
 * Single: SEND_ONLY=mathilde npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch6.ts
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

// LVMH  -  Mathilde Delhoume-Debreu, Global Brand Officer
// Angle: Savoir-faire, Paris 2024 Olympics, Luxury Grand Prix at Cannes
const lvmhBody = `Hi Mathilde,

LVMH's partnership with the Paris 2024 Olympics was one of the most sophisticated brand moments of the year - the way it expressed savoir-faire across the Opening Ceremony and throughout the Games showed a group that knows exactly what it is and never needs to explain itself. The Luxury Grand Prix at Cannes Lions has become one of the most meaningful categories in the festival precisely because LVMH has helped define what excellence looks like there.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks directly to where LVMH sits in the creative and cultural conversation.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a partnership that reflects the LVMH standard - an intimate dinner or a co-hosted session that brings the group's philosophy on excellence, craft, and cultural leadership into the most discerning room at Cannes.

Bespoke deck for LVMH: ${DECK_BASE_URL}/deck/lvmh

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to have a proper conversation. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Mathilde.`;

// GUCCI  -  Brand Partnerships Team
// Angle: Luxury culture, brand desirability, creative collaborations
const gucciBody = `Hi there,

Gucci's approach to brand collaborations has consistently demonstrated something rare: a house that can engage in cultural conversation without diluting what makes it desirable. The creative partnerships have been bold and considered at the same time, and the brand's ability to remain genuinely covetable while moving at the pace of culture is something the whole luxury sector watches closely.

I am reaching out because we are building something at Cannes Lions 2026 that sits at the intersection of luxury culture and senior creative leadership.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that reflects Gucci's cultural ambition - a co-hosted moment inside the villa, a branded dinner, or a presence at our Diaspora Dinner (June 23, Epi Beach) where the conversation around culture and creativity genuinely belongs.

Partnership snapshot: ${DECK_BASE_URL}/deck/gucci

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// CHANEL  -  Partnerships Team
// Angle: Heritage, luxury positioning, cultural sponsorships
const chanelBody = `Hi there,

Chanel's relationship with culture has always been on its own terms - the cultural sponsorships and partnerships have been measured, deliberate, and always in keeping with a house that has never needed to follow a trend to remain relevant. That kind of sustained brand integrity is genuinely rare, and it is reflected in the weight the Chanel name carries in every room it enters.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks to how Chanel engages with the creative industry.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that is right for Chanel - an intimate dinner, a presence at our Diaspora Dinner celebrating diverse creative talent, or a co-hosted moment inside the villa that reflects the house's standard for cultural engagement. The room is the right audience for that conversation.

Partnership snapshot: ${DECK_BASE_URL}/deck/chanel

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// PRADA  -  Brand Team
// Angle: Luxury innovation, cultural collaborations
const pradaBody = `Hi there,

Prada's approach to cultural engagement has always been intellectually rigorous in a way that most luxury houses do not attempt. The Fondazione Prada model set a template for how a fashion house can be a genuine patron of culture rather than just a sponsor of it, and that distinction matters enormously to the kind of creative leaders and CMOs who will be in our villa.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks to where Prada sits in the creative conversation.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that reflects the Prada sensibility - an intimate dinner, a co-hosted session around luxury innovation and creative leadership, or a presence that brings the house's cultural seriousness into the most discerning room at Cannes.

Partnership snapshot: ${DECK_BASE_URL}/deck/prada

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// PHILIPP PLEIN  -  Philipp Plein, Founder & CEO
// Angle: Luxury fashion, bold celebrity collaborations, unapologetic brand activations
const philippPleinBody = `Hi Philipp,

The Philipp Plein approach to brand activations is the opposite of cautious - and that is exactly what makes them memorable. The celebrity collaborations are bold and deliberate, the activations generate genuine cultural noise, and the brand has built a position in luxury that is entirely on its own terms. That takes conviction.

I am reaching out because we are building something at Cannes Lions 2026 that I think is worth your attention.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore with you is a partnership that matches the Plein energy - a branded moment inside the villa that is bold, memorable, and builds the kind of cultural conversation your brand thrives on. The most senior creative and marketing leaders in the industry will be in that house. Getting Philipp Plein into the room, on your own terms, could be a genuinely interesting moment.

Partnership snapshot: ${DECK_BASE_URL}/deck/philippplein

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Philipp.`;

// BMW  -  Brand Team
// Angle: Luxury mobility, brand storytelling, cultural sponsorships
const bmwBody = `Hi there,

BMW's history with cultural sponsorship has been one of the most consistent in the automotive category - from the Art Cars to Cannes Lions, the brand has always understood that luxury mobility and creative culture share the same audience. The storytelling around the brand continues to distinguish BMW in a market that is converging rapidly.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside BMW's cultural presence.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that reflects BMW's positioning - a branded moment inside the villa, a mobility experience for our residents during the festival week, or a co-hosted session around the future of luxury mobility and brand storytelling. The room is exactly the right audience for that conversation.

Partnership snapshot: ${DECK_BASE_URL}/deck/bmw

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// MERCEDES-BENZ  -  Brand Partnerships Team
// Angle: Luxury mobility, EV transition narrative, brand experiences
const mercedesBody = `Hi there,

Mercedes-Benz is navigating the EV transition with a brand integrity that most automotive companies are struggling to maintain - the premium positioning has held, the design language has evolved thoughtfully, and the cultural partnerships continue to signal a brand that knows exactly who it is talking to and why. That is not easy in a category moving as fast as this one.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks directly to where Mercedes-Benz sits in the conversation about luxury, culture, and the future.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that reflects the Mercedes standard - a branded mobility experience for our residents, a co-hosted session around luxury and the EV transition, or a broader presence across the week. The senior leaders in our house are exactly the audience for a brand conversation at this level.

Partnership snapshot: ${DECK_BASE_URL}/deck/mercedes

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// REVOLUT  -  Partnerships Team
// Angle: Fintech growth, challenger brand positioning, brand building
const revolutBody = `Hi there,

Revolut's growth over the past few years is one of the more interesting brand-building stories in fintech - moving from challenger to genuine scale without losing the energy that made the brand interesting in the first place. That is a balance most companies get wrong at some point, and Revolut has handled it well.

I am reaching out because we are building something at Cannes Lions 2026 that I think sits naturally alongside where Revolut is heading as a brand.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative and marketing leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around challenger brand positioning and what it means to build genuine brand trust at scale. The CMOs in our house are the people whose decisions shape the competitive landscape Revolut is navigating - that conversation, in a room this intimate, could be genuinely valuable for both sides.

Partnership snapshot: ${DECK_BASE_URL}/deck/revolut

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// RITZ-CARLTON  -  Brand Partnerships Team
// Angle: Luxury hospitality, brand experiences, Cannes Lions connection
const ritzCarltonBody = `Hi there,

The Ritz-Carlton has always understood something that most luxury brands are still trying to articulate: that the experience is the brand, not the other way around. Every touchpoint is considered, every detail is intentional, and the consistency across markets is something most hospitality brands can only aspire to. That is a rare standard.

I am reaching out because we are building something at Cannes Lions 2026 that operates at the same level of intention.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership between Ritz-Carlton and the Power House - whether through a branded dinner for our residents, a welcome experience for the Diaspora Dinner guests (June 23, Epi Beach), or a co-hosted session around luxury hospitality and the future of brand-building through experience. The room is exactly the right audience for that.

Partnership snapshot: ${DECK_BASE_URL}/deck/ritzcarlton

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// ROSEWOOD HOTELS  -  Partnerships Team
// Angle: Ultra-luxury hospitality, cultural programming, HNWI experiences
const rosewoodBody = `Hi there,

Rosewood's approach to ultra-luxury hospitality is distinct in a category that is increasingly converging - the cultural programming, the sense of place, and the genuine individuality of each property make Rosewood a brand that high-net-worth travellers actively seek out rather than just book. That level of desirability is built carefully, and it shows.

I am reaching out because we are building something at Cannes Lions 2026 that operates at a similar level of curation.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that reflects the Rosewood sensibility - a co-hosted cultural moment inside the villa, a branded dinner experience, or a partnership around our Diaspora Dinner (June 23, Epi Beach, 50 curated guests) where the intersection of culture, luxury, and human connection is exactly right for Rosewood's positioning.

Partnership snapshot: ${DECK_BASE_URL}/deck/rosewood

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// JP MORGAN CHASE  -  Brand Events Team
// Angle: Financial leadership, executive networking, brand investment
const jpMorganBody = `Hi there,

JP Morgan's presence at senior industry events has always been purposeful - the brand shows up where the most important conversations are happening, and the hosting capabilities and network that come with it consistently add genuine value rather than just a logo on a backdrop.

I am reaching out because we are building something at Cannes Lions 2026 that I think speaks to how JP Morgan engages with creative and marketing leadership.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted dinner or a branded moment inside the villa that connects JP Morgan's network with the most senior creative and marketing leaders at Cannes. The intersection of financial leadership and creative investment decisions is a conversation your team is uniquely positioned to lead.

Partnership snapshot: ${DECK_BASE_URL}/deck/jpmorgan

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// STRIPE  -  Marketing Team
// Angle: Developer economy, payments infrastructure, startup + creative crossover
const stripeBody = `Hi there,

Stripe has built the infrastructure that most of the creative economy runs on without always getting the credit for it - from independent creators to DTC brands to the platforms that power digital commerce, the Stripe layer is underneath almost everything. That quiet ubiquity is interesting from a brand perspective, and the conversations Stripe is starting to have around the intersection of developer culture and creative entrepreneurship are ones the broader industry needs to hear.

I am reaching out because we are building something at Cannes Lions 2026 that sits at exactly that intersection.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

What I would love to explore is a co-hosted session inside the villa around the infrastructure of the creative economy - what the data from Stripe's position tells us about where creative commerce is going, and what that means for brand strategy at the highest level. That conversation belongs in our room.

Partnership snapshot: ${DECK_BASE_URL}/deck/stripe

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to connect. His calendar: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;

// UBER  -  Partnerships Team
// Angle: Uber Villa at Cannes (3rd consecutive year), collaboration conversation
const uberBody = `Hi there,

This will be Uber's third consecutive year with the Uber Villa at Cannes Lions, which is a serious commitment to the festival and a signal that the format is working. The mobility and creativity angle has been smart - you are not just present at Cannes, you are woven into how the week functions for the people who matter.

I am reaching out with a thought worth considering for 2026.

Indvstry Power House is a private villa activation running alongside Cannes Lions - a curated residence hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

Rather than a traditional sponsorship conversation, what I would love to explore is a collaboration between the Uber Villa and the Power House - the two most intentional villa activations at Cannes 2026 sharing a moment rather than sitting in parallel. A joint event, a shuttle partnership for our residents, or a shared session that brings both audiences together in a way that benefits both brands. Two villas, one conversation.

Partnership snapshot: ${DECK_BASE_URL}/deck/uber

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: https://powerhouse.indvstryclvb.com

Our events lead George would love to think through what this could look like together. His calendar: https://calendly.com/itsvisionnaire/30min

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
    name: 'Mathilde Delhoume-Debreu',
    email: 'mathilde.delhoume-debreu@lvmh.com',
    subject: 'Cannes 2026  -  luxury, culture and the Power House, Mathilde',
    body: lvmhBody,
  },
  {
    name: 'Gucci Brand Partnerships',
    email: 'brand.partnerships@gucci.com',
    subject: 'Cannes 2026  -  Gucci and the Power House',
    body: gucciBody,
  },
  {
    name: 'Chanel Partnerships Team',
    email: 'partnerships@chanel.com',
    subject: 'Cannes 2026  -  heritage meets the creative conversation',
    body: chanelBody,
  },
  {
    name: 'Prada Brand Team',
    email: 'brand@prada.com',
    subject: 'Cannes 2026  -  luxury innovation inside the Power House',
    body: pradaBody,
  },
  {
    name: 'Philipp Plein',
    email: 'contact@philippplein.com',
    subject: 'Cannes 2026  -  the boldest room at the festival, Philipp',
    body: philippPleinBody,
  },
  {
    name: 'BMW Brand Team',
    email: 'marketing@bmw.com',
    subject: 'Cannes 2026  -  luxury mobility meets creative leadership',
    body: bmwBody,
  },
  {
    name: 'Mercedes-Benz Brand Partnerships',
    email: 'brand.partnerships@mercedes-benz.com',
    subject: 'Cannes 2026  -  Mercedes-Benz and the Power House',
    body: mercedesBody,
  },
  // GMT  -  08:00 UTC
  {
    name: 'Revolut Partnerships Team',
    email: 'partnerships@revolut.com',
    subject: 'Cannes 2026  -  the challenger brand conversation, at the Power House',
    body: revolutBody,
  },
  // ET  -  12:00 UTC
  {
    name: 'Ritz-Carlton Brand Partnerships',
    email: 'brandpartnerships@ritzcarlton.com',
    subject: 'Cannes 2026  -  luxury hospitality meets the Power House',
    body: ritzCarltonBody,
  },
  {
    name: 'Rosewood Partnerships Team',
    email: 'partnerships@rosewoodhotels.com',
    subject: 'Cannes 2026  -  ultra-luxury and the Power House',
    body: rosewoodBody,
  },
  {
    name: 'JP Morgan Brand Events Team',
    email: 'brand.events@jpmorgan.com',
    subject: 'Cannes 2026  -  financial leadership inside the Power House',
    body: jpMorganBody,
  },
  // PT  -  15:00 UTC
  {
    name: 'Stripe Marketing Team',
    email: 'marketing@stripe.com',
    subject: 'Cannes 2026  -  the infrastructure of creativity, Stripe',
    body: stripeBody,
  },
  {
    name: 'Uber Partnerships Team',
    email: 'partnerships@uber.com',
    subject: 'Cannes 2026  -  two villas, one conversation, Uber',
    body: uberBody,
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
