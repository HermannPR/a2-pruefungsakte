import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { initialProgress } from '../src/data/curriculum.js';

const rootDirectory = process.cwd();
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localUrl = 'http://127.0.0.1:4177/?preview=1&onboarding-preview=1';
const screenshotDirectory = path.resolve('cv-screenshots', 'onboarding-tour');
const server = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4177', '--strictPort'], { cwd: rootDirectory, shell: process.platform === 'win32', stdio: 'ignore', windowsHide: true });
const tourTargets = ['avatar-companion', 'dashboard-focus', 'learn-plan', 'grammar-workshop', 'vocabulary-practice', 'skill-practice', 'exam-simulation', 'avatar-progress'];

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(localUrl)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Development server did not become ready.');
}

async function seedPage(page) {
  const progress = structuredClone(initialProgress);
  progress.avatar.setupComplete = true;
  await page.addInitScript(seed => {
    localStorage.setItem('a2-interface-language', 'en');
    localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(seed));
    localStorage.removeItem('a2-onboarding-complete:preview');
  }, progress);
}

async function expectStep(page, index, mobile = false) {
  const panel = page.locator('.guided-tour-panel');
  try { await panel.waitFor({ state: 'attached', timeout: 5000 }); } catch {
    const state = await page.evaluate(() => ({ overlay: history.state?.a2Overlay ?? null, step: history.state?.a2TourStep ?? null, completed: localStorage.getItem('a2-onboarding-complete:preview'), progress: JSON.parse(localStorage.getItem('a2-pruefungsakte-progress') || '{}').avatar, text: document.body.innerText.slice(0, 180) }));
    throw new Error(`Tour panel did not open: ${JSON.stringify(state)}.`);
  }
  const expectedCounter = `${String(index + 1).padStart(2, '0')} / 08`;
  try {
    await page.waitForFunction(expected => document.querySelector('.guided-tour-index strong')?.textContent?.trim() === expected, expectedCounter, { timeout: 5000 });
  } catch {
    const state = await page.evaluate(() => ({ counter: document.querySelector('.guided-tour-index strong')?.textContent ?? null, overlay: history.state?.a2Overlay ?? null, step: history.state?.a2TourStep ?? null, completed: localStorage.getItem('a2-onboarding-complete:preview'), progress: JSON.parse(localStorage.getItem('a2-pruefungsakte-progress') || '{}').avatar, hasSetup: Boolean(document.querySelector('.avatar-setup-dialog')), body: document.body.innerText.slice(0, 140) }));
    throw new Error(`Expected tour counter ${expectedCounter}: ${JSON.stringify(state)}.`);
  }
  await page.locator('.guided-tour-spotlight').waitFor();
  await page.locator('.guided-tour-speaker .tour-speech-dots').waitFor();
  const target = tourTargets[index] === 'exam-simulation' ? page.locator('.exam-cover-copy > .primary-button') : page.locator(`[data-tour="${tourTargets[index]}"]`);
  await target.waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  const geometry = await page.evaluate(({ isMobile, targetName }) => {
    const panelRect = document.querySelector('.guided-tour-panel').getBoundingClientRect();
    const spotlightRect = document.querySelector('.guided-tour-spotlight').getBoundingClientRect();
    const targetElement = targetName === 'exam-simulation' ? document.querySelector('.exam-cover-copy > .primary-button') : document.querySelector(`[data-tour="${targetName}"]`);
    const targetRect = targetElement?.getBoundingClientRect();
    const targetPanelOverlap = targetRect ? Math.max(0, Math.min(panelRect.right, targetRect.right) - Math.max(panelRect.left, targetRect.left)) * Math.max(0, Math.min(panelRect.bottom, targetRect.bottom) - Math.max(panelRect.top, targetRect.top)) : -1;
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      panelVisible: panelRect.left >= -1 && panelRect.right <= innerWidth + 1 && panelRect.top >= -1 && panelRect.bottom <= innerHeight + 1,
      panelDocked: !isMobile || Math.abs(panelRect.bottom - innerHeight) <= 2,
      spotlightVisible: spotlightRect.width > 20 && spotlightRect.height > 20,
      targetVisible: Boolean(targetRect && targetRect.bottom > 0 && targetRect.top < innerHeight && targetRect.right > 0 && targetRect.left < innerWidth),
      targetPanelOverlap,
      panel: [panelRect.left, panelRect.top, panelRect.right, panelRect.bottom],
      scroll: [scrollY, document.documentElement.scrollHeight - innerHeight],
      target: targetRect ? [targetRect.top, targetRect.bottom] : null
    };
  }, { isMobile: mobile, targetName: tourTargets[index] });
  if (geometry.overflow || !geometry.panelVisible || !geometry.panelDocked || !geometry.spotlightVisible || !geometry.targetVisible || geometry.targetPanelOverlap > 1) throw new Error(`Invalid tour geometry at step ${index + 1}: ${JSON.stringify(geometry)}`);
  const scrollBefore = await page.evaluate(() => scrollY);
  await page.mouse.move(4, 100);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(80);
  const scrollAfter = await page.evaluate(() => scrollY);
  if (scrollAfter !== scrollBefore) throw new Error(`Page scroll escaped the tour lock at step ${index + 1}: ${scrollBefore} -> ${scrollAfter}.`);
}

