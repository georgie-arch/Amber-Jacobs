/**
 * Diaspora Dinner + done-for-you RSVP outreach
 * 5 contacts who already have a strong Cannes Lions relationship
 * Angle: our programme amplifies their existing experience
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-diaspora-dinner-cannes-batch.ts
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

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
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

const contacts: { name: string; email: string; subject: string; body: string }[] = [
  {
    name:    'J. Vaughan',
    email:   'jvaughan@cvent.com',
    subject: 'Something worth adding to your Cannes week',
    body: `Hi,

Cvent powers more of what actually happens at Cannes than most people realise — the registrations, the logistics, the behind-the-scenes machinery that makes the week run. You know better than most how much is going on and how hard it is to actually get into the right rooms.

We are running Indvstry Power House during Cannes Lions week — a private villa activation with a curated programme of events, dinners and closed-door conversations. One of the things we offer the people in our network is a done-for-you RSVP service: there are over 2,500 fringe events happening that week and we handle the registrations so people do not miss what they actually want to be at.

On Tuesday 23rd June we are also hosting our Diaspora Dinner — an intimate private dinner for a small group of senior creative and industry leaders, away from the main circuit. It is not something that gets a lot of public visibility, which is exactly the point.

If Cannes is on your agenda this year, we would love to have you at the dinner and to make sure your week is as good as it can be.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'Leon',
    email:   'leon.harlow@ymugroup.com',
    subject: 'A dinner at Cannes you will actually want to be at',
    body: `Hi Leon,

Following up on our earlier note — I wanted to reach out with something more specific ahead of Cannes.

On Tuesday 23rd June we are hosting our Diaspora Dinner — a private, intimate dinner for a small group of senior creative and industry leaders during Lions week. No agenda, no pitches. Just the right people in the right room, away from the main circuit. Given YMU's position at the intersection of talent, culture and commercial partnerships, it felt like exactly the kind of evening you would value.

Alongside the dinner, we also offer a done-for-you RSVP service for the people in our network. There are over 2,500 fringe events happening during Cannes week — we handle the registrations so you do not miss what you actually want to be at.

If you are heading to Cannes this year, we would love to have you at the dinner and to make your week as valuable as possible.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'Ula',
    email:   'ula.nairne@stelia.io',
    subject: 'A dinner during Cannes Lions week — for your consideration',
    body: `Hi Ula,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House during Lions week — a private villa activation with a curated programme of events and conversations for senior creative and tech leaders. On Tuesday 23rd June we are hosting our Diaspora Dinner: an intimate, invite-only dinner for a small group of people who are doing genuinely interesting things in the industry. It is a deliberately small gathering, away from the main festival floor, and every seat is considered.

We also offer a done-for-you RSVP service for the people in our network. With over 2,500 fringe events happening that week, we handle the registrations so you actually get into the rooms worth being in.

If Cannes is on your radar this year, I would love to tell you more about both.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'D. Chater',
    email:   'dchater@bloomberg.net',
    subject: 'One dinner at Cannes worth being at',
    body: `Hi,

Bloomberg's presence at Cannes Lions is one of the most recognised in the building — the breakfasts, the screenings, the conversations that set the tone for the week. You know the festival as well as anyone.

We are running Indvstry Power House alongside Lions this year — a private villa activation for a curated group of senior leaders. On Tuesday 23rd June we are hosting our Diaspora Dinner: a small, intimate gathering for a select group of executives and creatives, away from the main circuit. The kind of dinner where the real conversations happen.

We also run a done-for-you RSVP service for people in our network — over 2,500 fringe events happen during Lions week and we handle the registrations so you do not miss what matters.

Given Bloomberg's history at Cannes, we wanted to extend the invitation directly. We would love to have you at the table.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'Jimmy',
    email:   'jimmy@ok-social.co.uk',
    subject: 'Cannes Lions — a dinner and a done-for-you week',
    body: `Hi Jimmy,

I am reaching out from Indvstry Clvb ahead of Cannes Lions this June.

We are running Indvstry Power House during Lions week — a private villa and curated programme for a select group of creative and industry leaders. On Tuesday 23rd June we are hosting our Diaspora Dinner: an intimate, invite-only evening away from the main festival, with a small group of senior people who are shaping what creative culture looks like right now. The kind of room a social-first agency like OK Social belongs in.

We also offer a done-for-you RSVP service for the people in our network — over 2,500 fringe events run during Lions week and we handle all the registrations, so you get access to what you actually want to be at without the admin.

If you are heading to Cannes this year, we would love to have you at the dinner and to make the week work properly for you.

More on what we are building: Powerhouse.indvstryclvb.com`,
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
        from:         { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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
      console.log(`[${sent}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < contacts.length) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\nDone. ${sent}/${contacts.length} emails sent.`);
}

sendAll().catch(console.error);
