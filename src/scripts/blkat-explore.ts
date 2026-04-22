import { chromium } from 'playwright';

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  await p.goto('https://www.blkat.org/create-acc', { waitUntil: 'networkidle', timeout: 30000 });
  await p.waitForTimeout(2000);

  // Click the Continue with Email link
  await p.locator('a:has-text("Continue with Email")').click();
  await p.waitForTimeout(3000);
  await p.screenshot({ path: 'src/scripts/screenshots/blkat-email-form.png' });
  console.log('URL:', p.url());

  const inputs = await p.$$eval('input', els => els.map(e => ({
    type: (e as HTMLInputElement).type,
    name: (e as HTMLInputElement).name,
    placeholder: (e as HTMLInputElement).placeholder,
    id: (e as HTMLInputElement).id,
  })));
  console.log('Inputs:', JSON.stringify(inputs, null, 2));

  const bodyText = await p.evaluate(() => document.body.innerText.slice(0, 2000));
  console.log('Body text:', bodyText);

  // Submit with test email to see step 2
  const emailInput = p.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('test.explore@indvstryclvb.com');
    await p.locator('button[type="submit"], button:has-text("Create Account"), button:has-text("Continue"), button:has-text("Next")').first().click();
    await p.waitForTimeout(4000);
    await p.screenshot({ path: 'src/scripts/screenshots/blkat-step2.png' });

    const inputs2 = await p.$$eval('input', els => els.map(e => ({
      type: (e as HTMLInputElement).type,
      name: (e as HTMLInputElement).name,
      placeholder: (e as HTMLInputElement).placeholder,
    })));
    console.log('Step 2 inputs:', JSON.stringify(inputs2, null, 2));

    const body2 = await p.evaluate(() => document.body.innerText.slice(0, 2000));
    console.log('Step 2 text:', body2);
  }

  await b.close();
})();
