import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PHOTO_PATH = '/Users/georgeguise/Desktop/Screenshot 2026-05-19 at 14.27.36.png';
const LOGO_PATH  = '/Users/georgeguise/Downloads/power house Project/power Logos/indv logo 2_.png';

const HTML_BODY = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">

<p>Hi Abigail,</p>

<p>Following on from our conversation, I just wanted to say this properly — the idea of doing Indvstry Nights at Enish Soho is amazing and I am absolutely in. It feels like the perfect home for what we are building and I could not be more excited about it.</p>

<p>As we discussed, my birthday is on the 3rd of May and I would love to use that as the launch night for Indvstry Nights. A proper celebration to kick things off in style.</p>

<p>Here are my details for the event:</p>

<table style="margin:16px 0;border-collapse:collapse;">
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;">Name</td><td style="padding:4px 0;">George Guise</td></tr>
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;">Title</td><td style="padding:4px 0;">Video Director &amp; Founder, Visionnaire Pictures | Chief Operations Manager, Indvstry Clvb</td></tr>
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;">Bio</td><td style="padding:4px 0;">George Guise is a London-based video director, founder of Visionnaire Pictures, and Chief Operations Manager at Indvstry Clvb — a digital private members club for creative professionals. With a career spanning film, culture, and community building, George has built a reputation for curating spaces where creative talent connects, collaborates, and genuinely thrives.</td></tr>
</table>

<p>I have attached my photo and the Indvstry Clvb logo for the event materials.</p>

<p>Before we start promoting, a few things I wanted us to align on:</p>

<ol>
  <li><strong>Event link</strong> — do you want to set that up on your end, or shall we handle it through Indvstry Clvb?</li>
  <li><strong>Flyer</strong> — same question. Happy for my designer to take the lead, or we can follow your direction entirely.</li>
  <li><strong>Music</strong> — we would love to put forward <strong>DJ Tabby Loso</strong> for the vibes. I think he is a brilliant fit for the energy of the night and the crowd will love it.</li>
</ol>

<p>Once we have those three things agreed we can start pushing this out through our newsletters and channels straight away.</p>

<p>Can we get on a quick call this evening or tomorrow and lock it all in? Book straight into my calendar here: <a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">https://calendly.com/itsvisionnaire/30min</a></p>

<p>Let us make this happen.</p>

<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
  <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
  <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Chief Operations Manager, Indvstry Clvb</p>
  <p style="margin:0 0 4px 0;">+44 7438 932403</p>
  <p style="margin:0 0 4px 0;">London, UK</p>
  <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
  <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
</div>

</body>
</html>`;

async function send() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token } = await oauth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: token as string,
    },
  });

  const attachments: any[] = [];

  if (fs.existsSync(PHOTO_PATH)) {
    attachments.push({ filename: 'george-guise.png', path: PHOTO_PATH, contentType: 'image/png' });
  } else {
    console.warn('Photo not found:', PHOTO_PATH);
  }

  if (fs.existsSync(LOGO_PATH)) {
    attachments.push({ filename: 'indvstry-clvb-logo.png', path: LOGO_PATH, contentType: 'image/png' });
  } else {
    console.warn('Logo not found:', LOGO_PATH);
  }

  await transport.sendMail({
    from: '"George Guise" <access@indvstryclvb.com>',
    to: 'abigail@thecolour8.com',
    subject: 'Indvstry Nights x Enish Soho — Let\'s Lock This In',
    html: HTML_BODY,
    replyTo: 'access@indvstryclvb.com',
    attachments,
  });

  console.log('Email sent to abigail@thecolour8.com from access@indvstryclvb.com');
  console.log(`Attachments sent: ${attachments.map(a => a.filename).join(', ')}`);
}

send().catch(err => {
  console.error('Send failed:', err.message || err);
  process.exit(1);
});
