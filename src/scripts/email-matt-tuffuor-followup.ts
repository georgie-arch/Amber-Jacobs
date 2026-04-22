/**
 * Follow-up to Matt Tuffuor (Eventbrite) from George
 * Re: Cannes Lions activation idea + sponsorship deck
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

const body = `Hi Matt,

Really good speaking with you last week. It was genuinely interesting to hear about everything happening at Eventbrite right now — the sale, the management changes and where the business is heading. A lot of moving parts but it sounds like an exciting moment.

One thing that stuck with me after our conversation: Cannes Lions might actually be the perfect environment for Eventbrite to make a real statement right now. Luma, Partiful and others have eaten into the market over the last couple of years, and Cannes is where the most influential event organisers in the world converge in one place, all activating at the same time. The film festival crowd, the Lions crowd, brand activations, agency parties, cultural events — the full spectrum of what professional event production looks like globally. If Eventbrite wants to reclaim ground in Europe and remind that audience why they are the platform of choice, this is where you do it.

I took the time to put together some of those names and a broader pitch here: powerhouse.indvstryclvb.com/eventbrite

The idea I think makes most sense for Eventbrite is an activation that brings together the best event organisers working across both the film festival and Lions week — a proper room of the people who actually run the events that matter. Nobody has done that before and Eventbrite would own that conversation entirely.

I have also attached our latest sponsorship deck so you can get a feel for the broader platform and what we are building.

I have just WhatsApped you as well so you have my new number. If you can loop in the Europe team I would love to get a feel for where their heads are and whether this can play into a broader strategy to corner the European market again. There is a real opportunity here.

One more thing worth a separate conversation: I am very keen to explore how Indvstry Clvb can give the Eventbrite team access to some of the world's top elite events — the kind of networking and new business opportunities that would genuinely move the needle for your team on the ground in Europe.

Let us speak again soon.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Eventbrite x Cannes Lions — good to catch up, an idea worth exploring',
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: 'Matt.tuffuor@eventbrite.com', name: 'Matt Tuffuor' } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
  };

  const attachments: any[] = [];

  if (logoB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    });
  }

  if (attachments.length) message.attachments = attachments;

  // Add sponsorship deck as a link in the body — Canva decks can't be attached as files,
  // so the link https://canva.link/j9tgb9z2annevnz is embedded in the email body below.
  // Re-build body with deck link included
  const bodyWithDeck = body + `\n\nSponsorship deck: https://canva.link/j9tgb9z2annevnz`;
  message.body.content = buildHtml(bodyWithDeck);

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Sent to Matt Tuffuor <Matt.tuffuor@eventbrite.com>');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
