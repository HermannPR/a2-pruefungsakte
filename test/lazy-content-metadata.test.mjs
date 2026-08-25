import test from 'node:test';
import assert from 'node:assert/strict';
import { articleBank } from '../src/data/articleBank.js';
import { ARTICLE_BANK_TOTAL } from '../src/data/articleBankMeta.js';

test('lazy article inventory metadata stays synchronized', () => {
  assert.equal(articleBank.length, ARTICLE_BANK_TOTAL);
});
