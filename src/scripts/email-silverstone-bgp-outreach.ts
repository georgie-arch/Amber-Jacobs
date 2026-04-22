/**
 * Silverstone / British Grand Prix 2026 — Community Pass Outreach
 *
 * Targets:
 *   1. Stuart Pringle       — CEO, Silverstone Circuit        — stuart.pringle@silverstone.co.uk
 *   2. Susie Wolff          — MD, F1 Academy                  — susie.wolff@f1academy.com
 *   3. Education Team       — Silverstone Museum              — education@silverstone.co.uk
 *   4. Press / Comms        — Silverstone Circuit             — press@silverstone.co.uk
 *   5. Partnerships         — Silverstone Circuit             — partnerships@silverstone.co.uk
 *
 * NOTE: Verify email addresses before sending — these follow standard UK business conventions.
 * From: George Guise
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

// ─── EMAIL BODIES ─────────────────────────────────────────────────────────────

const stuartPringle = `Hi Stuart,

I wanted to reach out about something I think aligns directly with where you have been taking Silverstone as a venue and a brand.

I am George Guise, founder of Indvstry Clvb, a private members community for creative professionals across media, marketing, brand and culture. Our membership is made up of the kind of people who set cultural trends and influence how the next generation engages with brands, sport and live experiences.

The 2026 British Grand Prix is shaping up to be a milestone moment, and not just for the racing. With the F1 Academy making its debut at Silverstone this year, there is a real opportunity to bring in an audience that has historically not seen itself represented in the paddock. That is exactly the audience we represent.

We would love to bring a group of our members to Silverstone for the British Grand Prix weekend. In return we will create and publish dedicated social content, share coverage with our newsletter audience of over 15,000 people across the UK creative industry, and produce a short post-event impact piece showcasing the community and the circuit. We are also happy to produce content that speaks directly to Silverstone's future fanbase work and diversity agenda.

We are not looking to be treated as a charity. We are offering a genuine exchange. A new, engaged, culturally influential audience in your stands, and documented proof of Silverstone's reach beyond its traditional demographic.

Given the race weekend is only a few months away I wanted to connect now so we have time to work through the logistics properly.

If this sounds interesting I would love to get on a call. Happy to work around your schedule: https://calendly.com/itsvisionnaire/30min

George`;

const susieWolff = `Hi Susie,

I wanted to reach out ahead of what is going to be a genuinely historic moment at Silverstone this July.

I am George Guise, founder of Indvstry Clvb, a private members community for creative professionals across the UK and internationally. Our community is diverse, ambitious and exactly the kind of people who the F1 Academy was built to inspire.

The debut of the F1 Academy at the 2026 British Grand Prix is a big deal and I do not think it should only be witnessed by those who already follow Formula 1. I want to bring a group of our members to Silverstone for the weekend specifically to be in the room when it happens. People who will go home and talk about it, post about it, and carry that moment back into their industries and networks.

What we bring to the table:

We will create and share dedicated content across our social channels with a focus on the F1 Academy, female representation and what it means to have this series racing at a venue like Silverstone. We will cover the story through our newsletter, which reaches over 15,000 readers in the UK creative and brand sector. And we will produce community testimonials from members who attend, capturing the personal impact of the experience.

We would love to work with you and the F1 Academy team on this. Given the event is a few months out I wanted to get in touch now while there is still time to plan properly.

Would you or someone on your team be open to a quick call? https://calendly.com/itsvisionnaire/30min

George`;

const educationTeam = `Hi,

I am reaching out because I think there is a really natural fit between what your team does and something we are building around the 2026 British Grand Prix.

I am George Guise, founder of Indvstry Clvb, a UK-based private members community for creative professionals working across media, marketing, design, technology and culture. Many of our members come from backgrounds that are underrepresented in industries like motorsport and many of them are at the start of their careers or actively mentoring young people.

We would love to bring a group of our community to Silverstone for the British Grand Prix weekend, particularly around the F1 Academy debut. We see this as more than a race trip. It is about exposing a group of ambitious, creative people to a world they may not have considered a career destination and to the range of disciplines it takes to run a circuit, a race team or a series at this level.

In return for community passes, we will produce content spotlighting the education and STEM work happening at Silverstone, share it with our newsletter audience of over 15,000 UK industry professionals and create a post-event impact write-up that we are happy to share back with your team for your own records and reporting.

We are not a large organisation but we are influential within our community and we take access and representation seriously.

Given the race weekend is approaching quickly I wanted to get in touch now so there is enough lead time to organise travel and logistics for the group.

Would someone on your team be the right person to discuss this with? If so I would love to set up a quick call: https://calendly.com/itsvisionnaire/30min

George`;

const pressTeam = `Hi,

I am reaching out with a media and community story idea ahead of the 2026 British Grand Prix.

I am George Guise, founder of Indvstry Clvb, a UK-based private members community for creative and cultural professionals. We are planning to bring a group of our members to Silverstone for the British Grand Prix weekend, with a particular focus on the F1 Academy debut, and we want to document and share the experience.

The story we would be telling is not about the sport. It is about a new kind of audience finding its way to Silverstone for the first time. That narrative sits well alongside the work Silverstone is doing to grow its fanbase and reach communities that have not historically engaged with the circuit.

What we bring:

Social coverage across our channels with a targeted creative and cultural audience. Newsletter reach of over 15,000 UK professionals in brand, media and marketing. A short impact piece after the event documenting what the weekend meant to our community and what Silverstone represents beyond the race itself.

We would love to explore whether there is an angle here that works for your team as well. We are flexible on how this is framed and happy to align to any existing editorial priorities for the British Grand Prix.

Given we are already a few months out from the race I wanted to start the conversation now so there is enough time to make it work properly.

Happy to get on a call at any point: https://calendly.com/itsvisionnaire/30min

George`;

const partnershipsTeam = `Hi,

I wanted to reach out about a community partnership opportunity around the 2026 British Grand Prix at Silverstone.

I am George Guise, founder of Indvstry Clvb, a private members community for creative professionals across media, marketing, brand and culture in the UK and internationally. Our community is senior, diverse and culturally influential, exactly the kind of audience that brand partners and rights holders want in the room at landmark events.

The British Grand Prix this July, particularly with the F1 Academy making its Silverstone debut, presents a strong opportunity for Silverstone to demonstrate its commitment to building a more diverse fanbase. We would like to bring a group of our members to the circuit for the weekend and, in exchange, provide genuine, documented value back to Silverstone and its commercial partners.

What we offer in return for community passes:

A dedicated newsletter feature to over 15,000 UK creative industry professionals. Social content created from the event by our members, including reels and posts. Silverstone brand inclusion across our event coverage and post-race communication. A post-event impact report documenting audience reach, sentiment and engagement.

We are not asking to be treated as a charity. We are proposing a proper partnership with measurable return.

Given the event is only a few months away I wanted to open the conversation now so we have enough time to scope and plan this properly.

Would someone on your partnerships team be open to a conversation? https://calendly.com/itsvisionnaire/30min

George`;

// ─── SEND ─────────────────────────────────────────────────────────────────────

const targets = [
  {
    to: 'stuart.pringle@silverstone.co.uk',
    name: 'Stuart Pringle',
    subject: 'Indvstry Clvb x Silverstone: New Diverse Audience for the 2026 British Grand Prix',
    body: stuartPringle,
  },
  {
    to: 'susie.wolff@f1academy.com',
    name: 'Susie Wolff',
    subject: 'F1 Academy Debut at Silverstone: A Partnership Worth Having',
    body: susieWolff,
  },
  {
    to: 'education@silverstone.co.uk',
    name: 'Silverstone Education Team',
    subject: 'Indvstry Clvb x Silverstone: Community Access for the 2026 British Grand Prix',
    body: educationTeam,
  },
  {
    to: 'press@silverstone.co.uk',
    name: 'Silverstone Press Team',
    subject: 'Story Idea: A New Audience at the 2026 British Grand Prix',
    body: pressTeam,
  },
  {
    to: 'partnerships@silverstone.co.uk',
    name: 'Silverstone Partnerships Team',
    subject: 'Community Partnership Opportunity: 2026 British Grand Prix',
    body: partnershipsTeam,
  },
];

async function sendEmail(token: string, target: typeof targets[0]): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: target.subject,
    body: { contentType: 'HTML', content: buildHtml(target.body) },
    toRecipients: [{ emailAddress: { address: target.to, name: target.name } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
  };
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
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function main() {
  const token = await getToken();

  for (const target of targets) {
    await sendEmail(token, target);
    console.log(`Sent to ${target.name} <${target.to}>`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\nAll 5 sent.');
}

main().catch(console.error);
