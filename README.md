# Amber Jacobs — AI Community Manager

**Amber** is an autonomous AI community manager for [Indvstry Clvb](https://indvstryclvb.com) — a digital private members club for creative professionals. She handles inbound and outbound communication across five platforms, maintains a persistent memory of every contact and conversation, runs scheduled outreach campaigns, and manages member onboarding — all with George Guise's approval or fully autonomously depending on configuration.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Running Amber](#running-amber)
- [Integrations](#integrations)
- [Scheduler & Cron Jobs](#scheduler--cron-jobs)
- [Database Schema](#database-schema)
- [Memory System](#memory-system)
- [Approval Workflow](#approval-workflow)
- [Operational Scripts](#operational-scripts)
- [Testing](#testing)
- [Deployment (Railway)](#deployment-railway)
- [Project Structure](#project-structure)

---

## Overview

Amber is built on Claude (`claude-sonnet-4-6`). She maintains a SQLite database of every contact, conversation, follow-up, and note. All outgoing messages are either auto-sent or queued for George's approval depending on `AUTO_SEND`.

**What she does:**

| Platform | Capabilities |
|----------|-------------|
| **Email** | Read inbox, draft replies, send campaigns, schedule follow-ups |
| **Telegram** | Respond to DMs, handle commands, answer enquiries |
| **WhatsApp** | Reply to leads, manage group chat, proactive outreach |
| **Instagram** | Reply to DMs and comments, welcome new followers |
| **LinkedIn** | Discover leads via Apify, send outreach, reply to messages |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    src/index.ts                      │
│              (Entry point — boots all services)      │
└───────────────────────┬─────────────────────────────┘
                        │
          ┌─────────────▼─────────────┐
          │       AmberAgent           │
          │   src/agent/amber.ts       │
          │  ┌─────────────────────┐  │
          │  │  Anthropic Claude   │  │
          │  │  (claude-sonnet-4-6)│  │
          │  └─────────────────────┘  │
          │  ┌─────────────────────┐  │
          │  │   AmberMemory       │  │
          │  │ (SQLite / 9 tables) │  │
          │  └─────────────────────┘  │
          └───────────────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │           │       │       │            │
┌───▼──┐  ┌────▼──┐ ┌──▼───┐ ┌▼──────┐ ┌──▼──────┐
│Email │  │Telegram│ │Whats │ │Insta  │ │LinkedIn │
│Gmail │  │  Bot   │ │ App  │ │  gram │ │ +Apify  │
│/365  │  │        │ │Twilio│ │ Meta  │ │         │
└──────┘  └────────┘ │/Meta │ └───────┘ └─────────┘
                     └──────┘
```

**Flow for every inbound message:**
1. Platform handler receives message
2. `agent.handleInbound()` upserts the contact in SQLite
3. Conversation is logged
4. Contact history is built into context for Claude
5. Claude generates a JSON response (message + tone notes + follow-up timing)
6. If `AUTO_SEND=true` → sent immediately; otherwise queued for approval
7. Activity is logged; follow-ups scheduled if needed

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your API keys (see Environment Variables below)

# 3. Initialise the database
npm run db:setup

# 4. Build TypeScript
npm run build

# 5. Start (all services)
npm start

# Or start a specific service
npm run start:telegram
npm run start:email
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values below.

### Required

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key — required for Amber's brain |
| `CLAUDE_MODEL` | Model ID (default: `claude-sonnet-4-6`) |

### Amber Identity

| Variable | Default | Description |
|----------|---------|-------------|
| `AMBER_NAME` | `Amber Jacobs` | Display name used in signatures |
| `AMBER_EMAIL` | — | Amber's email address |
| `AMBER_TITLE` | — | Job title (e.g. Community Manager) |
| `CLUB_NAME` | `Indvstry Clvb` | Club name |
| `CLUB_WEBSITE` | `indvstryclvb.com` | Club URL |
| `CLUB_APPLICATION_URL` | `indvstryclvb.com/apply` | Apply link |
| `FOUNDER_EMAIL` | — | George's email for weekly summaries |

### Email — Gmail (default)

| Variable | Description |
|----------|-------------|
| `GMAIL_CLIENT_ID` | Google OAuth2 client ID |
| `GMAIL_CLIENT_SECRET` | Google OAuth2 client secret |
| `GMAIL_REFRESH_TOKEN` | OAuth2 refresh token |
| `GMAIL_USER` | Sender email address |

### Email — Microsoft Outlook (set `EMAIL_PROVIDER=outlook`)

| Variable | Description |
|----------|-------------|
| `EMAIL_PROVIDER` | Set to `outlook` to use Microsoft Graph API |
| `OUTLOOK_CLIENT_ID` | Azure app client ID |
| `OUTLOOK_CLIENT_SECRET` | Azure app client secret |
| `OUTLOOK_TENANT_ID` | Azure tenant ID (or `common`) |
| `OUTLOOK_REFRESH_TOKEN` | OAuth2 refresh token (from `npm run outlook:auth`) |
| `EMAIL_USER` | Sender email address |

### Telegram

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Token from BotFather |
| `TELEGRAM_BOT_USERNAME` | Bot username (e.g. `Indvstryclvbbot`) |
| `TELEGRAM_ADMIN_ID` | Your Telegram user ID for admin notifications |

### WhatsApp

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number (e.g. `whatsapp:+14155238886`) |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID (if using Meta direct) |
| `WHATSAPP_ACCESS_TOKEN` | Meta system user access token |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token for webhook verification |
| `WHATSAPP_GROUP_ID` | Group chat ID for broadcasts |

### Instagram

| Variable | Description |
|----------|-------------|
| `INSTAGRAM_ACCESS_TOKEN` | Meta Graph API access token |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram Business Account ID |
| `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` | Webhook verification token |
| `AMBER_IG_USERNAME` | Amber's own handle (to skip own comments) |

### LinkedIn

| Variable | Description |
|----------|-------------|
| `LINKEDIN_CLIENT_ID` | LinkedIn app client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn app client secret |
| `LINKEDIN_ACCESS_TOKEN` | Auto-persisted after OAuth flow |
| `LINKEDIN_TOKEN_EXPIRY` | Auto-persisted after OAuth flow |
| `LINKEDIN_LI_AT_COOKIE` | Session cookie for scraping |
| `LINKEDIN_CSRF_TOKEN` | CSRF token for scraping |
| `LINKEDIN_PROFILE_URN` | Your LinkedIn profile URN |
| `APIFY_API_KEY` | Apify API key for lead discovery |
| `LINKEDIN_ACTOR_ID` | Apify actor (default: `dev_fusion~linkedin-profile-scraper`) |

### Operational

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTO_SEND` | `false` | Set to `true` to skip George's approval on all messages |
| `PORT` | `3000` | HTTP server port (for webhooks) |
| `DB_PATH` | `./amber_memory.db` | SQLite database path |
| `LOG_LEVEL` | `info` | Winston log level (`debug`, `info`, `warn`, `error`) |
| `MEMBER_CHECKIN_DAYS` | `7` | Days after joining before first check-in |

---

## Running Amber

### Production (compiled JS — recommended)

```bash
npm run build              # Compile TypeScript once

npm start                  # All services
npm run start:telegram     # Telegram bot only
npm run start:email        # Email + scheduler only
npm run start:whatsapp     # WhatsApp webhooks only
npm run start:instagram    # Instagram webhooks only
```

### Development (ts-node, auto-reload)

```bash
npm run dev                # All services with nodemon
npm run start:dev          # All services, ts-node only
```

### Utility commands

```bash
npm run db:setup           # Initialise / reset the SQLite database
npm run tasks:run          # Trigger all scheduled tasks immediately
npm run memory:view        # Interactive CLI — browse contacts & conversations
```

---

## Integrations

### Email

Amber checks the inbox every 15 minutes, drafts replies using Claude, and sends pending follow-ups on a 30-minute cycle.

Supports two providers — select via `EMAIL_PROVIDER`:

- **Gmail** (default) — OAuth2 via `googleapis` + `nodemailer`
- **Outlook** — Microsoft Graph API (`/me/sendMail`) — bypasses SMTP auth which Microsoft disables by default

All outgoing emails include Amber's HTML signature with the Indvstry Clvb logo embedded as base64.

To set up Outlook auth:
```bash
# Run the auth server, visit the URL it prints, paste the code back
npx ts-node src/scripts/outlook-auth.ts
```

### Telegram

Telegraf-based bot in long-polling mode. Responds to all DMs — no approval gate (auto-sends).

**Commands:**

| Command | Response |
|---------|----------|
| `/start` | Welcome message, logs contact to memory |
| `/apply` | Returns the application URL |
| `/about` | Club description |
| `/contact` | Amber's contact details |

All other text messages are passed to Claude and replied to immediately. Typing indicator shown while generating response; sends "one sec" if it takes longer than 10 seconds.

### WhatsApp

Supports two providers, auto-selected based on environment:

- **Meta WhatsApp Business API** — if `WHATSAPP_PHONE_NUMBER_ID` is set
- **Twilio Sandbox** — fallback using `TWILIO_ACCOUNT_SID`

Webhook routes:
- `POST /webhooks/whatsapp/meta` — Meta webhook
- `POST /webhooks/whatsapp/twilio` — Twilio webhook

### Instagram

Requires a verified Meta Business Account. Uses Graph API v18.0.

Webhook routes:
- `GET /webhooks/instagram` — Verification
- `POST /webhooks/instagram` — Inbound DMs and comments

Polling jobs (via scheduler):
- Every 30 min: check DMs + reply to post comments
- Every hour: send welcome DMs to new followers

### LinkedIn

Two-mode approach to work around LinkedIn's API restrictions:

**Lead Discovery** (via Apify `dev_fusion~linkedin-profile-scraper`):
- Scrapes profiles by role + location
- Scores each lead 0–100 via Claude
- Drafts personalised outreach
- Volume kept at 15–50 profiles/day to avoid bans

**Messaging** (via session cookies):
- Uses `li_at` session cookie + CSRF token
- Reads inbox, generates replies, sends messages

**To set up LinkedIn OAuth:**
```bash
npx ts-node src/scripts/linkedin-auth.ts
# Opens a URL — authorise, paste the code back
# Token auto-saved to .env
```

---

## Scheduler & Cron Jobs

Started automatically when running `npm start` or `npm run start:email`.

| Cron | Task | Detail |
|------|------|--------|
| `*/15 * * * *` | Read + reply to emails | Every 15 min |
| `*/30 * * * *` | Send queued email follow-ups | Every 30 min |
| `*/30 * * * *` | Instagram DMs + comment replies | Every 30 min |
| `0 * * * *` | Instagram welcome DMs | Every hour at :00 |
| `15 * * * *` | Chase leads (pending follow-ups) | Every hour at :15 |
| `30 * * * *` | Reply to LinkedIn messages | Every hour at :30 |
| `45 * * * *` | WhatsApp lead assistance | Every hour at :45 |
| `0 */2 * * *` | WhatsApp group chat management | Every 2 hours |
| `0 9 * * 1-5` | LinkedIn lead discovery (15/day) | 9am weekdays |
| `0 11 * * 1-5` | Proactive WhatsApp outreach | 11am weekdays |
| `0 10 * * *` | Member health check | 10am daily |
| `0 8 * * 1` | Weekly summary email to George | Monday 8am |
| `0 10 * * *` | Sponsor outreach batch (50/day) | 10am daily |

**Run all tasks immediately:**
```bash
npm run tasks:run
```

---

## Database Schema

SQLite database at `./amber_memory.db` (configurable via `DB_PATH`).

### Tables

| Table | Purpose |
|-------|---------|
| `contacts` | All people Amber has interacted with. Types: lead, member, partner, vip. Status: cold → warm → hot → active |
| `members` | Membership tracking. Tiers: standard, pro, vip. Onboarding stages: welcome → intro_sent → call_booked → settled |
| `conversations` | Full message history across all platforms, with approval state |
| `followups` | Scheduled actions. Statuses: pending → sent / skipped / approved |
| `leads` | Pipeline tracking. Stages: discovered → engaged → interested → applied → approved → converted |
| `memory_notes` | Free-text notes per contact (preferences, interests, warnings) |
| `activity_log` | Audit trail of every action Amber takes |
| `templates` | Reusable message templates with `{{variable}}` placeholders |

### Initialise / reset the database

```bash
npm run db:setup
```

This runs the schema and seeds 6 default templates (welcome email, follow-up, outreach, etc.).

---

## Memory System

`AmberMemory` wraps better-sqlite3 with methods for every type of persistent data. Before generating any reply, Amber loads the full contact history and builds a context block that gets prepended to the Claude prompt.

**Key methods:**

```typescript
// Contacts
memory.upsertContact(contact)              // Insert or update, returns ID
memory.findContact({ email, telegram_id }) // Look up by any field
memory.buildContactContext(contactId)      // Returns markdown history for Claude

// Conversations
memory.logConversation(entry)              // Log any inbound/outbound message
memory.getConversations(contactId, limit)  // Retrieve history

// Follow-ups
memory.scheduleFollowUp(contactId, platform, taskType, notes, date)
memory.getPendingFollowUps()               // Due follow-ups
memory.markFollowUpComplete(id)

// Members & Leads
memory.createMember(contactId, tier)
memory.updateOnboardingStage(contactId, stage)
memory.upsertLead(contactId, stage, score)

// Templates
memory.fillTemplate('member_welcome', { first_name: 'Alex' })

// Activity
memory.logActivity('email_sent', 'email', contactId)
```

**View the database from the terminal:**
```bash
npm run memory:view
```

---

## Approval Workflow

By default, Amber drafts every outgoing message but does **not** send it until George approves. Responses are stored in the `conversations` table with `approved_by_george = 0`.

To enable auto-send (no approval required):
```bash
# In .env:
AUTO_SEND=true
```

**Telegram is always auto-send** — the approval gate does not apply to real-time chat.

---

## Operational Scripts

One-off scripts for specific tasks. All in `src/scripts/`.

| Script | Command | Purpose |
|--------|---------|---------|
| Cannes Lions outreach | `npm run cannes:outreach` | Find + reach out to Cannes attendees via LinkedIn |
| Sponsor/partner outreach | `npm run powerhouse:outreach` | Batch outreach to sponsors from CSV |
| Send LinkedIn message | `npm run linkedin:message` | Direct message to a specific LinkedIn contact |
| LinkedIn auth | `npm run linkedin:auth` | OAuth2 flow to get access token |
| Check all enquiries | `npx ts-node src/scripts/check-all-enquiries.ts` | Read + reply to all unread Outlook emails |
| Morning follow-up batch | `npx ts-node src/scripts/morning-outreach-followup.ts` | Batch email campaign |

---

## Testing

```bash
npm test                # Run full test suite (Vitest)
npm run test:watch      # Watch mode
npm run test:ui         # Vitest browser UI
npm run test:email      # Smoke test — verifies cron jobs + sends a test email
```

### Test suite (src/tests/e2e.test.ts)

Uses an isolated temp SQLite database — does not touch `amber_memory.db`.

| Suite | What it tests |
|-------|--------------|
| Database & Memory | Schema validity, contact CRUD, follow-up scheduling |
| Agent Core | Response generation, inbound handling, outreach drafting |
| Integrations | Email, Instagram, LinkedIn, WhatsApp (all mocked) |
| Scheduler | Cron job registration (all 13 jobs) |
| Member Onboarding | Welcome sequence, check-in scheduling |
| Live AI (opt-in) | Real Claude API calls — requires `AMBER_TEST_LIVE=true` |

### Smoke test (src/tests/smoke-test.ts)

Validates that all 13 cron jobs register correctly and sends a live test email. Run before deploying:
```bash
npm run test:email
```

---

## Deployment (Railway)

Amber is configured for [Railway](https://railway.app) via `railway.json` and `nixpacks.toml`.

**Build process:**
1. Nixpacks installs Node.js 20, Python 3, GCC (required for `better-sqlite3`)
2. `npm ci` — clean install
3. `npm run build` — compile TypeScript to `dist/`
4. `cp src/database/schema.sql dist/database/schema.sql` — copy schema for runtime use

**Start command:** `npm start` (runs `node dist/index.js`)

**Restart policy:** Auto-restart on failure, up to 3 retries.

**Steps to deploy:**

1. Push to GitHub
2. Connect repo to Railway
3. Add all environment variables in Railway's Variables panel
4. Deploy — Railway handles the build automatically

**Health check endpoint:**
```
GET /health
→ { status: "online", agent: "Amber Jacobs", club: "Indvstry Clvb", timestamp: "..." }
```

**Webhook URLs to configure in each platform's dashboard:**

| Platform | Webhook URL |
|----------|-------------|
| Instagram | `https://your-railway-url.up.railway.app/webhooks/instagram` |
| WhatsApp (Meta) | `https://your-railway-url.up.railway.app/webhooks/whatsapp/meta` |
| WhatsApp (Twilio) | `https://your-railway-url.up.railway.app/webhooks/whatsapp/twilio` |

---

## Project Structure

```
AMBER/
├── src/
│   ├── agent/
│   │   ├── amber.ts            — Core agent: Claude calls, response generation
│   │   ├── memory.ts           — SQLite wrapper for all persistent state
│   │   └── personality.ts      — System prompt, voice rules, output format
│   ├── integrations/
│   │   ├── email.ts            — Gmail OAuth2 + Microsoft Outlook Graph API
│   │   ├── telegram.ts         — Telegraf bot (polling)
│   │   ├── whatsapp.ts         — Twilio + Meta WhatsApp Business API
│   │   ├── instagram.ts        — Meta Graph API (DMs + comments)
│   │   └── linkedin.ts         — LinkedIn OAuth2 + Apify scraper
│   ├── tools/
│   │   ├── scheduler.ts        — 13 node-cron jobs
│   │   └── member-manager.ts   — Member onboarding & lifecycle
│   ├── database/
│   │   ├── migrations.ts       — DB setup, schema execution, template seeding
│   │   └── schema.sql          — Full SQLite schema (9 tables)
│   ├── utils/
│   │   ├── logger.ts           — Winston logger with file rotation
│   │   ├── signature.ts        — HTML email signature generator
│   │   └── memory-viewer.ts    — CLI contact/conversation browser
│   ├── scripts/                — One-off operational scripts (outreach, auth, etc.)
│   ├── tests/
│   │   ├── e2e.test.ts         — Vitest full test suite
│   │   └── smoke-test.ts       — Cron + email smoke test
│   └── index.ts                — Entry point — boots all services
├── dist/                       — Compiled JS output (git-ignored)
├── amber_memory.db             — SQLite database (auto-created, git-ignored)
├── logs/                       — Winston log files (auto-created, git-ignored)
├── nixpacks.toml               — Railway build config
├── railway.json                — Railway deploy config
├── tsconfig.json               — TypeScript config
├── vitest.config.ts            — Test config
├── package.json
└── .env                        — Environment variables (never commit)
```

---

## Key Behaviours & Rules

- **Never use em dashes (—)** in email body text — use commas or rewrite the sentence
- **No corporate jargon** — banned words include: leverage, synergy, circle back, touch base, value-add, empower
- **Check memory before every reply** — never ask something already known, always reference past conversations
- **LinkedIn messages** start with the first name only — no intro, no sign-off
- **Approval mode** is on by default — set `AUTO_SEND=true` only when confident
- **LinkedIn scraping** is capped at 15–50 profiles/day to avoid account bans
- **Instagram API** only works with a verified Meta Business Account
