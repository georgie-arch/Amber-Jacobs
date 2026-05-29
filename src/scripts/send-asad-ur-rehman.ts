import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../integrations/email';

const GEORGE = { fromName: 'George Guise', fromAddress: 'access@indvstryclvb.com' };

async function main() {
  const sent = await sendEmail(
    'asadchawla@gmail.com',
    'Re: Cannes Lions — Next Year It Is',
    `Hi Asad,

Sorry for the slow reply, it has been a busy few weeks on our end!

Completely understand and no worries at all. Cannes is full on and if the timing is not right then next year makes total sense. We would love to have you properly in the mix when it does happen.

Good news from our side, a new sponsor just came on board which is really exciting and things are coming together well for the week. I will keep you posted as things develop.

And you are still very much on our list. If the right panel opportunity comes up, you will be the first person we come to.

Speak soon and looking forward to making it happen next year!

George Guise
Founder, Indvstry Clvb`,
    'access@indvstryclvb.com',
    GEORGE
  );

  console.log(sent ? '✅ Sent to Asad ur Rehman' : '❌ Failed');
  if (!sent) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
