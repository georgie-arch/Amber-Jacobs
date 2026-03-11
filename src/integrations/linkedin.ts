import axios from 'axios';
import dotenv from 'dotenv';
import AmberAgent from '../agent/amber';
import { logger } from '../utils/logger';

dotenv.config();

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
  const { industries = ['creative', 'design', 'music', 'fashion', 'film', 'art'],
    roles = ['creative director', 'designer', 'artist', 'filmmaker', 'founder'],
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

// ─── SEND LINKEDIN MESSAGE ───────────────────────────────────────

export async function sendLinkedInMessage(
  profileUrn: string,
  message: string
): Promise<boolean> {
  if (!process.env.LINKEDIN_LI_AT_COOKIE) {
    logger.warn('LinkedIn session cookie not set — messaging disabled');
    logger.info('MESSAGE DRAFT:', message);
    return false;
  }

  try {
    // LinkedIn messaging API (requires session cookie)
    // NOTE: This uses internal LinkedIn API — may break with updates
    // Consider LinkedIn's Official Messaging API for production
    
    const response = await axios.post(
      'https://www.linkedin.com/voyager/api/messaging/conversations',
      {
        keyVersion: 'LEGACY_INBOX',
        message: {
          body: { text: message },
          originToken: `msg-${Date.now()}`
        },
        recipients: [profileUrn]
      },
      {
        headers: {
          'Cookie': `li_at=${process.env.LINKEDIN_LI_AT_COOKIE}`,
          'Csrf-Token': process.env.LINKEDIN_CSRF_TOKEN || '',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }
    );

    logger.info(`✅ LinkedIn message sent to ${profileUrn}`);
    return true;
    
  } catch (error) {
    logger.error('LinkedIn message failed:', error);
    return false;
  }
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
      {
        headers: {
          'Cookie': `li_at=${process.env.LINKEDIN_LI_AT_COOKIE}`,
          'Csrf-Token': process.env.LINKEDIN_CSRF_TOKEN || '',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }
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
    
    const contact = {
      first_name: lead.firstName,
      last_name: lead.lastName,
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
      const context = `Found them on LinkedIn. They work in ${lead.industry || 'creative industries'} as ${lead.headline}.${lead.about ? ` Their bio says: "${lead.about.substring(0, 100)}"` : ''}`;
      
      const response = await agent.draftOutreach(
        { ...contact, lead_score: qualification.score },
        context,
        'linkedin'
      );

      logger.info(`📝 Outreach drafted for ${lead.firstName}:`);
      logger.info(response.message);
      
      // In production, send or queue for approval
    }
  }
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
