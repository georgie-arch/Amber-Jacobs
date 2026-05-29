/**
 * George checks in with all villa interest form respondents.
 * Asks if they're still up for Cannes villa + delegate pass, directs to book a call.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-villa-leads-checkin.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

const contacts = [
  { name: 'Venus',      email: 'venusashu1@gmail.com' },
  { name: 'Frank',      email: 'frankskully@hotmail.com' },
  { name: 'Denise',     email: 'denise.maxwell@gmail.com' },
  { name: 'LaToya',     email: 'latoyaharding89@gmail.com' },
  { name: 'Sabina',     email: 'sabina.jasinska25@gmail.com' },
  { name: 'Anais',      email: 'Anais603@gmail.com' },
  { name: 'Melissa',    email: 'Letswork@macomedia.co.uk' },
  { name: 'Tola',       email: 'tola.m@hotmail.com' },
  { name: 'Gilda',      email: 'gildavallem@gmail.com' },
  { name: 'Cassy',      email: 'Hello@cassyisabella.com' },
  { name: 'Nico',       email: 'Nicorose92@icloud.com' },
  { name: 'Daisy',      email: 'daisy@dave.sports' },
  { name: 'Isabel',     email: 'isabel.lamers@gmail.com' },
  { name: 'Sabrina',    email: 'sfearonmelville@gmail.com' },
  { name: 'Ashley',     email: 'abrooks@michelemariepr.com' },
  { name: 'Karen',      email: 'karen-grillo@hotmail.co.uk' },
  { name: 'Naomi',      email: 'niluyomade@gmail.com' },
  { name: 'Marian',     email: 'marianjsreynolds@gmail.com' },
  { name: 'Katie',      email: 'klangers@hotmail.com' },
  { name: 'Angela',     email: 'angelanjerik@gmail.com' },
  { name: 'Paula',      email: 'paula@bunnycreative.com' },
  { name: 'Elizabeth',  email: 'Elizabeth@bunastreetcollective.com' },
  { name: 'Wesley',     email: 'enquiriesmrw9ine@gmail.com' },
  { name: 'Elizabeth',  email: 'E.ogunkoya@hotmail.com' },
  { name: 'Jonathan',   email: 'jonathanmbenga1@hotmail.com' },
  { name: 'Christina',  email: 'christinangoyi@gmail.com' },
  { name: 'James',      email: 'James@urbansyndicate.co.uk' },
  { name: 'Cl',         email: 'capitalkv1@gmail.com' },
  { name: 'Aileen',     email: 'aileen.phan1996@gmail.com' },
  { name: 'Dinesh',     email: 'dineshj@ndtv.com' },
  { name: 'Martha',     email: 'info@everydaymolo.com' },
  { name: 'Eliana',     email: 'eclopesdasilva@gmail.com' },
  { name: 'Tamika',     email: 'Hello@culture-deluxe.com' },
  { name: 'Bonnae',     email: 'Bonnaeogunlade@omc.com' },
  { name: 'Shireen',    email: 'crowninggreatnesscic@gmail.com' },
  { name: 'Betul',      email: 'betulsusamis@gmail.com' },
  { name: 'Sherkera',   email: 'Sherkerawilson@yahoo.com' },
  { name: 'Ingrid',     email: 'ingrid@kensingtongrey.co' },
  { name: 'Anthony',    email: 'Tmpflagship@gmail.com' },
  { name: 'Tia',        email: 'tiakaycee12@gmail.com' },
  { name: 'Charlotte',  email: 'charlotte@stylecartel.com' },
  { name: 'Tiyanna',    email: 'hello@theraremarephotobooth.co.uk' },
  { name: 'Ro',         email: 'rolaurren@gmail.com' },
  { name: 'Maria',      email: 'maria@wearecreativemedia.org' },
  { name: 'Anam',       email: 'anam@thehanginghouse.com' },
  { name: 'Musa',       email: 'msahmad0015@gmail.com' },
  { name: 'Jim',        email: 'Jim@iqzone.com' },
];

function buildBody(firstName: string): string {
  return `Hi ${firstName},

Quick one -- are you still up for joining us at the Indvstry Power House villa in Cannes, 21--26 June, with the delegate pass included?

Spots are very limited and we want to get the right people locked in. If you're keen, book a call with us this coming week and we can get you sorted.

Book here: https://calendly.com/itsvisionnaire/30min

George Guise
Founder, Indvstry Clvb`;
}

async function main() {
  const token = await getAccessToken();
  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          message: {
            subject: 'Still interested in the villa?',
            body: { contentType: 'Text', content: buildBody(contact.name) },
            toRecipients: [{ emailAddress: { address: contact.email } }],
            from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
          },
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log(`[${++sent}/${contacts.length}] Sent to ${contact.name} <${contact.email}>`);
      await new Promise(r => setTimeout(r, 300));
    } catch (e: any) {
      failed++;
      console.error(`FAILED ${contact.name} <${contact.email}>:`, e?.response?.data || e.message);
    }
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
