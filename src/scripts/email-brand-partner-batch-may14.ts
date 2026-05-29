/**
 * email-brand-partner-batch-may14.ts
 *
 * Partnership outreach to 17 companies, 3 contacts each = 51 emails.
 * Pitch: Indvstry Power House, Cannes Lions partnership + speaker opportunities.
 * From: George Guise <access@indvstryclvb.com>
 *
 * Companies:
 *   Lovable, Higgsfield AI, Epidemic Sound, Otter.ai,
 *   Dazed Media, BuzzBallz, OpenAI, Luma AI, Lu.ma,
 *   ClickUp, Crowe Media, Free Bean Coffee, Airwallex, Nift,
 *   ElevenLabs, Suno AI, Runway AI
 *
 * NOTE: Bass 44 could not be verified as a company — pending clarification from George.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-brand-partner-batch-may14.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_LINK = 'https://canva.link/j9tgb9z2annevnz';
const SITE_LINK = 'https://lu.ma/t4ek2yn7';
const CAL_LINK  = 'https://calendly.com/itsvisionnaire/30min';

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

interface Recipient {
  firstName: string;
  fullName:  string;
  email:     string;
  roleIntro: string;
}

interface Company {
  name:         string;
  subject:      string;
  companyHook:  string;
  partnerAngle: string;
  recipients:   Recipient[];
}

function buildBody(firstName: string, roleIntro: string, hook: string, angle: string): string {
  return `Hi ${firstName},

${hook}

${roleIntro}

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa, 21 to 26 June, for a curated group of senior CMOs, creative directors, founders and brand leaders. It is the space where the real creative industry conversations happen during the most important week of the year.

${angle}

We are also building our panel programme for Cannes Lions week and would love to explore whether there is a speaker opportunity that makes sense for your team.

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

Grab a time with me here: ${CAL_LINK}

Looking forward to connecting.`;
}

const companies: Company[] = [

  // ─── 1. LOVABLE ──────────────────────────────────────────────────────────────
  {
    name:    'Lovable',
    subject: 'Lovable x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Lovable hitting $200M ARR in under a year by putting AI-powered creation in the hands of non-coders is one of the most exciting growth stories in tech right now. The idea that anyone can build without having to code is exactly the kind of democratising force that Cannes Lions celebrates.`,
    partnerAngle: `The Power House brings together the CMOs, creative directors and agency leads who are actively deciding which AI tools define their workflows. Getting Lovable in that room — as a partner, a sponsor or a speaker on our AI and creativity panel — puts the brand in front of the decision-makers who matter most. We would love to explore what a partnership looks like.`,
    recipients: [
      { firstName: 'Ceci',  fullName: 'Ceci Stallsmith', email: 'ceci@lovable.dev',  roleIntro: 'As Head of Marketing you will know better than most how rare it is to get in front of 50+ senior creative and brand leaders in one curated setting.' },
      { firstName: 'Elena', fullName: 'Elena Verna',      email: 'elena@lovable.dev', roleIntro: 'Your work on growth at Lovable has been widely discussed in the product-led community — the Cannes Lions audience is exactly the next frontier for that story.' },
      { firstName: 'Theo',  fullName: 'Theo Daniellot',   email: 'theo@lovable.dev',  roleIntro: 'Given your focus on partnerships at Lovable, I think there is a genuinely interesting commercial conversation here.' },
    ],
  },

  // ─── 2. HIGGSFIELD AI ────────────────────────────────────────────────────────
  {
    name:    'Higgsfield AI',
    subject: 'Higgsfield AI x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Higgsfield AI's position at the intersection of AI and cinematic video generation is exactly where the Cannes Lions 2026 conversation is going. With dedicated AI Craft categories being introduced this year, the festival is ready to take AI-generated visual storytelling seriously — and Higgsfield is the platform built for that moment.`,
    partnerAngle: `The creative directors and brand leaders in our Power House villa are the ones building the work that will be entered into those categories. A Higgsfield partnership — as a sponsor, a featured tool at our in-house creative sessions, or a speaker on the AI storytelling panel — puts you at the centre of that conversation with exactly the right audience.`,
    recipients: [
      { firstName: 'Vladimir', fullName: 'Vladimir Karyshev', email: 'vkaryshev@higgsfield.ai', roleIntro: 'As Head of Partnerships you are the right person to explore what a Cannes Lions activation could look like for Higgsfield.' },
      { firstName: 'Jasmyn',   fullName: 'Jasmyn Jarnigan',   email: 'jjarnigan@higgsfield.ai', roleIntro: 'Your experience in B2B strategic partnerships makes this a natural conversation — the IPH network is a significant door to open.' },
      { firstName: 'Kevin',    fullName: 'Kevin Kim',          email: 'kkim@higgsfield.ai',      roleIntro: 'From a product marketing perspective, Cannes Lions is the ideal stage to position Higgsfield within the professional creative tools conversation.' },
    ],
  },

  // ─── 3. EPIDEMIC SOUND ───────────────────────────────────────────────────────
  {
    name:    'Epidemic Sound',
    subject: 'Epidemic Sound x Indvstry Power House — deeper collaboration at Cannes',
    companyHook: `Epidemic Sound returning to Cannes Lions as an official partner for the third year running is one of the clearest signals in the industry that the music and creativity conversation belongs at the festival. What you have built there — championing music's role in the creator economy from the Croisette — is something the whole industry is watching.`,
    partnerAngle: `We would love to explore how Indvstry Power House and Epidemic Sound can work more closely together this year. Whether that is co-branded programming inside the villa, Epidemic Sound featured in our resident welcome package, a joint activation for the week, or a speaker at our panel on music and creative culture — the audience is exactly right and the relationship already makes sense.`,
    recipients: [
      { firstName: 'Justin',   fullName: 'Justin Chacona',  email: 'justin.chacona@epidemicsound.com',  roleIntro: 'As VP Brand and Marketing you are the right person to talk about what a deeper Power House collaboration looks like for Epidemic Sound.' },
      { firstName: 'Bertrand', fullName: 'Bertrand Etienne', email: 'bertrand.etienne@epidemicsound.com', roleIntro: 'Your work on online marketing at Epidemic Sound has built a brand that the creative community genuinely respects — I think we can extend that at Cannes.' },
      { firstName: 'Sara',     fullName: 'Sara Borsvik',     email: 'sara.borsvik@epidemicsound.com',    roleIntro: 'I wanted to reach out at leadership level as well — this feels like a partnership with real long-term potential beyond this year.' },
    ],
  },

  // ─── 4. OTTER.AI ─────────────────────────────────────────────────────────────
  {
    name:    'Otter.ai',
    subject: 'Otter.ai x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Otter.ai is already the tool that the most productive creative teams use to make sure nothing important gets lost. At Cannes Lions — where a single conversation in a side room can change the direction of a campaign — that proposition is more relevant than anywhere else in the creative calendar.`,
    partnerAngle: `The creative directors, CMOs and agency leads in our Power House villa are exactly Otter.ai's enterprise audience. A partnership that puts Otter.ai in front of them — whether as a sponsor, a gifted product experience for all residents, or a speaker on the AI productivity and creativity panel — is a genuinely smart move for the brand.`,
    recipients: [
      { firstName: 'Chang', fullName: 'Chang Chen',        email: 'chang@otter.ai', roleIntro: 'As Head of Growth and Marketing, I think you will immediately see why the Power House audience is worth being in front of.' },
      { firstName: 'Marie', fullName: 'Marie Abesiamis',   email: 'marie@otter.ai', roleIntro: 'Given your focus on strategic partnerships, this is exactly the kind of high-value, curated activation that makes sense for Otter.ai.' },
      { firstName: 'Kenny', fullName: 'Kenny Scannell',    email: 'kenny@otter.ai', roleIntro: 'I wanted to reach out at revenue leadership level as well — the enterprise angle here is significant.' },
    ],
  },

  // ─── 5. DAZED MEDIA ──────────────────────────────────────────────────────────
  {
    name:    'Dazed Media',
    subject: 'Dazed x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Dazed Studio's ability to translate cultural credibility into brand activation is something the industry talks about for a reason. The work you are doing at the intersection of editorial authority and commercial creativity is exactly the kind of voice Cannes Lions needs more of.`,
    partnerAngle: `The Indvstry Power House villa is built on the same principle that drives Dazed — getting the right people together in the right room and letting the culture lead. I think there is a natural editorial and commercial collaboration here. Whether that is Dazed covering the Power House week, a co-branded event inside the villa, a shared panel conversation, or a wider media partnership — I would love to explore what the right shape looks like.`,
    recipients: [
      { firstName: 'Sophie', fullName: 'Sophie McElligott', email: 'sophie.mcelligott@dazedmedia.com', roleIntro: 'As CMO at Dazed you are the right person to think about where a Power House partnership sits in the broader Dazed Cannes strategy.' },
      { firstName: 'Dan',    fullName: 'Dan Fitzgerald',    email: 'dan.fitzgerald@dazedmedia.com',    roleIntro: 'Given your remit across Dazed Studio and commercial, this feels like a conversation that sits squarely in your territory.' },
      { firstName: 'Lucy',   fullName: 'Lucy Warwick',      email: 'lucy.warwick@dazedmedia.com',      roleIntro: 'As Events Director you will know better than most what the right activation framework looks like at Cannes — I would love to hear your thinking.' },
    ],
  },

  // ─── 6. BUZZBALLZ ────────────────────────────────────────────────────────────
  {
    name:    'BuzzBallz',
    subject: 'BuzzBallz x Indvstry Power House — Cannes Lions 2026',
    companyHook: `BuzzBallz's first Super Bowl in-game spot in 2026 was a real statement moment — a brand that has been building its story quietly finally stepping into the biggest creative stage in the world. The creative industry noticed and it landed well.`,
    partnerAngle: `Cannes Lions is the natural next move for BuzzBallz. The cocktail-on-the-Croisette energy that defines Cannes is made for a brand like yours. We would love to explore what a drinks partnership or activation at Indvstry Power House looks like — whether that is BuzzBallz as the official drinks partner of the villa, a co-branded pool party or evening event, or a wider Cannes presence we can build together. The audience is senior creative and brand leaders. The setting is a private luxury villa just outside the Palais. The timing is perfect.`,
    recipients: [
      { firstName: 'Merrilee', fullName: 'Merrilee Kick',  email: 'merrilee.kick@buzzballz.com',  roleIntro: 'I wanted to reach out to you directly as founder — this feels like the kind of partnership decision that starts at the top.' },
      { firstName: 'Tracy',    fullName: 'Tracy Frisbie',  email: 'tracy.frisbie@buzzballz.com',  roleIntro: 'As EVP of Sales and Marketing you are the right person to think about how a Cannes Lions activation fits into the BuzzBallz brand strategy.' },
      { firstName: 'Yashika',  fullName: 'Yashika Maru',   email: 'yashika.maru@buzzballz.com',   roleIntro: 'Your marketing experience at BuzzBallz makes you exactly the right person to talk through the creative possibilities here.' },
    ],
  },

  // ─── 7. OPENAI ───────────────────────────────────────────────────────────────
  {
    name:    'OpenAI',
    subject: 'OpenAI x Indvstry Power House — Cannes Lions 2026',
    companyHook: `OpenAI launching its first-ever global brand campaign for ChatGPT in 2025 and bringing on Michael Tabtabai as Global VP of Creative is a clear signal — this is a company that is ready to build a brand the creative industry genuinely respects, not just uses. That ambition and Cannes Lions 2026, which is introducing new AI and Data Lions categories, are made for each other.`,
    partnerAngle: `The senior creative directors, CMOs and founders in our Power House villa are making real decisions about how AI fits into their creative process right now. A partnership with Indvstry Power House — as a sponsor, a speaker at our AI and creativity panel, or a broader villa activation — puts OpenAI at the centre of that conversation in the most credible possible setting. This is where the creative industry's relationship with AI gets defined.`,
    recipients: [
      { firstName: 'Gary',    fullName: 'Gary Briggs',        email: 'gary.briggs@openai.com',        roleIntro: 'As interim Head of Marketing you are the right person to think about how OpenAI shows up boldly at Cannes Lions this year.' },
      { firstName: 'Elke',    fullName: 'Elke Karstens',      email: 'elke.karstens@openai.com',      roleIntro: 'Given your international marketing remit, Cannes Lions is the most important single moment on the global creative calendar — I wanted to make sure this was on your radar.' },
      { firstName: 'Michael', fullName: 'Michael Tabtabai',   email: 'michael.tabtabai@openai.com',   roleIntro: 'As Global VP of Creative you are building exactly the kind of brand presence at OpenAI that Cannes Lions is made for — I would love to talk.' },
    ],
  },

  // ─── 8. LUMA AI ──────────────────────────────────────────────────────────────
  {
    name:    'Luma AI',
    subject: 'Luma AI x Indvstry Power House — Cannes Lions 2026',
    companyHook: `The Dream Brief — a $1 million Cannes Lions competition with a star-studded jury and 21 AI-generated finalists — is one of the most ambitious creative industry plays any AI company has made. It is a serious statement about where Luma AI sees itself in the future of professional creative work and the industry is paying attention.`,
    partnerAngle: `You are already deeply invested in Cannes. The Power House gives you a private, senior creative audience on the ground — the CCOs, creative directors and CMOs who are actively integrating AI into their production pipelines. We would love to explore how Luma AI and Indvstry Power House can build something together for the week. A co-hosted screening or session at the villa, a Luma AI speaker on our AI creativity panel, or a wider partnership are all on the table.`,
    recipients: [
      { firstName: 'Jason',      fullName: 'Jason Day',          email: 'jason.day@lumalabs.ai',         roleIntro: 'As Head of EMEA with your background at Monks and WPP you know exactly how powerful the right Cannes activation can be — I wanted to reach out directly.' },
      { firstName: 'Caroline',   fullName: 'Caroline Ingeborn',  email: 'caroline.ingeborn@lumalabs.ai', roleIntro: 'As COO you have the overview to see why a Power House partnership extends the Dream Brief investment in a really complementary direction.' },
      { firstName: 'Verena',     fullName: 'Verena Puhm',        email: 'verena.puhm@lumalabs.ai',       roleIntro: 'The Dream Lab LA work you are leading sits perfectly alongside what we are building at the Power House — filmmaker and creator conversations are exactly where this overlaps.' },
    ],
  },

  // ─── 9. LU.MA ────────────────────────────────────────────────────────────────
  {
    name:    'Lu.ma',
    subject: 'Founder to founder — Cannes Lions 2026',
    companyHook: `Our Indvstry Power House residency at Cannes Lions 2026 runs on Lu.ma — the booking page, the event registrations, the whole experience. You are already embedded in what we are doing and I wanted to reach out founder-to-founder because I think there is a deeper partnership worth exploring.`,
    partnerAngle: `Lu.ma is the platform the creative and startup world uses to run every high-value event. The Power House brings together 50+ senior industry leaders across the festival week — founders, CMOs, creative directors. A co-marketing or featured-host partnership that builds on our existing product relationship feels natural. I would also love to have someone from the Lu.ma team at our Cannes panel programme — the conversation about the future of event discovery and community is one the industry is very ready to have.`,
    recipients: [
      { firstName: 'Victor',       fullName: 'Victor Pontis', email: 'victor@lu.ma',        roleIntro: 'I am reaching out to you directly as a fellow founder — no deck needed, just a conversation.' },
      { firstName: 'Dan',          fullName: 'Dan Liu',        email: 'dan@lu.ma',            roleIntro: 'As co-founder I wanted to make sure this reached the right person at Lu.ma for a genuine partnership conversation.' },
      { firstName: 'there',        fullName: 'Lu.ma Team',     email: 'partnerships@lu.ma',   roleIntro: 'I am reaching out about a potential partnership between Lu.ma and Indvstry Power House at Cannes Lions 2026.' },
    ],
  },

  // ─── 10. CLICKUP ─────────────────────────────────────────────────────────────
  {
    name:    'ClickUp',
    subject: 'ClickUp x Indvstry Power House — Cannes Lions 2026',
    companyHook: `ClickUp's trajectory toward $1B ARR on the back of AI-powered productivity tooling — and the recent executive hires signalling the next phase of growth — is a company that is ready to invest in building brand presence at the biggest creative and marketing events in the world.`,
    partnerAngle: `Cannes Lions is the room where that investment pays off. The CMOs, heads of creative and agency leads in our Power House villa are the exact decision-makers who choose the platforms their teams run on. A ClickUp partnership at Indvstry Power House — as a sponsor, a speaker on our productivity and AI panel, or a wider activation for the week — puts the brand in front of them in a setting where the conversation about how creative work actually gets done is genuinely happening.`,
    recipients: [
      { firstName: 'Kyle',   fullName: 'Kyle Coleman',   email: 'KColeman@clickup.com', roleIntro: 'As Global VP of Marketing you are the right person to think about where Cannes Lions fits in ClickUp\'s next phase of brand investment.' },
      { firstName: 'Jeff',   fullName: 'Jeff de Ruyter', email: 'JdeRuyter@clickup.com', roleIntro: 'Given your remit across enterprise and partnerships, the Power House network is exactly the kind of high-value access this conversation is about.' },
      { firstName: 'Gaurav', fullName: 'Gaurav Agarwal', email: 'GAgarwal@clickup.com',  roleIntro: 'I wanted to make sure this reached leadership level — the strategic alignment here is strong and I think it is worth a conversation.' },
    ],
  },

  // ─── 11. CROWE MEDIA ─────────────────────────────────────────────────────────
  {
    name:    'Crowe Media',
    subject: 'Crowe Media x Indvstry Power House — Cannes Lions 2026',
    companyHook: `The restructuring of Crowe into six specialist arms including Crowe Studios and Crowe Social is a smart and ambitious move — positioning the agency as a modern media ecosystem at exactly the right moment in the industry. The recognition from Ragan's Top Women in Communications is well-deserved.`,
    partnerAngle: `Cannes Lions is where the industry's most ambitious creative and communications teams show up. We would love to explore how Crowe Media and Indvstry Power House can work together — whether that is media partnership coverage of the Power House week, PR support for our Cannes programme, a Crowe speaker on our panel about the future of creative communications, or a wider collaboration for the festival. The audiences and ambitions align closely.`,
    recipients: [
      { firstName: 'Anna',    fullName: 'Anna Crowe',       email: 'anna.crowe@crowepr.com',    roleIntro: 'I wanted to reach out to you directly as founder — this feels like a conversation that starts at the top.' },
      { firstName: 'Natalia', fullName: 'Natalia Barclay',  email: 'natalia.barclay@crowepr.com', roleIntro: 'As VP of Communications you are perfectly placed to see how a Power House partnership maps onto Crowe\'s brand narrative at Cannes.' },
      { firstName: 'Alex',    fullName: 'Alex Meyers',      email: 'alex.meyers@crowepr.com',   roleIntro: 'As the partnerships lead at Crowe you are the right person to explore what the commercial shape of a collaboration looks like.' },
    ],
  },

  // ─── 12. FREE BEAN COFFEE ────────────────────────────────────────────────────
  {
    name:    'Free Bean Coffee',
    subject: 'Free Bean x Indvstry Power House — Cannes Lions 2026',
    companyHook: `The Free Bean model — advertising on coffee cans with 2.2% end-to-end conversion — is one of the most genuinely creative ideas in the cutting-through-the-noise conversation that defines Cannes Lions every year. Turning a commodity product into a media channel is a bold and original idea and that kind of thinking belongs at the festival.`,
    partnerAngle: `Cannes is built on exactly that conversation. We would love to explore a partnership — whether Free Bean becomes the villa's coffee partner for the week (which is a genuinely great story and a real brand moment), or we build something together around how disruptive new media formats get in front of the senior marketing leaders who attend the festival. Either way, I think there is something interesting here and would love to talk it through.`,
    recipients: [
      { firstName: 'Adam', fullName: 'Adam Korsunsky', email: 'adam@freebean.co', roleIntro: 'I wanted to reach out to you directly as co-founder — no formalities needed, just a conversation about whether there is a Cannes partnership worth exploring.' },
      { firstName: 'Brett', fullName: 'Brett Korsunsky', email: 'brett@freebean.co', roleIntro: 'As co-founder and COO you will have a clear view on whether a Cannes Lions activation is the right next move for Free Bean.' },
      { firstName: 'Jett', fullName: 'Jett Zimmerman', email: 'jett@freebean.co', roleIntro: 'As Chief Product Officer I think you would appreciate how the Power House experience could serve as the ideal test environment for the Free Bean proposition with a high-value creative audience.' },
    ],
  },

  // ─── 13. AIRWALLEX ───────────────────────────────────────────────────────────
  {
    name:    'Airwallex',
    subject: 'Airwallex x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Airwallex crossing $1B in revenue and building toward an IPO is a brand-building moment that deserves a serious creative industry presence to match the business achievement. The fintech brands that have made a mark at Cannes Lions — Visa, Mastercard and others — have used the festival to reposition their brand with the creative industry decisively.`,
    partnerAngle: `The "borderless payments for a borderless creative economy" story is a compelling Cannes Lions narrative and Indvstry Power House gives you a curated, senior audience for it. The CMOs, founders and creative directors in our villa are making decisions about the financial infrastructure their global operations run on. A partnership — as a sponsor, as the official payments partner of the Power House, or with a speaker at our fintech and creative industries panel — is a smart move at exactly the right moment for Airwallex.`,
    recipients: [
      { firstName: 'Jon',   fullName: 'Jon Stona',         email: 'jon.stona@airwallex.com',         roleIntro: 'As VP of Global Marketing with your background at Stripe, Google and Nike you know exactly how powerful a well-executed Cannes Lions activation can be.' },
      { firstName: 'James', fullName: 'James Elias',        email: 'james.elias@airwallex.com',        roleIntro: 'As VP Marketing for EMEA and based in the UK you are the right person for the Cannes conversation given the European geography of the festival.' },
      { firstName: 'Ravi',  fullName: 'Ravi Adusumilli',   email: 'ravi.adusumilli@airwallex.com',    roleIntro: 'Given your partnerships and BD remit coming from Pinterest\'s global BD function, the Power House partnership model is exactly the kind of thing worth exploring.' },
    ],
  },

  // ─── 14. NIFT ────────────────────────────────────────────────────────────────
  {
    name:    'Nift',
    subject: 'Nift x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Nift's gifting-powered discovery model — connecting consumers to brands at the moment they are most open to something new — is a concept built for the Cannes Lions audience. The senior brand marketers and CMOs who attend the festival are the exact people deciding which discovery and engagement platforms they invest in.`,
    partnerAngle: `A Nift partnership at Indvstry Power House could take a few different shapes. A gifting activation for villa residents and guests that introduces Nift to senior brand leaders in a genuinely memorable way. A sponsor presence across the week. A speaker at our marketing innovation and growth panel. Or a wider co-marketing opportunity built around the Cannes programme. We would love to explore what makes the most sense with you.`,
    recipients: [
      { firstName: 'Saket',    fullName: 'Saket Mehta',       email: 'saket.mehta@gonift.com',       roleIntro: 'As CRO with your background at Block/Cash App you will immediately see why the Power House audience is a commercial priority for Nift.' },
      { firstName: 'Kathryn',  fullName: 'Kathryn Maguire',   email: 'kathryn.maguire@gonift.com',   roleIntro: 'As a founding team member and VP of Business Development you have the full picture on why this kind of partnership creates real long-term value for Nift.' },
      { firstName: 'Rob',      fullName: 'Rob Lynch',          email: 'rob.lynch@gonift.com',         roleIntro: 'Given you joined Nift recently to build out the partnerships pipeline, the Power House feels like exactly the kind of activation worth prioritising.' },
    ],
  },

  // ─── 15. ELEVENLABS ──────────────────────────────────────────────────────────
  {
    name:    'ElevenLabs',
    subject: 'ElevenLabs x Indvstry Power House — Cannes Lions 2026',
    companyHook: `ElevenLabs powering voice and audio for the world's most ambitious creative studios puts you at the centre of a Cannes Lions category — Audio and Radio Lions — that is growing in prestige and investment every year. The future of sonic identity and AI-driven audio is one of the most exciting creative conversations at Lions in 2026.`,
    partnerAngle: `The creative directors and CMOs in our Power House villa are building exactly the kind of work ElevenLabs powers. A partnership at Indvstry Power House — sponsoring a session on the future of AI audio and sonic branding, featuring ElevenLabs in our resident toolkit, or with a speaker at our AI creativity panel — puts the brand in front of the decision-makers who are choosing their AI audio infrastructure right now. We would love to be the space where that conversation happens.`,
    recipients: [
      { firstName: 'Dustin', fullName: 'Dustin Blank',   email: 'dustin.blank@elevenlabs.io', roleIntro: 'As Head of Partnerships and with your track record of high-profile entertainment deals, I think you will immediately see the value of the Power House audience.' },
      { firstName: 'Luke',   fullName: 'Luke Harries',   email: 'luke.harries@elevenlabs.io', roleIntro: 'As Head of Growth the Cannes Lions creative industry audience is one of the highest-leverage rooms ElevenLabs could be in this year.' },
      { firstName: 'Nicolo', fullName: 'Nicolo Rossi',   email: 'nicolo.rossi@elevenlabs.io', roleIntro: 'As GTM Director you are the right person to think through how a Cannes Lions partnership fits into the ElevenLabs go-to-market strategy.' },
    ],
  },

  // ─── 16. SUNO AI ─────────────────────────────────────────────────────────────
  {
    name:    'Suno AI',
    subject: 'Suno AI x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Suno hitting 2 million paid subscribers and $300M in annual revenue is a remarkable achievement. At the scale you are now operating, Cannes Lions — which is seriously investing in its Audio and Radio Lions categories this year — becomes the natural stage for Suno to plant a flag in the professional creative industry.`,
    partnerAngle: `The founders, CMOs and creative directors in our Power House villa are the audience that shapes where the music and creativity conversation goes. A Suno partnership at Cannes Lions — as a sponsor of the villa programming, a speaker at our AI and music creativity panel, or a co-hosted experience around AI-generated music for brands — gives Suno a serious, credible presence at the festival with exactly the right people in the room.`,
    recipients: [
      { firstName: 'Jeremy', fullName: 'Jeremy Sirota',   email: 'jeremy.sirota@suno.com',   roleIntro: 'As CCO with your background leading Merlin you know exactly how important the right creative industry relationships are — Cannes Lions is where those conversations happen.' },
      { firstName: 'Paul',   fullName: 'Paul Sinclair',    email: 'paul.sinclair@suno.com',   roleIntro: 'As Chief Music Officer with your background at Atlantic Records and Warner Music, you understand better than most how the music and brand creativity conversation lands at a festival like Cannes.' },
      { firstName: 'Mikey',  fullName: 'Mikey Shulman',   email: 'mikey.shulman@suno.com',   roleIntro: 'I wanted to reach out at founder level as well — I think there is a genuinely exciting partnership here and would love to explore it with you directly.' },
    ],
  },

  // ─── 17. RUNWAY AI ───────────────────────────────────────────────────────────
  {
    name:    'Runway AI',
    subject: 'Runway x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Runway's AI Film Festival at Cannes in 2024 and 2025 — 6,000+ submissions, an IMAX partnership in year two, and Cristobal named TIME100 Next — is one of the most credible and ambitious things any AI company has done at a major creative festival. You have built a genuine relationship with the professional creative industry at Cannes and it shows.`,
    partnerAngle: `We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June — a private luxury villa for a curated group of senior creative directors, CMOs, founders and brand leaders. The people in our house are the agency and brand creatives who are actively integrating AI into their production pipelines. We would love to explore how Runway and Indvstry Power House can build something together — a co-hosted screening or creative session at the villa, a Runway speaker on our AI creativity panel, or a wider partnership for the week. This audience is exactly who you want in the room.`,
    recipients: [
      { firstName: 'Jamie',     fullName: 'Jamie Umpherson',       email: 'jamie.umpherson@runwayml.com',       roleIntro: 'As CCO you likely led or were heavily involved in the Cannes AI Film Festival activation — I wanted to reach out directly because you are the right person for this conversation.' },
      { firstName: 'Emily',     fullName: 'Emily Golden',           email: 'emily.golden@runwayml.com',           roleIntro: 'As Head of Growth Marketing the Power House audience is one of the highest-value rooms for Runway\'s brand at Cannes this year.' },
      { firstName: 'Cristobal', fullName: 'Cristobal Valenzuela',   email: 'cristobal.valenzuela@runwayml.com',   roleIntro: 'I wanted to reach out at founder level as well — with the Runway AI Film Festival track record behind us and Cannes Lions 2026 ahead, I think there is a really exciting collaboration to build.' },
    ],
  },

  // ─── 18. BASE44 ──────────────────────────────────────────────────────────────
  {
    name:    'Base44',
    subject: 'Base44 x Indvstry Power House — Cannes Lions 2026',
    companyHook: `Base44's Super Bowl debut earlier this year — "It's App to You" — put vibe coding in front of 100 million people. That campaign, combined with $100M ARR and 2 million users, signals a brand that has just made its mainstream push. Cannes Lions is the obvious next stage: it is where the creative industry's decision-makers are, and it is where the AI-meets-creativity conversation is loudest.`,
    partnerAngle: `We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June — a private luxury villa for a curated group of senior CMOs, creative directors, founders and brand leaders. These are the people building and buying the tools that Base44 is competing for. A partnership could look like Base44 hosting a session inside the villa, co-hosting a panel around AI product creation and vibe coding, or bringing your team and key partners into the house for the week. The audience is exactly right and the timing is perfect.`,
    recipients: [
      { firstName: 'Shay',   fullName: 'Shay Korin',   email: 'shay@base44.com',   roleIntro: 'As Head of Marketing you are the right person for this conversation — the Power House audience is a high-value room for Base44\'s brand at Cannes this year.' },
      { firstName: 'Shaked', fullName: 'Shaked Vered', email: 'shaked@base44.com', roleIntro: 'As Head of Go To Market, Cannes Lions is exactly the kind of stage where Base44\'s next chapter gets written in front of the right creative industry audience.' },
      { firstName: 'Guy',    fullName: 'Guy Gallant',  email: 'guy@base44.com',    roleIntro: 'As Partnerships and Marketing Manager I think there is a really natural fit here — the Power House is built around the kind of community-first, creator-focused energy that Base44 has always leaned into.' },
    ],
  },

];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let totalSent = 0;
  let totalFailed = 0;
  const totalEmails = companies.reduce((sum, c) => sum + c.recipients.length, 0);

  for (const company of companies) {
    console.log(`\n── ${company.name} ──`);
    for (const r of company.recipients) {
      try {
        const body = buildBody(r.firstName, r.roleIntro, company.companyHook, company.partnerAngle);
        const message: any = {
          subject: company.subject,
          body:    { contentType: 'HTML', content: buildHtml(body) },
          toRecipients: [{ emailAddress: { address: r.email, name: r.fullName } }],
          from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
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
        totalSent++;
        console.log(`  [${totalSent}/${totalEmails}] Sent  -> ${r.fullName} <${r.email}>`);
      } catch (err: any) {
        totalFailed++;
        console.error(`  FAILED -> ${r.fullName} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
      }
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\n\nDone. ${totalSent} sent, ${totalFailed} failed out of ${totalEmails} total.`);
  if (totalFailed > 0) console.log('Check failed emails above and re-send manually if needed.');
}

sendAll().catch(console.error);
