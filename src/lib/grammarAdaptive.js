function questionTier(stats) {
  if (!stats?.attempts) return 1;
  if (stats.streak === 0) return 0;
  if (stats.streak < 2) return 2;
  return 3;
}

export function rankGrammarItems(items, byQuestion = {}) {
  return [...items].sort((left, right) => {
    const leftStats = byQuestion[left.id];
    const rightStats = byQuestion[right.id];
    const tierDifference = questionTier(leftStats) - questionTier(rightStats);
    if (tierDifference) return tierDifference;
    const leftAccuracy = leftStats?.attempts ? leftStats.correct / leftStats.attempts : 0;
    const rightAccuracy = rightStats?.attempts ? rightStats.correct / rightStats.attempts : 0;
    if (leftAccuracy !== rightAccuracy) return leftAccuracy - rightAccuracy;
    return (leftStats?.lastSeen ?? '').localeCompare(rightStats?.lastSeen ?? '') || left.id.localeCompare(right.id);
  });
}

export function updateGrammarQuestionStats(previous = {}, correct, timestamp) {
  return {
    attempts: (previous.attempts ?? 0) + 1,
    correct: (previous.correct ?? 0) + (correct ? 1 : 0),
    streak: correct ? (previous.streak ?? 0) + 1 : 0,
    lastSeen: timestamp
  };
}

export function scheduleGrammarQueue(queue, itemId, correct) {
  const remaining = queue.filter(id => id !== itemId);
  if (correct) return [...remaining, itemId];
  const repeatAfter = Math.min(2, remaining.length);
  return [...remaining.slice(0, repeatAfter), itemId, ...remaining.slice(repeatAfter)];
}

export function calculateGrammarProgress(items, byQuestion = {}) {
  const attempted = items.filter(item => (byQuestion[item.id]?.attempts ?? 0) > 0).length;
  const mastered = items.filter(item => (byQuestion[item.id]?.streak ?? 0) > 0).length;
  return { attempted, mastered, total: items.length, percentage: items.length ? Math.round((mastered / items.length) * 100) : 0 };
}
