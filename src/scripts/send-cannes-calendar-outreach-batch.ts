import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const POWERHOUSE_URL = 'https://powerhouse.indvstryclvb.com';
const CALENDAR_URL = 'https://calendly.com/itsvisionnaire/30min';

interface Recipient {
  host: string;
  eventName: string;
  location: string;
  eventUrl?: string;
  to: string[];
  cc?: string[];
  greeting: string;
  opener: string;
  collaboration: string;
}

const recipients: Recipient[] = [
  {
    host: '3C Ventures',
    eventName: '3C Ventures @ Cannes',
    location: 'Lucia Beach, Cannes',
    eventUrl: 'https://www.canneslions.com/partnerships/our-partners/3c-ventures',
    to: ['partnerships@3cventures.com'],
    greeting: 'team',
    opener: "I can see you're hosting 3C Ventures @ Cannes at Lucia Beach during the week.",
    collaboration: 'Given how relationship-led that environment is, I think there is a natural collaboration between your beach presence and what we are building at the villa.',
  },
  {
    host: 'ADWEEK',
    eventName: 'ADWEEK House',
    location: 'Hotel Barriere Le Majestic',
    eventUrl: 'https://event.adweek.com/awh-cannes-2026',
    to: ['diana.littman@adweek.com'],
    greeting: 'Diana',
    opener: "I can see you're hosting ADWEEK House at the Majestic all week.",
    collaboration: 'An editorial breakfast or off-the-record salon between your programming and our villa audience would make a lot of sense.',
  },
  {
    host: 'Adobe',
    eventName: 'Adobe @ Cannes',
    location: 'Majestic Hotel',
    eventUrl: 'https://canneslions.adobe.com/2026/home',
    to: ['clarep@adobe.com'],
    cc: ['lstreet@adobe.com'],
    greeting: 'Clare',
    opener: "I can see Adobe is back at Cannes with a full-week presence at the Majestic.",
    collaboration: 'There is a strong fit between Adobe’s creative-community footprint and the kind of senior creative room we are curating at the villa.',
  },
  {
    host: 'Ad Age',
    eventName: 'Ad Age The List Lounge',
    location: '57 Bd de la Croisette',
    eventUrl: 'https://www.adageevents.com/event/cannes2026/ad-age-the-list-lounge',
    to: ['asekula@adage.com'],
    greeting: 'Anna',
    opener: "I can see you're bringing Ad Age The List Lounge back to the Croisette this year.",
    collaboration: 'A co-hosted conversation with the right 30 senior guests in a quieter setting than the main strip feels genuinely complementary to what Ad Age does best.',
  },
  {
    host: 'PMG',
    eventName: 'AI and Technology Sandbox',
    location: 'Miramar Beach',
    eventUrl: 'https://aiandtechsandbox.com/',
    to: ['partnerships@pmg.com'],
    greeting: 'team',
    opener: "I can see PMG is launching AI and Technology Sandbox at Miramar Beach during Cannes.",
    collaboration: 'The subject matter overlaps naturally with the founders, CMOs and creative leaders we will have in the house all week.',
  },
  {
    host: 'Amazon',
    eventName: 'Amazon Port',
    location: 'Cannes',
    eventUrl: 'https://advertising.amazon.com/events/cannes-lions',
    to: ['clairepaull@amazon.com'],
    greeting: 'Claire',
    opener: "I can see Amazon Port is back on the Cannes calendar this year.",
    collaboration: 'I think there is a real opportunity to bridge your larger-scale presence with a more intimate senior room inside the villa.',
  },
  {
    host: 'Brands & Culture',
    eventName: 'Brands & Culture Villa',
    location: '13 Avenue de Benefiat, Cannes',
    eventUrl: 'https://www.brandsnculture.com/bc-cannes/',
    to: ['michelle@brandsnculture.com'],
    greeting: 'Michelle',
    opener: "I can see Brands & Culture Villa is back at 13 Avenue de Benefiat for Cannes.",
    collaboration: 'The cultural overlap between what you are convening and what we are building is obvious, and I think there is something strong to explore together.',
  },
  {
    host: 'Beet.TV',
    eventName: 'Beet.TV Leadership Sessions',
    location: 'Cannes',
    eventUrl: 'https://events.beet.tv/cannes',
    to: ['phil@beet.tv'],
    greeting: 'Phil',
    opener: "I can see Beet.TV is bringing its Leadership Sessions back to Cannes again.",
    collaboration: 'A filmed salon or closed-door breakfast conversation inside the villa could be a strong extension of the week’s programming.',
  },
  {
    host: 'Campaign',
    eventName: 'Campaign House',
    location: 'Hilton Canopy Hotel, Cannes',
    eventUrl: 'https://www.campaignlive.co.uk/campaign-at-cannes',
    to: ['michael.baker@haymarket.com'],
    greeting: 'Michael',
    opener: "I can see Campaign House is back in Cannes with another week-long programme.",
    collaboration: 'I think there is a smart way for Campaign’s editorial and partnership model to intersect with the more intimate room we are building.',
  },
  {
    host: 'Chez Verve',
    eventName: 'Chez Verve',
    location: '41 Rue Hoche, Cannes',
    to: ['partnerships@chezverve.com'],
    greeting: 'team',
    opener: "I can see Chez Verve is on the Cannes calendar again this year.",
    collaboration: 'Your setup and ours feel complementary rather than overlapping, which is usually where the most interesting collaborations come from.',
  },
  {
    host: 'Criteo',
    eventName: 'Criteo @ Cannes',
    location: 'Cannes',
    eventUrl: 'https://www.criteo.com/events/',
    to: ['partnerships@criteo.com'],
    greeting: 'team',
    opener: "I can see Criteo is planning another Cannes presence this year.",
    collaboration: 'There is a credible opportunity to bring your commerce and media conversation into a smaller, more senior setting at the villa.',
  },
  {
    host: 'DEPT',
    eventName: 'The Secret Garden',
    location: "5 Rdpt Duboys d'Angers, Cannes",
    eventUrl: 'https://www.deptagency.com/event/cannes-lions-2026/',
    to: ['paulina.prystupa@deptagency.com'],
    cc: ['marjan.straathof@deptagency.com'],
    greeting: 'Paulina',
    opener: "I can see DEPT is bringing The Secret Garden back to Cannes this year.",
    collaboration: 'We are already building a room that would sit well alongside that environment, and I would love to explore how the two can work together.',
  },
  {
    host: 'Financial Times',
    eventName: 'FT Live @ Cannes Lions',
    location: 'Nikkei FT Teahouse, Cannes',
    eventUrl: 'https://ftcannes.live.ft.com/',
    to: ['orson.francescone@ft.com'],
    greeting: 'Orson',
    opener: "I can see the FT is hosting its Teahouse presence again during Cannes.",
    collaboration: 'A sharp editorial breakfast or private conversation at the villa could be a very natural extension of that footprint.',
  },
  {
    host: 'The Female Quotient',
    eventName: 'FQ Lounge @ Cannes',
    location: 'Hotel Martinez',
    eventUrl: 'https://events.thefemalequotient.com/canneslions26/invite',
    to: ['hello@thefemalequotient.com'],
    greeting: 'team',
    opener: "I can see The Female Quotient is back in Cannes with the FQ Lounge footprint.",
    collaboration: 'The values overlap is clear, and I think a co-hosted moment or guest exchange between the spaces could be strong.',
  },
  {
    host: 'Infillion',
    eventName: 'Infillion @ Cannes',
    location: 'Mondrian Hotel, Cannes',
    eventUrl: 'https://www.canneslions.com/partnerships/our-partners/infillion',
    to: ['partnerships@infillion.com'],
    greeting: 'team',
    opener: "I can see Infillion is back in Cannes with its Mondrian presence.",
    collaboration: 'There is a real opportunity to connect that visibility with a more private senior audience inside the villa.',
  },
  {
    host: 'Kantar',
    eventName: 'Kantar Apartment in Cannes',
    location: '13 rue des Serbes, Cannes',
    eventUrl: 'https://vimeo.com/1176534838',
    to: ['jane.ostler@kantar.com'],
    greeting: 'Jane',
    opener: "I can see Kantar Apartment is back in Cannes this year.",
    collaboration: 'A smaller strategic conversation inside the villa would suit the calibre of leaders Kantar usually convenes.',
  },
  {
    host: 'Lotame',
    eventName: 'Lotame @ Cannes',
    location: 'Cannes',
    eventUrl: 'https://www.lotame.com/company/events-webinars/',
    to: ['info@lotame.com'],
    greeting: 'team',
    opener: "I can see Lotame is planning a Cannes presence again this year.",
    collaboration: 'The room we are building would be a strong context for the data and identity conversation you are already leading.',
  },
  {
    host: 'Monks',
    eventName: 'Les Monks Cafe',
    location: '5 Sq. Merimee, Cannes',
    eventUrl: 'https://www.canneslions.com/partnerships/our-partners/monks',
    to: ['victor.knaap@monks.com'],
    cc: ['justin.billingsley@monks.com', 'dave.meeker@monks.com'],
    greeting: 'Victor',
    opener: "I can see Les Monks Cafe is back on the Cannes calendar this year.",
    collaboration: 'I think there is room for something more selective and senior that connects naturally with the energy Monks already creates during the week.',
  },
  {
    host: 'Magnite',
    eventName: 'Magnite @ Cannes',
    location: 'Cannes',
    eventUrl: 'https://www.magnite.com/event-hub/',
    to: ['sean.buckley@magnite.com'],
    cc: ['kristen.williams@magnite.com'],
    greeting: 'Sean',
    opener: "I can see Magnite is putting a Cannes activation into the market again this year.",
    collaboration: 'A breakfast or closed-door session at the villa would give you a different kind of senior conversation than the wider festival flow.',
  },
  {
    host: 'New Digital Age',
    eventName: 'Maison New Digital Age',
    location: '59 Rue Felix Faure, Cannes',
    eventUrl: 'https://newdigitalage.co/nda-events/cannes-2026/',
    to: ['partnerships@bluestripegroup.co.uk'],
    cc: ['editorial@newdigitalage.co.uk'],
    greeting: 'team',
    opener: "I can see Maison New Digital Age is back in the heart of Cannes for the week.",
    collaboration: 'The editorial and partnership format you are building could pair well with a smaller off-schedule conversation at the villa.',
  },
  {
    host: 'Brand Innovators',
    eventName: 'Marketing Leadership Summit',
    location: 'Brand Innovators Beach, Cannes',
    eventUrl: 'https://brand-innovators.com/events/marketing-leadership-summit-cannes-2026/',
    to: ['marc@brand-innovators.com'],
    greeting: 'Marc',
    opener: "I can see Brand Innovators is returning to Cannes with the Marketing Leadership Summit again this year.",
    collaboration: 'The audience overlap is obvious, and a more intimate format at the villa could be a strong complement to what you already host on the beach.',
  },
  {
    host: 'Microsoft',
    eventName: 'Microsoft Beach House',
    location: '64 Bd de la Croisette, Cannes',
    eventUrl: 'https://www.canneslions.com/festival/festival-partners/microsoft',
    to: ['robw@microsoft.com'],
    greeting: 'Rob',
    opener: "I can see Microsoft Beach House is back on the Croisette for Cannes.",
    collaboration: 'I would love to explore a sharper, more intimate moment around AI, creativity and leadership inside the villa.',
  },
  {
    host: 'Pinterest',
    eventName: 'Pinterest Manifestival',
    location: 'Carlton Beach Club, Cannes',
    eventUrl: 'https://pinterestcannes.com/',
    to: ['jlee@pinterest.com'],
    greeting: 'Judy',
    opener: "I can see Pinterest Manifestival is back at Cannes this year.",
    collaboration: 'There is a natural fit between the creative community Pinterest gathers and the room we are curating inside the villa.',
  },
  {
    host: 'Little Black Book',
    eventName: 'The LBB & Friends Beach',
    location: 'LBB Beach, Cannes',
    eventUrl: 'https://lbbonline.com/companies/lbb-friends-beach/about',
    to: ['sarah@lbbonline.com'],
    greeting: 'Sarah',
    opener: "I can see LBB & Friends Beach is back for another week in Cannes.",
    collaboration: 'The beach has always been a real meeting point for the industry, and I think there is a smart adjacent play between that and a smaller private villa room.',
  },
  {
    host: 'The Drum',
    eventName: 'The Drum @ Cannes',
    location: 'Cannes',
    eventUrl: 'https://www.thedrum.com/calendar',
    to: ['hello@thedrum.com'],
    greeting: 'team',
    opener: "I can see The Drum is planning another Cannes presence this year.",
    collaboration: 'I think there is a useful overlap between your audience and the founders, CMOs and cultural operators we will have at the villa.',
  },
  {
    host: 'The Wall Street Journal',
    eventName: 'WSJ Journal House',
    location: '61 Bd de la Croisette, Cannes',
    eventUrl: 'https://journalhouse.wsj.com/cannes-lions-festival-of-creativity/',
    to: ['wsj-partnerships@wsj.com'],
    greeting: 'team',
    opener: "I can see WSJ Journal House is back in Cannes this year.",
    collaboration: 'A closed-door conversation at the villa could complement the larger Journal House footprint in a way that is useful for both sides.',
  },
];

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
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
  return response.data.access_token;
}

