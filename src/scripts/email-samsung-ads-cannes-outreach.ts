/**
 * Outreach to 3 senior Samsung Ads leaders running their Cannes Lions activation.
 * Pitch: IPH as a complement to their Floating Penthouse — villa access, creative audience,
 * partnership opportunity. From George Guise.
 *
 *   1. Cathy Oh         — VP & Global Head of Marketing & Analytics  (cathy.oh@samsungads.com)
 *   2. Michael Scott    — VP, Head of Ad Sales, North America         (michael.scott@samsungads.com)
 *   3. Melissa Wasserman — Head of Marketing, Samsung Ads             (melissa.wasserman@samsungads.com)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-samsung-ads-cannes-outreach.ts
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
    .map(para => `<p style="margin:0 0 14px 0;">${para.replace(/\n/g, '<br>')}</p>`)
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
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

interface Contact {
  firstName: string;
  fullName: string;
  email: string;
  subject: string;
  body: string;
}

const contacts: Contact[] = [
  {
    firstName: 'Cathy',
    fullName:  'Cathy Oh',
    email:     'cathy.oh@samsungads.com',
    subject:   'Samsung Ads x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Cathy,

I have been following Samsung Ads' Cannes presence closely over the last couple of years. The Floating Penthouse is genuinely one of the smartest activations at Lions — a private, high-quality setting for real conversations away from the noise of the Palais. It works because it is curated and exclusive. That is exactly the thinking behind what we are building.

Your 2026 predictions around cross-screen measurement, AI-driven targeting and FAST growth have been making the rounds across the industry. The tension between scale and precision — being everywhere without being everywhere — is the conversation that matters most to the senior brand leaders we bring into our space.

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa, 21 to 26 June, for a curated group of CMOs, creative directors, founders and senior brand decision-makers. Think of us as the villa on land — a complementary partner to the Floating Penthouse, not a competitor to it.

The people in our house are the ones making the decisions Samsung Ads cares about most. I think there is a real partnership here — whether that is Samsung Ads hosting a closed session or dinner inside the villa, bringing clients and partners through our space, or building something together across the week that puts the cross-screen and FAST conversation in front of exactly the right room.

Here is our partnership deck and the Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

Cannes is five weeks away. If you have 20 minutes to talk before then:
${CAL_LINK}

Would love to explore what we can build together, Cathy.`,
  },

  {
    firstName: 'Michael',
    fullName:  'Michael Scott',
    email:     'michael.scott@samsungads.com',
    subject:   'Indvstry Power House — the room your CTV clients should be in',
    body: `Hi Michael,

I caught your session at the Variety Cannes Lions Studio in 2024 on CTV strategy and the point you made about reaching audiences at the moment of intent on the biggest screen in the home stuck with me. It is a message that still lands differently when the person hearing it is a CMO who just signed off on a major connected TV budget.

That is exactly the audience we have built at Indvstry Power House.

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa activation, 21 to 26 June, for a curated group of senior CMOs, creative directors, founders and brand decision-makers. It is a deliberately exclusive, neutral setting outside the official festival footprint — the kind of space where the CTV and FAST conversation moves from a panel format to an actual business conversation.

Samsung Ads' Floating Penthouse is one of the best activations at Lions precisely because it does not feel like a festival booth. The Power House operates on the same logic on land. I think there is a real opportunity for us to work together — whether that is Samsung Ads hosting client sessions inside the villa, bringing your North America revenue team and key accounts into our space, or building a joint event that puts Samsung's CTV story in front of the most senior brand leaders at the festival.

Here is our partnership deck and the full Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

If you have 20 minutes before Cannes to talk through what this could look like:
${CAL_LINK}

Really think there is something here, Michael.`,
  },

  {
    firstName: 'Melissa',
    fullName:  'Melissa Wasserman',
    email:     'melissa.wasserman@samsungads.com',
    subject:   'Cannes Lions 2026 — a partnership worth exploring',
    body: `Hi Melissa,

Samsung Ads' Cannes presence has been one of the most consistently well-executed in the industry over the last few years. The Floating Penthouse approach — exclusive, curated, high-quality — is the right model. It is also the model we have built on land.

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa, 21 to 26 June, for a curated group of CMOs, creative directors, founders and senior brand leaders. The house is built around the same principle as Samsung Ads' Cannes approach: the best conversations happen when you take the right people out of the festival footprint and put them somewhere they can actually think.

Given your role leading marketing at Samsung Ads, I think you would see immediately why the overlap here is significant. Our residents and network are the creative and brand decision-makers Samsung Ads most wants to reach. A partnership could look like a hosted dinner or event inside the villa, Samsung Ads bringing clients and partners through our space across the week, co-branded programming around the FAST and cross-screen measurement themes you are leading on, or something else entirely. I am very open to what the right shape looks like.

Here is our partnership deck and the Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

Cannes is five weeks away. If you have time for a quick call before then:
${CAL_LINK}

Would love to find a way to do something together, Melissa.`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;
  let failed = 0;

  for (const c of contacts) {
    try {
      const message: any = {
        subject: c.subject,
        body:    { contentType: 'HTML', content: buildHtml(c.body) },
        toRecipients: [{ emailAddress: { address: c.email, name: c.fullName } }],
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

      sent++;
      console.log(`[${sent}/${contacts.length}] Sent to ${c.fullName} <${c.email}>`);
    } catch (err: any) {
      failed++;
      console.error(`FAILED: ${c.fullName} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
}

sendAll().catch(console.error);
