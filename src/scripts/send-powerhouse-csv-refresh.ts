import axios from 'axios';
import { execFileSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

type RecipientKind = 'intro' | 'followup';

interface Recipient {
  name: string;
  firstName: string;
  email: string;
  kind: RecipientKind;
  status?: string;
}

const ZIP_PATH = '/Users/georgeguise/Downloads/Indvstry Power House Cannes Lions 2026 .csv.zip';

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
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
  return response.data.access_token;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch {
    return '';
  }
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

function loadRecipients(): Recipient[] {
  const python = `
import csv, json, re, sqlite3, zipfile
from pathlib import Path

ZIP_PATH = r"""${ZIP_PATH}"""
DB_PATH = r"""${path.resolve(__dirname, '../../amber_memory.db')}"""
SENT_PATH = r"""${path.resolve(__dirname, '../data/all-sent-contacts.csv')}"""
RESIDENTS_PATH = r"""${path.resolve(__dirname, '../data/residents.ts')}"""

def norm_name(value):
    return ' '.join((value or '').strip().lower().split())

def first_name(value):
    cleaned = ' '.join((value or '').strip().split())
    return cleaned.split(' ')[0] if cleaned else 'there'

sent = set()
with open(SENT_PATH, newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        email = (row.get('Email') or '').strip().lower()
        if email:
            sent.add(email)

residents_text = Path(RESIDENTS_PATH).read_text(encoding='utf-8')
resident_emails = {e.strip().lower() for e in re.findall(r"email: '([^']+)'", residents_text, flags=re.I)}
resident_names = {
    norm_name(f"{first} {last}")
    for first, last in re.findall(r"firstName: '([^']+)'.*?lastName: '([^']+)'", residents_text, flags=re.S)
}

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

recipients = []
seen = set()
with zipfile.ZipFile(ZIP_PATH) as z:
    csv_name = z.namelist()[0]
    rows = list(csv.DictReader(line.decode('utf-8-sig') for line in z.open(csv_name)))

for row in rows:
    email = (row.get('Email Address') or '').strip().lower()
    name = ' '.join((row.get('Full Name') or '').split()).strip()
    normalized_name = norm_name(name)
    if not email or email in seen:
        continue
    seen.add(email)

    if email in resident_emails or normalized_name in resident_names:
        continue

    status = ''
    contact_type = ''
    record = conn.execute('select status, contact_type from contacts where lower(email)=?', (email,)).fetchone()
    if record:
        status = (record['status'] or '').strip().lower()
        contact_type = (record['contact_type'] or '').strip().lower()
    if contact_type == 'member':
        continue
    if status in {'cold', 'declined', 'inactive', 'dead'}:
        continue

    recipients.append({
        'name': name or email,
        'firstName': first_name(name),
        'email': email,
        'kind': 'followup' if email in sent else 'intro',
        'status': status,
    })

print(json.dumps(recipients))
`;

  const output = execFileSync('python3', ['-c', python], { encoding: 'utf-8' });
  return JSON.parse(output) as Recipient[];
}

function buildIntroBody(firstName: string): string {
  return `Hi ${firstName},

I wanted to reach out because you came through as someone interested in Indvstry Power House for Cannes Lions 2026, and we have just had a meaningful update on our side.

We have now secured external panel talks at one of the major La Croisette beaches, and we will be sending those details and RSVP information directly to our confirmed residents.

We have also just RSVP'd our guests for 25 events across the week, including mixers, yacht parties, opening parties and other side gatherings around Cannes.

If you are still interested in joining us, this would be the right moment to get in touch. We are now locking accommodation and transportation, so if you want us to hold space for you, I would recommend replying as soon as you can.

Happy to send more detail and talk you through what joining the house would look like.

Best,

Amber`;
}

function buildFollowUpBody(firstName: string): string {
  return `Hi ${firstName},

Just following up with a meaningful update on Indvstry Power House for Cannes Lions 2026.

We have now secured external panel talks at one of the major La Croisette beaches, and we will be sending those details and RSVP information directly to our confirmed residents.

We have also just RSVP'd our guests for 25 events across the week, including mixers, yacht parties, opening parties and other side gatherings around Cannes.

If you are still interested in joining us, now would be the time to get in touch so we can secure your accommodation and transportation while we are finalising the house.

Happy to share more detail if useful.

Best,

Amber`;
}

function buildSubject(kind: RecipientKind): string {
  return kind === 'intro'
    ? 'Indvstry Power House Cannes update'
    : 'Quick Cannes update from Indvstry Power House';
}

async function sendEmail(token: string, recipient: Recipient): Promise<void> {
  const body = recipient.kind === 'intro'
    ? buildIntroBody(recipient.firstName)
    : buildFollowUpBody(recipient.firstName);
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: buildSubject(recipient.kind),
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: recipient.email, name: recipient.name } }],
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

async function main(): Promise<void> {
  const recipients = loadRecipients();
  const introCount = recipients.filter((recipient) => recipient.kind === 'intro').length;
  const followupCount = recipients.length - introCount;

  console.log(`Prepared ${recipients.length} recipients (${introCount} intro, ${followupCount} follow-up)`);

  if (recipients.length === 0) {
    return;
  }

  const token = await getToken();
  let sent = 0;

  for (const recipient of recipients) {
    await sendEmail(token, recipient);
    sent += 1;
    console.log(`[${sent}/${recipients.length}] Sent ${recipient.kind} to ${recipient.name} <${recipient.email}>`);
  }

  console.log(`Done. ${sent}/${recipients.length} emails sent.`);
}

main().catch((error) => {
  const detail = error?.response?.data || error?.message || error;
  console.error(detail);
  process.exit(1);
});
