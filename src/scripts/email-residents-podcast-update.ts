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

const latoyaBody = `Hi LaToya,

Hope you are well. A couple of things I wanted to update you on.

On your Cannes Lions pass, the team are currently confirming whether they are able to make the change this week. As soon as we have the confirmation we will send you the full details straight away.

Separately, we have been offered an exciting opportunity to record an episode of our podcast at Cannes and we are looking for residents of the villa to collaborate with us on it. This would be recorded at Spotify Beach in their dedicated podcast booths, and is an opportunity to get an invitation from Spotify and work with them directly on the episode. The conversation would be around navigating gatekeeping in the industry, though we may make the topic more specific as we get closer. Our host is Dinalva Tavares (@missdinalva on Instagram) who will be moderating. We have put together a preview deck including some potential episode topics here: powerhouse.indvstryclvb.com/spotify

If that is something you would be interested in, let us know and we will circle back to you with more details.

We are also in conversation with DEPT agency who have offered us a space to host a panel at Cannes. This would be held at DEPT's Secret Garden activation on the Croisette, which is one of the best activations at the festival. It is looking promising but it does hinge on having the right high-level, CEO-calibre guests in the room. If you know anyone or could recommend someone who would be a strong fit, that would be a huge help.

On brand collabs, we have been pitching you to a number of potential partners and will be updating you on those soon. In the meantime, we have included our sponsorship deck below in case it is useful to share with anyone in your own network who might be a fit as a partner or sponsor for the Power House: canva.link/j9tgb9z2annevnz

Speak soon,
Amber`;

const romyBody = `Hi Romy,

Hope you are good. Wanted to flag something on your Cannes pass that I think is worth considering.

Given that you are a content creator and podcaster, we think the Creator Pass might actually be the better option for you. It gives you more access than a standard delegate pass, including access to the Adobe Creator Beach, and it is essentially a more powerful pass overall. It is also the same pass your friend Chanelle has. We think it is the best fit for how you will actually be using Cannes, but wanted to run it by you first before we make any changes.

On another note, we have been offered the opportunity to record an episode of our podcast at Cannes and we are looking for villa residents to collaborate with us on it. This would be recorded at Spotify Beach in their dedicated podcast booths, and is a real opportunity to get an invitation from Spotify and work with them directly on the episode. The conversation would be around navigating gatekeeping in the industry, though we may tighten the topic as we get closer. Our host is Dinalva Tavares (@missdinalva on Instagram) who will be moderating. A preview of the podcast including some potential episode topics is here: powerhouse.indvstryclvb.com/spotify

Let us know if you would be interested and we will come back to you with more details.

We have also been pitching you for some brand collaborations and will be updating you on those soon. In the meantime, here is our sponsorship deck in case it is useful to share with anyone in your network who might be a great fit as a partner or sponsor: canva.link/j9tgb9z2annevnz

Speak soon,
Amber`;

const chanelleBody = `Hi Chanelle,

Hope you are well. Wanted to share something exciting with you.

We have been offered the opportunity to record an episode of our podcast at Cannes and are looking for villa residents to collaborate with us on it. This would be recorded at Spotify Beach in their dedicated podcast booths, and is a real opportunity to get an invitation from Spotify and work with them directly on the episode. The conversation would be around navigating gatekeeping in the industry, though we may make the topic more specific as we get closer. Our host is Dinalva Tavares (@missdinalva on Instagram) who will be moderating. You can get a preview of the podcast and some potential episode topics here: powerhouse.indvstryclvb.com/spotify

If that sounds like something you would be up for, let us know and we will circle back with more detail.

We have also been pitching you for some brand collaborations and will be updating you on those soon. Here is our sponsorship deck in the meantime in case you want to share it with anyone in your network who might be a fit as a partner or sponsor: canva.link/j9tgb9z2annevnz

Speak soon,
Amber`;

async function main() {
  const token = await getToken();

  console.log('\nSending to LaToya Shambo...');
  await sendOrReply(token, 'latoya.shambo@blackgirldigital.com', 'LaToya Shambo', 'Power House updates + an exciting opportunity', latoyaBody);
  console.log('  Done.');

  await new Promise(r => setTimeout(r, 2000));

  console.log('\nSending to Romy Gama...');
  await sendOrReply(token, 'romy@indvstryclvb.com', 'Romy Gama', 'Power House updates + an exciting opportunity', romyBody);
  console.log('  Done.');

  await new Promise(r => setTimeout(r, 2000));

  console.log('\nSending to Chanelle Pal...');
  await sendOrReply(token, 'hello@chanstudio.co', 'Chanelle Pal', 'Power House updates + an exciting opportunity', chanelleBody);
  console.log('  Done.');

  console.log('\nAll three emails sent.');
}

main().catch((error) => {
  console.error(error?.response?.data || error);
  process.exit(1);
});
