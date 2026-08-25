import test from 'node:test';
import assert from 'node:assert/strict';
import { getNewAchievements, getQualifiedAchievements } from '../src/data/achievements.js';

test('section achievements unlock independently at sixty percent', () => {
  const achievements = getQualifiedAchievements({ reading: 60, listening: 59, writing: 0, speaking: 0 });
  assert.deepEqual(achievements.map(entry => entry.id), ['reading-60']);
});

test('cross-section achievements require every exam section', () => {
  const forty = getQualifiedAchievements({ reading: 70, listening: 60, writing: 40, speaking: 40 });
  assert.ok(forty.some(entry => entry.id === 'all-40'));
  assert.equal(forty.some(entry => entry.id === 'all-60'), false);
  const sixty = getQualifiedAchievements({ reading: 60, listening: 60, writing: 60, speaking: 60 });
  assert.ok(sixty.some(entry => entry.id === 'all-60'));
});

test('persisted achievements never unlock twice', () => {
  const scores = { reading: 60, listening: 0, writing: 0, speaking: 0 };
  assert.deepEqual(getNewAchievements(scores, [{ id: 'reading-60' }]), []);
});
