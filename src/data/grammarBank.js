import { grammarExpansion, normalizeGrammarExpansion } from './grammarExpansion.js';

export const grammarTopics = [
  { id: 'cases', title: 'Kasus & Artikel', short: 'KA', rule: 'Nominativ, Akkusativ und Dativ sicher unterscheiden.' },
  { id: 'verbs', title: 'Verben & Zeiten', short: 'VZ', rule: 'Präsens, Perfekt, Präteritum und Modalverben passend bilden.' },
  { id: 'wordOrder', title: 'Satzbau', short: 'SB', rule: 'Verbposition in Hauptsatz, Frage und Nebensatz kontrollieren.' },
  { id: 'connectors', title: 'Konnektoren', short: 'KO', rule: 'Gedanken mit weil, dass, wenn, aber und deshalb verbinden.' },
  { id: 'prepositions', title: 'Präpositionen', short: 'PR', rule: 'Ort, Richtung und Zeit mit der richtigen Präposition ausdrücken.' },
  { id: 'adjectives', title: 'Adjektive & Vergleich', short: 'AV', rule: 'Endungen sowie Komparativ und Superlativ verwenden.' },
  { id: 'pronouns', title: 'Pronomen', short: 'PO', rule: 'Personal-, Possessiv- und Reflexivpronomen korrekt einsetzen.' },
  { id: 'questions', title: 'Fragen & Höflichkeit', short: 'FH', rule: 'Direkte, indirekte und höfliche Fragen formulieren.' }
];

