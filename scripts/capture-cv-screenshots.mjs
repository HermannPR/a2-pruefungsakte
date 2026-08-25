import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const appUrl = process.env.AUDIT_URL ?? 'https://a2-pruefungsakte.vercel.app';
const outputDirectory = path.join(process.cwd(), 'cv-screenshots');
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const projectReference = 'lvvhedokpxdcytczwdtl';
const userId = '00000000-0000-4000-8000-000000000002';

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

const expiresAt = Math.floor(Date.now() / 1000) + 3600;
const session = {
  access_token: `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({ aud: 'authenticated', exp: expiresAt, sub: userId, email: 'portfolio-demo@example.invalid', role: 'authenticated' })}.portfolio`,
  refresh_token: 'portfolio-screenshot-refresh-token',
  expires_at: expiresAt,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'portfolio-demo@example.invalid', user_metadata: { display_name: 'Portfolio Demo' } }
};

async function authenticatedContext(browser, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await context.route(`https://${projectReference}.supabase.co/rest/v1/**`, async route => {
    const method = route.request().method();
    await route.fulfill({ status: method === 'GET' ? 200 : 201, contentType: 'application/json', body: method === 'GET' ? '[]' : '{}' });
  });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: `sb-${projectReference}-auth-token`,
    value: session
  });
  return context;
}

async function capture(page, fileName, fullPage = true) {
  await page.waitForTimeout(250);
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(outputDirectory, fileName), fullPage });
}

async function captureElement(locator, fileName) {
  const page = locator.page();
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    document.activeElement?.blur();
    const topbar = document.querySelector('.topbar');
    if (topbar) {
      topbar.dataset.capturePosition = topbar.style.position;
      topbar.style.position = 'absolute';
    }
  });
  await page.waitForTimeout(100);
  await locator.screenshot({ path: path.join(outputDirectory, fileName) });
  await page.evaluate(() => {
    const topbar = document.querySelector('[data-capture-position]');
    if (!topbar) return;
    topbar.style.position = topbar.dataset.capturePosition;
    delete topbar.dataset.capturePosition;
  });
}

async function navigate(page, index, mobile = false) {
  if (mobile) await page.locator('.menu-trigger').click();
  await page.locator('.sidebar nav button').nth(index).click();
  await page.waitForTimeout(200);
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  const authDesktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await authDesktop.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await authDesktop.locator('.google-auth-button').waitFor();
  await capture(authDesktop, '01-auth-google-desktop.png', false);
  await authDesktop.close();

  const desktopContext = await authenticatedContext(browser, { width: 1440, height: 1000 });
  const desktop = await desktopContext.newPage();
  await desktop.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await desktop.locator('.app-shell').waitFor();
  await desktop.locator('.onboarding-card').waitFor();
  await capture(desktop, '02-onboarding-desktop.png', false);
  await desktop.locator('.onboarding-card .dialog-close').click();
  await capture(desktop, '03-dashboard-desktop.png');

  await navigate(desktop, 1);
  await capture(desktop, '04-learning-plan-desktop.png');
  await navigate(desktop, 2);
  await desktop.locator('.option-list button').first().click();
  await desktop.locator('.practice-actions .primary-button').click();
  await desktop.locator('.grammar-teaching-feedback').waitFor();
  await desktop.locator('.teaching-actions button').first().click();
  await desktop.locator('.mini-lesson').waitFor();
  await captureElement(desktop.locator('.grammar-dossier'), '05-grammar-feedback-desktop.png');
  await navigate(desktop, 3);
  await capture(desktop, '06-vocabulary-desktop.png');
  await desktop.locator('.vocabulary-source-switch button').nth(2).click();
  await desktop.locator('.article-options button').first().click();
  await desktop.locator('.article-feedback').waitFor();
  await captureElement(desktop.locator('.article-trainer'), '06b-article-training-desktop.png');
  await navigate(desktop, 4);
  await capture(desktop, '07-practice-desktop.png');
  await navigate(desktop, 5);
  await capture(desktop, '08-exam-cover-desktop.png');
  await desktop.locator('.exam-cover-copy > .primary-button').click();
  await desktop.locator('.full-exam-header').waitFor();
  await capture(desktop, '09-active-exam-desktop.png', false);
  await navigate(desktop, 6);
  await capture(desktop, '10-progress-desktop.png');
  await desktopContext.close();

  const authMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await authMobile.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await authMobile.locator('.google-auth-button').waitFor();
  await capture(authMobile, '11-auth-google-mobile.png', false);
  await authMobile.close();

  const mobileContext = await authenticatedContext(browser, { width: 390, height: 844 });
  const mobile = await mobileContext.newPage();
  await mobile.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await mobile.locator('.app-shell').waitFor();
  await mobile.locator('.onboarding-card .dialog-close').click();
  await capture(mobile, '12-dashboard-mobile.png');
  await navigate(mobile, 2, true);
  await mobile.locator('.option-list button').first().click();
  await mobile.locator('.practice-actions .primary-button').click();
  await mobile.locator('.grammar-teaching-feedback').waitFor();
  await mobile.locator('.teaching-actions button').first().click();
  await mobile.locator('.mini-lesson').waitFor();
  await captureElement(mobile.locator('.grammar-dossier'), '13-grammar-feedback-mobile.png');
  await navigate(mobile, 3, true);
  await mobile.locator('.vocabulary-source-switch button').nth(2).click();
  await mobile.locator('.article-options button').first().click();
  await mobile.locator('.article-feedback').waitFor();
  await captureElement(mobile.locator('.article-trainer'), '13b-article-training-mobile.png');
  await navigate(mobile, 5, true);
  await mobile.locator('.exam-cover-copy > .primary-button').click();
  await mobile.locator('.full-exam-header').waitFor();
  await capture(mobile, '14-active-exam-mobile.png', false);
  await mobileContext.close();

  fs.writeFileSync(path.join(outputDirectory, 'README.txt'), [
    'A2 Prüfungsakte — CV / portfolio screenshots',
    '',
    'Recommended hero images: 03-dashboard-desktop.png and 12-dashboard-mobile.png',
    'Feature images: adaptive grammar teaching, der/die/das article training, vocabulary, practice, timed exam, progress, onboarding, and Google authentication.',
    'All authenticated screenshots use a synthetic Portfolio Demo user and do not contain real user data.',
    `Captured from ${appUrl}`
  ].join('\n'));
  console.log(`Created 16 privacy-safe CV screenshots in ${outputDirectory}.`);
} finally {
  await browser.close();
}
