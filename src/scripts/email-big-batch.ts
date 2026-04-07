/**
 * Big batch outreach — all from Amber Jacobs
 * 16 contacts, different angles for each
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

const SUBJECT = 'Indvstry Power House - Cannes Lions 2026';

// ─── 1. GYMSHARK ─────────────────────────────────────────────────────────────
const gymsharkBody = `Hi Gina,

I wanted to reach out about a partnership opportunity we think is a brilliant fit for Gymshark this summer.

We are taking a curated group of founders, creatives and brand leaders to Cannes Lions this June through Indvstry Power House - our private villa activation running alongside the festival. One of the things we are most excited about is building out a morning wellness programme at the villa - yoga, movement sessions, mindful mornings before the festival gets going each day.

We would love Gymshark to sponsor and be the brand behind those sessions. The people rolling out of those morning sessions and into their days at Cannes are exactly the kind of tastemakers and decision-makers who authentically love what Gymshark stands for - and the content that gets made in that setting, in the south of France, with that crowd, would be genuinely beautiful.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a call and talk through what this could look like. Are you open to it? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 2. J PRESS (HENRY BRYANT) ───────────────────────────────────────────────
const jPressBody = `Hi Henry,

I wanted to reach out about something we are building at Cannes Lions this June that I think is worth covering.

Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, panels and closed-door conversations with some of the most senior creative, music and marketing leaders at Cannes. We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

We would love to explore offering J Press exclusive access - on the ground editorial, behind-the-scenes content, and interviews with the leaders and artists coming through the villa throughout the week. The music and advertising worlds are colliding at Cannes in a way they never have before, and the conversations happening in our space are exactly the ones worth documenting.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a call to talk through what access could look like. Are you open to it? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 3. VEVO (CARL YOUNG) ────────────────────────────────────────────────────
const carlVevoBody = `Hi Carl,

Vevo sits at the exact intersection of music and advertising in a way that almost no other platform does - and Cannes Lions is the moment when that conversation is most alive.

I wanted to reach out because we are building something at Cannes Lions this June that I think Vevo should be part of. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes.

We are planning a panel series on music advertising, the future of music video as a brand canvas, and how platforms like Vevo are reshaping how brands reach audiences through music. We would love Vevo to be part of that conversation - whether as a panel partner, a speaker, or part of the broader programme we are building throughout the week.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you to talk through what involvement could look like. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 4. VEVO (YOMI OGUNSOLA) ─────────────────────────────────────────────────
const yomiVevoBody = `Hi Yomi,

The conversation about music advertising and how brands use music video as a cultural touchpoint is one of the most interesting ones happening in the industry right now - and nobody is better placed to lead it than Vevo.

I wanted to reach out because we are building something at Cannes Lions this June that sits right in that space. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events and panel discussions with some of the most senior creative and marketing leaders at Cannes.

We are putting together a programme around music, advertising and content - and we would love Vevo to be part of it. A panel on the role of music video in modern brand storytelling, the data behind what makes a music campaign land, the future of the format - these are conversations Yomi should be leading in that room.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 5. YOURÍCH RECORDS (TROY ANTUNES) ───────────────────────────────────────
const troyBody = `Hi Troy,

Independent labels are building some of the most interesting artist stories in the world right now - and Cannes Lions is the moment where music and brand culture genuinely collide.

I wanted to reach out because we are building something at Cannes Lions this June that I think Yourích Records should be part of. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative and brand leaders at Cannes.

We are building out a music and culture programme as part of the week - and we would love to explore what involving Yourích's artists and energy could look like. Whether that is a live moment, a conversation about building artist brands in today's landscape, or simply getting you and your artists in the right rooms with the right people.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 6. B THE AGENCY (ROSIE KARACA) ──────────────────────────────────────────
const rosieBody = `Hi Rosie,

B. the agency works with some of the most interesting fashion, beauty and lifestyle brands in the world - and we think there is a really natural overlap with what we are building at Cannes Lions this June.

Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes. The villa brings together founders, brand leads and creative directors from across fashion, media, tech and culture.

We would love to explore what a partnership with B. could look like - whether that is bringing some of your brand clients into the Power House ecosystem, collaborating on content throughout the week, or simply making sure the right people from your world are in the right rooms. The crowd we are building is one your clients would want access to.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a call and talk through what this could look like. Are you open to it? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 7. PEERMUSIC (P FLYNN) ──────────────────────────────────────────────────
const pflynnBody = `Hi,

Peermusic has been at the heart of the relationship between music and brands for decades - and Cannes Lions is the moment each year where that relationship gets redefined.

I wanted to reach out because we are building something at Cannes Lions this June that sits right at that intersection. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes.

We are building a music and culture programme as part of the week - panels, conversations and moments around music licensing, sync, the future of music in advertising, and how publishing is evolving in a brand-led world. Peermusic feels like exactly the right partner to be part of those conversations.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you to talk through what involvement could look like. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 8. BRAY & KRAIS (JONATHAN COOTE) ────────────────────────────────────────
const jonathanBody = `Hi Jonathan,

The conversation around music, AI and copyright is one of the most important ones in the industry right now - and your work at Bray and Krais putting that into plain language, including the Fortune piece, is exactly the kind of thinking the room at Cannes needs to hear.

I wanted to reach out because we are building something at Cannes Lions this June that I think you should be part of. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative, music and marketing leaders at Cannes.

We are building a panel series around music, culture and the future of creative rights - and we would love to include a legal perspective that actually moves the conversation forward. The people in that room are the ones making the decisions. Having you in it feels valuable for everyone.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 9. COLORS X STUDIOS (MEESH) ─────────────────────────────────────────────
const meeshBody = `Hi Meesh,

COLORS has done something almost no other platform has managed - built a format so distinctive and so trusted that a single session can launch a career. Billie Eilish, Jorja Smith, Doja Cat - the list speaks for itself. The reason it works is that the format gets out of the way and lets the music breathe.

I wanted to reach out because we are building something at Cannes Lions this June that I think could be a genuinely special moment for COLORS. Indvstry Power House is our private villa activation running alongside the festival - a private villa in the south of France, five days, some of the most interesting creative and cultural leaders in the room.

We would love to explore the idea of a COLORS session at the villa. An intimate live performance in that setting - the light, the architecture, the crowd - would make for something extraordinary. And for the artist involved, it is a Cannes moment that no one else is offering.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a call and explore what this could look like. Are you open to it? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 10. REEBOK (MUBI ALI) ───────────────────────────────────────────────────
const mubiBody = `Hi Mubi,

Reebok has always sat at the intersection of sport, music and street culture in a way that other athletic brands haven't - and that crossover is exactly what Cannes Lions is celebrating more than ever.

I wanted to reach out because we are building something at Cannes Lions this June that I think is a great fit for Reebok. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The crowd coming through - founders, creative directors, brand leads - are the people who shape what culture looks like next year. Getting Reebok in front of that room, with the content and the setting that comes with it, feels like a moment worth having.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 11. HIGHSNOBIETY (MUNASHE ASHLYN) — FIXED EMAIL ─────────────────────────
const munasheBody = `Hi Munashe,

Highsnobiety covers the brands, the moments and the culture that matter - and what we are building at Cannes Lions this June is worth covering.

Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, panels and dinners with some of the most senior creative, brand and cultural leaders at Cannes. We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

The editorial angle is strong: a Black-led creative community taking a private villa to Cannes Lions, building something independent and intentional at the biggest advertising festival in the world. The people in that villa, the conversations happening there, the brands involved - it is a story worth telling.

We would love to explore what a press partnership could look like - editorial access, on-the-ground coverage, or a feature built around the week. More on what we are building: https://powerhouse.indvstryclvb.com

Are you open to a call to talk through what coverage could look like? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 12. LABRUM LONDON (ANETA) ───────────────────────────────────────────────
const anetaBody = `Hi Aneta,

I wanted to reach out about something we think could be a genuinely beautiful moment for Labrum London.

We are taking a curated group of creators, founders and tastemakers to Cannes Lions this June through Indvstry Power House - our private villa activation running alongside the festival. Several of the people joining us are influencers and content creators with strong, engaged audiences - and we want them to arrive in Cannes dressed properly.

We would love to work with Labrum London to style them for the week. The setting - a private villa in the south of France, Cannes in June - is one of the most photographed environments in the world, and the content that gets made there organically throughout the week would showcase the collection in exactly the right light. Authentic, editorial, in context. Not staged.

For Labrum, it is the kind of placement that speaks for itself.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a call and talk through how this could work. Are you open to it? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 13. THE LIGHTHOUSE (JON GOSS) ───────────────────────────────────────────
const jonBody = `Hi Jon,

What you are building with The Lighthouse is exactly what the creator economy has been missing - a physical home, a real community, a place where professional creators can actually build together. The Venice campus is a genuinely exciting thing.

I wanted to reach out because we are building something at Cannes Lions this June that sits right in that world. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events and conversations with some of the most senior creative and brand leaders at Cannes.

The creator economy is one of the biggest conversations at Cannes Lions right now, and we would love The Lighthouse to be part of that conversation in our space. Whether that is a panel on the future of the creator economy, a partnership bringing some of your members to Cannes, or exploring what a collaboration looks like beyond the festival - I think there is something worth exploring here.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 14. BRIXTON FINISHING SCHOOL (ALLY) ─────────────────────────────────────
const allyBody = `Hi Ally,

The work Brixton Finishing School does - giving young people from underrepresented backgrounds real pathways into the creative industries - is exactly the kind of thing that should be at Cannes Lions, not just watching from the outside.

I wanted to reach out because we are building something at Cannes Lions this June and we would love to explore whether there is a way to collaborate. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, panels and conversations with some of the most senior creative and marketing leaders at Cannes.

We would love to have Brixton Finishing School involved - whether that is a session at the villa, a panel on diversity and access in the creative industries, or supporting any students you might be bringing to Cannes this year. If you are planning to take students to the festival, we would love to offer them access to our events and introduce them to the people in that room.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get on a call and explore what a collaboration could look like. Are you open to it? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 15. BACARDI / D'USSE (A TYRER) ──────────────────────────────────────────
const bacardBody = `Hi,

I wanted to reach out about an opportunity we think is a natural fit for Bacardi and D'USSE at Cannes Lions this June.

Indvstry Power House is our private villa activation running alongside the festival - five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at Cannes. We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France.

D'USSE as the spirit of the villa - in a room full of the people who shape brand strategy at the biggest companies in the world, with organic content being made throughout the week in one of the most photographed places on the planet - feels like a moment worth having. Not an ad. A room.

We are looking for a spirits partner who understands that the best brand moments happen when you put the right product in the right place with the right people. D'USSE is built for exactly that.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you to talk through what involvement could look like. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── 16. NIKE (MADISON HAHN) ─────────────────────────────────────────────────
const madisonBody = `Hi Madison,

Nike's presence at Cannes Lions has been growing every year - because the brand has always understood that culture is where the real work gets done, not just the campaign.

I wanted to reach out because we are building something at Cannes Lions this June that I think is worth Nike being across. Indvstry Power House is our private villa activation running alongside the festival - five days of curated events with some of the most senior creative and marketing leaders at Cannes.

We have already secured over 75,000 euros worth of delegate passes and a large private villa in the south of France. The crowd in that villa - founders, creative directors, CMOs, brand leads - are exactly the people shaping what the next generation of brand activations looks like. Getting Nike in that room, with the content and the conversations that come with it, feels like a natural fit.

Whether that is a brand presence, a panel moment, or simply making sure the right Nike people are in the right rooms throughout the week - I think there is something worth exploring here.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you. Are you open to a call? https://calendly.com/itsvisionnaire/30min

Amber`;

// ─── RECIPIENTS ──────────────────────────────────────────────────────────────

const RECIPIENTS = [
  { name: 'Gina Powell',     email: 'Gina.powell@gymshark.com',                body: gymsharkBody  },
  { name: 'Henry Bryant',    email: 'Henry.bryant@jpress.co.uk',               body: jPressBody    },
  { name: 'Carl Young',      email: 'Carl.young@vevo.com',                     body: carlVevoBody  },
  { name: 'Yomi Ogunsola',   email: 'yomi.ogunsola@vevo.com',                  body: yomiVevoBody  },
  { name: 'Troy Antunes',    email: 'troy.antunes@yourichrecords.com',          body: troyBody      },
  { name: 'Rosie Karaca',    email: 'Rosie.karaca@b-theagency.com',            body: rosieBody     },
  { name: 'P Flynn',         email: 'pflynn@peermusic.com',                    body: pflynnBody    },
  { name: 'Jonathan Coote',  email: 'jonathan@brayandkrais.com',               body: jonathanBody  },
  { name: 'Meesh',           email: 'meesh@colorsxstudios.com',                body: meeshBody     },
  { name: 'Mubi Ali',        email: 'Mubi.ali@reebok.com',                     body: mubiBody      },
  { name: 'Munashe Ashlyn',  email: 'Munashe.ashlyn@highsnobiety.com',         body: munasheBody   },
  { name: 'Aneta',           email: 'Aneta@labrumlondon.com',                  body: anetaBody     },
  { name: 'Jon',             email: 'jon@thelighthouse.com',                   body: jonBody       },
  { name: 'Ally',            email: 'Ally@brixtonfinishingschool.org',         body: allyBody      },
  { name: 'A Tyrer',         email: 'Atyrer@bacardi.com',                      body: bacardBody    },
  { name: 'Madison Hahn',    email: 'Madison.hahn@nike.com',                   body: madisonBody   },
];

async function main() {
  const token = await getToken();

  for (let i = 0; i < RECIPIENTS.length; i++) {
    const r = RECIPIENTS[i];
    await send(token, r.email, r.name, SUBJECT, r.body);
    console.log(`[${i + 1}/${RECIPIENTS.length}] Sent to ${r.name} <${r.email}>`);
    if (i < RECIPIENTS.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log('\nDone. 16 emails sent.');
}

main().catch(console.error);
