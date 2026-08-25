const partDefinitions = [
  { number: 1, start: 1, end: 5, options: ['a', 'b', 'c'], plays: 2 },
  { number: 2, start: 6, end: 10, options: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], plays: 1, unique: true },
  { number: 3, start: 11, end: 15, options: ['a', 'b', 'c'], plays: 1 },
  { number: 4, start: 16, end: 20, options: ['ja', 'nein'], plays: 2 }
];

function buildParts(prefix, answers) {
  return partDefinitions.map(part => ({
    ...part,
    image: `/goethe/listening/${prefix}-part-${part.number}.png`,
    questions: Array.from({ length: 5 }, (_, index) => {
      const number = part.start + index;
      return { number, answer: answers[number - 1] };
    })
  }));
}

export const goetheListeningTests = [
  {
    id: 'model',
    title: 'Modellsatz Erwachsene',
    duration: '22:36',
    audioUrl: 'https://goethemp4s.akamaized.net/resources/files/mp434/pruefungstraining_1_hoeren_a2_erwachsene.mp4',
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Modellsatz_Erwachsene.pdf',
    parts: buildParts('model', ['b', 'b', 'c', 'b', 'a', 'b', 'g', 'h', 'd', 'e', 'c', 'a', 'b', 'b', 'b', 'nein', 'ja', 'ja', 'nein', 'nein'])
  },
  {
    id: 'practice',
    title: 'Uebungssatz 01 Erwachsene',
    duration: '24:10',
    audioUrl: 'https://goethemp4s.akamaized.net/resources/files/mp38/pruefungstraining_2_hoeren_a2_erwachsene.mp3',
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Uebungssatz_Erwachsene.pdf',
    parts: buildParts('practice', ['b', 'c', 'b', 'c', 'a', 'e', 'g', 'h', 'i', 'a', 'b', 'c', 'b', 'a', 'b', 'ja', 'nein', 'ja', 'ja', 'nein'])
  }
];