const coreGrammarBank = [
  { id: 'g01', topic: 'cases', prompt: 'Ich kaufe ___ neuen Tisch.', options: ['ein', 'einen', 'einem'], answer: 1, explanation: '„Tisch“ ist maskulin und hier Akkusativ: einen neuen Tisch.' },
  { id: 'g02', topic: 'cases', prompt: 'Wir helfen ___ Nachbarin.', options: ['die', 'der', 'den'], answer: 1, explanation: 'Das Verb „helfen“ verlangt den Dativ: der Nachbarin.' },
  { id: 'g03', topic: 'cases', prompt: 'Das Geschenk ist für ___ Kind.', options: ['das', 'dem', 'den'], answer: 0, explanation: 'Nach „für“ steht immer der Akkusativ: für das Kind.' },
  { id: 'g04', topic: 'verbs', prompt: 'Gestern ___ ich lange gearbeitet.', options: ['bin', 'habe', 'hatte'], answer: 1, explanation: '„arbeiten“ bildet das Perfekt mit „haben“: ich habe gearbeitet.' },
  { id: 'g05', topic: 'verbs', prompt: 'Als Kind ___ ich jeden Tag draußen.', options: ['spiele', 'spielte', 'gespielt'], answer: 1, explanation: 'Für eine vergangene Gewohnheit passt hier das Präteritum: spielte.' },
  { id: 'g06', topic: 'verbs', prompt: 'Du ___ heute früher nach Hause gehen.', options: ['musst', 'müsst', 'müssen'], answer: 0, explanation: 'Bei „du“ lautet die Form des Modalverbs: du musst.' },
  { id: 'g07', topic: 'wordOrder', prompt: 'Morgen ___ ich meine Ärztin ___.', options: ['rufe / an', 'anrufe / —', 'ich / anrufe'], answer: 0, explanation: 'Im Hauptsatz steht das konjugierte Verb an Position 2; der Verbzusatz steht am Ende.' },
  { id: 'g08', topic: 'wordOrder', prompt: 'Ich bleibe zu Hause, weil ich krank ___.', options: ['bin', 'war', 'werde'], answer: 0, explanation: 'Der Satz beschreibt den aktuellen Grund; im Nebensatz steht „bin“ am Ende.' },
  { id: 'g09', topic: 'wordOrder', prompt: 'Welche Frage ist korrekt?', options: ['Wann der Kurs beginnt?', 'Wann beginnt der Kurs?', 'Wann beginnt den Kurs?'], answer: 1, explanation: 'In einer direkten W-Frage steht das Verb direkt nach dem Fragewort.' },
  { id: 'g10', topic: 'connectors', prompt: 'Ich komme später, ___ mein Zug Verspätung hat.', options: ['aber', 'weil', 'deshalb'], answer: 1, explanation: '„weil“ nennt einen Grund und leitet einen Nebensatz ein.' },
  { id: 'g11', topic: 'connectors', prompt: 'Es regnet. ___ nehmen wir einen Schirm mit.', options: ['Deshalb', 'Dass', 'Oder'], answer: 0, explanation: '„deshalb“ drückt eine Folge aus; danach steht das Verb auf Position 2.' },
  { id: 'g12', topic: 'connectors', prompt: 'Ich weiß, ___ der Termin um zehn Uhr ist.', options: ['weil', 'dass', 'wenn'], answer: 1, explanation: 'Nach „wissen“ kann ein dass-Satz den Inhalt nennen.' },
  { id: 'g13', topic: 'prepositions', prompt: 'Wir fahren morgen ___ Berlin.', options: ['nach', 'zu', 'in der'], answer: 0, explanation: 'Bei Städten ohne Artikel verwendet man für die Richtung „nach“.' },
  { id: 'g14', topic: 'prepositions', prompt: 'Das Bild hängt ___ der Wand.', options: ['an', 'auf', 'über die'], answer: 0, explanation: 'Für eine vertikale Fläche verwendet man „an“; der Ort steht im Dativ.' },
  { id: 'g15', topic: 'prepositions', prompt: 'Der Kurs beginnt ___ Montag ___ neun Uhr.', options: ['am / um', 'im / an', 'um / am'], answer: 0, explanation: 'Wochentag: am Montag. Uhrzeit: um neun Uhr.' },
  { id: 'g16', topic: 'adjectives', prompt: 'Meine Wohnung ist ___ als deine.', options: ['groß', 'größer', 'am größten'], answer: 1, explanation: 'Bei einem Vergleich mit „als“ verwendet man den Komparativ: größer.' },
  { id: 'g17', topic: 'adjectives', prompt: 'Das ist ein ___ Restaurant.', options: ['gutes', 'gute', 'guter'], answer: 0, explanation: 'Nach „ein“ und vor einem neutralen Nomen lautet die Endung im Nominativ „-es“.' },
  { id: 'g18', topic: 'adjectives', prompt: 'Heute ist der ___ Tag der Woche.', options: ['wärmer', 'wärmste', 'am wärmsten'], answer: 1, explanation: 'Vor einem Nomen steht der Superlativ als Adjektiv: der wärmste Tag.' },
  { id: 'g19', topic: 'pronouns', prompt: 'Kannst du ___ bitte helfen?', options: ['mich', 'mir', 'ich'], answer: 1, explanation: '„helfen“ verlangt den Dativ; das Dativpronomen von „ich“ ist „mir“.' },
  { id: 'g20', topic: 'pronouns', prompt: 'Anna wäscht ___ die Hände.', options: ['sich', 'ihr', 'sie'], answer: 0, explanation: 'Bei Körperpflege verwendet man häufig ein Reflexivpronomen: sich die Hände waschen.' },
  { id: 'g21', topic: 'pronouns', prompt: 'Ist das Pauls Fahrrad? – Ja, das ist ___.', options: ['seins', 'seine', 'seiner'], answer: 0, explanation: 'Das Possessivpronomen ersetzt hier „sein Fahrrad“: Das ist seins.' },
  { id: 'g22', topic: 'questions', prompt: 'Welche Bitte ist am höflichsten?', options: ['Gib mir das Formular.', 'Könnten Sie mir bitte das Formular geben?', 'Du gibst das Formular?'], answer: 1, explanation: '„Könnten Sie … bitte …?“ ist eine höfliche Bitte mit Konjunktiv II.' },
  { id: 'g23', topic: 'questions', prompt: 'Können Sie mir sagen, wann der Bus ___?', options: ['kommt', 'kommt er', 'er kommt'], answer: 0, explanation: 'In der indirekten Frage steht das konjugierte Verb am Ende.' },
  { id: 'g24', topic: 'questions', prompt: '___ kostet die Monatskarte?', options: ['Wie viel', 'Wie viele', 'Was für'], answer: 0, explanation: 'Nach einem Preis fragt man mit „Wie viel …?“.' },
  { id: 'g25', topic: 'cases', prompt: 'Der Schlüssel gehört ___ Mann.', options: ['der', 'den', 'dem'], answer: 2, explanation: '„gehören“ verlangt den Dativ: Der Schlüssel gehört dem Mann.' },
  { id: 'g26', topic: 'cases', prompt: 'Ich spreche mit ___ neuen Kollegin.', options: ['eine', 'einer', 'einen'], answer: 1, explanation: 'Nach „mit“ steht immer der Dativ: mit einer neuen Kollegin.' },
  { id: 'g27', topic: 'cases', prompt: '___ Jacke gefällt mir sehr gut.', options: ['Die', 'Der', 'Den'], answer: 0, explanation: '„Die Jacke“ ist das Subjekt und steht deshalb im Nominativ.' },
  { id: 'g28', topic: 'verbs', prompt: 'Letztes Wochenende ___ wir nach Hamburg gefahren.', options: ['haben', 'sind', 'werden'], answer: 1, explanation: 'Das Bewegungsverb „fahren“ bildet das Perfekt hier mit „sein“.' },
  { id: 'g29', topic: 'verbs', prompt: 'Früher ___ ich mehr Zeit für Sport.', options: ['habe', 'hatte', 'gehabt'], answer: 1, explanation: 'Für „haben“ verwendet man in Erzählungen häufig das Präteritum „hatte“.' },
  { id: 'g30', topic: 'verbs', prompt: 'Ihr ___ hier nicht rauchen.', options: ['dürft', 'darf', 'dürfen'], answer: 0, explanation: 'Zum Subjekt „ihr“ gehört die Modalverbform „dürft“.' },
  { id: 'g31', topic: 'wordOrder', prompt: 'Welche Satzstellung ist korrekt?', options: ['Heute ich muss länger arbeiten.', 'Heute muss ich länger arbeiten.', 'Heute länger arbeiten ich muss.'], answer: 1, explanation: 'Nach dem ersten Satzglied „Heute“ steht das konjugierte Verb „muss“.' },
  { id: 'g32', topic: 'wordOrder', prompt: 'Sie sagt, dass sie morgen ___.', options: ['kommt', 'kommen', 'komme'], answer: 0, explanation: 'Das Subjekt „sie“ verlangt „kommt“; im dass-Satz steht diese Form am Ende.' },
  { id: 'g33', topic: 'wordOrder', prompt: 'Welche Ja-/Nein-Frage ist korrekt?', options: ['Du hast heute Zeit?', 'Hast du heute Zeit?', 'Heute du hast Zeit?'], answer: 1, explanation: 'In einer Ja-/Nein-Frage steht das konjugierte Verb an Position 1.' },
  { id: 'g34', topic: 'connectors', prompt: '___ du Zeit hast, können wir zusammen lernen.', options: ['Wenn', 'Deshalb', 'Aber'], answer: 0, explanation: '„wenn“ nennt eine Bedingung und leitet einen Nebensatz ein.' },
  { id: 'g35', topic: 'connectors', prompt: 'Der Bus fährt nicht, ___ nehmen wir die Bahn.', options: ['weil', 'deshalb', 'dass'], answer: 1, explanation: '„deshalb“ nennt die Folge; danach steht das Verb direkt auf Position 2.' },
  { id: 'g36', topic: 'connectors', prompt: 'Zuerst kaufe ich ein, ___ koche ich das Abendessen.', options: ['dann', 'weil', 'ob'], answer: 0, explanation: '„dann“ verbindet zwei Handlungen in ihrer zeitlichen Reihenfolge.' },
  { id: 'g37', topic: 'prepositions', prompt: 'Am Wochenende übernachte ich ___ meiner Freundin.', options: ['bei', 'nach', 'aus'], answer: 0, explanation: 'Bei Personen verwendet man für einen Aufenthaltsort die Präposition „bei“.' },
  { id: 'g38', topic: 'prepositions', prompt: 'Ich stelle die Tasche ___ Küche.', options: ['in der', 'in die', 'an der'], answer: 1, explanation: 'Die Bewegung mit Ziel fragt „wohin?“ und verlangt hier „in die Küche“.' },
  { id: 'g39', topic: 'prepositions', prompt: 'Wir wohnen ___ einem Jahr in Köln.', options: ['vor', 'seit', 'für'], answer: 1, explanation: '„seit“ bezeichnet einen Beginn in der Vergangenheit, der bis heute dauert.' },
  { id: 'g40', topic: 'adjectives', prompt: 'Sie trägt heute eine ___ Tasche.', options: ['rot', 'rote', 'rotes'], answer: 1, explanation: 'Nach „eine“ bekommt das Adjektiv vor einem femininen Nomen die Endung „-e“.' },
  { id: 'g41', topic: 'adjectives', prompt: 'Von allen Getränken trinke ich Tee ___.', options: ['lieber', 'am liebsten', 'liebsten'], answer: 1, explanation: 'Für die höchste Vorliebe verwendet man den Superlativ „am liebsten“.' },
  { id: 'g42', topic: 'adjectives', prompt: 'Das neue Handy ist genauso teuer ___ das alte.', options: ['als', 'wie', 'denn'], answer: 1, explanation: 'Bei gleicher Stärke verbindet „genauso … wie“ die beiden Vergleiche.' },
  { id: 'g43', topic: 'pronouns', prompt: 'Kennst du Herrn Wagner? – Ja, ich kenne ___.', options: ['ihm', 'ihn', 'er'], answer: 1, explanation: '„kennen“ verlangt Akkusativ; das maskuline Pronomen lautet „ihn“.' },
  { id: 'g44', topic: 'pronouns', prompt: 'Wir besuchen morgen ___ Großeltern.', options: ['unsere', 'unseren', 'unser'], answer: 0, explanation: 'Vor dem Pluralwort „Großeltern“ lautet der Possessivartikel im Akkusativ „unsere“.' },
  { id: 'g45', topic: 'pronouns', prompt: 'Wir treffen ___ um acht Uhr vor dem Kino.', options: ['uns', 'euch', 'sich'], answer: 0, explanation: 'Das Reflexivpronomen zu „wir“ lautet im Akkusativ „uns“.' },
  { id: 'g46', topic: 'questions', prompt: '___ kommen Sie? – Aus Japan.', options: ['Wo', 'Wohin', 'Woher'], answer: 2, explanation: 'Mit „Woher?“ fragt man nach der Herkunft oder dem Ausgangsort.' },
  { id: 'g47', topic: 'questions', prompt: 'Wissen Sie, ___ der Supermarkt noch geöffnet ist?', options: ['ob', 'wann', 'warum'], answer: 0, explanation: 'Eine indirekte Ja-/Nein-Frage beginnt mit dem Konnektor „ob“.' },
  { id: 'g48', topic: 'questions', prompt: 'Welche Frage klingt besonders höflich?', options: ['Wo ist der Bahnhof?', 'Sagen Sie den Weg.', 'Würden Sie mir bitte den Weg zeigen?'], answer: 2, explanation: '„Würden Sie … bitte …?“ formuliert eine besonders höfliche Bitte.' }
];

export const grammarBank = [
  ...coreGrammarBank,
  ...grammarExpansion.map(normalizeGrammarExpansion).map(({ teaching: _teaching, ...question }) => question)
];
