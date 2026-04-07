/**
 * email-enrichment.ts
 *
 * Unified multi-provider email enrichment pipeline.
 * Runs Hunter.io, Apollo.io, Snov.io and Skrapp.io in parallel.
 * Returns the highest-confidence result. Falls back to SMTP pattern
 * inference (via Hunter domain pattern) if all providers miss.
 *
 * After finding an email, Intelbase.is can be used to enrich the
 * contact record with phone numbers, location, and other details.
 *
 * Env vars:
 *   HUNTER_API_KEY      — hunter.io
 *   APOLLO_API_KEY      — apollo.io
 *   SNOV_CLIENT_ID      — snov.io
 *   SNOV_CLIENT_SECRET
 *   SKRAPP_API_KEY      — skrapp.io
 *   INTELBASE_API_KEY   — intelbase.is (needs paid plan — email→phone/address lookup)
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import {
  findEmail as hunterFind,
  getDomainPattern,
  constructEmailFromPattern,
  smtpVerify,
} from './hunter';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface EnrichedEmail {
  email: string;
  confidence: number;   // 0–100
  source: string;
  verified: boolean;
}

// ─── APOLLO.IO ────────────────────────────────────────────────────────────────
// Docs: https://apolloio.github.io/apollo-api-docs/?shell#people-enrichment

async function apolloFind(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EnrichedEmail | null> {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) return null;

  try {
    const r = await axios.post(
      'https://api.apollo.io/v1/people/match',
      { first_name: firstName, last_name: lastName, domain, reveal_personal_emails: false },
      { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-Api-Key': apiKey } }
    );

    const email = r.data?.person?.email;
    if (!email || email.includes('email_not_unlocked')) return null;

    logger.info(`🎯 Apollo found email for ${firstName} ${lastName}: ${email}`);
    return { email, confidence: 85, source: 'apollo', verified: false };
  } catch (err: any) {
    if (err.response?.status !== 404 && err.response?.status !== 422) {
      logger.warn(`Apollo enrichment error for ${firstName} ${lastName}: ${err.response?.data?.error || err.message}`);
    }
    return null;
  }
}

// ─── SNOV.IO ──────────────────────────────────────────────────────────────────
// Docs: https://snov.io/api

async function getSnovToken(): Promise<string | null> {
  const clientId = process.env.SNOV_CLIENT_ID;
  const clientSecret = process.env.SNOV_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const r = await axios.post(
      'https://api.snov.io/v1/oauth/access_token',
      { grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return r.data?.access_token || null;
  } catch (err: any) {
    logger.warn(`Snov.io token error: ${err.message}`);
    return null;
  }
}

async function snovFind(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EnrichedEmail | null> {
  const token = await getSnovToken();
  if (!token) return null;

  try {
    // Submit search — Snov queues it and returns in_progress initially
    await axios.post(
      'https://api.snov.io/v1/get-emails-from-names',
      { access_token: token, domain, firstName, lastName },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Poll until complete (max 5 attempts, 2s apart)
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise(r => setTimeout(r, 2000));

      const poll = await axios.post(
        'https://api.snov.io/v1/get-emails-from-names',
        { access_token: token, domain, firstName, lastName },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const status = poll.data?.status?.identifier;
      const emails: any[] = poll.data?.data?.emails || [];

      if (status !== 'in_progress' && emails.length > 0) {
        const best = emails.sort((a: any, b: any) => (b.emailQuality || 0) - (a.emailQuality || 0))[0];
        if (!best?.email) break;
        const confidence = Math.round((best.emailQuality || 0.5) * 100);
        logger.info(`🎯 Snov found email for ${firstName} ${lastName}: ${best.email} (${confidence}%)`);
        return { email: best.email, confidence, source: 'snov', verified: best.smtpStatus === 'valid' };
      }

      if (status !== 'in_progress') break; // done but no results
    }

    return null;
  } catch (err: any) {
    if (err.response?.status !== 404) {
      logger.warn(`Snov.io find error for ${firstName} ${lastName}: ${err.response?.data?.message || err.message}`);
    }
    return null;
  }
}

// ─── SKRAPP.IO ────────────────────────────────────────────────────────────────
// Docs: https://skrapp.io/api

async function skrappFind(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EnrichedEmail | null> {
  const apiKey = process.env.SKRAPP_API_KEY;
  if (!apiKey) return null;

  try {
    const r = await axios.get('https://api.skrapp.io/api/v2/find', {
      headers: { 'X-Access-Key': apiKey },
      params: { name: `${firstName} ${lastName}`, domain },
    });

    const email = r.data?.email;
    const accuracy = r.data?.accuracy ?? 0;
    if (!email) return null;

    logger.info(`🎯 Skrapp found email for ${firstName} ${lastName}: ${email} (${accuracy}%)`);
    return { email, confidence: accuracy, source: 'skrapp', verified: accuracy >= 90 };
  } catch (err: any) {
    if (err.response?.status !== 404) {
      logger.warn(`Skrapp find error for ${firstName} ${lastName}: ${err.response?.data?.message || err.message}`);
    }
    return null;
  }
}

// ─── SMTP PATTERN FALLBACK ────────────────────────────────────────────────────
// If all providers miss, ask Hunter for the domain pattern and construct + verify.

async function patternFallback(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EnrichedEmail | null> {
  const domainInfo = await getDomainPattern(domain);
  if (!domainInfo?.pattern) return null;

  const guessed = constructEmailFromPattern(firstName, lastName, domain, domainInfo.pattern);
  if (!guessed) return null;

  logger.info(`🔧 Pattern fallback: ${guessed} (pattern: ${domainInfo.pattern})`);

  const smtpValid = await smtpVerify(guessed);
  return {
    email: guessed,
    confidence: smtpValid ? 75 : 45,
    source: smtpValid ? 'smtp_verified' : 'pattern_guess',
    verified: smtpValid,
  };
}

// ─── UNIFIED PIPELINE ─────────────────────────────────────────────────────────
// Runs Hunter, Apollo, Snov and Skrapp in parallel.
// Returns the highest-confidence result above the threshold.
// Falls back to SMTP pattern inference if all providers miss.

const CONFIDENCE_THRESHOLD = 50;

export async function findEmailMultiProvider(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EnrichedEmail | null> {
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .trim();

  if (!cleanDomain.includes('.')) return null;

  logger.info(`🔍 Multi-provider enrichment: ${firstName} ${lastName} @ ${cleanDomain}`);

  // Run all providers in parallel
  const [hunterResult, apolloResult, snovResult, skrappResult] = await Promise.allSettled([
    hunterFind(firstName, lastName, cleanDomain),
    apolloFind(firstName, lastName, cleanDomain),
    snovFind(firstName, lastName, cleanDomain),
    skrappFind(firstName, lastName, cleanDomain),
  ]);

  const candidates: EnrichedEmail[] = [];

  for (const result of [hunterResult, apolloResult, snovResult, skrappResult]) {
    if (result.status === 'fulfilled' && result.value) {
      candidates.push(result.value);
    }
  }

  if (candidates.length > 0) {
    // Return highest confidence result
    const best = candidates.sort((a, b) => b.confidence - a.confidence)[0];
    if (best.confidence >= CONFIDENCE_THRESHOLD) {
      logger.info(`✅ Best result: ${best.email} (${best.confidence}%, source: ${best.source})`);
      return best;
    }
  }

  // Nothing above threshold — try SMTP pattern fallback
  logger.info(`⚠️  No confident result from providers — trying pattern fallback`);
  const fallback = await patternFallback(firstName, lastName, cleanDomain);
  if (fallback) return fallback;

  logger.info(`❌ Could not find email for ${firstName} ${lastName} @ ${cleanDomain}`);
  return null;
}

// ─── INTELBASE.IS — CONTACT ENRICHMENT FROM EMAIL ────────────────────────────
// Different to the above providers: takes a known email and returns additional
// contact details (phone, location, social profiles, breach exposure).
// Requires a paid Intelbase plan ($14.99/mo). Activate at intelbase.is/dashboard.
//
// Docs: https://docs.intelbase.is/api-reference/endpoint/lookup_email

export interface IntelbaseContact {
  email: string;
  name?: string;
  phone?: string;
  location?: string;
  socialProfiles?: string[];
  breachCount?: number;
  raw?: any;
}

export async function intelbaseLookup(email: string): Promise<IntelbaseContact | null> {
  const apiKey = process.env.INTELBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const r = await axios.post(
      'https://api.intelbase.is/lookup/email',
      {
        email,
        timeout_ms: 10000,
        include_data_breaches: false,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = r.data;
    if (!data || data.error) {
      if (data?.error?.includes('plan')) {
        logger.warn('Intelbase: paid plan required — activate at intelbase.is/dashboard');
      }
      return null;
    }

    // Normalise response — field names may vary, handle gracefully
    const contact: IntelbaseContact = {
      email,
      name: data.name || data.full_name || undefined,
      phone: data.phone || data.phone_number || data.phones?.[0] || undefined,
      location: data.location || data.city || data.country || undefined,
      socialProfiles: data.social_profiles || data.socials || [],
      breachCount: data.breach_count ?? data.breaches?.length ?? 0,
      raw: data,
    };

    logger.info(`🔎 Intelbase enriched ${email}: ${[contact.name, contact.phone, contact.location].filter(Boolean).join(', ') || 'partial data'}`);
    return contact;
  } catch (err: any) {
    if (err.response?.status === 402 || err.response?.data?.error?.includes('plan')) {
      logger.warn('Intelbase: paid plan required — activate at intelbase.is/dashboard');
    } else if (err.response?.status !== 404) {
      logger.warn(`Intelbase lookup error for ${email}: ${err.response?.data?.error || err.message}`);
    }
    return null;
  }
}

// Convenience: find email via multi-provider pipeline then enrich with Intelbase
export async function findAndEnrichContact(
  firstName: string,
  lastName: string,
  domain: string
): Promise<{ email: EnrichedEmail | null; details: IntelbaseContact | null }> {
  const email = await findEmailMultiProvider(firstName, lastName, domain);
  const details = email ? await intelbaseLookup(email.email) : null;
  return { email, details };
}

// ─── BATCH ENRICHMENT ────────────────────────────────────────────────────────

export interface LeadToEnrich {
  firstName: string;
  lastName: string;
  company: string;
  domain: string;
}

export async function batchFindEmails(
  leads: LeadToEnrich[],
  delayMs = 1200
): Promise<Array<LeadToEnrich & { result: EnrichedEmail | null }>> {
  const out = [];

  for (const lead of leads) {
    const result = await findEmailMultiProvider(lead.firstName, lead.lastName, lead.domain);
    out.push({ ...lead, result });

    if (leads.indexOf(lead) < leads.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return out;
}
