/**
 * email-villa-residency-checkin.ts
 *
 * Check-in email to all IPH villa residency leads:
 *   - Have they booked a call with George?
 *   - Are they still interested in the villa?
 *
 * Excludes (per George, 14 Apr 2026):
 *   Chanelle Pal, Denise Maxwell, Tendai Pottinger, Alexandra Salomon,
 *   Kelly, Shakira Newton, Olga Viktorova, Aleida Hammond, Ebeneza Blanche,
 *   Rakia Finley (individually emailed today)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-villa-residency-checkin.ts
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

    Just checking in quickly. You filled in your interest for the Indvstry Power House villa at Cannes Lions earlier this year and I wanted to see where you are at with it.<br><br>

    Have you had a chance to book a call with George yet? If not, you can grab a time here: <a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">https://calendly.com/itsvisionnaire/30min</a><br><br>

    We still have a couple of spots left and would love to get you in. Just want to make sure you do not miss out if you are still keen.<br><br>

    Let me know!
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;
}

const recipients: { name: string; email: string; firstName: string }[] = [
  { name: 'Venus Ashu',               email: 'venusashu1@gmail.com',              firstName: 'Venus' },
  { name: 'Frank Skully',             email: 'frankskully@hotmail.com',            firstName: 'Frank' },
  { name: 'LaToya Harding',           email: 'latoyaharding89@gmail.com',          firstName: 'LaToya' },
  { name: 'Sabina Jasinska',          email: 'sabina.jasinska25@gmail.com',        firstName: 'Sabina' },
  { name: 'Anais Motolo',             email: 'Anais603@gmail.com',                 firstName: 'Anais' },
  { name: 'Melissa Cofie',            email: 'Letswork@macomedia.co.uk',           firstName: 'Melissa' },
  { name: 'Tola Mayegun',             email: 'tola.m@hotmail.com',                 firstName: 'Tola' },
  { name: 'Gilda Valle',              email: 'gildavallem@gmail.com',              firstName: 'Gilda' },
  { name: 'Cassy Isabella Woodley',   email: 'Hello@cassyisabella.com',            firstName: 'Cassy' },
  { name: 'Nico Rose',                email: 'Nicorose92@icloud.com',              firstName: 'Nico' },
  { name: 'Daisy Domenghini',         email: 'daisy@dave.sports',                  firstName: 'Daisy' },
  { name: 'Adeze Ogunbunmi',          email: 'dogunbunmi@gmail.com',               firstName: 'Adeze' },
  { name: 'Isabel Lamers',            email: 'isabel.lamers@gmail.com',            firstName: 'Isabel' },
  { name: 'Sabrina Fearon-Melville',  email: 'sfearonmelville@gmail.com',          firstName: 'Sabrina' },
  { name: 'Ashley Brooks',            email: 'abrooks@michelemariepr.com',         firstName: 'Ashley' },
  { name: 'Karen Grillo',             email: 'karen-grillo@hotmail.co.uk',         firstName: 'Karen' },
  { name: 'Naomi Iluyomade',          email: 'niluyomade@gmail.com',               firstName: 'Naomi' },
  { name: 'Marian Reynolds',          email: 'marianjsreynolds@gmail.com',         firstName: 'Marian' },
  { name: 'Katie Langdon',            email: 'klangers@hotmail.com',               firstName: 'Katie' },
  { name: 'Angela Njeri',             email: 'angelanjerik@gmail.com',             firstName: 'Angela' },
  { name: 'Anwar Hossen',             email: 'anwarhossenfilmmaker@gmail.com',     firstName: 'Anwar' },
  { name: 'Elizabeth Anyaegbuna',     email: 'Elizabeth@bunastreetcollective.com', firstName: 'Elizabeth' },
  { name: 'Wesley Antonio',           email: 'enquiriesmrw9ine@gmail.com',         firstName: 'Wesley' },
  { name: 'Elizabeth Ogunkoya',       email: 'E.ogunkoya@hotmail.com',             firstName: 'Elizabeth' },
  { name: 'Christina Ngoyi',          email: 'christinangoyi@gmail.com',           firstName: 'Christina' },
  { name: 'James Harvey',             email: 'James@urbansyndicate.co.uk',         firstName: 'James' },
  { name: 'Cl',                       email: 'capitalkv1@gmail.com',               firstName: 'there' },
  { name: 'Dinesh Joshi',             email: 'dineshj@ndtv.com',                   firstName: 'Dinesh' },
  { name: 'Martha Omasoro',           email: 'info@everydaymolo.com',              firstName: 'Martha' },
  { name: 'Eliana Da Silva',          email: 'eclopesdasilva@gmail.com',           firstName: 'Eliana' },
  { name: 'Tamika Martin',            email: 'Hello@culture-deluxe.com',           firstName: 'Tamika' },
  { name: 'Bonnae Ogunlade-Gillan',   email: 'Bonnaeogunlade@omc.com',             firstName: 'Bonnae' },
  { name: 'Shireen Morrison',         email: 'crowninggreatnesscic@gmail.com',     firstName: 'Shireen' },
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
            subject: 'Still interested in joining us at Cannes?',
            body: { contentType: 'HTML', content: buildHtml(r.firstName) },
            toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
            from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
          }
        },
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
