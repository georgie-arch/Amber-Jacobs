/**
 * cannes-exchange-partners-outreach.ts
 *
 * Partnership pitch for Indvstry Exchange to Section 2 contacts from the Power House leads analysis.
 * Sent as George Guise. Pitches co-partnership on the Indvstry Exchange programme at Cannes Lions.
 *
 * Key angle: The EthCC/Web3 crowd will be at Cannes in June to close deals with the
 * advertising and brand world. Indvstry Exchange is the bridge. Partners co-curate and activate.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const POWERHOUSE_URL = 'https://powerhouse.indvstryclvb.com';

interface Partner {
  firstName: string;
  lastName: string;
  email: string;
  emailStatus: 'confirmed' | 'inferred';
  company: string;
  role: string;
  body: string;
}

const PARTNERS: Partner[] = [
  {
    firstName: 'Diya',
    lastName: 'Okorie',
    email: 'diya.okorie@changingeducation.co.uk',
    emailStatus: 'confirmed',
    company: 'DO CULTURE',
    role: 'Head of Culture & Partnerships',
    body: `Hi Diya,

I want to come to you with something more specific than the dinner invite I sent earlier.

We are building out Indvstry Exchange as a flagship programme within our Cannes Lions 2026 activation. The premise is a direct response to something that is actually happening this year: the founders, builders and investors who were in Brussels for EthCC in the spring are coming to Cannes in June specifically to close deals with the advertising and brand world. Two industries that have been circling each other for years are finally in the same room at the same time.

Indvstry Exchange is the structured programming that makes that conversation productive. Think curated introductions, a content series, and a room where the Web3 and creative economy communities actually meet rather than talk past each other.

The reason I am coming to DO CULTURE is that what you have been building is exactly the cultural intelligence this kind of programme needs. You understand both sides of that conversation, the community and creative economy world, and the brand and institutional world that is starting to pay attention. A partnership here would mean co-curating the cultural layer of the Exchange, bringing your network in, and having DO CULTURE's name on the programme that is genuinely doing something different at Cannes this year.

This is not a logo placement or a speaker slot. It is a genuine co-build. I would like to get on a call this week to walk you through what the full programme looks like and see where the fit is.

Amber`,
  },
  {
    firstName: 'Jade',
    lastName: 'Coles',
    email: 'jade.coles@apple.com',
    emailStatus: 'inferred',
    company: 'Apple UK',
    role: 'Head of Cultural Programming',
    body: `Hi Jade,

I wanted to follow up with something more specific.

We are running Indvstry Exchange as a core programme within our Cannes Lions activation this June. The timing is deliberate: a significant cohort of founders and builders from the Web3 and technology space who were at EthCC in the spring are returning to Cannes specifically to engage with the brand and advertising world. The infrastructure is mature enough. The budgets are ready. The question is whether the right room exists for those conversations.

Indvstry Exchange is being built to be that room. Curated sessions, structured introductions, and a content series that bridges the technology community with the creative and cultural sector.

Apple's cultural programming work is one of the most credible examples in the industry of a technology company investing in culture with genuine intention. That credibility is exactly what gives a partnership with the Exchange real weight. Whether that means Apple hosting a session, co-curating a strand of the programme, or bringing your network into the room, I would like to explore what a genuine co-partnership looks like.

This is a conversation worth having early. Would you be open to a brief call this week?

Amber`,
  },
  {
    firstName: 'Sian',
    lastName: 'Bird',
    email: 'sian.bird@wellcome.org',
    emailStatus: 'inferred',
    company: 'Wellcome Trust',
    role: 'Head of Creative & Cultural Advocacy',
    body: `Hi Sian,

A more direct ask than the last message I sent.

We are building Indvstry Exchange as a structured programme within our Cannes Lions 2026 activation. The premise is that the technology and Web3 founders who were at EthCC in the spring are coming to Cannes in June to do business with the brand and advertising world. These are not fringe conversations anymore. The compliance and regulatory maturity is in place, the institutional interest is real, and June is when it converges.

Indvstry Exchange is being designed to be the curated environment where those conversations happen properly, not on a conference panel but in a room where the people who can actually make decisions are present and connected.

The reason I am reaching out to Wellcome specifically is that the Exchange needs the kind of cross-sector credibility that a Wellcome partnership brings. The creative and cultural advocacy work you do has genuine reach across both the technology and the arts and science communities. A partnership here would give the Exchange a different dimension, and give Wellcome a presence at Cannes Lions that goes beyond the main programme.

I would like to share a fuller brief on the Exchange and talk through what a partnership could look like. Would you have time for a call this week or next?

Amber`,
  },
  {
    firstName: 'Amy',
    lastName: 'Daroukakis',
    email: 'amy.daroukakis@cultureconnectors.com',
    emailStatus: 'inferred',
    company: 'Culture Connectors',
    role: 'Global Cultural Strategist',
    body: `Hi Amy,

Following up with a more specific ask.

We are building Indvstry Exchange as the centrepiece programme of our Cannes Lions 2026 activation. The concept is grounded in something that is genuinely happening this year: the Web3, crypto and technology founders who gathered at EthCC in the spring are arriving at Cannes in June with a specific intention, to close commercial relationships with the advertising and brand industry. The cultural and creative sector is the connective tissue. And right now there is not a programme at Cannes designed to facilitate that handshake properly.

Indvstry Exchange is being built to do exactly that. Curated content, structured networking, and programming that maps the cultural intelligence of both communities to create something that produces real outcomes.

This is where Culture Connectors comes in. Global cultural strategy is the lens through which the Exchange makes sense to both sides. Your network, your credibility across markets, and your ability to read where cultural movements are heading is the kind of expertise that gives the Exchange its intellectual backbone. A partnership here would be a genuine co-build, not a sponsorship or a logo arrangement.

I would like to get on a call this week to talk through what this looks like in practice. It feels like a natural fit.

Amber`,
  },
  {
    firstName: 'Chad',
    lastName: 'Whyte',
    email: 'chad.whyte@autotrader.co.uk',
    emailStatus: 'inferred',
    company: 'Auto Trader UK',
    role: 'Head of Partnerships',
    body: `Hi Chad,

A follow up with something more direct.

We are running a programme called Indvstry Exchange as part of our Cannes Lions activation in June. The context is this: there is a specific cohort of founders, investors and technology builders who were active at EthCC in Brussels this spring who are heading to Cannes in June with the intention of doing business with the advertising and brand world. The commercial cycle is closing. The technology is mature. June is when the room that has been needed for a couple of years actually exists.

Indvstry Exchange is that room. Structured programming, curated introductions between the technology and advertising communities, and a content series designed for the people who are actually making decisions.

Auto Trader's partnerships work has always been intelligent about finding where technology and brand intersect. The Exchange is exactly that intersection, at a moment when the timing is right. A partnership could look like bringing your B2B network into the programme, a sponsored session focused on the data and platforms angle, or a co-curated strand that puts Auto Trader at the centre of a cross-sector conversation that matters.

I would like to get on a call to walk through the fuller brief. Would this week work?

Amber`,
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

async function sendEmail(token: string, partner: Partner): Promise<boolean> {
  const logo = getLogoBase64();
  const fullName = `${partner.firstName} ${partner.lastName}`.trim();

  const message: any = {
    subject: 'Indvstry Exchange — Cannes Lions 2026 partnership',
    body: { contentType: 'HTML', content: buildHtml(partner.body) },
    toRecipients: [{ emailAddress: { address: partner.email, name: fullName } }],
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
  console.log('\nIndvstry Exchange — Partner Outreach');
  console.log('═'.repeat(50));
  console.log(`Sending to ${PARTNERS.length} partners as Amber Jacobs\n`);

  const token = await getAccessToken();
  const results: { name: string; email: string; status: string }[] = [];

  for (const partner of PARTNERS) {
    const name = `${partner.firstName} ${partner.lastName}`;
    const tag = partner.emailStatus === 'inferred' ? ' [inferred]' : '';
    process.stdout.write(`  ${name} <${partner.email}>${tag}... `);

    try {
      await sendEmail(token, partner);
      console.log('sent');
      results.push({ name, email: partner.email, status: 'sent' });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`FAILED: ${msg}`);
      results.push({ name, email: partner.email, status: `failed: ${msg}` });
    }

    await new Promise(r => setTimeout(r, 700));
  }

  console.log('\n' + '═'.repeat(50));
  const sent = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status !== 'sent').length;
  console.log(`Done: ${sent} sent, ${failed} failed\n`);

  if (failed > 0) {
    console.log('Failed:');
    results.filter(r => r.status !== 'sent').forEach(r =>
      console.log(`  ${r.name} <${r.email}> - ${r.status}`)
    );
  }
}

main().catch(err => {
  console.error('Error:', err.response?.data?.error?.message || err.message);
  process.exit(1);
});
