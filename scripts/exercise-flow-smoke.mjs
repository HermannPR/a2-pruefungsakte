import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { grammarBank, grammarTopics } from '../src/data/grammarBank.js';

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

function monitorPage(page, errors) {
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
}

async function assertPageVisible(page, label) {
  const state = await page.evaluate(() => ({
    text: document.querySelector('#root')?.innerText.trim() ?? '',
    bodyColor: getComputedStyle(document.body).backgroundColor
  }));
  if (state.text.length < 20) throw new Error(`${label} rendered a blank or incomplete screen.`);
}

async function assertMobileDetail(page, selector, label, maxTop = 360) {
  await page.waitForTimeout(700);
  const state = await page.locator(selector).evaluate(element => ({ top: Math.round(element.getBoundingClientRect().top), focused: document.activeElement === element }));
  if (state.top < 60 || state.top > maxTop || !state.focused) throw new Error(`${label} was not visibly revealed and focused: ${state.top}px, focus=${state.focused}.`);
}

const server = startDevelopmentServer();
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  monitorPage(page, errors);
  await page.addInitScript(() => localStorage.setItem('a2-interface-language', 'en'));
  await page.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.language-selector select').selectOption('ja');
  if (await page.locator('html').getAttribute('lang') !== 'ja-JP') throw new Error('Japanese locale was not applied to the document.');
  await page.locator('.sidebar nav button').first().waitFor();
  if (!(await page.locator('.sidebar nav button').first().innerText()).includes('概要')) throw new Error('Japanese navigation label did not render.');
  await page.locator('.language-selector select').selectOption('en');

  const navigationButtons = page.locator('.sidebar nav button');
  const navigationCount = await navigationButtons.count();
  for (let index = 0; index < navigationCount; index += 1) {
    await navigationButtons.nth(index).click();
    await assertPageVisible(page, `Navigation view ${index + 1}`);
  }

  await navigationButtons.nth(2).click();
  const repeatedQuestionId = (await page.locator('.grammar-question .eyebrow').innerText()).trim();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.locator('.option-list button').first().click();
    await page.locator('.practice-actions .primary-button').click();
    await page.locator('.grammar-teaching-feedback').waitFor();
    await page.locator('.practice-actions .primary-button').click();
  }
  const returnedQuestionId = (await page.locator('.grammar-question .eyebrow').innerText()).trim();
  if (returnedQuestionId !== repeatedQuestionId) throw new Error(`Adaptive grammar did not repeat a mistake after two other questions: ${repeatedQuestionId} -> ${returnedQuestionId}.`);
  let checkedGrammarQuestions = 0;
  for (let topicIndex = 0; topicIndex < grammarTopics.length; topicIndex += 1) {
    await page.locator('.grammar-topic-grid button').nth(topicIndex + 1).click();
    const topicItems = grammarBank.filter(item => item.topic === grammarTopics[topicIndex].id);
    for (let question = 0; question < topicItems.length; question += 1) {
      await page.locator('.option-list button').first().click();
      await page.locator('.practice-actions .primary-button').click();
      await page.locator('.grammar-teaching-feedback').waitFor();
      if (checkedGrammarQuestions === 0) {
        await page.locator('.wrong-explanation').waitFor();
        await page.locator('.correct-explanation').waitFor();
        await page.locator('.teaching-actions button').first().click();
        await page.locator('.mini-lesson').waitFor();
      }
      checkedGrammarQuestions += 1;
      await assertPageVisible(page, `Grammar question ${checkedGrammarQuestions}`);
      await page.locator('.practice-actions .primary-button').click();
    }
  }

  await page.waitForTimeout(1200);
  const storedProgress = await page.evaluate(() => Object.entries(localStorage).find(([, value]) => value.includes('"skills"') && value.includes('"grammar"'))?.[1]);
  if (!storedProgress) throw new Error('Grammar progress was not persisted after answer checks.');
  const storedQuestionStats = Object.keys(JSON.parse(storedProgress).skills?.grammar?.byQuestion ?? {});
  if (storedQuestionStats.length !== grammarBank.length) throw new Error(`Expected persisted mastery for ${grammarBank.length} grammar questions, found ${storedQuestionStats.length}.`);

  await navigationButtons.nth(3).click();
  await page.locator('.vocabulary-source-switch button').nth(2).click();
  await page.locator('.article-trainer').waitFor();
  await page.locator('.article-options button').first().click();
  await page.locator('.article-feedback').waitFor();
  await assertPageVisible(page, 'Article vocabulary answer check');
  await page.locator('.article-next').click();
  await page.locator('.vocabulary-source-switch button').nth(1).click();
  await page.locator('.reveal-word').click();
  if (await page.locator('.optional-translation').count()) throw new Error('Vocabulary translation appeared before the learner requested it.');
  await page.locator('.inline-translation-button').click();
  await page.locator('.optional-translation').waitFor();

  await navigationButtons.nth(1).click();
  await page.locator('.unit-list button').first().click();
  const completeButton = page.locator('.dossier-actions .primary-button');
  await completeButton.click();
  await assertPageVisible(page, 'Study-unit completion');
  if (!await completeButton.isDisabled()) throw new Error('Completed study unit did not become disabled.');

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  monitorPage(mobilePage, errors);
  await mobilePage.addInitScript(() => localStorage.setItem('a2-interface-language', 'en'));
  await mobilePage.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await mobilePage.locator('.menu-trigger').click();
  await mobilePage.locator('.sidebar nav button').nth(2).click();
  await mobilePage.locator('.option-list button').first().click();
  await mobilePage.locator('.practice-actions .primary-button').click();
  await mobilePage.locator('.grammar-teaching-feedback').waitFor();
  await assertPageVisible(mobilePage, 'Mobile grammar answer check');
  await mobilePage.locator('.teaching-actions button').first().click();
  await mobilePage.locator('.mini-lesson').waitFor();
  await mobilePage.evaluate(() => scrollTo(0, 0));
  await mobilePage.locator('.grammar-topic-grid button').nth(5).click();
  await assertMobileDetail(mobilePage, '.grammar-dossier', 'Mobile grammar detail');
  await mobilePage.locator('.menu-trigger').click();
  await mobilePage.locator('.sidebar nav button').nth(3).click();
  await mobilePage.locator('.vocabulary-source-switch button').nth(2).click();
  await mobilePage.locator('.article-options button').first().click();
  await mobilePage.locator('.article-feedback').waitFor();
  await assertPageVisible(mobilePage, 'Mobile article vocabulary answer check');
  await mobilePage.locator('.vocabulary-source-switch button').nth(0).click();
  await mobilePage.locator('.workbook-chapters button').nth(7).click();
  await assertMobileDetail(mobilePage, '.workbook-vocabulary-main', 'Mobile workbook detail');
  await mobilePage.locator('.vocabulary-source-switch button').nth(1).click();
  await mobilePage.locator('.vocabulary-topics button').nth(4).click();
  await assertMobileDetail(mobilePage, '.vocabulary-card', 'Mobile vocabulary detail', 320);
  await mobilePage.locator('.reveal-word').click();
  if (await mobilePage.locator('.optional-translation').count()) throw new Error('Mobile vocabulary translation appeared before request.');
  await mobilePage.locator('.inline-translation-button').click();
  await mobilePage.locator('.optional-translation').waitFor();
  await mobilePage.locator('.menu-trigger').click();
  await mobilePage.locator('.sidebar nav button').nth(1).click();
  await mobilePage.locator('.unit-list button').nth(7).click();
  await assertMobileDetail(mobilePage, '.unit-dossier', 'Mobile learning-unit detail');
  const mobileCompleteButton = mobilePage.locator('.dossier-actions .primary-button');
  await mobileCompleteButton.click();
  await assertPageVisible(mobilePage, 'Mobile study-unit completion');
  if (!await mobileCompleteButton.isDisabled()) throw new Error('Mobile completed study unit did not become disabled.');
  await mobilePage.locator('.menu-trigger').click();
  await mobilePage.locator('.sidebar nav button').nth(4).click();
  await mobilePage.locator('.skill-tabs button').nth(3).click();
  await assertMobileDetail(mobilePage, '.practice-detail-target', 'Mobile practice detail');
  await mobilePage.locator('.language-selector select').selectOption('ja');
  const japaneseLayout = await mobilePage.evaluate(() => ({ lang: document.documentElement.lang, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
  if (japaneseLayout.lang !== 'ja-JP' || japaneseLayout.overflow) throw new Error(`Japanese mobile layout failed: ${JSON.stringify(japaneseLayout)}.`);
  await mobileContext.close();

  if (errors.length) throw new Error(`Browser errors detected:\n${errors.join('\n')}`);
  console.log(`Exercise flow smoke test passed: navigation, ${grammarBank.length} teaching-rich grammar checks, article practice, progress persistence, unit completion, and mobile flows.`);
} finally {
  if (browser) await browser.close();
  server.kill();
}
