/**
 * send-powerhouse-leads.ts
 *
 * Sends the Indvstry Power House outreach email to new CSV leads (entries 34-47)
 * with the Shadeborough residents deck attached, and logs all contacts into
 * Amber's memory database as villa residency leads.
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/send-powerhouse-leads.ts
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { setupDatabase } from '../database/migrations';
import AmberMemory from '../agent/memory';
import { logger } from '../utils/logger';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const PDF_PATH = '/Users/georgeguise/Downloads/power house Project/Decks/POWER HOUSE DECK - shade borough deck.pdf';
const SUBJECT  = 'Your spot at Indvstry Power House, Cannes Lions 2026';
const DELAY_MS = 3000; // 3s between sends to avoid throttling

// ─── LEADS ───────────────────────────────────────────────────────────────────

const LEADS = [
  { name: 'Elizabeth Anyaegbuna', firstName: 'Elizabeth', email: 'Elizabeth@bunastreetcollective.com', jobTitle: 'Founder',                                     company: 'Buna Street Collective', industry: 'Advertising & Marketing', interest: 'Potentially, I need more details', budget: 'No',                          likelihood: '3' },
  { name: 'Wesley Antonio',       firstName: 'Wesley',   email: 'enquiriesmrw9ine@gmail.com',          jobTitle: 'Actor',                                        company: '',                       industry: 'Music & Entertainment',   interest: 'Yes, definitely',                budget: 'Yes',                         likelihood: '5' },
  { name: 'Elizabeth Ogunkoya',   firstName: 'Elizabeth', email: 'E.ogunkoya@hotmail.com',              jobTitle: 'IT Consultant',                                company: '',                       industry: 'Fashion & Lifestyle',     interest: 'Yes, definitely',                budget: 'Possibly, depending on the Villa', likelihood: '5' },
  { name: 'Jonathan Mbenga',      firstName: 'Jonathan', email: 'jonathanmbenga1@hotmail.com',          jobTitle: 'Magazine Editor',                              company: '',                       industry: 'Agency',                  interest: 'Yes, definitely',                budget: 'Possibly, depending on the Villa', likelihood: '5' },
  { name: 'Christina Ngoyi',      firstName: 'Christina', email: 'christinangoyi@gmail.com',            jobTitle: 'Actor & Content Creator',                      company: '',                       industry: 'Music & Entertainment',   interest: 'Yes, definitely',                budget: 'Possibly, depending on the Villa', likelihood: '4' },
  { name: 'James Harvey',         firstName: 'James',    email: 'James@urbansyndicate.co.uk',            jobTitle: 'Founder, Urban Syndicate Studios',             company: 'Urban Syndicate Studios', industry: 'Fashion & Lifestyle',    interest: 'Yes, definitely',                budget: 'Possibly, depending on the Villa', likelihood: '3' },
  { name: 'CL',                   firstName: 'CL',       email: 'capitalkv1@gmail.com',                 jobTitle: 'Founder & CEO, CapitalKV',                     company: 'CapitalKV',              industry: 'Tech & Innovation',       interest: 'Potentially, I need more details', budget: 'No',                        likelihood: '1' },
  { name: 'Aileen Phan',          firstName: 'Aileen',   email: 'aileen.phan1996@gmail.com',             jobTitle: 'Founder, Ultima Ratio Ltd',                    company: 'Ultima Ratio Ltd',       industry: 'Tech & Innovation',       interest: 'Just curious for now',           budget: 'Possibly, depending on the Villa', likelihood: '2' },
  { name: 'Dinesh Joshi',         firstName: 'Dinesh',   email: 'dineshj@ndtv.com',                     jobTitle: 'VP & Head: Product Monetisation & Adtech',     company: 'NDTV',                   industry: 'Media & Publishing',      interest: 'Yes, definitely',                budget: 'Possibly, depending on the Villa', likelihood: '4' },
  { name: 'Martha Omasoro',       firstName: 'Martha',   email: 'info@everydaymolo.com',                 jobTitle: 'Founder',                                      company: 'Everyday Molo',          industry: 'Media & Publishing',      interest: 'Yes, definitely',                budget: 'Possibly, depending on the Villa', likelihood: '3' },
  { name: 'Eliana Da Silva',      firstName: 'Eliana',   email: 'eclopesdasilva@gmail.com',              jobTitle: 'Senior Sales Manager',                         company: '',                       industry: 'Advertising & Marketing', interest: 'Yes, definitely',                budget: 'No',                          likelihood: '4' },
  { name: 'Tamika Martin',        firstName: 'Tamika',   email: 'Hello@culture-deluxe.com',              jobTitle: 'Founder & Director',                           company: 'Culture Deluxe',         industry: 'Agency',                  interest: 'Yes, definitely',                budget: 'Possibly, depending on the Villa', likelihood: '4' },
  { name: 'Bonnae Ogunlade-Gillan', firstName: 'Bonnae', email: 'Bonnaeogunlade@omc.com',               jobTitle: 'Platform Enablement Director',                 company: 'OMC',                    industry: 'Media & Publishing',      interest: 'Yes, definitely',                budget: 'No',                          likelihood: '5' },
  { name: 'Shireen Morrison',     firstName: 'Shireen',  email: 'crowninggreatnesscic@gmail.com',        jobTitle: 'Director',                                     company: 'Crowning Greatness CIC', industry: 'Music & Entertainment',   interest: 'Potentially, I need more details', budget: 'Yes',                       likelihood: '4' },
];

// ─── EMAIL BODY ───────────────────────────────────────────────────────────────

function buildEmailBody(firstName: string): string {
  return `Hi ${firstName},

Thanks so much for expressing interest in Indvstry Power House. It means a lot that you took the time to fill out the form.

I wanted to reach out personally to give you a bit more context on what we are building and why it might be exactly what you need at Cannes this year.

Indvstry Power House is a private villa residency for a carefully selected group of creative professionals attending Cannes Lions 2026. Running from 21 to 26 June, it is designed to be more than just a place to sleep. It is a base, a community and a launchpad all in one.

Here is what being a resident actually looks like:

- A private villa shared with a curated group of founders, directors and creatives from across the industry
- Access to a packed schedule of Cannes events and activations, facilitated through the Indvstry network
- Daily shared experiences, from morning coffee to evening debrief, with people who are genuinely building something
- Connections that carry beyond the festival week
- Support from our team on the ground throughout your stay

You can view the full residency details and available rooms here: https://powerhouse.indvstryclvb.com

For everything else, I have attached our residents deck so you can get a proper feel for the experience.

Spots are extremely limited. We only have 7 rooms and we are selecting residents based on fit. We want the group to be right for everyone.

If this sounds like something worth exploring, the best next step is a quick call with George Guise, the founder of Indvstry Clvb. He would love to learn more about you and walk you through whether this is the right move for Cannes.

Book a time here: https://calendly.com/itsvisionnaire/30min

Looking forward to hopefully welcoming you.

Warm regards,
Amber Jacobs
Community Manager, Indvstry Clvb`;
}

function buildEmailHtml(firstName: string): string {
  const text = buildEmailBody(firstName);
  const lines = text.split('\n');
  const html = lines.map(line => {
    if (line.startsWith('- ')) return `<li style="margin-bottom:6px">${line.slice(2)}</li>`;
    if (line === '') return '<br>';
    return `<p style="margin:0 0 12px 0">${line.replace(/https?:\/\/[^\s]+/g, url => `<a href="${url}" style="color:#1a1a1a">${url}</a>`)}</p>`;
  });

  // Wrap list items
  const wrapped = html.join('\n').replace(
    /(<li.*<\/li>\n?)+/g,
    match => `<ul style="padding-left:20px;margin:0 0 16px 0">\n${match}</ul>`
  );

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;font-size:15px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px;line-height:1.7">
${wrapped}
<p style="margin:32px 0 0 0;font-size:13px;color:#888">
  Indvstry Clvb &mdash; Cannes Lions 2026<br>
  <a href="https://powerhouse.indvstryclvb.com" style="color:#888">powerhouse.indvstryclvb.com</a>
</p>
</body>
</html>`;
}

// ─── OUTLOOK GRAPH API SEND WITH ATTACHMENT ───────────────────────────────────

async function getOutlookAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

async function sendWithAttachment(
  to: string,
  firstName: string,
  accessToken: string,
  pdfBase64: string
): Promise<boolean> {
  const sender = process.env.EMAIL_USER || 'access@indvstryclvb.com';

  const message = {
    subject: SUBJECT,
    body: {
      contentType: 'HTML',
      content: buildEmailHtml(firstName),
    },
    toRecipients: [{ emailAddress: { address: to } }],
    from: { emailAddress: { address: sender, name: 'Amber Jacobs' } },
    replyTo: [{ emailAddress: { address: sender, name: 'Amber Jacobs' } }],
    attachments: [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'Indvstry Power House - Residents Deck.pdf',
        contentType: 'application/pdf',
        contentBytes: pdfBase64,
      }
    ]
  };

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  return true;
}

// ─── ADD TO AMBER MEMORY ──────────────────────────────────────────────────────

function addLeadsToMemory(leads: typeof LEADS): void {
  setupDatabase();
  const memory = new AmberMemory();

  for (const lead of leads) {
    const nameParts = lead.name.split(' ');
    const contactId = memory.upsertContact({
      first_name:   lead.firstName,
      last_name:    nameParts.slice(1).join(' ') || '',
      email:        lead.email,
      company:      lead.company || undefined,
      job_title:    lead.jobTitle || undefined,
      source:       'powerhouse_csv_form',
      status:       'lead',
      notes: `Villa lead. Industry: ${lead.industry}. Interest: ${lead.interest}. Budget: ${lead.budget}. Likelihood: ${lead.likelihood}/5. Added from CSV batch Apr 2026.`,
    });

    memory.scheduleFollowUp(
      contactId,
      'email',
      'villa_lead_followup',
      `Follow up on Indvstry Power House interest. They expressed: "${lead.interest}". Budget comfort: ${lead.budget}. Likelihood: ${lead.likelihood}/5.`,
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    );

    memory.logActivity('email_outreach_sent', 'email', contactId, { note: 'Power House outreach email sent with residents deck.' });
    logger.info(`  Logged: ${lead.name}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\nIndvstry Power House — Lead Outreach Send');
  console.log(`Sending to ${LEADS.length} contacts\n`);

  // Read PDF
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found: ${PDF_PATH}`);
    process.exit(1);
  }
  const pdfBase64 = fs.readFileSync(PDF_PATH).toString('base64');
  console.log(`PDF loaded: ${(fs.statSync(PDF_PATH).size / 1024 / 1024).toFixed(1)}MB\n`);

  // Get access token once
  let accessToken: string;
  try {
    accessToken = await getOutlookAccessToken();
    console.log('Outlook auth: OK\n');
  } catch (err: any) {
    console.error('Outlook auth failed:', err.message);
    process.exit(1);
  }

  // Send emails
  const results: { name: string; email: string; status: 'sent' | 'failed' }[] = [];

  for (let i = 0; i < LEADS.length; i++) {
    const lead = LEADS[i];
    process.stdout.write(`[${i + 1}/${LEADS.length}] ${lead.name} <${lead.email}> ... `);

    try {
      await sendWithAttachment(lead.email, lead.firstName, accessToken, pdfBase64);
      console.log('SENT');
      results.push({ name: lead.name, email: lead.email, status: 'sent' });
    } catch (err: any) {
      console.log(`FAILED — ${err?.response?.data?.error?.message || err.message}`);
      results.push({ name: lead.name, email: lead.email, status: 'failed' });
    }

    if (i < LEADS.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // Add all to Amber's memory
  console.log('\nLogging contacts to Amber database...');
  addLeadsToMemory(LEADS);

  // Summary
  const sent   = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed').length;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done. ${sent} sent, ${failed} failed.`);
  if (failed > 0) {
    console.log('\nFailed:');
    results.filter(r => r.status === 'failed').forEach(r => console.log(`  - ${r.name} <${r.email}>`));
  }
  console.log('All contacts added to Amber lead database with 5-day follow-up scheduled.');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
