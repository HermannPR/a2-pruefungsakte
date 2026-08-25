export const FULL_EXAM_SECTIONS = [
  { id: 'reading', minutes: 30 },
  { id: 'listening', minutes: 30 },
  { id: 'writing', minutes: 30 },
  { id: 'speaking', minutes: 15 }
];

export function createFullExamSession(testIndex = 0, now = Date.now()) {
  return {
    version: 1,
    status: 'exam',
    testIndex,
    sectionIndex: 0,
    partIndexes: { reading: 0, listening: 0, writing: 0, speaking: 0 },
    deadline: now + FULL_EXAM_SECTIONS[0].minutes * 60000,
    startedAt: new Date(now).toISOString(),
    answers: { reading: {}, listening: {} },
    responses: { writing: {}, speaking: {} },
    checks: { writing: {}, speaking: {} },
    scores: [],
    timedOut: []
  };
}

export function scoreObjectiveSection(parts, answers) {
  const questions = parts.flatMap(part => part.questions);
  const correct = questions.filter(question => answers[question.number] === question.answer).length;
  return { score: Math.round((correct / questions.length) * 100), correct, total: questions.length };
}

function countWords(value = '') {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function scoreWritingSection(tasks, responses, checks) {
  const taskScores = tasks.map(task => {
    const words = countWords(responses[task.number]);
    const lengthRatio = Math.min(1, words / task.minWords);
    const taskChecks = checks[task.number] ?? [];
    return Math.round(lengthRatio * 55 + Math.min(1, taskChecks.length / 3) * 45);
  });
  return { score: Math.round(taskScores.reduce((sum, score) => sum + score, 0) / taskScores.length), taskScores };
}

export function scoreSpeakingSection(parts, responses, checks) {
  const targets = [18, 35, 35];
  const partScores = parts.map((part, index) => {
    const words = countWords(responses[part.number]);
    const partChecks = checks[part.number] ?? [];
    return Math.round(Math.min(1, words / targets[index]) * 55 + Math.min(1, partChecks.length / 3) * 45);
  });
  return { score: Math.round(partScores.reduce((sum, score) => sum + score, 0) / partScores.length), partScores };
}

export function formatExamTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
