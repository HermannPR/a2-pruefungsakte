import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { initialProgress } from '../src/data/curriculum.js';

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const mainSource = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
const serviceWorkerSource = await readFile(new URL('../public/service-worker.js', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));

test('progress includes backwards-compatible study continuity data', () => {
  assert.deepEqual(initialProgress.skills.grammar.byQuestion, {});
  assert.deepEqual(initialProgress.study.mistakes, []);
  assert.deepEqual(initialProgress.study.bookmarks, []);
  assert.deepEqual(initialProgress.achievements, []);
  assert.equal(initialProgress.avatar.selectedAnimalId, 'cat');
  assert.equal(initialProgress.avatar.setupComplete, false);
  assert.equal(initialProgress.study.resume.view, 'dashboard');
  assert.equal(initialProgress.study.reminder.enabled, false);
  assert.match(appSource, /skills: \{ \.\.\.progress\.skills, _study: progress\.study, _achievements: progress\.achievements, _avatar: progress\.avatar \}/);
});

test('mistakes bookmarks and resume actions are available', () => {
  assert.match(appSource, /function trackMistake/);
  assert.match(appSource, /function toggleBookmark|const toggleBookmark/);
  assert.match(appSource, /function resumeStudy|const resumeStudy/);
  assert.match(appSource, /mistake-notebook/);
  assert.match(appSource, /bookmark-index/);
});

test('account password changes use the authenticated Supabase session', () => {
  assert.match(appSource, /function AccountSecurity/);
  assert.match(appSource, /supabase\.auth\.updateUser\(\{ password \}\)/);
  assert.match(appSource, /password\.length < 12/);
});

test('app is installable and provides an offline shell', () => {
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.ok(manifest.icons.length > 0);
  assert.match(mainSource, /serviceWorker\.register\('\/service-worker\.js'\)/);
  assert.match(serviceWorkerSource, /APP_SHELL/);
  assert.match(serviceWorkerSource, /pathname === '\/assets\/app\.js'/);
  assert.match(serviceWorkerSource, /notificationclick/);
});
