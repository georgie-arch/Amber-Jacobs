/**
 * email-cannes-powerhouse-outreach.ts
 *
 * 17 personalised partnership pitches to senior Cannes Lions activation leads.
 * Each email references their specific 2025 activation and proposes a curated
 * mixer / lunch / breakfast / dinner at Indvstry Power House villa.
 *
 * Hook: €75K in delegate passes secured. Sharing access. 15-min call with George.
 * Track replies: run check-powerhouse-replies.ts
 *
 * Scheduled: Tuesday 24 March 2026 at 10:00am recipient local time.
 * Env var SEND_ONLY=key runs a single recipient (e.g. SEND_ONLY=anjali)
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

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
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64 ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />` : '';
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

async function send(token: string, to: string, toName: string, subject: string, body: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };
  if (logoB64) {
    message.attachments = [{ '@odata.type': '#microsoft.graph.fileAttachment', name: 'indvstry-logo.png', contentType: 'image/png', contentBytes: logoB64, contentId: 'indvstry-logo', isInline: true }];
  }
  await axios.post(`https://graph.microsoft.com/v1.0/me/sendMail`, { message }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
}

const CANVA = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const DECK_BASE = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const POWERHOUSE = 'https://powerhouse.indvstryclvb.com';
const CALENDLY = 'https://calendly.com/itsvisionnaire/30min';

// Brand deck slugs per recipient
const DECK_SLUGS: Record<string, string> = {
  anjali: 'tubi', javier: 'mccann', marc_p: 'amex', elizabeth: 'amex',
  diana: 'adweek', claire: 'amazon', ben: 'equativ', mike: 'reddit',
  matt: 'nielsen', sofia: 'tiktok', laurent: 'wpp', marc_s: 'brandinnovators',
  damian: 'wetransfer', rob: 'microsoft', orson: 'ft', raja: 'mastercard', carleigh: 'visa',
};
function deckLink(key: string): string { return `${DECK_BASE}/deck/${DECK_SLUGS[key] || key}`; }

// ─── RECIPIENTS ──────────────────────────────────────────────────

interface Recipient {
  key: string;
  deckSlug: string;
  name: string;
  email: string;
  subject: string;
  body: string;
}

const recipients: Recipient[] = [

  // ── 1. TUBI — Anjali Sud ──────────────────────────────────────
  {
    key: 'anjali',
    deckSlug: 'tubi',
    name: 'Anjali Sud',
    email: 'asud@tubi.tv',
    subject: 'Cannes 2026 — bringing Tubi into the villa, Anjali',
    body: `Hi Anjali,

The Tubi Cabana last year was one of the freshest moves on the Croisette — sketch artists creating satirical Cannes portraits was exactly the kind of irreverence that cuts through when everything else is trying so hard. It said everything about where Tubi is culturally right now.

I'm reaching out because we've secured a private villa as the home for Indvstry Power House at Cannes Lions 2026, and we'd love to have Tubi in the room for an evening mixer. We received over €75,000 in delegate passes as part of the activation and we want to share that access with the right partners.

The villa hosts 30 of the most senior creative and marketing leaders from across culture, brand, and agency for the week — no panels that feel like presentations, no surface-level networking. The kind of room where Tubi's story — one of the best brand comebacks in streaming — actually lands with the people who need to hear it.

A mixer hosted by Tubi inside the villa would be a completely different energy to the beach. Intimate, curated, genuinely memorable.

Here's the full partnership deck so you can see what we're putting together:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a quick 15-minute call with our events lead George to explore it? His calendar is here: ${CALENDLY}

Looking forward to hearing from you, Anjali.`,
  },

  // ── 2. McCANN — Javier Campopiano ────────────────────────────
  {
    key: 'javier',
    deckSlug: 'mccann',
    name: 'Javier Campopiano',
    email: 'javier.campopiano@mccann.com',
    subject: 'Cannes 2026 — a creative lunch worth having, Javier',
    body: `Hi Javier,

The work coming out of McCann last year — particularly the cultural ambition behind Tone Proud for TECNO, building the world's largest skin tone database for AI — was exactly the kind of work that deserves more than a trophy. It deserves a real conversation about what it took to make it happen and what it signals for where creative leadership is going.

That's the kind of conversation we're building at Indvstry Power House.

We've secured a private villa at Cannes Lions 2026 as the home for a week-long activation, and we received over €75,000 in delegate passes that we want to put to work with the right partners. We'd love to host a creative leaders lunch inside the villa — the kind where the work actually gets discussed rather than celebrated.

30 of the most senior creative directors, CMOs, and cultural figures in the industry. Closed doors, no cameras, just the people who are actually making the decisions about where creativity goes next.

McCann's voice in that room — particularly yours on what genuine creative courage looks like — would set a very different tone for the week.

Here's our partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George to talk it through? ${CALENDLY}

Looking forward to connecting, Javier.`,
  },

  // ── 3. P&G / TIDE — Marc Pritchard ───────────────────────────
  {
    key: 'marc_p',
    deckSlug: 'amex',
    name: 'Marc Pritchard',
    email: 'marc.pritchard@pg.com',
    subject: 'Cannes 2026 — a breakfast conversation worth having, Marc',
    body: `Hi Marc,

Your keynote at Cannes last year on timeless brand building — "consistent, persistent" — was one of those rare Cannes moments that cuts straight through the noise. And the Tide Collateral Stain Stories campaign backing it up, turning Marvel's narrative inside out and generating 1.6 billion earned impressions, was the proof of concept in real time.

I'm reaching out because we've secured a private villa at Cannes Lions 2026 for Indvstry Power House — a week-long activation hosting 30 of the most senior marketing and creative leaders in the industry — and we received over €75,000 in delegate passes that we're sharing with the right partners.

We'd love to host a breakfast conversation inside the villa. Something small, senior, and genuinely substantive — the kind of setting where your perspective on building brands that last, in a world obsessed with what's new, can go somewhere it never gets to on a main stage.

The people in that room are the ones implementing the decisions. The morning format is deliberate — before the Croisette starts pulling everyone in different directions.

Here's the full partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George? ${CALENDLY}

Looking forward to hearing from you, Marc.`,
  },

  // ── 4. AMEX — Elizabeth Rutledge ─────────────────────────────
  {
    key: 'elizabeth',
    deckSlug: 'amex',
    name: 'Elizabeth Rutledge',
    email: 'elizabeth.rutledge@aexp.com',
    subject: 'Cannes 2026 — an invitation from Indvstry Power House, Elizabeth',
    body: `Hi Elizabeth,

The White Lotus campaign was one of the smartest experiential plays at Cannes last year — turning a cultural moment into something that cardholders could actually live in, from custom itineraries to cocktails, was a masterclass in making brand value feel tangible rather than promised. It was also a reminder that Amex knows how to make people feel genuinely special, not just serviced.

We're building something at Cannes Lions 2026 with that same instinct.

Indvstry Power House is a private villa activation hosting 30 of the most senior creative and marketing leaders for the week — and we received over €75,000 in delegate passes as part of the activation that we want to share with the right partners. We'd love to host an intimate dinner inside the villa in partnership with Amex — the kind of evening that feels like a true Amex experience: curated, exclusive, with the right people in the room.

Small Business Saturday has been running for 15 years because it means something. A dinner inside the Power House would carry that same energy — genuine, not performative.

Here's our partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George to explore what this could look like? ${CALENDLY}

Looking forward to hearing from you, Elizabeth.`,
  },

  // ── 5. ADWEEK — Diana Littman ────────────────────────────────
  {
    key: 'diana',
    deckSlug: 'adweek',
    name: 'Diana Littman',
    email: 'diana.littman@adweek.com',
    subject: 'Cannes 2026 — an editorial breakfast at the Power House, Diana',
    body: `Hi Diana,

The Adweek House at Cannes has become the place where the real editorial conversations happen — 25 sessions, the duality of art versus science, creativity versus data. It's one of the few activations at Cannes that actually advances the industry conversation rather than just reflecting it.

I'm reaching out because we've built something at Cannes Lions 2026 that I think sits in very natural territory alongside it.

Indvstry Power House is a private villa activation hosting 30 of the most senior creative and marketing leaders for the week. We received over €75,000 in delegate passes as part of the activation and we want to share that access with the right partners.

What we'd love to explore is an editorial breakfast co-hosted with Adweek inside the villa — your editorial team shaping the conversation, our house providing the room. The kind of morning format that sets the agenda for the day rather than following it. Small, senior, off-the-record if that's more useful.

Your audience and ours are the same people. This is a natural extension of what Adweek does best, in a different kind of setting.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a quick 15-minute call with our events lead George to talk it through? ${CALENDLY}

Looking forward to connecting, Diana.`,
  },

  // ── 6. AMAZON ADS — Claire Paull ─────────────────────────────
  {
    key: 'claire',
    deckSlug: 'amazon',
    name: 'Claire Paull',
    email: 'clairepaull@amazon.com',
    subject: 'Cannes 2026 — bringing Amazon into the Power House, Claire',
    body: `Hi Claire,

The A'Maison Port last year set a new benchmark for what a brand can do at Cannes — the AWS perfume lab, the screen-free garden, Prime Video slushie bar. It was genuinely imaginative, and the fact that you brought Jamie Lee Curtis and the Kelce brothers into it without it feeling gratuitous showed real curatorial instinct. The detail was in every corner.

I'm reaching out because we've secured a private villa at Cannes Lions 2026 for Indvstry Power House and we'd love Amazon in the building.

We received over €75,000 in delegate passes as part of the activation and we're sharing that access with the partners who have earned a seat in the room. We'd love to host an evening mixer inside the villa with Amazon — 30 of the most senior creative and marketing leaders in the industry, the kind of setting where the Amazon Ads story lands with the people who matter most.

No stadium energy, no stages. Just the right conversation, with the right people, in a space that actually deserves it.

Here's the full partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George? ${CALENDLY}

Looking forward to hearing from you, Claire.`,
  },

  // ── 7. EQUATIV — Ben Skinazi ─────────────────────────────────
  {
    key: 'ben',
    deckSlug: 'equativ',
    name: 'Ben Skinazi',
    email: 'bskinazi@equativ.com',
    subject: 'Cannes 2026 — a lunch conversation at the Power House, Ben',
    body: `Hi Ben,

The Equativ presence at Cannes last year — the Grill and Chill aboard the yacht, the BE Legendary party, the panels on retail media and CTV — showed an agency that understands the social architecture of Cannes as well as the content. It's not just about the sessions, it's about where the real conversations happen between them.

We've built something at Cannes Lions 2026 that operates in exactly that spirit.

Indvstry Power House is a private villa activation hosting 30 of the most senior creative and marketing leaders for the week. We received over €75,000 in delegate passes and we want to share that access with the partners building genuinely important things in the ad technology space.

We'd love to host a working lunch inside the villa with Equativ — small, focused, the kind of format where the retail media and premium video conversation goes somewhere it doesn't normally get to at a festival. Your clients and our guests are largely the same people.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a quick 15 minutes with our events lead George to explore it? ${CALENDLY}

Looking forward to connecting, Ben.`,
  },

  // ── 8. REDDIT — Mike Romoff ──────────────────────────────────
  {
    key: 'mike',
    deckSlug: 'reddit',
    name: 'Mike Romoff',
    email: 'mromoff@reddit.com',
    subject: 'Cannes 2026 — real people, real room, Mike',
    body: `Hi Mike,

The Reddit Recommends activation last year was one of the most conceptually honest things at Cannes — letting the platform's own recommendation DNA become the entire experience, and making the point that real people's opinions carry more weight than anything a brand can manufacture. The Community Intelligence suite launch in that context was perfectly timed.

I'm reaching out because we've built something at Cannes Lions 2026 that runs on the same logic.

Indvstry Power House is a private villa activation hosting 30 of the most senior creative and marketing leaders for the week. We received over €75,000 in delegate passes and we're sharing that access with the partners who are genuinely changing how the industry thinks about audience trust.

What I'd love to explore is an evening mixer inside the villa hosted by Reddit — the kind of environment where the conversation about real community, authentic influence, and what brands get wrong about both of those things can actually happen. The people in our house are the ones making the calls. And they trust Reddit more than most people in this industry would admit publicly.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George? ${CALENDLY}

Looking forward to hearing from you, Mike.`,
  },

  // ── 9. NIELSEN — Matt Devitt ─────────────────────────────────
  {
    key: 'matt',
    deckSlug: 'nielsen',
    name: 'Matt Devitt',
    email: 'matt.devitt@nielsen.com',
    subject: 'Cannes 2026 — a breakfast briefing at the Power House, Matt',
    body: `Hi Matt,

The Nielsen Terrace at the Martinez has become one of Cannes' most reliable gathering points for the people who actually care about measurement — and the conversations you hosted last year, particularly around benchmarking in a fragmented AI-driven landscape, were exactly the kind of content the industry needs more of rather than less.

I'm reaching out because we've built something at Cannes Lions 2026 where I think there's a natural fit.

Indvstry Power House is a private villa activation hosting 30 of the most senior advertisers, agency leads, and marketing decision-makers for the week. We received over €75,000 in delegate passes and we want to share that access with partners who have genuine insight to bring to the room.

A Nielsen-hosted breakfast briefing inside the villa would give you direct access to those decision-makers in a setting that's entirely different to a terrace. Small, focused, off the main drag. The kind of format where the measurement conversation — what advertisers actually need to know going into 2027 — can go beyond a panel and into something more useful.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a quick 15 minutes with our events lead George? ${CALENDLY}

Looking forward to connecting, Matt.`,
  },

  // ── 10. TIKTOK — Sofia Hernandez ─────────────────────────────
  {
    key: 'sofia',
    deckSlug: 'tiktok',
    name: 'Sofia Hernandez',
    email: 'sofia.hernandez@tiktok.com',
    subject: 'Cannes 2026 — TikTok inside the Power House, Sofia',
    body: `Hi Sofia,

The TikTok activation at Cannes last year — the creator workshops, the Frosé Soirée, the live debut of Symphony and Smart+ — was one of the most energetic weeks on the Croisette. What stood out was how deliberately you positioned TikTok not as a platform pitching to marketers, but as a creative culture that marketers needed to catch up with. That's a fundamentally different kind of confidence.

I'm reaching out because we've secured a private villa at Cannes Lions 2026 for Indvstry Power House and we'd love TikTok in the room.

We received over €75,000 in delegate passes as part of the activation and we're sharing that access with the partners who are shaping where creative culture actually goes. We'd love to host an evening mixer inside the villa with TikTok — 30 of the most senior CMOs, creative directors, and brand leaders in the industry in a setting where the conversation about creators, culture, and commercial creativity can actually go somewhere real.

The people in our house are the ones deciding where budgets go. And they're watching TikTok more than they say in board meetings.

Here's our partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George? ${CALENDLY}

Looking forward to hearing from you, Sofia.`,
  },

  // ── 11. WPP — Laurent Ezekiel ────────────────────────────────
  {
    key: 'laurent',
    deckSlug: 'wpp',
    name: 'Laurent Ezekiel',
    email: 'laurent.ezekiel@wpp.com',
    subject: 'Cannes 2026 — a conversation from the Power House, Laurent',
    body: `Hi Laurent,

Creative Company of the Year for the second consecutive time, 168 Lions, 10 Grand Prix, Ogilvy's Vaseline Verified taking Titanium — WPP's Cannes 2025 was a genuine statement of creative intent. What's interesting is that the wins didn't feel like a campaign to win; they felt like work that actually deserved to.

I'm reaching out because we've built something at Cannes Lions 2026 that I think deserves a WPP presence.

Indvstry Power House is a private villa activation hosting 30 of the most senior creative and marketing leaders for the week. We received over €75,000 in delegate passes and we want to share that access with the partners setting the creative agenda. We'd love to host a creative leadership lunch inside the villa — the kind of room where the conversation about what great work actually requires, and what gets in the way of it, can go somewhere more honest than a stage allows.

WPP's voice in that room — at a moment when the industry is watching very closely what the next chapter looks like — would carry real weight.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George to explore it? ${CALENDLY}

Looking forward to connecting, Laurent.`,
  },

  // ── 12. BRAND INNOVATORS — Marc Sternberg ────────────────────
  {
    key: 'marc_s',
    deckSlug: 'brandinnovators',
    name: 'Marc Sternberg',
    email: 'marc@brand-innovators.com',
    subject: 'Cannes 2026 — Power House meets Brand Innovators, Marc',
    body: `Hi Marc,

Nearly doubling your footprint versus 2023, 2,000+ senior marketers through the Influential Beach — Brand Innovators has quietly become one of the defining gatherings of the week for the people who actually hold budgets. What you've built there isn't just a Cannes activation, it's a trusted network that shows up every year.

I'm reaching out because we've built something at Cannes Lions 2026 that I think your network would genuinely value being part of.

Indvstry Power House is a private villa activation hosting 30 of the most senior brand and marketing leaders for the week. We received over €75,000 in delegate passes and we're sharing that access with the right partners. We'd love to host a morning brunch inside the villa co-presented with Brand Innovators — your network, our space, the kind of intimate format that the Influential Beach opens up into when you strip it back to 30 people and a great view.

Your community and ours are the same people. This is a natural extension in a different setting.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George to talk it through? ${CALENDLY}

Looking forward to it, Marc.`,
  },

  // ── 13. WETRANSFER — Damian Bradfield ────────────────────────
  {
    key: 'damian',
    deckSlug: 'wetransfer',
    name: 'Damian Bradfield',
    email: 'damian@wetransfer.com',
    subject: 'Cannes 2026 — a creative lunch at the Power House, Damian',
    body: `Hi Damian,

WeTransfer has always understood something that most tech companies at Cannes don't — that showing up for creative culture, rather than at it, is what earns credibility with the people who actually make things. The essential guide to Cannes, the creative partnerships, the low-ego approach to the festival — it's a long game and it's worked.

I'm reaching out because we've built something at Cannes Lions 2026 that runs on the same instinct.

Indvstry Power House is a private villa activation hosting 30 of the most senior creative directors, founders, and cultural leaders for the week. We received over €75,000 in delegate passes and we want to share that access with partners who genuinely care about the creative community. We'd love to host a creative lunch inside the villa with WeTransfer — the kind of afternoon where the people in the room are there because they love the work, not because of what's on their badge.

It would be a genuinely good fit.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a quick 15 minutes with our events lead George? ${CALENDLY}

Looking forward to connecting, Damian.`,
  },

  // ── 14. MICROSOFT — Rob Wilk ─────────────────────────────────
  {
    key: 'rob',
    deckSlug: 'microsoft',
    name: 'Rob Wilk',
    email: 'robw@microsoft.com',
    subject: 'Cannes 2026 — Microsoft inside the Power House, Rob',
    body: `Hi Rob,

The Microsoft Beach House last year — 25 sessions, Brand Agents, Showroom Ads, Mustafa Suleyman on the main stage — was one of the most substantive AI showcases at Cannes. What made it different was the emphasis on AI as a companion to creativity rather than a replacement for it. That framing is the right one and it landed well with the room.

I'm reaching out because we've secured a private villa at Cannes Lions 2026 for Indvstry Power House and we'd love Microsoft Advertising in the building.

We received over €75,000 in delegate passes as part of the activation and we're sharing that access with the partners driving genuinely important work. We'd love to host a breakfast inside the villa with Microsoft — 30 of the most senior marketers, creative leaders, and brand decision-makers in the industry, in a setting where the conversation about AI, creativity, and what the next generation of advertising actually looks like can go past the surface.

The people in that room are the ones who need to hear it most directly.

Here's the full partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George? ${CALENDLY}

Looking forward to hearing from you, Rob.`,
  },

  // ── 15. FINANCIAL TIMES — Orson Francescone ──────────────────
  {
    key: 'orson',
    deckSlug: 'ft',
    name: 'Orson Francescone',
    email: 'orson.francescone@ft.com',
    subject: 'Cannes 2026 — an FT breakfast at the Power House, Orson',
    body: `Hi Orson,

The FT's presence at Cannes — the Nikkei FT Teahouse, the sessions on trust between brands and audiences, the Martin Sorrell conversation on generative AI — is consistently one of the most intellectually serious things at the festival. It attracts a different kind of attention from the people who actually shape industry thinking, and that's not an accident.

I'm reaching out because we've built something at Cannes Lions 2026 that I think sits in very natural territory alongside what the FT does.

Indvstry Power House is a private villa activation hosting 30 of the most senior business, creative, and marketing leaders for the week. We received over €75,000 in delegate passes and we want to share that access with the right partners.

What I'd love to explore is an FT-hosted breakfast briefing inside the villa — your editorial shaping the conversation, our house providing the room and the guest list. The kind of morning format that sets a genuinely substantive agenda for the week. Small, senior, the right people.

Your readers and our guests are largely the same people. This is a natural extension of what FT Live does, in a different kind of setting.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George? ${CALENDLY}

Looking forward to connecting, Orson.`,
  },

  // ── 16. MASTERCARD — Raja Rajamannar ─────────────────────────
  {
    key: 'raja',
    deckSlug: 'mastercard',
    name: 'Raja Rajamannar',
    email: 'raja.rajamannar@mastercard.com',
    subject: 'Cannes 2026 — a priceless evening at the Power House, Raja',
    body: `Hi Raja,

The sonic identity reveal with Lang Lang on the Debussy Stage last year was one of the most memorable moments of the whole festival — not because it was loud, but because it was precise. The idea that a brand can express itself in pure sound, and have a concert pianist compose it, is a genuinely bold creative decision. It said everything about where Mastercard's brand thinking is right now.

I'm reaching out because we've built something at Cannes Lions 2026 that I think deserves a Mastercard evening.

Indvstry Power House is a private villa activation hosting 30 of the most senior creative, cultural, and marketing leaders for the week. We received over €75,000 in delegate passes and we're sharing that access with the partners whose brand actually means something in those rooms. We'd love to host a private dinner inside the villa in partnership with Mastercard — the kind of priceless evening that feels like a genuine expression of the brand rather than a sponsorship. Intimate, curated, multisensory in the right way.

Your 2.7 billion cardholders trust Mastercard to make the moment feel special. This would be one of those moments for 30 people who matter.

Here's the partnership deck:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George? ${CALENDLY}

Looking forward to hearing from you, Raja.`,
  },

  // ── 17. VISA — Carleigh Jaques ───────────────────────────────
  {
    key: 'carleigh',
    deckSlug: 'visa',
    name: 'Carleigh Jaques',
    email: 'cjaques@visa.com',
    subject: 'Cannes 2026 — an exclusive dinner at the Power House, Carleigh',
    body: `Hi Carleigh,

Visa's presence at Cannes is woven into the fabric of how the festival works — which actually gives you a different kind of opportunity than most brands. You're not fighting for attention; you're already embedded. The question is where you choose to create a genuine brand moment rather than just a visible one.

That's exactly what we're building at Indvstry Power House.

We've secured a private villa at Cannes Lions 2026 as the home for a week-long activation hosting 30 of the most senior creative, marketing, and business leaders in the industry. We received over €75,000 in delegate passes and we want to share that access with partners who have a story worth telling in that room.

We'd love to host a private dinner inside the villa in partnership with Visa — an exclusive evening for the kind of people who aren't attending the main festival parties. Intimate, invitation-only, the kind of setting where Visa's role in enabling global creative commerce lands with the people who make the decisions that matter.

Here's the full partnership deck so you can see what we're building:
%%BRAND_DECK%%

And the Power House: ${POWERHOUSE}

Would you be open to a 15-minute call with our events lead George to explore it? ${CALENDLY}

Looking forward to hearing from you, Carleigh.`,
  },

];

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  const token = await getToken();
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();
  const toSend = sendOnly ? recipients.filter(r => r.key === sendOnly) : recipients;

  if (toSend.length === 0) {
    console.log(`No recipient found for SEND_ONLY=${sendOnly}`);
    process.exit(1);
  }

  for (const r of toSend) {
    const brandDeckUrl = `${DECK_BASE}/deck/${r.deckSlug}`;
    const resolvedBody = r.body.replace(
      /%%BRAND_DECK%%/g,
      `${brandDeckUrl}\n\nFull sponsorship scope: ${CANVA}`
    );
    await send(token, r.email, r.name, r.subject, resolvedBody);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    if (toSend.indexOf(r) < toSend.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log(`\n✅ ${toSend.length} email(s) sent.`);
}

main().catch(console.error);
