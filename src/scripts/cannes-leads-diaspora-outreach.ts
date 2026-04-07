/**
 * cannes-leads-diaspora-outreach.ts
 *
 * Personalised outreach to 22 Cannes Lions 2026 leads from the Power House leads analysis.
 * Sent as Amber Jacobs. Invites to Diaspora Dinner + villa residency.
 *
 * Emails marked (confirmed) were in the PDF.
 * Emails marked (inferred) follow firstname.lastname@domain pattern.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const DINNER_URL = 'https://lu.ma/5vmr7s6f';
const VILLA_URL = 'https://lu.ma/t4ek2yn7';

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  emailStatus: 'confirmed' | 'inferred';
  company: string;
  role: string;
  body: string;
}

const CONTACTS: Contact[] = [
  {
    firstName: 'Clyde',
    lastName: 'Rathbone',
    email: 'clyde@substack.com',
    emailStatus: 'confirmed',
    company: 'Substack',
    role: 'Head of Culture Partnerships',
    body: `Hi Clyde,

Congratulations on the ACT Local Hero recognition earlier this year, genuinely well deserved.

I am Amber, community manager at Indvstry Clvb. Substack has spent years proving that independent creative voices have real audience power. Cannes Lions in June is where the brand budgets finally catch up to what you already know. The question is who is in the room when those conversations happen.

We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for founders, creatives and senior brand and advertising figures. The kind of room where Substack's cultural partnerships story lands perfectly.

Grab a seat here: ${DINNER_URL}

We also have a private villa running the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Worth a conversation if Cannes is on your radar.`,
  },
  {
    firstName: 'Tom',
    lastName: 'Taraniuk',
    email: 'tom.taraniuk@sumsub.com',
    emailStatus: 'confirmed',
    company: 'Sumsub',
    role: 'Head of Partnerships UK/EU',
    body: `Hi Tom,

I caught your latest episode of What The Fraud on crypto moving from growth-at-all-costs to regulated maturity. The timing is interesting because that is exactly the conversation the brand and advertising world at Cannes Lions is ready to have.

I am Amber, community manager at Indvstry Clvb. Sumsub has spent years building the compliance infrastructure that makes Web3 trustworthy. Cannes Lions in June is where the Fortune 500 marketing budgets are actively looking for what to pilot next. The regulated maturity is here. The question is who gets in the room.

We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate dinner for founders and senior figures from the advertising and brand industry. The kind of cross-pollination between fintech, Web3 and brand that does not happen at vertical conferences.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week of Cannes Lions if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to get you in the room.`,
  },
  {
    firstName: 'Rita',
    lastName: 'Martins',
    email: 'rita.martins@lseg.com',
    emailStatus: 'confirmed',
    company: 'London Stock Exchange Group',
    role: 'Head of Ecosystem & Partnerships',
    body: `Hi Rita,

I have been following LSEG's work building out its ecosystem partnerships across Europe and the thinking behind how financial infrastructure connects to the broader creative and technology world is genuinely compelling.

I am Amber, community manager at Indvstry Clvb. LSEG has spent years building the financial infrastructure that powers markets. Cannes Lions in June is where the brand and cultural economy converges, and increasingly those two worlds need each other in the room.

We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for senior leaders across brand, advertising, technology and culture. Exactly the kind of cross-sector gathering that produces the partnerships that matter.

Grab a seat here: ${DINNER_URL}

We also have a private villa running the full week of Cannes Lions if you need a base. Seven rooms, Cannes delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you in the room.`,
  },
  {
    firstName: 'Olivia',
    lastName: 'Minnock',
    email: 'olivia@mmob.com',
    emailStatus: 'confirmed',
    company: 'mmob',
    role: 'Head of Commercial Partnerships',
    body: `Hi Olivia,

The work mmob is doing around embedded finance and bringing financial products into everyday digital experiences is exactly the kind of thinking the creative industry needs more of. You are building the infrastructure. Cannes Lions in June is where the brands with the budgets to activate it come together.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for founders, creatives and senior figures from the advertising and brand world. The kind of setting where commercial partnerships actually get started.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need somewhere to base yourself in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Worth a conversation if Cannes is on your radar.`,
  },
  {
    firstName: 'Diya',
    lastName: 'Okorie',
    email: 'diya.okorie@changingeducation.co.uk',
    emailStatus: 'confirmed',
    company: 'DO CULTURE',
    role: 'Head of Culture & Partnerships',
    body: `Hi Diya,

The cultural work coming out of DO CULTURE is exactly the kind of intentional, community-rooted thinking that the industry at large is still trying to catch up with. You have spent years proving the model. Cannes Lions in June is where the brand budgets that should be backing that work actually live.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for founders, creatives and senior figures across culture, brand and advertising. It is the kind of room that feels like it was made for the conversation DO CULTURE has been leading.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week of Cannes Lions if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you there.`,
  },
  {
    firstName: 'Jeremy',
    lastName: 'Helfand',
    email: 'jeremy.helfand@amazon.com',
    emailStatus: 'inferred',
    company: 'Amazon Prime Video',
    role: 'Global VP Head of Advertising',
    body: `Hi Jeremy,

Amazon Prime Video's move into ad-supported streaming has rewritten the rules of what premium advertising looks like. You have spent the last couple of years proving the model at scale. Cannes Lions in June is where the creative industry decides what comes next, and Prime Video's voice in that conversation matters.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for senior leaders across advertising, brand and creative. The kind of setting where the real conversations happen away from the main stage.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, official delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to get you in the room.`,
  },
  {
    firstName: 'Jade',
    lastName: 'Coles',
    email: 'jade.coles@apple.com',
    emailStatus: 'inferred',
    company: 'Apple UK',
    role: 'Head of Cultural Programming',
    body: `Hi Jade,

Apple's cultural programming in the UK has set a standard for what it looks like when a technology company genuinely invests in culture rather than just sponsoring it. That kind of intentionality is rare, and it shows in the work.

I am Amber, community manager at Indvstry Clvb. Cannes Lions in June is where the global creative and brand industry comes together, and the cultural programming conversation is one of the most important ones happening there. We are hosting the Diaspora Dinner on 23 June, an intimate evening for founders, creatives and senior industry figures. It is the kind of room your work would resonate in immediately.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week of Cannes Lions if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Worth a conversation if Cannes is on your radar this year.`,
  },
  {
    firstName: 'Sian',
    lastName: 'Bird',
    email: 'sian.bird@wellcome.org',
    emailStatus: 'inferred',
    company: 'Wellcome Trust',
    role: 'Head of Creative & Cultural Advocacy',
    body: `Hi Sian,

The Wellcome Trust's approach to creative and cultural advocacy, using arts and storytelling as a vehicle for ideas that actually matter, is some of the most thoughtful work in the sector. You have been building the case for why culture and social impact belong in the same conversation. Cannes Lions in June is where that argument wins.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for founders, senior creatives and brand leaders. The kind of cross-sector room where Wellcome's work gets the audience it deserves.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you in the room.`,
  },
  {
    firstName: 'Amy',
    lastName: 'Daroukakis',
    email: 'amy.daroukakis@cultureconnectors.com',
    emailStatus: 'inferred',
    company: 'Culture Connectors',
    role: 'Global Cultural Strategist',
    body: `Hi Amy,

Global cultural strategy is one of the most undervalued disciplines in the industry, and the work Culture Connectors does to bridge that gap is exactly what the advertising and brand world needs more of. You have spent years mapping and connecting cultural movements. Cannes Lions in June is where the brands with the budgets to act on that intelligence converge.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for founders, cultural leaders and senior brand figures. It feels like a natural room for you.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week of Cannes Lions if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to get you there.`,
  },
  {
    firstName: 'Chad',
    lastName: 'Whyte',
    email: 'chad.whyte@autotrader.co.uk',
    emailStatus: 'inferred',
    company: 'Auto Trader UK',
    role: 'Head of Partnerships',
    body: `Hi Chad,

Auto Trader's partnerships work has been a strong example of a digital platform thinking beyond its vertical, finding ways to connect with culture and brand in ways that most data businesses do not bother with. That kind of thinking belongs at Cannes Lions.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for senior figures across brand, advertising and technology. The kind of setting where partnerships worth pursuing actually begin.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Worth a conversation if Cannes is on your calendar this year.`,
  },
  {
    firstName: 'Deshnie',
    lastName: 'Govender',
    email: 'deshnie.govender@loreal.com',
    emailStatus: 'inferred',
    company: "L'Oreal Luxe",
    role: 'CMO',
    body: `Hi Deshnie,

L'Oreal Luxe's approach to building brand with genuine cultural relevance, particularly across diverse and global audiences, is one of the more intelligent plays in luxury marketing right now. You have been doing the work. Cannes Lions in June is where that work gets recognised and the next chapter gets written.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for CMOs, founders and senior creatives with a focus on culture, diversity and the people actually shaping what the industry looks like next. It feels like a room you should be in.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you there.`,
  },
  {
    firstName: 'Kimberly',
    lastName: 'Kadlec',
    email: 'kimberly.kadlec@visa.com',
    emailStatus: 'inferred',
    company: 'Visa Europe',
    role: 'CMO',
    body: `Hi Kimberly,

Visa's investment in cultural sponsorship and creative marketing over the last few years has been one of the smarter long-term brand plays in financial services. You have built real credibility in a space where most fintech brands are still figuring out the basics. Cannes Lions in June is where that credibility earns its return.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for CMOs and senior creative and brand leaders. The kind of setting where the most interesting conversations of the week actually happen.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to get you in the room.`,
  },
  {
    firstName: 'Steven',
    lastName: 'Kalifowitz',
    email: 'steven.kalifowitz@crypto.com',
    emailStatus: 'inferred',
    company: 'Crypto.com',
    role: 'CMO',
    body: `Hi Steven,

Crypto.com's investment in Cannes Lions has been one of the boldest brand bets in the Web3 space and it has paid off in terms of the conversations it has opened up with the creative industry. You have spent years proving that crypto belongs in the brand and culture conversation. Cannes in June is where that proof compounds.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for CMOs, founders and senior advertising figures. The room where the next wave of Web3 and brand partnerships actually starts.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you there.`,
  },
  {
    firstName: 'Ilaria',
    lastName: 'Pasquinelli',
    email: 'ilaria.pasquinelli@canneslions.com',
    emailStatus: 'inferred',
    company: 'LIONS',
    role: 'CMO',
    body: `Hi Ilaria,

Nobody understands the Cannes Lions week better than the team that builds it. The programming and brand vision you bring to the festival shapes what the whole industry talks about for the rest of the year.

I am Amber, community manager at Indvstry Clvb. We are running Indvstry Power House alongside the festival this June, a private villa activation for founders, creatives and senior industry figures. As part of that we are hosting the Diaspora Dinner on 23 June, an intimate evening that we believe adds something genuinely different to the week's cultural programming.

We would love for you to be there: ${DINNER_URL}

We also have the villa itself available for the full week if that is of interest: ${VILLA_URL}

Would love to connect properly.`,
  },
  {
    firstName: 'Marcel',
    lastName: 'Marcondes',
    email: 'marcel.marcondes@ab-inbev.com',
    emailStatus: 'inferred',
    company: 'AB InBev',
    role: 'Global CMO',
    body: `Hi Marcel,

AB InBev's approach to creativity and cultural marketing has consistently set the benchmark at Cannes Lions. As a Jury President you have shaped what the industry holds up as the standard. That perspective is exactly what makes the conversations around the festival as valuable as the Lions themselves.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for CMOs, founders and senior creative leaders. The kind of room where the most interesting thinking of the week happens without a stage or a moderator.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you there.`,
  },
  {
    firstName: 'George',
    lastName: 'Audi',
    email: 'george.audi@duolingo.com',
    emailStatus: 'inferred',
    company: 'Duolingo',
    role: 'VP Business Development',
    body: `Hi George,

Duolingo's marketing and creative work has become a genuine cultural phenomenon. The brand has built an audience and a tone that most legacy companies spend decades trying to find. You have proved that education technology can be one of the most creatively ambitious categories in the industry. Cannes Lions in June is where that gets celebrated and the next chapter begins.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for senior leaders across brand, technology and creative. The kind of room where the Duolingo story resonates with exactly the right people.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week of Cannes Lions if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Worth a conversation if Cannes is on your radar.`,
  },
  {
    firstName: 'Marc',
    lastName: 'Thornborough',
    email: 'marc.thornborough@autotrader.co.uk',
    emailStatus: 'inferred',
    company: 'Autotrader',
    role: 'Partnerships Director',
    body: `Hi Marc,

Autotrader's partnerships work has shown that a digital marketplace can build genuine brand relevance beyond its category. You have been building those connections methodically. Cannes Lions in June is where the creative and brand industry comes together and the most interesting partnerships conversations happen outside the formal schedule.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for senior brand, technology and advertising leaders. The kind of setting where the right introductions happen naturally.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Worth a conversation if Cannes is on your calendar.`,
  },
  {
    firstName: 'Karen',
    lastName: 'Zhang',
    email: 'karen.zhang@google.com',
    emailStatus: 'inferred',
    company: 'Google Cloud',
    role: 'Startups Lead UKI',
    body: `Hi Karen,

Google Cloud's work with the startup ecosystem in the UK and Ireland has been one of the more genuinely useful partnerships programmes for founders trying to build at scale. You have spent time in the rooms where the next generation of technology companies are being built. Cannes Lions in June is where those companies meet the brands and budgets that take them to the next level.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for founders, startup leaders and senior brand figures. Exactly the cross-section that makes Google Cloud's ecosystem work meaningful.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week of Cannes Lions if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to get you in the room.`,
  },
  {
    firstName: 'Alexandra',
    lastName: 'Edmonds',
    email: 'alexandra.edmonds@mastercard.com',
    emailStatus: 'inferred',
    company: 'Mastercard',
    role: 'VP Early-Stage Investments',
    body: `Hi Alexandra,

Mastercard's presence at Cannes Lions has always been one of the more culturally intelligent in financial services and the early-stage investment work adds a dimension that most brand conversations miss entirely. You are sitting at the intersection of where capital meets creativity. That is exactly the conversation happening at Cannes this year.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for senior figures across brand, investment and creative. The kind of room where the most interesting ideas find the right backing.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you there.`,
  },
  {
    firstName: 'Natalie',
    lastName: 'Wilson',
    email: 'natalie@trustguide.ai',
    emailStatus: 'inferred',
    company: 'Trustguide.ai',
    role: 'Head of Partnerships',
    body: `Hi Natalie,

The trust and verification challenge in AI is one of the most important problems the technology industry is working on right now, and Trustguide's approach to it is exactly what the creative and brand world needs as AI becomes central to their work. You have been building the infrastructure for that trust. Cannes Lions in June is where the brands trying to navigate it come together.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for founders, technology leaders and senior brand figures. The kind of room where the AI and creativity conversation moves beyond the hype.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Worth a conversation if Cannes is on your radar.`,
  },
  {
    firstName: 'Maika',
    lastName: 'Nakaoka',
    email: 'maika.nakaoka@swarovski.com',
    emailStatus: 'inferred',
    company: 'Swarovski Foundation',
    role: 'Head of Creativity',
    body: `Hi Maika,

The Swarovski Foundation's commitment to creativity as a tool for positive change, supporting artists and designers working at the edge of what luxury and culture can mean, is one of the more thoughtful programmes in the sector. You have been championing creative work that deserves a much wider audience. Cannes Lions in June is where that audience gathers.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate three-course evening for creative leaders, founders and senior brand figures. Exactly the kind of intentional, curated gathering the Foundation's ethos aligns with.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week of Cannes Lions if you need a base. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to have you there.`,
  },
  {
    firstName: 'Christine',
    lastName: 'Kim',
    email: 'christine.kim@mozilla.com',
    emailStatus: 'inferred',
    company: 'Mozilla',
    role: 'Head of Partnerships Policy',
    body: `Hi Christine,

Mozilla's work on open web policy and partnerships sits at the intersection of technology, trust and public interest in a way that very few organisations manage to hold together. You have spent years making the case for a better internet. Cannes Lions in June is where the creative and advertising industry wrestles with its own version of that question.

I am Amber, community manager at Indvstry Clvb. We are hosting the Diaspora Dinner on 23 June during Cannes Lions week. An intimate evening for founders, policy and technology leaders and senior creative figures. The kind of room where the Mozilla perspective on where the web goes next lands with exactly the right audience.

Grab a seat here: ${DINNER_URL}

We also have a private villa for the full week if you need a base in Cannes. Seven rooms, delegate pass included, daily transport to La Croisette: ${VILLA_URL}

Would love to get you in the room.`,
  },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return res.data.access_token;
}

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logo = getLogoBase64();
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logo ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />` : ''}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function sendEmail(token: string, contact: Contact): Promise<boolean> {
  const logo = getLogoBase64();
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  const message: any = {
    subject: 'Cannes Lions 2026 — dinner worth being in the room for',
    body: { contentType: 'HTML', content: buildHtml(contact.body) },
    toRecipients: [{ emailAddress: { address: contact.email, name: fullName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };

  if (logo) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logo,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return true;
}

async function main() {
  console.log('\nIndvstry Power House — Cannes Lions 2026 Leads Outreach');
  console.log('═'.repeat(55));
  console.log(`Sending to ${CONTACTS.length} contacts as Amber Jacobs\n`);

  const confirmed = CONTACTS.filter(c => c.emailStatus === 'confirmed').length;
  const inferred = CONTACTS.filter(c => c.emailStatus === 'inferred').length;
  console.log(`  ${confirmed} confirmed emails`);
  console.log(`  ${inferred} inferred emails (pattern-matched)\n`);

  const token = await getAccessToken();
  const results: { name: string; email: string; status: string }[] = [];

  for (const contact of CONTACTS) {
    const name = `${contact.firstName} ${contact.lastName}`;
    const tag = contact.emailStatus === 'confirmed' ? '' : ' [inferred]';
    process.stdout.write(`  ${name} <${contact.email}>${tag}... `);

    try {
      await sendEmail(token, contact);
      console.log('sent');
      results.push({ name, email: contact.email, status: 'sent' });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`FAILED: ${msg}`);
      results.push({ name, email: contact.email, status: `failed: ${msg}` });
    }

    // Pause between sends
    await new Promise(r => setTimeout(r, 700));
  }

  console.log('\n' + '═'.repeat(55));
  const sent = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status !== 'sent').length;
  console.log(`Done: ${sent} sent, ${failed} failed\n`);

  if (failed > 0) {
    console.log('Failed:');
    results.filter(r => r.status !== 'sent').forEach(r => console.log(`  ${r.name} <${r.email}> - ${r.status}`));
  }
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
