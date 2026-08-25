import test from 'node:test';
import assert from 'node:assert/strict';
import { workbookVocabulary, workbookVocabularyTopics } from '../src/data/workbookVocabulary.js';
import { WORKBOOK_VOCABULARY_TOTAL } from '../src/data/workbookVocabularyMeta.js';

test('workbook vocabulary covers every chapter', () => {
  assert.equal(workbookVocabularyTopics.length, 12);
  for (const chapter of workbookVocabularyTopics) {
    assert.ok(workbookVocabulary.some(item => item.chapter === chapter.id));
  }
});

test('workbook vocabulary is substantial and traceable', () => {
  assert.equal(workbookVocabulary.length, WORKBOOK_VOCABULARY_TOTAL);
  assert.ok(workbookVocabulary.length >= 1000);
  assert.equal(new Set(workbookVocabulary.map(item => item.id)).size, workbookVocabulary.length);
  for (const item of workbookVocabulary) {
    assert.ok(item.word.length >= 2);
    assert.ok(Number.isInteger(item.sourcePage));
    const chapter = workbookVocabularyTopics.find(entry => entry.id === item.chapter);
    assert.ok(chapter?.pages.includes(item.sourcePage));
  }
});
