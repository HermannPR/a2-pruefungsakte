export const avatarRewardVersion = 2;
export const defaultAnimalIds = ['cat', 'fox'];

export const animals = [
  { id: 'cat', unlock: { type: 'default' }, colors: { body: '#242827', light: '#fff8e9', accent: '#d77d7b' } },
  { id: 'owl', unlock: { type: 'completedUnits', threshold: 5 }, colors: { body: '#8b5e3c', light: '#f2d9a7', accent: '#d6a72d' } },
  { id: 'fox', unlock: { type: 'default' }, colors: { body: '#c95632', light: '#fff0d8', accent: '#34302b' } },
  { id: 'capybara', unlock: { type: 'completedUnits', threshold: 1 }, colors: { body: '#8a654d', light: '#caa98c', accent: '#382c25' } },
  { id: 'orange-cat', unlock: { type: 'vocabularyMastered', threshold: 150 }, colors: { body: '#d98232', light: '#efa85a', accent: '#8c4827' } },
  { id: 'red-panda', unlock: { type: 'grammarMastered', threshold: 50 }, colors: { body: '#a8442e', light: '#f1d4b3', accent: '#3a2925' } },
  { id: 'eagle', unlock: { type: 'allSections', threshold: 60 }, colors: { body: '#765039', light: '#eee7d7', accent: '#d6a72d' } }
];

export const accessories = [
  { id: 'round-glasses', category: 'face', unlock: { type: 'grammarMastered', threshold: 20 } },
  { id: 'grammar-book', category: 'held', unlock: { type: 'grammarMastered', threshold: 40 } },
  { id: 'headphones', category: 'head', unlock: { type: 'skillTasks', skillId: 'listening', threshold: 10 } },
  { id: 'microphone', category: 'held', unlock: { type: 'skillScore', skillId: 'speaking', threshold: 60 } },
  { id: 'red-pencil', category: 'held', unlock: { type: 'skillScore', skillId: 'writing', threshold: 60 } },
  { id: 'reading-scarf', category: 'neck', unlock: { type: 'skillScore', skillId: 'reading', threshold: 60 } },
  { id: 'word-satchel', category: 'held', unlock: { type: 'vocabularyMastered', threshold: 100 } },
  { id: 'gold-dictionary', category: 'held', unlock: { type: 'vocabularyMastered', threshold: 500 } },
  { id: 'calendar-pin', category: 'neck', unlock: { type: 'streak', threshold: 7 } },
  { id: 'track-medal', category: 'neck', unlock: { type: 'allSections', threshold: 40 } },
  { id: 'a2-laurel', category: 'background', unlock: { type: 'allSections', threshold: 60 } },
  { id: 'session-star', category: 'head', unlock: { type: 'totalSessions', threshold: 100 } }
];

export const avatarCatalog = [...animals, ...accessories];

export const initialAvatarState = {
  rewardVersion: avatarRewardVersion,
  setupComplete: false,
  selectedAnimalId: 'cat',
  nickname: '',
  nicknames: {},
  equipped: { head: null, face: null, neck: null, held: null, background: null },
  unlockedAnimals: [...defaultAnimalIds],
  unlockedAccessories: [],
  seenUnlocks: []
};

export function normalizeAvatarState(storedAvatar = {}) {
  const isLegacyRewardState = (storedAvatar.rewardVersion ?? 1) < avatarRewardVersion;
  const legacyDefaults = new Set(['owl', 'capybara', 'orange-cat']);
  const storedUnlockedAnimals = (storedAvatar.unlockedAnimals ?? []).filter(id => !isLegacyRewardState || !legacyDefaults.has(id));
  const unlockedAnimals = [...new Set([...initialAvatarState.unlockedAnimals, ...storedUnlockedAnimals])];
  const requestedAnimalId = storedAvatar.selectedAnimalId ?? initialAvatarState.selectedAnimalId;
  const selectedAnimalId = unlockedAnimals.includes(requestedAnimalId) ? requestedAnimalId : initialAvatarState.selectedAnimalId;
  const nicknames = { ...(storedAvatar.nicknames ?? {}) };
  const legacyNickname = storedAvatar.nickname?.trim();
  if (legacyNickname && selectedAnimalId !== 'cat' && !nicknames[selectedAnimalId]) nicknames[selectedAnimalId] = legacyNickname;
  return {
    ...initialAvatarState,
    ...storedAvatar,
    selectedAnimalId,
    nickname: '',
    nicknames,
    equipped: { ...initialAvatarState.equipped, ...storedAvatar.equipped },
    rewardVersion: avatarRewardVersion,
    unlockedAnimals,
    unlockedAccessories: storedAvatar.unlockedAccessories ?? []
  };
}

export function getAvatarItem(itemId) {
  return avatarCatalog.find(item => item.id === itemId);
}
