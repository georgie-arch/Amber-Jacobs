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
  to: string[];
  cc?: string[];
  greeting: string;
  eventUrl?: string;
  opener: string;
  angle: string;
}

const recipients: Recipient[] = [
  {
    host: 'Digiday',
    eventName: 'Digiday @ Cannes',
    to: ['sara@digiday.com'],
    greeting: 'Sara',
    eventUrl: 'https://digiday.com/events/digiday-in-cannes/',
    opener: "I can see Digiday is hosting a series of Cannes gatherings again this year, including the brand leaders dinner, brunch and panel reception.",
    angle: 'A sharp editorial or closed-door discussion inside the villa would complement that programme well, especially with a smaller group of CMOs, founders and agency leaders.',
  },
  {
    host: 'The Nucleus Network',
    eventName: 'Tennis on the Riviera',
    to: ['michael@thenucleusnetwork.com'],
    cc: ['jake@thenucleusnetwork.com'],
    greeting: 'Michael',
    eventUrl: 'https://luma.com/xc0mq5b7',
    opener: "I can see The Nucleus Network is hosting Tennis on the Riviera during Cannes week.",
    angle: 'The relationship-led nature of that event feels very aligned with what we are building at the villa, and I think there is a natural collaboration there.',
  },
  {
    host: 'Limelight',
    eventName: 'Adtech Kick-off Lunch',
    to: ['hello@limelightplatform.com'],
    greeting: 'team',
    eventUrl: 'https://www.limelight.inc/cannes-2026',
    opener: "I can see Limelight is hosting the Adtech Kick-off Lunch at Cannes.",
    angle: 'It feels like exactly the kind of crowd that could extend naturally into a more private villa conversation later in the week.',
  },
  {
    host: 'MSQ',
    eventName: 'Le Club MSQ',
    to: ['contact@msqpartners.com'],
    cc: ['rajet.gamhiouen@msqpartners.com'],
    greeting: 'team',
    eventUrl: 'https://connect.msqpartners.com/le-club-msq-2026',
    opener: "I can see MSQ is opening Le Club MSQ in Cannes this year.",
    angle: 'Your positioning around meaningful conversations away from the crowd is close to our own thinking, which makes a collaboration genuinely interesting rather than forced.',
  },
  {
    host: 'VideoWeek',
    eventName: 'VideoWeek Live',
    to: ['partnerships@videoweek.com'],
    greeting: 'team',
    eventUrl: 'https://cannes.videoweek.com/',
    opener: "I can see VideoWeek is hosting a live podcast and lunch event in Cannes this year.",
    angle: 'A filmed discussion or leadership breakfast inside the villa would be a strong extension of that editorial and networking footprint.',
  },
  {
    host: 'Samsung Ads',
    eventName: 'Catamaran Conversations',
    to: ['samsungads@samsung.com'],
    greeting: 'team',
    opener: "I can see Samsung Ads is hosting Catamaran Conversations during Cannes week.",
    angle: 'There is a clear overlap between the senior media audience you will draw there and the room we are curating inside the villa.',
  },
  {
    host: 'Covatic',
    eventName: 'Cocktail Hour in Cannes',
    to: ['nick@covatic.com'],
    cc: ['matt@covatic.com'],
    greeting: 'Nick',
    eventUrl: 'https://covatic.com/join-us-for-cocktails-at-the-barrel-pub-in-cannes/',
    opener: "I can see Covatic is hosting Cocktail Hour in Cannes this year.",
    angle: 'It feels like there is a smart way to connect that moment with a more senior, closed-door adtech conversation inside the villa.',
  },
  {
    host: 'Women Inspiring Network',
    eventName: 'WIN Lounge',
    to: ['hello@womeninspiringnetwork.com'],
    greeting: 'team',
    eventUrl: 'https://www.womeninspiringnetwork.com/cannes-2026/',
    opener: "I can see WIN is bringing the WIN Lounge to Cannes again this year.",
    angle: 'The themes you are convening around creativity, technology and influence overlap strongly with the audience we are building inside the house.',
  },
  {
    host: 'Apple',
    eventName: 'Apple @ Cannes',
    to: ['jade.coles@apple.com'],
    greeting: 'Jade',
    opener: "I can see Apple is on the Cannes calendar again this year.",
    angle: 'Apple’s cultural programming has real credibility, and I think there is an opportunity to bring that sensibility into a smaller, more curated villa environment.',
  },
  {
    host: 'Bloomberg Media',
    eventName: 'BOBO Bistro',
    to: ['bmedia@bloomberg.net'],
    greeting: 'team',
    opener: "I can see Bloomberg Media is planning BOBO Bistro for Cannes.",
    angle: 'A Bloomberg-led breakfast or private salon inside the villa would make sense for the calibre of operators we will have in the room.',
  },
  {
    host: 'Alchemy Network',
    eventName: 'Cannes Connect by Alchemy Network',
    to: ['hello@alchemy-network.co.uk'],
    greeting: 'team',
    opener: "I can see Alchemy Network is hosting Cannes Connect this year.",
    angle: 'Given your focus on introductions and new thinking, I think there is a strong fit with the kind of curated room we are building at the villa.',
  },
  {
    host: 'Canva',
    eventName: 'Canva Creative Cabana @ Cannes',
    to: ['jimmy.knowles@canva.com'],
    greeting: 'Jimmy',
    opener: "I can see Canva is bringing Creative Cabana to Cannes this year.",
    angle: 'Canva’s creator and design community focus feels like a very natural match for the mix of cultural and creative leaders we are hosting at the villa.',
  },
  {
    host: 'DanAds',
    eventName: 'DanAds @ Cannes',
    to: ['partnerships@danads.com'],
    greeting: 'team',
    eventUrl: 'https://danads.com/event/cannes-lions-international-festival-of-creativity-june-22-26/',
    opener: "I can see DanAds is on the Cannes calendar this year.",
    angle: 'The self-serve and retail media conversation you are close to would land well in a tighter leadership room during the week.',
  },
  {
    host: 'Digital Fight Club',
    eventName: 'Digital Fight Club',
    to: ['partnerships@digitalfightclub.com'],
    greeting: 'team',
    opener: "I can see Digital Fight Club is on the Cannes calendar again this year.",
    angle: 'The energy of that format is very different to ours, which is exactly why a crossover or hosted moment could be interesting.',
  },
  {
    host: 'Equativ',
    eventName: 'Equativ @ Cannes',
    to: ['bskinazi@equativ.com'],
    greeting: 'Ben',
    opener: "I can see Equativ is back at Cannes this year.",
    angle: 'I think there is a clear opportunity for Equativ to bring its point of view into a more senior and intimate environment inside the villa.',
  },
  {
    host: 'GumGum',
    eventName: 'GumGum @ Cannes',
    to: ['hello@gumgum.com'],
    greeting: 'team',
    opener: "I can see GumGum is back on the Cannes calendar this year.",
    angle: 'A collaboration around attention, context and creativity would fit naturally with the kind of conversations we are curating.',
  },
  {
    host: 'Havas',
    eventName: 'Havas Media @ Cannes',
    to: ['charlotte.rambaud@havas.com'],
    greeting: 'Charlotte',
    opener: "I can see Havas is bringing its Cannes presence back again this year.",
    angle: 'Given how established Havas is on the Croisette, I would love to explore a more intimate co-hosted conversation inside the villa rather than trying to replicate scale.',
  },
  {
    host: 'Influential',
    eventName: 'Influential Beach @ Cannes',
    to: ['hello@influential.co'],
    greeting: 'team',
    opener: "I can see Influential Beach is on the Cannes calendar again this year.",
    angle: 'There is a strong creator and influence overlap between your audience and the room we are putting together at the villa.',
  },
  {
    host: 'Inkwell',
    eventName: 'Inkwell Beach @ Cannes',
    to: ['adrianne@inkwellbeach.com'],
    greeting: 'Adrianne',
    opener: "I can see Inkwell Beach is returning to Cannes this year.",
    angle: 'The community you convene and the people we are hosting inside the villa have real alignment, and I think there is something meaningful to build there.',
  },
  {
    host: 'LinkedIn',
    eventName: 'LinkedIn @ Cannes',
    to: ['allyson.hugley@linkedin.com'],
    cc: ['danielle.damiano@linkedin.com'],
    greeting: 'Allyson',
    opener: "I can see LinkedIn is back on the Cannes calendar this year.",
    angle: 'The villa is exactly the kind of setting where LinkedIn’s point of view on leadership, brand and professional culture can land properly with the right people.',
  },
  {
    host: 'Meta',
    eventName: 'Meta Beach @ Cannes',
    to: ['helen.ma@meta.com'],
    cc: ['nicola.mendelsohn@meta.com'],
    greeting: 'Helen',
    opener: "I can see Meta Beach is back in Cannes this year.",
    angle: 'There is room for a sharper, more thoughtful Meta conversation inside the villa around AI, culture and how brands are actually navigating the shift.',
  },
  {
    host: 'MiQ',
    eventName: 'MiQ House',
    to: ['partnerships@wearemiq.com'],
    greeting: 'team',
    opener: "I can see MiQ House is on the Cannes calendar this year.",
    angle: 'It feels like there is a natural opportunity to bring MiQ into a smaller leadership room where strategy can go deeper than the usual festival format.',
  },
  {
    host: 'Omnicom',
    eventName: 'Omnicom @ Cannes',
    to: ['cannes@omnicomgroup.com'],
    greeting: 'team',
    opener: "I can see Omnicom is planning a Cannes activation this year.",
    angle: 'A collaboration with the villa would give you a more selective room for senior conversations than the broader Cannes flow usually allows.',
  },
  {
    host: 'Reddit',
    eventName: 'Reddit @ Cannes',
    to: ['mromoff@reddit.com'],
    greeting: 'Mike',
    opener: "I can see Reddit is back at Cannes this year.",
    angle: 'A Reddit-led discussion inside the villa around communities, fandom and what people actually care about would be a very strong fit for the audience we are gathering.',
  },
  {
    host: 'RTL',
    eventName: 'RTL Beach @ Cannes',
    to: ['partnerships@rtl.com'],
    greeting: 'team',
    opener: "I can see RTL Beach is on the Cannes calendar this year.",
    angle: 'There is a useful crossover between your European media footprint and the mix of founders, marketers and agency leaders we will have in the villa.',
  },
  {
    host: 'Snapchat',
    eventName: 'Snapchat @ Cannes',
    to: ['emcdonnell@snapchat.com'],
    greeting: 'there',
    opener: "I can see Snapchat is back on the Cannes calendar this year.",
    angle: 'A more private session inside the villa around creativity, creators and platform culture would make a lot of sense for the week.',
  },
  {
    host: 'Stagwell',
    eventName: 'Stagwell Beach @ Cannes',
    to: ['beth.sidhu@stagwellglobal.com'],
    greeting: 'Beth',
    opener: "I can see Stagwell is bringing its Cannes beach activation back again this year.",
    angle: 'There is a strong opportunity for a more intimate co-hosted moment with the right room of brand and agency decision-makers at the villa.',
  },
  {
    host: 'Seedtag',
    eventName: 'Seedtag @ Cannes',
    to: ['partnerships@seedtag.com'],
    greeting: 'team',
    opener: "I can see Seedtag is on the Cannes calendar again this year.",
    angle: 'The contextual intelligence conversation you lead would translate well into a smaller, senior discussion inside the villa.',
  },
  {
    host: 'Spotify',
    eventName: 'Spotify Beach @ Cannes',
    to: ['bridget.evans@spotify.com'],
    cc: ['emma.vaughn@spotify.com', 'keyana.kashfi@spotify.com'],
    greeting: 'Bridget',
    opener: "I can see Spotify Beach is back in Cannes this year.",
    angle: 'Spotify’s cultural footprint is a natural match for the audience we are bringing together, and I think there is a real collaboration to explore there.',
  },
  {
    host: 'WPP',
    eventName: 'WPP @ Cannes',
    to: ['laurent.ezekiel@wpp.com'],
    greeting: 'Laurent',
    opener: "I can see WPP is back on the Cannes calendar this year.",
    angle: 'A more intimate leadership lunch or salon inside the villa would complement WPP’s wider presence in a way that could be genuinely useful.',
  },
  {
    host: 'Whalar',
    eventName: 'Whalar House @ Cannes',
    to: ['hello@whalar.com'],
    greeting: 'team',
    opener: "I can see Whalar House is back at Cannes this year.",
    angle: 'There is a clear creator-economy overlap between Whalar’s world and the people we are curating into the villa.',
  },
  {
    host: 'Yahoo',
    eventName: 'Yahoo! @ Cannes',
    to: ['shannon.montoya@yahooinc.com'],
    greeting: 'Shannon',
    opener: "I can see Yahoo is back on the Cannes calendar this year.",
    angle: 'I think there is a strong opportunity to build on the energy Yahoo has already created at Cannes by bringing a more selective room together at the villa.',
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
  const linkLine = recipient.eventUrl
    ? `I had a look at the activation page here: ${recipient.eventUrl}`
    : `${recipient.eventName} is on the calendar and clearly has real momentum behind it.`;

  return `Hi ${recipient.greeting},

${recipient.opener}

${linkLine}

I am reaching out because we are hosting Indvstry Power House during Cannes week - a private villa for senior leaders across creativity, culture, media and brand. We have 21 delegate passes to work with across the week, alongside the villa itself, and I would love to explore whether there is a collaboration between your activation and ours.

${recipient.angle}

If useful, more on the Power House is here:
${POWERHOUSE_URL}

If it feels worth a conversation, you can book time with me directly here:
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
      contentId: 'indvstryclvb-logo',
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
