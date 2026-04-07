/**
 * morning-outreach-followup.ts
 *
 * 1. Scans all transport + dinner venue email threads
 * 2. Replies to those within budget asking for invoice / quote
 * 3. Emails George a full CSV status spreadsheet
 *
 * Transport budget: €1,000 – €1,500 total (5-day activation)
 * Dinner budget:    ~€80/head (30 guests = ~€2,400 total)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/morning-outreach-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ─── TYPES ───────────────────────────────────────────────────────

type Category = 'Transport' | 'Dinner';
type Status =
  | 'Locked In'
  | 'Invoice Requested'
  | 'Quote Requested'
  | 'Declined'
  | 'Too Expensive'
  | 'No Availability'
  | 'Replying Now'
  | 'No Reply'
  | 'Needs Review';

interface VendorRecord {
  category: Category;
  company: string;
  contact: string;
  email: string;
  status: Status;
  quote: string;
  notes: string;
  messageId?: string; // Graph message ID for reply
}

// ─── PRE-KNOWN VENDOR STATUS ──────────────────────────────────────
// Update these with what we already know from prior sessions

const knownRecords: VendorRecord[] = [
  // ── Transport ──────────────────────────────────────────────────
  {
    category: 'Transport',
    company: 'TranspOnyx',
    contact: '',
    email: '',
    status: 'Locked In',
    quote: '€1,500 total',
    notes: 'Locked in for 5 days. Invoice requested.',
  },
  {
    category: 'Transport',
    company: 'Travel Limousines',
    contact: '',
    email: 'info@travel-limousines.com',
    status: 'Invoice Requested',
    quote: 'Mercedes van 7 pax (price TBC)',
    notes: 'Invoice requested. Billed to Amber Jacobs, 19 Chemin du Vivier, Grasse.',
  },
  {
    category: 'Transport',
    company: 'Wheels France',
    contact: 'Jean-Noel AIMASSO',
    email: 'contact@wheelsfrance.com',
    status: 'Declined',
    quote: '€8,375 total',
    notes: 'Way over budget. Politely declined — went with another provider.',
  },
  {
    category: 'Transport',
    company: 'Autocars Baie Des Anges',
    contact: '',
    email: '',
    status: 'No Availability',
    quote: '',
    notes: 'No availability for our dates.',
  },
  {
    category: 'Transport',
    company: 'Flash Azur Voyages',
    contact: '',
    email: '',
    status: 'No Availability',
    quote: '',
    notes: 'No availability for our dates.',
  },
  {
    category: 'Transport',
    company: 'Azur Limousines',
    contact: '',
    email: '',
    status: 'Too Expensive',
    quote: '€95/hr + €25 meal supplement',
    notes: 'Quoted hourly rate — €1,000 budget insufficient per their reply.',
  },
  {
    category: 'Transport',
    company: 'Class E Driver',
    contact: '',
    email: '',
    status: 'Too Expensive',
    quote: '',
    notes: 'Said €1,000 for 5 days cannot be done.',
  },
  // ── Dinner / Venues ────────────────────────────────────────────
  {
    category: 'Dinner',
    company: 'Miramar Plage',
    contact: 'Coralie',
    email: 'events@miramar-plage.fr',
    status: 'No Availability',
    quote: '',
    notes: 'Fully privatised June 17–29. Asked Coralie to send invoice if anything changes.',
  },
  {
    category: 'Dinner',
    company: 'La Môme Plage',
    contact: 'Anaïs DAFRI',
    email: '',
    status: 'Invoice Requested',
    quote: '',
    notes: 'Invoice requested. Awaiting.',
  },
];

// ─── VENDORS TO CHECK THIS MORNING ───────────────────────────────
// We'll search for their replies, read the full body, assess price,
// reply if within budget, then log result.

interface VendorToCheck {
  category: Category;
  company: string;
  contact: string;
  email: string;
  searchTerm: string; // used in Graph $search query
  budgetNotes: string;
}

const vendorsToCheck: VendorToCheck[] = [
  // ── Transport ──
  {
    category: 'Transport',
    company: 'Eden Cab',
    contact: '',
    email: 'office@eden-cab.com',
    searchTerm: 'eden cab',
    budgetNotes: 'Budget: €1,000–€1,500 total for 5 days (airport pickup + daily transfers)',
  },
  {
    category: 'Transport',
    company: 'Transfer Nice',
    contact: '',
    email: '',
    searchTerm: 'transfer nice',
    budgetNotes: 'Budget: €1,000–€1,500 total for 5 days',
  },
  {
    category: 'Transport',
    company: 'Ruby Services',
    contact: '',
    email: '',
    searchTerm: 'ruby services',
    budgetNotes: 'Budget: €1,000–€1,500 total for 5 days',
  },
  {
    category: 'Transport',
    company: 'Luxu Chauffeur',
    contact: '',
    email: '',
    searchTerm: 'luxu',
    budgetNotes: 'Budget: €1,000–€1,500 total for 5 days',
  },
  {
    category: 'Transport',
    company: 'FranceBus',
    contact: '',
    email: '',
    searchTerm: 'francebus',
    budgetNotes: 'Budget: €1,000–€1,500 total for 5 days',
  },
  // ── Dinner ──
  {
    category: 'Dinner',
    company: 'Plage Bijou',
    contact: 'Amanda',
    email: 'amanda@plagebijou.com',
    searchTerm: 'plage bijou',
    budgetNotes: 'Budget: ~€80/head for 30 guests (€2,400 total) — sharing menu, no drinks required',
  },
  {
    category: 'Dinner',
    company: 'Belles Rives',
    contact: 'Lisbeth',
    email: 'labetoulle@bellesrives.com',
    searchTerm: 'belles rives',
    budgetNotes: 'Budget: ~€80/head for 30 guests (€2,400 total)',
  },
  {
    category: 'Dinner',
    company: 'Epi Beach',
    contact: '',
    email: 'reservation.epibeach@gmail.com',
    searchTerm: 'epi beach',
    budgetNotes: 'Budget: ~€80/head for 30 guests (€2,400 total)',
  },
];

// ─── GRAPH API HELPERS ────────────────────────────────────────────

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

async function searchMessages(token: string, q: string): Promise<any[]> {
  try {
    const r = await axios.get(
      `https://graph.microsoft.com/v1.0/me/messages?$search="${encodeURIComponent(q)}"&$top=10&$select=id,subject,from,receivedDateTime,bodyPreview,body`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return r.data.value || [];
  } catch {
    return [];
  }
}

async function getFullMessage(token: string, id: string): Promise<any> {
  const r = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages/${id}?$select=id,subject,from,body,bodyPreview,conversationId`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return r.data;
}

async function replyToMessage(token: string, messageId: string, toEmail: string, toName: string, bodyHtml: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const payload: any = {
    message: {
      toRecipients: [{ emailAddress: { address: toEmail, name: toName } }],
      body: { contentType: 'HTML', content: bodyHtml },
    },
  };
  if (logoB64) {
    payload.message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }
  await axios.post(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}/reply`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function sendNewEmail(token: string, toEmail: string, toName: string, subject: string, bodyHtml: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject,
    body: { contentType: 'HTML', content: bodyHtml },
    toRecipients: [{ emailAddress: { address: toEmail, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };
  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }
  await axios.post(
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── ASSET HELPERS ────────────────────────────────────────────────

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties.</p>
  </div>
</body></html>`;
}

// ─── PRICE EXTRACTION ─────────────────────────────────────────────

function extractPrices(text: string): number[] {
  // Match patterns like €1,500 / 1500€ / EUR 1500 / 1.500 EUR
  const patterns = [
    /€\s*([\d,\.]+)/g,
    /([\d,\.]+)\s*€/g,
    /EUR\s*([\d,\.]+)/gi,
    /([\d,\.]+)\s*EUR/gi,
    /(\d+)\s*euros?/gi,
  ];
  const prices: number[] = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      const raw = m[1].replace(/,/g, '').replace(/\./g, '');
      const n = parseInt(raw, 10);
      if (n > 50 && n < 100000) prices.push(n);
    }
  }
  return [...new Set(prices)];
}

function assessTransportBudget(prices: number[]): { withinBudget: boolean; assessment: string } {
  if (prices.length === 0) return { withinBudget: true, assessment: 'No price mentioned — ask for quote' };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min <= 1500) return { withinBudget: true, assessment: `Quoted from €${min} — within budget` };
  return { withinBudget: false, assessment: `Quoted from €${min}–€${max} — over €1,500 budget` };
}

function assessDinnerBudget(prices: number[]): { withinBudget: boolean; assessment: string } {
  if (prices.length === 0) return { withinBudget: true, assessment: 'No price mentioned — ask for quote' };
  // Check per-head prices (< 500) and total prices (>= 500)
  const perHead = prices.filter(p => p < 300);
  const totals = prices.filter(p => p >= 300);
  if (perHead.length > 0) {
    const min = Math.min(...perHead);
    if (min <= 90) return { withinBudget: true, assessment: `~€${min}/head — within budget` };
    return { withinBudget: false, assessment: `~€${min}/head — over €80/head budget` };
  }
  if (totals.length > 0) {
    const min = Math.min(...totals);
    if (min <= 2700) return { withinBudget: true, assessment: `Total from €${min} — within range for 30 guests` };
    return { withinBudget: false, assessment: `Total from €${min} — over €2,400 budget` };
  }
  return { withinBudget: true, assessment: 'Price unclear — ask for quote' };
}

// ─── REPLY TEMPLATES ──────────────────────────────────────────────

function transportInvoiceRequest(contactName: string): string {
  const greeting = contactName ? `Hi ${contactName},` : 'Hi there,';
  return `${greeting}

Thank you so much for getting back to us.

We have reviewed your proposal and we would love to move forward. Please go ahead and send the invoice over and we will get back to you promptly.

Please address the invoice to:

Amber Jacobs
19 Chemin du Vivier
Grasse
Alpes-Maritimes 06130
France

Looking forward to working with you.`;
}

function transportQuoteRequest(contactName: string): string {
  const greeting = contactName ? `Hi ${contactName},` : 'Hi there,';
  return `${greeting}

Thank you for getting back to us.

We are finalising our transport arrangements for the Indvstry Power House activation at Cannes Lions 2026 (16-20 June) and would love to understand your pricing in more detail.

We are looking for a full-service package for approximately 10-15 guests: airport pickups, daily transfers between Grasse and Cannes, and any ad hoc runs over the 5 days.

Our budget sits in the region of €1,000 to €1,500 for the full package. Could you confirm whether this is achievable and send across a formal quote or invoice for us to review?

Looking forward to hearing from you.`;
}

function dinnerQuoteRequest(contactName: string, company: string): string {
  const greeting = contactName ? `Hi ${contactName},` : 'Hi there,';
  return `${greeting}

Thank you so much for your response regarding our dinner enquiry.

We are organising a private dinner for approximately 30 guests as part of the Indvstry Power House activation at Cannes Lions 2026, and ${company} sounds like a wonderful fit for what we have in mind.

Our budget is around €80 per head for a sharing-style dinner menu (drinks and service not included at this stage). Could you put together a formal quote or invoice based on this, so we can review and confirm?

We are targeting a date around 17-19 June 2026 and would love to lock something in as soon as possible.

Looking forward to hearing from you.`;
}

// ─── CSV GENERATION ───────────────────────────────────────────────

function generateCsv(records: VendorRecord[]): string {
  const headers = ['Category', 'Company', 'Contact', 'Email', 'Status', 'Quote / Price', 'Notes'];
  const rows = records.map(r => [
    r.category,
    r.company,
    r.contact,
    r.email,
    r.status,
    r.quote,
    r.notes,
  ].map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  console.log('🌅 Morning outreach follow-up script starting...\n');

  const token = await getToken();
  const results: VendorRecord[] = [...knownRecords];

  for (const vendor of vendorsToCheck) {
    console.log(`\n── Checking: ${vendor.company} (${vendor.searchTerm})`);

    const msgs = await searchMessages(token, vendor.searchTerm);

    // Filter to replies from external senders (not our own sent emails)
    const replies = msgs.filter(m => {
      const fromAddr: string = m.from?.emailAddress?.address || '';
      return !fromAddr.toLowerCase().includes('indvstryclvb') &&
             !fromAddr.toLowerCase().includes('access@') &&
             fromAddr.length > 0;
    });

    if (replies.length === 0) {
      console.log(`   No reply found from ${vendor.company}`);
      results.push({
        category: vendor.category,
        company: vendor.company,
        contact: vendor.contact,
        email: vendor.email,
        status: 'No Reply',
        quote: '',
        notes: 'No reply received to original enquiry.',
      });
      continue;
    }

    // Use the most recent reply
    const latest = replies.sort((a: any, b: any) =>
      new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime()
    )[0];

    const fromAddr: string = latest.from?.emailAddress?.address || vendor.email;
    const fromName: string = latest.from?.emailAddress?.name || vendor.contact;
    const subject: string = latest.subject || '';

    // Get full body
    let fullBody = '';
    try {
      const full = await getFullMessage(token, latest.id);
      // Strip HTML tags for price extraction
      fullBody = (full.body?.content || full.bodyPreview || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&euro;/gi, '€');
    } catch {
      fullBody = latest.bodyPreview || '';
    }

    const prices = extractPrices(fullBody);
    console.log(`   From: ${fromAddr} | Subject: ${subject}`);
    console.log(`   Prices found: ${prices.length > 0 ? prices.map(p => `€${p}`).join(', ') : 'none'}`);

    const assessment =
      vendor.category === 'Transport'
        ? assessTransportBudget(prices)
        : assessDinnerBudget(prices);

    console.log(`   Assessment: ${assessment.assessment}`);

    const replyContact = fromName.split(' ')[0] || vendor.contact;
    const replyEmail = fromAddr || vendor.email;

    if (!replyEmail) {
      console.log(`   No email address found — skipping reply`);
      results.push({
        category: vendor.category,
        company: vendor.company,
        contact: fromName || vendor.contact,
        email: replyEmail,
        status: 'Needs Review',
        quote: prices.length > 0 ? prices.map(p => `€${p}`).join(' / ') : '',
        notes: assessment.assessment + ' — no email found to reply to.',
      });
      continue;
    }

    if (!assessment.withinBudget) {
      console.log(`   Over budget — skipping reply`);
      results.push({
        category: vendor.category,
        company: vendor.company,
        contact: fromName || vendor.contact,
        email: replyEmail,
        status: 'Too Expensive',
        quote: prices.length > 0 ? prices.map(p => `€${p}`).join(' / ') : 'Price in email',
        notes: assessment.assessment,
      });
      continue;
    }

    // Within budget — reply
    let bodyText: string;
    let newStatus: Status;
    let notesText: string;

    if (vendor.category === 'Transport') {
      if (prices.length > 0 && Math.min(...prices) <= 1500) {
        // They gave a price within budget — request invoice
        bodyText = transportInvoiceRequest(replyContact);
        newStatus = 'Invoice Requested';
        notesText = `${assessment.assessment}. Invoice requested, billed to Amber Jacobs, 19 Chemin du Vivier, Grasse.`;
      } else {
        // No price yet — ask for quote
        bodyText = transportQuoteRequest(replyContact);
        newStatus = 'Quote Requested';
        notesText = `${assessment.assessment}. Quote requested.`;
      }
    } else {
      bodyText = dinnerQuoteRequest(replyContact, vendor.company);
      newStatus = 'Quote Requested';
      notesText = `${assessment.assessment}. Quote requested for ~30 guests at €80/head.`;
    }

    try {
      await replyToMessage(token, latest.id, replyEmail, fromName, buildHtml(bodyText));
      console.log(`   Reply sent to ${replyEmail}`);
      results.push({
        category: vendor.category,
        company: vendor.company,
        contact: fromName || vendor.contact,
        email: replyEmail,
        status: newStatus,
        quote: prices.length > 0 ? prices.map(p => `€${p}`).join(' / ') : 'Awaiting quote',
        notes: notesText,
      });
    } catch (err: any) {
      console.error(`   Reply failed: ${err.response?.data?.error?.message || err.message}`);
      results.push({
        category: vendor.category,
        company: vendor.company,
        contact: fromName || vendor.contact,
        email: replyEmail,
        status: 'Needs Review',
        quote: prices.length > 0 ? prices.map(p => `€${p}`).join(' / ') : '',
        notes: `Within budget but reply failed: ${err.message}. Manual follow-up needed.`,
      });
    }

    // Small delay between sends
    await new Promise(r => setTimeout(r, 1500));
  }

  // ─── GENERATE CSV ───────────────────────────────────────────────

  // Sort: Transport first, then Dinner; within each, group by status priority
  const statusOrder: Record<Status, number> = {
    'Locked In': 0,
    'Invoice Requested': 1,
    'Quote Requested': 2,
    'Replying Now': 3,
    'No Availability': 4,
    'Too Expensive': 5,
    'Declined': 6,
    'No Reply': 7,
    'Needs Review': 8,
  };

  results.sort((a, b) => {
    if (a.category !== b.category) return a.category === 'Transport' ? -1 : 1;
    return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
  });

  const csv = generateCsv(results);
  const csvPath = path.resolve(__dirname, '../../cannes-outreach-status.csv');
  fs.writeFileSync(csvPath, csv, 'utf-8');
  console.log(`\n📊 CSV saved to: ${csvPath}`);

  // ─── EMAIL CSV TO GEORGE ─────────────────────────────────────────

  const founderEmail = process.env.FOUNDER_EMAIL;
  if (!founderEmail) {
    console.log('⚠️  FOUNDER_EMAIL not set — skipping email to George. CSV saved locally.');
    return;
  }

  const summary = {
    lockedIn: results.filter(r => r.status === 'Locked In').length,
    invoiceRequested: results.filter(r => r.status === 'Invoice Requested').length,
    quoteRequested: results.filter(r => r.status === 'Quote Requested').length,
    tooExpensive: results.filter(r => r.status === 'Too Expensive').length,
    noAvailability: results.filter(r => r.status === 'No Availability').length,
    noReply: results.filter(r => r.status === 'No Reply').length,
    declined: results.filter(r => r.status === 'Declined').length,
    needsReview: results.filter(r => r.status === 'Needs Review').length,
  };

  const transportLocked = results.find(r => r.category === 'Transport' && r.status === 'Locked In');
  const transportInvoice = results.filter(r => r.category === 'Transport' && r.status === 'Invoice Requested').map(r => r.company).join(', ');
  const dinnerInvoice = results.filter(r => r.category === 'Dinner' && r.status === 'Invoice Requested').map(r => r.company).join(', ');
  const dinnerQuotes = results.filter(r => r.category === 'Dinner' && r.status === 'Quote Requested').map(r => r.company).join(', ');
  const transportQuotes = results.filter(r => r.category === 'Transport' && r.status === 'Quote Requested').map(r => r.company).join(', ');

  const emailBody = `Hi George,

Morning. Here is the full status update on all transport and dinner venue outreach for the Cannes Power House activation.

TRANSPORT SUMMARY
Transport is looking solid. ${transportLocked ? `${transportLocked.company} is locked in at ${transportLocked.quote}.` : ''} ${transportInvoice ? `Invoices also requested from: ${transportInvoice}.` : ''} ${transportQuotes ? `Quotes requested from: ${transportQuotes}.` : ''}

DINNER SUMMARY
${dinnerInvoice ? `Invoices awaiting from: ${dinnerInvoice}.` : ''}${dinnerQuotes ? ` Quotes requested this morning from: ${dinnerQuotes}.` : ''}

FULL BREAKDOWN
Locked In:         ${summary.lockedIn}
Invoice Requested: ${summary.invoiceRequested}
Quote Requested:   ${summary.quoteRequested}
Too Expensive:     ${summary.tooExpensive}
No Availability:   ${summary.noAvailability}
No Reply:          ${summary.noReply}
Declined:          ${summary.declined}
Needs Review:      ${summary.needsReview}

Full details are in the attached spreadsheet.

Amber`;

  // Attach CSV
  const csvBase64 = Buffer.from(csv).toString('base64');
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: 'Cannes outreach status update — transport and dinner venues',
    body: { contentType: 'HTML', content: buildHtml(emailBody) },
    toRecipients: [{ emailAddress: { address: founderEmail, name: 'George' } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
    attachments: [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'cannes-outreach-status.csv',
        contentType: 'text/csv',
        contentBytes: csvBase64,
      },
    ],
  };

  if (logoB64) {
    message.attachments.push({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    });
  }

  try {
    await axios.post(
      `https://graph.microsoft.com/v1.0/me/sendMail`,
      { message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log(`✅ Spreadsheet emailed to George at ${founderEmail}`);
  } catch (err: any) {
    console.error('Failed to email George:', err.response?.data?.error?.message || err.message);
    console.log('CSV is saved locally at:', csvPath);
  }

  console.log('\n✅ Morning outreach follow-up complete.');
  console.log(`   Total vendors tracked: ${results.length}`);
}

main().catch(console.error);
