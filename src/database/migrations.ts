import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || './amber_memory.db';

export function getDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function setupDatabase(): void {
  console.log('🗄️  Setting up Amber\'s memory database...');
  
  const db = getDatabase();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  db.exec(schema);
  
  // Seed default templates
  seedTemplates(db);
  
  console.log('✅ Database ready at:', DB_PATH);
  db.close();
}

function seedTemplates(db: Database.Database): void {
  const templates = [
    {
      name: 'member_welcome',
      platform: 'email',
      template_type: 'welcome',
      subject: 'Welcome to Indvstry Clvb, {{first_name}} 🖤',
      content: `Hi {{first_name}},

Welcome to Indvstry Clvb — I'm Amber, the community manager here, and I wanted to personally reach out.

You're now part of a private network of creative professionals who are building, collaborating, and pushing culture forward. This is your club.

Here's what to expect next:
• Your member profile is being set up
• You'll receive your onboarding guide within 24 hours
• I'll be in touch to introduce you to members you should know

In the meantime, if you have any questions or want to flag anything, reply directly to this email. I'm always here.

Welcome to the club.

Amber
Community Manager, Indvstry Clvb`,
      variables: '["first_name"]'
    },
    {
      name: 'lead_initial_outreach',
      platform: null,
      template_type: 'outreach',
      subject: 'Thought of you for this',
      content: `Hi {{first_name}},

I came across your work {{context}} and wanted to reach out directly.

I'm Amber — I manage the community at Indvstry Clvb, a digital private members club for creative professionals. We're selective about who we invite in, and your profile caught my attention.

We're building a network where the right people actually get to know each other — through events, introductions, and a space designed around creative work and culture.

I'd love to tell you more. Would you be open to a quick conversation this week?

Amber
Community Manager, Indvstry Clvb
{{club_url}}`,
      variables: '["first_name", "context", "club_url"]'
    },
    {
      name: 'lead_followup_1',
      platform: null,
      template_type: 'followup',
      subject: 'Following up — Indvstry Clvb',
      content: `Hi {{first_name}},

Wanted to follow up on my last message in case it got lost.

I genuinely think you'd be a great fit for what we're building at Indvstry Clvb. We're keeping the community tight and intentional — no noise, just the right people.

Happy to answer any questions or just have a quick chat. No pressure either way.

Amber`,
      variables: '["first_name"]'
    },
    {
      name: 'member_week_checkin',
      platform: 'email',
      template_type: 'check_in',
      subject: 'Checking in — how\'s your first week?',
      content: `Hi {{first_name}},

It's been about a week since you joined Indvstry Clvb — wanted to check in and see how you're settling in.

Have you had a chance to explore the community yet? Is there anyone you'd particularly like an introduction to, or anything you're looking to get out of your membership?

Reply here and I'll make it happen.

Amber`,
      variables: '["first_name"]'
    },
    {
      name: 'instagram_dm_enquiry',
      platform: 'instagram',
      template_type: 'outreach',
      subject: null,
      content: `Hey {{first_name}} 👋 Thanks for reaching out! I'm Amber, community manager at Indvstry Clvb.

{{context}}

Happy to tell you more — what are you working on at the moment?`,
      variables: '["first_name", "context"]'
    },
    {
      name: 'whatsapp_greeting',
      platform: 'whatsapp',
      template_type: 'welcome',
      subject: null,
      content: `Hey {{first_name}} 👋 This is Amber from Indvstry Clvb. Thanks for getting in touch!

{{context}}

How can I help you today?`,
      variables: '["first_name", "context"]'
    }
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO templates (name, platform, template_type, subject, content, variables)
    VALUES (@name, @platform, @template_type, @subject, @content, @variables)
  `);

  for (const template of templates) {
    insert.run(template);
  }
  
  console.log('✅ Default templates seeded');
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}
