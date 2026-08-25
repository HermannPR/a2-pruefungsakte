const sectionAchievements = [
  { id: 'reading-60', kind: 'section', skillId: 'reading', threshold: 60, mark: 'L', color: '#bf392d' },
  { id: 'listening-60', kind: 'section', skillId: 'listening', threshold: 60, mark: 'H', color: '#3266c5' },
  { id: 'writing-60', kind: 'section', skillId: 'writing', threshold: 60, mark: 'S', color: '#19735b' },
  { id: 'speaking-60', kind: 'section', skillId: 'speaking', threshold: 60, mark: 'M', color: '#a15c15' }
];

export const achievementDefinitions = [
  ...sectionAchievements,
  { id: 'all-40', kind: 'all', threshold: 40, mark: '40', color: '#3266c5' },
  { id: 'all-60', kind: 'ready', threshold: 60, mark: 'A2', color: '#19735b' }
];

export function getQualifiedAchievements(scores) {
  return achievementDefinitions.filter(achievement => {
    if (achievement.kind === 'section') return scores[achievement.skillId] >= achievement.threshold;
    return ['reading', 'listening', 'writing', 'speaking'].every(skillId => scores[skillId] >= achievement.threshold);
  });
}

export function getNewAchievements(scores, unlocked = []) {
  const unlockedIds = new Set(unlocked.map(entry => typeof entry === 'string' ? entry : entry.id));
  return getQualifiedAchievements(scores).filter(achievement => !unlockedIds.has(achievement.id));
}
