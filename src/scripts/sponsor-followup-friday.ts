/**
 * sponsor-followup-friday.ts
 *
 * Short follow-up to the 51 contacts from sponsor-outreach-progress.json
 * who were emailed on 20 March 2026.
 *
 * Scheduled: Friday 27 March 2026
 * Run: npx ts-node --project tsconfig.json src/scripts/sponsor-followup-friday.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GEORGE_CALENDAR = 'https://calendly.com/itsvisionnaire/30min';

const CONTACTS: { name: string; email: string }[] = [
  { name: 'Jason', email: 'Jason_melissos@diesel.com' },
  { name: 'Amy', email: 'Amy.hawkins@ogilvy.com' },
  { name: 'Oyin', email: 'Oyin.akiniyi@pernod-ricard.com' },
  { name: 'Bethany', email: 'Bethany.walker@pernod-ricard.com' },
  { name: 'Liam', email: 'Liam.holyoak-rackal@pernod-ricard.com' },
  { name: 'Jordan', email: 'Jordan@thepom.co' },
  { name: 'Pippa', email: 'Pippa@thepom.co' },
  { name: 'Frank', email: 'Frank@ucherum.com' },
  { name: 'Calum', email: 'Chudson@eventbrite.com' },
  { name: 'Matt', email: 'Matt.tuffuor@eventbrite.com' },
  { name: 'Michael', email: 'Michael@dayslikethisbrunch.co.uk' },
  { name: 'Ellie', email: 'Ellie.heatrick@whatsapp.com' },
  { name: 'Lucy', email: 'Lstreet@adobe.com' },
  { name: 'Katy', email: 'Katy_frost@cotyinc.com' },
  { name: 'Leoni', email: 'Leoni@weshft.co' },
  { name: 'Kevin', email: 'kevin.gomez@theroofgardens.com' },
  { name: 'Ben', email: 'Ben.marett@auvodka.co.uk' },
  { name: 'Max', email: 'Max.merttens@nandos.co.uk' },
  { name: 'Tally', email: 'Talisap@nandos.co.uk' },
  { name: 'Lucia', email: 'Lucia.des@sohohouse.com' },
  { name: 'Gina', email: 'Gina.powell@gymshark.com' },
  { name: 'Carl', email: 'Carl.young@vevo.com' },
  { name: 'Yomi', email: 'Yomi.ogunsola@vevo.com' },
  { name: 'Troy', email: 'Troy.antunes@yourichrecords.com' },
  { name: 'Rosie', email: 'Rosie.karaca@b-theagency.com' },
  { name: 'Harry', email: 'Harry@wearemirchi.com' },
  { name: 'Mubi', email: 'Mubi.ali@reebok.com' },
  { name: 'Munashe', email: 'Munashe.ashlyn@highsnobiety.com' },
  { name: 'Aneta', email: 'Aneta@labrumlondon.com' },
  { name: 'Dominique', email: 'Dominique.gardiner@superdry.com' },
  { name: 'Danielle', email: 'Danielle.anastasiou@superdry.com' },
  { name: 'Katie', email: 'Katie.pollard@superdry.com' },
  { name: 'Damian', email: 'Damian.malontie@converse.com' },
  { name: 'Diruja', email: 'Dirujan.sabesan@lemon-pepper.co.uk' },
  { name: 'Caroline', email: 'Caroline@carolinegautier.com' },
  { name: 'Vanessa', email: 'Vanessa@sanecommunications.com' },
  { name: 'Chloe', email: 'Chloe@sanecommunications.com' },
  { name: 'Danielle', email: 'Danielle@sanecommunications.com' },
  { name: 'Lauren', email: 'Laurens@taste-pr.com' },
  { name: 'Caitlin', email: 'Caitlinw@taste-pr.com' },
  { name: 'Becca', email: 'Becca.fergus@mslgroup.com' },
  { name: 'Nia', email: 'Nia.feisal@mslgroup.com' },
  { name: 'Hayley', email: 'Hayley.ticehurst@mslgroup.com' },
  { name: 'Jon', email: 'Jon@thelighthouse.com' },
  { name: 'Ally', email: 'Ally@brixtonfinishingschool.org' },
  { name: 'Amy', email: 'Atyrer@bacardi.com' },
  { name: 'Madison', email: 'Madison.hahn@nike.com' },
  { name: 'Levi', email: 'Levi@bluemarlinibiza.london' },
  { name: 'Lucy', email: 'Lucy@zero21brands.com' },
  { name: 'Ibukun', email: 'Ibukun.oluwayomi@apollongroup.io' },
];

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
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

function buildBody(firstName: string): string {
  return `Hi ${firstName},

Just wanted to follow up on the note I sent across earlier this week about Indvstry Power House at Cannes Lions 2026.

We are hosting 30 of the most influential names in culture, brand and media at an exclusive villa for the week and we have a small number of partnership packages remaining. Would love to explore whether there is a fit.

If you are open to a quick call, you can grab a time here:
${GEORGE_CALENDAR}

Happy to answer any questions by email too -- just reply here.`;
}

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const contact of CONTACTS) {
    const bodyText = buildBody(contact.name);
    const message: any = {
      subject: 'Following up -- Indvstry Power House, Cannes Lions 2026',
      body: { contentType: 'HTML', content: buildHtml(bodyText) },
      toRecipients: [{ emailAddress: { address: contact.email, name: contact.name } }],
      from: {
        emailAddress: {
          address: process.env.EMAIL_USER || '',
          name: 'Amber Jacobs',
        },
      },
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

    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log(`✅ Sent to ${contact.name} <${contact.email}>`);
      sent++;
    } catch (err: any) {
      console.error(`❌ Failed: ${contact.email}`, err?.response?.data || err.message);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ ${sent}/${CONTACTS.length} follow-up emails sent.`);
}

main().catch(console.error);
