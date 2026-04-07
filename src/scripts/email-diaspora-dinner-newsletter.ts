/**
 * email-diaspora-dinner-newsletter.ts
 *
 * Diaspora Dinner announcement to newsletter subscribers.
 * 114 recipients — all newsletter signups excluding Chan (registered resident)
 * and disguiseme@hotmail.com (removed by George).
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-diaspora-dinner-newsletter.ts
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
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
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
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function sendEmail(token: string, to: string, toName: string, subject: string, body: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
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
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

function buildBody(firstName: string): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return `${greeting}

Our first Indvstry Power House event in Cannes is the Diaspora Dinner on 23rd June, and you can register right now at https://luma.com/5vmr7s6f. If you'd love to stay with us at the villa and want all the details, book a call with someone on our team: https://calendly.com/itsvisionnaire/30min. Can't wait to speak to you.`;
}

const SUBJECT = 'Our first Cannes event is live - Diaspora Dinner, 23rd June';

interface Recipient {
  name: string;
  firstName: string;
  email: string;
}

const recipients: Recipient[] = [
  { name: 'Jay', firstName: 'Jay', email: 'jay@ceek.com' },
  { name: 'Jacque', firstName: 'Jacque', email: 'jacqueokaka46@gmail.com' },
  { name: 'Shanice', firstName: 'Shanice', email: 'shanice@kallure.co.uk' },
  { name: 'Bukunmi', firstName: 'Bukunmi', email: 'bukunmi_eni@yahoo.com' },
  { name: 'Paul', firstName: 'Paul', email: 'paulanzamb@gmail.com' },
  { name: 'Darren', firstName: 'Darren', email: 'darrenkombe@icloid.com' },
  { name: '', firstName: '', email: 'sda@dunmomi.com' },
  { name: 'Sophie', firstName: 'Sophie', email: 'sophie@wordonthecurb.co.uk' },
  { name: 'Monica', firstName: 'Monica', email: 'monicacavasino@gmail.com' },
  { name: 'Savannah', firstName: 'Savannah', email: 'savannah-adams@live.co.uk' },
  { name: 'Christina', firstName: 'Christina', email: 'christinaminshull@thebrandaudit.uk' },
  { name: 'Emma', firstName: 'Emma', email: 'emmahvengaard@gmail.com' },
  { name: 'Cham', firstName: 'Cham', email: 'chamwillock@gmail.com' },
  { name: 'Jo', firstName: 'Jo', email: 'jowong@whoisjowong.co.uk' },
  { name: '', firstName: '', email: 'cincio85@gmail.com' },
  { name: 'Eleanor', firstName: 'Eleanor', email: 'eleanor.thornton-firkin@ipsos.com' },
  { name: 'Tariq', firstName: 'Tariq', email: 'tariqwest19@gmail.com' },
  { name: 'Brittany', firstName: 'Brittany', email: 'hello@brittanylashae.com' },
  { name: 'Abe', firstName: 'Abe', email: 'abeglover@outlook.com' },
  { name: 'Che', firstName: 'Che', email: 'che.wheatley@ft.com' },
  { name: 'Lorraine', firstName: 'Lorraine', email: 'lorraine@lorrainewright.co.uk' },
  { name: 'Marie', firstName: 'Marie', email: 'marie@glowconsultancy.london' },
  { name: '', firstName: '', email: 'mis.eventz@live.co.uk' },
  { name: 'Pritesh', firstName: 'Pritesh', email: 'pritesh@pritspr.com' },
  { name: 'Mario', firstName: 'Mario', email: 'mario.pican2023@stud.umfcd.ro' },
  { name: 'Michael', firstName: 'Michael', email: 'michael_glover@live.co.uk' },
  { name: '', firstName: '', email: 'sys659@hotmail.com' },
  { name: 'Ayesha', firstName: 'Ayesha', email: 'ayeshataylorcamara@gmail.com' },
  { name: 'Lynda', firstName: 'Lynda', email: 'lyndakungu@gmail.com' },
  { name: 'Tamay', firstName: 'Tamay', email: 'tamay@w2smarketing.com' },
  { name: 'Divine', firstName: 'Divine', email: 'divinekatolo6@gmail.com' },
  { name: 'Charlene', firstName: 'Charlene', email: 'charleneanncabral@gmail.com' },
  { name: 'Lilian', firstName: 'Lilian', email: 'lilianchesh@gmail.com' },
  { name: 'Terry', firstName: 'Terry', email: 'terrykangwana@gmail.com' },
  { name: 'Njeri', firstName: 'Njeri', email: 'njericynthia01@gmail.com' },
  { name: 'Bayle', firstName: 'Bayle', email: 'bayle@puravidallc.org' },
  { name: 'Eliana', firstName: 'Eliana', email: 'eliana@audion.fm' },
  { name: 'Valentina', firstName: 'Valentina', email: 'valentina.carcione@esn.it' },
  { name: '', firstName: '', email: 'dbeglinton@gmail.com' },
  { name: 'Chris', firstName: 'Chris', email: 'chris_cordelluk@hotmail.com' },
  { name: 'Malek', firstName: 'Malek', email: 'officiallymalek@gmail.com' },
  { name: 'Rabea', firstName: 'Rabea', email: 'rabea.akkas@gmail.com' },
  { name: 'Malachi', firstName: 'Malachi', email: 'malachifagan@outlook.com' },
  { name: 'Daisy', firstName: 'Daisy', email: 'daisy@dave.sport' },
  { name: 'Ren', firstName: 'Ren', email: 'ren.kainth@fenestra.io' },
  { name: 'Chrissie', firstName: 'Chrissie', email: 'chrissiedeor@gmail.com' },
  { name: 'Tasha', firstName: 'Tasha', email: 'tashaklondon@gmail.com' },
  { name: 'Rebecca', firstName: 'Rebecca', email: 'rebecca.pnwoodley@gmail.com' },
  { name: 'Nicolette', firstName: 'Nicolette', email: 'nicolettealexandrabritocruz@gmail.com' },
  { name: 'Fabricio', firstName: 'Fabricio', email: 'fabriciolisboa0@outlook.com' },
  { name: 'Katrina', firstName: 'Katrina', email: 'katrinaappie@yahoo.com' },
  { name: 'Nana', firstName: 'Nana', email: 'nanakinqg@gmail.com' },
  { name: 'Barbara', firstName: 'Barbara', email: 'barbara@brownstone.co.uk' },
  { name: 'Lynne', firstName: 'Lynne', email: 'lynne.egwuekwe@gmail.com' },
  { name: '', firstName: '', email: 'momanyiofficial@gmail.com' },
  { name: 'Nishant', firstName: 'Nishant', email: 'jha.nishant@hotmail.com' },
  { name: 'Nkeiru', firstName: 'Nkeiru', email: 'nkeirukaw@gmail.com' },
  { name: 'Dee', firstName: 'Dee', email: 'deebrownee@outlook.com' },
  { name: 'Thembisa', firstName: 'Thembisa', email: 'thembisa@caspianfilms.net' },
  { name: 'Maximilian', firstName: 'Maximilian', email: 'jost.maximilian@yahoo.de' },
  { name: '', firstName: '', email: 'dwayman0182@gmail.com' },
  { name: 'Liza', firstName: 'Liza', email: 'lizaforeman@gmail.com' },
  { name: 'Irene', firstName: 'Irene', email: 'irenemoncada5@gmail.com' },
  { name: 'Michelle', firstName: 'Michelle', email: 'michellebrondum@gmail.com' },
  { name: 'Fiona', firstName: 'Fiona', email: 'fiona.e.mcbean@gmail.com' },
  { name: 'Tenille', firstName: 'Tenille', email: 'tenilleclarke1@gmail.com' },
  { name: 'Giovanna', firstName: 'Giovanna', email: 'giovannamaddalena@masinafilm.com' },
  { name: 'Rebecca', firstName: 'Rebecca', email: 'rebecca.darcy-howard@lexical-llama.com' },
  { name: 'Fabian', firstName: 'Fabian', email: 'york-fabianraabe@gmx.de' },
  { name: 'Robin', firstName: 'Robin', email: 'robin.miller@axum.earth' },
  { name: 'Sherkera', firstName: 'Sherkera', email: 'sherkerawilson@yahoo.com' },
  { name: 'Panayiota', firstName: 'Panayiota', email: 'panayiota@gmail.com' },
  { name: 'Adrienne', firstName: 'Adrienne', email: 'adrienne@atrium-pr.com' },
  { name: '', firstName: '', email: 'tr@intertwinedagency.com' },
  { name: 'Jacqueline', firstName: 'Jacqueline', email: 'jacqueline.shaw@gmail.com' },
  { name: 'April', firstName: 'April', email: 'aprilpricemarketing@gmail.com' },
  { name: 'Tendai', firstName: 'Tendai', email: 'tendai.pottinger@hotmail.com' },
  { name: 'Nadia', firstName: 'Nadia', email: 'nadia@ohsoconnected.com' },
  { name: '', firstName: '', email: 'sunnlys.studio@gmail.com' },
  { name: 'Rosie', firstName: 'Rosie', email: 'rosieferdincruz@gmail.com' },
  { name: '', firstName: '', email: 'breakingnewsarabia@gmail.com' },
  { name: 'Sagal', firstName: 'Sagal', email: 'sagalabdullahi1@gmail.com' },
  { name: 'Aisha', firstName: 'Aisha', email: 'aishascotland100@icloud.com' },
  { name: 'Natalie', firstName: 'Natalie', email: 'natalie@liquidviolet.co.uk' },
  { name: 'Noor', firstName: 'Noor', email: 'noor@thedigitalvoice.co.uk' },
  { name: '', firstName: '', email: 'confidentlyyou111@gmail.com' },
  { name: 'Tracy', firstName: 'Tracy', email: 'tracykintu@gmail.com' },
  { name: 'Leanne', firstName: 'Leanne', email: 'leanne@alieent.com' },
  { name: 'Carol', firstName: 'Carol', email: 'carol.akinye@gmail.com' },
  { name: 'Trish', firstName: 'Trish', email: 'trishwilliams16@aol.com' },
  { name: 'Jeff', firstName: 'Jeff', email: 'jeff@extrategicculture.com' },
  { name: 'Diana', firstName: 'Diana', email: 'diana@extrategicculture.com' },
  { name: 'Lili', firstName: 'Lili', email: 'liliupcopy@gmail.com' },
  { name: 'Hoss', firstName: 'Hoss', email: 'hoss@hope-advisory.com' },
  { name: 'Satu', firstName: 'Satu', email: 'satumaru@gmail.com' },
  { name: '', firstName: '', email: 'shiikane@gmail.com' },
  { name: 'Terri', firstName: 'Terri', email: 'terri_martin@hotmail.co.uk' },
  { name: 'Anietie', firstName: 'Anietie', email: 'anietieudoh101@gmail.com' },
  { name: 'Khiera', firstName: 'Khiera', email: 'khieracornwall@gmail.com' },
  { name: '', firstName: '', email: 'd.biancuzzi@gmail.com' },
  { name: 'Kristie', firstName: 'Kristie', email: 'kristie.g@exf.studio' },
  { name: 'Lana', firstName: 'Lana', email: 'lana@alert.hr' },
  { name: 'Stefanie', firstName: 'Stefanie', email: 'stefanie@themarketeergroup.com' },
  { name: '', firstName: '', email: 'sonstiges098@gmail.com' },
  { name: 'Jessica', firstName: 'Jessica', email: 'info@jessicavrogers.co.uk' },
  { name: '', firstName: '', email: 'hello@densalazar.co.uk' },
  { name: 'Mari', firstName: 'Mari', email: 'officialmstmari@gmail.com' },
  { name: 'Hassy', firstName: 'Hassy', email: 'hassynain@gmail.com' },
  { name: 'Lily', firstName: 'Lily', email: 'lilyannx78@gmail.com' },
  { name: 'Marta', firstName: 'Marta', email: 'martad.producion@gmail.com' },
  { name: '', firstName: '', email: 'shriosai.sidheswar@gmail.com' },
  { name: 'Johanne', firstName: 'Johanne', email: 'johanne@ampupyourvoice.com' },
  { name: '', firstName: '', email: 'pboyle@dstillery.com' },
  { name: 'Rianne', firstName: 'Rianne', email: 'riannerowe@gmail.com' },
];

async function main() {
  console.log(`Sending Diaspora Dinner announcement to ${recipients.length} recipients...`);
  const token = await getToken();

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const body = buildBody(r.firstName);
    try {
      await sendEmail(token, r.email, r.name || r.email, SUBJECT, body);
      console.log(`[${i + 1}/${recipients.length}] Sent to ${r.firstName || 'Hi'} <${r.email}>`);
    } catch (err: any) {
      console.error(`[${i + 1}/${recipients.length}] FAILED ${r.email}: ${err?.response?.data?.error?.message || err.message}`);
    }
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\nDone. ${recipients.length} emails processed.`);
}

main().catch(console.error);
