/**
 * Indvstry Exchange Sponsor Outreach — Batch 1
 *   1. Phil Choi (Boomplay)       pchoi@boomplaymusic.com
 *   2. Kakul Srivastava (Splice)   kakul.srivastava@splice.com
 *   3. Ghazi Shami (Empire)        ghazi@empire.io
 *
 * CC: Ralph (ralphb@vuga.org) on all
 * From: George Guise
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DECK = 'https://www.canva.com/design/DAHASATuBz4/9A20zd1Nyto4mD_qS3LKCg/edit?utm_content=DAHASATuBz4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton';

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
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Founder</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

// ─── BOOMPLAY ────────────────────────────────────────────────────────────────

const boomplayBody = `Hi Phil,

Loved seeing the Boomplay Rising Stars initiative in Kenya - backing Bmixx as your first artist is the kind of community investment that actually means something on the ground. It is clear Nairobi is not just a market for Boomplay, it is a priority.

I wanted to flag something I think is relevant to where you are heading.

Audiomack just crossed 50 million monthly active users and a big part of how they got there was investing in the physical community layer - Audiomack House events across Lagos, Johannesburg, Dar es Salaam, and a direct ticketing integration with Tix.Africa so fans can buy live event tickets inside the app. They are systematically building what streaming alone cannot give you: real-world loyalty.

Sub-Saharan Africa's music revenues hit $120M in 2025 - up 15.2%, the fastest growing region globally (IFPI). The live events economy is worth $2.3 billion and growing fast. The audience is there. The spending is there. The question is who owns the community layer in Nairobi before someone else does.

That is what we are building with Indvstry Exchange.

Indvstry Exchange is an 8-week programme launching in Kenya this year - online seminars, live writing camps, an incubator for songwriters and producers, ending in a panel talk and concert. Symphonic is already on board as lead sponsor. We are now looking for the right platform partner to put their brand at the centre of Kenya's creative community in a way that no digital campaign can replicate.

Boomplay is the obvious fit. You already have the Kenya infrastructure. This gives you the live community layer.

Full programme details: ${DECK}

Would love to get 30 minutes with you to walk through what a partnership could look like. What does your diary look like over the next couple of weeks?

George`;

// ─── SPLICE ──────────────────────────────────────────────────────────────────

const spliceBody = `Hi Kakul,

Saw the Splice Sessions: South Africa launch with Kooldrink, Dr Feel, and Kususa - and your own note about the trip in your December CEO letter. It is clear Africa is not just a catalogue opportunity for you, it is something you are personally invested in. The Afro genre category in Create was a smart move too.

Something I came across recently that felt relevant:

Africa posted 14.2% music royalty growth in 2025 - the fastest rate of any region globally (CISAC). Afro House is up 778% on Splice's own platform. But African music still accounts for less than 1% of global music income. The talent and the cultural momentum are enormous. The community and financial infrastructure are not keeping up.

Native Instruments moved first on this. Their Leading Vibe Initiative with Tems in Lagos - mentorship, hands-on training, Komplete Select access for emerging female producers - is not a sample pack campaign, it is a community programme. They now have Tems on their Artist Board alongside Alicia Keys and Jacob Collier. That is a different kind of relationship with the continent.

Splice has the platform reach and the genre data to go deeper. What is missing is the on-the-ground infrastructure to turn that into real producer relationships in East Africa.

That is exactly what Indvstry Exchange is.

We are launching an 8-week programme in Kenya - online seminars, live writing camps, a producer incubator, ending in a panel talk and concert. Symphonic is our lead sponsor. We are looking for a platform partner who wants to be inside the room where the next generation of East African producers is being built.

Splice is a natural fit for the production-focused legs of the programme. This is the community infrastructure to match the ambition you already have.

Full programme details: ${DECK}

Do you have time for a call in the next couple of weeks? Would love to talk through what involvement could look like.

George`;

// ─── EMPIRE ──────────────────────────────────────────────────────────────────

const empireBody = `Hi Ghazi,

The ASAMBE! South Africa launch in January was a statement. Fireboy, Black Sherif, local signings - Empire is clearly building something real on the continent, not just distributing to it. I have been watching it closely.

Something worth flagging while you are building that East Africa footprint:

UMG just signed Juanita Tunu out of Nairobi - their second Kenyan signing in 12 months following Njerae - and they are running U-Live Africa alongside it, combining artist development with live event promotion across the continent. Sub-Saharan Africa's recorded music revenues hit $120M in 2025, up 15.2%, the fastest-growing region globally (IFPI). UMG is moving fast to own the artist development and live events pipeline before the market matures.

Empire has the bigger artists crossing into East Africa right now - Asake sold out Nairobi in December. But the community infrastructure to capture those fan relationships and develop the next wave of Kenyan talent is not yet in place.

That is what we are building with Indvstry Exchange.

An 8-week programme in Kenya this year - online seminars, live writing camps, a songwriter and producer incubator, ending in a panel talk and concert. Symphonic is our lead sponsor. We are talking to a small number of strategic partners who want to put their brand at the centre of East Africa's emerging creative class.

Empire Africa is the obvious label partner for this. The artists you are developing and the audience we are building are the same people.

Full programme details: ${DECK}

Would you have 30 minutes to talk through what involvement could look like? Happy to work around your schedule.

George`;

// ─── SEND ────────────────────────────────────────────────────────────────────

interface Recipient {
  name: string;
  email: string;
  subject: string;
  body: string;
}

const recipients: Recipient[] = [
  {
    name: 'Phil Choi',
    email: 'pchoi@boomplaymusic.com',
    subject: 'Indvstry Exchange Kenya  -  Boomplay partnership',
    body: boomplayBody,
  },
  {
    name: 'Kakul Srivastava',
    email: 'kakul.srivastava@splice.com',
    subject: 'Indvstry Exchange Kenya  -  Splice partnership',
    body: spliceBody,
  },
  {
    name: 'Ghazi Shami',
    email: 'ghazi@empire.io',
    subject: 'Indvstry Exchange Kenya  -  Empire partnership',
    body: empireBody,
  },
];

async function sendEmail(token: string, r: Recipient): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: r.subject,
    body: { contentType: 'HTML', content: buildHtml(r.body) },
    toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
    ccRecipients: [{ emailAddress: { address: 'ralphb@vuga.org', name: 'Ralph' } }],
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
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

async function main() {
  const token = await getToken();
  for (const r of recipients) {
    await sendEmail(token, r);
    console.log(`✅ Sent to ${r.name} <${r.email}>`);
    await new Promise(res => setTimeout(res, 1500));
  }
  console.log('\n✅ All 3 sent.');
}

main().catch(console.error);
