/**
 * email-villa-leads-still-interested.ts
 *
 * Short check-in to all 43 villa leads emailed on 6 May 2026.
 * Cannes is now 5 weeks away — simple "are you still interested?" prompt.
 *
 * From: Amber Jacobs <access@indvstryclvb.com>
 * Run: npx ts-node --project tsconfig.json src/scripts/email-villa-leads-still-interested.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const BOOKING_LINK  = 'https://lu.ma/t4ek2yn7';
const CALENDAR_LINK = 'https://calendly.com/itsvisionnaire/30min';

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

    Cannes is five weeks away now and I just wanted to do a quick check-in.<br><br>

    Are you still interested in joining us at Indvstry Power House? We have a couple of spots left and would love to get you confirmed if you are still keen.<br><br>

    Ready to book your spot:<br>
    <a href="${BOOKING_LINK}" style="color:#1a1a1a;">${BOOKING_LINK}</a><br><br>

    Want to speak with George first? Grab a time here:<br>
    <a href="${CALENDAR_LINK}" style="color:#1a1a1a;">${CALENDAR_LINK}</a><br><br>

    Just let me know either way.
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

const recipients: { name: string; firstName: string; email: string }[] = [
  { name: 'Venus Ashu',              firstName: 'Venus',     email: 'venusashu1@gmail.com' },
  { name: 'Frank Skully',            firstName: 'Frank',     email: 'frankskully@hotmail.com' },
  { name: 'LaToya Harding',          firstName: 'LaToya',    email: 'latoyaharding89@gmail.com' },
  { name: 'Sabina Jasinska',         firstName: 'Sabina',    email: 'sabina.jasinska25@gmail.com' },
  { name: 'Anais Motolo',            firstName: 'Anais',     email: 'Anais603@gmail.com' },
  { name: 'Melissa Cofie',           firstName: 'Melissa',   email: 'Letswork@macomedia.co.uk' },
  { name: 'Tola Mayegun',            firstName: 'Tola',      email: 'tola.m@hotmail.com' },
  { name: 'Gilda Valle',             firstName: 'Gilda',     email: 'gildavallem@gmail.com' },
  { name: 'Cassy Isabella Woodley',  firstName: 'Cassy',     email: 'Hello@cassyisabella.com' },
  { name: 'Nico Rose',               firstName: 'Nico',      email: 'Nicorose92@icloud.com' },
  { name: 'Daisy Domenghini',        firstName: 'Daisy',     email: 'daisy@dave.sports' },
  { name: 'Isabel Lamers',           firstName: 'Isabel',    email: 'isabel.lamers@gmail.com' },
  { name: 'Sabrina Fearon-Melville', firstName: 'Sabrina',   email: 'sfearonmelville@gmail.com' },
  { name: 'Ashley Brooks',           firstName: 'Ashley',    email: 'abrooks@michelemariepr.com' },
  { name: 'Karen Grillo',            firstName: 'Karen',     email: 'karen-grillo@hotmail.co.uk' },
  { name: 'Naomi Iluyomade',         firstName: 'Naomi',     email: 'niluyomade@gmail.com' },
  { name: 'Marian Reynolds',         firstName: 'Marian',    email: 'marianjsreynolds@gmail.com' },
  { name: 'Katie Langdon',           firstName: 'Katie',     email: 'klangers@hotmail.com' },
  { name: 'Angela Njeri',            firstName: 'Angela',    email: 'angelanjerik@gmail.com' },
  { name: 'Anwar Hossen',            firstName: 'Anwar',     email: 'anwarhossenfilmmaker@gmail.com' },
  { name: 'Elizabeth Anyaegbuna',    firstName: 'Elizabeth', email: 'Elizabeth@bunastreetcollective.com' },
  { name: 'Wesley Antonio',          firstName: 'Wesley',    email: 'enquiriesmrw9ine@gmail.com' },
  { name: 'Elizabeth Ogunkoya',      firstName: 'Elizabeth', email: 'E.ogunkoya@hotmail.com' },
  { name: 'Jonathan Mbenga',         firstName: 'Jonathan',  email: 'jonathanmbenga1@hotmail.com' },
  { name: 'Christina Ngoyi',         firstName: 'Christina', email: 'christinangoyi@gmail.com' },
  { name: 'James Harvey',            firstName: 'James',     email: 'James@urbansyndicate.co.uk' },
  { name: 'Aileen Phan',             firstName: 'Aileen',    email: 'aileen.phan1996@gmail.com' },
  { name: 'Dinesh Joshi',            firstName: 'Dinesh',    email: 'dineshj@ndtv.com' },
  { name: 'Martha Omasoro',          firstName: 'Martha',    email: 'info@everydaymolo.com' },
  { name: 'Eliana Da Silva',         firstName: 'Eliana',    email: 'eclopesdasilva@gmail.com' },
  { name: 'Tamika Martin',           firstName: 'Tamika',    email: 'Hello@culture-deluxe.com' },
  { name: 'Bonnae Ogunlade-Gillan',  firstName: 'Bonnae',    email: 'Bonnaeogunlade@omc.com' },
  { name: 'Shireen Morrison',        firstName: 'Shireen',   email: 'crowninggreatnesscic@gmail.com' },
  { name: 'Betul Susamis Unaran',    firstName: 'Betul',     email: 'betulsusamis@gmail.com' },
  { name: 'Sherkera Green',          firstName: 'Sherkera',  email: 'Sherkerawilson@yahoo.com' },
  { name: 'Ingrid B. Rogier',        firstName: 'Ingrid',    email: 'ingrid@kensingtongrey.co' },
  { name: 'Tia Kay',                 firstName: 'Tia',       email: 'tiakaycee12@gmail.com' },
  { name: 'Charlotte',               firstName: 'Charlotte', email: 'charlotte@stylecartel.com' },
  { name: 'Ro Laurren',              firstName: 'Ro',        email: 'rolaurren@gmail.com' },
  { name: 'Maria',                   firstName: 'Maria',     email: 'maria@wearecreativemedia.org' },
  { name: 'Anam',                    firstName: 'Anam',      email: 'anam@thehanginghouse.com' },
  { name: 'Musa Ahmad',              firstName: 'Musa',      email: 'msahmad0015@gmail.com' },
  { name: 'Jim',                     firstName: 'Jim',       email: 'Jim@iqzone.com' },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    try {
      const message: any = {
        subject: 'Still interested in joining us at Cannes?',
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
      failed++;
      console.error(`FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
}

sendAll().catch(console.error);
