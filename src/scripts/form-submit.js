const { chromium } = require('playwright');

const message = `Hello,

I am writing to request a quote for private group transportation for a party of 15 people over five days in June 2026.

Journey details:
- Pickup location: 19 Chemin du Vivier, Grasse, Alpes-Maritimes 06130, France
- Drop-off location: 1 Boulevard de la Croisette, 06414 Cannes Cedex, France
- Dates: Monday 22nd June to Friday 26th June 2026
- Daily schedule: Departure from Grasse at 8:00am, return collection from Cannes at 6:00pm
- Passengers: 15

We require a comfortable vehicle suitable for 15 passengers, dedicated exclusively to our group for the full day on each of the five days.

Could you please provide a full five-day quote including any additional costs such as fuel, tolls, driver expenses or applicable taxes?

Thank you for your time. I look forward to hearing from you.

Kind regards,
George Guise
Indvstry Clvb
access@indvstryclvb.com`;

async function fillAndSubmit(page, siteName) {
  await page.waitForTimeout(2000);

  const nameField = await page.$('input[name*="name" i]:not([name*="last" i]), input[placeholder*="name" i]');
  if (nameField) await nameField.fill('George Guise');

  const emailField = await page.$('input[type="email"], input[name*="email" i]');
  if (emailField) await emailField.fill('access@indvstryclvb.com');

  const phoneField = await page.$('input[type="tel"], input[name*="phone" i], input[placeholder*="phone" i]');
  if (phoneField) await phoneField.fill('+447438932403');

  const subjectField = await page.$('input[name*="subject" i], input[placeholder*="subject" i]');
  if (subjectField) await subjectField.fill('Private Group Transportation Quote Request — Cannes, June 2026');

  const textarea = await page.$('textarea');
  if (textarea) await textarea.fill(message);

  const hasCaptcha = await page.$('iframe[src*="recaptcha"], div.g-recaptcha, div[data-sitekey]');
  if (hasCaptcha) {
    console.log(siteName + ': CAPTCHA detected — skipping');
    return false;
  }

  const submitted = await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"], input[type="submit"], button[class*="submit" i]');
    if (btn) { btn.click(); return true; }
    return false;
  });

  await page.waitForTimeout(4000);
  const bodyText = await page.textContent('body');
  if (/thank|success|sent|merci|envoy|recu|reçu/i.test(bodyText)) {
    console.log(siteName + ': SUCCESS');
    return true;
  }

  // Look for a contact email on the page
  const emailMatch = bodyText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
  const realEmails = (emailMatch || []).filter(e => !e.includes('sentry') && !e.includes('example') && !e.includes('wix'));
  if (realEmails.length) console.log(siteName + ': email on page — ' + realEmails[0]);
  else console.log(siteName + ': submitted=' + submitted + ', no confirmation detected');
  return submitted;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // --- Tour Azur ---
  try {
    const page = await browser.newPage();
    await page.goto('https://tourazur.com/en/contact-tour-azur', { waitUntil: 'networkidle', timeout: 25000 });
    await fillAndSubmit(page, 'Tour Azur');
    await page.close();
  } catch(e) { console.log('Tour Azur error:', e.message.substring(0, 120)); }

  // --- JJ Cannes Services ---
  try {
    const page = await browser.newPage();
    await page.goto('https://jj-cannesservices.com', { waitUntil: 'load', timeout: 30000 });
    // Look for contact link
    const contactHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const contact = links.find(l => /contact/i.test(l.textContent + l.href));
      return contact ? contact.href : null;
    });
    if (contactHref) {
      console.log('JJ Cannes contact page:', contactHref);
      await page.goto(contactHref, { waitUntil: 'networkidle', timeout: 20000 });
      await fillAndSubmit(page, 'JJ Cannes');
    } else {
      await fillAndSubmit(page, 'JJ Cannes (homepage)');
    }
    await page.close();
  } catch(e) { console.log('JJ Cannes error:', e.message.substring(0, 120)); }

  // --- Cannes Limo Service ---
  try {
    const page = await browser.newPage();
    await page.goto('https://cannes-limo-service.com', { waitUntil: 'networkidle', timeout: 25000 });
    const contactHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const contact = links.find(l => /contact/i.test(l.textContent + l.href));
      return contact ? contact.href : null;
    });
    if (contactHref) {
      console.log('Cannes Limo contact page:', contactHref);
      await page.goto(contactHref, { waitUntil: 'networkidle', timeout: 20000 });
    }
    await fillAndSubmit(page, 'Cannes Limo');
    await page.close();
  } catch(e) { console.log('Cannes Limo error:', e.message.substring(0, 120)); }

  await browser.close();
})();
