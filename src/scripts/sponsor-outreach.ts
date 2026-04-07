import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

// ─── PROGRESS TRACKING ───────────────────────────────────────────
const PROGRESS_FILE = path.resolve(__dirname, '../../sponsor-outreach-progress.json');

function loadProgress(): Set<string> {
  try {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    return new Set(data.sent || []);
  } catch { return new Set(); }
}

function saveProgress(sent: Set<string>) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ sent: [...sent], lastRun: new Date().toISOString() }, null, 2));
}

// ─── FULL DEDUPLICATED NAMED CONTACTS ────────────────────────────
// Generic inboxes (rsvp@, press@, events@, info@, contact@ etc) removed
// Duplicates removed. access@indvstryclvb.com excluded.
const ALL_CONTACTS: { name: string; email: string }[] = [
  // Page 1
  { name: 'Jason', email: 'Jason_melissos@diesel.com' },
  { name: 'Amy', email: 'Amy.hawkins@ogilvy.com' },
  { name: 'Oyin', email: 'Oyin.akiniyi@pernod-ricard.com' },
  { name: 'Bethany', email: 'Bethany.walker@pernod-ricard.com' },
  { name: 'Liam', email: 'Liam.holyoak-rackal@pernod-ricard.com' },
  { name: 'Jordan', email: 'Jordan@thepom.co' },
  { name: 'Pippa', email: 'Pippa@thepom.co' },
  { name: 'Frank', email: 'Frank@ucherum.com' },
  { name: 'Calum', email: 'Chudson@eventbrite.com' },
  { name: 'Matt', email: 'Matt.tuffuor@eventbrite.com' },
  { name: 'Michael', email: 'Michael@dayslikethisbrunch.co.uk' },
  { name: 'Ellie', email: 'Ellie.heatrick@whatsapp.com' },
  { name: 'Lucy', email: 'Lstreet@adobe.com' },
  { name: 'Katy', email: 'Katy_frost@cotyinc.com' },
  { name: 'Leoni', email: 'Leoni@weshft.co' },
  { name: 'Kevin', email: 'kevin.gomez@theroofgardens.com' },
  { name: 'Ben', email: 'Ben.marett@auvodka.co.uk' },
  { name: 'Max', email: 'Max.merttens@nandos.co.uk' },
  { name: 'Tally', email: 'Talisap@nandos.co.uk' },
  { name: 'Lucia', email: 'Lucia.des@sohohouse.com' },
  { name: 'Gina', email: 'Gina.powell@gymshark.com' },
  { name: 'Carl', email: 'Carl.young@vevo.com' },
  { name: 'Yomi', email: 'Yomi.ogunsola@vevo.com' },
  { name: 'Troy', email: 'Troy.antunes@yourichrecords.com' },
  { name: 'Rosie', email: 'Rosie.karaca@b-theagency.com' },
  { name: 'Harry', email: 'Harry@wearemirchi.com' },
  { name: 'Mubi', email: 'Mubi.ali@reebok.com' },
  { name: 'Munashe', email: 'Munashe.ashlyn@highsnobiety.com' },
  { name: 'Aneta', email: 'Aneta@labrumlondon.com' },
  { name: 'Dominique', email: 'Dominique.gardiner@superdry.com' },
  { name: 'Danielle', email: 'Danielle.anastasiou@superdry.com' },
  // Page 2
  { name: 'Katie', email: 'Katie.pollard@superdry.com' },
  { name: 'Damian', email: 'Damian.malontie@converse.com' },
  { name: 'Diruja', email: 'Dirujan.sabesan@lemon-pepper.co.uk' },
  { name: 'Caroline', email: 'Caroline@carolinegautier.com' },
  { name: 'Vanessa', email: 'Vanessa@sanecommunications.com' },
  { name: 'Chloe', email: 'Chloe@sanecommunications.com' },
  { name: 'Danielle', email: 'Danielle@sanecommunications.com' },
  { name: 'Lauren', email: 'Laurens@taste-pr.com' },
  { name: 'Caitlin', email: 'Caitlinw@taste-pr.com' },
  { name: 'Becca', email: 'Becca.fergus@mslgroup.com' },
  { name: 'Nia', email: 'Nia.feisal@mslgroup.com' },
  { name: 'Hayley', email: 'Hayley.ticehurst@mslgroup.com' },
  { name: 'Jon', email: 'Jon@thelighthouse.com' },
  { name: 'Ally', email: 'Ally@brixtonfinishingschool.org' },
  { name: 'Amy', email: 'Atyrer@bacardi.com' },
  { name: 'Madison', email: 'Madison.hahn@nike.com' },
  { name: 'Levi', email: 'Levi@bluemarlinibiza.london' },
  { name: 'Lucy', email: 'Lucy@zero21brands.com' },
  { name: 'Ibukun', email: 'Ibukun.oluwayomi@apollongroup.io' },
  { name: 'Jack', email: 'jack@theduppyshare.com' },
  { name: 'Sophie', email: 'sophielloyd@sovereignbrands.com' },
  { name: 'John', email: 'jslattery@markanthonyuk.com' },
  { name: 'Tom', email: 'tom.carson@jaegermeister.co.uk' },
  { name: 'Fionn', email: 'fionn.cox@pernod-ricard.com' },
  { name: 'Anne-Chantal', email: 'anne-chantal.leon@tindle.com' },
  { name: 'Daniel', email: 'daniel@tryzapp.com' },
  { name: 'Jonathan', email: 'Jonathan@brayandkrais.com' },
  { name: 'Meesh', email: 'Meesh@colorsxstudios.com' },
  { name: 'Lottie', email: 'Lottie@fabricpr.com' },
  { name: 'Susan', email: 'Susan@fullcirclelondon.com' },
  { name: 'Henry', email: 'Henry.bryant@jpress.co.uk' },
  { name: 'Megan', email: 'Megan@graduatefashionweek.com' },
  { name: 'Zoe', email: 'Zoe@weareindigopr.com' },
  { name: 'Eric', email: 'Eric@digitaliconagency.com' },
  { name: 'Natalia', email: 'Natalia@casselconsultancy.com' },
  { name: 'Jess', email: 'Jess@huntergracelondon.com' },
  { name: 'Jackie', email: 'Jackie.hyde@sonymusic.com' },
  { name: 'Shiarra', email: 'Shiarra.bell@umusic.com' },
  { name: 'Ivana', email: 'Ivana@ivanagiachino.com' },
  // Page 3
  { name: 'Abigail', email: 'Abigail@thecolour8.com' },
  { name: 'Kotryna', email: 'Kotryna@marbleldn.com' },
  { name: 'Milly', email: 'Milly@aipr.co.uk' },
  { name: 'Jamie', email: 'Jamiel@aipr.co.uk' },
  { name: 'Lucas', email: 'lucas.siqueira@ogilvy.com' },
  { name: 'Alfred', email: 'Alfred@kingdomcollective.co.uk' },
  { name: 'Misha', email: 'Mishaclarke@sovereignbrands.com' },
  { name: 'Krushna', email: 'Krushna@oluolufoods.com' },
  { name: 'Olivia', email: 'Olivia@thedrip.vip' },
  { name: 'Jonathan', email: 'Jonathan@canowater.com' },
  { name: 'Didier', email: 'Didier@pphe.com' },
  { name: 'Laquan', email: 'Laquansmith@purplepr.com' },
  { name: 'Charlotte', email: 'Charlotte.bristow@michaelkors.com' },
  { name: 'Dennis', email: 'dennisbasso@an-chorcommunication.com' },
  { name: 'Zankov', email: 'zankov@kaleidoscopepr.net' },
  { name: 'Jameela', email: 'jameela@modeworld.com' },
  { name: 'Gregory', email: 'gregory@loftcreativegroup.com' },
  { name: 'Kimshui', email: 'Kimshui@giakuan.com' },
  { name: 'Corie', email: 'Corie@ullajohnson.com' },
  { name: 'Jemima', email: 'Jemima.kinsella@size.co.uk' },
  { name: 'Jay', email: 'Jay.ajayi@size.co.uk' },
  { name: 'Tasha', email: 'Tasha.firth@size.co.uk' },
  { name: 'Chloe', email: 'chloe.fields@lapointehq.com' },
  { name: 'Prabal', email: 'Prabalgurung@kcdworldwide.com' },
  { name: 'Juliet', email: 'Juliet@clashmusic.com' },
  { name: 'Alex', email: 'Alex@clashmusic.com' },
  { name: 'Russev', email: 'Russev@emergingtalentspr.com' },
  { name: 'Bardha', email: 'Bardha@starrluxurycars.com' },
  { name: 'Kilian', email: 'Kilian@kcdworldwide.fr' },
  { name: 'Priscilla', email: 'Priscilla@grinddontstoprecords.com' },
  { name: 'Nicole', email: 'Nicole@kiribakuart.com' },
  // Page 4
  { name: 'Ify', email: 'Ify@afrolush.com' },
  { name: 'Karine', email: 'Karine@kayflawless.com' },
  { name: 'Kenisha', email: 'Kenisha.ganesh@seengroup.com' },
  { name: 'Elin', email: 'Elin@fabricpr.com' },
  { name: 'Koye', email: 'Koye@inevitablemusic.com' },
  { name: 'Julia', email: 'Julia@couriermedia.com' },
  { name: 'Louise', email: 'louise@huntergracelondon.com' },
  { name: 'Emma', email: 'Emmamoxhay@icloud.com' },
  // Page 5
  { name: 'Meg', email: 'Meg@casselconsultancy.com' },
  { name: 'Saumen', email: 'Saumen@londonorganicpr.com' },
  { name: 'Diana', email: 'Diana@dianadahliapr.com' },
  { name: 'Ginny', email: 'Ginny@buchananpr.com' },
  { name: 'Rob', email: 'Rob@tracepublicity.com' },
  { name: 'Selina', email: 'Selina.wong@fashioncrossover-london.com' },
  { name: 'Sophie', email: 'Sophie@paradisebolt.com' },
  { name: 'Sara', email: 'Sara@futurebrandthinking.com' },
  { name: 'Joe', email: 'Joe@listen-up.biz' },
  { name: 'Katerina', email: 'Katerina.marka@umusic.com' },
  { name: 'Jowayne', email: 'Jowayne.taylor@hotmail.com' },
  { name: 'Mano', email: 'Mano@darbyandparrett.com' },
  { name: 'Grace', email: 'Grace@withgraceconsultancy.com' },
  { name: 'Oliver', email: 'Oliver@perfumerh.com' },
  { name: 'Nick', email: 'Nick@loopvip.co.uk' },
  { name: 'Samir', email: 'Samir@wearemediahive.com' },
  { name: 'Mandy', email: 'Mandy@thelifestyle-agency.com' },
  // Page 6-7
  { name: 'Samantha', email: 'samantha@thelifestyle-agency.com' },
  { name: 'Daisy', email: 'Daisy@one88ag.com' },
  { name: 'Manee', email: 'Maneevanh@justincassin.com' },
  { name: 'Holly', email: 'Holly@iprlondon.com' },
  { name: 'Paige', email: 'Paige.twigger@substanceglobal.com' },
  { name: 'Tom', email: 'Tom@selfhood.asia' },
  { name: 'Laura', email: 'Laura@laura-merrit.co' },
  { name: 'Lewis', email: 'Lewis@avenuecommunications.co.uk' },
  { name: 'Kayah', email: 'Kayah@moreace.com' },
  { name: 'Matty', email: 'Mattybovan@agencyeleven.co.uk' },
  { name: 'Lori', email: 'Lori@thepop.group' },
  { name: 'Dan', email: 'Dan@markmeets.com' },
  { name: 'Sarah', email: 'Sarah@buchananpr.co.uk' },
  { name: 'Denise', email: 'Denisedainty27@gmail.com' },
  { name: 'Akshay', email: 'Akshay@theeditldn.com' },
  { name: 'Andreea', email: 'Andreea.antohi@remy-cointreau.com' },
  { name: 'Rita', email: 'Ritaoranyc@purplepr.com' },
  { name: 'Francesca', email: 'Francesca.ellis@b-theagency.com' },
  { name: 'Laura', email: 'Laura@peachyden.co.uk' },
  { name: 'Isabella', email: 'Isabella@areyoumad.co' },
  { name: 'Selina', email: 'Selina.cockell@axelarigato.com' },
  { name: 'Celeste', email: 'Celeste@lindafarrow.co.uk' },
  { name: 'Frida', email: 'Frida@iprlondon.com' },
  { name: 'Daniel', email: 'Daniel@lablaco.com' },
  { name: 'Tina', email: 'tina@tiparis.com' },
  // Page 8
  { name: 'Jasia', email: 'jasia@ideapr.co.uk' },
  { name: 'Paolo', email: 'Paolocarzana@agencyeleven.co.uk' },
  { name: 'Anoushka', email: 'Anoushka.borahesi@aiorgioarmani.it' },
  { name: 'Martha', email: 'Martha@curaconn.com' },
  { name: 'Jamie', email: 'Jamie.muir@zeitgeist.co.uk' },
  { name: 'Ellen', email: 'Ellen.dick@manoloblahnik.com' },
  { name: 'Kate', email: 'Kate@canoeinc.com' },
  { name: 'Mowalola', email: 'Mowalola@l52.co.uk' },
  { name: 'Jashel', email: 'Jashel@our-maison.com' },
  { name: 'Danielle', email: 'Danielle@cherrycreate.com' },
  { name: 'Natasha', email: 'Natashazinko@agencyeleven.co.uk' },
  { name: 'Ethan', email: 'Ethan@agencyeleven.co.uk' },
  { name: 'Livia', email: 'Livia.thompson@christopherkane.com' },
  // Page 9
  { name: 'Georgie', email: 'Georgie@blackpr.co.uk' },
  { name: 'Joe', email: 'Joe@streamlinepr.co.uk' },
  { name: 'Gemma', email: 'Gemma@ghpr.co.uk' },
  { name: 'Nicholas', email: 'nicholasdaley@agencyeleven.co.uk' },
  { name: 'Felicia', email: 'Felicia@our-maison.com' },
  { name: 'Elian', email: 'Elian@nouvelle.london' },
  { name: 'Serayah', email: 'Serayah@alphonsoreed.com' },
  { name: 'Francis', email: 'Francis@yeboahonline.com' },
  { name: 'Katie', email: 'Katie@weareindigopr.com' },
  { name: 'Efosa', email: 'Efosa@newwavemagazine.com' },
  { name: 'Georgina', email: 'Georgina@emergelimited.com' },
  { name: 'Esme', email: 'Esme@eyc-ltd.com' },
  { name: 'Kelly', email: 'Kelly.tanti@purplepr.com' },
  { name: 'Ben', email: 'Ben@drawingablank.co.uk' },
  { name: 'Tamara', email: 'Tamara@kravitsinaba.com' },
  { name: 'Mel', email: 'Mel.rudder@atlanticrecords.co.uk' },
  { name: 'Anya', email: 'Anya@uycacademy.com' },
  { name: 'William', email: 'William@totemfashion.com' },
  // Page 10
  { name: 'Ivana', email: 'Ivana@turnupbc.co.uk' },
  { name: 'Kriste', email: 'Kriste.baltrunaite@drake-morgan.co.uk' },
  { name: 'Stefanie', email: 'Stefanie.hutton@russellandbromley.co.uk' },
  { name: 'Ellie', email: 'Ellie.nevill@ashfieldhealth.com' },
  { name: 'Michelle', email: 'Michelle.tombs@evokegroup.com' },
  { name: 'Maya', email: 'Maya.owolade@superdry.com' },
  { name: 'Lisa', email: 'Lisa@elamentpr.co.uk' },
  { name: 'Zain', email: 'Zainahmad@rastah.co' },
  { name: 'Amin', email: 'Amin@rastah.co' },
  { name: 'Mikey', email: 'Mikey@pluggedinpr.co.uk' },
  { name: 'Aarti', email: 'Aarti@alwaysprotectedpublicity.com' },
  { name: 'Dulcie', email: 'Dulcie.pryslopski@i-cubed.co.uk' },
  { name: 'Zoe', email: 'Zoe@lisabuchan.com' },
  { name: 'Chloe', email: 'chloe@bornemedia.co.uk' },
  { name: 'Denise', email: 'Denise@bornemedia.co.uk' },
  // Page 11
  { name: 'Sasha', email: 'Sasha@kmrconsultancy.co.uk' },
  { name: 'Becca', email: 'Becca@blackpr.co.uk' },
  { name: 'Alice', email: 'Alice@arddunagency.com' },
  { name: 'Chetlo', email: 'Chetlo@purplepr.com' },
  { name: 'Masha', email: 'Mashapopova@weareravenagency.com' },
  { name: 'Ali', email: 'Ali.barzilay@sonymusic.com' },
  { name: 'Lucy', email: 'Lucy@streamlinepr.co.uk' },
  { name: 'Jason', email: 'Jason.morais@warnermusic.com' },
  { name: 'Simon', email: 'Simon@simonjonespr.com' },
  { name: 'Shannon', email: 'Shannon.bulmer@uktv.co.uk' },
  { name: 'Eugenie', email: 'Eugenie.spencer@ddapr.com' },
  { name: 'Abby', email: 'Abby@eyc-ltd.com' },
  { name: 'Dani', email: 'Dani.gray@ksubi.com' },
  { name: 'Sheila', email: 'Sheila@blackpr.co.uk' },
  // Page 12
  { name: 'Dresden', email: 'Dresden@lovethemessage.com' },
  { name: 'Luke', email: 'Luke@amoo.co.uk' },
  { name: 'Rachel', email: 'Rachel@weareravenagency.com' },
  { name: 'Petronella', email: 'Petronella@idncommunications.co.uk' },
  { name: 'Ellie', email: 'Ellie@sanecommunications.com' },
  { name: 'Christopher', email: 'Christopher.scott@standardhotels.com' },
  { name: 'Lois', email: 'Lois@in-addition.com' },
  { name: 'Chelsea', email: 'Chelsea@clarendonfineart.com' },
  { name: 'James', email: 'James@jamesloach.co' },
  { name: 'Sean', email: 'Sean@bordeauxdistilling.co' },
  { name: 'Flora', email: 'Flora@wax-talent.com' },
  { name: 'Mark', email: 'Mark@upresentedoy.com' },
  { name: 'Aylah', email: 'Aylah.shabbir-din@emea.shiseido.com' },
];

