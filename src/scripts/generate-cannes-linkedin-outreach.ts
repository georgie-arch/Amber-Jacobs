/**
 * generate-cannes-linkedin-outreach.ts
 *
 * Generates personalised LinkedIn outreach copy for all 175 Cannes Lions 2026
 * judges / programme speakers who have no confirmed email address.
 *
 * Segments contacts by role and writes the right pitch angle for each:
 *   - Jury Presidents       → Quiet base + Diaspora Dinner + RSVP concierge
 *   - Global Network CCOs   → Villa partnership + Dinner + RSVP
 *   - CMOs / Brand Leaders  → Neutral briefing space + RSVP
 *   - Agency CCOs / CDs     → Content studio / roundtable space + RSVP
 *   - Founders / Independents → Speaker Residency + Dinner + RSVP
 *
 * Outputs:
 *   src/data/cannes-linkedin-outreach.json  — full structured data
 *   src/data/cannes-linkedin-outreach.csv   — ready for Phantombuster / Dripify
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/generate-cannes-linkedin-outreach.ts
 */

import fs from 'fs';
import path from 'path';

interface LookupRecord {
  name: string;
  title: string;
  company: string;
  domain: string;
  linkedin: string;
  email: string | null;
}

interface OutreachRecord {
  name: string;
  firstName: string;
  title: string;
  company: string;
  linkedin: string;
  segment: string;
  connectionRequest: string;  // max 300 chars
  dmMessage: string;
}

const INPUT_FILE  = path.resolve(__dirname, '../data/cannes-judges-lookup-results.json');
const JSON_OUTPUT = path.resolve(__dirname, '../data/cannes-linkedin-outreach.json');
const CSV_OUTPUT  = path.resolve(__dirname, '../data/cannes-linkedin-outreach.csv');

// ─── SEGMENTATION ─────────────────────────────────────────────────────────────

const JURY_PRESIDENTS = [
  'Mihnea Gheorghiu', 'Aaron Starkman',
];

function getSegment(record: LookupRecord): string {
  if (JURY_PRESIDENTS.includes(record.name)) return 'jury_president';

  const t = record.title.toLowerCase();
  const c = record.company.toLowerCase();

  if (t.includes('cmo') || t.includes('chief marketing') || t.includes('vp market') || t.includes('head of market') || t.includes('global vp')) return 'cmo_brand';
  if (t.includes('founder') || t.includes('activist') || t.includes('rapper') || t.includes('composer') || t.includes('director') && c.includes('film')) return 'founder_independent';
  if (t.includes('ceo') && (t.includes('global') || t.includes('worldwide') || t.includes('group') || t.includes('network') || t.includes('president'))) return 'network_ceo';
  if (t.includes('cco') || t.includes('chief creative') || t.includes('creative officer')) return 'agency_cco';
  if (t.includes('cso') || t.includes('chief strategy') || t.includes('strategy officer')) return 'agency_cso';
  if (t.includes('cto') || t.includes('chief tech') || t.includes('technology officer') || t.includes('head of data') || t.includes('head of insight')) return 'tech_data';
  if (t.includes('ceo') || t.includes('chief executive') || t.includes('managing director') || t.includes('managing partner') || t.includes('president')) return 'network_ceo';
  return 'agency_cco';
}

// ─── MESSAGE COPY ─────────────────────────────────────────────────────────────

function getFirstName(name: string): string {
  return name.split(' ')[0];
}

