import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { goetheReadingTests } from '../src/data/goetheReading.js';
import { goetheSpeakingTests, goetheWritingTests } from '../src/data/goetheProduction.js';
import { createFullExamSession, formatExamTime, FULL_EXAM_SECTIONS, scoreObjectiveSection, scoreSpeakingSection, scoreWritingSection } from '../src/lib/fullExam.js';

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('full simulation uses official section durations', () => {
  assert.deepEqual(FULL_EXAM_SECTIONS.map(section => section.minutes), [30, 30, 30, 15]);
  assert.equal(FULL_EXAM_SECTIONS.reduce((sum, section) => sum + section.minutes, 0), 105);
});

test('new simulations start with a timed autosave-compatible session', () => {
  const now = Date.UTC(2026, 6, 14, 12);
  const session = createFullExamSession(1, now);
  assert.equal(session.testIndex, 1);
  assert.equal(session.sectionIndex, 0);
  assert.equal(session.deadline, now + 30 * 60000);
  assert.deepEqual(session.scores, []);
  assert.equal(formatExamTime(90500), '01:31');
});

test('objective sections score all twenty answers', () => {
  const testSet = goetheReadingTests[0];
  const correctAnswers = Object.fromEntries(testSet.parts.flatMap(part => part.questions).map(question => [question.number, question.answer]));
  assert.deepEqual(scoreObjectiveSection(testSet.parts, correctAnswers), { score: 100, correct: 20, total: 20 });
  assert.deepEqual(scoreObjectiveSection(testSet.parts, {}), { score: 0, correct: 0, total: 20 });
});

test('production sections combine completion and honest self-checks', () => {
  const writing = goetheWritingTests[0];
  const writingResponses = { 1: 'eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig', 2: Array(30).fill('Wort').join(' ') };
  const writingChecks = { 1: [0, 1, 2], 2: [0, 1, 2] };
  assert.equal(scoreWritingSection(writing.tasks, writingResponses, writingChecks).score, 100);

  const speaking = goetheSpeakingTests[0];
  const speakingResponses = { 1: Array(18).fill('Wort').join(' '), 2: Array(35).fill('Wort').join(' '), 3: Array(35).fill('Wort').join(' ') };
  const speakingChecks = { 1: [0, 1, 2], 2: [0, 1, 2], 3: [0, 1, 2] };
  assert.equal(scoreSpeakingSection(speaking.parts, speakingResponses, speakingChecks).score, 100);
});

test('full exam locks sections and persists interrupted work locally', () => {
  assert.match(appSource, /a2-full-exam-v1/);
  assert.match(appSource, /localStorage\.setItem\(fullExamStorageKey/);
  assert.match(appSource, /submitSection\(true\)/);
  assert.match(appSource, /window\.confirm\(t\('exam\.submitConfirm'\)\)/);
  assert.match(appSource, /disabled=\{audioStarted\}/);
});
