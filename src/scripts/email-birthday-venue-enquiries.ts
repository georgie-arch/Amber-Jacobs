/**
 * email-birthday-venue-enquiries.ts
 *
 * Sends venue hire enquiry emails to community centres / churches near Tooting
 * for a 1st birthday party (Teddy Bears Picnic, Saturday 18th July 2026).
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-birthday-venue-enquiries.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CC = 'masuexgeorge@gmail.com';
const SUBJECT = 'Venue Hire Enquiry — 1st Birthday Party | Saturday 18th July';

const venues = [
  {
    name: 'South Mitcham Community Association',
    to: 'sarah@smca.org.uk',
    greeting: 'Hi there',
    venueLine: 'your venue at South Mitcham Community Association',
  },
  {
    name: 'St Nicholas Church Tooting',
    to: 'info@stnicholastooting.org.uk',
    greeting: 'Hi there',
    venueLine: 'your hall at St Nicholas Church Tooting',
  },
  {
    name: 'NE Mitcham Community Centre (near Figges Marsh)',
    to: 'community@nemca.org.uk',
    greeting: 'Hi there',
    venueLine: 'your venue at NE Mitcham Community Centre (near Figges Marsh)',
  },
  {
    name: 'Christ Church Broadway',
    to: 'robert.clark@christchurchbroadway.com',
    greeting: 'Hi Robert',
    venueLine: 'your hall at Christ Church Broadway',
  },
  {
    name: 'Colliers Wood Community Centre',
    to: 'CWCA1960@outlook.com',
    greeting: 'Hi there',
    venueLine: 'your venue at Colliers Wood Community Centre',
  },
  {
    name: 'Tooting Bec Lido',
    to: 'enquiriestootingbeclido@pfpleisure.org',
    greeting: 'Hi there',
    venueLine: 'your space at Tooting Bec Lido / Pavilion',
  },
];

function buildBody(v: typeof venues[0]): string {
  return `${v.greeting},

My name is George, and I'm looking to hire ${v.venueLine} for my child's 1st birthday party. I came across your space and feel it could be a wonderful fit for what we have in mind.

I'd love to know if you're available and what your rates are. Here are our full requirements:

Event Details
- Date: Saturday 18th July 2026
- Preferred time: 1pm-4pm or 2pm-5pm (3 hours)
- Estimated guests: 50-80 people

Venue Requirements
- Indoor and outdoor space (grass area essential)
- Tables and chairs available on site
- Food preparation area / kitchen access

Theme and Styling
- Theme: Teddy Bears Picnic
- Colours: Cream, beige, brown with pastel green or pastel blue accents
- We will be handling our own decorations

Additional Notes
- We are currently sourcing a children's entertainer separately
- We are looking for a community-friendly, family-welcoming space
- Budget conscious -- please do share your full pricing and any community/family rates available

Could you please let me know:
1. Is the venue available on this date and time?
2. What is the hourly or flat rate for hire?
3. Are there any additional costs (cleaning, deposit, etc.)?

Thank you so much for your time. I look forward to hearing from you.

Warm regards,
George Guise`;
}

async function getToken(): Promise<string> {
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

async function sendEmail(
  token: string,
  to: string,
  subject: string,
  body: string,
  cc: string
): Promise<void> {
  const sender = process.env.EMAIL_USER || '';

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject,
        body: {
          contentType: 'Text',
          content: body,
        },
        toRecipients: [{ emailAddress: { address: to } }],
        ccRecipients: [{ emailAddress: { address: cc } }],
        from: { emailAddress: { address: sender, name: 'George Guise' } },
      },
      saveToSentItems: true,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

async function main() {
  console.log('Authenticating with Microsoft Graph...');
  const token = await getToken();
  console.log('Authenticated.\n');

  for (const venue of venues) {
    const body = buildBody(venue);
    process.stdout.write(`Sending to ${venue.name} (${venue.to})... `);
    try {
      await sendEmail(token, venue.to, SUBJECT, body, CC);
      console.log('sent.');
    } catch (err: any) {
      console.log('FAILED.');
      console.error('  Error:', err?.response?.data || err.message);
    }
  }

  console.log('\nDone. Check Sent Items in access@indvstryclvb.com.');
}

main().catch(err => {
  console.error('Fatal:', err?.response?.data || err.message);
  process.exit(1);
});
