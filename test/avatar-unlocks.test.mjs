import test from 'node:test';
import assert from 'node:assert/strict';
import { accessories, animals, avatarRewardVersion, initialAvatarState, normalizeAvatarState } from '../src/avatar/avatarCatalog.js';
import { avatarDisplayName, avatarRequirement, avatarText } from '../src/avatar/avatarCopy.js';
import { applyAvatarRewards, getNewAvatarRewards, rewardProgress, avatarMetrics } from '../src/avatar/avatarUnlocks.js';
import { initialProgress } from '../src/data/curriculum.js';

const scores = { reading: 60, listening: 62, writing: 65, speaking: 61 };

test('avatar catalog provides two defaults, five earned animals, and twelve accessories', () => {
  assert.equal(animals.filter(item => item.unlock.type === 'default').length, 2);
  assert.equal(animals.length, 7);
  assert.equal(accessories.length, 12);
  assert.deepEqual(new Set(accessories.map(item => item.category)), new Set(['head', 'face', 'neck', 'held', 'background']));
  assert.equal(new Set([...animals, ...accessories].map(item => item.id)).size, 19);
  assert.equal(animals.find(item => item.id === 'cat').colors.body, '#242827');
  assert.equal(initialAvatarState.selectedAnimalId, 'cat');
  assert.deepEqual(initialAvatarState.unlockedAnimals, ['cat', 'fox']);
  assert.equal(avatarDisplayName('en-US', { selectedAnimalId: 'cat', nicknames: { cat: 'Not Guppy' } }), 'Guppy');
  const migrated = normalizeAvatarState({ selectedAnimalId: 'fox', nickname: 'Lumi' });
  assert.equal(migrated.nicknames.fox, 'Lumi');
  assert.equal(migrated.nickname, '');
});

test('companion copy respects every supported regional locale', () => {
  assert.equal(avatarText('en-US', 'animals'), 'Animals');
  assert.equal(avatarText('de-DE', 'animals'), 'Tiere');
  assert.equal(avatarText('es-ES', 'animals'), 'Animales');
  assert.equal(avatarText('tr-TR', 'animals'), 'Hayvanlar');
  assert.equal(avatarText('zh-CN', 'animals'), '动物');
  assert.equal(avatarText('ja-JP', 'animals'), '動物');
  const capybara = animals.find(item => item.id === 'capybara');
  assert.match(avatarRequirement('es-ES', capybara, 0), /expedientes de estudio/);
  assert.match(avatarRequirement('tr-TR', capybara, 0), /çalışma dosyası/);
});

test('legacy default animals are relocked without losing earned rewards or names', () => {
  const migrated = normalizeAvatarState({
    selectedAnimalId: 'orange-cat',
    unlockedAnimals: ['cat', 'owl', 'fox', 'capybara', 'orange-cat', 'red-panda'],
    unlockedAccessories: ['round-glasses'],
    nicknames: { 'orange-cat': 'Marmelade', fox: 'Lumi' }
  });
  assert.equal(migrated.rewardVersion, avatarRewardVersion);
  assert.equal(migrated.selectedAnimalId, 'cat');
  assert.deepEqual(migrated.unlockedAnimals, ['cat', 'fox', 'red-panda']);
  assert.deepEqual(migrated.unlockedAccessories, ['round-glasses']);
  assert.equal(migrated.nicknames['orange-cat'], 'Marmelade');
  assert.equal(migrated.nicknames.fox, 'Lumi');
});

test('current reward states retain animals after they are earned', () => {
  const normalized = normalizeAvatarState({ rewardVersion: avatarRewardVersion, selectedAnimalId: 'owl', unlockedAnimals: ['cat', 'fox', 'owl'] });
  assert.equal(normalized.selectedAnimalId, 'owl');
  assert.ok(normalized.unlockedAnimals.includes('owl'));
});

test('rewards use unique mastery and measurable section evidence', () => {
  const progress = structuredClone(initialProgress);
  progress.avatar = structuredClone(initialAvatarState);
  progress.skills.grammar.byQuestion = Object.fromEntries(Array.from({ length: 50 }, (_, index) => [`g${index}`, { streak: 1 }]));
  progress.skills.vocabulary.mastered = Array.from({ length: 250 }, (_, index) => `v${index}`);
  progress.completedUnits = ['ankommen', 'wohnen', 'arbeit', 'gesundheit', 'unterwegs'];
  progress.skills.listening.possible = 1000;
  const metrics = avatarMetrics(progress, scores);
  assert.equal(metrics.grammarMastered, 50);
  assert.equal(metrics.vocabularyMastered, 250);
  assert.equal(metrics.skillTasks.listening, 10);
  assert.equal(metrics.completedUnits, 5);
  assert.equal(rewardProgress({ type: 'allSections', threshold: 60 }, metrics).qualified, true);
  const newRewards = getNewAvatarRewards(progress, scores).map(item => item.id);
  assert.ok(newRewards.includes('red-panda'));
  assert.ok(newRewards.includes('eagle'));
  assert.ok(newRewards.includes('owl'));
  assert.ok(newRewards.includes('capybara'));
  assert.ok(newRewards.includes('orange-cat'));
  assert.ok(newRewards.includes('headphones'));
});

test('earned cosmetics remain unlocked independently of later scores', () => {
  const updated = applyAvatarRewards(initialAvatarState, [animals.at(-1), accessories.at(-2)]);
  assert.ok(updated.unlockedAnimals.includes('eagle'));
  assert.ok(updated.unlockedAccessories.includes('a2-laurel'));
});
