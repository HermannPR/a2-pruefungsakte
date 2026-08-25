import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

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

const server = startDevelopmentServer();
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('dialog', dialog => dialog.accept());
  await page.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.sidebar nav button').nth(5).click();
  await page.locator('.exam-cover-copy > .primary-button').click();
  await page.locator('.official-answer-row button').first().click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('a2-full-exam-v1')));
  if (stored?.answers?.reading?.[1] !== 'a') throw new Error('Reading answer was not autosaved.');
  for (const scrollPosition of [400, 900]) {
    await page.evaluate(position => window.scrollTo(0, position), scrollPosition);
    await page.waitForTimeout(100);
    const layout = await page.evaluate(() => {
      const header = document.querySelector('.full-exam-header').getBoundingClientRect();
      const tabs = document.querySelector('.exam-part-tabs').getBoundingClientRect();
      const answers = document.querySelector('.official-answer-sheet').getBoundingClientRect();
      return { header: { top: header.top, bottom: header.bottom }, tabs: { top: tabs.top, bottom: tabs.bottom }, answers: { top: answers.top, bottom: answers.bottom }, viewportHeight: innerHeight, horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    if (layout.tabs.top < layout.header.bottom - 1) throw new Error(`Section tabs overlap the timer header at scroll ${scrollPosition}.`);
    if (layout.answers.bottom > 0 && layout.answers.top < layout.viewportHeight && layout.answers.top < layout.tabs.bottom - 1) throw new Error(`Answer sheet overlaps section tabs at scroll ${scrollPosition}.`);
    if (layout.horizontalOverflow) throw new Error(`Full exam overflows horizontally at scroll ${scrollPosition}.`);
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  for (const expectedSection of ['Hören', 'Schreiben', 'Sprechen']) {
    await page.locator('.exam-submit-bar .primary-button').click();
    await page.waitForFunction(section => document.querySelector('.full-exam-header h1')?.textContent === section, expectedSection);
  }
  await page.locator('.exam-submit-bar .primary-button').click();
  await page.locator('.exam-result-grid').waitFor();
  if (await page.locator('.exam-result-grid > div').count() !== 4) throw new Error('Final result does not contain four section scores.');
  if (await page.evaluate(() => localStorage.getItem('a2-full-exam-v1') !== null)) throw new Error('Completed exam remained in interrupted-session storage.');

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await mobilePage.locator('.menu-trigger').click();
  await mobilePage.locator('.sidebar nav button').nth(5).click();
  await mobilePage.locator('.exam-cover-copy > .primary-button').click();
  for (const scrollPosition of [300, 800, 1300]) {
    await mobilePage.evaluate(position => window.scrollTo(0, position), scrollPosition);
    await mobilePage.waitForTimeout(100);
    const layout = await mobilePage.evaluate(() => {
      const header = document.querySelector('.full-exam-header').getBoundingClientRect();
      const tabs = document.querySelector('.exam-part-tabs').getBoundingClientRect();
      return { headerBottom: header.bottom, tabsTop: tabs.top, horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    if (layout.tabsTop < layout.headerBottom - 1) throw new Error(`Mobile section tabs overlap the timer header at scroll ${scrollPosition}.`);
    if (layout.horizontalOverflow) throw new Error(`Mobile full exam overflows horizontally at scroll ${scrollPosition}.`);
  }
  const lastPart = mobilePage.locator('.exam-part-tabs button').last();
  await lastPart.scrollIntoViewIfNeeded();
  await lastPart.click();
  if (!await lastPart.evaluate(element => element.classList.contains('active'))) throw new Error('Mobile horizontal part navigation did not activate the final part.');
  await mobilePage.close();
  console.log('Full exam smoke test passed: autosave, four locked sections, and final result ledger.');
} finally {
  if (browser) await browser.close();
  server.kill();
}
