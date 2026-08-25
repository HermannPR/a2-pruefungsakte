export const goetheWritingTests = [
  {
    id: 'model', title: 'Modellsatz Erwachsene', sheet: '/goethe/writing/model-tasks.png',
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Modellsatz_Erwachsene.pdf',
    tasks: [
      { number: 1, type: 'SMS', minWords: 20, maxWords: 30, prompt: 'Sie schreiben Ihrer Freundin Ekaterini.', bullets: ['Entschuldigen Sie sich, dass Sie zu spät kommen.', 'Schreiben Sie, warum.', 'Nennen Sie einen neuen Ort und eine neue Uhrzeit für das Treffen.'] },
      { number: 2, type: 'E-Mail', minWords: 30, maxWords: 40, prompt: 'Ihr Chef, Herr Lehmann, hat Sie zu seiner Geburtstagsfeier eingeladen.', bullets: ['Bedanken Sie sich und sagen Sie, dass Sie kommen.', 'Informieren Sie, dass Sie jemanden mitbringen.', 'Fragen Sie nach dem Weg.'] }
    ]
  },
  {
    id: 'practice', title: 'Uebungssatz 01 Erwachsene', sheet: '/goethe/writing/practice-tasks.png',
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Uebungssatz_Erwachsene.pdf',
    tasks: [
      { number: 1, type: 'SMS', minWords: 20, maxWords: 30, prompt: 'Sie sind umgezogen und schreiben Ihrem Freund Leonhard.', bullets: ['Informieren Sie ihn, wo Sie jetzt wohnen.', 'Schreiben Sie, was Ihnen dort gefällt.', 'Laden Sie Ihren Freund in die neue Wohnung ein.'] },
      { number: 2, type: 'E-Mail', minWords: 30, maxWords: 40, prompt: 'Sie können erst am Sonntag statt am Freitag ins Hotel kommen.', bullets: ['Erklären Sie, warum Sie schreiben.', 'Informieren Sie, wie lange Sie jetzt bleiben möchten.', 'Fragen Sie nach einem neuen Preisangebot.'] }
    ]
  }
];

export const goetheSpeakingTests = [
  {
    id: 'model', title: 'Modellsatz Erwachsene', sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Modellsatz_Erwachsene.pdf',
    parts: [
      { number: 1, title: 'Fragen zur Person', prompts: ['Geburtstag?', 'Wohnort?', 'Beruf?', 'Hobby?'], images: ['/goethe/speaking/model-part-1.png'] },
      { number: 2, title: 'Von sich erzählen', prompts: ['Was machen Sie mit Ihrem Geld?', 'Was machen Sie oft am Wochenende?'], images: ['/goethe/speaking/model-part-2.png'] },
      { number: 3, title: 'Gemeinsam etwas planen', prompts: ['Finden Sie gemeinsam einen Termin, um ein Geburtstagsgeschenk für Patrick zu kaufen.'], images: ['/goethe/speaking/model-part-3-a.png', '/goethe/speaking/model-part-3-b.png'] }
    ]
  },
  {
    id: 'practice', title: 'Uebungssatz 01 Erwachsene', sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Uebungssatz_Erwachsene.pdf',
    parts: [
      { number: 1, title: 'Fragen zur Person', prompts: ['Ausbildung/Studium?', 'Eltern?', 'Musik?', 'Familienname?'], images: ['/goethe/speaking/practice-part-1.png'] },
      { number: 2, title: 'Von sich erzählen', prompts: ['Was machen Sie mit Ihrer Familie?', 'Was machen Sie, wenn Sie am Abend ausgehen?'], images: ['/goethe/speaking/practice-part-2.png'] },
      { number: 3, title: 'Gemeinsam etwas planen', prompts: ['Ihr Deutschkurs ist zu Ende. Planen Sie gemeinsam eine Party.'], images: ['/goethe/speaking/practice-part-3-a.png', '/goethe/speaking/practice-part-3-b.png'] }
    ]
  }
];
