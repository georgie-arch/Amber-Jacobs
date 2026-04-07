/**
 * email-powerhouse-batch7.ts
 *
 * Power House partnership pitches  -  Batch 7.
 * Covers all remaining Cannes 2026 companies not contacted in Batches 1-6.
 * ~260 contacts across 7 categories, sent over 4 dates in April 2026.
 *
 * Schedule:
 *   Mon 13 Apr 2026: MAJOR_BRAND
 *   Wed 16 Apr 2026: ADTECH + AGENCY
 *   Mon 20 Apr 2026: MEDIA_PUBLISHER + COMMUNITY_DEI
 *   Wed 23 Apr 2026: INDUSTRY_ASSOC + CANNES_ACTIVATION
 *
 * Each date fires at:
 *   07:00 UTC  -  EU contacts
 *   08:00 UTC  -  UK contacts
 *   12:00 UTC  -  ET contacts
 *   15:00 UTC  -  PT contacts
 *
 * Usage:
 *   npx ts-node --project tsconfig.json src/scripts/email-powerhouse-batch7.ts
 *
 * Filters:
 *   SEND_ONLY=apple        -  send only to contacts whose name starts with "apple" (case-insensitive)
 *   CATEGORY=MAJOR_BRAND   -  send only contacts in this category
 *   TIMEZONE=EU            -  send only EU timezone contacts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { batch7Contacts, EmailCategory, Timezone } from '../data/batch7-contacts';

dotenv.config();

const DECK_BASE_URL = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';
const POWERHOUSE_SITE = 'https://powerhouse.indvstryclvb.com';
const GEORGE_CALENDAR = 'https://calendly.com/itsvisionnaire/30min';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

// ─── HTML BUILDER ─────────────────────────────────────────────────────────────

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

// ─── EMAIL SENDER ─────────────────────────────────────────────────────────────

async function sendEmail(
  token: string,
  to: string,
  toName: string,
  subject: string,
  body: string
): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: Record<string, unknown> = {
    subject,
    body: { contentType: 'HTML', content: buildHtml(body) },
    toRecipients: [{ emailAddress: { address: to, name: toName } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
  };
  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true,
    }];
  }
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────
//
// Each function takes a company name and returns the full plain-text body
// (HTML conversion happens in buildHtml). No em dashes used anywhere.

function templateMajorBrand(company: string): string {
  return `Hi there,

${company} has built the kind of brand that every creative director at Cannes Lions wants to work with. The category leaders at Cannes are the names that shape what the industry considers excellent, and ${company} belongs in that conversation.

I am reaching out because we are building something at Cannes Lions 2026 that I think is worth your attention.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that makes sense for ${company}: a co-hosted session, a branded dinner, or a presence at our Diaspora Dinner on June 23 at Epi Beach, where 50 curated guests gather at the end of festival week. The room is the right audience for a brand conversation at your level.

Partnership deck: ${DECK_BASE_URL}/deck/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to connect. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function templateAdtech(company: string): string {
  return `Hi there,

Ad tech companies at Cannes Lions spend a lot of time talking to each other. The Power House is built so that the most interesting ad-tech and data conversations happen directly in front of the CMOs, brand presidents, and creative leaders who are actually making the decisions.

I am reaching out because we are building something at Cannes Lions 2026 that is worth considering for ${company}.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 of the most senior marketing and creative leaders for five days of closed-door sessions, shared meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets in. The villa is 30 minutes from the festival by car.

A partnership with the Power House puts ${company} in the room for the conversations that matter. Whether that is a co-hosted session on a topic your team owns, a dinner with the right 20 people, or a broader presence across the week, we can shape something that works.

Partnership overview: ${DECK_BASE_URL}/deck/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George is the right person to take it from here. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function templateAgency(company: string): string {
  return `Hi there,

Creative agencies at Cannes Lions are there to do more than pick up awards. The most interesting work happens in the conversations that do not make it onto the stage, and the most valuable connections are made in rooms where everyone is there by choice, not obligation.

That is exactly what we are building with the Power House.

Indvstry Power House is a private villa activation at Cannes Lions 2026, hosting 30 senior creative and marketing leaders for five days of closed-door sessions, shared meals, and real connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who we bring in. The villa is 30 minutes from the festival by car.

I would love to explore what a partnership with ${company} could look like inside the Power House. A co-hosted session around a topic your team has a genuine point of view on, a curated dinner, or a presence at our Diaspora Dinner on June 23 at Epi Beach. The people in the room are the ones ${company} wants a relationship with.

Partnership snapshot: ${DECK_BASE_URL}/deck/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to have a proper conversation. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function templateMediaPublisher(company: string): string {
  return `Hi there,

Media companies and publishers come to Cannes Lions to be close to the brands and agencies whose decisions shape the industry. ${company} is already part of that conversation. What the Power House offers is access to the senior creative and marketing leaders who are usually not reachable in the main festival environment.

Indvstry Power House is a private villa activation at Cannes Lions 2026, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership that makes sense for ${company}: a co-hosted session, a content moment inside the villa, or a presence at our Diaspora Dinner on June 23 at Epi Beach. The room is exactly the audience ${company} wants to be in front of.

Partnership deck: ${DECK_BASE_URL}/deck/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to connect. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function templateCommunityDei(company: string): string {
  return `Hi there,

The Diaspora Dinner is one of the most important nights of Cannes Lions 2026. On June 23 at Epi Beach, we are bringing together 50 curated guests from across the creative and marketing industry to celebrate diverse creative talent and the culture that drives the best work in the industry. It is a night where the conversation goes deeper than panels and badges allow.

I am reaching out because ${company} belongs in that room.

The Diaspora Dinner is part of a wider activation: Indvstry Power House, a private villa running alongside Cannes Lions 2026, hosting 30 senior creative and marketing leaders for five days of sessions, meals, and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes. The villa is 30 minutes from the festival by car.

A partnership with ${company} around the Diaspora Dinner or the Power House week would create a genuine cultural moment. I would love to explore what that looks like with you.

Partnership overview: ${DECK_BASE_URL}/deck/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George is the right person to talk through the detail. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function templateIndustryAssoc(company: string): string {
  return `Hi there,

Industry associations and trade bodies at Cannes Lions are at their best when they create the conditions for genuine industry alignment rather than just a programme of panels. ${company} knows how to bring the right people together. What the Power House offers is a complementary setting where those conversations can happen with the seniority and intimacy they deserve.

Indvstry Power House is a private villa activation at Cannes Lions 2026, hosting 30 of the most senior creative, marketing, and cultural leaders for five days of closed-door sessions and genuine connection. We hold over 75,000 euros in Cannes Lions delegate passes and are deliberate about who gets access. The villa is 30 minutes from the festival by car.

What I would love to explore is a partnership between ${company} and the Power House: a co-hosted session, a joint dinner, or a shared presence across the week that gives ${company}'s members access to the most senior room at the festival.

Partnership snapshot: ${DECK_BASE_URL}/deck/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to connect. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

function templateCannesActivation(company: string): string {
  return `Hi there,

Cannes Lions 2026 is going to be defined by the activations that create genuine moments rather than just foot traffic. ${company} is building something at Cannes. So are we. There is a conversation worth having.

Indvstry Power House is a private villa activation running alongside the festival, hosting 30 senior creative and marketing leaders for five days of closed-door sessions, shared meals, and real connection. We hold over 75,000 euros in Cannes Lions delegate passes and are intentional about who we bring in. The villa is 30 minutes from the festival by car.

Rather than a standard sponsorship conversation, what I would love to explore is how the Power House and ${company}'s Cannes presence could create something together. A shared event, a crossover moment between our audiences, or a partnership that makes both activations more interesting. Two activations, one conversation.

Partnership overview: ${DECK_BASE_URL}/deck/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}

Full sponsorship scope: ${CANVA_DECK}

More on the Power House: ${POWERHOUSE_SITE}

Our founder George would love to think through what this could look like. His calendar: ${GEORGE_CALENDAR}

Looking forward to hearing from you, Amber`;
}

// ─── SUBJECT LINES ───────────────────────────────────────────────────────────

function getSubject(company: string, category: EmailCategory): string {
  switch (category) {
    case 'MAJOR_BRAND':
      return `Cannes 2026 - Power House partnership, ${company}`;
    case 'ADTECH':
      return `Cannes 2026 - the Power House and ${company}`;
    case 'AGENCY':
      return `Cannes 2026 - a conversation worth having, ${company}`;
    case 'MEDIA_PUBLISHER':
      return `Cannes 2026 - Power House + ${company}`;
    case 'COMMUNITY_DEI':
      return `Cannes 2026 - the Diaspora Dinner and ${company}`;
    case 'INDUSTRY_ASSOC':
      return `Cannes 2026 - Power House x ${company}`;
    case 'CANNES_ACTIVATION':
      return `Cannes 2026 - two activations, one conversation`;
  }
}

function getBody(company: string, category: EmailCategory): string {
  switch (category) {
    case 'MAJOR_BRAND':      return templateMajorBrand(company);
    case 'ADTECH':           return templateAdtech(company);
    case 'AGENCY':           return templateAgency(company);
    case 'MEDIA_PUBLISHER':  return templateMediaPublisher(company);
    case 'COMMUNITY_DEI':    return templateCommunityDei(company);
    case 'INDUSTRY_ASSOC':   return templateIndustryAssoc(company);
    case 'CANNES_ACTIVATION': return templateCannesActivation(company);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const token = await getToken();

  const sendOnly  = process.env.SEND_ONLY?.toLowerCase();
  const onlyCategory = process.env.CATEGORY as EmailCategory | undefined;
  const onlyTimezone = process.env.TIMEZONE as Timezone | undefined;

  let contacts = batch7Contacts;

  if (sendOnly) {
    contacts = contacts.filter(c => c.name.toLowerCase().startsWith(sendOnly));
  }
  if (onlyCategory) {
    contacts = contacts.filter(c => c.category === onlyCategory);
  }
  if (onlyTimezone) {
    contacts = contacts.filter(c => c.timezone === onlyTimezone);
  }

  if (contacts.length === 0) {
    console.log('No contacts matched the current filters. Nothing sent.');
    return;
  }

  console.log(`Sending to ${contacts.length} contact(s)...`);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    const subject = getSubject(c.name, c.category);
    const body    = getBody(c.name, c.category);

    try {
      await sendEmail(token, c.email, c.name, subject, body);
      console.log(`[${i + 1}/${contacts.length}] Sent to ${c.name} <${c.email}>`);
      sent++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${i + 1}/${contacts.length}] FAILED ${c.name} <${c.email}>: ${msg}`);
      failed++;
    }

    if (i < contacts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log(`\nDone. ${sent} sent, ${failed} failed.`);
}

main().catch(console.error);
