/**
 * Outreach to 3 senior Omnicom leaders running Cannes Lions activations.
 * Pitch: IPH collaboration, sponsorship deck, website. From George Guise.
 *
 *   1. Chaka Sobhani   — Global CCO, TBWA Worldwide + Titanium Jury President 2026 (chaka.sobhani@tbwa.com)
 *   2. Bradley Rogers  — CEO, OMD USA (new March 2026)                             (bradley.rogers@omd.com)
 *   3. Emily Proctor   — MD Data & Technology Solutions, OMD                       (emily.proctor@omd.com)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-omnicom-cannes-outreach.ts
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
  title: string;
  company: string;
  subject: string;
  body: string;
}

const contacts: Contact[] = [
  {
    firstName: 'Chaka',
    fullName:  'Chaka Sobhani',
    email:     'chaka.sobhani@tbwa.com',
    title:     'Global Chief Creative Officer, TBWA Worldwide',
    company:   'TBWA Worldwide',
    subject:   'Titanium Jury President at our villa — worth a conversation',
    body: `Hi Chaka,

Congratulations on the Titanium Jury President role at Cannes Lions 2026. Of all the jury seats at Lions, that one carries the most weight — it is the award that is supposed to change the industry, not just reward it. The fact they put you in that chair says a lot.

I read your Creative Salon interview a while back, the one where you said "I love this industry but I don't make work for it." That line stuck with me. It is exactly the philosophy behind what we are building.

I am George Guise, founder of Indvstry Clvb. This year we are running Indvstry Power House at Cannes Lions — a private luxury villa, 21 to 26 June, for a curated group of senior CMOs, creative directors, founders and cultural leaders. No Palais branding, no panel format, no industry theatre. Just the right people in a room where the conversation can actually go somewhere. The kind of space you clearly believe in.

You are also arriving at TBWA as its new Global CCO, stepping into Cannes with a blank canvas and a mandate to define what the agency stands for creatively. I think there is a genuinely interesting collaboration here — whether that is TBWA hosting a session inside the Power House, bringing key creative and client voices into the villa, or building something together around the Titanium conversation for the week.

Here is our partnership deck and the Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

If you have 20 minutes before Cannes to talk through what this could look like:
${CAL_LINK}

Would love to make something happen together, Chaka.`,
  },

  {
    firstName: 'Bradley',
    fullName:  'Bradley Rogers',
    email:     'bradley.rogers@omd.com',
    title:     'CEO, OMD USA',
    company:   'OMD',
    subject:   'OMD x Indvstry Power House — your first Cannes as CEO',
    body: `Hi Bradley,

You stepped into the OMD USA CEO seat in March and Cannes Lions will be your first major stage in the role. I wanted to reach out before then because I think there is a partnership opportunity that could make that week genuinely memorable for the right reasons.

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa activation, 21 to 26 June, built around a curated group of senior CMOs, creative directors, founders and brand leaders. It sits outside the official festival footprint deliberately — it is the space where the conversations that do not fit on a stage actually happen.

OMD has won Media Network of the Year at Cannes three times since 2022. That track record is extraordinary. The platform partnerships your team announced at Lions 2025 — across Disney, Walmart, Amazon, Meta and others — showed exactly how OMD uses Cannes to move business, not just collect awards. I want to build on that energy.

For your first Cannes as CEO, having a private, neutral space where you can host clients, partners and talent in a setting that feels nothing like the Palais is a serious asset. We would love to explore what a collaboration looks like — whether that is OMD hosting a session or dinner inside the villa, bringing your team and client network into the house, or building something together for the week.

Here is our partnership deck and the Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

If you have 20 minutes before Cannes:
${CAL_LINK}

Really hope we get to make something happen.`,
  },

  {
    firstName: 'Emily',
    fullName:  'Emily Proctor',
    email:     'emily.proctor@omd.com',
    title:     'Managing Director, Data & Technology Solutions, OMD',
    company:   'OMD',
    subject:   'Cannes Lions — a room worth putting on your radar',
    body: `Hi Emily,

I saw you are speaking at the Digiday Programmatic Marketing Summit this month on OMD's playbook for getting clients on board with agentic AI in programmatic. The framing around Omni Assist and real client outcomes rather than theoretical AI potential is exactly the kind of grounded, no-hype approach the industry needs more of right now.

Your line from Programmatic IO last year has stayed with me too: "There's no silver bullet. There never will be." Said in the context of alt IDs but true of almost every inflection point this industry faces.

I am George Guise, founder of Indvstry Clvb. We are running Indvstry Power House at Cannes Lions 2026, a private luxury villa activation, 21 to 26 June, for a curated group of senior CMOs, creative directors, founders and technology leaders. It is a deliberately neutral, high-quality space outside the Palais footprint, designed for the conversations that do not fit the main stage format.

Given where you sit at OMD — at the intersection of data, technology and creative effectiveness — I think there is a really compelling collaboration here. We could build a closed roundtable inside the villa specifically for data and technology leaders attending Cannes, a room where the agentic AI and measurement conversation can happen with real brand decision-makers in it rather than a conference audience. OMD owns that conversation right now. The Power House gives you the right setting to have it.

Here is our partnership deck and the full Power House overview:

Partnership deck: ${DECK_LINK}
Power House info: ${SITE_LINK}

If you have time for a quick call before Cannes:
${CAL_LINK}

Would love to find a way to make this work, Emily.`,
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
