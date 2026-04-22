/**
 * Cannes Lions 2026 Jury Member Outreach — Indvstry Power House & Diaspora Dinner
 *
 * Targets (10):
 *   1.  Phiona Okumu          Spotify                  phiona.okumu@spotify.com
 *   2.  Jason Murison          DAMAC Properties         jason.murison@damacproperties.com
 *   3.  Femi Odugbemi          Zuri24 Media             femi.odugbemi@zuri24.com
 *   4.  Andre Athayde          Meta                     andre.athayde@meta.com
 *   5.  Zizwe Vundla           Safaricom / M-Pesa       zizwe.vundla@safaricom.co.ke
 *   6.  Chesley Maddox-Dorsey  American Urban Radio     chesley@aurn.com
 *   7.  Tim Wasicki            OUTFRONT Media           tim.wasicki@outfrontmedia.com
 *   8.  Breana Auberry         The LEGO Group           breana.auberry@lego.com
 *   9.  Oriane Canfrin         Ecobank                  oriane.canfrin@ecobank.com
 *  10.  Lauren Kimball         Edelman                  lauren.kimball@edelman.com
 *
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

const emails = [
  {
    to: 'phiona.okumu@spotify.com',
    name: 'Phiona Okumu',
    subject: 'Indvstry Power House x Cannes Lions 2026 — You Belong in This Room',
    body: `Hi Phiona,

Sitting on the Entertainment Lions for Music jury at Cannes is not a small thing. It means the industry trusts your ear, your instincts and your read on where music and creativity are heading. That deserves to be celebrated properly.

I am George Guise, founder of Indvstry Clvb, a private members community for senior creative professionals across music, media, brand and culture. Every year I bring a curated group to Cannes Lions, and this year we are doing something that goes beyond just attending.

Indvstry Power House is our private villa residency running 21 to 26 June, just outside Cannes. Seven rooms in a luxury villa with a pool, daily transport to the Croisette, a curated event calendar and full access to some of the most interesting conversations happening away from the main stage. The package includes an official Cannes Lions Delegate Pass (valued at EUR 5,000), making it genuinely one of the most efficient ways to be at Cannes at the highest level. Rooms start from GBP 1,500.

We are also hosting the Diaspora Dinner on Tuesday 23 June, a private three-course dinner at sunset for founders, creatives and industry leaders from the diaspora community. Intentional, intimate and one of the highlights of the week.

With the kind of roster we have building and only seven villa spots available, I wanted to reach out directly.

Would love to tell you more: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'jason.murison@damacproperties.com',
    name: 'Jason Murison',
    subject: 'Indvstry Power House — Cannes Lions 2026 Private Villa Residency',
    body: `Hi Jason,

Judging the Print and Publishing Lions puts you right in the conversation about where visual craft and storytelling are heading. It is one of the categories that still rewards genuine creative thinking over trend-chasing, and that matters.

I am George Guise, founder of Indvstry Clvb, a private members community built around senior creative professionals who are actually shaping their industries rather than just watching them change.

This year at Cannes Lions we are running Indvstry Power House, a private villa residency from 21 to 26 June. Seven rooms, luxury villa, private pool, daily transport to the Croisette and a fully curated week of events, dinners and closed-door sessions. Every resident gets an official Cannes Lions Delegate Pass included, which alone is worth EUR 5,000. Rooms start at GBP 1,500.

The group is deliberately small and deliberately senior. The conversations that happen at the villa tend to be the ones people remember more than the sessions on the main stage.

We are also hosting the Diaspora Dinner on Tuesday 23 June, a private sunset dinner celebrating excellence across the global creative community. If you are in Cannes that week this is the evening to be part of.

Spots are extremely limited and filling quickly.

Villa residency: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'femi.odugbemi@zuri24.com',
    name: 'Femi Odugbemi',
    subject: 'Indvstry Power House x Cannes Lions — For the Builders Who Belong in the Room',
    body: `Hi Femi,

To be on the Film jury at Cannes Lions is to be one of the people deciding what the industry calls excellent this year. That is real influence and it should come with a week that matches the weight of it.

I am George Guise, founder of Indvstry Clvb, a private members community for creative leaders, founders and cultural entrepreneurs across media, brand and storytelling. We built the community around the idea that the most important conversations in this industry do not always happen on stage.

This year I am hosting Indvstry Power House, a private villa residency during Cannes Lions 2026, running 21 to 26 June. Seven residents, luxury villa with a pool, daily transport to the Croisette and a curated week of events and introductions. The package includes a full Cannes Lions Delegate Pass (EUR 5,000 value). Rooms from GBP 1,500.

I am also hosting the Diaspora Dinner on Tuesday 23 June. A private three-course dinner, sunset, laid-back luxury, for founders and creatives from the global diaspora community. The kind of room that feels intentional because it is. This is the one evening during Cannes week that I would not want you to miss.

Only seven villa spots in total and a limited number of dinner seats. I wanted to reach out directly because I think you belong in this room.

Villa: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'andre.athayde@meta.com',
    name: 'Andre Athayde',
    subject: 'Indvstry Power House — Private Villa, Cannes Lions 2026',
    body: `Hi Andre,

Judging the Creative B2B Lions is one of those roles where you are not just evaluating ads, you are setting a benchmark for how the industry thinks about creativity in a space that has historically been undersold. That perspective is worth a lot.

I am George Guise, founder of Indvstry Clvb, a private members community built for senior creative and commercial leaders across technology, media and brand. We work at the intersection of culture, creativity and business, which felt like a natural reason to reach out.

This year at Cannes Lions we are running Indvstry Power House, a private villa residency from 21 to 26 June. Seven rooms, private pool, luxury villa in the south of France, daily transport to the Croisette and a curated programme of events, panels and private sessions throughout the week. Every resident receives an official Cannes Lions Delegate Pass included in the package (valued at EUR 5,000). Rooms from GBP 1,500.

The residents are a deliberately tight group of senior people. Less conference, more conversation.

We are also hosting the Diaspora Dinner on Tuesday 23 June, a private sunset dinner celebrating global creative and business leadership. The guest list is intimate and the evening is one of the real highlights of the week.

Very few spots remain.

Villa residency: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'zizwe.vundla@safaricom.co.ke',
    name: 'Zizwe Vundla',
    subject: 'Indvstry Power House x Cannes Lions 2026 — You Should Be in This Villa',
    body: `Hi Zizwe,

What Safaricom has built with M-Pesa is one of the most genuinely transformative brand stories of the last decade. The fact that you are now sitting on the Brand Experience and Activation jury at Cannes Lions feels entirely right.

I am George Guise, founder of Indvstry Clvb, a private members community for senior leaders across creative, brand and culture. I built the community around the belief that the most powerful rooms are the ones where people are not performing for anyone.

This year we are hosting Indvstry Power House at Cannes Lions, a private villa residency running 21 to 26 June. Seven rooms in a luxury villa with a pool, daily transport to the Croisette, a curated calendar of events and access to some of the best closed-door conversations of the week. Included in the package is a full Cannes Lions Delegate Pass, which is a EUR 5,000 value on its own. Rooms from GBP 1,500.

On Tuesday 23 June we are hosting the Diaspora Dinner, a private three-course sunset dinner for founders, CMOs, creatives and builders from the global diaspora community. This is the gathering I look forward to most during the week and the guest list is everything.

Given your body of work and where you sit in the industry, I wanted to reach out directly.

Villa: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'chesley@aurn.com',
    name: 'Chesley Maddox-Dorsey',
    subject: 'Indvstry Power House — Cannes Lions 2026, A Room You Will Want to Be In',
    body: `Hi Chesley,

Leading American Urban Radio Networks and now sitting on the Audio and Radio jury at Cannes Lions puts you at the centre of two of the most important conversations in media right now: what audio means for culture and what culture means for audio. That is a rare position to be in.

I am George Guise, founder of Indvstry Clvb, a private members community for senior creative, media and cultural leaders. We are built around the idea that the most important networks in this industry are the ones you build in person, in the right rooms.

This year we are hosting Indvstry Power House, our private villa residency at Cannes Lions 2026, running 21 to 26 June. Seven residents, luxury villa with a pool, curated event calendar, daily transport to the Croisette and a full Cannes Lions Delegate Pass included (EUR 5,000 value). Rooms start at GBP 1,500.

We are also hosting the Diaspora Dinner on Tuesday 23 June, a private sunset dinner for founders and leaders from the global diaspora community. Intimate, intentional, and one of the defining evenings of the Cannes week. Given what you have built and the community you represent, you should be at this table.

Only seven villa spots in total. I wanted to reach out now while there is still room.

Villa residency: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'tim.wasicki@outfrontmedia.com',
    name: 'Tim Wasicki',
    subject: 'Indvstry Power House — Private Villa, Cannes Lions 2026',
    body: `Hi Tim,

The Outdoor Lions jury is one of those roles where scale and simplicity collide, and the people who sit on it tend to have an unusually honest read on what actually cuts through. I have always found that perspective valuable.

I am George Guise, founder of Indvstry Clvb, a private members community for senior creative professionals across brand, media and culture. We build around the kind of people who are leading in their categories, which is why I wanted to reach out directly.

This year we are hosting Indvstry Power House, a private villa residency running alongside Cannes Lions from 21 to 26 June. Seven rooms in a luxury villa, private pool, daily transport to the Croisette, a curated event programme and an official Cannes Lions Delegate Pass included (EUR 5,000 value). Rooms from GBP 1,500.

The group is tight and senior by design. The villa is where the real conversations happen.

We are also hosting the Diaspora Dinner on Tuesday 23 June, a private sunset dinner celebrating global creative leadership. Intimate, no agendas, just a genuinely great room.

Spots for both are extremely limited.

Villa residency: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'breana.auberry@lego.com',
    name: 'Breana Auberry',
    subject: 'Indvstry Power House x Cannes Lions 2026 — Built for This Moment',
    body: `Hi Breana,

Sitting on the Glass Lion jury, the one specifically created to recognise work that drives real change, while shaping global brand strategy at LEGO is a combination that says a lot about where your work sits in this industry. It deserves to be celebrated properly.

I am George Guise, founder of Indvstry Clvb, a private members community for creative leaders and brand builders who care as much about culture and impact as they do about output.

This year we are hosting Indvstry Power House, our private villa residency at Cannes Lions 2026, running 21 to 26 June. Seven rooms in a luxury villa, private pool, daily transport to the Croisette and a curated week of events and conversations. Every resident gets an official Cannes Lions Delegate Pass included (EUR 5,000 value). Rooms from GBP 1,500.

On Tuesday 23 June we are hosting the Diaspora Dinner, a private three-course sunset dinner for founders, brand directors and industry builders from the global diaspora community. Intentional, intimate and one of the most talked-about evenings of Cannes week. Given the work you do on inclusion and representation through the Glass Lion, this feels like the right dinner for you.

Very limited spots for both.

Villa: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'oriane.canfrin@ecobank.com',
    name: 'Oriane Canfrin',
    subject: 'Indvstry Power House — Cannes Lions 2026, A Room That Reflects Your World',
    body: `Hi Oriane,

Ecobank's footprint across 35 African countries and your work in marketing and communications puts you at the centre of one of the most dynamic brand stories on the continent. And now judging the Creative Commerce Lions at Cannes makes complete sense given how much of that work lives at the intersection of commerce and culture.

I am George Guise, founder of Indvstry Clvb, a private members community for senior creative and brand leaders across media, marketing and culture. The community is global but the conversations are always specific and always real.

This year we are hosting Indvstry Power House, a private villa residency at Cannes Lions running 21 to 26 June. Seven rooms, luxury villa with a pool, daily transport to the Croisette, curated events throughout the week and a full Cannes Lions Delegate Pass included (EUR 5,000 value). Rooms from GBP 1,500.

The Diaspora Dinner on Tuesday 23 June is the evening I am most proud of. A private three-course sunset dinner for founders, CMOs and creative leaders from the global diaspora community. The guest list is intimate, the room is special and the conversation tends to go exactly where it needs to.

This is a gathering you should be part of.

Villa: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
  {
    to: 'lauren.kimball@edelman.com',
    name: 'Lauren Kimball',
    subject: 'Indvstry Power House — Private Villa Residency, Cannes Lions 2026',
    body: `Hi Lauren,

The Industry Craft jury is the one that asks the hardest question of all: is the actual execution as strong as the idea? It takes a specific kind of rigour to sit on that jury well, and the fact that your work in experience design at Edelman puts you there makes a lot of sense.

I am George Guise, founder of Indvstry Clvb, a private members community for senior creative professionals across brand, media, experience and culture. We bring together the kind of people who think carefully about how things are made, not just what they say.

This year at Cannes Lions we are running Indvstry Power House, a private villa residency from 21 to 26 June. Seven rooms in a luxury villa, private pool, daily transport to the Croisette, a curated event calendar and an official Cannes Lions Delegate Pass included (EUR 5,000 value). Rooms from GBP 1,500.

We are also hosting the Diaspora Dinner on Tuesday 23 June, a private three-course sunset dinner celebrating global creative leadership. Intimate, intentional and one of the definitive evenings of the week.

Spots for both are very limited and going quickly.

Villa residency: https://lu.ma/t4ek2yn7
Diaspora Dinner: https://lu.ma/5vmr7s6f

George`,
  },
];

// ─── SEND ─────────────────────────────────────────────────────────────────────

async function sendEmail(token: string, email: typeof emails[0]): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: email.subject,
    body: { contentType: 'HTML', content: buildHtml(email.body) },
    toRecipients: [{ emailAddress: { address: email.to, name: email.name } }],
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

  for (const email of emails) {
    await sendEmail(token, email);
    console.log(`Sent: ${email.name} <${email.to}>`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\nAll ${emails.length} sent.`);
}

main().catch(console.error);
