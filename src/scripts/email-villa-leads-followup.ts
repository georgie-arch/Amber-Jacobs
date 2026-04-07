/**
 * email-villa-leads-followup.ts
 *
 * Follow-up to all warm/interested villa room leads.
 * 5 rooms confirmed, 2 remaining — are you still in?
 *
 * Scheduled: Friday 27 March 2026 at 08:00 UTC
 *
 * Run manually:
 *   npx ts-node --project tsconfig.json src/scripts/email-villa-leads-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import * as cron from 'node-cron';

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

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
  </div>
</body></html>`;
}

async function sendEmail(token: string, to: string, toName: string, firstName: string): Promise<void> {
  const logoB64 = getLogoBase64();

  const body = `Hi ${firstName},

Quick one — 5 of our 7 rooms in the Indvstry Clvb Cannes villa are now confirmed. We have just 2 left.

You showed interest earlier and we did not want those last spots to go without checking in with you first.

If Cannes Lions is still on your radar this June, now is the moment to move. We would love to jump on a quick call and make sure your Cannes week gets off to the best possible start.

Amber
Indvstry Clvb`;

  const message: any = {
    subject: 'Cannes villa — 2 rooms left',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };

  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── RECIPIENTS ───────────────────────────────────────────────────────────────
// Excluded: Alexandra, Katie, Naomi, Olga, Chanelle, Kelly (per George)
// Excluded: HOT LEADS (paid), COLD leads (uninterested/unresponded)

const recipients = [
  { name: 'Venus Ashu',               email: 'venusashu1@gmail.com',              firstName: 'Venus' },
  { name: 'Frank Skully',             email: 'frankskully@hotmail.com',            firstName: 'Frank' },
  { name: 'Denise Maxwell',           email: 'denise.maxwell@gmail.com',           firstName: 'Denise' },
  { name: 'Abi Blend',                email: 'blendworld@gmail.com',               firstName: 'Abi' },
  { name: 'LaToya Harding',           email: 'latoyaharding89@gmail.com',          firstName: 'LaToya' },
  { name: 'Sabina Jasinska',          email: 'sabina.jasinska25@gmail.com',        firstName: 'Sabina' },
  { name: 'Tendai Pottinger',         email: 'hello@tendaipottinger.com',          firstName: 'Tendai' },
  { name: 'Anais Motolo',             email: 'Anais603@gmail.com',                 firstName: 'Anais' },
  { name: 'Tola Mayegun',             email: 'tola.m@hotmail.com',                 firstName: 'Tola' },
  { name: 'Gilda Valle',              email: 'gildavallem@gmail.com',              firstName: 'Gilda' },
  { name: 'Cassy Isabella Woodley',   email: 'Hello@cassyisabella.com',            firstName: 'Cassy' },
  { name: 'Nico Rose',                email: 'Nicorose92@icloud.com',              firstName: 'Nico' },
  { name: 'Daisy Domenghini',         email: 'daisy.domenghini@vaynermedia.com',   firstName: 'Daisy' },
  { name: 'Adeze Ogunbunmi',          email: 'dogunbunmi@gmail.com',               firstName: 'Adeze' },
  { name: 'Aleida Hammond',           email: 'aleida.studio@outlook.com',          firstName: 'Aleida' },
  { name: 'Sabrina Fearon-Melville',  email: 'sfearonmelville@gmail.com',          firstName: 'Sabrina' },
  { name: 'Rakia Finley',             email: 'rakia@coppervine.io',                firstName: 'Rakia' },
  { name: 'Ebeneza Blanche',          email: 'info@ebenezablanche.com',            firstName: 'Ebeneza' },
  { name: 'Ashley Brooks',            email: 'abrooks@michelemariepr.com',         firstName: 'Ashley' },
  { name: 'Karen Grillo',             email: 'karen-grillo@hotmail.co.uk',         firstName: 'Karen' },
  { name: 'Marian Reynolds',          email: 'marianjsreynolds@gmail.com',         firstName: 'Marian' },
  { name: 'Angela Njeri',             email: 'angelanjerik@gmail.com',             firstName: 'Angela' },
  { name: 'Paula Grunfeld',           email: 'paula@bunnycreative.com',            firstName: 'Paula' },
  { name: 'Anwar Hossen',             email: 'anwarhossenfilmmaker@gmail.com',     firstName: 'Anwar' },
];

// ─── SEND ────────────────────────────────────────────────────────────────────

async function sendAll(): Promise<void> {
  const token = await getToken();
  for (const r of recipients) {
    await sendEmail(token, r.email, r.name, r.firstName);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    if (recipients.indexOf(r) < recipients.length - 1) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }
  console.log(`\n✅ ${recipients.length} follow-up emails sent.`);
}

// ─── SCHEDULER ───────────────────────────────────────────────────────────────
// Friday 27 March 2026 at 08:00 UTC

const RUN_NOW = process.env.RUN_NOW === 'true';

if (RUN_NOW) {
  sendAll().catch(console.error);
} else {
  console.log('Scheduler running — villa follow-ups will fire Friday 27 March 2026 at 08:00 UTC');
  cron.schedule('0 8 27 3 *', async () => {
    const now = new Date();
    const m = now.getUTCMonth(); // 2 = March
    const d = now.getUTCDate();  // 27
    if (m !== 2 || d !== 27) return;
    console.log('Firing villa lead follow-ups...');
    await sendAll().catch(console.error);
  });
}
