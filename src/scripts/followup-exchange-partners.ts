/**
 * Follow-up to Cannes Exchange Partners (original: cannes-exchange-partners-outreach.ts, 6 Apr)
 * Indvstry Exchange partnership pitch — DO CULTURE, Apple UK, Wellcome Trust,
 * Culture Connectors, Auto Trader UK.
 * New hook: DEPT Secret Garden partnership confirmed.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/followup-exchange-partners.ts
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
  const logoB64 = getLogoBase64();
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
    <p style="margin:0 0 16px 0;"><a href="https://powerhouse.indvstryclvb.com" style="color:#1a1a1a;">Powerhouse.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
  </div>
</body></html>`;
}

const contacts = [
  {
    firstName: 'Diya',
    name: 'Diya Okorie',
    email: 'diya.okorie@changingeducation.co.uk',
    company: 'DO CULTURE',
    companyAngle: 'DO CULTURE could bring something distinctive to the cultural intelligence layer of the programme',
  },
  {
    firstName: 'Jade',
    name: 'Jade Coles',
    email: 'jade.coles@apple.com',
    company: 'Apple UK',
    companyAngle: 'Apple is exactly the kind of partner that would give the Exchange programme real gravity',
  },
  {
    firstName: 'Sian',
    name: 'Sian Bird',
    email: 'sian.bird@wellcome.org',
    company: 'Wellcome Trust',
    companyAngle: 'Wellcome brings the kind of cross-sector credibility that the Exchange needs',
  },
  {
    firstName: 'Amy',
    name: 'Amy Daroukakis',
    email: 'amy.daroukakis@cultureconnectors.com',
    company: 'Culture Connectors',
    companyAngle: 'Culture Connectors is built for exactly the kind of bridge this programme is trying to create',
  },
  {
    firstName: 'Chad',
    name: 'Chad Whyte',
    email: 'chad.whyte@autotrader.co.uk',
    company: 'Auto Trader UK',
    companyAngle: 'Auto Trader is one of those brands whose digital-first story is genuinely relevant to the technology and brand leaders the Exchange is bringing together',
  },
];

async function main() {
  const token  = await getToken();
  const logoB64 = getLogoBase64();

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];

    const body = `Hi ${c.firstName},

I am following up on a note we sent a while back about Indvstry Exchange and a potential partnership at Cannes Lions.

We did not hear back and wanted to reach out one more time. Since we last wrote, we have confirmed a headline partnership with DEPT Agency's Secret Garden on the Croisette, one of the most exclusively programmed and genuinely invite-only spaces at the festival. It has given the Exchange programme a lot of momentum going into June.

We still think ${c.companyAngle}. We would love to explore what a partnership might look like, even just a quick call or a few questions over email would be a great starting point.

More on what we are building: Powerhouse.indvstryclvb.com`;

    const message: any = {
      subject: 'Re: Indvstry Exchange — Cannes Lions 2026 partnership',
      body: { contentType: 'HTML', content: buildHtml(body) },
      toRecipients: [{ emailAddress: { address: c.email, name: c.name } }],
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

    console.log(`[${i + 1}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
    if (i < contacts.length - 1) await new Promise(res => setTimeout(res, 1500));
  }

  console.log('\nExchange Partners follow-ups done.');
}

main().catch(e => { console.error(e?.response?.data || e.message); process.exit(1); });
