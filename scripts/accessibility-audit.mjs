import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright-core';
import { initialProgress } from '../src/data/curriculum.js';

const rootDirectory = process.cwd();
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localUrl = 'http://127.0.0.1:5173/?preview=1';
const localAuthUrl = 'http://127.0.0.1:5173/?auth-preview=1';
const reportPath = path.join(rootDirectory, 'data', 'accessibility-report.json');
const viewNames = ['dashboard', 'learn', 'grammar', 'vocabulary', 'practice', 'exam', 'progress'];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 }
];

function startDevelopmentServer() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return spawn(command, ['run', 'dev', '--', '--host', '127.0.0.1'], {
    cwd: rootDirectory,
    shell: process.platform === 'win32',
    stdio: 'ignore',
    windowsHide: true
  });
}

async function waitForServer(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Development server did not become ready: ${url}`);
}

async function inspectPage(page, label) {
  const axe = await new AxeBuilder({ page }).analyze();
  const layout = await page.evaluate(() => ({
    blankRoot: (document.querySelector('#root')?.innerText.trim().length ?? 0) < 20,
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    overflowElements: [...document.querySelectorAll('body *')]
      .filter(element => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.right > window.innerWidth + 1;
      })
      .slice(0, 20)
      .map(element => ({ className: element.className?.baseVal ?? element.className ?? '', tag: element.tagName, text: element.textContent?.trim().slice(0, 60) ?? '', box: element.getBoundingClientRect().toJSON() })),
    smallTargets: [...document.querySelectorAll('button, a, input, select, textarea')]
      .filter(element => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0 && (box.width < 24 || box.height < 24);
      })
      .slice(0, 25)
      .map(element => ({ tag: element.tagName, text: element.textContent?.trim().slice(0, 60) ?? '', box: element.getBoundingClientRect().toJSON() })),
    brokenImages: [...document.images]
      .filter(image => image.complete && image.naturalWidth === 0)
      .map(image => image.currentSrc || image.src)
  }));
  return {
    label,
    violations: axe.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary }))
    })),
    layout
  };
}

async function chooseView(page, viewName, mobile) {
  if (mobile) {
    const menuButton = page.locator('.menu-trigger');
    await menuButton.click();
  }
  await page.locator(`.sidebar nav button`).filter({ has: page.locator(`svg`) }).nth(viewNames.indexOf(viewName)).click();
  await page.waitForTimeout(250);
}

const server = startDevelopmentServer();
let browser;
try {
  await waitForServer(localUrl);
  browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const report = { generatedAt: new Date().toISOString(), results: [], consoleErrors: [], runtimeErrors: [], networkErrors: [] };

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const seededProgress = structuredClone(initialProgress);
    seededProgress.avatar.setupComplete = true;
    await page.addInitScript(progress => {
      localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress));
      localStorage.setItem('a2-onboarding-complete:preview', '1');
    }, seededProgress);
    page.on('console', message => {
      if (message.type() === 'error') report.consoleErrors.push({ viewport: viewport.name, url: page.url(), text: message.text() });
    });
    page.on('pageerror', error => report.runtimeErrors.push({ viewport: viewport.name, url: page.url(), text: error.message }));
    page.on('requestfailed', request => {
      if (request.url().startsWith('http://127.0.0.1:5173')) report.networkErrors.push({ viewport: viewport.name, url: request.url(), text: request.failure()?.errorText ?? 'request failed' });
    });
    page.on('response', response => {
      if (response.url().startsWith('http://127.0.0.1:5173') && response.status() >= 400) report.networkErrors.push({ viewport: viewport.name, url: response.url(), text: `HTTP ${response.status()}` });
    });
    await page.goto(localAuthUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    report.results.push(await inspectPage(page, `auth-${viewport.name}`));
    await page.goto(localUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    report.results.push(await inspectPage(page, `dashboard-${viewport.name}`));
    await page.locator('.help-trigger').click();
    report.results.push(await inspectPage(page, `help-${viewport.name}`));
    await page.locator('.restart-tour').click();
    await page.waitForTimeout(150);
    report.results.push(await inspectPage(page, `onboarding-${viewport.name}`));
    await page.locator('.guided-tour-close').click();
    await chooseView(page, 'learn', viewport.name === 'mobile');
    await page.goBack();
    await page.waitForTimeout(150);
    const restoredDashboard = await page.locator('.sidebar nav button').first().getAttribute('aria-current');
    if (restoredDashboard !== 'page') {
      report.consoleErrors.push({ viewport: viewport.name, url: page.url(), text: 'Browser Back did not restore dashboard navigation state.' });
    }
    for (const viewName of viewNames.slice(1)) {
      await chooseView(page, viewName, viewport.name === 'mobile');
      report.results.push(await inspectPage(page, `${viewName}-${viewport.name}`));
      if (viewName === 'exam') {
        await page.locator('.exam-cover-copy > .primary-button').click();
        await page.waitForTimeout(250);
        report.results.push(await inspectPage(page, `exam-active-${viewport.name}`));
        await page.locator('.official-answer-row button').first().click();
        await page.waitForTimeout(150);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(350);
        if (!await page.locator('.exam-resume').isVisible()) {
          report.consoleErrors.push({ viewport: viewport.name, url: page.url(), text: 'Interrupted full exam was not offered for resume after reload.' });
        } else {
          await page.locator('.exam-resume button').last().click();
        }
      }
    }
    await context.close();
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  const serious = report.results.flatMap(result => result.violations.filter(violation => ['serious', 'critical'].includes(violation.impact)).map(violation => `${result.label}: ${violation.id}`));
  const overflow = report.results.filter(result => result.layout.horizontalOverflow).map(result => result.label);
  const blank = report.results.filter(result => result.layout.blankRoot).map(result => result.label);
  const brokenImages = report.results.flatMap(result => result.layout.brokenImages.map(source => `${result.label}: ${source}`));
  console.log(`Audited ${report.results.length} screens, including Help, onboarding, and an active full exam.`);
  console.log(`Serious/critical violations: ${serious.length}`);
  console.log(`Horizontal overflow screens: ${overflow.length}`);
  console.log(`Console errors: ${report.consoleErrors.length}`);
  console.log(`Runtime errors: ${report.runtimeErrors.length}`);
  console.log(`Local network errors: ${report.networkErrors.length}`);
  console.log(`Blank screens: ${blank.length}`);
  console.log(`Broken images: ${brokenImages.length}`);
  if (serious.length || overflow.length || report.consoleErrors.length || report.runtimeErrors.length || report.networkErrors.length || blank.length || brokenImages.length) {
    console.log([...serious, ...overflow.map(label => `${label}: horizontal-overflow`), ...blank.map(label => `${label}: blank-root`), ...brokenImages, ...report.consoleErrors.map(error => `${error.viewport}: ${error.text}`), ...report.runtimeErrors.map(error => `${error.viewport}: ${error.text}`), ...report.networkErrors.map(error => `${error.viewport}: ${error.url} ${error.text}`)].join('\n'));
    process.exitCode = 1;
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
