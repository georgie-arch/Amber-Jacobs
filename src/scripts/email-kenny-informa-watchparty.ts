/**
 * Email to Kenny Annan-Jonathan at Informa about Indvstry Power House
 * and the FIFA World Cup watch party activation at Cannes Lions 2026.
 * Coalition: BPSB + Indvstry Club + Football Black List + GENuine Agency.
 *
 * From: George Guise (access@indvstryclvb.com)
 * To: Kenny.Annan-Jonathan@informa.com
 * BCC: sam@boujiemedia.co.uk, Ibe@thegenuine.agency
 * Attachment: Cannes Blacklist Watch Party - GENuine Agency.pdf
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-kenny-informa-watchparty.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CAL_LINK = 'https://calendly.com/itsvisionnaire/30min';

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

function buildHtml(body: string): string {
  const logoB64  = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  const formatted = body
    .split('\n\n')
    .map(para => `<p style="margin:0 0 14px 0;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${formatted}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const emailBody = `Hi Kenny,

I am George Guise, founder of Indvstry Clvb. I wanted to reach out directly because we have something happening at Cannes Lions 2026 that I think is worth a conversation with Informa, particularly given what you are building with LIONS Sport.

Two things to flag.

The first is Indvstry Power House — our private villa activation running 21 to 26 June alongside the festival. We are hosting a curated group of senior CMOs, creative directors, founders and brand leaders for the week in a private luxury villa. Three years running on the Croisette, confirmed venue, production team in place. It is built to be a complement to the official festival footprint, not a competitor to it.

The second is something we think is genuinely unique to this year. Cannes Lions 2026 runs directly during the FIFA World Cup group stages — the most culturally loaded week in the sport calendar. African nations, European heavyweights, and the decisive group matches all fall across 22 to 26 June. LIONS Sport opens on 24 June at Sport Beach. The crossover is not incidental. It is a significant cultural moment inside the most important room in creative business.

We have put together a coalition — Indvstry Clvb, BPSB, Football Black List and GENuine Agency — to run a series of culturally-led World Cup watch parties and watchalongs at Cannes during that window. The activation brings together Sport Beach access, the Power House villa as a venue, Football Black List's athlete network and GENuine's cultural relevance expertise. I have attached the full deck so you can see the shape of it.

I wanted to reach out to Informa directly to understand whether this aligns with anything you are planning around LIONS Sport and whether there is a way for us to be additive to the official Cannes experience rather than separate from it. There may be a very natural fit here, and I would rather have that conversation early.

If you have 20 minutes for a call before Cannes, I would love to get into it properly:
${CAL_LINK}

Looking forward to hearing your thoughts, Kenny.`;

async function send(): Promise<void> {
  const token   = await getToken();
  const logoB64 = getLogoBase64();

  const deckPath = path.resolve(
    process.env.HOME || '',
    'Downloads/Cannes Blacklist Watch Party - GENuine Agency.pdf'
  );
  let deckB64 = '';
  try {
    deckB64 = fs.readFileSync(deckPath).toString('base64');
    console.log('Deck loaded successfully.');
  } catch (e) {
    console.warn('WARNING: Could not load deck PDF — sending without attachment.');
  }

  const message: any = {
    subject: 'Cannes Lions 2026 — Power House, LIONS Sport and a World Cup opportunity',
    body:    { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: 'Kenny.Annan-Jonathan@informa.com', name: 'Kenny Annan-Jonathan' } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
    bccRecipients: [
      { emailAddress: { address: 'sam@boujiemedia.co.uk',    name: 'Sam' } },
      { emailAddress: { address: 'Ibe@thegenuine.agency',    name: 'Ibe' } },
    ],
  };

  const attachments: any[] = [];

  if (logoB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'indvstry-logo.png',
      contentType:   'image/png',
      contentBytes:  logoB64,
      contentId:     'indvstry-logo',
      isInline:      true,
    });
  }

  if (deckB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'Cannes Watch Party - Indvstry Clvb x GENuine Agency.pdf',
      contentType:   'application/pdf',
      contentBytes:  deckB64,
      isInline:      false,
    });
  }

  if (attachments.length > 0) {
    message.attachments = attachments;
  }

  try {
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('Sent to Kenny Annan-Jonathan <Kenny.Annan-Jonathan@informa.com>');
    console.log('BCC: sam@boujiemedia.co.uk, Ibe@thegenuine.agency');
  } catch (err: any) {
    console.error(`FAILED: ${err?.response?.data?.error?.message || err.message}`);
  }
}

send().catch(console.error);
