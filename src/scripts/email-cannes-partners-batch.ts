/**
 * email-cannes-partners-batch.ts
 *
 * Personalised Power House panel pitches to 5 Cannes Lions activation leads:
 *   - Shannon Montoya (Yahoo, Motel Yahoo)
 *   - Beth Sidhu (Stagwell, Sport Beach)
 *   - James Rooke (FreeWheel Beach)
 *   - Jeremy Miller (Dentsu, Beach House)
 *   - Charlotte Rambaud (Havas Café)
 *
 * Scheduled: Tuesday 24 March 2026 at 10:00am per recipient's local time.
 * Run manually: npx ts-node --project tsconfig.json src/scripts/email-cannes-partners-batch.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK_BASE_URL = process.env.DECK_BASE_URL || 'https://function-bun-production-281c.up.railway.app';
const CANVA_DECK = 'https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';

async function getToken(): Promise<string> {
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
  return r.data.access_token;
}

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
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body></html>`;
}

async function sendEmail(token: string, to: string, toName: string, subject: string, body: string): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
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
    `https://graph.microsoft.com/v1.0/me/sendMail`,
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// ─── EMAIL BODIES ─────────────────────────────────────────────────

// YAHOO — Shannon Montoya
// Motel Yahoo at La Plage du Martinez; "check in, log on"; Yahoo Finance/Sports/Mail brand experience
const shannonBody = `Hi Shannon,

The Motel Yahoo concept at Cannes last year was genuinely one of the most talked-about activations on the strip — the decision to lean into nostalgia and internet culture rather than the usual tech showcase was smart, and it worked. You clearly understand how to build an experience that people actually remember.

I'm reaching out because we're building something at Cannes Lions 2026 that sits in a completely different space to the beach activations, and I think there's a natural conversation to be had.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated house hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation, meals, and genuine connection. No panels that feel like press conferences, no networking that goes nowhere. Just the right people, in the right setting, with the time to actually dig into what matters.

What I'd love to explore is a co-hosted session inside the villa — something around brand relevance and what it takes for a legacy media company to own cultural conversation in 2026. Yahoo's comeback story is one of the most interesting in the industry right now, and the honest version of that conversation — told by the people who built Motel Yahoo — would resonate deeply with our room.

Our guests are the decision-makers. This is exactly the room Yahoo would want access to.

Here's our partnership deck:
${DECK_BASE_URL}/deck/yahoo

Full sponsorship scope: ${CANVA_DECK}

And the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, we'd love to set up a call with our events lead George who is driving the activation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting, Shannon.`;

// STAGWELL SPORT BEACH — Beth Sidhu
// Sport Beach now its own company; Ryan Reynolds, Mo Farah, Chris Paul; Beth personally drives it
const bethBody = `Hi Beth,

Sport Beach becoming its own standalone company says everything about what you've built there. What started as a Cannes activation has become a genuine property — and that doesn't happen without someone who understands both the commercial opportunity and the cultural credibility required to pull it off. That's clearly you.

I'm reaching out because we're building something at Cannes Lions 2026 that I think sits in very complementary territory, and there's a conversation worth having.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated house hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation, meals, and real collaboration. It's the opposite of Sport Beach in the best possible way — intimate, off the radar, no spectacle. The kind of environment that attracts a very specific type of person.

What I'd love to explore is a co-hosted panel inside the villa around the intersection of sport, culture, and creative leadership — the territory Sport Beach is built on, but in a setting where the conversation can go much further than a beach panel allows. Your perspective on building a cultural property from scratch, and what sport unlocks for brands that traditional advertising can't, would be genuinely compelling to our room.

Here's the partnership deck so you can see what we're putting together:
https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

And more on the Power House here: https://powerhouse.indvstryclvb.com

If this resonates, we'd love to get you on a call with our events lead George. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Beth.`;

// FREEWHEEL — James Rooke
// FreeWheel Beach is established Cannes fixture; James led conversations there on the future of TV/streaming
const jamesBody = `Hi James,

The FreeWheel Beach has become one of the most consistent and substantive fixtures at Cannes — and the fact that it keeps coming back with the same quality of conversation says a lot about how your team approaches it. The premium video and streaming dialogue you drive there is genuinely different to most of what happens on the Croisette.

I'm reaching out because we're building something at Cannes Lions 2026 that I think sits alongside it rather than competing with it, and there's a natural overlap worth exploring.

Indvstry Power House is a private villa activation running during Cannes Lions — a curated house hosting 30 of the most senior creative, brand, and media leaders for five days of closed-door conversation and collaboration. It's deliberately off the main strip, intimate, and built around the kind of candid dialogue that doesn't happen in public settings.

What I'd love to put to you is a co-hosted session inside the villa — something around the future of premium media and what the next chapter of audience attention actually looks like. The people in our house are the CMOs and creative leaders making those decisions right now. Getting FreeWheel into that room, in a format that allows for real depth rather than a 45-minute panel, feels like something worth exploring.

Here's our partnership deck:
${DECK_BASE_URL}/deck/stagwell

Full sponsorship scope: ${CANVA_DECK}

And the Power House: https://powerhouse.indvstryclvb.com

If this is of interest, we'd love to set up a call with our events lead George who is driving the whole activation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing your thoughts, James.`;

// DENTSU — Jeremy Miller
// Beach House on the Croisette; "learning, growth, connection"; dentsu won 26 Lions including 7 Gold in 2025
const jeremyBody = `Hi Jeremy,

The dentsu Beach House has carved out a genuinely distinct space at Cannes — and the fact that it keeps delivering real substance, particularly in a year where dentsu walked away with 26 Lions including 7 Gold, shows there's real creative conviction behind the whole week. That doesn't happen without the right leadership driving it.

I'm reaching out because we're building something at Cannes Lions 2026 that I think sits in complementary territory, and I'd love to explore whether there's a shared moment to be had.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated space hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation, collaboration, and genuine connection. It's deliberately intimate — no badge energy, no pitching. Just the right people with the space to think at the level the work actually requires.

What I'd love to put to you is a co-hosted creative leaders panel inside the villa — something around what it takes to build and sustain genuine creative excellence at global scale. Dentsu's story on that is one of the most interesting in the industry, and the conversation we could shape around it, with the calibre of people in our house, would go somewhere that a standard Cannes panel never gets to.

Here's the full partnership deck so you can see what we're building:
https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

And more on the Power House here: https://powerhouse.indvstryclvb.com

If this resonates, we'd love to get you on a call with our events lead George who is driving the whole activation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to connecting, Jeremy.`;

// HAVAS — Charlotte Rambaud
// Havas Café on the Croisette since 2006; 2,500+ talent, clients, partners annually
const charlotteBody = `Hi Charlotte,

The Havas Café has been a Cannes institution for nearly 20 years — and the fact that it's still the place people genuinely want to be, rather than simply feel obligated to attend, is a real achievement. That kind of longevity comes from consistency of quality and genuine curation, and it shows.

I'm reaching out because we're building something at Cannes Lions 2026 that sits in a very similar spirit, and I think there's a natural conversation to be had.

Indvstry Power House is a private villa activation running alongside Cannes Lions — a curated house hosting 30 of the most senior creative and marketing leaders for five days of closed-door conversation, meals, and real collaboration. It's built on the same instinct as the Café — that the most valuable conversations at Cannes are the ones that happen away from the main stage, with the right people and enough space to actually go somewhere.

What I'd love to explore with you is a co-hosted moment inside the villa — a session around the future of creative communications and what the next generation of brand storytelling actually looks like. Havas's global perspective on that, shaped by nearly two decades of Cannes presence, would be genuinely compelling to our room.

Here's our partnership deck so you can get a full sense of the activation:
https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

And more on the Power House here: https://powerhouse.indvstryclvb.com

If this is something you'd like to explore further, we'd love to get you on a call with our events lead George who is driving the whole activation. His calendar is here: https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you, Charlotte.`;

// ─── SEND ALL ─────────────────────────────────────────────────────

interface Recipient {
  name: string;
  email: string;
  subject: string;
  body: string;
}

const recipients: Recipient[] = [
  {
    name: 'Shannon Montoya',
    email: 'shannon.montoya@yahooinc.com',
    subject: 'Cannes 2026 — an idea off the back of Motel Yahoo, Shannon',
    body: shannonBody,
  },
  {
    name: 'Beth Sidhu',
    email: 'beth.sidhu@stagwellglobal.com',
    subject: 'Cannes 2026 — Sport Beach meets Power House, Beth',
    body: bethBody,
  },
  {
    name: 'James Rooke',
    email: 'james_rooke@comcast.com',
    subject: 'Cannes 2026 — a conversation from the Power House, James',
    body: jamesBody,
  },
  {
    name: 'Jeremy Miller',
    email: 'jeremy.miller@dentsu.com',
    subject: 'Cannes 2026 — a creative leaders conversation, Jeremy',
    body: jeremyBody,
  },
  {
    name: 'Charlotte Rambaud',
    email: 'charlotte.rambaud@havas.com',
    subject: 'Cannes 2026 — from one Croisette institution to another, Charlotte',
    body: charlotteBody,
  },
];

async function main() {
  const token = await getToken();

  // SEND_ONLY env var lets the scheduler fire one recipient at a time
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();
  const toSend = sendOnly
    ? recipients.filter(r => r.name.toLowerCase().startsWith(sendOnly))
    : recipients;

  for (const r of toSend) {
    await sendEmail(token, r.email, r.name, r.subject, r.body);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    if (toSend.indexOf(r) < toSend.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log(`\n✅ ${toSend.length} email(s) sent.`);
}

main().catch(console.error);
