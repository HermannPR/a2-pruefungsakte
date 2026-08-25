import { chromium } from 'playwright-core';
import { grammarBank, grammarTopics } from '../src/data/grammarBank.js';

const baseUrl = (process.env.AUDIT_URL ?? 'https://a2-pruefungsakte.vercel.app').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const projectReference = 'lvvhedokpxdcytczwdtl';
const userId = '00000000-0000-4000-8000-000000000001';

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

const expiresAt = Math.floor(Date.now() / 1000) + 3600;
const accessToken = `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({ aud: 'authenticated', exp: expiresAt, sub: userId, email: 'release-audit@example.invalid', role: 'authenticated' })}.audit`;
const session = {
  access_token: accessToken,
  refresh_token: 'release-audit-refresh-token',
  expires_at: expiresAt,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: userId, aud: 'authenticated', role: 'authenticated', email: 'release-audit@example.invalid', user_metadata: { display_name: 'Release Audit' } }
};

function monitor(page, issues) {
  page.on('pageerror', error => issues.push(`pageerror ${page.url()}: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') issues.push(`console ${page.url()}: ${message.text()}`); });
  page.on('requestfailed', request => { if (request.url().startsWith(baseUrl)) issues.push(`request ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`); });
  page.on('response', response => { if (response.url().startsWith(baseUrl) && response.status() >= 400) issues.push(`response ${response.url()}: HTTP ${response.status()}`); });
}

async function prepareContext(browser, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
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

async function assertHealthy(page, label) {
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => ({
    rootLength: document.querySelector('#root')?.innerText.trim().length ?? 0,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src)
  }));
  if (state.rootLength < 20) throw new Error(`${label}: blank root`);
  if (state.overflow) throw new Error(`${label}: horizontal overflow`);
  if (state.brokenImages.length) throw new Error(`${label}: broken images ${state.brokenImages.join(', ')}`);
}

async function dismissCelebrations(page) {
  for (let index = 0; index < 10; index += 1) {
    const achievement = page.locator('.achievement-popup .primary-button');
    const avatarReward = page.locator('.avatar-unlock-popup > button');
    if (await achievement.isVisible()) await achievement.click();
    else if (await avatarReward.isVisible()) await avatarReward.click();
    else return;
    await page.waitForTimeout(80);
  }
}

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const issues = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await prepareContext(browser, viewport);
    const page = await context.newPage();
    monitor(page, issues);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator('.app-shell').waitFor();
    const avatarSetup = page.locator('.avatar-setup-dialog');
    if (await avatarSetup.isVisible()) {
      await avatarSetup.locator('.avatar-choice-grid button').first().click();
      await avatarSetup.locator('.primary-button').click();
      await avatarSetup.waitFor({ state: 'detached' });
    }
    const onboardingClose = page.locator('.guided-tour-close');
    if (await onboardingClose.isVisible()) await onboardingClose.click();
    await assertHealthy(page, `${viewport.name} dashboard`);

    const navigation = page.locator('.sidebar nav button');
    for (let index = 0; index < 7; index += 1) {
      if (viewport.name === 'mobile') await page.locator('.menu-trigger').click();
      await navigation.nth(index).click();
      await assertHealthy(page, `${viewport.name} view ${index + 1}`);
    }

    if (viewport.name === 'mobile') await page.locator('.menu-trigger').click();
    await navigation.nth(2).click();
    if (viewport.name === 'desktop') {
      let checked = 0;
      for (let topicIndex = 0; topicIndex < grammarTopics.length; topicIndex += 1) {
        await page.locator('.grammar-topic-grid button').nth(topicIndex + 1).click();
        const topicItems = grammarBank.filter(item => item.topic === grammarTopics[topicIndex].id);
        for (let question = 0; question < topicItems.length; question += 1) {
          await page.locator('.option-list button').first().click();
          await page.locator('.practice-actions .primary-button').click();
          await page.locator('.grammar-teaching-feedback').waitFor();
          checked += 1;
          await assertHealthy(page, `desktop grammar ${checked}`);
          await dismissCelebrations(page);
          await page.locator('.practice-actions .primary-button').click();
        }
      }
    } else {
      await page.locator('.option-list button').first().click();
      await page.locator('.practice-actions .primary-button').click();
      await page.locator('.grammar-teaching-feedback').waitFor();
      await assertHealthy(page, 'mobile grammar 1');
      await dismissCelebrations(page);
      await page.locator('.practice-actions .primary-button').click();
    }

    await page.locator('.language-selector select').selectOption('ja');
    if (await page.locator('html').getAttribute('lang') !== 'ja-JP') throw new Error(`${viewport.name}: Japanese locale did not apply`);
    await page.locator('.language-selector select').selectOption('en');
    if (viewport.name === 'mobile') await page.locator('.menu-trigger').click();
    await navigation.nth(3).click();
    await page.locator('.workbook-chapters button').first().waitFor();
    const curatedVocabularyLabel = await page.locator('.vocabulary-source-switch button').nth(1).textContent();
    if (!curatedVocabularyLabel?.includes('(96)')) throw new Error(`${viewport.name}: expected 96 curated vocabulary cards, found ${curatedVocabularyLabel}`);
    await page.locator('.vocabulary-source-switch button').nth(1).click();
    if (viewport.name === 'mobile') {
      await page.locator('.vocabulary-topics button').nth(4).click();
      await page.waitForTimeout(700);
      const reveal = await page.locator('.vocabulary-card').evaluate(element => ({ top: element.getBoundingClientRect().top, focused: document.activeElement === element }));
      if (reveal.top > 320 || !reveal.focused) throw new Error(`mobile: vocabulary detail did not reveal correctly (${JSON.stringify(reveal)})`);
    }
    await page.locator('.reveal-word').click();
    if (await page.locator('.optional-translation').count()) throw new Error(`${viewport.name}: translation appeared without request`);
    await page.locator('.inline-translation-button').click();
    await page.locator('.optional-translation').waitFor();

    if (viewport.name === 'mobile') await page.locator('.menu-trigger').click();
    await navigation.nth(1).click();
    await dismissCelebrations(page);
    await page.locator('.dossier-actions .primary-button').click();
    if (!await page.locator('.dossier-actions .primary-button').isDisabled()) throw new Error(`${viewport.name}: unit completion did not persist`);

    if (viewport.name === 'mobile') await page.locator('.menu-trigger').click();
    await navigation.nth(5).click();
    await page.locator('.exam-cover-copy > .primary-button').click();
    await page.locator('.full-exam-header').waitFor();
    await assertHealthy(page, `${viewport.name} active exam`);
    await context.close();
  }
  if (issues.length) throw new Error(issues.join('\n'));
  console.log(`Production smoke passed for ${baseUrl}: authenticated desktop/mobile navigation, grammar, learning, exam, assets, and runtime.`);
} finally {
  await browser.close();
}
