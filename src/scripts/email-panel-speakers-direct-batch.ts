/**
 * Direct speaker outreach — panel invitations for "The Algorithm Doesn't Know Your Culture"
 * DEPT's Secret Garden, Cannes Lions 2026, Wednesday 25 June
 *
 * Notes:
 *   - Dara Treseder: second touch (first sent via email-dept-panel-speakers.ts)
 *   - Azeem Azhar: first proper email (only had contact form before)
 *   - Joy Buolamwini: two addresses sent — Oxford admin + Gmail
 *   - Asad Rehman: new address (original: asad.rehman@unilever.com)
 *   - Marcus Collins: SKIPPED — Charlotte Perman (UTA) is actively handling
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-panel-speakers-direct-batch.ts
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

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
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

const contacts: { name: string; email: string; subject: string; body: string }[] = [
  {
    name:    'Dara Treseder',
    email:   'dara.treseder@autodesk.com',
    subject: 'Following up — speaker invitation, DEPT\'s Secret Garden, Cannes Lions 2026',
    body: `Hi Dara,

Following up on our earlier note — I wanted to make sure this landed with you directly.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June inside DEPT's Secret Garden at Cannes Lions — one of the most exclusive, invite-only environments at the festival. The audience is C-suite brand, marketing and tech leaders from across the global industry.

As Forbes' most influential CMO and the first Black woman inducted into the CMO Hall of Fame, you sit at exactly the intersection this conversation is exploring. Your perspective on marketing, technology and representation is precisely what the room needs to hear.

We would be honoured to have you on the panel. Happy to jump on a quick call to talk through the details, or answer any questions by email.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'Asad Rehman',
    email:   'iu05-0325-0827@iqra.edu.pk',
    subject: 'Speaker invitation — DEPT\'s Secret Garden, Cannes Lions 2026',
    body: `Hi Asad,

I am reaching out from Indvstry Clvb with a speaker invitation ahead of Cannes Lions this June.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June inside DEPT's Secret Garden — one of the most exclusive, invite-only environments at the festival. The audience is global brand, marketing and tech leaders, and the conversation sits at the intersection of data, culture and representation in media.

Your work leading global media transformation at Unilever — operating at the scale you do while keeping purpose and personalisation in balance — is exactly the kind of real-world perspective this panel needs. We would love to have you as one of our speakers.

If you are open to it, we are happy to jump on a quick call to walk through the details or answer any questions over email.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'Azeem Azhar',
    email:   'azeem.azhar@exponentialview.co',
    subject: 'Your thesis belongs on this stage — Cannes Lions 2026, DEPT\'s Secret Garden',
    body: `Hi Azeem,

I am reaching out from Indvstry Clvb with a speaker invitation ahead of Cannes Lions this June.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June inside DEPT's Secret Garden — one of the most exclusive, invite-only environments at the festival. The room is C-suite brand, marketing and tech leaders, and the panel sits at the intersection of AI, culture and the structural gaps that technology keeps widening.

The Exponential Age makes exactly the argument this conversation is built around: that exponential technology outpaces the institutions — and the cultures — built to govern it. Your voice on that is one of the clearest in the room, and we think this is exactly the kind of audience that needs to hear it.

We would love to have you on the panel. Happy to share more detail or jump on a call whenever suits.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'Dr. Joy Buolamwini',
    email:   'joy.buolamwini@admin.ox.ac.uk',
    subject: 'Speaker invitation — "The Algorithm Doesn\'t Know Your Culture", Cannes Lions 2026',
    body: `Hi Joy,

I am reaching out from Indvstry Clvb with a speaker invitation ahead of Cannes Lions this June.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June inside DEPT's Secret Garden at Cannes Lions — one of the most exclusive, invite-only environments at the festival. The audience is global brand, marketing and tech leaders: the people whose decisions shape which voices the algorithm amplifies and which it erases.

Your work with the Algorithmic Justice League and Unmasking AI has become the defining framework for this conversation. The title of our panel is not accidental — your research is the lens through which the whole session is built. We would be honoured to have you there as a panelist.

If you or your team would like to explore this further, we are happy to jump on a call or answer any questions over email.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
  {
    name:    'Dr. Joy Buolamwini',
    email:   'joy.buolamwini@gmail.com',
    subject: 'Speaker invitation — "The Algorithm Doesn\'t Know Your Culture", Cannes Lions 2026',
    body: `Hi Joy,

I am reaching out from Indvstry Clvb — trying this address in case it is a better one to reach you on.

We are hosting "The Algorithm Doesn't Know Your Culture" on Wednesday 25 June inside DEPT's Secret Garden at Cannes Lions — one of the most exclusive, invite-only environments at the festival. The audience is global brand, marketing and tech leaders: the people whose decisions shape which voices the algorithm amplifies and which it erases.

Your work with the Algorithmic Justice League and Unmasking AI has become the defining framework for this conversation. We would be honoured to have you on the panel.

If you or your team would like to explore this, we are happy to jump on a call or answer any questions over email.

More on what we are building: Powerhouse.indvstryclvb.com`,
  },
];

async function sendAll(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  let sent = 0;

  for (const c of contacts) {
    try {
      const message: any = {
        subject: c.subject,
        body:    { contentType: 'HTML', content: buildHtml(c.body) },
        toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
        from:         { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
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
      console.log(`[${sent}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${c.name} <${c.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < contacts.length) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\nDone. ${sent}/${contacts.length} emails sent.`);
  console.log('\nSkipped (Charlotte/UTA handling): Dr. Marcus Collins <marcusc@umich.edu>, <marctothec@gmail.com>');
}

sendAll().catch(console.error);
