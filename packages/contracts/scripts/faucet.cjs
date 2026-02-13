const ADDRESS = 'bcrt1qtxpewxepgjrl7cd9plkd6th3ls7uarf3sdu7cd';

async function main() {
  // Dynamic import for global puppeteer
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    // Try npx path
    const { execSync } = require('child_process');
    const globalPath = execSync('npm root -g').toString().trim();
    puppeteer = require(globalPath + '/puppeteer');
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to faucet...');
  await page.goto('https://faucet.staging.midl.xyz/', { waitUntil: 'networkidle2', timeout: 30000 });

  console.log('Looking for input...');
  const input = await page.waitForSelector('input', { timeout: 10000 });

  await input.click({ clickCount: 3 });
  await input.type(ADDRESS);
  console.log('Address entered:', ADDRESS);

  const button = await page.$('button');
  if (button) {
    const btnText = await page.evaluate(el => el.textContent, button);
    console.log('Found button:', btnText.trim());
    await button.click();
    console.log('Clicked! Waiting...');

    await new Promise(r => setTimeout(r, 10000));

    const text = await page.evaluate(() => document.body.innerText);
    console.log('Result:', text.substring(0, 300));
  }

  await browser.close();
  console.log('Done!');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
