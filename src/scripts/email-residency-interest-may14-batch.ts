/**
 * email-residency-interest-may14-batch.ts
 *
 * Outreach to 8 new IPH residency interest form leads (export 14 May 2026).
 * Personalized by role/interests. From Amber Jacobs.
 * Sells the full package, invites to Diaspora Dinner, asks for a call with George.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-residency-interest-may14-batch.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const BOOKING_LINK   = 'https://lu.ma/t4ek2yn7';
const CALENDAR_LINK  = 'https://calendly.com/itsvisionnaire/30min';
const DINNER_LINK    = 'https://lu.ma/5vmr7s6f';

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
    .map(para => `<p style="margin:0 0 14px 0;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${formatted}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

interface Lead {
  firstName: string;
  fullName: string;
  email: string;
  title: string;
  subject: string;
  body: string;
}

const leads: Lead[] = [
  {
    firstName: 'Nene',
    fullName:  'Nene Parsotam',
    email:     'nene@vinecreatives.com',
    title:     'Independent Executive Creative Director',
    subject:   'Your spot at Indvstry Power House — Cannes is weeks away',
    body: `Hi Nene,

Thank you for filling in your interest for Indvstry Power House. I wanted to come back to you properly and make sure you have the full picture.

You are already going to Cannes with a delegate pass, which means you know better than most how important it is to have the right base. That is exactly what the Power House is. A private luxury villa, 21 to 26 June, just outside the Palais, built for senior creative professionals who want to get the most out of the week without the chaos.

Here is what is included when you join us as a resident:

A private room in our luxury villa with swimming pool and Mediterranean gardens
Daily transport to and from La Croisette
A fully curated event calendar with priority RSVPs to the best brand houses and panels of the week
Access to our private Diaspora Dinner on Tuesday 23 June, 6 to 9pm — one of the most sought-after evenings of Lions
Closing party access
Networking app credentials giving you direct access to every resident and our extended network
Strategic positioning guidance throughout the week

Rooms start from £1,500. You can find the full details and secure your spot here:
${BOOKING_LINK}

Cannes is just a few weeks away and spots are almost gone. George Guise, our founder, would love to connect with you properly before then. Grab a time with him here:
${CALENDAR_LINK}

And on top of all of that, I would love to invite you to our Diaspora Dinner personally. It is 30 guests maximum, very intimate, and the room is genuinely one of the best curated guest lists of the whole festival. Get your ticket here:
${DINNER_LINK}

Looking forward to hearing from you, Nene.`,
  },

  {
    firstName: 'Ramatu',
    fullName:  'Ramatu Kandakai',
    email:     'rkandakai@gmail.com',
    title:     'Integrated Marketing Manager',
    subject:   'Your spot at Indvstry Power House — Cannes is weeks away',
    body: `Hi Ramatu,

Thank you for your interest in Indvstry Power House. I can see from your form that you are very much across everything we are building, from the villa residency through to the brand partnership conversations and the Diaspora Dinner. That is exactly the kind of engagement we love to see.

Let me make sure you have the full picture on what the residency includes:

A private room in our luxury villa with swimming pool and Mediterranean gardens, 21 to 26 June
Daily transport to and from La Croisette throughout the week
A fully curated event calendar with priority RSVPs to the best brand houses and panels
Access to our private Diaspora Dinner on Tuesday 23 June, 6 to 9pm
Done-for-you event RSVPs so you never miss the rooms that matter
Closing party access
Networking app credentials
Strategic positioning guidance throughout the week

Rooms start from £1,500. Secure your spot here:
${BOOKING_LINK}

Cannes is just a few weeks away. George Guise, our founder, would love to speak with you before then and talk through the brand partnership angle as well. Grab a time with him here:
${CALENDAR_LINK}

And please do grab a ticket to our Diaspora Dinner if you have not already. 30 guests maximum, an incredible room of senior creative and brand leaders. Tickets here:
${DINNER_LINK}

Really excited about the prospect of having you with us, Ramatu.`,
  },

  {
    firstName: 'Katie',
    fullName:  'Katie Dean',
    email:     'kdean@realchemistry.com',
    title:     'SVP Creative Director',
    subject:   'Indvstry Power House — everything you need for Cannes',
    body: `Hi Katie,

Thank you for your interest in Indvstry Power House. I wanted to make sure you have everything you need to make a decision, especially with Cannes just a few weeks away now.

I know you are still exploring your attendance options, and the residency might actually be the thing that makes the whole week click into place. Here is exactly what you get:

An official Cannes Lions Delegate Pass worth 5,000 euros, included in your residency. This alone covers the cost of staying with us.
A private room in our luxury villa with swimming pool and Mediterranean gardens, 21 to 26 June
Daily transport to La Croisette
A curated event calendar with priority RSVPs to the most important brand houses and sessions of the week
Access to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm — one of the most intimate and well-curated evenings of Lions
Closing party access
Networking app credentials
Strategic positioning guidance throughout the week

Rooms start from £1,500 — and with the delegate pass included, the value speaks for itself.

Secure your spot here:
${BOOKING_LINK}

George Guise, our founder, would love to speak with you before the festival. He can walk you through the full week and answer any questions. Book a time here:
${CALENDAR_LINK}

And even if the villa is not the right fit right now, please do join us for the Diaspora Dinner on 23 June. Tickets here:
${DINNER_LINK}

Hope to see you in Cannes, Katie.`,
  },

  {
    firstName: 'Arieth',
    fullName:  'Arieth Novais',
    email:     'info@arethestudio.com',
    title:     'Founder',
    subject:   'Indvstry Power House — made for founders like you',
    body: `Hi Arieth,

Thank you for filling in your interest for Indvstry Power House. As a founder yourself, I think you are going to love what we have built for this year.

The Power House is not just a place to stay. It is a curated community of creative founders, brand leaders and cultural decision-makers sharing a private villa during one of the most important weeks in the global creative calendar. The conversations that happen inside that house are the ones that do not happen in the official festival spaces.

Here is what your residency includes:

An official Cannes Lions Delegate Pass worth 5,000 euros — this alone makes the residency exceptional value
A private room in our luxury villa with swimming pool and Mediterranean gardens, 21 to 26 June
Daily transport to La Croisette
A curated event calendar with priority RSVPs across the week
Done-for-you event registrations so you are always in the right room
Access to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm — 30 guests, very intimate, incredible room
Closing party access
Networking app credentials and access to the full Power House network
Strategic positioning guidance throughout the week

Rooms start from £1,500 and Cannes is just weeks away. Secure your spot here:
${BOOKING_LINK}

George Guise, the founder of Indvstry Clvb, would love to connect with you before the festival. Grab a time here:
${CALENDAR_LINK}

And please grab your ticket for the Diaspora Dinner — spaces are very limited:
${DINNER_LINK}

Really hope we get to welcome you to the house, Arieth.`,
  },

  {
    firstName: 'Charlene',
    fullName:  'Charlene Cabral',
    email:     'charlene.cabral@uk.telehouse.net',
    title:     'Senior Global Marketing Manager',
    subject:   'Indvstry Power House — your Cannes base sorted',
    body: `Hi Charlene,

Thank you for your interest in Indvstry Power House. You already have your delegate pass sorted, so you know exactly what the week looks like. What you need now is the right base, the right people around you, and the logistics handled. That is exactly what we do.

Here is what your residency includes:

A private room in our luxury villa with swimming pool and Mediterranean gardens, 21 to 26 June
Daily transport to and from La Croisette so you never have to think about logistics
A curated event calendar with priority RSVPs to the best brand houses and panels of the week
Done-for-you event registrations throughout the festival
Access to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm — one of the most exclusive evenings of Lions
Closing party access
Networking app credentials giving you access to every resident and our wider network
Strategic positioning guidance throughout the week

The house is a curated group of senior marketing leaders, creative directors and founders. The kind of people worth spending a week in the south of France with.

Rooms start from £1,500. Secure your spot here:
${BOOKING_LINK}

Cannes is just a few weeks away. George Guise, our founder, would love to have a quick call with you before then. Book a time here:
${CALENDAR_LINK}

And please join us for the Diaspora Dinner on 23 June — tickets here:
${DINNER_LINK}

Looking forward to welcoming you, Charlene.`,
  },

  {
    firstName: 'Rodrigo',
    fullName:  'Rodrigo Casas Diaz',
    email:     'rodrigo.casas@vml.com',
    title:     'Global Creative Director',
    subject:   'Indvstry Power House — you are already a yes',
    body: `Hi Rodrigo,

Thank you for your interest in Indvstry Power House. You have already said you are attending Cannes and you are definitely interested in the villa, so I want to make sure we get you confirmed before the last spots go.

Here is what the residency includes:

A private room in our luxury villa with swimming pool and Mediterranean gardens, 21 to 26 June
A curated group of senior creative directors, CMOs and founders sharing the house
Daily transport to La Croisette
Priority RSVPs to the best brand activations and sessions of the week
Access to our Villa Activation Event on 25 June inside the Power House
Access to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm
Closing party access
Networking app credentials

The house is the kind of space where real creative conversations happen. The kind that do not fit in the festival schedule but that you remember years later.

Rooms start from £1,500. Secure your spot here:
${BOOKING_LINK}

George Guise, our founder, would love to speak with you. Grab a time here:
${CALENDAR_LINK}

And even outside the villa, please join us for the Diaspora Dinner on 23 June. One of the best rooms of the week:
${DINNER_LINK}

Let us get you confirmed, Rodrigo.`,
  },

  {
    firstName: 'Santosh',
    fullName:  'Santosh Merugu',
    email:     'santosh.meruguuk@gmail.com',
    title:     'Digital Marketing',
    subject:   'Indvstry Power House — your route into Cannes Lions',
    body: `Hi Santosh,

Thank you for your interest in Indvstry Power House. I saw you are not yet confirmed for Cannes, and I want to share something that might change that.

Our residency package solves the biggest barrier to attending Cannes Lions: the delegate pass. Here is what you get when you join us:

An official Cannes Lions Delegate Pass worth 5,000 euros, included in your residency. Without this, attending the festival is not possible. With it, every door is open.
A private room in our luxury villa with swimming pool and Mediterranean gardens, 21 to 26 June
Daily transport to La Croisette
A curated event calendar with priority RSVPs across the week
Access to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm
Closing party access
Networking app credentials

The residency starts from £1,500. When you factor in the delegate pass, the transport, the RSVPs and the accommodation all sorted in one, it is genuinely one of the best packages available for Cannes Lions this year.

Secure your spot here:
${BOOKING_LINK}

George Guise, our founder, would love to speak with you and talk through whether this is the right fit. Book a call here:
${CALENDAR_LINK}

And please join us for the Diaspora Dinner on 23 June regardless — tickets here:
${DINNER_LINK}

Cannes is just a few weeks away, Santosh. Now is the time to make the decision.`,
  },

  {
    firstName: 'Shanice',
    fullName:  'Shanice Allen',
    email:     'shaniceallen15@yahoo.co.uk',
    title:     'Director',
    subject:   'Indvstry Power House — you are exactly who we want in this house',
    body: `Hi Shanice,

Thank you for your interest in Indvstry Power House. You said you are definitely interested in the villa and want everything, from the delegate pass to the RSVPs to the private dinner. That tells me you understand exactly what a well-run Cannes week looks like. And that is precisely what we have built.

Here is everything that is included in your residency:

An official Cannes Lions Delegate Pass worth 5,000 euros — your entry into the festival
A private room in our luxury villa with swimming pool and Mediterranean gardens, 21 to 26 June
Daily transport to and from La Croisette so logistics are never a thought
Done-for-you RSVPs to the most important brand houses and events of the week
A calm, private base full of the right people between sessions
Access to our Diaspora Dinner on Tuesday 23 June, 6 to 9pm — 30 guests, curated, exceptional
Closing party access
Networking app credentials and access to the full Power House network

Rooms start from £1,500 and spots are almost gone. Secure yours here:
${BOOKING_LINK}

George Guise, the founder of Indvstry Clvb, would love to speak with you before the festival. He can walk you through the full week and get you confirmed. Book a time here:
${CALENDAR_LINK}

And please grab your ticket to the Diaspora Dinner — spaces are very limited:
${DINNER_LINK}

Cannes is just a few weeks away. I would love to get you locked in, Shanice.`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    try {
      const message: any = {
        subject: lead.subject,
        body:    { contentType: 'HTML', content: buildHtml(lead.body) },
        toRecipients: [{ emailAddress: { address: lead.email, name: lead.fullName } }],
        from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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

      sent++;
      console.log(`[${sent}/${leads.length}] Sent to ${lead.fullName} <${lead.email}>`);
    } catch (err: any) {
      failed++;
      console.error(`FAILED: ${lead.fullName} <${lead.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
}

sendAll().catch(console.error);
