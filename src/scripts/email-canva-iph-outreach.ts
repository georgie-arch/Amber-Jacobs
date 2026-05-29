/**
 * Canva x Indvstry Power House partnership outreach — 4 personalised emails
 * Zach Kitschke, Jimmy Knowles, Meghan Gendelman, Duncan Clark
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-canva-iph-outreach.ts
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

const contacts = [
  {
    name:    'Zach Kitschke',
    email:   'zach.kitschke@canva.com',
    subject: 'Canva x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Zach,

I saw your conversation at Cannes Lions 2025 about the shift Canva is making from a consumer platform to something genuinely embedded in how enterprise teams create and communicate, and the way you talked about AI completely changing the speed at which people can bring ideas to life. That context is exactly why I am reaching out.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, brand leaders and founders. Private dinners, closed programming, and a genuinely intimate base during the most important week in the global creative calendar.

The people in this room are precisely the decision-makers driving creative and visual communication strategy at their organisations. The Canva Beach activation is an incredible statement of scale. The Power House sits at the other end of the spectrum, small by design, and built around the quality of conversation and connection it creates. We think there is a natural and complementary story for Canva to tell across both spaces during Lions week.

We would love to get on a call and explore what a Canva presence inside the villa could look like. Our founder George is easy to reach here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts.`,
  },
  {
    name:    'Jimmy Knowles',
    email:   'jimmy.knowles@canva.com',
    subject: 'Canva x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Jimmy,

I read your quote about innovation meaning staying in a state of creative restlessness, asking what else could this be, how much bigger can we go, what has not been done before. That exact thinking is what got me to reach out.

You have built the Canva Beach into one of the most talked-about activations at Lions. 4,000 visitors, tripling the space in 2026. That is a remarkable achievement. I want to talk about what sits alongside it.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 of the most senior creative and brand leaders at the festival. No badge scanners. No queues. Private dinners, closed sessions, and the kind of environment where the most important conversations at Lions actually happen.

The two activations are genuinely complementary. The Beach reaches everyone. The Power House reaches the people who go on to shape the decisions and the culture that everyone else follows. A Canva presence in the villa, whether as a programming partner, a dinner host or a branded moment, lands in a very different and arguably more valuable room.

Given you are the person who shapes what Canva does at Cannes, I would love to get 20 minutes on a call and walk through what this could look like. Our founder George is available here: https://calendly.com/itsvisionnaire/30min

Would love to explore it with you.`,
  },
  {
    name:    'Meghan Gendelman',
    email:   'meghan.gendelman@canva.com',
    subject: 'Canva x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Meghan,

Congratulations on the role. I have been following your thinking since the appointment and particularly your point about creativity becoming foundational infrastructure in enterprise, not optional, and Canva being uniquely positioned for that moment. That framing is exactly why this feels worth putting in front of you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, brand leaders and founders. Private dinners, closed-door programming, and an intimate base for the most senior people at the festival.

The room is a direct line to the enterprise decision-makers you are focused on. CMOs and creative leads who set visual communication strategy across their organisations, many of them exactly the kind of buyers Canva Enterprise is built for. A Canva presence inside the Power House, whether as a session, a dinner or a branded moment during the week, lands in front of those people in a setting where they are genuinely engaged and receptive.

Given your focus on the B2B side, this felt like something worth getting on a call about. Our founder George is available here: https://calendly.com/itsvisionnaire/30min

Happy to share more on the programme and the people involved.`,
  },
  {
    name:    'Duncan Clark',
    email:   'duncan.clark@canva.com',
    subject: 'Canva x Indvstry Power House — Cannes Lions 2026',
    body: `Hi Duncan,

As the person leading Canva's EMEA business, Cannes Lions sits squarely in your territory and I wanted to put this directly in front of you.

We are running Indvstry Power House at Cannes Lions 2026, 21 to 26 June. A private villa residency just outside the Palais for a curated group of 20 to 30 senior creative directors, CMOs, brand leaders and founders from across Europe and globally. Private dinners, closed programming, and a genuinely high-quality base during Lions week.

Canva is already making a significant statement at the festival with the Beach activation. What the Power House offers is the intimate layer that sits alongside it. The people in the villa are among the most senior and most connected in the EMEA market. The kind of people who shape how their organisations think about creative tools, visual communication and the platforms they build on. For Canva's enterprise and EMEA growth story, a presence in this room during the most important week of the creative calendar feels like a natural fit.

We have a small number of partnership spots available and wanted to reach out ahead of the summer. Our founder George would love to get on a call and walk through what the opportunity looks like in detail. You can book time directly here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const c of contacts) {
    try {
      const message: any = {
        subject: c.subject,
        body:    { contentType: 'HTML', content: buildHtml(c.body) },
        toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
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
      console.log(`[${sent}/4] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < contacts.length) await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\nDone. ${sent}/4 sent.`);
}

sendAll().catch(console.error);
