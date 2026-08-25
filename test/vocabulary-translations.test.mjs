import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { vocabularyBank } from '../src/data/vocabularyBank.js';
import { getVocabularyTranslation } from '../src/data/vocabularyTranslations.js';

test('every curated vocabulary card has optional meanings in all support languages', () => {
  for (const language of ['en', 'es', 'tr', 'zh', 'ja']) {
    for (const item of vocabularyBank) {
      const translation = getVocabularyTranslation(item.id, language);
      assert.ok(translation?.meaning.length >= 4, `${language}:${item.id}`);
    }
  }
});

test('German cards do not offer a redundant translation', () => {
  for (const item of vocabularyBank) assert.equal(getVocabularyTranslation(item.id, 'de'), null);
});

test('Japanese is available in language selection and locale handling', () => {
  const source = fs.readFileSync(new URL('../src/i18n.jsx', import.meta.url), 'utf8');
  assert.match(source, /code: 'ja', flag: '🇯🇵', label: '日本語'/);
  assert.match(source, /ja: 'ja-JP'/);
  assert.match(source, /translations\.ja =/);
});
