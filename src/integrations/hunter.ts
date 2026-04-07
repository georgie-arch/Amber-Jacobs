/**
 * hunter.ts
 *
 * Email enrichment via Hunter.io API.
 * Finds and verifies professional email addresses from a person's name + company domain.
 *
 * API docs: https://hunter.io/api-documentation
 *
 * Env vars required:
 *   HUNTER_API_KEY — get from https://hunter.io (free tier: 25 searches/month)
 *
 * Three-step enrichment pipeline:
 *   1. Hunter email finder  — direct name + domain lookup
 *   2. Domain pattern inference — if Hunter knows the email pattern, we construct it
 *   3. SMTP verification   — verify guessed addresses are real before storing
 */

import axios from 'axios';
import dns from 'dns/promises';
import net from 'net';
import { logger } from '../utils/logger';

const HUNTER_BASE = 'https://api.hunter.io/v2';

// ─── TYPES ───────────────────────────────────────────────────────

export interface EnrichedEmail {
  email: string;
  confidence: number;          // 0–100
  source: 'hunter_finder' | 'hunter_pattern' | 'smtp_verified' | 'guessed';
  verified: boolean;
}

export interface DomainInfo {
  domain: string;
  pattern: string | null;      // e.g. "{first}.{last}" or "{first}"
  emails: string[];            // known emails at this domain
}

// ─── HUNTER: FIND EMAIL FOR A PERSON ─────────────────────────────

export async function findEmail(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EnrichedEmail | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    logger.warn('HUNTER_API_KEY not set — email enrichment disabled');
    return null;
  }

  if (!domain || !firstName) return null;

  try {
    const r = await axios.get(`${HUNTER_BASE}/email-finder`, {
      params: {
        domain,
        first_name: firstName,
        last_name: lastName,
        api_key: apiKey,
      },
    });

    const data = r.data?.data;
    if (!data?.email) return null;

    logger.info(`🎯 Hunter found email for ${firstName} ${lastName}: ${data.email} (${data.score}% confidence)`);
    return {
      email: data.email,
      confidence: data.score || 0,
      source: 'hunter_finder',
      verified: data.verification?.status === 'valid',
    };
  } catch (err: any) {
    // 404 = not found (not an error), 429 = rate limit
    if (err.response?.status === 429) {
      logger.warn('Hunter.io rate limit hit — backing off');
    } else if (err.response?.status !== 404) {
      logger.error('Hunter email-finder error:', err.response?.data?.errors || err.message);
    }
    return null;
  }
}

// ─── HUNTER: GET DOMAIN PATTERN ──────────────────────────────────

export async function getDomainPattern(domain: string): Promise<DomainInfo | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey || !domain) return null;

  try {
    const r = await axios.get(`${HUNTER_BASE}/domain-search`, {
      params: {
        domain,
        api_key: apiKey,
        limit: 10,
      },
    });

    const data = r.data?.data;
    if (!data) return null;

    return {
      domain,
      pattern: data.pattern || null,
      emails: (data.emails || []).map((e: any) => e.value).filter(Boolean),
    };
  } catch (err: any) {
    if (err.response?.status !== 404) {
      logger.error('Hunter domain-search error:', err.response?.data?.errors || err.message);
    }
    return null;
  }
}

// ─── HUNTER: VERIFY AN EMAIL ──────────────────────────────────────

export async function verifyEmail(email: string): Promise<boolean> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return false;

  try {
    const r = await axios.get(`${HUNTER_BASE}/email-verifier`, {
      params: { email, api_key: apiKey },
    });
    const status = r.data?.data?.status;
    return status === 'valid';
  } catch {
    return false;
  }
}

// ─── EMAIL PATTERN INFERENCE ──────────────────────────────────────
// If Hunter knows the domain pattern (e.g. "{first}.{last}@company.com"),
// construct the email and attempt SMTP verification.

export function constructEmailFromPattern(
  firstName: string,
  lastName: string,
  domain: string,
  pattern: string
): string | null {
  if (!firstName || !domain || !pattern) return null;

  const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const l = (lastName || '').toLowerCase().replace(/[^a-z]/g, '');
  const fi = f.charAt(0);
  const li = l.charAt(0);

  const constructed = pattern
    .replace('{first}', f)
    .replace('{last}', l)
    .replace('{f}', fi)
    .replace('{l}', li)
    .replace('{f}.{last}', `${fi}.${l}`)
    .replace('{first}.{l}', `${f}.${li}`);

  if (!constructed.includes('@')) {
    return `${constructed}@${domain}`;
  }
  return constructed.includes('@') ? constructed : null;
}

// ─── SMTP VERIFICATION (no API key needed) ───────────────────────
// Connects to the mail server and checks if the address exists.
// This is what Hunter does under the hood — we can do it ourselves too.

