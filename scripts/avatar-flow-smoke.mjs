import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { initialProgress } from '../src/data/curriculum.js';
import { accessories, animals } from '../src/avatar/avatarCatalog.js';

const rootDirectory = process.cwd();
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localUrl = 'http://127.0.0.1:5173/?preview=1';
const server = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--host', '127.0.0.1'], { cwd: rootDirectory, shell: process.platform === 'win32', stdio: 'ignore', windowsHide: true });

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(localUrl)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Development server did not become ready.');
}

const seededProgress = structuredClone(initialProgress);
seededProgress.avatar = {
  ...seededProgress.avatar,
  setupComplete: true,
  selectedAnimalId: 'owl',
  unlockedAnimals: animals.map(item => item.id),
  unlockedAccessories: accessories.map(item => item.id)
};

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(progress => {
    if (sessionStorage.getItem('a2-avatar-test-seeded')) return;
    sessionStorage.setItem('a2-avatar-test-seeded', '1');
    localStorage.setItem('a2-interface-language', 'en');
    localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress));
  }, seededProgress);
  await page.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.avatar-companion-card').waitFor();
  if (await page.locator('.learner-avatar.companion').count() !== 1) throw new Error('Dashboard companion is missing.');
  await page.locator('.avatar-settings-button').click();
  await page.locator('.avatar-collection').waitFor();
  await page.locator('[data-avatar-item="cat"]').click();
  for (const animal of animals) {
    await page.locator(`[data-avatar-item="${animal.id}"]`).click();
    for (const accessory of accessories) {
      const preview = page.locator(`[data-avatar-item="${accessory.id}"] .accessory-preview`);
      const geometry = await preview.evaluate(element => {
        const container = element.getBoundingClientRect();
        const avatar = element.querySelector('svg').getBoundingClientRect();
        return { top: avatar.top - container.top, bottom: container.bottom - avatar.bottom, width: avatar.width, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      if (geometry.top < -1 || geometry.bottom < -1 || geometry.width < 70 || geometry.overflow) throw new Error(`Clipped accessory preview for ${animal.id}/${accessory.id}: ${JSON.stringify(geometry)}`);
    }
  }
  await page.locator('.animal-inventory-grid button').filter({ hasText: 'Fox' }).click();
  await page.locator('.avatar-name-editor input').fill('Fritz');
  await page.locator('.animal-inventory-grid button').filter({ hasText: 'Owl' }).click();
  await page.locator('.animal-inventory-grid button').filter({ hasText: 'Fox' }).click();
  if (await page.locator('.avatar-name-editor input').inputValue() !== 'Fritz') throw new Error('Per-animal name was not restored.');
  await page.locator('.accessory-inventory-grid button').filter({ hasText: 'Round glasses' }).click();
  await page.waitForTimeout(650);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('a2-pruefungsakte-progress')).avatar);
  if (stored.selectedAnimalId !== 'fox') throw new Error('Selected animal was not persisted.');
  if (stored.nicknames?.fox !== 'Fritz') throw new Error('Per-animal name was not persisted.');
  if (stored.equipped.face !== 'round-glasses') throw new Error('Equipped accessory was not persisted.');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) throw new Error('Avatar collection causes horizontal overflow on mobile.');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.avatar-collection').waitFor();
  const selected = await page.evaluate(() => JSON.parse(localStorage.getItem('a2-pruefungsakte-progress')).avatar.selectedAnimalId);
  if (selected !== 'fox') throw new Error('Avatar selection did not survive reload.');
  await page.locator('.menu-trigger').click();
  await page.locator('.sidebar nav button').first().click();
  await page.locator('.learner-avatar.companion').waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  const setupPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await setupPage.addInitScript(() => {
    localStorage.removeItem('a2-pruefungsakte-progress');
    localStorage.setItem('a2-interface-language', 'en');
  });
  await setupPage.goto(`${localUrl}&avatar-setup=1`, { waitUntil: 'domcontentloaded' });
  await setupPage.locator('.avatar-setup-dialog').waitFor();
  await setupPage.locator('.avatar-choice-grid button').filter({ hasText: 'Fox' }).click();
  await setupPage.locator('.avatar-nickname input').fill('Lumi');
  await setupPage.locator('.avatar-setup-dialog .primary-button').click();
  await setupPage.locator('.avatar-setup-dialog').waitFor({ state: 'detached' });
  await setupPage.waitForTimeout(600);
  const setupState = await setupPage.evaluate(() => JSON.parse(localStorage.getItem('a2-pruefungsakte-progress')).avatar);
  if (!setupState.setupComplete || setupState.selectedAnimalId !== 'fox' || setupState.nicknames?.fox !== 'Lumi') throw new Error('First-time avatar selection was not persisted.');
  await setupPage.close();
  const localePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await localePage.addInitScript(progress => {
    localStorage.setItem('a2-interface-language', 'tr');
    localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress));
  }, seededProgress);
  await localePage.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await localePage.locator('.avatar-settings-button').click();
  await localePage.locator('.avatar-collection').getByText('Hayvanlar', { exact: true }).waitFor();
  await localePage.locator('.avatar-collection').getByText('Aksesuarlar', { exact: true }).waitFor();
  await localePage.close();
  const lockedProgress = structuredClone(initialProgress);
  lockedProgress.avatar.setupComplete = true;
  const lockedPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await lockedPage.addInitScript(progress => {
    localStorage.setItem('a2-interface-language', 'en');
    localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress));
  }, lockedProgress);
  await lockedPage.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await lockedPage.locator('.avatar-settings-button').click();
  await lockedPage.locator('[data-avatar-item="capybara"]').click();
  await lockedPage.locator('.avatar-locked-dialog').getByText('0/1 study files completed', { exact: true }).waitFor();
  await lockedPage.keyboard.press('Escape');
  await lockedPage.locator('.avatar-locked-dialog').waitFor({ state: 'detached' });
  await lockedPage.locator('[data-avatar-item="round-glasses"]').click();
  await lockedPage.locator('.avatar-locked-dialog').getByText('0/20 grammar questions mastered', { exact: true }).waitFor();
  const dialogGeometry = await lockedPage.locator('.avatar-locked-dialog').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  if (dialogGeometry.overflow || dialogGeometry.left < -1 || dialogGeometry.right > dialogGeometry.width + 1 || dialogGeometry.top < -1 || dialogGeometry.bottom > dialogGeometry.height + 1) throw new Error(`Locked dialog does not fit mobile: ${JSON.stringify(dialogGeometry)}`);
  await lockedPage.locator('.avatar-locked-dialog .dialog-close').click();
  const lockedState = await lockedPage.evaluate(() => JSON.parse(localStorage.getItem('a2-pruefungsakte-progress')).avatar);
  if (lockedState.unlockedAnimals.includes('capybara') || lockedState.unlockedAccessories.includes('round-glasses')) throw new Error('Inspecting a locked reward changed unlock state.');
  await lockedPage.close();
  console.log('Avatar flow passed: localized UI, locked requirement dialogs, all mobile previews, equipment, naming, persistence, and reload.');
} finally {
  await browser?.close();
  server.kill();
}
