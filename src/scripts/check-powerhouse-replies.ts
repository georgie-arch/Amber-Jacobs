/**
 * check-powerhouse-replies.ts
 *
 * Checks inbox for replies from all 24 Cannes Lions outreach contacts
 * (Power House batch + DEPT, Pinterest, Yahoo, Stagwell, FreeWheel, Dentsu, Havas).
 * Prints a status table and emails George a CSV report.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/check-powerhouse-replies.ts
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
      scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access',
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
  const logoHtml = logoB64 ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />` : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
  </div>
</body></html>`;
}

const allContacts = [
  // Power House batch (17)
  { name: 'Anjali Sud',          company: 'Tubi',              email: 'asud@tubi.tv',                          pitch: 'Mixer' },
  { name: 'Javier Campopiano',   company: 'McCann',            email: 'javier.campopiano@mccann.com',          pitch: 'Creative Lunch' },
  { name: 'Marc Pritchard',      company: 'P&G / Tide',        email: 'marc.pritchard@pg.com',                 pitch: 'Breakfast' },
  { name: 'Elizabeth Rutledge',  company: 'Amex',              email: 'elizabeth.rutledge@aexp.com',           pitch: 'Dinner' },
  { name: 'Diana Littman',       company: 'Adweek',            email: 'diana.littman@adweek.com',              pitch: 'Editorial Breakfast' },
  { name: 'Claire Paull',        company: 'Amazon Ads',        email: 'clairepaull@amazon.com',                pitch: 'Mixer' },
  { name: 'Ben Skinazi',         company: 'Equativ',           email: 'bskinazi@equativ.com',                  pitch: 'Lunch' },
  { name: 'Mike Romoff',         company: 'Reddit',            email: 'mromoff@reddit.com',                    pitch: 'Mixer' },
  { name: 'Matt Devitt',         company: 'Nielsen',           email: 'matt.devitt@nielsen.com',               pitch: 'Breakfast Briefing' },
  { name: 'Sofia Hernandez',     company: 'TikTok',            email: 'sofia.hernandez@tiktok.com',            pitch: 'Mixer' },
  { name: 'Laurent Ezekiel',     company: 'WPP',               email: 'laurent.ezekiel@wpp.com',               pitch: 'Creative Leadership Lunch' },
  { name: 'Marc Sternberg',      company: 'Brand Innovators',  email: 'marc@brand-innovators.com',             pitch: 'Brunch' },
  { name: 'Damian Bradfield',    company: 'WeTransfer',        email: 'damian@wetransfer.com',                 pitch: 'Creative Lunch' },
  { name: 'Rob Wilk',            company: 'Microsoft',         email: 'robw@microsoft.com',                    pitch: 'Breakfast' },
  { name: 'Orson Francescone',   company: 'Financial Times',   email: 'orson.francescone@ft.com',              pitch: 'Editorial Breakfast' },
  { name: 'Raja Rajamannar',     company: 'Mastercard',        email: 'raja.rajamannar@mastercard.com',        pitch: 'Priceless Dinner' },
  { name: 'Carleigh Jaques',     company: 'Visa',              email: 'cjaques@visa.com',                      pitch: 'Private Dinner' },
  // Previous batch (7)
  { name: 'Dimi Albers',         company: 'DEPT',              email: 'dimi.albers@deptagency.com',            pitch: 'Panel' },
  { name: 'Judy Lee',            company: 'Pinterest',         email: 'jlee@pinterest.com',                    pitch: 'Partnership' },
  { name: 'Shannon Montoya',     company: 'Yahoo',             email: 'shannon.montoya@yahooinc.com',          pitch: 'Panel' },
  { name: 'Beth Sidhu',          company: 'Stagwell',          email: 'beth.sidhu@stagwellglobal.com',         pitch: 'Panel' },
  { name: 'James Rooke',         company: 'FreeWheel',         email: 'james_rooke@comcast.com',               pitch: 'Panel' },
  { name: 'Jeremy Miller',       company: 'Dentsu',            email: 'jeremy.miller@dentsu.com',              pitch: 'Panel' },
  { name: 'Charlotte Rambaud',   company: 'Havas',             email: 'charlotte.rambaud@havas.com',           pitch: 'Panel' },
  // Warm contacts
  { name: 'Che Wheatley',        company: 'Financial Times',   email: 'Che.wheatley@ft.com',                   pitch: 'Partnership + George for FT panels' },
  // Batch 2 (5)
  { name: 'Jane Ostler',         company: 'Kantar',            email: 'jane.ostler@kantar.com',                pitch: 'Creative Effectiveness Panel' },
  { name: 'Michael Barrett',     company: 'Magnite',           email: 'mbarrett@magnite.com',                  pitch: 'CTV Panel' },
  { name: 'Gary Vaynerchuk',     company: 'VaynerMedia',       email: 'gary.vaynerchuk@vaynermedia.com',       pitch: 'Culture Panel' },
  { name: 'Bob Pittman',         company: 'iHeartMedia',       email: 'bobpittman@iheartmedia.com',            pitch: 'Audio Panel' },
  { name: 'Judann Pollack',      company: 'Ad Age',            email: 'jpollack@adage.com',                    pitch: 'Media Partnership' },
];

async function checkReplies(token: string): Promise<Array<typeof allContacts[0] & { replied: boolean; replyDate?: string; replyPreview?: string }>> {
  const results = [];

  for (const contact of allContacts) {
    const domain = contact.email.split('@')[1];
    try {
      const r = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages?$search="${domain}"&$top=10&$select=id,from,subject,receivedDateTime,bodyPreview`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const msgs = (r.data.value || []).filter((m: any) => {
        const from: string = m.from?.emailAddress?.address?.toLowerCase() || '';
        return from.includes(domain) && !from.includes('indvstryclvb');
      });

      if (msgs.length > 0) {
        const latest = msgs.sort((a: any, b: any) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime())[0];
        results.push({
          ...contact,
          replied: true,
          replyDate: new Date(latest.receivedDateTime).toLocaleDateString('en-GB'),
          replyPreview: latest.bodyPreview?.substring(0, 80),
        });
      } else {
        results.push({ ...contact, replied: false });
      }
    } catch {
      results.push({ ...contact, replied: false });
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

async function main() {
  const token = await getToken();
  console.log('🔍 Checking replies from all Power House outreach contacts...\n');

  const results = await checkReplies(token);

  const replied = results.filter(r => r.replied);
  const pending = results.filter(r => !r.replied);

  console.log(`\n✅ REPLIED (${replied.length}):`);
  replied.forEach(r => console.log(`   ${r.name} @ ${r.company} — ${r.replyDate} — "${r.replyPreview}"`));

  console.log(`\n⏳ NO REPLY YET (${pending.length}):`);
  pending.forEach(r => console.log(`   ${r.name} @ ${r.company} <${r.email}> — ${r.pitch}`));

  // CSV
  const headers = ['Name', 'Company', 'Email', 'Pitch Type', 'Replied', 'Reply Date', 'Preview'];
  const rows = results.map(r => [
    r.name, r.company, r.email, r.pitch,
    r.replied ? 'Yes' : 'No',
    r.replyDate || '',
    r.replyPreview || '',
  ].map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  const csvPath = path.resolve(__dirname, '../../powerhouse-outreach-replies.csv');
  fs.writeFileSync(csvPath, csv, 'utf-8');
  console.log(`\n📊 CSV saved to: ${csvPath}`);

  // Email George
  const founderEmail = process.env.FOUNDER_EMAIL;
  if (!founderEmail) { console.log('FOUNDER_EMAIL not set — skipping report email'); return; }

  const summaryBody = `Hi George,

Here is the latest reply status across all Power House outreach — ${results.length} contacts total.

REPLIED (${replied.length}):
${replied.map(r => `   ${r.name} @ ${r.company} — replied ${r.replyDate}`).join('\n') || '   None yet'}

NO REPLY YET (${pending.length}):
${pending.map(r => `   ${r.name} @ ${r.company} (${r.pitch})`).join('\n')}

Full details are in the attached spreadsheet.

Amber`;

  const csvB64 = Buffer.from(csv).toString('base64');
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: `Power House outreach — reply tracker (${replied.length}/${results.length} replied)`,
    body: { contentType: 'HTML', content: buildHtml(summaryBody) },
    toRecipients: [{ emailAddress: { address: founderEmail, name: 'George' } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
    attachments: [{ '@odata.type': '#microsoft.graph.fileAttachment', name: 'powerhouse-outreach-replies.csv', contentType: 'text/csv', contentBytes: csvB64 }],
  };
  if (logoB64) message.attachments.push({ '@odata.type': '#microsoft.graph.fileAttachment', name: 'indvstry-logo.png', contentType: 'image/png', contentBytes: logoB64, contentId: 'indvstry-logo', isInline: true });

  await axios.post(`https://graph.microsoft.com/v1.0/me/sendMail`, { message }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });

  console.log(`✅ Reply report emailed to George at ${founderEmail}`);
}

main().catch(console.error);
