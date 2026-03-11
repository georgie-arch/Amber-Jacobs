import Database from 'better-sqlite3';
import { getDatabase } from '../database/migrations';

export interface Contact {
  id?: number;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  instagram_handle?: string;
  telegram_id?: string;
  whatsapp_number?: string;
  company?: string;
  job_title?: string;
  industry?: string;
  location?: string;
  bio?: string;
  contact_type?: string;
  status?: string;
  lead_score?: number;
  source?: string;
  notes?: string;
}

export interface ConversationEntry {
  contact_id: number;
  platform: string;
  direction: 'inbound' | 'outbound';
  message_type?: string;
  subject?: string;
  content: string;
  thread_id?: string;
  message_id?: string;
  needs_reply?: boolean;
  metadata?: object;
}

export class AmberMemory {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // ─── CONTACT MANAGEMENT ────────────────────────────────────────

  upsertContact(contact: Contact): number {
    const existing = this.findContact(contact);
    
    if (existing) {
      this.db.prepare(`
        UPDATE contacts SET
          first_name = COALESCE(@first_name, first_name),
          last_name = COALESCE(@last_name, last_name),
          email = COALESCE(@email, email),
          phone = COALESCE(@phone, phone),
          linkedin_url = COALESCE(@linkedin_url, linkedin_url),
          instagram_handle = COALESCE(@instagram_handle, instagram_handle),
          telegram_id = COALESCE(@telegram_id, telegram_id),
          whatsapp_number = COALESCE(@whatsapp_number, whatsapp_number),
          company = COALESCE(@company, company),
          job_title = COALESCE(@job_title, job_title),
          industry = COALESCE(@industry, industry),
          location = COALESCE(@location, location),
          bio = COALESCE(@bio, bio),
          notes = COALESCE(@notes, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id}
      `).run(contact);
      return existing.id!;
    } else {
      const result = this.db.prepare(`
        INSERT INTO contacts (first_name, last_name, email, phone, linkedin_url, 
          instagram_handle, telegram_id, whatsapp_number, company, job_title,
          industry, location, bio, contact_type, status, lead_score, source, notes)
        VALUES (@first_name, @last_name, @email, @phone, @linkedin_url,
          @instagram_handle, @telegram_id, @whatsapp_number, @company, @job_title,
          @industry, @location, @bio, @contact_type, @status, @lead_score, @source, @notes)
      `).run({ 
        contact_type: 'lead', status: 'cold', lead_score: 0,
        ...contact 
      });
      return result.lastInsertRowid as number;
    }
  }

  findContact(lookup: Partial<Contact>): Contact | null {
    if (lookup.email) {
      return this.db.prepare('SELECT * FROM contacts WHERE email = ?').get(lookup.email) as Contact | null;
    }
    if (lookup.instagram_handle) {
      return this.db.prepare('SELECT * FROM contacts WHERE instagram_handle = ?').get(lookup.instagram_handle) as Contact | null;
    }
    if (lookup.telegram_id) {
      return this.db.prepare('SELECT * FROM contacts WHERE telegram_id = ?').get(lookup.telegram_id) as Contact | null;
    }
    if (lookup.whatsapp_number) {
      return this.db.prepare('SELECT * FROM contacts WHERE whatsapp_number = ?').get(lookup.whatsapp_number) as Contact | null;
    }
    if (lookup.linkedin_url) {
      return this.db.prepare('SELECT * FROM contacts WHERE linkedin_url = ?').get(lookup.linkedin_url) as Contact | null;
    }
    return null;
  }

  getContactById(id: number): Contact | null {
    return this.db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Contact | null;
  }

  updateContactStatus(contactId: number, status: string, leadScore?: number): void {
    this.db.prepare(`
      UPDATE contacts SET status = ?, lead_score = COALESCE(?, lead_score), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, leadScore ?? null, contactId);
  }

  // ─── CONVERSATION LOGGING ───────────────────────────────────────

  logConversation(entry: ConversationEntry): number {
    const result = this.db.prepare(`
      INSERT INTO conversations (contact_id, platform, direction, message_type, 
        subject, content, thread_id, message_id, needs_reply, metadata, sent_at)
      VALUES (@contact_id, @platform, @direction, @message_type,
        @subject, @content, @thread_id, @message_id, @needs_reply, @metadata, CURRENT_TIMESTAMP)
    `).run({
      message_type: 'dm',
      subject: null,
      thread_id: null,
      message_id: null,
      needs_reply: entry.direction === 'inbound' ? 1 : 0,
      ...entry,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null
    });
    return result.lastInsertRowid as number;
  }

  getContactHistory(contactId: number, limit = 20): any[] {
    return this.db.prepare(`
      SELECT * FROM conversations 
      WHERE contact_id = ? 
      ORDER BY sent_at DESC 
      LIMIT ?
    `).all(contactId, limit) as any[];
  }

  // ─── FULL CONTEXT FOR AMBER ─────────────────────────────────────

  buildContactContext(contactId: number): string {
    const contact = this.getContactById(contactId);
    if (!contact) return 'No contact found in memory.';

    const history = this.getContactHistory(contactId);
    const notes = this.db.prepare(
      'SELECT * FROM memory_notes WHERE contact_id = ? ORDER BY created_at DESC'
    ).all(contactId) as any[];
    const lead = this.db.prepare(
      'SELECT * FROM leads WHERE contact_id = ? ORDER BY discovered_at DESC LIMIT 1'
    ).get(contactId) as any;
    const member = this.db.prepare(
      'SELECT * FROM members WHERE contact_id = ? LIMIT 1'
    ).get(contactId) as any;

    let context = `## Contact: ${contact.first_name} ${contact.last_name || ''}
- Type: ${contact.contact_type} | Status: ${contact.status} | Score: ${contact.lead_score}/100
- Email: ${contact.email || 'unknown'} | Phone: ${contact.phone || 'unknown'}
- Company: ${contact.company || 'unknown'} | Role: ${contact.job_title || 'unknown'}
- Industry: ${contact.industry || 'unknown'} | Location: ${contact.location || 'unknown'}
- Source: ${contact.source || 'unknown'}
${contact.bio ? `- Bio: ${contact.bio}` : ''}
${contact.notes ? `- Notes: ${contact.notes}` : ''}`;

    if (member) {
      context += `\n\n## Member Status
- Tier: ${member.membership_tier} | Joined: ${member.join_date}
- Onboarding: ${member.onboarding_stage}`;
    }

    if (lead) {
      context += `\n\n## Lead Pipeline
- Stage: ${lead.pipeline_stage} | Conversion probability: ${lead.conversion_probability}%
- Last contacted: ${lead.last_contact_at || 'never'}
- Next follow-up: ${lead.next_followup_at || 'not scheduled'}`;
    }

    if (notes.length > 0) {
      context += `\n\n## Memory Notes`;
      notes.forEach(n => {
        context += `\n- [${n.note_type}] ${n.content}`;
      });
    }

    if (history.length > 0) {
      context += `\n\n## Conversation History (most recent first)`;
      history.slice(0, 10).forEach(msg => {
        context += `\n[${msg.sent_at}] ${msg.direction.toUpperCase()} via ${msg.platform}`;
        if (msg.subject) context += ` | Subject: ${msg.subject}`;
        context += `\n"${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}"`;
      });
    } else {
      context += `\n\n## Conversation History\nNo previous conversations logged.`;
    }

    return context;
  }

