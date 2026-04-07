import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import AmberAgent from '../agent/amber';
import { logger } from '../utils/logger';
import { findEmailMultiProvider } from './email-enrichment';
import { extractDomain } from './hunter';

dotenv.config();

// ─────────────────────────────────────────────────────────────────
// LINKEDIN OAUTH2
// ─────────────────────────────────────────────────────────────────

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

/**
 * Step 1 — Generate the URL to redirect the user to for LinkedIn login.
 * Open this in a browser, log in, and copy the `code` param from the redirect URL.
 */
export function getLinkedInAuthUrl(redirectUri: string, scopes = ['openid', 'profile', 'email']): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID || '',
    redirect_uri: redirectUri,
    scope: scopes.join(' ')
  });
  const url = `${LINKEDIN_AUTH_URL}?${params.toString()}`;
  logger.info('🔗 Open this URL in your browser to authorise LinkedIn:\n' + url);
  return url;
}

/**
 * Step 2 — Exchange the auth code (from the redirect) for an access token.
 * Saves LINKEDIN_ACCESS_TOKEN and LINKEDIN_TOKEN_EXPIRY back into .env automatically.
 */
export async function exchangeLinkedInCode(code: string, redirectUri: string): Promise<string | null> {
  try {
    const response = await axios.post(
      LINKEDIN_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || ''
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, expires_in } = response.data;
    const expiry = Date.now() + expires_in * 1000;

    // Persist token into .env
    persistEnvValue('LINKEDIN_ACCESS_TOKEN', access_token);
    persistEnvValue('LINKEDIN_TOKEN_EXPIRY', String(expiry));

    process.env.LINKEDIN_ACCESS_TOKEN = access_token;
    process.env.LINKEDIN_TOKEN_EXPIRY = String(expiry);

    logger.info(`✅ LinkedIn access token obtained. Expires in ${Math.round(expires_in / 3600)}h`);
    return access_token;
  } catch (error: any) {
    logger.error('LinkedIn token exchange failed:', error?.response?.data || error);
    return null;
  }
}

/**
 * Step 3 — Verify the token works by fetching Amber's LinkedIn profile.
 */
export async function getLinkedInMe(): Promise<any | null> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    logger.warn('LINKEDIN_ACCESS_TOKEN not set — run exchangeLinkedInCode() first');
    return null;
  }

  try {
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    logger.info('✅ LinkedIn /v2/me:', response.data);
    return response.data;
  } catch (error: any) {
    logger.error('LinkedIn /v2/me failed:', error?.response?.data || error);
    return null;
  }
}

// ─── HELPER: write a key=value line into .env ────────────────────

function persistEnvValue(key: string, value: string): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  let contents = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');

  if (regex.test(contents)) {
    contents = contents.replace(regex, `${key}=${value}`);
  } else {
    contents += `\n${key}=${value}`;
  }

  fs.writeFileSync(envPath, contents, 'utf8');
}


// ─────────────────────────────────────────────────────────────────
// LINKEDIN INTEGRATION
//
// LinkedIn has strict anti-scraping measures. Two approaches:
// A) Apify (recommended) - managed scraping service
// B) RapidAPI LinkedIn endpoints - API-based
// C) LinkedIn Official API (requires partnership - most restrictive)
//
// For messaging: Requires session cookie (li_at) from logged-in account
// ─────────────────────────────────────────────────────────────────

// ─── LEAD SCRAPING VIA APIFY ────────────────────────────────────

export interface LinkedInProfile {
  name: string;
  firstName: string;
  lastName: string;
  headline: string;
  company: string;
  location: string;
  profileUrl: string;
  connections: number;
  about: string;
  industry: string;
  email?: string;
}

