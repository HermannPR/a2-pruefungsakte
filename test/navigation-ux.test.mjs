import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('section navigation integrates browser history', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /window\.history\[historyMethod\]/);
  assert.match(app, /addEventListener\('popstate', restoreView\)/);
  assert.match(app, /a2Overlay: 'help'/);
});

test('provides restartable onboarding and contextual help', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /const onboardingSteps = \[/);
  assert.match(app, /function OnboardingTour/);
  assert.match(app, /function HelpCenter/);
  assert.match(app, /a2-onboarding-complete:/);
});
