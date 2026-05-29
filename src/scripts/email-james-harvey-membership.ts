import dotenv from 'dotenv';
import { sendEmailViaGraph } from '../integrations/email';

dotenv.config();

const body = `Hi James,

George asked me to reach out and share a bit more about Indvstry Clvb and what membership looks like.

Indvstry Clvb is a digital private members club built for creative professionals. It is a space where founders, creatives, and cultural leaders connect, collaborate, and get access to things that genuinely move the needle. Think curated events, a high-quality network, resources, and real opportunities to work with people at the top of their industries.

Given your interest in Paris Fashion Week, that is an area where the club has strong reach. We work with members in fashion, culture, and the creative industries across London, Paris, and beyond. Members have used the network to get into PFW events, make connections with brands and agencies, and build the kind of relationships that are hard to find through conventional channels.

Membership is by application, so it stays quality-first. George thought you would be a great fit, which is why he wanted me to get in touch.

If you want to have a proper conversation about whether it makes sense for you, George is happy to jump on a call: https://calendly.com/itsvisionnaire/30min

Happy to answer any questions in the meantime.

Amber
Indvstry Clvb`;

(async () => {
  const ok = await sendEmailViaGraph(
    'James@urbansyndicate.co.uk',
    'Indvstry Clvb — membership info for you',
    body
  );
  console.log(ok ? 'Email sent to James Harvey.' : 'Email failed.');
})();
