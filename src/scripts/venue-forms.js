const { chromium } = require('playwright');

const message = `Hello,

My name is Amber and I am reaching out on behalf of a private group to enquire about availability for an exclusive dinner booking at your venue.

Here are the details:

Date: Monday 23rd June 2026
Time: 6:00pm to 10:00pm
Guests: 30 people
Setup: Private or semi-private booking preferred, intimate setting

We are looking for a venue that can offer a curated 3-course set menu including starters, mains and desserts, with welcome drinks on arrival (ideally prosecco or a welcome cocktail).

Our group has a mix of dietary requirements including meat eaters, pescatarians, vegetarians and vegans, so we would need the menu to cater for all of these. We are happy to work with your team on a bespoke menu if that is something you can accommodate.

We would love to know:
1. Whether you have availability for this date and time
2. What private or semi-private dining options you can offer for a group of 30
3. What kind of set menu you could curate for us, including options for all dietary requirements
4. Your pricing per head or overall package cost for an evening like this

We are looking for a scenic, relaxed and intimate atmosphere with good food at its heart. If your venue can deliver on this we would love to take things further.

Please feel free to reply to this email or call me directly and I would be happy to discuss further.

Looking forward to hearing from you.

Warm regards,
Amber Jacobs
Community Manager, Indvstry Clvb
access@indvstryclvb.com`;

const subject = 'Private Dinner Enquiry — 30 Guests, 23rd June 2026';

async function fillAndSubmit(page, siteName) {
  await page.waitForTimeout(3000);

  const hasCaptcha = await page.$('iframe[src*="recaptcha"], div.g-recaptcha, div[data-sitekey], iframe[src*="hcaptcha"], iframe[title*="reCAPTCHA"]');
  if (hasCaptcha) {
    // Check for emails on the page instead
    const bodyText = await page.textContent('body').catch(() => '');
    const emailMatch = bodyText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
    const realEmails = (emailMatch || []).filter(e => !e.includes('sentry') && !e.includes('example') && !e.includes('wix') && !e.includes('jquery'));
    if (realEmails.length) console.log(siteName + ': CAPTCHA — email found: ' + realEmails[0]);
    else console.log(siteName + ': CAPTCHA detected — cannot automate');
    return false;
  }

  const nameField = await page.$('input[name*="name" i]:not([name*="last" i]):not([name*="sur" i]), input[placeholder*="name" i], input[placeholder*="nom" i], input[id*="name" i]');
  if (nameField) await nameField.fill('Amber Jacobs').catch(() => {});

  const emailField = await page.$('input[type="email"], input[name*="email" i], input[placeholder*="email" i], input[placeholder*="mail" i]');
  if (emailField) await emailField.fill('access@indvstryclvb.com').catch(() => {});

  const phoneField = await page.$('input[type="tel"], input[name*="phone" i], input[placeholder*="phone" i], input[placeholder*="telephone" i], input[placeholder*="tel" i]');
  if (phoneField) await phoneField.fill('+447438932403').catch(() => {});

  const subjectField = await page.$('input[name*="subject" i], input[placeholder*="subject" i], input[placeholder*="sujet" i], input[id*="subject" i]');
  if (subjectField) await subjectField.fill(subject).catch(() => {});

  const textarea = await page.$('textarea');
  if (textarea) await textarea.fill(message).catch(() => {});

  if (!emailField && !textarea) {
    console.log(siteName + ': no form fields found');
    return false;
  }

  const submitted = await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"], input[type="submit"], button[class*="submit" i], button:last-of-type');
    if (btn) { btn.click(); return true; }
    return false;
  });

  await page.waitForTimeout(4000);
  const bodyText = await page.textContent('body').catch(() => '');
  if (/thank|success|sent|merci|envoy|recu|reçu|bien|received|message.*sent/i.test(bodyText)) {
    console.log(siteName + ': SUCCESS');
    return true;
  }

  const emailMatch = bodyText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
  const realEmails = (emailMatch || []).filter(e =>
    !e.includes('sentry') && !e.includes('example') && !e.includes('wix') &&
    !e.includes('jquery') && !e.includes('schema') && !e.includes('w3')
  );
  if (realEmails.length) console.log(siteName + ': submitted=' + submitted + ' | email on page: ' + realEmails[0]);
  else console.log(siteName + ': submitted=' + submitted + ' (no confirmation text detected)');
  return submitted;
}

async function visitAndSubmit(browser, url, siteName) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });

    // Check if we need to find a contact subpage
    const hasForm = await page.$('form');
    if (!hasForm) {
      const contactHref = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const found = links.find(l => /contact|enqui|book|reserver|privatisation/i.test(l.textContent + l.href));
        return found ? found.href : null;
      });
      if (contactHref && contactHref !== url) {
        await page.goto(contactHref, { waitUntil: 'networkidle', timeout: 20000 });
      }
    }

    await fillAndSubmit(page, siteName);
  } catch(e) {
    console.log(siteName + ' error:', e.message.substring(0, 100));
  }
  await page.close();
}

const venues = [
  { url: 'https://miramarplage.fr/en/contact', name: 'Miramar Plage' },
  { url: 'https://vegalaplage.com', name: 'Vega La Plage' },
  { url: 'https://lamomeplage.com/en/contact', name: 'La Mome Plage' },
  { url: 'https://radoplage.com', name: 'Rado Plage' },
  { url: 'https://ondine-plage.com', name: 'Ondine Beach' },
  { url: 'https://longbeach-cannes.com', name: 'Long Beach' },
  { url: 'https://cbeachcannes.com', name: 'CBeach' },
  { url: 'https://plage-du-festival.com', name: 'Plage du Festival' },
  { url: 'https://www.hotelsbarriere.com/en/cannes/le-majestic/restaurants/mademoiselle-gray.html', name: 'Mademoiselle Gray' },
  { url: 'https://bellesrives.com', name: 'La Plage Belles Rives' },
  { url: 'https://ca-beachhotel.com', name: 'Les Pecheurs' },
  { url: 'https://epibeach.fr', name: 'Epi Beach' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const venue of venues) {
    await visitAndSubmit(browser, venue.url, venue.name);
  }

  await browser.close();
})();
