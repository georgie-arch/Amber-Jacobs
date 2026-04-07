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
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

const bodyText = `Hi Ally,

I hope you are well. I wanted to reach out because what you have built with Brixton Finishing School — and specifically what #CannesForAll has done in getting young diverse talent into rooms they should have always been in — is exactly the kind of work that deserves more support, not just applause.

I'm getting in touch ahead of Cannes Lions 2026 to ask a few things.

Are you planning to take a cohort to Cannes this year? And if so, is there anything we can do to make that experience more meaningful for the young people you bring?

We ask because we've secured a private villa 30 minutes from the festival as the home for Indvstry Power House — a week-long activation running alongside Cannes Lions 2026. We have over €75,000 in delegate passes as part of the programme and we are very intentional about who gets access to the space and the conversations happening inside it.

Indvstry Power House hosts 30 of the most senior creative, marketing, and cultural leaders in the industry for five days — closed-door sessions, shared meals, genuine connection. The kind of environment that changes how people see themselves and what is possible. It is exactly the type of room your cohort should be walking into, not watching from the outside.

We would love to explore a partnership with Brixton Finishing School — whether that is bringing your young people into the villa for a session, hosting a panel or lunch that gives them direct access to the senior leaders in our house, or something we design together that actually serves them best. We are open to whatever makes the most impact.

You can see more about the Power House here: https://powerhouse.indvstryclvb.com

Would you be open to getting on a call with our founder George to talk it through properly? He is driving the whole activation and would love to hear what you are building this year. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Ally.`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const message: any = {
    subject: 'Cannes Lions 2026 — Indvstry Power House + Brixton Finishing School',
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [{ emailAddress: { address: 'ally@brixtonfinishingschool.org', name: 'Ally Owen' } }],
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
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('✅ Email sent to Ally Owen at ally@brixtonfinishingschool.org');
}

main().catch(console.error);
