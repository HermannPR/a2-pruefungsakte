import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPrintedPage, detectSection, extractSkills, extractTopics, splitExercises } from '../scripts/lib/structure.mjs';

test('detects lesson metadata and printed page', () => {
  const text = 'Kapitel 3 Schule und Ausbildung\nLernziele\n18 achtzehn';
  assert.deepEqual(detectSection(text), { type: 'kapitel', number: 3, title: 'Schule und Ausbildung' });
  assert.equal(detectPrintedPage(text), 18);
});

test('segments numbered exercise blocks', () => {
  const page = {
    bookId: 'sample', bookKind: 'workbook', pdfPage: 20, ocrConfidence: 90,
    text: 'Imperativ\n1 Schreiben Sie Imperativformen.\nGehen Sie!\n2 Ergänzen Sie die Sätze.\nKomm bitte!\n22'
  };
  const exercises = splitExercises(page);
  assert.equal(exercises.length, 2);
  assert.equal(exercises[0].exerciseLabel, '1');
  assert.match(exercises[1].text, /Komm bitte/);
});

test('tags topics and skills', () => {
  const text = 'Schreiben Sie Sätze mit Wechselpräpositionen und Dativ.';
  assert.deepEqual(extractTopics(text), ['Dativ', 'Wechselpräpositionen', 'Präpositionen']);
  assert.deepEqual(extractSkills(text), ['Schreiben']);
});
