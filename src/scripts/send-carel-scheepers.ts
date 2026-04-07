/**
 * send-carel-scheepers.ts
 *
 * Email from George to Carel Scheepers (Havas MG South Africa)
 * Re: Indvstry Exchange partnership
 * CC: Ralph Amachree (Vuga), 84 Peak
 * Attachment: May Exchange 2026 Sponsorship deck (PDF)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/send-carel-scheepers.ts
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
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
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

function getPdfBase64(): string {
  try {
    return fs.readFileSync('/Users/georgeguise/Downloads/May Exchange 2026 [Sponsorship]_compressed.pdf').toString('base64');
  } catch (e) {
    console.warn('Could not load PDF attachment:', e);
    return '';
  }
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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

const bodyText = `Hi Carel,

I have been meaning to send this for a while now and I apologise for the delay - life has been full speed ahead. I genuinely want you to know that our conversation last month was one of the more insightful ones I have had around the Exchange programme. The perspective you brought was valuable and it has stayed with me.

I am reaching out because I would still very much love to explore how we can work with Havas on various aspects of Indvstry Exchange. I completely understand where things stand on the funding side and I want to be clear that we are not coming back with a sponsorship ask. What I am interested in is building a proper creative partnership - one where Havas South Africa's expertise is the contribution, and the programme gives your team a genuine stage.

Having had time to think about it, here is where I think the fit is strongest:

The Writing Camp is an obvious one. Havas has some of the sharpest creative and strategic minds in South Africa and having your team in that room - whether running a session, co-facilitating, or simply contributing their perspective - would add a level of credibility and real-world application that our participants would benefit enormously from.

The online panel talks are another natural fit. A conversation with the Havas SA team about how emerging creatives can actually work with global agencies - how to pitch, how to build relationships, what brands are really looking for - is exactly the kind of insider knowledge our community needs and rarely gets access to.

And on the content days, if there is appetite from your team to be involved in a production or creative facilitation capacity, even in a light-touch way, that would be something we could build around together.

I have attached our Phase 2 deck so you can see exactly what the programme looks like and where your team would slot in. Phase 1 hit 1,500+ attendees across Nairobi and Cape Town with 800K impressions and 46 panelists - Phase 2 goes bigger, based in Nairobi from April through May 2026.

I would love to get on another call to talk through what this could look like in practice. Ralph is copied here as he is across all of this with me and his input will be valuable to the conversation too.

Really looking forward to continuing this.

George`;

async function main() {
  const token   = await getToken();
  const logoB64 = getLogoBase64();
  const pdfB64  = getPdfBase64();

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

  if (pdfB64) {
    attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name:          'Indvstry Exchange 2026 - Sponsorship Deck.pdf',
      contentType:   'application/pdf',
      contentBytes:  pdfB64,
      isInline:      false,
    });
  }

  const message: any = {
    subject: 'Re: Partnership Opportunity - Indvstry Exchange',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [
      { emailAddress: { address: 'carel.scheepers@havasmg.co.za', name: 'Carel' } },
    ],
    ccRecipients: [
      { emailAddress: { address: 'ralphb@vuga.org',    name: 'Ralph' } },
      { emailAddress: { address: '84peak@mail.com',    name: '84 Peak' } },
    ],
    from: {
      emailAddress: {
        address: process.env.EMAIL_USER || '',
        name: 'George Guise',
      },
    },
  };

  if (attachments.length) message.attachments = attachments;

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to Carel Scheepers (CC: Ralph, 84 Peak)');
  if (pdfB64) console.log('PDF deck attached successfully.');
}

main().catch(console.error);
