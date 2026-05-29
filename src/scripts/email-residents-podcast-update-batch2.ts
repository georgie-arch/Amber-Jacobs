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

async function sendOrReply(
  token: string,
  toEmail: string,
  toName: string,
  subject: string,
  bodyText: string
): Promise<void> {
  const logoB64 = getLogoBase64();
  const attachment = logoB64 ? [{
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: 'indvstry-logo.png',
    contentType: 'image/png',
    contentBytes: logoB64,
    contentId: 'indvstry-logo',
    isInline: true,
  }] : [];

  const search = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="${toEmail}"&$top=1&$select=id,subject`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );
  const messages = search.data.value;

  if (messages && messages.length > 0) {
    const msgId = messages[0].id;
    console.log(`  Found thread: "${messages[0].subject}" — replying in-thread.`);
    const replyBody: any = {
      message: {
        body: { contentType: 'HTML', content: buildHtml(bodyText) },
        from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
      }
    };
    if (attachment.length) replyBody.message.attachments = attachment;
    await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${msgId}/reply`,
      replyBody,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
  } else {
    console.log(`  No existing thread — sending fresh email.`);
    const message: any = {
      subject,
      body: { contentType: 'HTML', content: buildHtml(bodyText) },
      toRecipients: [{ emailAddress: { address: toEmail, name: toName } }],
      from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
    };
    if (attachment.length) message.attachments = attachment;
    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
  }
}

const anthonyBody = `Hi Anthony,

Hope you are well. Wanted to share a couple of exciting things we are working on for the Power House.

We have been offered the opportunity to record an episode of our podcast at Cannes and are looking for villa residents to collaborate with us on it. This would be recorded at Spotify Beach in their dedicated podcast booths, and is a real opportunity to get an invitation from Spotify and work with them directly on the episode. The conversation would be around navigating gatekeeping in the industry, though we may make the topic more specific as we get closer. Our host is Dinalva Tavares (@missdinalva on Instagram) who will be moderating. You can get a preview of the podcast and some potential episode topics here: powerhouse.indvstryclvb.com/spotify

We are also in conversation with DEPT agency who have offered us a space to host a panel at Cannes. This would be held at DEPT's Secret Garden activation on the Croisette, which is one of the best activations at the festival. More details to follow on that one as it comes together.

If either of those is something you would be up for, let us know and we will circle back with more detail.

We have also been pitching you for some brand collaborations and will be updating you on those soon. Here is our sponsorship deck in the meantime in case you want to share it with anyone in your network who might be a fit as a partner or sponsor: canva.link/j9tgb9z2annevnz

Speak soon,
Amber`;

const kellyBody = `Hi Kelly,

Hope you are good. Wanted to share a couple of exciting things we are working on for the Power House.

We have been offered the opportunity to record an episode of our podcast at Cannes and are looking for villa residents to collaborate with us on it. This would be recorded at Spotify Beach in their dedicated podcast booths, and is a real opportunity to get an invitation from Spotify and work with them directly on the episode. The conversation would be around navigating gatekeeping in the industry, though we may make the topic more specific as we get closer. Our host is Dinalva Tavares (@missdinalva on Instagram) who will be moderating. A preview of the podcast and some potential episode topics is here: powerhouse.indvstryclvb.com/spotify

We are also in conversation with DEPT agency who have offered us a space to host a panel at Cannes. This would be held at DEPT's Secret Garden activation on the Croisette, which is one of the best activations at the festival. More details to follow as it comes together.

If either of those sounds like something you would be up for, just let us know and we will come back to you with more detail.

We have also been pitching you for some brand collaborations and will be updating you on those soon. Here is our sponsorship deck in the meantime in case you want to share it with anyone in your network who might be a great fit as a partner or sponsor: canva.link/j9tgb9z2annevnz

Speak soon,
Amber`;

const olgaBody = `Hi Olga,

Hope you are well. Wanted to share a couple of exciting things we are working on for the Power House.

We have been offered the opportunity to record an episode of our podcast at Cannes and are looking for villa residents to collaborate with us on it. This would be recorded at Spotify Beach in their dedicated podcast booths, and is a real opportunity to get an invitation from Spotify and work with them directly on the episode. The conversation would be around navigating gatekeeping in the industry, though we may make the topic more specific as we get closer. Our host is Dinalva Tavares (@missdinalva on Instagram) who will be moderating. A preview of the podcast and some potential episode topics is here: powerhouse.indvstryclvb.com/spotify

We are also in conversation with DEPT agency who have offered us a space to host a panel at Cannes. This would be held at DEPT's Secret Garden activation on the Croisette, which is one of the best activations at the festival. More details to follow as it comes together.

If either of those sounds like something you would be up for, just let us know and we will circle back with more detail.

We have also been pitching you for some brand collaborations and will be updating you on those soon. Here is our sponsorship deck in the meantime in case you want to share it with anyone in your network who might be a fit as a partner or sponsor: canva.link/j9tgb9z2annevnz

Speak soon,
Amber`;

async function main() {
  const token = await getToken();

  console.log('\nSending to Anthony Okoro...');
  await sendOrReply(token, 'aokoro@ebay.com', 'Anthony Okoro', 'Power House updates + an exciting opportunity', anthonyBody);
  console.log('  Done.');

  await new Promise(r => setTimeout(r, 2000));

  console.log('\nSending to Kelly Adanna...');
  await sendOrReply(token, 'Kelly@indvstryclvb.com', 'Kelly Adanna', 'Power House updates + an exciting opportunity', kellyBody);
  console.log('  Done.');

  await new Promise(r => setTimeout(r, 2000));

  console.log('\nSending to Olga Viktorova...');
  await sendOrReply(token, 'info@framrlab.com', 'Olga Viktorova', 'Power House updates + an exciting opportunity', olgaBody);
  console.log('  Done.');

  console.log('\nAll three emails sent.');
}

main().catch((error) => {
  console.error(error?.response?.data || error);
  process.exit(1);
});
