/**
 * Amber Jacobs — End-to-End Test Suite (Vitest)
 * Run: npm test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs';

// ─── TEST DATABASE ────────────────────────────────────────────────
const TEST_DB = path.join(os.tmpdir(), `amber_test_${Date.now()}.db`);
process.env.DB_PATH = TEST_DB;
process.env.AUTO_SEND = 'false';

import { setupDatabase } from '../database/migrations';
import { AmberMemory } from '../agent/memory';
import { startScheduler, runAllTasksNow } from '../tools/scheduler';
import { readUnrepliedEmails, sendPendingEmailFollowUps } from '../integrations/email';
import { processInstagramActivity, sendInstagramWelcomeDMs } from '../integrations/instagram';
import { replyToLinkedInMessages, findCreativeLeads, processLinkedInLeads } from '../integrations/linkedin';
import { processWhatsAppLeads, manageGroupChat, sendProactiveWhatsAppOutreach, sendWhatsAppBroadcast } from '../integrations/whatsapp';

// ─── MOCK AGENT ───────────────────────────────────────────────────

class MockAmberAgent {
  private mem: AmberMemory;
  constructor() { this.mem = new AmberMemory(); }
  getMemory() { return this.mem; }

  async generateResponse(_task: string, _contactId?: number) {
    return { to: 'test@example.com', platform: 'email', subject: 'Test', message: 'Test message from Amber.', tone_notes: 'friendly', requires_approval: true, follow_up_in_days: 3 };
  }

  async handleInbound(incoming: any) {
    const contactId = this.mem.upsertContact({ first_name: incoming.from.first_name || 'Unknown', ...incoming.from, source: incoming.from.source || incoming.platform });
    this.mem.logConversation({ contact_id: contactId, platform: incoming.platform, direction: 'inbound', content: incoming.content, thread_id: incoming.thread_id, message_id: incoming.message_id, needs_reply: true });
    return { to: incoming.from.first_name, platform: incoming.platform, message: 'Hi! Thanks for reaching out to Indvstry Clvb.', tone_notes: 'warm', requires_approval: true };
  }

  async draftOutreach(contact: any, _context: string, platform: string) {
    const contactId = this.mem.upsertContact(contact);
    this.mem.upsertLead(contactId, 'discovered', 10);
    return { to: contact.first_name, platform, message: `Hi ${contact.first_name}, I'd love to tell you about Indvstry Clvb.`, tone_notes: 'outreach', requires_approval: true, follow_up_in_days: 5 };
  }

  async qualifyLead(contact: any) {
    return { score: contact.job_title?.toLowerCase().includes('director') ? 75 : 50, analysis: 'Looks like a creative professional', recommended_action: 'nurture' as const };
  }

  async generateComment(_post: string, _author: string, _platform: string) { return 'Great perspective.'; }

  async processPendingFollowUps() {
    return this.mem.getPendingFollowUps().map(f => ({ to: f.first_name, platform: f.platform, message: `Follow-up for ${f.first_name}`, tone_notes: 'follow-up', requires_approval: true }));
  }

  async welcomeNewMember(contact: any, tier = 'standard') {
    const contactId = this.mem.upsertContact({ ...contact, contact_type: 'member' });
    this.mem.createMember(contactId, tier);
    this.mem.updateOnboardingStage(contactId, 'welcome');
    return { to: contact.first_name, platform: 'email', subject: `Welcome to Indvstry Clvb, ${contact.first_name}`, message: 'Welcome to the club!', tone_notes: 'warm', requires_approval: true };
  }

  close() { this.mem.close(); }
}

// ─── SETUP / TEARDOWN ─────────────────────────────────────────────

beforeAll(() => setupDatabase());
afterAll(() => { try { fs.unlinkSync(TEST_DB); } catch {} });

// ═══════════════════════════════════════════════════════════════════
// 1. DATABASE & MEMORY
// ═══════════════════════════════════════════════════════════════════

describe('1. Database & Memory', () => {
  it('initialises without error', () => {
    expect(() => setupDatabase()).not.toThrow();
  });

  it('upserts and retrieves a contact', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Jordan', email: 'jordan@example.com', job_title: 'Creative Director', source: 'test' });
    expect(id).toBeGreaterThan(0);
    const contact = mem.getContactById(id);
    expect(contact?.first_name).toBe('Jordan');
    expect(contact?.email).toBe('jordan@example.com');
    mem.close();
  });

  it('upsert updates existing contact without duplicating', () => {
    const mem = new AmberMemory();
    const id1 = mem.upsertContact({ first_name: 'Sam', email: 'sam@example.com', source: 'test' });
    const id2 = mem.upsertContact({ first_name: 'Sam Updated', email: 'sam@example.com', source: 'test' });
    expect(id1).toBe(id2);
    expect(mem.getContactById(id1)?.first_name).toBe('Sam Updated');
    mem.close();
  });

  it('logs and retrieves a conversation', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Alex', email: 'alex@example.com', source: 'test' });
    mem.logConversation({ contact_id: id, platform: 'email', direction: 'inbound', content: 'Hey, I heard about Indvstry Clvb!', needs_reply: true });
    const history = mem.getContactHistory(id);
    expect(history).toHaveLength(1);
    expect(history[0].platform).toBe('email');
    mem.close();
  });

  it('builds contact context string', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Taylor', email: 'taylor@example.com', job_title: 'Filmmaker', source: 'test' });
    mem.logConversation({ contact_id: id, platform: 'instagram', direction: 'inbound', content: 'Love your content!' });
    const ctx = mem.buildContactContext(id);
    expect(ctx).toContain('Taylor');
    expect(ctx).toContain('Filmmaker');
    expect(ctx).toContain('Love your content');
    mem.close();
  });

  it('schedules and retrieves a follow-up', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Riley', email: 'riley@example.com', source: 'test' });
    const past = new Date(Date.now() - 60000);
    mem.scheduleFollowUp(id, 'email', 'check_in', 'Check in with Riley', past);
    const pending = mem.getPendingFollowUps();
    expect(pending.length).toBeGreaterThanOrEqual(1);
    expect(pending[0].first_name).toBe('Riley');
    mem.close();
  });

  it('marks a follow-up as complete', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Casey', email: 'casey@example.com', source: 'test' });
    const followUpId = mem.scheduleFollowUp(id, 'email', 'check_in', 'Check in', new Date(Date.now() - 60000));
    mem.markFollowUpComplete(followUpId);
    const still = mem.getPendingFollowUps().find(f => f.id === followUpId);
    expect(still).toBeUndefined();
    mem.close();
  });

  it('upserts a lead', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Morgan', email: 'morgan@example.com', source: 'test' });
    expect(() => mem.upsertLead(id, 'discovered', 40)).not.toThrow();
    expect(() => mem.upsertLead(id, 'engaged', 65)).not.toThrow();
    mem.close();
  });

  it('creates a member and updates onboarding stage', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Drew', email: 'drew@example.com', source: 'test' });
    mem.createMember(id, 'pro');
    mem.updateOnboardingStage(id, 'intro_sent');
    expect(mem.getContactById(id)?.contact_type).toBe('member');
    mem.close();
  });

  it('fills a template with variables', () => {
    const mem = new AmberMemory();
    const result = mem.fillTemplate('member_welcome', { first_name: 'Jamie', club_url: 'indvstryclvb.com', membership_tier: 'standard' });
    expect(result).not.toBeNull();
    expect(result!.content).toContain('Jamie');
    mem.close();
  });

  it('logs an activity without throwing', () => {
    const mem = new AmberMemory();
    const id = mem.upsertContact({ first_name: 'Reese', email: 'reese@example.com', source: 'test' });
    expect(() => mem.logActivity('test_action', 'email', id, { detail: 'e2e' })).not.toThrow();
    mem.close();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. AGENT WORKFLOWS (MOCKED)
// ═══════════════════════════════════════════════════════════════════

describe('2. Agent Workflows (mocked AI)', () => {
  it('initialises MockAmberAgent', () => {
    const agent = new MockAmberAgent();
    expect(agent.getMemory()).toBeTruthy();
    agent.close();
  });

  it('handleInbound creates contact and logs conversation', async () => {
    const agent = new MockAmberAgent();
    const response = await agent.handleInbound({ platform: 'email', from: { first_name: 'Nova', email: 'nova@studio.com', source: 'email_inbound' }, content: 'Hi! I want to learn more.' });
    expect(response.message.length).toBeGreaterThan(0);
    const contact = agent.getMemory().findContact({ email: 'nova@studio.com' });
    expect(contact).toBeTruthy();
    expect(agent.getMemory().getContactHistory(contact!.id!)).toHaveLength(1);
    agent.close();
  });

  it('handleInbound on Instagram stores handle', async () => {
    const agent = new MockAmberAgent();
    await agent.handleInbound({ platform: 'instagram', from: { first_name: 'Sol', instagram_handle: '@solcreates', source: 'instagram_dm' }, content: 'What is Indvstry Clvb?' });
    expect(agent.getMemory().findContact({ instagram_handle: '@solcreates' })).toBeTruthy();
    agent.close();
  });

  it('handleInbound on WhatsApp stores number', async () => {
    const agent = new MockAmberAgent();
    await agent.handleInbound({ platform: 'whatsapp', from: { first_name: 'Finn', whatsapp_number: '+447700900001', source: 'whatsapp' }, content: 'Hey!' });
    expect(agent.getMemory().findContact({ whatsapp_number: '+447700900001' })).toBeTruthy();
    agent.close();
  });

  it('handleInbound on LinkedIn stores profile URL', async () => {
    const agent = new MockAmberAgent();
    await agent.handleInbound({ platform: 'linkedin', from: { first_name: 'Ellis', linkedin_url: 'https://linkedin.com/in/ellisdesign', source: 'linkedin_message' }, content: 'Tell me more!' });
    expect(agent.getMemory().findContact({ linkedin_url: 'https://linkedin.com/in/ellisdesign' })).toBeTruthy();
    agent.close();
  });

  it('draftOutreach creates lead and returns message', async () => {
    const agent = new MockAmberAgent();
    const response = await agent.draftOutreach({ first_name: 'Lyra', job_title: 'Creative Director', source: 'test' }, 'Found via Instagram.', 'instagram');
    expect(response.message).toContain('Lyra');
    agent.close();
  });

  it('qualifyLead returns valid score', async () => {
    const agent = new MockAmberAgent();
    const result = await agent.qualifyLead({ first_name: 'Jude', job_title: 'Creative Director', industry: 'Fashion' });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    agent.close();
  });

  it('welcomeNewMember creates member record', async () => {
    const agent = new MockAmberAgent();
    const response = await agent.welcomeNewMember({ first_name: 'Indigo', email: 'indigo@example.com', source: 'test' }, 'pro');
    expect(response.message.length).toBeGreaterThan(0);
    expect(agent.getMemory().findContact({ email: 'indigo@example.com' })?.contact_type).toBe('member');
    agent.close();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. INTEGRATIONS — GRACEFUL DEGRADATION
// ═══════════════════════════════════════════════════════════════════

describe('3. Integrations (no API keys)', () => {
  let mockAgent: any;

  beforeAll(() => {
    mockAgent = new MockAmberAgent();
    delete process.env.GMAIL_CLIENT_ID;
    delete process.env.APIFY_API_KEY;
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.LINKEDIN_LI_AT_COOKIE;
  });

  afterAll(() => mockAgent.close());

  it('readUnrepliedEmails handles missing Gmail credentials', async () => {
    await expect(readUnrepliedEmails(mockAgent)).resolves.not.toThrow();
  });

  it('sendPendingEmailFollowUps exits cleanly with no items', async () => {
    await expect(sendPendingEmailFollowUps(mockAgent)).resolves.not.toThrow();
  });

  it('processInstagramActivity handles missing credentials', async () => {
    await expect(processInstagramActivity(mockAgent)).resolves.not.toThrow();
  });

  it('sendInstagramWelcomeDMs handles missing credentials', async () => {
    await expect(sendInstagramWelcomeDMs(mockAgent)).resolves.not.toThrow();
  });

  it('replyToLinkedInMessages handles missing session cookie', async () => {
    await expect(replyToLinkedInMessages(mockAgent)).resolves.not.toThrow();
  });

  it('findCreativeLeads returns empty array without Apify key', async () => {
    const leads = await findCreativeLeads({ roles: ['designer'], maxResults: 5 });
    expect(Array.isArray(leads)).toBe(true);
    expect(leads.length).toBe(0);
  });

  it('processLinkedInLeads with empty array does nothing', async () => {
    await expect(processLinkedInLeads(mockAgent, [])).resolves.not.toThrow();
  });

  it('processWhatsAppLeads exits cleanly with no follow-ups', async () => {
    await expect(processWhatsAppLeads(mockAgent)).resolves.not.toThrow();
  });

  it('manageGroupChat exits cleanly without WHATSAPP_GROUP_ID', async () => {
    delete process.env.WHATSAPP_GROUP_ID;
    await expect(manageGroupChat(mockAgent)).resolves.not.toThrow();
  });

  it('sendProactiveWhatsAppOutreach exits cleanly with no items', async () => {
    await expect(sendProactiveWhatsAppOutreach(mockAgent)).resolves.not.toThrow();
  });

  it('sendWhatsAppBroadcast to empty list returns zero counts', async () => {
    const result = await sendWhatsAppBroadcast([], 'Test');
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. SCHEDULER
// ═══════════════════════════════════════════════════════════════════

describe('4. Scheduler', () => {
  it('startScheduler registers jobs without throwing', () => {
    const agent = new MockAmberAgent() as any;
    expect(() => startScheduler(agent)).not.toThrow();
    agent.close();
  });

  it('runAllTasksNow completes without throwing', async () => {
    const agent = new MockAmberAgent() as any;
    await expect(runAllTasksNow(agent)).resolves.not.toThrow();
    agent.close();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. FULL FLOWS
// ═══════════════════════════════════════════════════════════════════

describe('5. Full Flows', () => {
  it('new member onboarding: Instagram DM → lead → member', async () => {
    const agent = new MockAmberAgent();
    const mem = agent.getMemory();

    await agent.handleInbound({ platform: 'instagram', from: { first_name: 'Zephyr', instagram_handle: '@zephyr.creates', source: 'instagram_dm' }, content: 'How do I join?' });
    const lead = mem.findContact({ instagram_handle: '@zephyr.creates' });
    expect(lead).toBeTruthy();

    const qualification = await agent.qualifyLead({ ...lead, job_title: 'Art Director', industry: 'Advertising' });
    expect(qualification.score).toBeGreaterThanOrEqual(0);

    const contactId = mem.upsertContact({ ...lead, email: 'zephyr@arthouse.io', job_title: 'Art Director' });
    mem.upsertLead(contactId, 'interested', qualification.score);

    const welcome = await agent.welcomeNewMember({ ...lead, id: contactId, email: 'zephyr@arthouse.io', source: 'instagram_dm' }, 'standard');
    expect(welcome.message.length).toBeGreaterThan(0);

    const ctx = mem.buildContactContext(contactId);
    expect(ctx).toContain('Zephyr');
    expect(ctx).toContain('member');
    agent.close();
  });

  it('LinkedIn lead discovery → qualify → outreach draft', async () => {
    const agent = new MockAmberAgent();
    const qualification = await agent.qualifyLead({ first_name: 'Leo', job_title: 'Creative Director', industry: 'Design' });
    if (qualification.score >= 60) {
      const response = await agent.draftOutreach({ first_name: 'Leo', linkedin_url: 'https://linkedin.com/in/leovance', source: 'linkedin_scrape' }, 'Found on LinkedIn.', 'linkedin');
      expect(response.message.length).toBeGreaterThan(0);
    }
    agent.close();
  });

  it('WhatsApp enquiry → follow-up scheduled → dispatched', async () => {
    const agent = new MockAmberAgent();
    const mem = agent.getMemory();
    await agent.handleInbound({ platform: 'whatsapp', from: { first_name: 'Nico', whatsapp_number: '+447700900099', source: 'whatsapp' }, content: 'Tell me more about Indvstry Clvb?' });
    const contact = mem.findContact({ whatsapp_number: '+447700900099' });
    expect(contact).toBeTruthy();
    mem.scheduleFollowUp(contact!.id!, 'whatsapp', 'check_in', 'Follow up on enquiry', new Date(Date.now() - 1000));
    await expect(processWhatsAppLeads(agent as any)).resolves.not.toThrow();
    agent.close();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. LIVE AI (opt-in)
// ═══════════════════════════════════════════════════════════════════

describe.skipIf(process.env.AMBER_TEST_LIVE !== 'true')('6. Live AI (AMBER_TEST_LIVE=true)', () => {
  it('generateResponse returns structured output', async () => {
    const AmberAgentModule = await import('../agent/amber');
    const agent = new AmberAgentModule.default();
    const response = await agent.generateResponse('Say hello to a new Indvstry Clvb enquiry.');
    expect(response.message.length).toBeGreaterThan(20);
    expect(typeof response.requires_approval).toBe('boolean');
    agent.close();
  });

  it('qualifyLead returns valid score', async () => {
    const AmberAgentModule = await import('../agent/amber');
    const agent = new AmberAgentModule.default();
    const result = await agent.qualifyLead({ first_name: 'River', job_title: 'Creative Director', industry: 'Fashion', bio: 'Shooting campaigns for luxury brands.' });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    agent.close();
  });
});
