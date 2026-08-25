import { chromium } from 'playwright-core';

const appUrl = process.env.AUDIT_URL ?? 'https://a2-pruefungsakte.vercel.app';
const expectedClientId = '287120001495-kvulj9fv1pvj774tvogvfukrp61mn3d4.apps.googleusercontent.com';
const expectedCallback = 'https://lvvhedokpxdcytczwdtl.supabase.co/auth/v1/callback';
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  const googleButton = page.locator('.google-auth-button');
  await googleButton.waitFor();
  await googleButton.click();
  await page.waitForURL(url => url.hostname === 'accounts.google.com', { timeout: 30000 });
  const destination = new URL(page.url());
  if (destination.searchParams.get('client_id') !== expectedClientId) throw new Error('Google received an unexpected OAuth client ID.');
  if (destination.searchParams.get('redirect_uri') !== expectedCallback) throw new Error('Google received an unexpected OAuth callback URL.');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Google OAuth smoke passed: production button, client ID, and Supabase callback are correct.');
} finally {
  await browser.close();
}
