import { accessories, animals, defaultAnimalIds } from './avatarCatalog.js';

export function avatarMetrics(progress, scores) {
  const grammarQuestions = Object.values(progress.skills?.grammar?.byQuestion ?? {});
  return {
    grammarMastered: grammarQuestions.filter(question => (question.streak ?? 0) > 0).length,
    vocabularyMastered: progress.skills?.vocabulary?.mastered?.length ?? 0,
    completedUnits: progress.completedUnits?.length ?? 0,
    streak: progress.streak ?? 0,
    totalSessions: progress.totalSessions ?? 0,
    scores,
    skillTasks: Object.fromEntries(Object.entries(progress.skills ?? {}).map(([skillId, value]) => [skillId, Math.floor((value?.possible ?? 0) / 100)]))
  };
}

export function rewardProgress(unlock, metrics) {
  if (unlock.type === 'default') return { current: 1, target: 1, qualified: true };
  if (unlock.type === 'grammarMastered') return compare(metrics.grammarMastered, unlock.threshold);
  if (unlock.type === 'vocabularyMastered') return compare(metrics.vocabularyMastered, unlock.threshold);
  if (unlock.type === 'completedUnits') return compare(metrics.completedUnits, unlock.threshold);
  if (unlock.type === 'streak') return compare(metrics.streak, unlock.threshold);
  if (unlock.type === 'totalSessions') return compare(metrics.totalSessions, unlock.threshold);
  if (unlock.type === 'skillTasks') return compare(metrics.skillTasks[unlock.skillId] ?? 0, unlock.threshold);
  if (unlock.type === 'skillScore') return compare(metrics.scores[unlock.skillId] ?? 0, unlock.threshold);
  if (unlock.type === 'allSections') {
    const current = Math.min(...['reading', 'listening', 'writing', 'speaking'].map(skillId => metrics.scores[skillId] ?? 0));
    return compare(current, unlock.threshold);
  }
  return { current: 0, target: 1, qualified: false };
}

function compare(current, target) {
  return { current, target, qualified: current >= target };
}

export function getQualifiedAvatarRewards(progress, scores) {
  const metrics = avatarMetrics(progress, scores);
  return [...animals, ...accessories].filter(item => rewardProgress(item.unlock, metrics).qualified);
}

export function getNewAvatarRewards(progress, scores) {
  const avatar = progress.avatar ?? {};
  const unlocked = new Set([...(avatar.unlockedAnimals ?? defaultAnimalIds), ...(avatar.unlockedAccessories ?? [])]);
  return getQualifiedAvatarRewards(progress, scores).filter(item => !unlocked.has(item.id));
}

export function applyAvatarRewards(avatar, rewards) {
  const animalIds = new Set([...defaultAnimalIds, ...(avatar.unlockedAnimals ?? [])]);
  const accessoryIds = new Set(avatar.unlockedAccessories ?? []);
  for (const reward of rewards) {
    if (reward.category) accessoryIds.add(reward.id);
    else animalIds.add(reward.id);
  }
  return { ...avatar, unlockedAnimals: [...animalIds], unlockedAccessories: [...accessoryIds] };
}