// ─── EMAIL HELPERS ────────────────────────────────────────────────
async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access'
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

function buildHtml(bodyText: string): string {
  const logoB64 = getLogoBase64();
  const logoHtml = logoB64
    ? `<img src="cid:indvstry-logo" alt="Indvstry Clvb" width="180" style="display:block;margin-bottom:12px;" />`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>${bodyText.replace(/\n/g, '<br>')}</div>
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

function buildBody(firstName: string): string {
  return `Hi ${firstName},

I hope this finds you well. My name is Amber and I am reaching out on behalf of Indvstry Clvb, a digital private members club for creative professionals.

This June, we are taking our community to Cannes Lions, the biggest advertising and creativity festival in the world, and we are building something we think is going to turn heads.

Indvstry Power House is our flagship activation at Cannes Lions 2026. An exclusive villa experience bringing together some of the most exciting names in culture, brand and media for a week of curated dinners, panels, networking and moments that will get people talking. Think intimate, high-access and genuinely unforgettable.

We are looking for a select group of brand partners to come on board as sponsors. This is a chance to put your brand directly in front of an influential, culturally-switched-on audience in one of the most powerful settings in the industry. Your involvement comes with genuine visibility, meaningful connections and the kind of experience your brand will want to be associated with.

You can take a look at our sponsorship deck here:
https://www.canva.com/design/DAHEVA4r_tM/6C7UAsxexqHtaCzUddHSeg/edit?utm_content=DAHEVA4r_tM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

If this sounds like something worth a conversation, we would love to get on a call. You can book a time directly here:
https://calendly.com/itsvisionnaire/30min

Looking forward to hearing from you.`;
}

async function sendOne(token: string, contact: { name: string; email: string }, logoB64: string): Promise<boolean> {
  const bodyText = buildBody(contact.name);
  const message: any = {
    subject: "Let's activate together at Cannes Lions 2026",
    body: { contentType: 'HTML', content: buildHtml(bodyText) },
    toRecipients: [{ emailAddress: { address: contact.email, name: contact.name } }],
    from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'Amber Jacobs' } }
  };
  if (logoB64) {
    message.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: 'indvstry-logo.png',
      contentType: 'image/png',
      contentBytes: logoB64,
      contentId: 'indvstry-logo',
      isInline: true
    }];
  }
  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    { message },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return true;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const sent = loadProgress();
  const unsent = ALL_CONTACTS.filter(c => !sent.has(c.email.toLowerCase()));
  const batch = unsent.slice(0, 50);

  console.log(`Total contacts: ${ALL_CONTACTS.length}`);
  console.log(`Already sent: ${sent.size}`);
  console.log(`Remaining: ${unsent.length}`);
  console.log(`Sending today's batch: ${batch.length}\n`);

  if (batch.length === 0) {
    console.log('All contacts have been emailed.');
    return;
  }

  const token = await getToken();
  const logoB64 = getLogoBase64();
  let successCount = 0;

  for (const contact of batch) {
    try {
      await sendOne(token, contact, logoB64);
      sent.add(contact.email.toLowerCase());
      saveProgress(sent);
      console.log(`Sent to ${contact.name} <${contact.email}>`);
      successCount++;
      await sleep(1500); // ~1.5s between sends to avoid rate limits
    } catch (err: any) {
      console.error(`Failed: ${contact.email} — ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  console.log(`\nDone. Sent ${successCount}/${batch.length} emails today.`);
  console.log(`${unsent.length - batch.length} remaining for future days.`);
}

main().catch(console.error);
