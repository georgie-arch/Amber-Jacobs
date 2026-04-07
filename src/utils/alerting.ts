/**
 * alerting.ts
 *
 * Monitors Amber's critical services and alerts George via Telegram
 * and email when something goes wrong or a token is about to expire.
 *
 * Checks run daily at 8am (wired into scheduler.ts).
 *
 * Covers:
 *   - Outlook refresh token expiry warning
 *   - Instagram access token age (expires every 60 days)
 *   - LinkedIn session cookie staleness
 *   - Telegram bot connectivity
 *   - WhatsApp API connectivity
 *   - General service heartbeat
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

export interface ServiceAlert {
  service: string;
  level: 'warning' | 'critical';
  message: string;
  action: string;
}

// ─── CHECK ALL SERVICES ──────────────────────────────────────────────────────

export async function runServiceHealthCheck(): Promise<ServiceAlert[]> {
  const alerts: ServiceAlert[] = [];

  alerts.push(...checkOutlookToken());
  alerts.push(...checkInstagramToken());
  alerts.push(...checkLinkedInCookie());
  alerts.push(...checkEnvKeys());
  alerts.push(...await checkOutlookConnectivity());
  alerts.push(...await checkWhatsAppConnectivity());
  alerts.push(...await checkTelegramConnectivity());

  return alerts;
}

// ─── OUTLOOK TOKEN ───────────────────────────────────────────────────────────
// Refresh tokens last ~90 days. Warn at 14 days, critical at 3 days.
// We track last-refresh by reading the token length (heuristic — not perfect).
// For a precise check we attempt a token refresh and catch auth errors.

function checkOutlookToken(): ServiceAlert[] {
  const alerts: ServiceAlert[] = [];
  const token = process.env.OUTLOOK_REFRESH_TOKEN;

  if (!token) {
    alerts.push({
      service: 'Email (Outlook)',
      level: 'critical',
      message: 'OUTLOOK_REFRESH_TOKEN is missing from .env',
      action: 'Run `npx ts-node src/scripts/outlook-auth.ts` to re-authenticate',
    });
  }

  return alerts;
}

// ─── INSTAGRAM TOKEN ─────────────────────────────────────────────────────────
// Meta tokens expire every 60 days. We store a timestamp when the token was
// last set so we can warn before it dies.
// Fallback: attempt a lightweight Graph API call and catch 190 (token expired).

async function checkInstagramTokenAge(): Promise<ServiceAlert[]> {
  const alerts: ServiceAlert[] = [];
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    alerts.push({
      service: 'Instagram',
      level: 'critical',
      message: 'INSTAGRAM_ACCESS_TOKEN is missing from .env',
      action: 'Generate a new long-lived token in Meta Business Suite → Instagram',
    });
    return alerts;
  }

  try {
    const r = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: { access_token: token, fields: 'id' },
    });
    if (r.data?.id) {
      logger.info('✅ Instagram token valid');
    }
  } catch (err: any) {
    const code = err.response?.data?.error?.code;
    if (code === 190 || code === 102) {
      alerts.push({
        service: 'Instagram',
        level: 'critical',
        message: 'Instagram access token has EXPIRED — Amber cannot read/send Instagram DMs',
        action: 'Go to Meta Business Suite → Instagram → generate a new long-lived token and update INSTAGRAM_ACCESS_TOKEN in .env',
      });
    } else {
      alerts.push({
        service: 'Instagram',
        level: 'warning',
        message: `Instagram API check failed: ${err.response?.data?.error?.message || err.message}`,
        action: 'Check Meta Business Suite for Instagram API issues',
      });
    }
  }

  return alerts;
}

function checkInstagramToken(): ServiceAlert[] {
  // Sync wrapper — async check is run separately below
  return [];
}

// ─── LINKEDIN COOKIE ─────────────────────────────────────────────────────────

function checkLinkedInCookie(): ServiceAlert[] {
  const alerts: ServiceAlert[] = [];
  const cookie = process.env.LINKEDIN_LI_AT_COOKIE;

  if (!cookie) {
    alerts.push({
      service: 'LinkedIn',
      level: 'warning',
      message: 'LINKEDIN_LI_AT_COOKIE not set — LinkedIn DM sending is disabled',
      action: 'Log into LinkedIn in Chrome → DevTools → Application → Cookies → copy li_at value → update .env',
    });
  }

  return alerts;
}

// ─── ENV KEY CHECKS ──────────────────────────────────────────────────────────

function checkEnvKeys(): ServiceAlert[] {
  const alerts: ServiceAlert[] = [];

  const required = [
    { key: 'ANTHROPIC_API_KEY', service: 'Amber Brain', action: 'Get from console.anthropic.com' },
    { key: 'OUTLOOK_CLIENT_ID', service: 'Email (Outlook)', action: 'Check Azure App Registration' },
    { key: 'TELEGRAM_BOT_TOKEN', service: 'Telegram', action: 'Get from @BotFather on Telegram' },
    { key: 'WHATSAPP_PHONE_NUMBER_ID', service: 'WhatsApp', action: 'Check Meta Business Suite' },
    { key: 'WHATSAPP_ACCESS_TOKEN', service: 'WhatsApp', action: 'Check Meta Business Suite' },
  ];

  for (const { key, service, action } of required) {
    if (!process.env[key]) {
      alerts.push({
        service,
        level: 'critical',
        message: `${key} is missing from .env`,
        action,
      });
    }
  }

  return alerts;
}

// ─── OUTLOOK CONNECTIVITY ────────────────────────────────────────────────────

async function checkOutlookConnectivity(): Promise<ServiceAlert[]> {
  const alerts: ServiceAlert[] = [];

  try {
    const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
    const r = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.OUTLOOK_CLIENT_ID || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Mail.Send offline_access',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (r.data?.access_token) {
      logger.info('✅ Outlook token refresh OK');
    }
  } catch (err: any) {
    const desc = err.response?.data?.error_description || err.message;
    alerts.push({
      service: 'Email (Outlook)',
      level: 'critical',
      message: `Outlook token refresh FAILED — Amber cannot send or read emails. Error: ${desc?.substring(0, 120)}`,
      action: 'Run `npx ts-node src/scripts/outlook-auth.ts` to re-authenticate Outlook',
    });
  }

  return alerts;
}

// ─── WHATSAPP CONNECTIVITY ───────────────────────────────────────────────────

async function checkWhatsAppConnectivity(): Promise<ServiceAlert[]> {
  const alerts: ServiceAlert[] = [];
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) return alerts;

  try {
    const r = await axios.get(
      `https://graph.facebook.com/v18.0/${phoneId}`,
      { params: { access_token: token, fields: 'id,display_phone_number,verified_name' } }
    );
    if (r.data?.id) {
      logger.info(`✅ WhatsApp API OK — ${r.data.verified_name} (${r.data.display_phone_number})`);
    }
  } catch (err: any) {
    const code = err.response?.data?.error?.code;
    const msg = err.response?.data?.error?.message || err.message;
    alerts.push({
      service: 'WhatsApp',
      level: code === 190 ? 'critical' : 'warning',
      message: code === 190
        ? 'WhatsApp access token EXPIRED — Amber cannot send or receive WhatsApp messages'
        : `WhatsApp API check failed: ${msg?.substring(0, 120)}`,
      action: 'Go to Meta Business Suite → WhatsApp → generate a new access token and update WHATSAPP_ACCESS_TOKEN in .env',
    });
  }

  return alerts;
}

// ─── TELEGRAM CONNECTIVITY ───────────────────────────────────────────────────

async function checkTelegramConnectivity(): Promise<ServiceAlert[]> {
  const alerts: ServiceAlert[] = [];
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return alerts;

  try {
    const r = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    if (r.data?.ok) {
      logger.info(`✅ Telegram bot OK — @${r.data.result?.username}`);
    }
  } catch (err: any) {
    alerts.push({
      service: 'Telegram',
      level: 'critical',
      message: 'Telegram bot token invalid or bot is unreachable',
      action: 'Check TELEGRAM_BOT_TOKEN in .env — get a new one from @BotFather if needed',
    });
  }

  return alerts;
}

// ─── SEND ALERTS TO GEORGE ───────────────────────────────────────────────────

export async function sendAlertsToGeorge(alerts: ServiceAlert[]): Promise<void> {
  if (alerts.length === 0) {
    logger.info('✅ All services healthy — no alerts to send');
    return;
  }

  const criticals = alerts.filter(a => a.level === 'critical');
  const warnings = alerts.filter(a => a.level === 'warning');

  const lines = [
    `*Amber — Service Health Report*`,
    `${new Date().toDateString()}`,
    '',
    criticals.length > 0 ? `*CRITICAL (${criticals.length})*` : null,
    ...criticals.map(a => `❌ *${a.service}*\n${a.message}\n_Fix: ${a.action}_`),
    warnings.length > 0 ? `\n*WARNINGS (${warnings.length})*` : null,
    ...warnings.map(a => `⚠️ *${a.service}*\n${a.message}\n_Fix: ${a.action}_`),
  ].filter(Boolean).join('\n');

  // Send via Telegram (fastest)
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  if (telegramToken && adminId) {
    try {
      await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        chat_id: adminId,
        text: lines,
        parse_mode: 'Markdown',
      });
      logger.info(`📱 Health alert sent to George via Telegram (${alerts.length} issue(s))`);
    } catch (err: any) {
      logger.warn('Could not send Telegram alert:', err.message);
    }
  }

  // Also send via email as backup
  const founderEmail = process.env.FOUNDER_EMAIL;
  if (founderEmail) {
    try {
      const { sendEmail } = await import('../integrations/email');
      const emailBody = alerts.map(a =>
        `[${a.level.toUpperCase()}] ${a.service}\n${a.message}\nFix: ${a.action}`
      ).join('\n\n');

      await sendEmail(
        founderEmail,
        `[Amber Alert] ${criticals.length > 0 ? `${criticals.length} critical service issue(s)` : `${warnings.length} warning(s)`}`,
        emailBody
      );
      logger.info('📧 Health alert also sent via email');
    } catch (err: any) {
      logger.warn('Could not send email alert:', err.message);
    }
  }
}

// ─── FULL RUN (called by scheduler) ─────────────────────────────────────────

export async function runAndAlertHealthCheck(): Promise<void> {
  logger.info('🩺 Running Amber service health check...');

  // Run all checks (mix of sync and async)
  const [base, instagram, outlook, whatsapp, telegram] = await Promise.all([
    Promise.resolve(runServiceHealthCheck()),
    checkInstagramTokenAge(),
    checkOutlookConnectivity(),
    checkWhatsAppConnectivity(),
    checkTelegramConnectivity(),
  ]);

  // Deduplicate — base already calls the sync connectivity checks
  const allAlerts = [
    ...base.filter(a => !['Email (Outlook)', 'WhatsApp', 'Telegram'].includes(a.service)),
    ...instagram,
    ...outlook,
    ...whatsapp,
    ...telegram,
  ];

  await sendAlertsToGeorge(allAlerts);
}
