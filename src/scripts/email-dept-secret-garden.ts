/**
 * DEPT Agency Secret Garden 2026 — Panel partnership pitch
 * 5 key decision makers, from George Guise
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

async function send(token: string, to: string, toName: string, body: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: 'Secret Garden x Indvstry Power House — Panel Proposal, Cannes Lions 2026',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
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

const buildBody = (firstName: string) => `Hi ${firstName},

Saw the announcement of Secret Garden 2026 - it is a brilliant format and exactly the kind of intentional space that gets the real conversations happening at Cannes. We wanted to reach out with an idea.

We have a panel proposal we think would sit perfectly at the Secret Garden, and we would love to bring it to you.

The panel concept: "Culture Before Campaign - How Independent Communities Are Redefining What Brand Building Looks Like"

We are bringing a curated group of executives, founders and creators to Cannes this year through Indvstry Power House - our own private villa activation running alongside the festival. The speakers we have coming are senior leaders and creators who are building brands from the inside of culture out, not from the campaign brief down. The conversation they would bring to the Secret Garden is one that the DEPT audience would find genuinely valuable - and it is a perspective that does not always get a platform at Cannes.

Here is what Indvstry Power House is: we have secured a large private villa in the south of France and over 75,000 euros worth of delegate passes for Cannes Lions week. We run five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at the festival. We are a Black-led creative community building something independent at the heart of the biggest advertising festival in the world.

What we are proposing is a collaboration: we bring the panel, the speakers and the angle - and the Secret Garden provides the stage. It would sit under our Power House programming for the week, and we would co-promote it to both our networks. The kind of cross-pollination that makes both spaces more interesting.

More on what we are building: https://powerhouse.indvstryclvb.com

Would love to get 20 minutes with you to talk through what this could look like. Are you open to a call? https://calendly.com/itsvisionnaire/30min

George`;

const RECIPIENTS = [
  { name: 'Andrew Dimitriou', email: 'andrew.dimitriou@deptagency.com', firstName: 'Andrew' },
  { name: 'Helga Sasdi',      email: 'helga.sasdi@deptagency.com',      firstName: 'Helga'  },
  { name: 'Joanna Trippett',  email: 'joanna.trippett@deptagency.com',  firstName: 'Joanna' },
  { name: 'Isabel Perry',     email: 'isabel.perry@deptagency.com',     firstName: 'Isabel' },
  { name: 'Marjan Straathof', email: 'marjan.straathof@deptagency.com', firstName: 'Marjan' },
];

async function main() {
  const token = await getToken();

  for (let i = 0; i < RECIPIENTS.length; i++) {
    const r = RECIPIENTS[i];
    await send(token, r.email, r.name, buildBody(r.firstName));
    console.log(`[${i + 1}/${RECIPIENTS.length}] Sent to ${r.name} <${r.email}>`);
    if (i < RECIPIENTS.length - 1) await new Promise(res => setTimeout(res, 2000));
  }

  console.log('\nDone. 5 DEPT emails sent.');
}

main().catch(console.error);
