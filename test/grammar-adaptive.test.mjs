import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGrammarProgress, rankGrammarItems, scheduleGrammarQueue, updateGrammarQuestionStats } from '../src/lib/grammarAdaptive.js';

const items = ['g01', 'g02', 'g03', 'g04'].map(id => ({ id }));

test('adaptive ranking prioritizes mistakes, then unseen questions', () => {
  const ranked = rankGrammarItems(items, {
    g01: { attempts: 3, correct: 3, streak: 3, lastSeen: '2026-07-15T10:00:00Z' },
    g02: { attempts: 2, correct: 1, streak: 0, lastSeen: '2026-07-15T11:00:00Z' },
    g04: { attempts: 1, correct: 1, streak: 1, lastSeen: '2026-07-15T12:00:00Z' }
  });
  assert.deepEqual(ranked.map(item => item.id), ['g02', 'g03', 'g04', 'g01']);
});

test('mastery uses the entire question bank and separates coverage', () => {
  const progress = calculateGrammarProgress(items, { g01: { attempts: 2, streak: 1 }, g02: { attempts: 1, streak: 0 } });
  assert.deepEqual(progress, { attempted: 2, mastered: 1, total: 4, percentage: 25 });
});

test('wrong answers return after two different questions', () => {
  assert.deepEqual(scheduleGrammarQueue(['g01', 'g02', 'g03', 'g04'], 'g01', false), ['g02', 'g03', 'g01', 'g04']);
  assert.deepEqual(scheduleGrammarQueue(['g01', 'g02', 'g03'], 'g01', true), ['g02', 'g03', 'g01']);
});

test('per-question mastery records attempts, accuracy, and consecutive success', () => {
  const first = updateGrammarQuestionStats({}, false, 'first');
  const second = updateGrammarQuestionStats(first, true, 'second');
  const third = updateGrammarQuestionStats(second, true, 'third');
  assert.deepEqual(third, { attempts: 3, correct: 2, streak: 2, lastSeen: 'third' });
  assert.equal(updateGrammarQuestionStats(third, false, 'fourth').streak, 0);
});
