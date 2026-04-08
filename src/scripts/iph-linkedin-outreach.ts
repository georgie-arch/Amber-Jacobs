#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────
// Indvstry Power House — LinkedIn Outreach
// Sends connection requests (or messages if already connected) to
// CMOs / senior marketing leads targeted for IPH Cannes partnership
// Run: npx ts-node src/scripts/iph-linkedin-outreach.ts
// ─────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import { getLinkedInBrowser, browserSendConnectionRequest, browserSendMessage, browserCheckIsConnected, closeBrowser } from '../integrations/linkedin-browser';
import { logger } from '../utils/logger';

// ─── TARGETS ─────────────────────────────────────────────────────

const TARGETS = [
  {
    name: 'Kenny Mitchell',
    title: "SVP & CMO, Levi's",
    profileUrl: 'https://www.linkedin.com/in/kenneth-mitchell-729586/',
    // 300 char limit for connection note
    note: "Hi Kenny - I run Indvstry Clvb, a private members club for creative leaders. We're hosting a villa at Cannes Lions (21-26 Jun) and sent you an email this week about a potential Levi's partnership. Would love to connect.",
    message: `Hi Kenny,

Following up on the email I sent this week about the Indvstry Power House at Cannes Lions.

We're hosting a private villa residency (21-26 Jun) for senior creative leaders and CMOs - and I think there's a real opportunity for Levi's to be part of it. Whether it's a branded dinner, a curated mixer or something more bespoke, the setting is built for exactly that kind of activation.

Would love to find 20 minutes to talk it through. Here's my calendar: https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Barrie Gruner',
    title: 'EVP Marketing, Hulu',
    profileUrl: 'https://www.linkedin.com/in/barriegruner/',
    note: "Hi Barrie - I run Indvstry Clvb. We're hosting a curated villa residency at Cannes Lions (21-26 Jun) and I think there's a natural fit for a Hulu collaboration. Sent you an email this week - would love to connect.",
    message: `Hi Barrie,

Following up on the email I sent this week about the Indvstry Power House at Cannes Lions.

We're running a private villa residency (21-26 Jun) for senior creative leaders and I think Hulu is a natural fit - whether that's a branded evening, a content-led dinner or a partnership around the week's programming. The space attracts the kind of audience that leans in.

Would love to explore it. Here's my calendar if easier: https://calendly.com/itsvisionnaire/30min

George`
  },
  {
    name: 'Andrea Mallard',
    title: 'CMO, Microsoft AI',
    profileUrl: 'https://www.linkedin.com/in/andreamallard/',
    note: "Hi Andrea - I run Indvstry Clvb. Our villa residency at Cannes Lions (21-26 Jun) feels like the right space for a Microsoft AI moment. Sent you an email this week - would love to connect.",
    message: `Hi Andrea,

Following up on the email I sent this week about the Indvstry Power House at Cannes Lions.

We're hosting a private villa residency (21-26 Jun) for senior creative leaders and CMOs - and given where Microsoft AI sits in the creativity conversation right now, I think there's something genuinely interesting we could build together there. A session, a curated event, or just the right room with the right people.

Would love to find 20 minutes. Here's my calendar: https://calendly.com/itsvisionnaire/30min

George`
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Indvstry Power House — LinkedIn Outreach');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await getLinkedInBrowser();

  let connected = 0;
  let messaged = 0;
  let failed = 0;

  for (const target of TARGETS) {
    console.log(`\nProcessing: ${target.name} (${target.title})`);
    console.log(`  Profile: ${target.profileUrl}`);

    // Check if already connected — if so, send a message instead
    const isConnected = await browserCheckIsConnected(browser, target.profileUrl);

    if (isConnected) {
      console.log('  Already connected — sending message...');
      const sent = await browserSendMessage(browser, target.profileUrl, target.message);
      if (sent) {
        console.log('  Message sent.');
        messaged++;
      } else {
        console.log('  Message failed.');
        failed++;
      }
    } else {
      console.log('  Not connected — sending connection request with note...');
      const sent = await browserSendConnectionRequest(browser, target.profileUrl, target.note);
      if (sent) {
        console.log('  Connection request sent.');
        connected++;
      } else {
        console.log('  Connection request failed — profile may be follow-only or already pending.');
        failed++;
      }
    }

    // Human-like delay between actions
    const delay = 10000 + Math.floor(Math.random() * 5000);
    console.log(`  Waiting ${Math.round(delay / 1000)}s...\n`);
    await new Promise(r => setTimeout(r, delay));
  }

  await closeBrowser();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Done. Connection requests: ${connected} | Messages sent: ${messaged} | Failed: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

main().catch(err => {
  logger.error('LinkedIn outreach failed:', err);
  closeBrowser().catch(() => {});
  process.exit(1);
});
