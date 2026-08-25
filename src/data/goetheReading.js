const partDefinitions = [
  { number: 1, start: 1, end: 5, options: ['a', 'b', 'c'] },
  { number: 2, start: 6, end: 10, options: ['a', 'b', 'c'] },
  { number: 3, start: 11, end: 15, options: ['a', 'b', 'c'] },
  { number: 4, start: 16, end: 20, options: ['a', 'b', 'c', 'd', 'e', 'f', 'x'], unique: true }
];

function buildParts(prefix, answers) {
  return partDefinitions.map(part => ({
    ...part,
    images: [1, 2].map(page => `/goethe/reading/${prefix}-part-${part.number}-page-${page}.png`),
    questions: Array.from({ length: 5 }, (_, index) => {
      const number = part.start + index;
      return { number, answer: answers[number - 1] };
    })
  }));
}

export const goetheReadingTests = [
  {
    id: 'model', title: 'Modellsatz Erwachsene', duration: '30 min',
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Modellsatz_Erwachsene.pdf',
    parts: buildParts('model', ['c', 'c', 'c', 'a', 'a', 'c', 'b', 'c', 'b', 'a', 'c', 'a', 'c', 'b', 'c', 'f', 'c', 'x', 'b', 'a'])
  },
  {
    id: 'practice', title: 'Uebungssatz 01 Erwachsene', duration: '30 min',
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Uebungssatz_Erwachsene.pdf',
    parts: buildParts('practice', ['b', 'b', 'c', 'b', 'a', 'b', 'b', 'b', 'c', 'b', 'b', 'c', 'b', 'c', 'c', 'f', 'c', 'e', 'x', 'b'])
  }
];