function generateMessages(record: LookupRecord, segment: string): { connectionRequest: string; dmMessage: string } {
  const fn = getFirstName(record.name);

  switch (segment) {

    case 'jury_president':
      return {
        connectionRequest: `Hi ${fn} — congrats on the Jury President role at Cannes Lions. We're running Indvstry Power House, a private villa during festival week — no-pitch zone, daily shuttles, private dinner 23 Jun. Would love to connect.`,
        dmMessage: `Hi ${fn},

Congratulations on the Jury President role — that is going to be a busy week.

We are running Indvstry Power House during Cannes Lions: a private villa with daily shuttles to La Croisette, AV and content facilities, and a strict no-pitch policy. A number of this year's jury members are using it as a proper base to decompress between sessions.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — 30 guests, off-schedule, the right people in one room.

And with 2,500+ fringe events happening that week, we run a concierge RSVP service for guests so the ones that matter are locked in without the admin.

Would love to share more if useful.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'network_ceo':
      return {
        connectionRequest: `Hi ${fn} — saw you're on the Cannes Lions programme this year. We're running Indvstry Power House, a private villa during festival week — no-pitch, AV studio, private dinner 23 Jun + fringe event RSVP service. Worth connecting.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities, and a no-pitch policy. Several agency network leaders are using the space for private client sessions and off-schedule conversations away from the Palais.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June — a small, curated group of senior industry leaders entirely off the official schedule.

One more thing: we run a fringe event RSVP concierge for guests. With 2,500+ events that week, we handle the registrations so the right ones are confirmed without the admin.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'cmo_brand':
      return {
        connectionRequest: `Hi ${fn} — saw you're speaking at Cannes Lions this year. We're running Indvstry Power House, a private villa at Cannes — no-pitch zone, client briefing space, private dinner 23 Jun + fringe RSVP service. Worth connecting.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV facilities, and a strictly no-pitch, no-branded environment.

For CMOs on the programme, the space works particularly well as neutral ground for client and agency conversations — a proper room away from beach clubs and Palais chaos.

We are also hosting a private Diaspora Dinner on 23rd June and running a fringe event RSVP concierge — over 2,500 events that week, we handle registrations so you show up to the ones that matter.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'agency_cco':
      return {
        connectionRequest: `Hi ${fn} — saw you're on the Cannes Lions programme. We're running Indvstry Power House, a private villa with AV studio + no-pitch policy. Great for client sessions, roundtables or recordings. Private dinner 23 Jun + fringe RSVP service.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with dedicated AV and content capture facilities, daily shuttles to La Croisette, and a strict no-pitch policy.

For agency creative leaders on the programme, the space works well as a studio: somewhere to record a session, host a small client roundtable, or simply have a real conversation away from the Palais.

We are also hosting a private Diaspora Dinner on 23rd June for a select group of senior creatives, and running a fringe event RSVP concierge — 2,500+ events that week, we handle the registrations.

Worth a quick word?

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'agency_cso':
      return {
        connectionRequest: `Hi ${fn} — saw you're speaking at Cannes Lions this year. We're running Indvstry Power House, a private villa — no-pitch zone, content studio, private dinner 23 Jun + fringe event RSVP service for guests. Would love to connect.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, content facilities, and a no-pitch policy. A number of strategy leaders on this year's programme are using it for private client sessions and off-schedule conversations.

We are also hosting a private Diaspora Dinner on 23rd June — a small group of senior agency and brand leaders, entirely off the official schedule.

And a useful extra: we run a fringe event RSVP concierge for guests — with 2,500+ events that week, we handle registrations so you do not miss the ones that matter.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'tech_data':
      return {
        connectionRequest: `Hi ${fn} — saw you're on the Cannes Lions programme this year. We're running Indvstry Power House, a private villa — no-pitch, AV studio, neutral briefing space. Private dinner 23 Jun + fringe RSVP service. Worth connecting.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV facilities, and a strictly no-pitch environment.

For data and technology leaders at Cannes, having genuinely neutral ground — away from branded beach activations — makes a real difference when you need honest client conversations. The space is available for private briefings throughout the week.

We are also hosting a private Diaspora Dinner on 23rd June and running a fringe event concierge — 2,500+ events that week, we handle the RSVPs so you do not miss the ones worth attending.

Happy to share more.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    case 'founder_independent':
      return {
        connectionRequest: `Hi ${fn} — saw you're speaking at Cannes Lions this year. We're offering a select few speakers a residency at Indvstry Power House — a private villa during festival week. Live-in base, no-pitch, private dinner 23 Jun + RSVP service.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week and offering a small number of speaker residency spots — essentially a live-in base at our private villa for the week, with daily shuttles to La Croisette, dedicated workspace, and a no-pitch policy.

For independent creatives and founders on the programme, it is a proper home between sessions without the cost of Cannes hotel rates.

We are also hosting a private Diaspora Dinner on 23rd June — a small, curated gathering — and running a fringe event RSVP concierge for residents: over 2,500 events happen that week and we manage the registrations so you show up to the right ones.

Happy to share more on the residency.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };

    default:
      return {
        connectionRequest: `Hi ${fn} — saw you're on the Cannes Lions programme this year. We're running Indvstry Power House, a private villa during festival week — no-pitch zone, private dinner 23 Jun + fringe event RSVP service. Would love to connect.`,
        dmMessage: `Hi ${fn},

We are running Indvstry Power House during Cannes Lions week — a private villa with daily shuttles to La Croisette, AV and content facilities, and a no-pitch policy.

We are also hosting a private Diaspora Dinner on Tuesday 23rd June for a small group of senior leaders, and running a fringe event RSVP concierge — with 2,500+ events that week, we handle the registrations so the right ones are confirmed.

Happy to share more if useful.

Amber Jacobs | Community Manager, Indvstry Clvb`,
      };
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function main(): void {
  const contacts: LookupRecord[] = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

  const output: OutreachRecord[] = contacts.map(c => {
    const segment = getSegment(c);
    const messages = generateMessages(c, segment);
    return {
      name:              c.name,
      firstName:         getFirstName(c.name),
      title:             c.title,
      company:           c.company,
      linkedin:          c.linkedin,
      segment,
      connectionRequest: messages.connectionRequest,
      dmMessage:         messages.dmMessage,
    };
  });

  // Save JSON
  fs.writeFileSync(JSON_OUTPUT, JSON.stringify(output, null, 2));

  // Save CSV (escape double-quotes in fields)
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = 'Name,First Name,Title,Company,LinkedIn URL,Segment,Connection Request,DM Message';
  const rows = output.map(r =>
    [esc(r.name), esc(r.firstName), esc(r.title), esc(r.company), esc(r.linkedin), esc(r.segment), esc(r.connectionRequest), esc(r.dmMessage)].join(',')
  );
  fs.writeFileSync(CSV_OUTPUT, [header, ...rows].join('\n'));

  // Summary
  const segments: Record<string, number> = {};
  output.forEach(r => { segments[r.segment] = (segments[r.segment] || 0) + 1; });

  console.log(`\nCannes LinkedIn Outreach — ${output.length} contacts\n`);
  console.log('Segment breakdown:');
  Object.entries(segments).sort((a, b) => b[1] - a[1]).forEach(([seg, count]) => {
    console.log(`  ${seg.padEnd(25)} ${count}`);
  });

  console.log(`\nOutputs:`);
  console.log(`  JSON: ${JSON_OUTPUT}`);
  console.log(`  CSV:  ${CSV_OUTPUT}`);
  console.log(`\nCSV is ready to import into Phantombuster, Dripify, or similar.\n`);

  // Print first contact as preview
  const preview = output[0];
  console.log(`─── Preview: ${preview.name} (${preview.segment}) ${'─'.repeat(40)}`);
  console.log(`Connection request (${preview.connectionRequest.length} chars):`);
  console.log(preview.connectionRequest);
  console.log(`\nDM:`);
  console.log(preview.dmMessage);
}

main();
