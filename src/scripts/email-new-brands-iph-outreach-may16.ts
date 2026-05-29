/**
 * email-new-brands-iph-outreach-may16.ts
 *
 * IPH partnership outreach — 11 new companies, 3 contacts each.
 * Pitch: Indvstry Power House, Cannes Lions 2026 — partnership + brand presence.
 * From: George Guise <access@indvstryclvb.com>
 *
 * Companies:
 *   Fabletics, C4 Energy (Nutrabolt), DraftKings, Qatar Airways,
 *   EasyJet, Ryanair, Wizz Air, SiriusXM, Verizon,
 *   Burn Boot Camp, Authentic Brands Group
 *
 * NOTE: All emails marked // VERIFY should be confirmed via Hunter.io before sending.
 *       Run single company first: COMPANY=fabletics npx ts-node ...
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/email-new-brands-iph-outreach-may16.ts
 *   COMPANY=ryanair npx ts-node --project tsconfig.json src/scripts/email-new-brands-iph-outreach-may16.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_LINK = 'https://canva.link/j9tgb9z2annevnz';
const SITE_LINK = 'https://lu.ma/t4ek2yn7';
const CAL_LINK  = 'https://calendly.com/itsvisionnaire/30min';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
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

function buildHtml(body: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  const formatted = body
    .split('\n\n')
    .map(p => `<p style="margin:0 0 14px 0;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${formatted}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential. Not to be forwarded without the sender's express written consent.</p>
  </div>
</body></html>`;
}

// ─── EMAIL SENDER ─────────────────────────────────────────────────────────────

async function sendEmail(
  token: string,
  toEmail: string,
  toName: string,
  subject: string,
  body: string
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: Record<string, unknown> = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: toEmail, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
  };
  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    }];
  }
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Recipient {
  firstName: string;
  fullName:  string;
  email:     string;
  roleIntro: string;
}

interface Company {
  name:         string;
  slug:         string;
  subject:      string;
  companyHook:  string;
  partnerAngle: string;
  recipients:   Recipient[];
}

function buildBody(
  firstName:   string,
  roleIntro:   string,
  hook:        string,
  angle:       string
): string {
  return `Hi ${firstName},

${hook}

${roleIntro}

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa running 21 to 26 June for a curated group of senior CMOs, creative directors, founders and brand leaders. It is where the real creative industry conversations happen during the most important week of the year.

${angle}

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

Grab a time with me here: ${CAL_LINK}

Looking forward to connecting.`;
}

// ─── COMPANIES ───────────────────────────────────────────────────────────────

const companies: Company[] = [

  // ─── 1. FABLETICS ────────────────────────────────────────────────────────────
  {
    name: 'Fabletics',
    slug: 'fabletics',
    subject: 'Fabletics x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Fabletics is one of the rare brands that has genuinely built a lifestyle around its product. With Kate Hudson at the centre and a path to one billion in revenue, what you are building is not just activewear — it is a cultural movement. Cannes Lions 2026 is exactly where that story belongs.`,
    partnerAngle: `The Power House brings together the CMOs, creative directors and brand leaders who are defining what creativity looks like across fashion, fitness and lifestyle. A Fabletics partnership here — whether a co-hosted wellness session inside the villa, branded product gifting for all 30 residents, or a presence at our Diaspora Dinner on June 23 at Epi Beach — puts the brand in the room that matters most. This is the creative industry's most senior gathering and Fabletics belongs in it.`,
    recipients: [
      {
        firstName: 'Carly',
        fullName:  'Carly Gomez',
        email:     'carly.gomez@fabletics.com', // VERIFY
        roleIntro: `As CMO you are building Fabletics into a billion-dollar cultural brand. Cannes Lions is the room where that ambition gets the creative industry's full attention.`,
      },
      {
        firstName: 'Meera',
        fullName:  'Meera Bhatia',
        email:     'meera.bhatia@fabletics.com', // VERIFY
        roleIntro: `As President and COO with oversight across the business, I wanted to share this at the strategic level — the Power House partnership is a brand conversation as much as a marketing one.`,
      },
      {
        firstName: 'Michael',
        fullName:  'Michael Gorodetskiy',
        email:     'michael.gorodetskiy@fabletics.com', // VERIFY
        roleIntro: `From a growth perspective, Cannes Lions represents exactly the kind of senior audience that makes brand partnerships worth pursuing — and the Power House concentrates them in one room for a week.`,
      },
    ],
  },

  // ─── 2. C4 ENERGY / NUTRABOLT ────────────────────────────────────────────────
  {
    name: 'C4 Energy',
    slug: 'c4energy',
    subject: 'C4 Energy x Indvstry Power House — Cannes Lions 2026',
    companyHook: `C4 is doing something that most energy drink brands cannot pull off: building genuine credibility in performance culture without losing commercial momentum. From WWE to the NBA to Top Rank Boxing, you are creating a brand that athletes and their audiences actually trust. That story deserves to be in the rooms that shape what brand partnerships look like over the next decade.`,
    partnerAngle: `The Power House brings together the most senior creative and marketing decision-makers at Cannes Lions. These are the CMOs and brand leads who are actively choosing which brands anchor their marketing partnerships. A C4 Energy presence at the villa — whether as a product partner for the week, a co-hosted session on sports and culture, or a branded moment at our Diaspora Dinner on June 23 at Epi Beach — is a statement about where C4 sits in the creative industry's conversation. This is your room.`,
    recipients: [
      {
        firstName: 'Robert',
        fullName:  'Robert Zajac',
        email:     'robert.zajac@nutrabolt.com', // VERIFY
        roleIntro: `As CMO you have repositioned C4 into a genuine cultural brand. Cannes Lions is where that repositioning gets seen by the industry leaders who will define C4's next chapter of growth.`,
      },
      {
        firstName: 'Katie',
        fullName:  'Katie Geyer',
        email:     'katie.geyer@nutrabolt.com', // VERIFY
        roleIntro: `Your remit across partnerships and experiential marketing makes this a very direct conversation — the Power House is exactly the kind of curated activation your team would build if you were doing it yourselves.`,
      },
      {
        firstName: 'Doss',
        fullName:  'Doss Cunningham',
        email:     'doss.cunningham@nutrabolt.com', // VERIFY
        roleIntro: `I wanted to reach out at the CEO level as well — the Power House sits at the intersection of culture, creativity and brand strategy, and I think there is a conversation here that goes beyond a standard sponsorship.`,
      },
    ],
  },

  // ─── 3. DRAFTKINGS ───────────────────────────────────────────────────────────
  {
    name: 'DraftKings',
    slug: 'draftkings',
    subject: 'DraftKings x Indvstry Power House — Cannes Lions 2026',
    companyHook: `DraftKings has done what almost no sports betting company has managed: crossed over from category into culture. The partnership strategy under your team — from NBCU to the Super Bowl to the World Cup — shows a brand thinking about entertainment marketing at the highest level. That conversation belongs at Cannes Lions.`,
    partnerAngle: `The Power House is where the senior brand leaders, agency heads and CMOs who are shaping the next generation of entertainment marketing spend their most valuable time during the festival. A DraftKings presence here — whether as a partner for our sports and culture programming, a co-hosted dinner with the right 25 guests, or a branded moment across the week — puts DraftKings in front of the decision-makers who define what premium entertainment partnerships look like. This is the room that matters.`,
    recipients: [
      {
        firstName: 'Stephanie',
        fullName:  'Stephanie Sherman',
        email:     'stephanie.sherman@draftkings.com', // VERIFY
        roleIntro: `Your work building DraftKings into a cultural brand, not just a betting platform, is one of the most interesting marketing stories in sport right now. The Power House is built for the CMOs who are doing exactly that kind of work.`,
      },
      {
        firstName: 'Ezra',
        fullName:  'Ezra Kucharz',
        email:     'ezra.kucharz@draftkings.com', // VERIFY — please confirm contact details
        roleIntro: `From a business leadership perspective, I wanted to ensure this reached you directly — the partnership conversation here is a strategic one as much as a marketing one.`,
      },
      {
        firstName: 'Jason',
        fullName:  'Jason Robins',
        email:     'jason.robins@draftkings.com', // VERIFY
        roleIntro: `I wanted to reach you as founder as well as through the marketing team — the Power House is the kind of initiative where having the right founder in the room is part of what makes it work.`,
      },
    ],
  },

  // ─── 4. QATAR AIRWAYS ────────────────────────────────────────────────────────
  {
    name: 'Qatar Airways',
    slug: 'qatarairways',
    subject: 'Qatar Airways x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Qatar Airways is the airline that the creative industry travels on when it wants to travel well. World's Best Airline year after year, a brand that has moved beyond aviation into genuine cultural leadership, and a presence at the world's most important events that says something about where the brand sits. Cannes Lions is exactly that kind of stage.`,
    partnerAngle: `Every creative director, CMO and brand leader attending Cannes Lions has a relationship with Qatar Airways. The Power House gives Qatar Airways the opportunity to own the most senior, most curated room of the festival. Whether that is as a travel partner for our 30 residents, a co-branded arrival moment, a dinner inside the villa, or a broader activation across the week — the alignment between Qatar's brand positioning and the Power House audience is a natural one. This is a conversation worth having.`,
    recipients: [
      {
        firstName: 'Babar',
        fullName:  'Babar Rahman',
        email:     'babar.rahman@qatarairways.com.qa', // VERIFY
        roleIntro: `As SVP Global Marketing and Corporate Communications you are building one of the world's great airline brands. Cannes Lions is where that brand gets the creative industry's full attention — and the Power House is where the most senior conversations happen.`,
      },
      {
        firstName: 'Rebecca',
        fullName:  'Rebecca Thompson',
        email:     'rebecca.thompson@qatarairways.com.qa', // VERIFY
        roleIntro: `As Head of Global Brand Marketing the Power House partnership sits right in your territory — a premium, curated brand moment at the festival where Qatar's positioning is most visible.`,
      },
      {
        firstName: 'Thierry',
        fullName:  'Thierry Antinori',
        email:     'thierry.antinori@qatarairways.com.qa', // VERIFY
        roleIntro: `I wanted this to reach commercial leadership as well as marketing — the Power House relationship has the potential to become a meaningful long-term partnership, and I think that conversation starts at the right level.`,
      },
    ],
  },

  // ─── 5. EASYJET ──────────────────────────────────────────────────────────────
  {
    name: 'EasyJet',
    slug: 'easyjet',
    subject: 'EasyJet x Indvstry Power House — Cannes Lions 2026',
    companyHook: `EasyJet is one of the most interesting brand transformation stories in European aviation right now. The decision to bring in a CMO with roots at ASOS and KAYAK says a lot about where the brand wants to go. You are building something that goes beyond flight routes — and Cannes Lions is exactly where that ambition belongs.`,
    partnerAngle: `EasyJet operates the routes that get UK creative talent to Nice and into Cannes every June. The Power House is where that talent gathers for the most curated and senior five days of the festival. A partnership that connects EasyJet's brand to the creative industry's most important week — whether through a travel partnership for residents, a co-branded moment at the villa, or a session on how great brands are built for real people — is the kind of authentic brand story Cannes Lions rewards. I would love to explore what that looks like with your team.`,
    recipients: [
      {
        firstName: 'Robert',
        fullName:  'Robert Birge',
        email:     'robert.birge@easyjet.com', // VERIFY
        roleIntro: `Your background at ASOS and KAYAK means you understand creative culture in a way that very few airline CMOs do. The Power House is built for that kind of marketer, and I think you would immediately see why this room matters.`,
      },
      {
        firstName: 'Chris',
        fullName:  'Chris Brown',
        email:     'chris.brown@easyjet.com', // VERIFY
        roleIntro: `As Head of Marketing for UK and Holidays you know better than most that Cannes Lions is a defining moment for the creative industry's relationship with travel brands. I wanted to bring this to your attention directly.`,
      },
      {
        firstName: 'Johan',
        fullName:  'Johan Lundgren',
        email:     'johan.lundgren@easyjet.com', // VERIFY
        roleIntro: `I wanted this to reach the CEO level as well — the Power House is the kind of partnership that benefits from senior endorsement, and the alignment with EasyJet's brand direction makes this worth a conversation at the top.`,
      },
    ],
  },

  // ─── 6. RYANAIR ──────────────────────────────────────────────────────────────
  {
    name: 'Ryanair',
    slug: 'ryanair',
    subject: 'Ryanair x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Ryanair's social media and brand strategy under Dara Brady's leadership is one of the most talked-about marketing stories in Europe. No other airline has built a voice like it — irreverent, confident, genuinely funny, and completely distinctive. That kind of bold brand thinking is exactly what Cannes Lions celebrates, and the industry is paying attention.`,
    partnerAngle: `The Power House villa brings together the 30 most senior creative and marketing leaders at the festival for five days of closed-door sessions and genuine conversation. These are the CMOs, agency heads and creative directors who are defining what excellent brand work looks like. A Ryanair partnership in that room — whether a co-hosted session on brand bravery and authenticity, a sponsored moment across the week, or a presence at our Diaspora Dinner on June 23 at Epi Beach — puts Ryanair at the centre of the creative industry conversation it has earned. This is the room where bold marketing gets recognised.`,
    recipients: [
      {
        firstName: 'Dara',
        fullName:  'Dara Brady',
        email:     'dara.brady@ryanair.com', // VERIFY
        roleIntro: `You have built one of the most distinctive brand voices in European marketing. The Power House is the room where the creative industry's senior leaders talk about the work that matters — and Ryanair belongs in that conversation.`,
      },
      {
        firstName: 'Emer',
        fullName:  'Emer Traynor',
        email:     'emer.traynor@ryanair.com', // VERIFY
        roleIntro: `From a communications perspective, the Power House is a genuine story — what Ryanair is doing with its brand voice is something the creative industry is watching closely, and this is the room to own that narrative.`,
      },
      {
        firstName: 'Michael',
        fullName:  'Michael O\'Leary',
        email:     'michael.oleary@ryanair.com', // VERIFY
        roleIntro: `I wanted this to reach you directly as well as the marketing team — Ryanair's brand courage under your leadership is exactly the kind of story Cannes Lions needs more of, and the Power House is where that gets its moment.`,
      },
    ],
  },

  // ─── 7. WIZZ AIR ─────────────────────────────────────────────────────────────
  {
    name: 'Wizz Air',
    slug: 'wizzair',
    subject: 'Wizz Air x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Wizz Air has become one of the fastest-growing airlines in Europe at a time when building a distinctive brand in a crowded market requires genuine strategic ambition. The routes you operate touch some of the most culturally significant cities in Europe, Central Asia and the Middle East. Cannes Lions 2026 is the moment to put that ambition in front of the creative industry's most senior voices.`,
    partnerAngle: `The Power House brings together 30 of the most senior CMOs, creative directors and brand leaders at Cannes Lions for five days of closed-door conversations and genuine connection. A Wizz Air partnership here — whether as a travel partner for residents, a branded moment at the villa, or a co-hosted session on what brand-building looks like in a hyper-competitive market — puts Wizz Air's story in front of the decision-makers who shape how brands grow at scale. I would love to explore what that looks like with your team.`,
    recipients: [
      {
        firstName: 'Boglarka',
        fullName:  'Boglarka Spak',
        email:     'boglarka.spak@wizzair.com', // VERIFY
        roleIntro: `As Head of Product and Marketing you are building the brand that Wizz Air's rapid expansion needs. Cannes Lions is where that brand gets its most senior creative audience — and the Power House is the curated setting within the festival.`,
      },
      {
        firstName: 'Jozsef',
        fullName:  'Jozsef Varadi',
        email:     'jozsef.varadi@wizzair.com', // VERIFY
        roleIntro: `I wanted this to reach CEO level as well — the Power House is a strategic partnership conversation as much as a marketing one, and the alignment with Wizz Air's growth trajectory makes it worth a direct conversation.`,
      },
      {
        firstName: 'Marion',
        fullName:  'Marion Geoffroy',
        email:     'marion.geoffroy@wizzair.com', // VERIFY — please confirm this contact is current
        roleIntro: `I wanted to ensure this reached a regional leadership perspective as well — the Power House has a strong European dimension and I think there is a natural conversation here.`,
      },
    ],
  },

  // ─── 8. SIRIUSXM ─────────────────────────────────────────────────────────────
  {
    name: 'SiriusXM',
    slug: 'siriusxm',
    subject: 'SiriusXM x Indvstry Power House — Cannes Lions 2026',
    companyHook: `SiriusXM and Pandora are at the centre of something the creative industry is finally taking seriously: audio is culture. From original content to podcasting to music discovery, you are building the platform that the most engaged audiences rely on. Cannes Lions 2026 is recognising audio creativity in ways it never has before, and SiriusXM belongs in that conversation from the front.`,
    partnerAngle: `The Power House offers something beyond a standard Cannes activation. With 30 senior CMOs, creative directors and brand leaders in residence for five days, there is a genuine content opportunity here as well as a brand one. A SiriusXM partnership could include live recording sessions inside the villa, a co-hosted session on audio and creative culture, product placement across the resident experience, or a branded moment at our Diaspora Dinner on June 23. This is where the creative industry's most senior voices gather — and SiriusXM should be capturing and shaping that conversation.`,
    recipients: [
      {
        firstName: 'Denise',
        fullName:  'Denise Karkos',
        email:     'denise.karkos@siriusxm.com', // VERIFY
        roleIntro: `Your work building SiriusXM into a cultural brand, not just a satellite radio platform, is one of the most impressive marketing evolutions in media. The Power House is built for CMOs doing exactly that kind of long-view brand work.`,
      },
      {
        firstName: 'Rolanda',
        fullName:  'Rolanda Gaines',
        email:     'rolanda.gaines@siriusxm.com', // VERIFY
        roleIntro: `As VP of Experiential and Partnership Marketing this sits squarely in your territory — the Power House is the kind of curated, high-value activation that your team would design if you were building it from scratch.`,
      },
      {
        firstName: 'Kimberly',
        fullName:  'Kimberly Wilson',
        email:     'kimberly.wilson@siriusxm.com', // VERIFY
        roleIntro: `From a brand and consumer marketing perspective, the Power House audience is exactly the segment that makes SiriusXM partnerships most valuable — senior leaders who shape how their organisations engage with audio and culture.`,
      },
    ],
  },

  // ─── 9. VERIZON ──────────────────────────────────────────────────────────────
  {
    name: 'Verizon',
    slug: 'verizon',
    subject: 'Verizon x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Verizon's marketing under Leslie Berland's leadership has become something rare in telecom: genuinely culturally relevant. From the FIFA World Cup 2026 activation to Disney Plus and Netflix partnerships, you are building a brand that people feel something about — not just a network they pay for. That is a Cannes Lions story.`,
    partnerAngle: `The Power House puts Verizon in front of the 30 most senior creative and marketing leaders at the festival for five days. These are the CMOs and brand presidents who are shaping how connectivity, content and culture intersect over the next five years. A Verizon partnership here — whether a co-hosted session on technology and creativity, branded connectivity for the villa week, a presence at our Diaspora Dinner on June 23 at Epi Beach, or a wider activation across the programme — is the kind of curated brand moment that Verizon's creative ambition deserves. I would love to explore what this looks like with your team.`,
    recipients: [
      {
        firstName: 'Leslie',
        fullName:  'Leslie Berland',
        email:     'leslie.berland@verizon.com', // VERIFY
        roleIntro: `You are one of the most respected CMOs in the industry and the Power House is built for the leaders who are thinking about brand at that level. This is a room I think you would find genuinely valuable.`,
      },
      {
        firstName: 'Justin',
        fullName:  'Justin Toman',
        email:     'justin.toman@verizon.com', // VERIFY
        roleIntro: `As VP of Partnerships with a background at PepsiCo, you know what a well-structured brand partnership looks like. The Power House is that conversation applied to Cannes Lions' most senior and curated room.`,
      },
      {
        firstName: 'Mary',
        fullName:  'Mary Sagripanti',
        email:     'mary.sagripanti@verizon.com', // VERIFY
        roleIntro: `I wanted to ensure this reached your team as well — the Power House audience spans consumer and brand in a way that is directly relevant to the work you are leading.`,
      },
    ],
  },

  // ─── 10. BURN BOOT CAMP ──────────────────────────────────────────────────────
  {
    name: 'Burn Boot Camp',
    slug: 'burnbootcamp',
    subject: 'Burn Boot Camp x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Burn Boot Camp ending 2025 with double-digit growth and Kevin Hart as an equity partner is a brand story that the marketing industry needs to hear. You have built a fitness franchise with genuine community at its core — the kind of authentic, values-led brand that Cannes Lions increasingly celebrates. This is the moment to bring that story to the world's most senior creative and marketing audience.`,
    partnerAngle: `The Power House is where 30 of the most senior brand leaders and creative directors at Cannes Lions spend their most valuable five days. A Burn Boot Camp partnership here is a statement: this is the brand that the CMOs of the world's biggest companies choose as their wellness partner. Whether that is a morning training session for residents inside the villa, Kevin Hart joining us for our Diaspora Dinner on June 23 at Epi Beach, a branded wellness moment across the week, or a co-hosted session on fitness, culture and community — this is the room where Burn Boot Camp's story reaches the industry leaders who will amplify it most.`,
    recipients: [
      {
        firstName: 'Trisha',
        fullName:  'Trisha Pena',
        email:     'trisha.pena@burnbootcamp.com', // VERIFY
        roleIntro: `As VP of Marketing you are building Burn Boot Camp's brand into something that goes well beyond fitness. Cannes Lions is where that ambition gets in front of the industry's most senior creative and brand leaders.`,
      },
      {
        firstName: 'Devan',
        fullName:  'Devan Kline',
        email:     'devan.kline@burnbootcamp.com', // VERIFY
        roleIntro: `As co-founder and CEO you have built something genuinely community-first in an industry that often only pays lip service to it. The Power House is built on the same principle and I think there is a real conversation here.`,
      },
      {
        firstName: 'Morgan',
        fullName:  'Morgan Kline',
        email:     'morgan.kline@burnbootcamp.com', // VERIFY
        roleIntro: `I wanted this to reach both founders directly — the Power House is a founder-led initiative and the alignment between what you have built and what we are doing at Cannes Lions feels natural.`,
      },
    ],
  },

  // ─── 11. AUTHENTIC BRANDS GROUP ──────────────────────────────────────────────
  {
    name: 'Authentic Brands Group',
    slug: 'authenticbrandsgroup',
    subject: 'Authentic Brands Group x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Authentic Brands Group manages some of the most iconic names in global consumer culture — Reebok, Brooks Brothers, Sports Illustrated, Juicy Couture, Elvis Presley, Muhammad Ali, and dozens more. What Nick Woodhouse and the team have built is something unique: a brand management model that takes cultural heritage and makes it commercially relevant for a new generation. That story belongs at Cannes Lions.`,
    partnerAngle: `The Power House is where 30 of the most senior creative and marketing leaders at Cannes Lions spend their most valuable five days. For a company managing 50-plus iconic brands, a single Power House partnership opens multiple doors at once. A co-branded session on building and restoring iconic brands, a dinner with the CMOs who are potential licensing or collaboration partners, or a broader presence at the villa across the week — the alignment between ABG's portfolio and the Power House audience is direct. I would love to explore what this looks like with your team.`,
    recipients: [
      {
        firstName: 'Nick',
        fullName:  'Nick Woodhouse',
        email:     'nick.woodhouse@authentic.com', // VERIFY
        roleIntro: `Your work repositioning iconic brands for the next generation is one of the most compelling stories in marketing right now. The Power House is the room where that story gets the creative industry's most senior attention, and I think you would find genuine value in being there.`,
      },
      {
        firstName: 'Natasha',
        fullName:  'Natasha Fishman',
        email:     'natasha.fishman@authentic.com', // VERIFY
        roleIntro: `As EVP Marketing you are overseeing the brand voice of some of the most recognised names in culture. The Power House gives ABG the opportunity to shape how the creative industry's senior leaders think about brand legacy and cultural relevance.`,
      },
      {
        firstName: 'Alexandra',
        fullName:  'Alexandra Taylor',
        email:     'alexandra.taylor@authentic.com', // VERIFY
        roleIntro: `From an SVP Marketing perspective, the Power House audience is exactly the segment where ABG's portfolio conversations become most valuable — senior brand leaders who are actively looking for cultural and licensing opportunities.`,
      },
    ],
  },

];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const token = await getToken();

  const filterCompany = process.env.COMPANY?.toLowerCase();
  const filtered = filterCompany
    ? companies.filter(c => c.slug === filterCompany || c.name.toLowerCase().includes(filterCompany))
    : companies;

  if (filtered.length === 0) {
    console.log(`No companies matched COMPANY="${process.env.COMPANY}". Check the slug.`);
    console.log('Available slugs:', companies.map(c => c.slug).join(', '));
    return;
  }

  const total = filtered.reduce((sum, c) => sum + c.recipients.length, 0);
  console.log(`Sending to ${filtered.length} company/companies, ${total} contact(s)...\n`);

  let sent = 0;
  let failed = 0;

  for (const company of filtered) {
    console.log(`--- ${company.name} ---`);

    for (const r of company.recipients) {
      const body = buildBody(
        r.firstName,
        r.roleIntro,
        company.companyHook,
        company.partnerAngle
      );

      try {
        await sendEmail(token, r.email, r.fullName, company.subject, body);
        console.log(`  Sent: ${r.fullName} <${r.email}>`);
        sent++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  FAILED: ${r.fullName} <${r.email}> — ${msg}`);
        failed++;
      }

      await new Promise(res => setTimeout(res, 1500));
    }

    console.log('');
  }

  console.log(`Done. ${sent} sent, ${failed} failed.`);
}

main().catch(console.error);
