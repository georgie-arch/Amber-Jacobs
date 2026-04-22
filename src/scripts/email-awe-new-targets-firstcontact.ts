/**
 * email-awe-new-targets-firstcontact.ts
 *
 * First contact emails to AWE targets not yet reached.
 * Sent from George as Indvstry Power House outreach.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-awe-new-targets-firstcontact.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

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

function buildHtml(firstName: string, orgContext: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi ${firstName},<br><br>

    My name is George Guise — founder of Indvstry Clvb. I wanted to reach out directly about something we are building at Cannes Lions 2026 that I think would be interesting to ${orgContext}.<br><br>

    We are running Indvstry Power House — a private villa activation in the south of France during Cannes Lions week (21-26 June). It is designed for senior brand leaders, CMOs and cultural operators who want something more curated and high-level than the standard beach activations. Think intimate dinners, closed-door conversations, and a genuinely interesting group of people all under one roof.<br><br>

    We have an ERA partnership with EUR 75k in delegate passes, confirmed C-suite residents, and The Shade Borough (900k+ Instagram) as our media partner.<br><br>

    Would love to get 20 minutes with you to explore how we could work together. You can book a time here: <a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">calendly.com/itsvisionnaire/30min</a><br><br>

    More on what we are building: <a href="https://powerhouse.indvstryclvb.com" style="color:#1a1a1a;">powerhouse.indvstryclvb.com</a>
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;
}

const recipients: { name: string; email: string; firstName: string; orgContext: string }[] = [
  {
    name: 'Linda Yaccarino',
    email: 'partnerships@ymugroup.com',
    firstName: 'Linda',
    orgContext: 'YMU and the talent network you represent',
  },
  {
    name: 'Jerret West',
    email: 'jerret.west@roblox.com',
    firstName: 'Jerret',
    orgContext: 'Roblox and what you are building at the intersection of gaming and culture',
  },
  {
    name: 'Anabel Leibovic Farrar',
    email: 'anabel@campfire.co.uk',
    firstName: 'Anabel',
    orgContext: 'Campfire and the brands you work with',
  },
  {
    name: 'The Standard London',
    email: 'advertise@standard.co.uk',
    firstName: 'team',
    orgContext: 'The Standard and your commercial partnerships',
  },
  {
    name: 'WSJ / Barron\'s Group',
    email: 'thetrust@wsjbarrons.com',
    firstName: 'team',
    orgContext: 'WSJ Barron\'s Group and your brand content partnerships',
  },
  {
    name: 'Shorty Awards',
    email: 'partnerships@shortyawards.com',
    firstName: 'team',
    orgContext: 'Shorty Awards and the creator economy brands you champion',
  },
  {
    name: 'James Nord',
    email: 'james@fohr.co',
    firstName: 'James',
    orgContext: 'Fohr and the creator partnerships space you operate in',
  },
  {
    name: 'Matt Kellogg',
    email: 'matt@soundstack.com',
    firstName: 'Matt',
    orgContext: 'SoundStack and your audio advertising work',
  },
  {
    name: 'The Marketing Society',
    email: 'info@marketingsociety.com',
    firstName: 'team',
    orgContext: 'The Marketing Society and your member network',
  },
  {
    name: 'Sarah Virani',
    email: 'Sarah.Virani@adassoc.org.uk',
    firstName: 'Sarah',
    orgContext: 'the Advertising Association and your Front Foot network',
  },
  {
    name: 'Andrew Eisner',
    email: 'andrew.eisner@reachtv.com',
    firstName: 'Andrew',
    orgContext: 'ReachTV and your travel media partnerships',
  },
];

async function sendAll(): Promise<void> {
  const token = await getToken();
  let sent = 0;

  for (const r of recipients) {
    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          message: {
            subject: 'Indvstry Power House x Cannes Lions 2026',
            body: { contentType: 'HTML', content: buildHtml(r.firstName, r.orgContext) },
            toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
            from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
          }
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      sent++;
      console.log(`[${sent}/${recipients.length}] Sent to ${r.name} <${r.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }
    await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent}/${recipients.length} first-contact emails sent.`);
}

sendAll().catch(console.error);
