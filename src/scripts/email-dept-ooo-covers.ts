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

const jackBody = `Hi Jack,

I reached out to a few of the team about something we are building at Cannes Lions this year and wanted to make sure it landed with the right person on the EMEA side.

We have a panel proposal we think would sit perfectly at DEPT's Secret Garden 2026, and we wanted to bring it to you.

The concept: "Culture Before Campaign - How Independent Communities Are Redefining What Brand Building Looks Like." We are bringing a curated group of executives, founders and creators to Cannes through Indvstry Power House - our own private villa activation running alongside the festival. The speakers we have coming are senior leaders and creators building brands from the inside of culture out. It is a conversation that would resonate strongly with the Secret Garden audience.

A bit on what we are building: Indvstry Power House has secured a large private villa in the south of France and over 75,000 euros worth of delegate passes for Cannes Lions week. We run five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at the festival. We are a Black-led creative community building something independent at the heart of the biggest advertising festival in the world.

What we are proposing is simple: we bring the panel and the speakers, the Secret Garden provides the stage. Co-promoted to both our networks. The kind of collaboration that makes both spaces more valuable.

More on what we are building: https://powerhouse.indvstryclvb.com

Are you open to a quick call to talk through it? https://calendly.com/itsvisionnaire/30min

George`;

const asherBody = `Hi Asher,

I reached out to a few of the DEPT team about something we are building at Cannes Lions this year and wanted to make sure it got to the right person on the Americas side too.

We have a panel proposal we think would sit perfectly at DEPT's Secret Garden 2026.

The concept: "Culture Before Campaign - How Independent Communities Are Redefining What Brand Building Looks Like." We are bringing a curated group of executives, founders and creators to Cannes through Indvstry Power House - our own private villa activation running alongside the festival. The speakers we have coming are senior leaders and creators who are building brands from the inside of culture out. The kind of perspective that the Secret Garden audience does not usually hear from - and should.

A bit on what we are building: Indvstry Power House has secured a large private villa in the south of France and over 75,000 euros worth of delegate passes for Cannes Lions week. We run five days of curated events, dinners and closed-door conversations with some of the most senior creative and marketing leaders at the festival. We are a Black-led creative community building something independent at the heart of the biggest advertising festival in the world.

The proposal: we bring the panel and the speakers, the Secret Garden provides the stage. Co-promoted to both networks. Simple collaboration, strong outcome for both sides.

More on what we are building: https://powerhouse.indvstryclvb.com

Are you open to a quick call? https://calendly.com/itsvisionnaire/30min

George`;

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

async function main() {
  const token = await getToken();

  await send(token, 'jack.Williams@deptagency.com', 'Jack Williams', jackBody);
  console.log('Sent to Jack Williams <jack.Williams@deptagency.com>');

  await new Promise(res => setTimeout(res, 2000));

  await send(token, 'Asher.Wren@deptagency.com', 'Asher Wren', asherBody);
  console.log('Sent to Asher Wren <Asher.Wren@deptagency.com>');

  console.log('\nDone.');
}

main().catch(console.error);
