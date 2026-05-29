/**
 * DEPT Secret Garden update + Diaspora Dinner invite
 * Sends to contacts grouped by timezone — pass batch name as argument:
 *   dubai | cest | bst | est
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-dept-update-batch.ts <batch>
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

interface Contact {
  toName: string;
  toEmail: string;
  speakerName?: string; // if set, email is on behalf of this person; otherwise direct "you"
}

function buildHtml(toName: string, speakerName?: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const firstName = toName.split(' ')[0];
  const isDirect  = !speakerName;
  const them      = isDirect ? 'you' : speakerName!;
  const theySub   = isDirect ? 'You' : speakerName!;
  const theyWould = isDirect ? 'you' : speakerName!;

  const p = (text: string) => `<p style="margin:0 0 14px 0;">${text}</p>`;

  const content = `
    ${p(`Hi ${firstName},`)}
    ${p(`Just a quick update from our end — we are genuinely excited about having ${them} involved in the DEPT® Secret Garden at Cannes Lions this year. The panel is shaping up to be a brilliant room and we think ${isDirect ? 'you would be' : `${speakerName} would be`} a fantastic addition.`)}
    ${p(`We are waiting on the final decisions from the DEPT team and will circle back as soon as we have confirmation.`)}
    ${p(`Separately, we wanted to make sure this was on your radar.`)}
    ${p(`We are hosting a private beach dinner on <strong>Tuesday 23 June</strong> during Lions week, exclusively for a curated group of CEOs, CMOs and senior C-suite leaders from across the industry. It is one of the most genuinely valuable evenings of the whole festival — an intimate, curated room where the right conversations actually happen. We would love for ${theyWould} to be there.`)}
    ${p(`Tickets and details here: <a href="https://lu.ma/5vmr7s6f" style="color:#1a1a1a;">https://lu.ma/5vmr7s6f</a>`)}
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

const BATCHES: Record<string, Contact[]> = {
  // Dubai noon = 09:00 BST
  dubai: [
    { toName: 'Asad Rehman', toEmail: 'asadchawla@gmail.com' },
  ],
  // Croatia noon = 11:00 BST
  cest: [
    { toName: 'Lana Rosandic', toEmail: 'lana.rosandic@themelia.hr' },
  ],
  // UK noon = 12:00 BST
  bst: [
    { toName: 'Joyce Oladeinde', toEmail: 'joyce@crescendodigital.co.uk', speakerName: 'Derrick Downey Jr.' },
    { toName: 'Baljit Gill',     toEmail: 'bal@the-remarkables.com',       speakerName: 'Kerry Parkin' },
    { toName: 'Mary Isokariari', toEmail: 'mary.isokariari@sociallycurious.com' },
    { toName: 'Maria Taylor',    toEmail: 'maria@wearecreativemedia.org' },
    { toName: 'Paula Grunfeld',  toEmail: 'paula@bunnycreative.com' },
  ],
  // NYC noon = 17:00 BST
  est: [
    { toName: 'Marni Edelhart',    toEmail: 'marnina@mikmak.com',              speakerName: 'Rachel Tipograph' },
    { toName: 'Laura Ness Owens',  toEmail: 'laura.nessowens@doosan.com' },
  ],
};

async function sendBatch(batchName: string): Promise<void> {
  const contacts = BATCHES[batchName];
  if (!contacts) {
    console.error(`Unknown batch: ${batchName}. Use: dubai | cest | bst | est`);
    process.exit(1);
  }

  const token   = await getToken();
  const logoB64 = getLogoBase64();
  const subject = 'DEPT® Secret Garden — Update & An Invite for Tuesday';
  let sent = 0;

  console.log(`Sending batch: ${batchName} (${contacts.length} recipients)`);

  for (const c of contacts) {
    try {
      const message: any = {
        subject,
        body: { contentType: 'HTML', content: buildHtml(c.toName, c.speakerName) },
        toRecipients: [{ emailAddress: { address: c.toEmail, name: c.toName } }],
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
      const label = c.speakerName ? `${c.toName} (re: ${c.speakerName})` : c.toName;
      console.log(`  [${sent}/${contacts.length}] Sent to ${label} <${c.toEmail}>`);
    } catch (err: any) {
      console.error(`  FAILED: ${c.toName} <${c.toEmail}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < contacts.length) await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nDone. ${sent}/${contacts.length} sent.`);
}

const batch = process.argv[2];
if (!batch) {
  console.error('Usage: npx ts-node ... email-dept-update-batch.ts <dubai|cest|bst|est>');
  process.exit(1);
}

sendBatch(batch).catch(console.error);
