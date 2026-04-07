/**
 * Indvstry Villa Cannes 2026 — Lead Follow-Up
 * 22 recipients across 3 categories:
 *   A. Responded via Instagram — continue conversation
 *   B. Had a call, didn't commit — Tendai
 *   C. Warm leads unresponded — probe for a call
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

interface Recipient {
  name: string;
  firstName: string;
  email: string;
  subject: string;
  body: string;
}

// ─── A. RESPONDED VIA INSTAGRAM ──────────────────────────────────────────────

const ebenezaBody = `Hi Ebeneza,

Great connecting on Instagram - really glad you are interested in the villa. Just wanted to follow up properly over email.

We have noted your preference for a solo room and we are doing our best to accommodate everyone individually. The villa setup is designed to give people their own space while still having the shared communal energy that makes the Cannes week so special.

A few details worth knowing:

- Dates: 21-26 June 2026
- Budget: £800-£1,500 for the full stay (accommodation only)
- The house will be a curated group of creative and industry professionals - the kind of people worth spending a week in Cannes with

Would love to get on a quick call to walk you through exactly what we have lined up and answer any questions. You can grab a time here: https://calendly.com/itsvisionnaire/30min

Spots are going quickly so the sooner the better.

George`;

const ashleyBody = `Hi Ashley,

Thanks so much for reaching out on Instagram - really appreciate the enthusiasm and love that you are thinking about bringing your crew.

To answer your question directly - yes, we do have capacity for small groups. We would just need to confirm numbers and make sure everyone fits the vibe of the house. From what I can see you are all aligned with the dates and budget which is a great start.

The villa is shaping up to be a really special week - 21-26 June, a curated group of creative professionals, great location, and the right energy for Cannes.

Can we get on a quick call to go through the details for you and your group and get you confirmed? Book a time here: https://calendly.com/itsvisionnaire/30min

George`;

// ─── B. TENDAI — HAD A CALL, DIDN'T COMMIT ───────────────────────────────────

const tendaiBody = `Hi Tendai,

Really enjoyed our call - it was great getting to know you a bit and I genuinely think Cannes would be a brilliant week for you.

Just wanted to check in and see if you are still thinking about it. I know it is a commitment and you had a few things to weigh up but I did not want the conversation to go cold without giving you a proper nudge.

The villa is filling up and the group coming together is genuinely exciting - the kind of people you would want to be spending a week in the south of France with. I think once you are in the house it will be one of those trips you look back on and are very glad you did.

If there is anything that is holding you back or any questions I can answer to make it easier to decide, just let me know. Happy to jump on another quick call if that helps - https://calendly.com/itsvisionnaire/30min

George`;

// ─── C. WARM LEADS — UNRESPONDED ─────────────────────────────────────────────

function warmBody(firstName: string, notes: string): string {
  return `Hi ${firstName},

Just following up on your interest in the Indvstry Villa at Cannes 2026. You filled in our interest form a little while back and I wanted to make sure you did not slip through the net.

The villa is coming together really well - 21-26 June, a curated group of creative and industry professionals sharing a private residence during Cannes Lions week. It is shaping up to be one of those weeks people talk about for a long time.${notes ? '\n\n' + notes : ''}

Spots are limited and going fast. Rather than go back and forth over email, would it be easier to jump on a quick 15-minute call so I can walk you through the details and answer any questions? Book a time here: https://calendly.com/itsvisionnaire/30min

George`;
}

const recipients: Recipient[] = [
  // A. Instagram responders
  {
    name: 'Ebeneza Blanche',
    firstName: 'Ebeneza',
    email: 'info@ebenezablanche.com',
    subject: 'Indvstry Villa Cannes 2026  -  following up',
    body: ebenezaBody,
  },
  {
    name: 'Ashley Brooks',
    firstName: 'Ashley',
    email: 'abrooks@michelemariepr.com',
    subject: 'Indvstry Villa Cannes 2026  -  you and your group',
    body: ashleyBody,
  },

  // B. Tendai
  {
    name: 'Tendai Pottinger',
    firstName: 'Tendai',
    email: 'hello@tendaipottinger.com',
    subject: 'Still thinking about Cannes?',
    body: tendaiBody,
  },

  // C. Warm unresponded
  {
    name: 'Venus Ashu',
    firstName: 'Venus',
    email: 'venusashu1@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Venus', 'You mentioned you wanted more details before committing - happy to run through everything on a quick call.'),
  },
  {
    name: 'Frank Skully',
    firstName: 'Frank',
    email: 'frankskully@hotmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Frank', 'You mentioned you needed more details - a quick call is the easiest way to run through everything and answer any questions.'),
  },
  {
    name: 'LaToya Harding',
    firstName: 'LaToya',
    email: 'latoyaharding89@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('LaToya', 'From your form it looks like you are available for the full week and aligned with the dates and budget - let us get on a call and get you confirmed.'),
  },
  {
    name: 'Sabina Jasinska',
    firstName: 'Sabina',
    email: 'sabina.jasinska25@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Sabina', 'I saw you noted you would likely be there Monday to Thursday - that works absolutely fine, partial stays are welcome. Let us talk through the details.'),
  },
  {
    name: 'Anais Motolo',
    firstName: 'Anais',
    email: 'Anais603@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Anais', 'You mentioned you wanted more details before deciding on budget - happy to talk through all the options and what is included on a quick call.'),
  },
  {
    name: 'Tola Mayegun',
    firstName: 'Tola',
    email: 'tola.m@hotmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Tola', 'I noted your preference for an en-suite or sharing with just one person - we are working to accommodate that and would love to talk you through the setup.'),
  },
  {
    name: 'Gilda Valle',
    firstName: 'Gilda',
    email: 'gildavallem@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Gilda', 'I know you said you were just curious at the time but wanted to reach out properly and make sure you have the full picture before the spots go.'),
  },
  {
    name: 'Cassy Isabella Woodley',
    firstName: 'Cassy',
    email: 'Hello@cassyisabella.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Cassy', 'You had a few questions when you filled in the form - a quick call is the easiest way to run through everything and get you a clear picture of what the week looks like.'),
  },
  {
    name: 'Nico Rose',
    firstName: 'Nico',
    email: 'Nicorose92@icloud.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Nico', 'From your form you were very much a yes - dates, budget, the full duration. Would love to get you confirmed. Let us jump on a call.'),
  },
  {
    name: 'Daisy Domenghini',
    firstName: 'Daisy',
    email: 'daisy@dave.sports',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Daisy', 'I saw you mentioned transport distance as a consideration - worth knowing that we are sorting logistics for the house and happy to talk through location and how we are handling getting people to and from the Palais.'),
  },
  {
    name: 'Adeze Ogunbunmi',
    firstName: 'Adeze',
    email: 'dogunbunmi@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Adeze', 'From your form you were a definite yes across the board - would love to get you confirmed properly. Let us jump on a quick call.'),
  },
  {
    name: 'Karen Grillo',
    firstName: 'Karen',
    email: 'karen-grillo@hotmail.co.uk',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Karen', 'I saw your requirements around location, en-suite, daily cleaning, and keeping it to legitimate industry professionals - all very reasonable and very much in line with what we are building. A call will let me confirm the specifics for you.'),
  },
  {
    name: 'Naomi Iluyomade',
    firstName: 'Naomi',
    email: 'niluyomade@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Naomi', 'You were fully aligned on dates and budget from your form - would love to get on a quick call and get you confirmed before spots go.'),
  },
  {
    name: 'Marian Reynolds',
    firstName: 'Marian',
    email: 'marianjsreynolds@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Marian', 'I noticed you flagged distance to talks and events as a consideration - happy to go through the villa location and how we are handling transport on a quick call.'),
  },
  {
    name: 'Katie Langdon',
    firstName: 'Katie',
    email: 'klangers@hotmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Katie', 'I saw you mentioned wanting your own room - we are doing our best to give everyone their own space and it is worth a conversation to see how the setup works for you.'),
  },
  {
    name: 'Angela Njeri',
    firstName: 'Angela',
    email: 'angelanjerik@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Angela', 'You were a strong yes across the board on your form - dates, budget, all of it. Would love to get you confirmed. Grab a time here and let us make it happen.'),
  },
  {
    name: 'Paula Grunfeld',
    firstName: 'Paula',
    email: 'paula@bunnycreative.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Paula', 'I saw you mentioned the Cannes pass as a key consideration - happy to talk through what is included in the villa package and what we are working on for pass holders on a quick call.'),
  },
  {
    name: 'Anwar Hossen',
    firstName: 'Anwar',
    email: 'anwarhossenfilmmaker@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Anwar', 'I saw you had some questions around pricing - happy to go through the full breakdown on a quick call and see if we can make it work for you.'),
  },
  {
    name: 'Sabrina Fearon-Melville',
    firstName: 'Sabrina',
    email: 'sfearonmelville@gmail.com',
    subject: 'Indvstry Villa Cannes 2026  -  still interested?',
    body: warmBody('Sabrina', 'From your form you were fully in - full duration, yes on budget, community and networking as your top draws. Would love to get on a quick call and get you confirmed.'),
  },
];

async function sendEmail(token: string, r: Recipient): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: r.subject,
    body: { contentType: 'HTML', content: buildHtml(r.body) },
    toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
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
  for (const r of recipients) {
    await sendEmail(token, r);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    await new Promise(res => setTimeout(res, 1200));
  }
  console.log(`\n✅ All ${recipients.length} sent.`);
}

main().catch(console.error);
