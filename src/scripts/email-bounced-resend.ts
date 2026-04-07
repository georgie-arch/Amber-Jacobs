/**
 * email-bounced-resend.ts
 *
 * Resend to all contacts whose emails bounced on 25 March 2026 from the
 * MindNode targets batch — with corrected addresses + personalised Cannes hooks.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-bounced-resend.ts
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
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
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

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
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
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

// ─── CONTACT DEFINITIONS ──────────────────────────────────────────────────────

interface Contact {
  to: string;
  name: string;
  subject: string;
  body: string;
}

const contacts: Contact[] = [

  // ─── SPOTIFY ─────────────────────────────────────────────────────────────

  {
    to: 'emmav@spotify.com',
    name: 'Emma',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Emma,

I watched your session at Spotify Beach last year - moderating the Louis Theroux and Paris Hilton conversation was a masterclass in bringing completely unexpected voices into an advertising conversation and making it land. The room was clearly there for it.

I am reaching out because we are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week for the people shaping where creativity goes next. It is a space built around real conversations, not panels with a sponsor logo and a 45-minute format.

Given everything Spotify brings to culture - and what you personally bring to the conversation around audio, podcasts, and what brands actually mean to people - I would love for you to be part of it.

I have attached our partnership deck and would really value 20 minutes on a call to talk through what involvement could look like. You can book a time directly here: https://calendly.com/itsvisionnaire/30min

Looking forward to it.

George`,
  },

  {
    to: 'kayh@spotify.com',
    name: 'Kay',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Kay,

Your point about not needing to be loud to cut through - "you just need to be relevant" - is one of those lines that sounds simple until you try to actually build something around it. It stuck with me, and it is essentially the philosophy behind what we are building.

We are bringing Indvstry Power House to Cannes Lions this June. A curated villa - not a branded beach, not a sponsor activation - just a carefully selected group of people who are actually shaping creative culture, in a setting that gives the conversation room to breathe.

With your work leading Spotify's in-house creative lab and the thinking you bring around brand-native creativity, you are exactly the kind of voice that makes these rooms worth being in.

I would love to connect about what involvement could look like. Our partnership deck is linked here for context: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call when it suits: https://calendly.com/itsvisionnaire/30min

George`,
  },

  {
    to: 'bevans@spotify.com',
    name: 'Bridget',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Bridget,

You were brilliant at Cannes Lions last year - the Rhythm and ROI session with Charlie Puth captured something real about what it means to build with culture rather than just appear in it. The point about thinking like fans and acting like creators, not just advertisers, is one that gets quoted back a lot in conversations I have had since.

I am George, founder of Indvstry Clvb, and we are bringing Indvstry Power House to Cannes this June - a curated private villa during festival week for a deliberately small group of people who are building the future of creative culture. Not a panel, not a brand activation - a proper environment for real conversations.

I would love for Spotify to be in the room, and more specifically to have you there. I think the perspective you bring on how culture actually moves through audio would resonate enormously with the people we are gathering.

Here is our partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Would love to get on a call to talk it through: https://calendly.com/itsvisionnaire/30min

George`,
  },

  {
    to: 'kkashfi@spotify.com',
    name: 'Keyana',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Keyana,

The line about Spotify Beach - "you are stepping into the app, but IRL" - is one of the best articulations of experiential brand philosophy I have come across. Building something physical that genuinely recreates a digital feeling is extraordinarily hard and you have clearly figured it out.

We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week. The brief is similar in spirit to what you do with Spotify Beach: design an environment where the experience is the message, and the right people in the right room do the rest.

Given that you run one of the most talked-about brand activations in Cannes every year, I think there is a real conversation to have about what Power House could look like with Spotify involved - whether as a partner, a collaborator on the programme, or both.

Partnership deck here: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Let us get 20 minutes in the diary: https://calendly.com/itsvisionnaire/30min

George`,
  },

  // ─── LINKEDIN ────────────────────────────────────────────────────────────

  {
    to: 'mderella@linkedin.com',
    name: 'Matt',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Matt,

The LIONS B2B Summit was a significant moment - LinkedIn as the first official B2B partner at Cannes Lions and the quote you put out around video being "the love language of the new B2B decision-makers" framed something the industry had been dancing around for a while. It was a strong first year on the beach.

I am George, founder of Indvstry Clvb. We are bringing Indvstry Power House to Cannes this June - a curated private villa during festival week for a small, deliberately assembled group of people who are building creative culture. It sits alongside the festival, not inside it - and the conversations that come out of it tend to be the ones people are still referencing a year later.

Given what LinkedIn is building in the B2B creative space and the role you are playing in that, I think there is something genuinely interesting to explore around Power House. Whether as a partner or simply as someone who should be in the room.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting.

George`,
  },

  {
    to: 'jjensen@linkedin.com',
    name: 'Jessica',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Jessica,

Your keynote at the LIONS B2B Summit last year landed something important: "AI for efficiency is table stakes. AI to drive customer growth and revenue is the frontier." That framing has come up in almost every meaningful conversation I have had about where marketing is actually heading. It cut through the noise.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week for the people who are genuinely shaping where creativity and business go next. Small group, no stage, no agenda that needs a sponsor attached to it. Just the right people in an environment designed for real conversation.

Given the platform you have built and the thinking you are bringing to B2B at LinkedIn, I would love for you to be part of it. I think the conversation you would spark in that room is exactly what Power House is for.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  {
    to: 'ahugley@linkedin.com',
    name: 'Allyson',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Allyson,

Your thinking on the CMO of the future - the idea of moving from campaign strategy to becoming "the orchestrator of a holistic organisation focused on business outcomes" - is one of the clearer articulations of where the role is heading that I have read. It maps directly to conversations we are building our programme around.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week, designed for the people who are genuinely advancing the science and strategy behind creative culture. Not a panel series, not a brand experience - a proper environment for the kind of thinking that actually moves things forward.

The work you do at LinkedIn on marketing science and measurement is exactly the kind of expertise that makes these rooms worth being in. I would love for you to be part of it.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  {
    to: 'ddamiano@linkedin.com',
    name: 'Danielle',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Danielle,

You put it perfectly when you talked about what makes great brand experiences: "Start with why people would care, not what you want to say." And "Make it participatory, not passive." That is not just good experience design - that is the brief for every great event that has ever existed. The LinkedIn Cannes presence last year was a clear execution of exactly that.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week. Given that you lead LinkedIn's third-party tentpole experiences and were a Cannes Lions judge last year, you understand this space better than almost anyone.

I would love to talk about what a LinkedIn connection to Power House could look like - you have the experience and the creative instinct to know immediately whether it is the right fit.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

20 minutes here: https://calendly.com/itsvisionnaire/30min

George`,
  },

  // ─── PAYPAL ──────────────────────────────────────────────────────────────

  {
    to: 'mgrether@paypal.com',
    name: 'Mark',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Mark,

Your line from the beach last year - "Yes you still have the creative agencies, the media agencies, new players like ourselves... and that is really kind of motivating, exciting, to see so many new things in our industry" - captured something honest about where Cannes is actually heading. PayPal on the beach felt like a genuinely new kind of presence for a payments company and the transaction graph positioning was clearly landing.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week for senior industry leaders who are building the next chapter of creative and commerce. Given what PayPal Ads is doing in the commerce media space and the role you are playing in it, you are exactly the kind of voice that belongs in this room.

I would love to explore what involvement could look like.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  // ─── EXPEDIA GROUP ───────────────────────────────────────────────────────

  {
    to: 'agorin@expediagroup.com',
    name: 'Ariane',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Ariane,

The way Expedia Group has been repositioning its brand story - around the depth of travel experience rather than just the transaction - is one of the more interesting creative pivots happening at that scale right now. There is a real sharpness to the direction.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week, designed for a deliberately small group of people who are shaping creative culture at the highest level. The conversations that come out of these spaces tend to be the ones that move things.

I would love to have a conversation about what involvement for Expedia could look like - whether as a partner or as a voice in the room.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  {
    to: 'jkoedijk@expediagroup.com',
    name: 'Jochen',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Jochen,

The brand work coming out of Expedia Group over the last 18 months has had a real clarity of purpose to it - the kind of CMO-level intent that is hard to fake and easy to recognise when it is actually there. I have been watching it with genuine interest.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week. A deliberately small group of the people who are actually shaping creative culture - built around real conversation rather than panel format.

Given the creative ambition you are bringing to Expedia Group's marketing, I think there is a lot of alignment with what we are building. I would love to talk about what a Cannes presence together could look like.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  // ─── MAGNITE ─────────────────────────────────────────────────────────────

  {
    to: 'kwilliams@magnite.com',
    name: 'Kristen',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Kristen,

The Magnite Access announcement at Cannes last year - and the positioning around helping clients actually use their first-party data rather than just talk about it - was one of the cleaner product stories on the beach. It felt like a company that had figured out what it wanted to say.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week for senior leaders in creative and media. Given your role in Magnite's strategic partnerships, I think there is a real conversation to have about what involvement could look like for the team this year.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  {
    to: 'sbuckley@magnite.com',
    name: 'Sean',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Sean,

Your perspective on simplifying the path to premium supply - and the broader point about commerce media and where programmatic actually needs to go - is the kind of thinking that makes the Cannes conversation genuinely interesting when the right people are in the room.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week for a carefully selected group of senior industry leaders. As Magnite's President of Revenue, you are building in exactly the space where the most interesting conversations are happening.

I would love to talk about what involvement for Magnite could look like this year.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  // ─── MICROSOFT ───────────────────────────────────────────────────────────

  {
    to: 'mwaltenberg@microsoft.com',
    name: 'Marcos',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Marcos,

The conversation around Microsoft Advertising and what AI actually means for the creative and media buying process - not just as an efficiency play but as a fundamental shift in how campaigns are conceived and executed - is one of the more urgent conversations in the industry right now.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week for senior leaders who are shaping the future of creative culture. Given Microsoft's position at the intersection of AI, advertising, and creative technology, I think you bring a perspective that would be genuinely valuable in this room.

I would love to explore what involvement could look like.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  // ─── JUSTIN BILLINGSLEY (LEFT MONKS - NOW SIMBIONIQ) ────────────────────

  {
    to: 'justin@justinbillingsley.me',
    name: 'Justin',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Justin,

Your point that "LLMs are not much smarter than a house cat when it comes to finding a new idea" - and the follow-up about AI eating certain parts of the agency value chain - is one of the most honest assessments of where AI and creativity actually sit right now. The Simbioniq thesis is fascinating precisely because it is trying to solve a real problem rather than just automate the existing one.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week for a deliberately small group of people who are genuinely rewriting how creative industry works. Given what you are building with Simbioniq and the thinking you bring to the AI and creativity question, you are exactly the kind of voice that belongs in this space.

I would love to talk about what involvement could look like.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },

  // ─── KEVIN McGURN (NOW AT T-MOBILE) ─────────────────────────────────────

  {
    to: 'kevin.mcgurn@t-mobile.com',
    name: 'Kevin',
    subject: 'Indvstry Power House - Cannes Lions 2026',
    body: `Hi Kevin,

Your point about measurement being "fully broken" and that standardisation being the thing standing between streaming and the large dollars that used to flow through broadcast television - that is exactly the kind of unfiltered industry diagnosis that makes a Cannes conversation worth having. It is a real problem that the industry has been talking around rather than through.

I am George, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions this June - a curated private villa during festival week. A small, deliberately assembled group of senior industry people, built around proper conversations rather than panels and scheduled activations. Given what you are building in streaming and advertising at T-Mobile, I think there is a lot of alignment with the people and themes we are gathering around.

I would love to talk about what involvement could look like.

Partnership deck: https://www.canva.com/design/DAGkFJH11UA/CqDfNjkV_X4K7sMjJWxU6w/view

Book a call: https://calendly.com/itsvisionnaire/30min

George`,
  },
];

// ─── SEND ─────────────────────────────────────────────────────────────────────

async function sendEmail(token: string, logoB64: string, contact: Contact): Promise<void> {
  const message: any = {
    subject: contact.subject,
    body: { contentType: 'HTML', content: buildHtml(contact.body) },
    toRecipients: [
      { emailAddress: { address: contact.to, name: contact.name } },
    ],
    from: {
      emailAddress: {
        address: process.env.EMAIL_USER || '',
        name: 'George Guise',
      },
    },
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

async function main() {
  const token  = await getToken();
  const logoB64 = getLogoBase64();

  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      await sendEmail(token, logoB64, contact);
      console.log(`Sent to ${contact.name} <${contact.to}>`);
      sent++;
      // Small delay between sends
      await new Promise(r => setTimeout(r, 1200));
    } catch (err: any) {
      console.error(`FAILED ${contact.to}:`, err.response?.data?.error?.message || err.message);
      failed++;
    }
  }

  console.log(`\nDone. Sent: ${sent} | Failed: ${failed}`);
}

main().catch(console.error);
