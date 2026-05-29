/**
 * Inbox Manager for access@indvstryclvb.com
 *
 * Runs via: npm run inbox:manage
 * Scheduled: daily via scheduler.ts
 *
 * What it does:
 *  - Archives promotional emails
 *  - Creates "Potential Events" folder for generic event invites
 *  - Leaves personally-directed invites in inbox
 *  - Archives all unread + promotional emails from 2025
 *  - Silences Nas.io entirely (marks read, archives)
 *  - Logs DEPT Agency emails for George's manual approval gate
 */

import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Senders we never reply to — archive silently
const SILENT_DOMAINS = ['nas.io', 'nas.io'];

// Senders that always require George's approval before any reply
// (reply gate enforced in email.ts — here we just log them)
export const APPROVAL_REQUIRED_DOMAINS = ['dept.com', 'deptagency.com'];

interface EmailSummary {
  id: string;
  subject: string;
  from: string;
  fromName: string;
  preview: string;
  receivedYear: number;
  isRead: boolean;
}

interface Classification {
  isPromotional: boolean;
  isEventInvite: boolean;
  isPersonallyDirected: boolean;
}

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const res = await axios.post(
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
  return res.data.access_token;
}

async function getOrCreateFolder(token: string, name: string): Promise<string> {
  const res = await axios.get('https://graph.microsoft.com/v1.0/me/mailFolders', {
    headers: { Authorization: `Bearer ${token}` },
    params: { $top: 100 },
  });
  const existing = (res.data.value || []).find(
    (f: any) => f.displayName.toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing.id;

  const create = await axios.post(
    'https://graph.microsoft.com/v1.0/me/mailFolders',
    { displayName: name },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  console.log(`  Created folder: "${name}"`);
  return create.data.id;
}

async function getArchiveFolderId(token: string): Promise<string> {
  try {
    const res = await axios.get('https://graph.microsoft.com/v1.0/me/mailFolders/archive', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.id;
  } catch {
    return getOrCreateFolder(token, 'Archive');
  }
}

async function moveMessage(token: string, messageId: string, folderId: string): Promise<void> {
  await axios.post(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}/move`,
    { destinationId: folderId },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function markRead(token: string, messageId: string): Promise<void> {
  await axios.patch(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
    { isRead: true },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// Classify a batch of emails with a single Claude call (efficient)
async function classifyBatch(emails: EmailSummary[]): Promise<Classification[]> {
  const list = emails
    .map(
      (e, i) =>
        `Email ${i + 1}:\nFrom: ${e.fromName} <${e.from}>\nSubject: ${e.subject}\nPreview: ${e.preview.substring(0, 250)}`
    )
    .join('\n---\n');

  const prompt = `Classify these ${emails.length} emails for inbox management. Return a JSON array, one object per email in order.

${list}

Return ONLY a JSON array:
[{"isPromotional":bool,"isEventInvite":bool,"isPersonallyDirected":bool},...]

Definitions:
- isPromotional: mass marketing, newsletters, service updates, promo blasts
- isEventInvite: contains an invitation to attend a specific event
- isPersonallyDirected: genuinely addressed to this specific person/company (not a mass-blast template)`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const json = text.match(/\[[\s\S]*\]/)?.[0] || '[]';
    const parsed: Classification[] = JSON.parse(json);
    // Ensure array length matches input
    while (parsed.length < emails.length)
      parsed.push({ isPromotional: false, isEventInvite: false, isPersonallyDirected: false });
    return parsed.slice(0, emails.length);
  } catch {
    return emails.map(() => ({ isPromotional: false, isEventInvite: false, isPersonallyDirected: false }));
  }
}

async function manageInbox(): Promise<void> {
  console.log('\nInbox Manager — access@indvstryclvb.com');
  console.log('==========================================');

  const token = await getAccessToken();
  console.log('Authenticated with Microsoft Graph.\n');

  const [potentialEventsFolderId, archiveFolderId] = await Promise.all([
    getOrCreateFolder(token, 'Potential Events'),
    getArchiveFolderId(token),
  ]);
  console.log('Folders ready.\n');

  const stats = {
    archived: 0,
    movedToEvents: 0,
    keptInInbox: 0,
    nasSilenced: 0,
    deptFlagged: 0,
    skipped: 0,
  };

  // Fetch inbox messages — process up to 200 per run
  let nextLink: string | null =
    'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages' +
    '?$top=50&$select=id,subject,from,toRecipients,receivedDateTime,isRead,bodyPreview' +
    '&$orderby=receivedDateTime desc';

  let pagesProcessed = 0;

  while (nextLink && pagesProcessed < 4) {
    const res: any = await axios.get(nextLink, { headers: { Authorization: `Bearer ${token}` } });
    const messages: any[] = res.data.value || [];
    nextLink = res.data['@odata.nextLink'] || null;
    pagesProcessed++;

    if (messages.length === 0) break;

    // Split into three tracks before classification
    const toClassify: { msg: any; email: EmailSummary }[] = [];

    for (const msg of messages) {
      const fromEmail = (msg.from?.emailAddress?.address || '').toLowerCase();
      const fromDomain = fromEmail.split('@')[1] || '';
      const received = new Date(msg.receivedDateTime || '');
      const year = received.getFullYear();

      const email: EmailSummary = {
        id: msg.id,
        subject: msg.subject || '(no subject)',
        from: fromEmail,
        fromName: msg.from?.emailAddress?.name || '',
        preview: msg.bodyPreview || '',
        receivedYear: year,
        isRead: msg.isRead || false,
      };

      // Track 1: Nas.io — silence and archive immediately, no reply ever
      if (SILENT_DOMAINS.some(d => fromDomain.includes(d))) {
        await markRead(token, msg.id);
        await moveMessage(token, msg.id, archiveFolderId);
        stats.nasSilenced++;
        console.log(`  [Nas.io] Archived: ${email.subject}`);
        continue;
      }

      // Track 2: DEPT Agency — leave in inbox, just log for George
      if (APPROVAL_REQUIRED_DOMAINS.some(d => fromDomain.includes(d))) {
        stats.deptFlagged++;
        console.log(`  [DEPT Agency] Flagged for George approval: ${email.subject}`);
        continue;
      }

      // Track 3: 2025 unread emails — archive without classification
      if (year === 2025 && !email.isRead) {
        await markRead(token, msg.id);
        await moveMessage(token, msg.id, archiveFolderId);
        stats.archived++;
        console.log(`  [2025 unread] Archived: ${email.from} — ${email.subject}`);
        continue;
      }

      // Everything else — classify with Claude
      toClassify.push({ msg, email });
    }

    // Batch classify in groups of 20
    const BATCH = 20;
    for (let i = 0; i < toClassify.length; i += BATCH) {
      const chunk = toClassify.slice(i, i + BATCH);
      const classifications = await classifyBatch(chunk.map(c => c.email));

      for (let j = 0; j < chunk.length; j++) {
        const { msg, email } = chunk[j];
        const c = classifications[j];
        const is2025Promo = email.receivedYear === 2025 && c.isPromotional;

        if (is2025Promo) {
          // 2025 promotional email — archive
          await markRead(token, msg.id);
          await moveMessage(token, msg.id, archiveFolderId);
          stats.archived++;
          console.log(`  [2025 promo] Archived: ${email.from} — ${email.subject}`);
        } else if (c.isEventInvite && !c.isPersonallyDirected) {
          // Generic event invite — move to Potential Events
          await moveMessage(token, msg.id, potentialEventsFolderId);
          stats.movedToEvents++;
          console.log(`  [Event invite] Potential Events: ${email.subject}`);
        } else if (c.isPromotional && !c.isEventInvite) {
          // Pure promotional — archive
          await moveMessage(token, msg.id, archiveFolderId);
          stats.archived++;
          console.log(`  [Promo] Archived: ${email.from} — ${email.subject}`);
        } else if (c.isEventInvite && c.isPersonallyDirected) {
          // Personal invite — stays in inbox
          stats.keptInInbox++;
          console.log(`  [Personal invite] Keeping in inbox: ${email.subject}`);
        } else {
          stats.skipped++;
        }
      }
    }

    if (!nextLink || messages.length < 50) break;
  }

  console.log('\n==========================================');
  console.log('Done.\n');
  console.log(`  Archived (promo/old):      ${stats.archived}`);
  console.log(`  Moved to Potential Events: ${stats.movedToEvents}`);
  console.log(`  Kept in inbox (personal):  ${stats.keptInInbox}`);
  console.log(`  Nas.io silenced:           ${stats.nasSilenced}`);
  console.log(`  DEPT Agency flagged:       ${stats.deptFlagged}`);
  console.log(`  Left as-is:                ${stats.skipped}`);
  console.log('');

  if (stats.deptFlagged > 0) {
    console.log(
      `  Note: ${stats.deptFlagged} DEPT Agency email(s) left in inbox — Amber will request George's approval before replying.`
    );
  }
}

manageInbox().catch(err => {
  console.error('Inbox manager failed:', err?.response?.data || err.message);
  process.exit(1);
});