export async function scrapeLinkedInProfiles(searchQuery: string, maxResults = 20): Promise<LinkedInProfile[]> {
  // Using Apify's LinkedIn scraper
  if (!process.env.APIFY_API_KEY) {
    logger.warn('APIFY_API_KEY not set — LinkedIn scraping disabled');
    return [];
  }

  try {
    logger.info(`🔍 Scraping LinkedIn for: ${searchQuery}`);
    
    // Start Apify actor run
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${process.env.LINKEDIN_ACTOR_ID || 'dev_fusion~linkedin-profile-scraper'}/runs`,
      {
        searchQueries: [searchQuery],
        maxResults,
        scrapeCompanyDetails: false
      },
      {
        headers: { 'Authorization': `Bearer ${process.env.APIFY_API_KEY}` }
      }
    );

    const runId = runResponse.data.data.id;
    logger.info(`⏳ Apify run started: ${runId}`);

    // Wait for completion (poll)
    let attempts = 0;
    while (attempts < 30) {
      await sleep(10000); // 10 second intervals
      
      const statusResponse = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { headers: { 'Authorization': `Bearer ${process.env.APIFY_API_KEY}` } }
      );

      const status = statusResponse.data.data.status;
      
      if (status === 'SUCCEEDED') {
        // Get results
        const resultsResponse = await axios.get(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
          { headers: { 'Authorization': `Bearer ${process.env.APIFY_API_KEY}` } }
        );
        
        logger.info(`✅ LinkedIn scrape complete: ${resultsResponse.data.length} profiles`);
        return normaliseApifyResults(resultsResponse.data);
      } else if (status === 'FAILED' || status === 'ABORTED') {
        logger.error(`LinkedIn scrape failed: ${status}`);
        return [];
      }
      
      attempts++;
    }
    
    logger.error('LinkedIn scrape timed out');
    return [];
    
  } catch (error) {
    logger.error('LinkedIn scraping error:', error);
    return [];
  }
}

// ─── SEARCH BY INDUSTRY/ROLE ─────────────────────────────────────

export async function findCreativeLeads(options: {
  industries?: string[];
  roles?: string[];
  location?: string;
  maxResults?: number;
}): Promise<LinkedInProfile[]> {
  const { roles = ['creative director', 'designer', 'artist', 'filmmaker', 'founder'],
    location = 'London',
    maxResults = 20 } = options;

  const profiles: LinkedInProfile[] = [];

  for (const role of roles.slice(0, 3)) {  // Limit to avoid rate limits
    const query = `${role} ${location}`;
    const results = await scrapeLinkedInProfiles(query, Math.ceil(maxResults / roles.length));
    profiles.push(...results);
  }

  return profiles;
}

// ─── SHARED VOYAGER HEADERS ──────────────────────────────────────
// LinkedIn requires JSESSIONID passed as BOTH a cookie AND Csrf-Token header

function voyagerHeaders(contentType?: string): Record<string, string> {
  const liAt = process.env.LINKEDIN_LI_AT_COOKIE || '';
  const jsessionid = process.env.LINKEDIN_CSRF_TOKEN || '';
  // Strip surrounding quotes if present (e.g. "ajax:123" → ajax:123)
  const csrfToken = jsessionid.replace(/^"|"$/g, '');

  return {
    'Cookie': `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
    'Csrf-Token': csrfToken,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'X-Li-Lang': 'en_US',
    'X-Restli-Protocol-Version': '2.0.0',
    'Accept': 'application/vnd.linkedin.normalized+json+2.1',
    ...(contentType ? { 'Content-Type': contentType } : {})
  };
}

// ─── SEND LINKEDIN MESSAGE ───────────────────────────────────────

export async function sendLinkedInMessage(
  profileUrl: string,
  message: string
): Promise<boolean> {
  if (!process.env.LINKEDIN_LI_AT_COOKIE) {
    logger.warn('LinkedIn session cookie not set — messaging disabled');
    logger.info('MESSAGE DRAFT:', message);
    return false;
  }

  // Use browser automation — Voyager messaging API is blocked server-side
  const { getLinkedInBrowser, browserSendMessage } = await import('./linkedin-browser');
  const browser = await getLinkedInBrowser();
  return browserSendMessage(browser, profileUrl, message);
}

// ─── READ LINKEDIN MESSAGES ──────────────────────────────────────

export async function getLinkedInUnreadMessages(): Promise<any[]> {
  if (!process.env.LINKEDIN_LI_AT_COOKIE) {
    logger.warn('LinkedIn session cookie not set');
    return [];
  }

  try {
    const response = await axios.get(
      'https://www.linkedin.com/voyager/api/messaging/conversations?keyVersion=LEGACY_INBOX&q=unread',
      { headers: voyagerHeaders() }
    );

    return response.data?.elements || [];
  } catch (error) {
    logger.error('Error fetching LinkedIn messages:', error);
    return [];
  }
}

// ─── PROCESS LINKEDIN LEADS ─────────────────────────────────────

