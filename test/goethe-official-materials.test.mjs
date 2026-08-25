import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { goetheReadingTests } from '../src/data/goetheReading.js';
import { goetheListeningTests } from '../src/data/goetheListening.js';
import { goetheSpeakingTests, goetheWritingTests } from '../src/data/goetheProduction.js';

test('provides forty valid official reading answers', () => {
  assert.equal(goetheReadingTests.length, 2);
  for (const readingTest of goetheReadingTests) {
    assert.equal(readingTest.parts.length, 4);
    assert.equal(readingTest.parts.flatMap(part => part.questions).length, 20);
    for (const part of readingTest.parts) {
      for (const question of part.questions) assert.ok(part.options.includes(question.answer));
    }
  }
});

test('provides four writing and six speaking tasks', () => {
  assert.equal(goetheWritingTests.flatMap(entry => entry.tasks).length, 4);
  assert.equal(goetheSpeakingTests.flatMap(entry => entry.parts).length, 6);
  for (const writingTest of goetheWritingTests) {
    for (const task of writingTest.tasks) {
      assert.equal(task.bullets.length, 3);
      assert.ok(task.minWords < task.maxWords);
    }
  }
  for (const speakingTest of goetheSpeakingTests) {
    for (const part of speakingTest.parts) assert.ok(part.prompts.length > 0 && part.images.length > 0);
  }
});

test('official worksheets use readable lossless source renders', async () => {
  const paths = [
    ...goetheReadingTests.flatMap(entry => entry.parts.flatMap(part => part.images)),
    ...goetheListeningTests.flatMap(entry => entry.parts.map(part => part.image)),
    ...goetheWritingTests.map(entry => entry.sheet),
    ...goetheSpeakingTests.flatMap(entry => entry.parts.flatMap(part => part.images))
  ];
  assert.equal(paths.length, 34);
  for (const imagePath of paths) {
    assert.match(imagePath, /\.png$/);
    const file = await stat(new URL(`../public${imagePath}`, import.meta.url));
    assert.ok(file.size > 100_000, `${imagePath} is unexpectedly compressed`);
  }
});