  // ─── MEMORY NOTES ───────────────────────────────────────────────

  addNote(contactId: number, content: string, noteType = 'general'): void {
    this.db.prepare(`
      INSERT INTO memory_notes (contact_id, note_type, content)
      VALUES (?, ?, ?)
    `).run(contactId, noteType, content);
  }

  // ─── FOLLOW-UP MANAGEMENT ───────────────────────────────────────

  scheduleFollowUp(contactId: number, platform: string, taskType: string, 
    draftMessage: string, scheduledFor: Date, subject?: string): number {
    const result = this.db.prepare(`
      INSERT INTO followups (contact_id, platform, task_type, subject, draft_message, scheduled_for)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(contactId, platform, taskType, subject || null, draftMessage, scheduledFor.toISOString());
    return result.lastInsertRowid as number;
  }

  getPendingFollowUps(): any[] {
    return this.db.prepare(`
      SELECT f.*, c.first_name, c.last_name, c.email, c.instagram_handle, 
             c.whatsapp_number, c.telegram_id
      FROM followups f
      JOIN contacts c ON f.contact_id = c.id
      WHERE f.status = 'pending' 
        AND f.scheduled_for <= datetime('now')
      ORDER BY f.scheduled_for ASC
    `).all() as any[];
  }

  markFollowUpComplete(followUpId: number): void {
    this.db.prepare(`
      UPDATE followups SET status = 'sent', completed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(followUpId);
  }

  // ─── LEADS ──────────────────────────────────────────────────────

  upsertLead(contactId: number, stage: string, probability?: number): void {
    const existing = this.db.prepare(
      'SELECT id FROM leads WHERE contact_id = ?'
    ).get(contactId) as any;

    if (existing) {
      this.db.prepare(`
        UPDATE leads SET pipeline_stage = ?, 
          conversion_probability = COALESCE(?, conversion_probability),
          last_contact_at = CURRENT_TIMESTAMP
        WHERE contact_id = ?
      `).run(stage, probability ?? null, contactId);
    } else {
      this.db.prepare(`
        INSERT INTO leads (contact_id, pipeline_stage, conversion_probability)
        VALUES (?, ?, ?)
      `).run(contactId, stage, probability || 10);
    }
  }

  // ─── MEMBERS ────────────────────────────────────────────────────

  createMember(contactId: number, tier = 'standard'): number {
    // Update contact type
    this.db.prepare(
      'UPDATE contacts SET contact_type = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run('member', 'active', contactId);

    const result = this.db.prepare(`
      INSERT OR IGNORE INTO members (contact_id, membership_tier)
      VALUES (?, ?)
    `).run(contactId, tier);
    
    return result.lastInsertRowid as number;
  }

  updateOnboardingStage(contactId: number, stage: string): void {
    this.db.prepare(`
      UPDATE members SET onboarding_stage = ?,
        onboarding_completed_at = CASE WHEN ? = 'settled' THEN CURRENT_TIMESTAMP ELSE onboarding_completed_at END
      WHERE contact_id = ?
    `).run(stage, stage, contactId);
  }

  // ─── TEMPLATES ──────────────────────────────────────────────────

  getTemplate(name: string): any {
    return this.db.prepare('SELECT * FROM templates WHERE name = ? AND is_active = 1').get(name);
  }

  fillTemplate(templateName: string, variables: Record<string, string>): { subject?: string; content: string } | null {
    const template = this.getTemplate(templateName);
    if (!template) return null;

    let content = template.content;
    let subject = template.subject;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
      if (subject) subject = subject.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject: subject || undefined, content };
  }

  // ─── LOGGING ────────────────────────────────────────────────────

  logActivity(action: string, platform?: string, contactId?: number, details?: object): void {
    this.db.prepare(`
      INSERT INTO activity_log (action, platform, contact_id, details)
      VALUES (?, ?, ?, ?)
    `).run(action, platform || null, contactId || null, details ? JSON.stringify(details) : null);
  }

  close(): void {
    this.db.close();
  }
}

export default AmberMemory;