function getLogoBase64(): string {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png')).toString('base64');
  } catch {
    return '';
  }
}

function buildHtml(text: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:640px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${text.replace(/\n/g, '<br>')}</div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    ${logoHtml}
    <p style="margin:0 0 4px 0;">+44 7438 932403</p>
    <p style="margin:0 0 4px 0;">London, UK</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission and is not to be forwarded to third parties without the express written consent of the sender.</p>
  </div>
</body></html>`;
}

function buildBody(recipient: Recipient): string {
  const eventLine = recipient.eventUrl
    ? `${recipient.eventName} looks strong, and I had a look at the event page here: ${recipient.eventUrl}`
    : `${recipient.eventName} looks strong from the Cannes calendar.`;

  return `Hi ${recipient.greeting},

${recipient.opener}

${eventLine}

I am reaching out because we are hosting Indvstry Power House during Cannes week - a private villa built for senior leaders across creativity, culture, media and brand. We have 21 delegate passes to work with across the week, alongside the villa itself, and I would love to explore whether there is a collaboration between your activation and ours.

${recipient.collaboration}

If useful, the Power House is here:
${POWERHOUSE_URL}

If this feels worth a conversation, you can book time with me directly here:
${CALENDAR_URL}

Or just reply with a time that suits.

Best,
George`;
}

function subjectFor(recipient: Recipient): string {
  return `Cannes 2026 - ${recipient.eventName} x Indvstry Power House`;
}

async function sendEmail(token: string, recipient: Recipient): Promise<void> {
  const logoB64 = getLogoBase64();
  const message: any = {
    subject: subjectFor(recipient),
    body: { contentType: 'HTML', content: buildHtml(buildBody(recipient)) },
    toRecipients: recipient.to.map(address => ({ emailAddress: { address } })),
    from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
  };

  if (recipient.cc?.length) {
    message.ccRecipients = recipient.cc.map(address => ({ emailAddress: { address } }));
  }

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

async function main(): Promise<void> {
  const token = await getToken();
  let sent = 0;

  for (const recipient of recipients) {
    try {
      await sendEmail(token, recipient);
      console.log(`Sent: ${recipient.host} -> ${recipient.to.join(', ')}${recipient.cc?.length ? ` | cc ${recipient.cc.join(', ')}` : ''}`);
      sent += 1;
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`Failed: ${recipient.host} -> ${recipient.to.join(', ')}`);
      console.error(error?.response?.data || error?.message || error);
    }
  }

  console.log(`Completed ${sent}/${recipients.length} sends.`);
}

main().catch(error => {
  console.error(error?.response?.data || error?.message || error);
  process.exit(1);
});
