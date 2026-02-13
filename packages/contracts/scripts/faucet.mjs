import puppeteer from 'puppeteer';

const ADDRESS = 'bcrt1qtxpewxepgjrl7cd9plkd6th3ls7uarf3sdu7cd';

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to faucet...');
  await page.goto('https://faucet.staging.midl.xyz/', { waitUntil: 'networkidle2' });

  console.log('Filling address...');
  // Find the input field and fill it
  const input = await page.waitForSelector('input[type="text"], input[name*="address"], input[placeholder*="address"], input');
  if (!input) {
    console.log('Page content:', await page.content());
    throw new Error('No input found');
  }

  await input.click({ clickCount: 3 });
  await input.type(ADDRESS);

  console.log('Submitting...');
  // Find and click submit button
  const button = await page.$('button[type="submit"], button');
  if (button) {
    await button.click();
    console.log('Clicked submit, waiting for response...');
    await page.waitForNetworkIdle({ timeout: 30000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 5000));

    // Check for success message
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Page text:', text.substring(0, 500));
  } else {
    console.log('No button found');
  }

  await browser.close();
  console.log('Done!');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