export async function smtpVerify(email: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;

    // 1. Get MX records
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords.length) return false;

    // Sort by priority (lowest = preferred)
    const mx = mxRecords.sort((a, b) => a.priority - b.priority)[0].exchange;

    // 2. SMTP handshake
    return new Promise((resolve) => {
      const socket = net.createConnection(25, mx);
      let stage = 0;
      let resolved = false;

      const done = (result: boolean) => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(result);
        }
      };

      const timer = setTimeout(() => done(false), timeoutMs);

      socket.on('data', (buf) => {
        const line = buf.toString();

        if (stage === 0 && line.startsWith('220')) {
          socket.write('EHLO indvstryclvb.com\r\n');
          stage = 1;
        } else if (stage === 1 && (line.startsWith('250') || line.includes('250 '))) {
          socket.write('MAIL FROM:<amber@indvstryclvb.com>\r\n');
          stage = 2;
        } else if (stage === 2 && line.startsWith('250')) {
          socket.write(`RCPT TO:<${email}>\r\n`);
          stage = 3;
        } else if (stage === 3) {
          clearTimeout(timer);
          // 250 = valid, 550/551/553 = invalid user
          done(line.startsWith('250') || line.startsWith('251'));
        } else if (line.startsWith('5')) {
          clearTimeout(timer);
          done(false);
        }
      });

      socket.on('error', () => { clearTimeout(timer); done(false); });
      socket.on('timeout', () => { clearTimeout(timer); done(false); });
    });
  } catch {
    return false;
  }
}

// ─── FULL ENRICHMENT PIPELINE ─────────────────────────────────────
// Tries Hunter first, falls back to pattern inference + SMTP verification.

export async function enrichContactEmail(
  firstName: string,
  lastName: string,
  companyDomain: string
): Promise<EnrichedEmail | null> {
  if (!companyDomain || !firstName) return null;

  const domain = companyDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase().trim();
  if (!domain.includes('.')) return null;

  logger.info(`🔍 Enriching email for ${firstName} ${lastName} @ ${domain}`);

  // Step 1: Hunter direct lookup
  const hunterResult = await findEmail(firstName, lastName, domain);
  if (hunterResult && hunterResult.confidence >= 70) {
    return hunterResult;
  }

  // Step 2: Domain pattern inference via Hunter
  const domainInfo = await getDomainPattern(domain);
  if (domainInfo?.pattern) {
    const guessed = constructEmailFromPattern(firstName, lastName, domain, domainInfo.pattern);
    if (guessed) {
      logger.info(`🔧 Pattern inferred email: ${guessed} (pattern: ${domainInfo.pattern})`);

      // Step 3: SMTP verify the guessed address
      const smtpValid = await smtpVerify(guessed);
      if (smtpValid) {
        logger.info(`✅ SMTP verified: ${guessed}`);
        return {
          email: guessed,
          confidence: 75,
          source: 'smtp_verified',
          verified: true,
        };
      }

      // Return unverified pattern guess if Hunter gave us the pattern
      return {
        email: guessed,
        confidence: 50,
        source: 'hunter_pattern',
        verified: false,
      };
    }
  }

  // Step 4: If Hunter had a low-confidence result, return it anyway
  if (hunterResult) return hunterResult;

  logger.info(`❌ Could not find email for ${firstName} ${lastName} @ ${domain}`);
  return null;
}

// ─── EXTRACT DOMAIN FROM COMPANY NAME / URL ───────────────────────
// Turns "Google" or "google.com" or "https://google.com" into "google.com"

export function extractDomain(companyOrUrl: string): string | null {
  if (!companyOrUrl) return null;

  // If it looks like a URL or domain already
  const urlMatch = companyOrUrl.match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)/i);
  if (urlMatch) return urlMatch[1].toLowerCase();

  // Otherwise it's probably a company name — can't infer domain
  return null;
}

// ─── BATCH ENRICHMENT ────────────────────────────────────────────

export interface LeadToEnrich {
  firstName: string;
  lastName: string;
  company: string;
  companyDomain?: string;
  linkedinUrl?: string;
}

export async function batchEnrichEmails(
  leads: LeadToEnrich[],
  delayMs = 1200  // stay within Hunter's rate limits
): Promise<Array<LeadToEnrich & { enrichedEmail: EnrichedEmail | null }>> {
  const results = [];

  for (const lead of leads) {
    const domain = lead.companyDomain
      ? extractDomain(lead.companyDomain)
      : extractDomain(lead.company);

    let enrichedEmail: EnrichedEmail | null = null;

    if (domain) {
      enrichedEmail = await enrichContactEmail(lead.firstName, lead.lastName, domain);
    } else {
      logger.info(`⚠️  No domain found for ${lead.firstName} @ ${lead.company} — skipping enrichment`);
    }

    results.push({ ...lead, enrichedEmail });

    if (leads.indexOf(lead) < leads.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return results;
}
