/**
 * email-villa-new-leads-firstcontact.ts
 *
 * First-contact email to villa residency leads who have never been emailed.
 * 6 people: Jonathan Mbenga, Aileen Phan, Betul Susamis Unaran,
 *           Sherkera Green, Ingrid B. Rogier, Anthony Hutchinson
 *
 * Sells the full IPH residency, stresses 2 rooms left, links to booking page
 * and the residency deck.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-villa-new-leads-firstcontact.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const RESIDENCY_DECK = 'https://canva.link/56bgbawj3ctalgu';
const BOOKING_LINK   = 'https://lu.ma/t4ek2yn7';
const CALENDAR_LINK  = 'https://calendly.com/itsvisionnaire/30min';

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

function buildHtml(firstName: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi ${firstName},<br><br>

    You filled in your interest for Indvstry Power House so I wanted to come back to you properly.<br><br>

    Here is what the residency is: a private 7-bedroom luxury villa in Cannes running 21 to 26 June 2026, alongside Cannes Lions. We have confirmed 5 of our 7 residents. Two rooms remain.<br><br>

    <strong>What is included with your room:</strong><br><br>

    <ul style="padding-left:20px;margin:0 0 16px 0;">
      <li>Official Cannes Lions Delegate Pass (worth &euro;5,000 — this alone covers the cost of the stay)</li>
      <li>Private room in a luxury villa with swimming pool, Mediterranean gardens, and premium amenities</li>
      <li>Daily transport to La Croisette</li>
      <li>Curated event calendar with RSVPs to priority brand houses and panels</li>
      <li>Ticket to our private Diaspora Dinner</li>
      <li>Closing party access</li>
      <li>Networking app credentials</li>
      <li>Strategic positioning guidance throughout the week</li>
    </ul>

    Rooms start from &pound;1,500. You can view the full residency deck here:<br>
    <a href="${RESIDENCY_DECK}" style="color:#1a1a1a;">${RESIDENCY_DECK}</a><br><br>

    When you are ready to secure your spot, book directly here:<br>
    <a href="${BOOKING_LINK}" style="color:#1a1a1a;">${BOOKING_LINK}</a><br><br>

    If you want to speak with George first, grab a time here:<br>
    <a href="${CALENDAR_LINK}" style="color:#1a1a1a;">${CALENDAR_LINK}</a><br><br>

    These last two rooms will go quickly. Let me know if you have any questions.
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;
}

const recipients: { name: string; email: string; firstName: string }[] = [
  { name: 'Jonathan Mbenga',       email: 'jonathanmbenga1@hotmail.com',  firstName: 'Jonathan'  },
  { name: 'Aileen Phan',           email: 'aileen.phan1996@gmail.com',    firstName: 'Aileen'    },
  { name: 'Betul Susamis Unaran',  email: 'betulsusamis@gmail.com',       firstName: 'Betul'     },
  { name: 'Sherkera Green',        email: 'Sherkerawilson@yahoo.com',     firstName: 'Sherkera'  },
  { name: 'Ingrid B. Rogier',      email: 'ingrid@kensingtongrey.co',     firstName: 'Ingrid'    },
  { name: 'Anthony Hutchinson',    email: 'Tmpflagship@gmail.com',        firstName: 'Anthony'   },
];

async function sendAll(): Promise<void> {
  const token  = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const r of recipients) {
    try {
      const message: any = {
        subject: '2 rooms left — Indvstry Power House, Cannes Lions',
        body: { contentType: 'HTML', content: buildHtml(r.firstName) },
        toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
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
      console.log(`[${sent}/${recipients.length}] Sent to ${r.name} <${r.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < recipients.length) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\nDone. ${sent}/${recipients.length} emails sent.`);
}

sendAll().catch(console.error);
