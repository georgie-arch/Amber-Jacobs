/**
 * 7 Weeks to Cannes — resident update email
 * Sends confirmed event registration summary to all 10 IPH residents.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-residents-7-weeks-cannes.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { RESIDENTS } from '../data/residents';
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

function buildHtml(firstName: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const p = (text: string) => `<p style="margin:0 0 14px 0;">${text}</p>`;

  const events = [
    'FQ Beach @ Cannes Lions 2026',
    'Adweek House @ Cannes 2026',
    'DEPT Agency (The Secret Garden)',
    'The Cannes Social (ExchangeWire)',
    'A.I. and Technology Sandbox @ Cannes Lions',
    'Pinterest Manifestival',
    'Brands &amp; Culture Villa',
    'Cannes Lions Creators Beach',
    'Digiday @ Cannes (including Panel &amp; Cocktail Reception)',
    'The LWS Salon',
    'Cannes Brand Leaders Dinner',
    'Cannes Marketing Leaders Brunch',
    'Cannes Panel &amp; Cocktail Reception',
    'Le Club MSQ',
    'Cocktail Hour in Cannes',
    'WIN Lounge',
    'Maison New Digital Age',
    'Sport Beach',
    'FreeWheel',
    'Reddit @ Cannes',
    'VaynerX @ Cannes Lions',
    'SIGAWomen Lounge @ Roberto Cavalli',
    'Deloitte Digital x WSJ',
    'Plage 3CV',
    'Marketing Leadership Summit',
    'Adobe @ Cannes',
    'Inkwell Beach',
    'SIGNAL Sessions',
    'WSJ Journal House',
  ].map(e => `<li style="margin-bottom:6px;">${e}</li>`).join('\n');

  const content = `
    ${p(`Hi ${firstName},`)}
    ${p('We are officially 7 weeks out from the Cannes Lions Festival 2026! That is 49 days to go.')}
    ${p('The energy is building, and at Indvstry Clvb, we have been working behind the scenes to ensure your Power House experience is as seamless and high-access as possible. To save you the administrative headache, we have officially pre-registered all residents for a curated list of the festival\'s most essential activations and venues.')}
    <p style="margin:0 0 8px 0;font-weight:bold;">Your Confirmed Event Registrations</p>
    ${p('You are now registered for the following hubs. Please keep a close eye on your inbox, as many of these organisers will be sending individual QR codes or confirmation emails directly to you over the coming days (except you have not provided us with your company email, most of the events do not accept Gmail, Hotmail or other generic email addresses):')}
    <ul style="margin:0 0 16px 0;padding-left:20px;line-height:1.8;">
      ${events}
    </ul>
    <p style="margin:0 0 8px 0;font-weight:bold;">Delegate Passes: Next Steps</p>
    ${p('A quick logistical update: You will receive the login instructions for your official delegate passes later this week. Please look out for an email with the subject line "Indvstry Clvb: Festival Pass Access" to set up your profile in the official Cannes Lions app.')}
    ${p('We are incredibly excited to host this group of leaders at the Power House. We cannot wait to meet you all in person on the Croisette and get the conversation started.')}
    ${p('See you in June!')}
  `;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${content}</div>
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

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  const subject = '7 Weeks to Cannes: Your Power House Access & Event Schedule 🇫🇷';
  let sent = 0;

  for (const resident of RESIDENTS) {
    const fullName = `${resident.firstName} ${resident.lastName}`;
    try {
      const message: any = {
        subject,
        body: { contentType: 'HTML', content: buildHtml(resident.firstName) },
        toRecipients: [{ emailAddress: { address: resident.email, name: fullName } }],
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
      console.log(`[${sent}/${RESIDENTS.length}] Sent to ${fullName} <${resident.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${fullName} <${resident.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < RESIDENTS.length) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\nDone. ${sent}/${RESIDENTS.length} emails sent.`);
}

sendAll().catch(console.error);
