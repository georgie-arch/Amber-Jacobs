import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function send() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const accessToken = await oauth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token as string,
    },
  });

  const body = `Hi Patris,

All good on this -- appreciate you flagging it again.

To confirm: only 6 people will be inside the studio at any time. That is the cameraman (1) plus the panelists -- the interviewer and interviewees (5). We are clear on the allocation.

For the concert, if possible we would just need to get the core team in rather than everyone. But no rush on that -- let me know once you have more info.

All clear on everything from our side. Really appreciate you keeping us looped in.

Also sharing the flyer and landing page we put together for this: powerhouse.indvstryclvb.com/spotify

Thanks a lot, Patris.

George Guise
Founder, Indvstry Clvb`;

  await transport.sendMail({
    from: '"George Guise" <access@indvstryclvb.com>',
    to: 'patrisg@spotify.com',
    subject: 'Re: Indvstry Clvb',
    text: body,
    html: body.replace(/\n/g, '<br>'),
    attachments: [
      {
        filename: 'Dear-Gatekeeper-Panel-Cannes-Lions-2026.png',
        path: '/Users/georgeguise/Downloads/cannes flyers/2.png',
      },
    ],
  });

  console.log('Email sent to Patris at patrisg@spotify.com');
}

send().catch(console.error);
