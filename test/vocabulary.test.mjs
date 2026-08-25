import test from 'node:test';
import assert from 'node:assert/strict';
import { vocabularyBank, vocabularyTopics } from '../src/data/vocabularyBank.js';
import { practiceBank } from '../src/data/curriculum.js';

test('provides eight vocabulary themes with twelve words each', () => {
  assert.equal(vocabularyTopics.length, 8);
  assert.equal(vocabularyBank.length, 96);
  for (const topic of vocabularyTopics) {
    assert.equal(vocabularyBank.filter(item => item.topic === topic.id).length, 12, topic.id);
  }
});

test('vocabulary entries include teachable German context', () => {
  const ids = new Set();
  for (const item of vocabularyBank) {
    assert.ok(!ids.has(item.id), item.id);
    ids.add(item.id);
    assert.ok(item.word.length >= 3, item.id);
    assert.ok(item.definition.endsWith('.'), item.id);
    assert.match(item.example, /[.!?]$/, item.id);
  }
});

test('expanded practice bank covers Goethe-style task parts', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(practiceBank).map(([skill, items]) => [skill, items.length])),
    { reading: 10, listening: 10, writing: 7, speaking: 7 }
  );
  for (const skill of Object.keys(practiceBank)) {
    assert.ok(practiceBank[skill].some(item => item.goethePart), skill);
  }
});
