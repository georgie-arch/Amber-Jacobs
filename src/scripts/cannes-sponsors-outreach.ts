/**
 * cannes-sponsors-outreach.ts
 *
 * Sponsorship pitch to Section 1 contacts from the Power House leads analysis.
 * Sent as George Guise. Pitches branded activation alongside the Power House villa.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const POWERHOUSE_URL = 'https://powerhouse.indvstryclvb.com';
const DINNER_URL = 'https://lu.ma/5vmr7s6f';

interface Sponsor {
  firstName: string;
  lastName: string;
  email: string;
  emailStatus: 'confirmed' | 'inferred';
  company: string;
  role: string;
  body: string;
}

const SPONSORS: Sponsor[] = [
  {
    firstName: 'Clyde',
    lastName: 'Rathbone',
    email: 'clyde@substack.com',
    emailStatus: 'confirmed',
    company: 'Substack',
    role: 'Head of Culture Partnerships',
    body: `Hi Clyde,

Following up properly on the last note I sent.

We are building something specific at Cannes Lions this June and I want to be direct about what I am asking.

Indvstry Power House is a private villa activation running 21-26 June, seven senior residents in house all week, daily transport to La Croisette, and our Diaspora Dinner on 23 June which caps at 30 guests. The villa is the base. The dinner is the moment. The whole week is a curated environment for the right conversations.

We are offering a small number of sponsorship packages that put a brand inside that environment, not on a banner or a lanyard, but inside the actual programming. For Substack that could be a content partnership, a branded session at the villa, or a curated introduction to the five or six people in residence who are exactly the kind of cultural voices Substack builds audiences around.

The numbers are not conference scale. They are not meant to be. You are buying access to a very specific room for the week that Cannes Lions concentrates the most important decision makers in the industry.

I am happy to put together a one-page breakdown of what the partnership would actually look like for Substack specifically. Worth a call this week to see if there is a fit?

Amber`,
  },
  {
    firstName: 'Tom',
    lastName: 'Taraniuk',
    email: 'tom.taraniuk@sumsub.com',
    emailStatus: 'confirmed',
    company: 'Sumsub',
    role: 'Head of Partnerships UK/EU',
    body: `Hi Tom,

Wanted to follow up with something more specific than the last message.

We are offering a small number of sponsorship positions inside Indvstry Power House at Cannes Lions this June. Seven senior residents in a private villa all week, our Diaspora Dinner on 23 June capped at 30 guests, and a curated programme that sits alongside the main festival rather than inside it.

For Sumsub, the angle is straightforward. The compliance and identity layer that Sumsub provides is exactly what every brand and agency at Cannes is going to need as they start activating in Web3 and regulated digital spaces. The Power House brings together CMOs, agency founders and brand leaders who are actively making those infrastructure decisions. A sponsored session or a branded presence at the villa puts Sumsub inside that conversation rather than pitching at it.

I am not asking for a conference-scale budget. The packages are designed for a brand that wants genuine proximity to the right ten people rather than logo placement in front of five thousand.

Happy to share specifics if the timing is right. A call this week would work well.

Amber`,
  },
  {
    firstName: 'Rita',
    lastName: 'Martins',
    email: 'rita.martins@lseg.com',
    emailStatus: 'confirmed',
    company: 'London Stock Exchange Group',
    role: 'Head of Ecosystem & Partnerships',
    body: `Hi Rita,

I wanted to follow up with something more concrete.

We are running Indvstry Power House at Cannes Lions this June, a private villa activation for senior leaders across brand, advertising, technology and culture. Seven residents in house all week, a Diaspora Dinner on 23 June for thirty guests, and a curated programme that lives alongside the main festival.

The reason I am reaching out to LSEG specifically: your ecosystem partnerships work sits at the intersection of financial infrastructure and the creative and technology sectors. That is exactly the conversation running through the Power House all week. The founders, CMOs and agency leaders in residence are the ones building the next generation of platforms and campaigns, and they need the kind of institutional relationships that LSEG is positioned to offer.

A sponsorship here would give LSEG a very different kind of Cannes presence. Not a stand on the Croisette but a seat at the table where the decisions are actually being shaped.

I am happy to put together a short proposal specific to what a partnership could look like for LSEG. Would you be open to a brief call this week?

Amber`,
  },
  {
    firstName: 'Olivia',
    lastName: 'Minnock',
    email: 'olivia@mmob.com',
    emailStatus: 'confirmed',
    company: 'mmob',
    role: 'Head of Commercial Partnerships',
    body: `Hi Olivia,

A quick follow up to the message earlier this week.

We are putting together a small number of commercial partnerships for Indvstry Power House at Cannes Lions in June. The setup is a private villa for the full festival week, seven senior residents, a curated dinner for thirty on 23 June, and programming designed to create the kind of conversations that do not happen in conference halls.

For mmob, the embedded finance angle is a natural fit. The brand and marketing leaders at Cannes are actively looking for what to build next in financial product integration and mmob is ahead of where most of them are. A sponsorship package could be as simple as a hosted conversation at the villa or a curated introduction to three or four residents who are the decision makers for exactly the kind of B2B relationships mmob is building.

The packages are small, the room is the right one, and June is when those commercial conversations convert. Happy to share what a partnership could look like in practice if it is worth exploring.

Amber`,
  },
  {
    firstName: 'Jeremy',
    lastName: 'Helfand',
    email: 'jeremy.helfand@amazon.com',
    emailStatus: 'inferred',
    company: 'Amazon Prime Video',
    role: 'Global VP Head of Advertising',
    body: `Hi Jeremy,

Following up directly on something we are building for Cannes Lions this June.

Indvstry Power House is a private villa activation running alongside the festival, 21-26 June. Seven senior residents in house all week, daily transport to La Croisette, and our Diaspora Dinner on 23 June for thirty guests. The whole activation is designed to bring together the senior brand, advertising and technology leaders who are shaping what the next five years of the industry looks like.

For Amazon Prime Video, the opportunity is a partnership that puts the advertising story inside an environment where it lands properly. The residents and dinner guests are CMOs, founders and agency leaders who are actively making streaming and connected TV decisions. A branded activation at the villa or a curated content session hosted by the Prime Video team would be a very different proposition to anything on the main Croisette.

I know the Cannes programme for major platforms fills up early. If there is any appetite to explore what a Power House partnership could look like for Prime Video this year, I would rather have that conversation now than in May.

Happy to put together a specific brief. A call this week?

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

async function sendEmail(token: string, sponsor: Sponsor): Promise<boolean> {
  const logo = getLogoBase64();
  const fullName = `${sponsor.firstName} ${sponsor.lastName}`.trim();

  const message: any = {
    subject: 'Cannes Lions 2026 — sponsorship inside the right room',
    body: { contentType: 'HTML', content: buildHtml(sponsor.body) },
    toRecipients: [{ emailAddress: { address: sponsor.email, name: fullName } }],
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
  console.log('\nIndvstry Power House — Sponsorship Outreach');
  console.log('═'.repeat(50));
  console.log(`Sending to ${SPONSORS.length} sponsors as Amber Jacobs\n`);

  const token = await getAccessToken();
  const results: { name: string; email: string; status: string }[] = [];

  for (const sponsor of SPONSORS) {
    const name = `${sponsor.firstName} ${sponsor.lastName}`;
    const tag = sponsor.emailStatus === 'inferred' ? ' [inferred]' : '';
    process.stdout.write(`  ${name} <${sponsor.email}>${tag}... `);

    try {
      await sendEmail(token, sponsor);
      console.log('sent');
      results.push({ name, email: sponsor.email, status: 'sent' });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`FAILED: ${msg}`);
      results.push({ name, email: sponsor.email, status: `failed: ${msg}` });
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