export async function processLinkedInLeads(agent: AmberAgent, leads: LinkedInProfile[]): Promise<void> {
  for (const lead of leads) {
    logger.info(`🎯 Processing LinkedIn lead: ${lead.firstName} ${lead.lastName}`);

    // ── Email enrichment — multi-provider pipeline ──────────────
    let enrichedEmail = lead.email || null;
    if (!enrichedEmail && lead.company) {
      const domain = extractDomain(lead.company);
      if (domain) {
        const result = await findEmailMultiProvider(lead.firstName, lead.lastName, domain);
        if (result) {
          enrichedEmail = result.email;
          logger.info(`📧 Email enriched: ${enrichedEmail} (${result.confidence}% confidence, ${result.source})`);
        }
      }
    }

    const contact = {
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: enrichedEmail || undefined,
      linkedin_url: lead.profileUrl,
      company: lead.company,
      job_title: lead.headline,
      industry: lead.industry,
      location: lead.location,
      bio: lead.about,
      source: 'linkedin_scrape'
    };

    // Qualify the lead
    const qualification = await agent.qualifyLead(contact);
    logger.info(`📊 Lead score for ${lead.firstName}: ${qualification.score}/100 — ${qualification.recommended_action}`);

    if (qualification.score >= 60) {
      const hasEmail = !!enrichedEmail;
      const preferredPlatform = hasEmail ? 'email' : 'linkedin';
      const context = `Found them on LinkedIn. They work in ${lead.industry || 'creative industries'} as ${lead.headline}.${lead.about ? ` Their bio says: "${lead.about.substring(0, 100)}"` : ''}${hasEmail ? ` Email found via enrichment: ${enrichedEmail}.` : ''}`;

      const response = await agent.draftOutreach(
        { ...contact, lead_score: qualification.score },
        context,
        preferredPlatform
      );

      logger.info(`📝 Outreach drafted for ${lead.firstName} via ${preferredPlatform}:`);
      logger.info(response.message);

      // If we have an email and AUTO_SEND is on, send directly — skip LinkedIn DM
      if (hasEmail && process.env.AUTO_SEND === 'true') {
        const { sendEmail } = await import('./email');
        await sendEmail(
          enrichedEmail!,
          response.subject || `An invitation from Indvstry Clvb`,
          response.message
        );
        logger.info(`✉️  Email sent directly to ${enrichedEmail}`);
      }
    }

    await sleep(1200); // pace Hunter API calls
  }
}

// ─── REPLY TO LINKEDIN MESSAGES ─────────────────────────────────

export async function replyToLinkedInMessages(agent: AmberAgent): Promise<void> {
  const messages = await getLinkedInUnreadMessages();

  if (messages.length === 0) {
    logger.info('📬 No unread LinkedIn messages');
    return;
  }

  logger.info(`💬 Processing ${messages.length} unread LinkedIn conversations...`);

  for (const conversation of messages) {
    // The Voyager API returns conversation objects with events
    const latestEvent = conversation.events?.[0];
    if (!latestEvent) continue;

    const messageBody: string = latestEvent.eventContent?.messageBody?.text || '';
    if (!messageBody) continue;

    // Identify the sender (not us)
    const senderParticipant = conversation.participants?.find(
      (p: any) => p.entityUrn !== process.env.LINKEDIN_PROFILE_URN
    );
    const senderFirstName: string =
      senderParticipant?.firstName ||
      senderParticipant?.name?.split(' ')[0] ||
      'there';
    const senderLastName: string = senderParticipant?.lastName || '';
    const senderUrn: string = senderParticipant?.entityUrn || '';

    logger.info(`💼 LinkedIn message from ${senderFirstName}: ${messageBody.substring(0, 60)}`);

    const amberResponse = await agent.handleInbound({
      platform: 'linkedin',
      from: {
        first_name: senderFirstName,
        last_name: senderLastName || undefined,
        linkedin_url: senderUrn,
        source: 'linkedin_message'
      },
      content: messageBody,
      message_type: 'dm',
      thread_id: conversation.entityUrn
    });

    if (amberResponse && !amberResponse.requires_approval && senderUrn) {
      await sendLinkedInMessage(senderUrn, amberResponse.message);
    } else if (amberResponse?.requires_approval) {
      logger.info(`⏳ LinkedIn reply to ${senderFirstName} queued for George's approval`);
      logger.info(`Draft: ${amberResponse.message.substring(0, 120)}`);
    }
  }
}

// ─── CANNES LIONS OUTREACH ───────────────────────────────────────

