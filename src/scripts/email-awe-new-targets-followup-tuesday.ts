/**
 * email-awe-new-targets-followup-tuesday.ts
 *
 * Follow-up to the 11 new AWE targets first contacted on 15 Apr 2026.
 * Scheduled to run Tuesday 21 April 2026.
 *
 * Run manually: npx ts-node --project tsconfig.json src/scripts/email-awe-new-targets-followup-tuesday.ts
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

function buildHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi ${firstName},<br><br>

    Just following up on my note from last week about Indvstry Power House at Cannes Lions 2026.<br><br>

    I know inboxes get busy — wanted to make sure this did not get lost. We are in the final stages of locking in our partners for the week and would love to explore whether there is a fit.<br><br>

    If a quick call works, you can grab a time here: <a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">calendly.com/itsvisionnaire/30min</a><br><br>

    Or take a look at what we are building: <a href="https://powerhouse.indvstryclvb.com" style="color:#1a1a1a;">powerhouse.indvstryclvb.com</a>
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

const recipients: { name: string; email: string; firstName: string }[] = [
  { name: 'Linda Yaccarino',         email: 'partnerships@ymugroup.com',      firstName: 'Linda' },
  { name: 'Jerret West',             email: 'jerret.west@roblox.com',         firstName: 'Jerret' },
  { name: 'Anabel Leibovic Farrar',  email: 'anabel@campfire.co.uk',          firstName: 'Anabel' },
  { name: 'The Standard London',     email: 'advertise@standard.co.uk',       firstName: 'team' },
  { name: 'WSJ / Barron\'s Group',   email: 'thetrust@wsjbarrons.com',        firstName: 'team' },
  { name: 'Shorty Awards',           email: 'partnerships@shortyawards.com',  firstName: 'team' },
  { name: 'James Nord',              email: 'james@fohr.co',                  firstName: 'James' },
  { name: 'Matt Kellogg',            email: 'matt@soundstack.com',            firstName: 'Matt' },
  { name: 'The Marketing Society',   email: 'info@marketingsociety.com',      firstName: 'team' },
  { name: 'Sarah Virani',            email: 'Sarah.Virani@adassoc.org.uk',    firstName: 'Sarah' },
  { name: 'Andrew Eisner',           email: 'andrew.eisner@reachtv.com',      firstName: 'Andrew' },
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
            subject: 'Following up — Indvstry Power House x Cannes Lions 2026',
            body: { contentType: 'HTML', content: buildHtml(r.firstName) },
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

  console.log(`\nDone. ${sent}/${recipients.length} Tuesday follow-up emails sent.`);
}

sendAll().catch(console.error);
