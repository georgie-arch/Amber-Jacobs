-- ============================================
-- AMBER JACOBS — PERSISTENT MEMORY DATABASE
-- ============================================

-- Contacts: everyone Amber interacts with
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  linkedin_url TEXT,
  instagram_handle TEXT,
  telegram_id TEXT,
  whatsapp_number TEXT,
  company TEXT,
  job_title TEXT,
  industry TEXT,
  location TEXT,
  bio TEXT,
  contact_type TEXT DEFAULT 'lead', -- 'lead' | 'member' | 'partner' | 'vip'
  status TEXT DEFAULT 'cold',       -- 'cold' | 'warm' | 'hot' | 'active' | 'inactive' | 'declined'
  lead_score INTEGER DEFAULT 0,     -- 0-100
  source TEXT,                      -- 'instagram' | 'linkedin' | 'referral' | 'event' etc
  notes TEXT,
  referred_by INTEGER REFERENCES contacts(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Members: contacts who have joined the club
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id),
  membership_tier TEXT DEFAULT 'standard', -- 'standard' | 'pro' | 'vip'
  join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  renewal_date DATETIME,
  onboarding_stage TEXT DEFAULT 'welcome', -- 'welcome' | 'intro_sent' | 'call_booked' | 'settled'
  onboarding_completed_at DATETIME,
  is_active INTEGER DEFAULT 1,
  membership_notes TEXT
);

-- Conversations: every message Amber sends or receives
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER REFERENCES contacts(id),
  platform TEXT NOT NULL,     -- 'email' | 'linkedin' | 'instagram' | 'whatsapp' | 'telegram'
  direction TEXT NOT NULL,    -- 'inbound' | 'outbound'
  message_type TEXT DEFAULT 'dm', -- 'dm' | 'comment' | 'post' | 'email' | 'story_reply'
  subject TEXT,               -- for emails
  content TEXT NOT NULL,
  thread_id TEXT,             -- platform-specific thread/conversation ID
  message_id TEXT,            -- platform-specific message ID
  is_read INTEGER DEFAULT 0,
  needs_reply INTEGER DEFAULT 0,
  amber_replied INTEGER DEFAULT 0,
  approved_by_george INTEGER DEFAULT 0, -- 0 = pending, 1 = approved, -1 = rejected
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT               -- JSON blob for any extra platform data
);

-- Follow-ups: scheduled actions
CREATE TABLE IF NOT EXISTS followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id),
  platform TEXT NOT NULL,
  task_type TEXT NOT NULL,    -- 'message' | 'email' | 'call_reminder' | 'check_in' | 'onboarding'
  subject TEXT,
  draft_message TEXT,         -- pre-generated draft
  scheduled_for DATETIME NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'sent' | 'skipped' | 'approved'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  notes TEXT
);

-- Leads pipeline
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id),
  pipeline_stage TEXT DEFAULT 'discovered', 
  -- 'discovered' | 'engaged' | 'interested' | 'applied' | 'approved' | 'converted' | 'lost'
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_contact_at DATETIME,
  next_followup_at DATETIME,
  conversion_probability INTEGER DEFAULT 0, -- 0-100
  lost_reason TEXT,
  won_at DATETIME
);

-- Amber's memory / context notes
CREATE TABLE IF NOT EXISTS memory_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER REFERENCES contacts(id),
  note_type TEXT DEFAULT 'general', -- 'preference' | 'interest' | 'personal' | 'business' | 'warning'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  platform TEXT,
  contact_id INTEGER REFERENCES contacts(id),
  details TEXT,               -- JSON
  status TEXT DEFAULT 'success', -- 'success' | 'failed' | 'pending'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Templates: reusable message templates
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  platform TEXT,              -- null = universal
  template_type TEXT,         -- 'welcome' | 'followup' | 'outreach' | 'check_in' | 'decline'
  subject TEXT,               -- for emails
  content TEXT NOT NULL,
  variables TEXT,             -- JSON array of variable names like ["first_name", "membership_tier"]
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_platform ON conversations(platform);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled ON followups(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(pipeline_stage);
