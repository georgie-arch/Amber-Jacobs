/**
 * email-dept-panel-speakers.ts
 *
 * Outreach to 19 potential panelists for:
 * "The Algorithm Doesn't Know Your Culture"
 * DEPT's Secret Garden — Cannes Lions 2026, Wednesday late-morning
 *
 * 3 contacts require manual outreach (no direct email):
 *   - Rishad Tobaccowala — contact form at rishadtobaccowala.com/connect
 *   - Azeem Azhar — contact form at azeemazhar.com/contact
 *   - Zaid Al-Qassab — LinkedIn DM only (departed M&C Saatchi March 2026)
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-dept-panel-speakers.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

function footer(): string {
  return `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Community Manager, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://Powerhouse.indvstryclvb.com" style="color:#1a1a1a;">Powerhouse.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>`;
}

function buildHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${body.replace(/\n/g, '<br>')}</div>
  ${footer()}
</body>
</html>`;
}

const emails: { name: string; email: string; subject: string; body: string }[] = [
  {
    name: 'Dr. Joy Buolamwini',
    email: 'press@poetofcode.com',
    subject: 'Your work belongs in this room — Cannes Lions 2026, DEPT\'s Secret Garden',
    body: `Hi Joy,

Your work with the Algorithmic Justice League and Unmasking AI has become the defining reference point for this conversation. We are curating a panel at Cannes Lions 2026 titled "The Algorithm Doesn't Know Your Culture" — hosted at DEPT's Secret Garden, one of the most C-suite-heavy, invite-only environments at the festival.

We would love for you to join as a panelist and bring that perspective into a room full of global brand and tech leaders who need to hear it.

You can find out more about what we are building here: Powerhouse.indvstryclvb.com

Would you be open to a conversation?`,
  },
  {
    name: 'Dara Treseder',
    email: 'dara.treseder@autodesk.com',
    subject: 'A conversation you should be leading — Cannes Lions 2026 x DEPT',
    body: `Hi Dara,

As Forbes' most influential CMO and the first Black inductee into the CMO Hall of Fame, you sit at exactly the intersection our panel is exploring. We are programming "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — an exclusive, invite-only activation at Cannes Lions 2026 for C-suite and senior brand leaders.

We would love you on the panel as a Wednesday late-morning speaker.

More on us here: Powerhouse.indvstryclvb.com — would love to connect.`,
  },
  {
    name: 'Asad Rehman',
    email: 'asad.rehman@unilever.com',
    subject: 'Cannes Lions 2026 — panel invitation, DEPT\'s Secret Garden',
    body: `Hi Asad,

Your work leading global media transformation at Unilever — balancing data, purpose and personalisation at scale — is exactly the kind of perspective we want on stage. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions 2026, and we want you in the room as a panelist.

It is an exclusive, invite-only environment with a genuinely senior audience.

Learn more about what we do: Powerhouse.indvstryclvb.com

Are you open to a quick conversation about it?`,
  },
  {
    name: 'Dr. Marcus Collins',
    email: 'collinsm@umich.edu',
    subject: '\'For The Culture\' belongs on this stage — Cannes Lions 2026',
    body: `Hi Marcus,

You literally wrote the book on this. We are building a panel called "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive, C-suite-heavy activations at Cannes Lions 2026 — and your thesis is the backbone of the whole conversation.

We would be honoured to have you join us as a panelist on the Wednesday late-morning session.

Find out more here: Powerhouse.indvstryclvb.com

Would love to explore this with you.`,
  },
  {
    name: 'Bozoma Saint John',
    email: 'donw@harrywalker.com',
    subject: 'Cannes Lions 2026 — panel invitation for Bozoma, DEPT\'s Secret Garden',
    body: `Hi Don,

I am reaching out on behalf of Indvstry Clvb regarding a speaker invitation for Bozoma. We are programming "The Algorithm Doesn't Know Your Culture" — a panel at DEPT's Secret Garden, one of the most exclusive, invite-only B2B activations at Cannes Lions 2026. As a Marketing Hall of Fame inductee with a career that spans culture, technology and brand, Bozoma is exactly who this conversation needs on stage.

We are looking at the Wednesday late-morning slot and would love to explore this further.

More on us: Powerhouse.indvstryclvb.com`,
  },
  {
    name: 'Dr. Timnit Gebru',
    email: 'contact@dair-institute.org',
    subject: 'An invitation to shape the narrative — Cannes Lions 2026, DEPT\'s Secret Garden',
    body: `Hi Timnit,

The work DAIR is doing as an independent voice outside Silicon Valley is exactly the kind of perspective that is missing from most Cannes conversations. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — an exclusive, invite-only activation at Cannes Lions 2026 — and we want your voice in that room.

The audience is C-suite brand and tech leaders. Your perspective on AI ethics and structural bias would be genuinely impactful here.

More on what we are doing: Powerhouse.indvstryclvb.com

Open to a quick chat?`,
  },
  {
    name: 'Najoh Tita-Reid',
    email: 'najoh.tita-reid@effem.com',
    subject: 'Cannes Lions 2026 — speaker invitation, DEPT\'s Secret Garden',
    body: `Hi Najoh,

The Pedigree Adoptable campaign winning Grand Prix at Cannes Lions is a masterclass in emotionally intelligent brand work. We are building a panel called "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive, invite-only environments at Cannes Lions 2026 — and we would love you there as a panelist on Wednesday morning.

More on what we do: Powerhouse.indvstryclvb.com — would love to explore this with you.`,
  },
  {
    name: 'Ukonwa Ojo',
    email: 'hello@zaiaventures.com',
    subject: 'Cannes Lions 2026 — panel invitation at DEPT\'s Secret Garden',
    body: `Hi Ukonwa,

Building Zaia while also launching Ada & Edith — you are operating at the intersection of culture, technology and brand in a way few people are. We are programming "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions 2026, and we would love you as a panelist on the Wednesday morning session.

It is one of the most exclusive, invite-only activations at the festival.

More here: Powerhouse.indvstryclvb.com — would love to connect.`,
  },
  {
    name: 'Musa Tariq',
    email: 'musatariq@gmail.com',
    subject: 'Cannes Lions 2026 — your perspective on the panel we are building',
    body: `Hi Musa,

From GoFundMe to Airbnb to what you are building now — your read on culture, brand and technology is one of the sharpest out there. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions 2026, and we want that perspective in the room.

It is an exclusive, C-suite-heavy environment and this would be a genuinely high-value conversation.

More on us: Powerhouse.indvstryclvb.com

Open to a quick call?`,
  },
  {
    name: 'Obele Brown-West',
    email: 'obele.brown-west@tinuiti.com',
    subject: 'Cannes Lions 2026 — speaker invitation, DEPT\'s Secret Garden',
    body: `Hi Obele,

Your work at Tinuiti pioneering digital media solutions at scale puts you right at the heart of the conversation we are building. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive activations at Cannes Lions 2026 — and we would love you on the panel Wednesday late-morning.

More here: Powerhouse.indvstryclvb.com — would love to explore this with you.`,
  },
  {
    name: 'Karen Blackett CBE',
    email: 'info@speakeragency.co.uk',
    subject: 'Speaker invitation for Karen Blackett — Cannes Lions 2026, DEPT\'s Secret Garden',
    body: `Hi,

I am reaching out on behalf of Indvstry Clvb with a speaker invitation for Karen. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive, invite-only B2B panels at Cannes Lions 2026. Karen's career at the intersection of media, culture and diversity makes her exactly the voice this conversation needs.

We are looking at a Wednesday late-morning slot and would welcome the chance to discuss.

More on what we do: Powerhouse.indvstryclvb.com`,
  },
  {
    name: 'Nishma Patel Robb',
    email: 'nishma.patel.robb@getapeptalk.com',
    subject: 'Cannes Lions 2026 — panel invitation, DEPT\'s Secret Garden',
    body: `Hi Nishma,

As the newly appointed President of WACL and founder of The Glittersphere, you are actively pushing the conversation around visibility and representation in marketing. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions 2026, and we would love you on the panel.

It is an exclusive, invite-only environment with a C-suite audience. Your voice belongs in this room.

More on us: Powerhouse.indvstryclvb.com — would love to connect.`,
  },
  {
    name: 'Ete Davies',
    email: 'ete.davies@dentsucreative.com',
    subject: 'Cannes Lions 2026 — your voice on our panel at DEPT\'s Secret Garden',
    body: `Hi Ete,

Leading Dentsu Creative EMEA puts you right at the intersection of creativity, culture and the structural pressures reshaping the industry. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive, C-suite-heavy activations at Cannes Lions 2026 — and we want you on stage for the Wednesday late-morning panel.

More on what we are building: Powerhouse.indvstryclvb.com

Open to a chat?`,
  },
  {
    name: 'Dr. Anne-Marie Imafidon MBE',
    email: 'anne-marie@stemettes.org',
    subject: 'Cannes Lions 2026 — panel invitation at DEPT\'s Secret Garden',
    body: `Hi Anne-Marie,

As the UK's Women in Tech Envoy and Chancellor of Glasgow Caledonian University, you are one of the most credible voices on the intersection of technology, equity and opportunity. We are building "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive panels at Cannes Lions 2026 — and we would love you there as a panelist.

More on us: Powerhouse.indvstryclvb.com — would love to connect.`,
  },
  {
    name: 'Niran Vinod',
    email: 'niran@deft.be',
    subject: 'Cannes Lions 2026 — a panel that needs your voice, DEPT\'s Secret Garden',
    body: `Hi Niran,

How to Build It (Merky Books) and your time at Meta and Kraken gives you a read on youth culture, technology and brand strategy that very few people have. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions 2026, and we think you would bring a perspective the room genuinely needs.

More here: Powerhouse.indvstryclvb.com — open to a quick conversation?`,
  },
  {
    name: 'June Sarpong OBE',
    email: 'info@motivationalspeakersagency.co.uk',
    subject: 'Speaker invitation for June Sarpong — Cannes Lions 2026, DEPT\'s Secret Garden',
    body: `Hi,

I am reaching out on behalf of Indvstry Clvb with a speaker invitation for June. We are programming "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive, invite-only activations at Cannes Lions 2026. June's work as the BBC's Director of Creative Diversity and her continued advocacy make her exactly the right voice for this conversation.

We are looking at the Wednesday late-morning slot and would love to discuss.

More on what we do: Powerhouse.indvstryclvb.com`,
  },
  {
    name: 'Trevor Robinson OBE',
    email: 'trevor@quietstorm.co.uk',
    subject: 'Cannes Lions 2026 — DEPT\'s Secret Garden, your perspective on the panel',
    body: `Hi Trevor,

Thirty years of Quiet Storm and the CreateNotHate initiative speak for themselves. We are building a panel called "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden — one of the most exclusive environments at Cannes Lions 2026 — and we want a founder's voice in that room.

The Wednesday late-morning session would be a powerful moment for this conversation.

More on us: Powerhouse.indvstryclvb.com — would love to explore this with you.`,
  },
  {
    name: 'Yung Aly',
    email: 'aly@curatedx.co.uk',
    subject: 'Cannes Lions 2026 — you should be on this stage, DEPT\'s Secret Garden',
    body: `Hi Aly,

The Cheetos streetwear drop in Soho with DEPT was genuinely one of the most culturally sharp influencer campaigns of the year. We are hosting a panel at DEPT's Secret Garden at Cannes Lions 2026 — "The Algorithm Doesn't Know Your Culture" — and given your work with DEPT directly, having you there as a panelist would be a full-circle moment.

More on what we are building: Powerhouse.indvstryclvb.com

Would love to have you involved.`,
  },
  {
    name: 'Ash Holme',
    email: 'partnerships@ymugroup.com',
    subject: 'Cannes Lions 2026 — speaker invitation for Ash, DEPT\'s Secret Garden',
    body: `Hi,

I am reaching out on behalf of Indvstry Clvb with an invitation for Ash. The Dear eBay campaign with DEPT was a brilliant example of authentic storytelling connecting with real audiences. We are hosting "The Algorithm Doesn't Know Your Culture" at DEPT's Secret Garden at Cannes Lions 2026, and Ash's creative voice and work with DEPT makes her a natural fit for the panel.

We are looking at the Wednesday late-morning slot.

More here: Powerhouse.indvstryclvb.com — happy to discuss further.`,
  },
];

async function sendAll(): Promise<void> {
  const token = await getToken();
  let sent = 0;

  for (const e of emails) {
    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          message: {
            subject: e.subject,
            body: { contentType: 'HTML', content: buildHtml(e.body) },
            toRecipients: [{ emailAddress: { address: e.email, name: e.name } }],
            from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
          }
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      sent++;
      console.log(`[${sent}/${emails.length}] Sent to ${e.name} <${e.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${e.name} <${e.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }

    if (sent < emails.length) {
      await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.log(`\nDone. ${sent}/${emails.length} emails sent.`);
  console.log('\n--- MANUAL OUTREACH REQUIRED (no direct email) ---');
  console.log('Rishad Tobaccowala — rishadtobaccowala.com/connect');
  console.log('Azeem Azhar        — azeemazhar.com/contact');
  console.log('Zaid Al-Qassab     — LinkedIn DM (departed M&C Saatchi March 2026)');
}

sendAll().catch(console.error);
