/**
 * email-mindnode-targets-followup.ts
 *
 * Short follow-up to all 33 contacts from the original MindNode batch,
 * first contacted ~25 March 2026. Cannes is now 7 weeks away.
 *
 * FROM: Amber Jacobs <access@indvstryclvb.com> (via Microsoft Graph API)
 *
 * Run:       npx ts-node --project tsconfig.json src/scripts/email-mindnode-targets-followup.ts
 * Single:    SEND_ONLY=jessica npx ts-node --project tsconfig.json src/scripts/email-mindnode-targets-followup.ts
 * Type-check: npx tsc --noEmit
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GEORGE_CALENDAR = 'https://calendly.com/itsvisionnaire/30min';

// ─── AUTH ────────────────────────────────────────────────────────────────────

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
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch { return ''; }
}

function buildHtml(text: string): string {
  const logoB64  = getLogoBase64();
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

// ─── RECIPIENT TYPE ───────────────────────────────────────────────────────────

interface Recipient {
  name:  string;
  email: string;
}

// ─── FOLLOW-UP BODY BUILDER ───────────────────────────────────────────────────

function buildFollowUp(firstName: string, companyHook: string): string {
  return `Hi ${firstName},

I wanted to follow up on the email I sent in March about Indvstry Power House at Cannes Lions 2026.

With the festival now seven weeks away, brands and partners are locking in their plans. We still have a small number of partnership packages available, and ${companyHook}

If it is worth a quick conversation, George can find 30 minutes here:
${GEORGE_CALENDAR}

Amber`;
}

// ─── RECIPIENTS WITH PERSONALISED COMPANY HOOKS ───────────────────────────────

interface RecipientWithHook extends Recipient {
  hook: string;
}

const recipientsWithHooks: RecipientWithHook[] = [
  // META
  {
    name:  'Nicola',
    email: 'nicola.mendelsohn@meta.com',
    hook:  "the conversation around AI and creative scale feels like it is going to define Cannes this year. The villa is where that conversation happens in the right room.",
  },
  {
    name:  'Helen',
    email: 'helen.ma@meta.com',
    hook:  "with Meta's advertising products reshaping how brands think about performance, the villa is exactly the room where those conversations get traction with the right senior audience.",
  },
  // SPOTIFY
  {
    name:  'Bridget',
    email: 'bridget.evans@spotify.com',
    hook:  "Spotify's work helping brands shape their audience strategy is exactly the kind of thinking that deserves a room beyond the main festival floor.",
  },
  {
    name:  'Emma',
    email: 'emma.vaughn@spotify.com',
    hook:  "the content and partnership conversations that define Cannes for Spotify are exactly what the villa is built around.",
  },
  {
    name:  'Keyana',
    email: 'keyana.kashfi@spotify.com',
    hook:  "the experiential and content angle we are building at the villa is very much in the same spirit as the activations you run.",
  },
  {
    name:  'Kay',
    email: 'kay.hsu@spotify.com',
    hook:  "the Creative Lab thinking you bring to Cannes is exactly what the room needs to hear beyond the main stage.",
  },
  // LINKEDIN
  {
    name:  'Jessica',
    email: 'jessica.jensen@linkedin.com',
    hook:  "the audience in the villa is exactly the marketing leadership community LinkedIn is built to serve.",
  },
  {
    name:  'Matthew',
    email: 'matthew.derella@linkedin.com',
    hook:  "the B2B conversations that matter most at Cannes happen in rooms like ours, and the audience is exactly LinkedIn's core constituency.",
  },
  {
    name:  'Danielle',
    email: 'danielle.damiano@linkedin.com',
    hook:  "given your work on global event strategy at LinkedIn, this feels like the right kind of environment to put on your radar ahead of Cannes.",
  },
  {
    name:  'Allyson',
    email: 'allyson.hugley@linkedin.com',
    hook:  "the 30 senior leaders in the villa are exactly the audience your customer insights work is built to understand.",
  },
  // DISNEY ADVERTISING
  {
    name:  'Rita',
    email: 'rita.ferro@disney.com',
    hook:  "the AI and automation conversation Disney is driving in advertising is going to be one of the biggest threads at Cannes, and the villa is where it happens at close range.",
  },
  {
    name:  'Dana',
    email: 'dana.mcgraw@disney.com',
    hook:  "the measurement and holistic impact conversation you have been driving at Disney is exactly what the senior leaders in the villa want to hear directly.",
  },
  {
    name:  'Jamie',
    email: 'jamie.power@disney.com',
    hook:  "the audience inside the villa is exactly the senior decision-maker group that Disney's addressable story is built around.",
  },
  // LIVERAMP
  {
    name:  'Vihan',
    email: 'vihan.sharma@liveramp.com',
    hook:  "the data and AI conversation LiveRamp is leading is going to be one of the defining threads at Cannes this year, and the villa is where it gets serious.",
  },
  {
    name:  'Scott',
    email: 'scott.howe@liveramp.com',
    hook:  "with LiveRamp's IAB recognition and the industry conversations around data standards, the villa is a natural room for that story.",
  },
  // PAYPAL ADS
  {
    name:  'Mark',
    email: 'mark.grether@paypal.com',
    hook:  "the Transaction Graph story is a strong one and Cannes is the right room to tell it to the people making the decisions.",
  },
  // EXPEDIA
  {
    name:  'Ariane',
    email: 'ariane.gorin@expediagroup.com',
    hook:  "the 30 senior leaders in the villa are exactly the high-value travel audience Expedia is built for.",
  },
  {
    name:  'Jochen',
    email: 'jochen.koedijk@expediagroup.com',
    hook:  "the AI and marketing evolution story Expedia is telling is exactly the kind of conversation the villa is built around.",
  },
  // COMCAST
  {
    name:  'Jon',
    email: 'jon.gieselman@comcast.com',
    hook:  "with your mandate across brand, product and performance, the villa is exactly the kind of intimate, senior environment that generates the most useful conversations.",
  },
  // GWI
  {
    name:  'Jason',
    email: 'jason.mander@gwi.com',
    hook:  "the consumer and media intelligence GWI produces is exactly what the brands and leaders in the villa are hungry for in a room.",
  },
  // ROBLOX
  {
    name:  'Jerret',
    email: 'jerret.west@roblox.com',
    hook:  "gaming culture and brand storytelling feels like the conversation that finally lands properly at Cannes this year, and Roblox's scale puts you at the centre of it.",
  },
  // VEVO
  {
    name:  'Kevin',
    email: 'kevin.mcgurn@vevo.com',
    hook:  "music video culture and the premium video story Vevo tells is exactly the kind of creative conversation the villa is built around.",
  },
  {
    name:  'Rob',
    email: 'rob.gillies@vevo.com',
    hook:  "Cannes is the week where the most important relationships in the industry come together, and we want to make sure Vevo is in the right room.",
  },
  // MONKS
  {
    name:  'Victor',
    email: 'victor.knaap@monks.com',
    hook:  "the grounded, practical AI thinking Monks brings to the industry is exactly what the senior leaders in the villa want to engage with.",
  },
  {
    name:  'Justin',
    email: 'justin.billingsley@monks.com',
    hook:  "the C-suite audience in the villa is exactly the room Monks is built to grow with.",
  },
  {
    name:  'Dave',
    email: 'dave.meeker@monks.com',
    hook:  "the AI innovation story at Monks is one of the strongest in the industry right now, and Cannes is where it gets the audience it deserves.",
  },
  // EXPERIAN
  {
    name:  'Greg',
    email: 'greg.koerner@experian.com',
    hook:  "the data and brand strategy conversation Experian is part of is exactly what the senior decision-makers in the villa are focused on.",
  },
  {
    name:  'Budi',
    email: 'budi.tanzi@experian.com',
    hook:  "the intersection of data, identity and brand that Experian sits at is a live conversation inside the room we are building.",
  },
  // YMU
  {
    name:  'Mary',
    email: 'mary.bekhait@ymugroup.com',
    hook:  "the talent, culture and brand crossover that YMU Ventures is building is central to what we are doing at the villa.",
  },
  // TRAINLINE
  {
    name:  'Lindsay',
    email: 'lindsay.sheridan@thetrainline.com',
    hook:  "the 30 senior leaders in the villa are exactly the kind of high-value audience that Trainline's advertising story resonates with.",
  },
  // MAGNITE
  {
    name:  'Kristen',
    email: 'kristen.williams@magnite.com',
    hook:  "the CTV and programmatic partnership conversations that define Cannes for Magnite are exactly what the villa is built around.",
  },
  {
    name:  'Sean',
    email: 'sean.buckley@magnite.com',
    hook:  "Cannes is where the CTV and revenue conversations get started, and the villa is the right room for Magnite to have them.",
  },
  // XBOX / MICROSOFT
  {
    name:  'Marcos',
    email: 'marcos.waltenberg@microsoft.com',
    hook:  "gaming culture and brand strategy feels like the conversation that properly lands at Cannes this year, and Microsoft is right at the centre of it.",
  },
];

// ─── SEND ─────────────────────────────────────────────────────────────────────

async function main() {
  const token    = await getToken();
  const logoB64  = getLogoBase64();
  const sendOnly = process.env.SEND_ONLY?.toLowerCase();

  const toSend = sendOnly
    ? recipientsWithHooks.filter(r => r.name.toLowerCase().startsWith(sendOnly))
    : recipientsWithHooks;

  console.log(`Sending follow-up to ${toSend.length} contacts from ${process.env.EMAIL_USER}...`);
  console.log();

  let sent = 0;

  for (const r of toSend) {
    const bodyText = buildFollowUp(r.name, r.hook);

    const message: any = {
      subject: 'Following up: Indvstry Power House, Cannes 2026',
      body:    { contentType: 'HTML', content: buildHtml(bodyText) },
      toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
      from: {
        emailAddress: {
          address: process.env.EMAIL_USER || '',
          name:    'Amber Jacobs',
        },
      },
    };

    if (logoB64) {
      message.attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        name:          'indvstry-logo.png',
        contentType:   'image/png',
        contentBytes:  logoB64,
        contentId:     'indvstry-logo',
        isInline:      true,
      }];
    }

    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log(`  Sent    -> ${r.name} <${r.email}>`);
      sent++;
    } catch (err: any) {
      console.error(`  FAILED  -> ${r.name} <${r.email}>`, err?.response?.data || err.message);
    }

    await new Promise(res => setTimeout(res, 800));
  }

  console.log();
  console.log(`Done. ${sent}/${toSend.length} sent.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