let browser;
try {
  await waitForServer();
  await mkdir(screenshotDirectory, { recursive: true });
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  desktop.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
  desktop.on('console', message => { if (message.type() === 'error') { errors.push(message.text()); console.error(message.text()); } });
  await seedPage(desktop);
  await desktop.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await expectStep(desktop, 0);
  await desktop.screenshot({ path: path.join(screenshotDirectory, '01-guppy-desktop.png') });
  if (!await desktop.locator('.guided-tour-guide').getByText('Guppy', { exact: true }).count()) throw new Error('Guppy is not leading the introduction.');
  await desktop.locator('.guided-tour-actions .primary-button').click();
  await expectStep(desktop, 1);
  await desktop.locator('.guided-tour-actions .primary-button').click();
  await expectStep(desktop, 2);
  await desktop.evaluate(() => history.back());
  await expectStep(desktop, 1);
  for (let index = 2; index < tourTargets.length; index += 1) {
    await desktop.locator('.guided-tour-actions .primary-button').click();
    await expectStep(desktop, index);
  }
  await desktop.screenshot({ path: path.join(screenshotDirectory, '02-rewards-desktop.png') });
  await desktop.locator('.guided-tour-actions .primary-button').click();
  await desktop.locator('.guided-tour-panel').waitFor({ state: 'detached' });
  if (await desktop.evaluate(() => localStorage.getItem('a2-onboarding-complete:preview')) !== '1') throw new Error('Tour completion was not persisted.');

  const mobile = await browser.newPage({ viewport: { width: 393, height: 873 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  mobile.on('pageerror', error => errors.push(error.message));
  mobile.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await seedPage(mobile);
  await mobile.goto(localUrl, { waitUntil: 'domcontentloaded' });
  for (let index = 0; index < tourTargets.length; index += 1) {
    await expectStep(mobile, index, true);
    if (index === 0) await mobile.screenshot({ path: path.join(screenshotDirectory, '03-guppy-mobile.png') });
    if (index < tourTargets.length - 1) await mobile.locator('.guided-tour-actions .primary-button').click();
  }
  await mobile.screenshot({ path: path.join(screenshotDirectory, '04-rewards-mobile.png') });
  if (errors.length) throw new Error(errors.join('\n'));
  const narrow = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  narrow.on('pageerror', error => errors.push(error.message));
  await seedPage(narrow);
  await narrow.goto(localUrl, { waitUntil: 'domcontentloaded' });
  for (let index = 0; index < tourTargets.length; index += 1) {
    await expectStep(narrow, index, true);
    if (index < tourTargets.length - 1) await narrow.locator('.guided-tour-actions .primary-button').click();
  }
  await narrow.close();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Onboarding flow passed: animated Guppy guide, eight live targets, browser Back, desktop, Poco-class, and narrow mobile placement.');
} finally {
  await browser?.close();
  server.kill();
}