const CANNES_SEARCH_QUERIES = [
  'Cannes Lions 2024 creative director',
  'Cannes Lions speaker advertising',
  'Cannes Lions winner creative',
  'Cannes Lions jury member',
  'Cannes Lions 2024 attendee'
];

export async function findCannesLionsLeads(maxResults = 25): Promise<LinkedInProfile[]> {
  logger.info('🦁 Searching for Cannes Lions attendees on LinkedIn...');
  const profiles: LinkedInProfile[] = [];

  for (const query of CANNES_SEARCH_QUERIES.slice(0, 3)) {
    const results = await scrapeLinkedInProfiles(query, Math.ceil(maxResults / 3));
    profiles.push(...results);
    await sleep(3000); // Be respectful with rate limits
  }

  // Deduplicate by profile URL
  const seen = new Set<string>();
  return profiles.filter(p => {
    if (!p.profileUrl || seen.has(p.profileUrl)) return false;
    seen.add(p.profileUrl);
    return true;
  });
}


export async function sendConnectionRequest(
  profileUrl: string,
  note: string
): Promise<boolean> {
  if (!process.env.LINKEDIN_LI_AT_COOKIE) {
    logger.warn('LinkedIn session cookie not set — connection requests disabled');
    return false;
  }

  // Use browser automation — Voyager invitation API is blocked server-side
  const { getLinkedInBrowser, browserSendConnectionRequest } = await import('./linkedin-browser');
  const browser = await getLinkedInBrowser();
  return browserSendConnectionRequest(browser, profileUrl, note);
}

export async function runCannesLionsOutreach(agent: AmberAgent): Promise<void> {
  logger.info('🦁 Starting Cannes Lions outreach campaign...');

  const leads = await findCannesLionsLeads(25);
  logger.info(`Found ${leads.length} Cannes Lions profiles`);

  let connected = 0;
  let messaged = 0;

  for (const lead of leads) {
    logger.info(`🎯 Processing: ${lead.firstName} ${lead.lastName} — ${lead.headline}`);

    const contact = {
      first_name: lead.firstName,
      last_name: lead.lastName,
      linkedin_url: lead.profileUrl,
      company: lead.company,
      job_title: lead.headline,
      industry: lead.industry,
      location: lead.location,
      bio: lead.about,
      source: 'cannes_lions_outreach'
    };

    const qualification = await agent.qualifyLead(contact);
    logger.info(`📊 Score: ${qualification.score}/100`);

    if (qualification.score >= 50) {
      const context = `Found them through their connection to Cannes Lions — they work as ${lead.headline}${lead.company ? ` at ${lead.company}` : ''}. ${lead.about ? `Their bio: "${lead.about.substring(0, 150)}"` : ''}`;

      const response = await agent.draftOutreach(
        { ...contact, lead_score: qualification.score },
        context,
        'linkedin'
      );

      logger.info(`📝 Intro message drafted for ${lead.firstName}`);
      logger.info(response.message);

      if (!response.requires_approval && lead.profileUrl) {
        // Send connection request with intro message (300 char limit)
        const connectionNote = response.message.substring(0, 300);
        const sent = await sendConnectionRequest(lead.profileUrl, connectionNote);
        if (sent) connected++;
      } else {
        logger.info(`⏳ Queued for George's approval: ${response.message.substring(0, 100)}`);
      }

      messaged++;
    }

    // Rate limit — max 20 connections/day on LinkedIn
    if (connected >= 20) {
      logger.warn('⚠️  Hit daily connection limit (20) — stopping for today');
      break;
    }

    await sleep(5000); // 5 second gap between each
  }

  logger.info(`✅ Cannes Lions outreach complete — ${connected} connection requests sent, ${messaged} messages drafted`);
}

// ─── HELPERS ────────────────────────────────────────────────────

function normaliseApifyResults(data: any[]): LinkedInProfile[] {
  return data.map(item => ({
    name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
    firstName: item.firstName || item.name?.split(' ')[0] || '',
    lastName: item.lastName || item.name?.split(' ').slice(1).join(' ') || '',
    headline: item.headline || item.jobTitle || '',
    company: item.currentCompany || item.company || '',
    location: item.location || '',
    profileUrl: item.linkedInUrl || item.profileUrl || '',
    connections: item.connections || 0,
    about: item.about || item.summary || '',
    industry: item.industry || ''
  }));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
