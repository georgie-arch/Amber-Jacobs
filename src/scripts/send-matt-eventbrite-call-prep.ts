/**
 * send-matt-eventbrite-call-prep.ts
 *
 * Reply to Matt Tuffuor (Eventbrite) in-thread from George ahead of call today.
 * Shares powerhouse.indvstryclvb.com/eventbrite + sponsorship deck PDF attachment.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/send-matt-eventbrite-call-prep.ts
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
      scope: 'https://graph.microsoft.com/Mail.Send Mail.ReadWrite offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

function buildHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi Matt,<br><br>

    Looking forward to the call this afternoon.<br><br>

    Wanted to send something over ahead of time so you have a chance to look at it before we speak. I have put together a page that outlines the idea I have in mind for us:<br><br>

    <a href="https://powerhouse.indvstryclvb.com/eventbrite" style="color:#1a1a1a;">powerhouse.indvstryclvb.com/eventbrite</a><br><br>

    The concept is simple. Cannes Lions has some of the best events of the year happening across the week, and a huge chunk of them run through Eventbrite. The idea is to bring together the people who throw the best events at Cannes alongside the organisers and brands already using Eventbrite — and create something that celebrates that world and puts both of us at the centre of it.<br><br>

    I have also attached our sponsorship deck so you can get a broader sense of what we are building at Indvstry Power House.<br><br>

    Speak soon,
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;
}

async function main() {
  const token = await getToken();

  const deckPath = '/Users/georgeguise/Downloads/PowerHouse Sponsorship w_ tg _compressed.pdf';
  const deckBytes = fs.readFileSync(deckPath).toString('base64');
  console.log('Sponsorship deck loaded.');

  const attachment = {
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: 'Indvstry Power House — Sponsorship Deck.pdf',
    contentType: 'application/pdf',
    contentBytes: deckBytes,
  };

  // Search for existing thread with Matt
  const search = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="from:matt.tuffuor@eventbrite.com"&$top=1&$select=id,subject,conversationId`,
    { headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: 'eventual' } }
  );

  const messages = search.data.value;

  if (messages && messages.length > 0) {
    const msgId = messages[0].id;
    console.log(`Found thread: "${messages[0].subject}" — replying in-thread.`);

    await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${msgId}/reply`,
      {
        message: {
          body: { contentType: 'HTML', content: buildHtml() },
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
          attachments: [attachment],
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    console.log('Reply sent to Matt Tuffuor in-thread from George.');
  } else {
    console.log('No existing thread found — sending as fresh email.');

    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        message: {
          subject: 'Looking forward to our call — a quick read before we speak',
          body: { contentType: 'HTML', content: buildHtml() },
          toRecipients: [{ emailAddress: { address: 'matt.tuffuor@eventbrite.com', name: 'Matt Tuffuor' } }],
          from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
          attachments: [attachment],
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    console.log('Fresh email sent to Matt Tuffuor from George.');
  }
}

main().catch((err) => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
