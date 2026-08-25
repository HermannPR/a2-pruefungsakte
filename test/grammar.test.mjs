import test from 'node:test';
import assert from 'node:assert/strict';
import { grammarBank, grammarTopics } from '../src/data/grammarBank.js';
import { grammarLessons, grammarTeaching } from '../src/data/grammarTeaching.js';
import { curriculum } from '../src/data/curriculum.js';

test('covers every grammar topic with twelve questions', () => {
  assert.equal(grammarTopics.length, 8);
  for (const topic of grammarTopics) {
    assert.equal(grammarBank.filter(item => item.topic === topic.id).length, 12, topic.id);
  }
  assert.equal(grammarBank.length, 96);
});

test('every grammar answer has targeted teaching feedback and a mini-lesson', () => {
  for (const topic of grammarTopics) {
    const lesson = grammarLessons[topic.id];
    assert.ok(lesson?.title, topic.id);
    assert.ok(lesson.rule.length > 25, topic.id);
    assert.equal(lesson.examples.length, 2, topic.id);
  }
  for (const item of grammarBank) {
    const teaching = grammarTeaching[item.id];
    assert.ok(teaching?.concept, item.id);
    assert.ok(teaching.correctReason.length > 25, item.id);
    assert.equal(teaching.wrongReasons.length, item.options.length, item.id);
    item.options.forEach((_, index) => {
      if (index !== item.answer) assert.ok(teaching.wrongReasons[index].length > 20, `${item.id}:${index}`);
    });
  }
});

test('grammar questions have valid answers and explanations', () => {
  const ids = new Set();
  for (const item of grammarBank) {
    assert.equal(ids.has(item.id), false, item.id);
    ids.add(item.id);
    assert.equal(item.options.length, 3, item.id);
    assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length, item.id);
    assert.ok(item.prompt.length > 8, item.id);
    assert.ok(item.explanation.length > 20, item.id);
    assert.equal(new Set(item.options).size, item.options.length, item.id);
  }
});

test('answer positions and prompts remain varied', () => {
  assert.equal(new Set(grammarBank.map(item => item.prompt)).size, grammarBank.length);
  for (const topic of grammarTopics) {
    const answers = grammarBank.filter(item => item.topic === topic.id).map(item => item.answer);
    for (const position of [0, 1, 2]) {
      assert.ok(answers.filter(answer => answer === position).length >= 2, `${topic.id}:${position}`);
    }
  }
});

test('every study dossier links to a deliberate practice skill', () => {
  const validSkills = new Set(['reading', 'listening', 'writing', 'speaking']);
  assert.equal(curriculum.length, 12);
  for (const unit of curriculum) assert.ok(validSkills.has(unit.practiceSkill), unit.id);
  assert.deepEqual(new Set(curriculum.map(unit => unit.practiceSkill)), validSkills);
});
