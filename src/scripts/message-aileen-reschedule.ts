import dotenv from 'dotenv';
import { sendEmailViaGraph } from '../integrations/email';

dotenv.config();

const body = `Hi Aileen,

Hope you're well! George jumped on the call you booked today but it looks like you weren't able to make it.

No worries at all, these things happen. Would you like to reschedule? You can grab a time that works for you here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting soon.

Amber
Indvstry Clvb`;

(async () => {
  const ok = await sendEmailViaGraph(
    'aileen.phan1996@gmail.com',
    'Missed you on the call today',
    body
  );
  console.log(ok ? 'Email sent.' : 'Email failed.');
})();
