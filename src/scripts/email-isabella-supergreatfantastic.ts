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
      scope: 'https://graph.microsoft.com/Mail.Send Mail.ReadWrite offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
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

const emailText = `Hi Isabella,

I know you are at Possible right now so absolutely no rush. Just dropping you a note so it is there when you surface.

I would love to set up a quick call between you and our founder George when you have a moment. We have been keeping an eye on what Super Great Fantastic is building and think there could be a genuinely interesting conversation about how we can work together.

Nothing formal, just 20 minutes to see where things could connect.

George's calendar is here if useful: https://calendly.com/itsvisionnaire/30min

Hope Possible is going well.

Best,
Amber`;

async function main() {
  const token = await getToken();
  const logoB64 = getLogoBase64();

  const search = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="isabella@supergreatfantastic.life"&$top=1&$select=id,subject,conversationId`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );

  const messages = search.data.value;

  if (messages && messages.length > 0) {
    const msgId = messages[0].id;
    console.log(`Found thread: "${messages[0].subject}" — replying in-thread as Amber.`);

    const replyBody: any = {
      message: {
        body: { contentType: 'HTML', content: buildHtml(emailText) },
        from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
      }
    };

    if (logoB64) {
      replyBody.message.attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'indvstry-logo.png',
        contentType: 'image/png',
        contentBytes: logoB64,
        contentId: 'indvstry-logo',
        isInline: true,
      }];
    }

    await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${msgId}/reply`,
      replyBody,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    console.log('Reply sent to Isabella Rodriguez in-thread as Amber.');
  } else {
    console.log('No existing thread found — sending as fresh email.');

    const message: any = {
      subject: 'Quick one from Amber at Indvstry Clvb',
      body: { contentType: 'HTML', content: buildHtml(emailText) },
      toRecipients: [{ emailAddress: { address: 'isabella@supergreatfantastic.life', name: 'Isabella Rodriguez' } }],
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

    console.log('Fresh email sent to Isabella Rodriguez as Amber.');
  }
}

main().catch((error) => {
  console.error(error?.response?.data || error);
  process.exit(1);
});
