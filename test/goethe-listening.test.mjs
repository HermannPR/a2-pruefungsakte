import test from 'node:test';
import assert from 'node:assert/strict';
import { goetheListeningTests } from '../src/data/goetheListening.js';

test('provides two complete official listening tests', () => {
  assert.equal(goetheListeningTests.length, 2);
  for (const listeningTest of goetheListeningTests) {
    assert.equal(listeningTest.parts.length, 4);
    assert.equal(listeningTest.parts.flatMap(part => part.questions).length, 20);
    assert.match(listeningTest.audioUrl, /^https:\/\/goethemp4s\.akamaized\.net\//);
  }
});

test('listening answers match each part format', () => {
  for (const listeningTest of goetheListeningTests) {
    for (const part of listeningTest.parts) {
      for (const question of part.questions) assert.ok(part.options.includes(question.answer));
      if (part.unique) assert.equal(new Set(part.questions.map(question => question.answer)).size, part.questions.length);
    }
  }
});
