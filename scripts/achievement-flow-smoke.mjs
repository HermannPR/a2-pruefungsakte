import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { initialProgress } from '../src/data/curriculum.js';

const rootDirectory = process.cwd();
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localUrl = 'http://127.0.0.1:5173/?preview=1';

function startDevelopmentServer() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return spawn(command, ['run', 'dev', '--', '--host', '127.0.0.1'], { cwd: rootDirectory, shell: process.platform === 'win32', stdio: 'ignore', windowsHide: true });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(localUrl)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Development server did not become ready.');
}

const seededProgress = structuredClone(initialProgress);
for (const skillId of ['reading', 'listening', 'writing', 'speaking']) seededProgress.skills[skillId] = { earned: 60, possible: 100 };

const server = startDevelopmentServer();
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(progress => {
    if (sessionStorage.getItem('a2-achievement-test-seeded')) return;
    sessionStorage.setItem('a2-achievement-test-seeded', '1');
    localStorage.setItem('a2-interface-language', 'en');
    localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress));
  }, seededProgress);
  await page.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.achievement-popup').waitFor();

  let popupCount = 0;
  while (await page.locator('.achievement-popup').count()) {
    await page.locator('.achievement-popup').waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) throw new Error('Achievement popup causes horizontal overflow on mobile.');
    popupCount += 1;
    await page.locator('.achievement-popup .primary-button').click();
  }
  if (popupCount !== 6) throw new Error(`Expected six achievement popups, received ${popupCount}.`);

  await page.waitForTimeout(800);
  await page.locator('.menu-trigger').click();
  await page.locator('.sidebar nav button').nth(6).click();
  await page.locator('.achievement-grid').waitFor();
  if (await page.locator('.achievement-grid article.unlocked').count() !== 6) throw new Error('Achievement collection did not retain all six badges.');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  if (await page.locator('.achievement-popup').count()) throw new Error('Persisted achievements unlocked twice after reload.');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Achievement flow passed: mobile popup queue, six persisted badges, and no duplicate unlocks.');
} finally {
  await browser?.close();
  server.kill();
}
