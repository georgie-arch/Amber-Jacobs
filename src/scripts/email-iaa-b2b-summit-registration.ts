/**
 * B2B Summit with IAA and LinkedIn at Cannes Lions 2026
 * Registers all 10 Indvstry Power House residents by email.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-iaa-b2b-summit-registration.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmailFrom } from '../integrations/email';

const FROM_ADDRESS = 'access@indvstryclvb.com';
const FROM_NAME    = 'George Guise';
const TO           = 'kirsty.giordani@iaaglobal.org';

const SUBJECT = 'Registration of Interest: B2B Summit with IAA and LinkedIn at Cannes Lions 2026';

const BODY = `Hi Kirsty,

I hope you are well. I am writing on behalf of Indvstry Power House, our curated group of creative and brand professionals attending Cannes Lions 2026 as part of Indvstry Clvb's villa residency programme.

We would love to register 10 of our residents for the B2B Summit with IAA and LinkedIn. Please find their details below:

1. George Guise, Founder, Soab Party
2. Dinalva Tavares, Brand Partnerships and Events Manager, Miss Dinalva
3. Anthony Okoro, Senior Director, Ads New Ventures, eBay
4. Kelly Adanna, Talent Manager, ADA Collective
5. LaToya Shambo, CEO and Founder, Black Girl Digital
6. Olga Viktorova, Founder and CEO, Framr Lab
7. Chanelle Pal, Founder and Creative Director, Chan Studio
8. Romy Gama, Creative Director, Indvstry Clvb
9. Silva Stone, Recording Studio Owner, White Hut Studios
10. Abi Blend, New Business Manager, Cr8 Focus

Please do let us know if you need any further details to complete their registrations. We are very much looking forward to attending.

Best wishes,
George Guise`;

async function main() {
  console.log(`Sending B2B Summit registration email to ${TO}...`);
  const sent = await sendEmailFrom(TO, SUBJECT, BODY, FROM_ADDRESS, FROM_NAME);
  if (sent) {
    console.log('Done. Email sent from access@indvstryclvb.com.');
  } else {
    console.error('Failed to send. Check Gmail OAuth2 credentials in .env.');
    process.exit(1);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
