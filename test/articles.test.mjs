import test from 'node:test';
import assert from 'node:assert/strict';
import { articleBank, articleOptions } from '../src/data/articleBank.js';

test('article practice uses a substantial unique noun bank', () => {
  assert.deepEqual(articleOptions, ['der', 'die', 'das']);
  assert.ok(articleBank.length >= 500);
  assert.equal(new Set(articleBank.map(item => item.word.toLocaleLowerCase('de'))).size, articleBank.length);
});

test('article questions retain useful learning context', () => {
  for (const item of articleBank) {
    assert.ok(articleOptions.includes(item.article), item.id);
    assert.ok(item.noun.length >= 2, item.id);
    assert.equal(item.word, `${item.article} ${item.noun}`);
    assert.ok(item.hint.length > 20, item.id);
    assert.ok(item.vocabularyId, item.id);
  }
});
