import dotenv from 'dotenv';
import { sendEmailViaGraph } from '../integrations/email';

dotenv.config();

const body = `Hi Aileen,

Just checking in to see if you still want to find a time to chat with George.

Completely fine if things have got busy. Just let me know and I can get something in the diary whenever works for you: https://calendly.com/itsvisionnaire/30min

Amber
Indvstry Clvb`;

(async () => {
  const ok = await sendEmailViaGraph(
    'aileen.phan1996@gmail.com',
    'Still keen to connect?',
    body
  );
  console.log(ok ? 'Email sent to Aileen.' : 'Email failed.');
})();
