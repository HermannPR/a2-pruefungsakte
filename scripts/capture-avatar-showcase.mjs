import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { accessories, animals, initialAvatarState } from '../src/avatar/avatarCatalog.js';
import { achievementDefinitions } from '../src/data/achievements.js';
import { initialProgress } from '../src/data/curriculum.js';

const outputDirectory = path.resolve('cv-screenshots', 'avatar-showcase');
const cdpUrl = process.env.CHROME_CDP_URL ?? 'http://127.0.0.1:9222';
const appUrl = 'http://127.0.0.1:5173/?preview=1';
await mkdir(outputDirectory, { recursive: true });

const showcase = structuredClone(initialProgress);
for (const skillId of ['reading', 'listening', 'writing', 'speaking']) showcase.skills[skillId] = { earned: 76, possible: 100 };
showcase.skills.grammar.byQuestion = Object.fromEntries(Array.from({ length: 96 }, (_, index) => [`g${String(index + 1).padStart(2, '0')}`, { attempts: 2, correct: 2, streak: 2 }]));
showcase.skills.vocabulary.reviewed = Array.from({ length: 550 }, (_, index) => `showcase-word-${index}`);
showcase.skills.vocabulary.mastered = Array.from({ length: 500 }, (_, index) => `showcase-word-${index}`);
showcase.completedUnits = ['ankommen', 'wohnen', 'arbeit', 'gesundheit', 'unterwegs', 'einkaufen', 'freizeit', 'lernen', 'kontakte', 'behoerden', 'natur', 'zukunft'];
showcase.streak = 14;
showcase.totalSessions = 120;
showcase.achievements = achievementDefinitions.map(item => ({ id: item.id, unlockedAt: new Date().toISOString() }));
showcase.avatar = {
  ...initialAvatarState,
  setupComplete: true,
  selectedAnimalId: 'cat',
  nickname: '',
  equipped: { head: 'session-star', face: 'round-glasses', neck: 'reading-scarf', held: 'grammar-book', background: 'a2-laurel' },
  unlockedAnimals: animals.map(item => item.id),
  unlockedAccessories: accessories.map(item => item.id),
  seenUnlocks: [...animals, ...accessories].map(item => item.id)
};

const browser = await chromium.connectOverCDP(cdpUrl);
const context = browser.contexts()[0];
const pages = context.pages();
const page = pages[0] ?? await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) errors.push(message.text()); });

await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
await page.evaluate(progress => {
  localStorage.setItem('a2-interface-language', 'en');
  localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress));
}, showcase);
await page.reload({ waitUntil: 'networkidle' });
await page.locator('.sidebar nav button').first().click();
await page.locator('.avatar-companion-card').waitFor();
await page.screenshot({ path: path.join(outputDirectory, '01-dashboard-desktop.png'), fullPage: true });

await page.locator('.sidebar nav button').nth(6).click();
await page.locator('.avatar-collection').waitFor();
await page.locator('.avatar-collection').scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(outputDirectory, '02-collection-desktop.png'), fullPage: true });
await page.locator('.avatar-collection').screenshot({ path: path.join(outputDirectory, '03-customizer-desktop.png') });

while (await page.locator('.accessory-inventory-grid button.selected').count()) {
  await page.locator('.accessory-inventory-grid button.selected').first().click();
}
for (let index = 0; index < animals.length; index += 1) {
  await page.locator(`[data-avatar-item="${animals[index].id}"]`).click();
  await page.waitForTimeout(120);
  await page.locator('.avatar-stage').screenshot({ path: path.join(outputDirectory, `animal-${animals[index].id}.png`) });
}
await page.locator('[data-avatar-item="cat"]').click();
for (let index = 0; index < accessories.length; index += 1) {
  const button = page.locator(`[data-avatar-item="${accessories[index].id}"]`);
  await button.click();
  await page.waitForTimeout(100);
  await page.locator('.avatar-stage').screenshot({ path: path.join(outputDirectory, `accessory-${accessories[index].id}.png`) });
  await button.click();
}
await page.evaluate(progress => localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress)), showcase);

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
await page.locator('.avatar-collection').waitFor();
await page.locator('.avatar-collection').scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(outputDirectory, '04-collection-mobile-full.png'), fullPage: true });
await page.locator('.avatar-stage').screenshot({ path: path.join(outputDirectory, '05-avatar-mobile.png') });
const mobileHealth = await page.evaluate(() => ({
  overflow: document.documentElement.scrollWidth > innerWidth + 1,
  width: innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  locked: document.querySelectorAll('.avatar-inventory .locked').length,
  animals: document.querySelectorAll('.animal-inventory-grid button').length,
  accessories: document.querySelectorAll('.accessory-inventory-grid button').length
}));

await page.setViewportSize({ width: 1280, height: 900 });
await page.reload({ waitUntil: 'networkidle' });
await page.locator('.avatar-collection').waitFor();
await page.locator('.avatar-collection').scrollIntoViewIfNeeded();

if (mobileHealth.overflow || mobileHealth.locked || mobileHealth.animals !== 7 || mobileHealth.accessories !== 12) throw new Error(`Showcase validation failed: ${JSON.stringify(mobileHealth)}`);
if (errors.length) throw new Error(errors.join('\n'));
console.log(JSON.stringify({ outputDirectory, mobileHealth, chromeLeftOpen: true }, null, 2));
process.exit(0);
