import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || './amber_memory.db';

function pad(str: string, len: number): string {
  return str.substring(0, len).padEnd(len);
}

function hr(len = 80): void {
  console.log('─'.repeat(len));
}

function viewMemory(): void {
  let db: Database.Database;

  try {
    db = new Database(DB_PATH, { readonly: true });
  } catch {
    console.log(`\n⚠️  No database found at: ${DB_PATH}`);
    console.log('Run "npm run db:setup" first.\n');
    process.exit(1);
  }

  console.log(`\n${'═'.repeat(80)}`);
  console.log('  AMBER JACOBS — MEMORY VIEWER');
  console.log(`  Database: ${DB_PATH}`);
  console.log(`${'═'.repeat(80)}\n`);

  // ─── STATS ────────────────────────────────────────────────────
  const stats = {
    contacts: (db.prepare('SELECT COUNT(*) as c FROM contacts').get() as any).c,
    members: (db.prepare('SELECT COUNT(*) as c FROM members WHERE is_active = 1').get() as any).c,
    leads: (db.prepare('SELECT COUNT(*) as c FROM leads').get() as any).c,
    conversations: (db.prepare('SELECT COUNT(*) as c FROM conversations').get() as any).c,
    pendingFollowUps: (db.prepare("SELECT COUNT(*) as c FROM followups WHERE status = 'pending'").get() as any).c,
    pendingReplies: (db.prepare("SELECT COUNT(*) as c FROM conversations WHERE needs_reply = 1 AND amber_replied = 0").get() as any).c
  };

  console.log('📊 OVERVIEW');
  hr();
  console.log(`  Contacts:          ${stats.contacts}`);
  console.log(`  Active Members:    ${stats.members}`);
  console.log(`  Leads in pipeline: ${stats.leads}`);
  console.log(`  Total messages:    ${stats.conversations}`);
  console.log(`  Pending replies:   ${stats.pendingReplies}`);
  console.log(`  Scheduled tasks:   ${stats.pendingFollowUps}`);

  // ─── CONTACTS ─────────────────────────────────────────────────
  const contacts = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM conversations WHERE contact_id = c.id) as msg_count
    FROM contacts c
    ORDER BY c.updated_at DESC
    LIMIT 20
  `).all() as any[];

  if (contacts.length > 0) {
    console.log(`\n\n👥 CONTACTS (latest 20)`);
    hr();
    console.log(`${pad('Name', 22)} ${pad('Type', 10)} ${pad('Status', 10)} ${pad('Source', 14)} ${'Msgs'}`);
    hr();
    for (const c of contacts) {
      const name = `${c.first_name} ${c.last_name || ''}`.trim();
      console.log(`${pad(name, 22)} ${pad(c.contact_type || '-', 10)} ${pad(c.status || '-', 10)} ${pad(c.source || '-', 14)} ${c.msg_count}`);
    }
  }

  // ─── RECENT CONVERSATIONS ─────────────────────────────────────
  const conversations = db.prepare(`
    SELECT cv.*, c.first_name, c.last_name
    FROM conversations cv
    JOIN contacts c ON cv.contact_id = c.id
    ORDER BY cv.sent_at DESC
    LIMIT 10
  `).all() as any[];

  if (conversations.length > 0) {
    console.log(`\n\n💬 RECENT CONVERSATIONS (latest 10)`);
    hr();
    for (const m of conversations) {
      const name = `${m.first_name} ${m.last_name || ''}`.trim();
      const dir = m.direction === 'inbound' ? '←' : '→';
      const preview = (m.content || '').substring(0, 60).replace(/\n/g, ' ');
      console.log(`  ${dir} [${m.sent_at?.substring(0, 16)}] ${pad(name, 18)} via ${pad(m.platform, 12)} "${preview}..."`);
    }
  }

  // ─── PENDING FOLLOW-UPS ────────────────────────────────────────
  const followUps = db.prepare(`
    SELECT f.*, c.first_name, c.last_name
    FROM followups f
    JOIN contacts c ON f.contact_id = c.id
    WHERE f.status = 'pending'
    ORDER BY f.scheduled_for ASC
    LIMIT 10
  `).all() as any[];

  if (followUps.length > 0) {
    console.log(`\n\n📋 PENDING FOLLOW-UPS`);
    hr();
    for (const f of followUps) {
      const name = `${f.first_name} ${f.last_name || ''}`.trim();
      const overdue = new Date(f.scheduled_for) < new Date() ? ' ⚠️  OVERDUE' : '';
      console.log(`  [${f.scheduled_for?.substring(0, 16)}] ${pad(name, 20)} via ${pad(f.platform, 12)} — ${f.task_type}${overdue}`);
    }
  }

  // ─── LEAD PIPELINE ────────────────────────────────────────────
  const pipeline = db.prepare(`
    SELECT l.pipeline_stage, COUNT(*) as count
    FROM leads l
    GROUP BY l.pipeline_stage
    ORDER BY count DESC
  `).all() as any[];

  if (pipeline.length > 0) {
    console.log(`\n\n🔍 LEAD PIPELINE`);
    hr();
    for (const p of pipeline) {
      const bar = '█'.repeat(Math.min(p.count, 40));
      console.log(`  ${pad(p.pipeline_stage, 14)} ${bar} ${p.count}`);
    }
  }

  console.log(`\n${'═'.repeat(80)}\n`);
  db.close();
}

viewMemory();
