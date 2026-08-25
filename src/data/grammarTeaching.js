import { grammarExpansion, normalizeGrammarExpansion } from './grammarExpansion.js';

export const grammarLessons = {
  cases: {
    title: 'Kasus und Artikel erkennen',
    rule: 'Frage zuerst: Wer handelt? Wen oder was betrifft die Handlung? Wem passiert etwas?',
    pattern: 'Nominativ = wer? · Akkusativ = wen/was? · Dativ = wem?',
    examples: ['Der Mann kauft einen Tisch.', 'Die Frau hilft dem Kind.'],
    mistake: 'Nicht nur das Nomen ansehen: Verb und Präposition bestimmen oft den Kasus.'
  },
  verbs: {
    title: 'Verbform und Zeit zusammensetzen',
    rule: 'Subjekt, Zeitangabe und Verbtyp bestimmen gemeinsam die richtige Form.',
    pattern: 'Perfekt = haben/sein + Partizip II · Modalverb = passende Personalform + Infinitiv',
    examples: ['Ich habe gearbeitet.', 'Du musst heute lernen.'],
    mistake: 'Hilfsverb und Personalendung müssen zum Subjekt passen.'
  },
  wordOrder: {
    title: 'Die Verbposition kontrollieren',
    rule: 'Im Hauptsatz steht das konjugierte Verb auf Position 2; im Nebensatz meistens am Ende.',
    pattern: 'Heute + gehe + ich … · weil + ich + … + gehe',
    examples: ['Morgen rufe ich dich an.', 'Ich bleibe, weil ich krank bin.'],
    mistake: 'Position 2 bedeutet Satzglied 2, nicht immer das zweite einzelne Wort.'
  },
  connectors: {
    title: 'Grund, Folge und Inhalt verbinden',
    rule: 'Wähle zuerst die Beziehung: Grund, Folge, Gegensatz, Bedingung oder Inhalt.',
    pattern: 'weil/dass/wenn → Verb am Ende · deshalb → Verb direkt danach',
    examples: ['Ich bleibe, weil es regnet.', 'Es regnet. Deshalb bleibe ich.'],
    mistake: 'Konnektor und Wortstellung immer zusammen lernen.'
  },
  prepositions: {
    title: 'Präpositionen als feste Muster lernen',
    rule: 'Ort, Richtung und Zeit brauchen unterschiedliche Präpositionen und manchmal einen festen Kasus.',
    pattern: 'nach Berlin · an der Wand · am Montag · um neun Uhr',
    examples: ['Wir fahren nach Köln.', 'Der Kurs beginnt am Dienstag um acht.'],
    mistake: 'Übersetze Präpositionen nicht Wort für Wort aus deiner Muttersprache.'
  },
  adjectives: {
    title: 'Vergleich und Adjektivendung wählen',
    rule: 'Prüfe, ob das Adjektiv vor einem Nomen steht oder einen Vergleich beschreibt.',
    pattern: 'größer als · ein gutes Restaurant · der wärmste Tag',
    examples: ['Berlin ist größer als Bonn.', 'Das ist ein schönes Bild.'],
    mistake: '„am größten“ steht ohne Nomen; „der größte Tag“ steht vor einem Nomen.'
  },
  pronouns: {
    title: 'Pronomen nach Funktion auswählen',
    rule: 'Das Verb und die Satzfunktion entscheiden zwischen mich, mir, sich und Possessivformen.',
    pattern: 'jemandem helfen → mir · sich waschen → sich · sein Fahrrad → seins',
    examples: ['Kannst du mir helfen?', 'Anna wäscht sich die Hände.'],
    mistake: 'Die deutsche Pronomenform kann einen anderen Kasus haben als in deiner Sprache.'
  },
  questions: {
    title: 'Direkt oder höflich fragen',
    rule: 'Direkte Fragen haben das Verb früh; indirekte Fragen schicken es ans Ende.',
    pattern: 'Wann kommt der Bus? · Wissen Sie, wann der Bus kommt?',
    examples: ['Wie viel kostet das?', 'Könnten Sie mir bitte helfen?'],
    mistake: 'In einer indirekten Frage keine direkte Fragewortstellung verwenden.'
  }
};

const teachingRows = {
  g01: ['„Tisch“ ist maskulin und das direkte Objekt von „kaufen“: einen neuen Tisch.', ['„ein“ wäre Nominativ; hier brauchen wir den maskulinen Akkusativ.', '', '„einem“ ist Dativ, aber „kaufen“ fragt hier wen oder was?'], 'Maskuliner Akkusativ'],
  g02: ['„helfen“ verlangt immer den Dativ: der Nachbarin.', ['„die“ ist Nominativ oder Akkusativ feminin, nicht Dativ.', '', '„den“ passt nicht zu einem femininen Singularwort.'], 'Verben mit Dativ'],
  g03: ['Nach „für“ steht immer Akkusativ; neutral bleibt der Artikel „das“.', ['', '„dem“ ist Dativ und kann nach „für“ nicht stehen.', '„den“ wäre maskuliner Akkusativ oder Dativ Plural.'], 'Akkusativpräpositionen'],
  g04: ['„arbeiten“ bildet das Perfekt mit „haben“: ich habe gearbeitet.', ['„bin“ wird bei Bewegungs- oder Zustandswechselverben gebraucht.', '', '„hatte gearbeitet“ ist Plusquamperfekt und passt nicht zu dieser A2-Aussage.'], 'Perfekt mit haben'],
  g05: ['„spielte“ beschreibt eine regelmäßige Handlung in der Vergangenheit.', ['„spiele“ ist Präsens.', '', 'Das Partizip „gespielt“ braucht ein Hilfsverb.'], 'Präteritum'],
  g06: ['Das Subjekt „du“ verlangt die Form „musst“.', ['', '„müsst“ gehört zu „ihr“.', '„müssen“ gehört zu „wir“, „sie“ oder „Sie“.'], 'Modalverben'],
  g07: ['Im Hauptsatz steht „rufe“ auf Position 2 und „an“ am Satzende.', ['', '„anrufe“ steht zusammen nur im Nebensatz am Ende.', 'Diese Folge enthält kein korrekt konjugiertes Verb auf Position 2.'], 'Trennbare Verben'],
  g08: ['Der aktuelle Zustand verlangt Präsens: weil ich krank bin.', ['', '„war“ bezeichnet einen vergangenen Zustand, nicht den aktuellen Grund.', '„werde“ beschreibt eine Veränderung oder Zukunft und passt hier nicht.'], 'Nebensatzstellung'],
  g09: ['Direkte W-Frage: Fragewort + Verb + Subjekt.', ['Hier steht das Verb fälschlich am Ende wie in einer indirekten Frage.', '', '„Kurs“ ist das Subjekt und darf nicht im Akkusativ stehen.'], 'Direkte Fragen'],
  g10: ['„weil“ nennt den Grund für das spätere Kommen.', ['„aber“ zeigt einen Gegensatz, keinen Grund.', '', '„deshalb“ nennt eine Folge und leitet keinen Verb-Endsatz ein.'], 'weil-Sätze'],
  g11: ['„deshalb“ verbindet Ursache und Folge; das Verb folgt direkt.', ['', '„dass“ leitet einen Inhaltssatz ein und passt semantisch nicht.', '„oder“ bietet eine Alternative statt einer Folge.'], 'Folge mit deshalb'],
  g12: ['„dass“ leitet den Inhalt dessen ein, was man weiß.', ['„weil“ würde einen Grund nennen.', '', '„wenn“ beschreibt eine Bedingung oder wiederholte Zeit.'], 'dass-Sätze'],
  g13: ['Vor Städten ohne Artikel steht bei einer Richtung „nach“.', ['', '„zu“ verwendet man eher bei Personen oder bestimmten Zielen.', '„in der“ beschreibt einen Ort und Berlin hat hier keinen Artikel.'], 'Richtungspräpositionen'],
  g14: ['Ein Bild hängt an einer vertikalen Fläche: an der Wand.', ['', '„auf“ passt typischerweise zu einer horizontalen Fläche.', '„über die“ beschreibt eine Richtung oder eine andere räumliche Beziehung.'], 'Wechselpräpositionen'],
  g15: ['Wochentage stehen mit „am“, Uhrzeiten mit „um“.', ['', '„im“ passt zu Monaten oder Jahreszeiten, „an“ nicht direkt zur Uhrzeit.', 'Die beiden Zeitpräpositionen sind vertauscht.'], 'Zeitpräpositionen'],
  g16: ['Der Vergleich mit „als“ braucht den Komparativ „größer“.', ['„groß“ ist die Grundform.', '', '„am größten“ ist Superlativ, kein Vergleich zwischen zwei Wohnungen.'], 'Komparativ'],
  g17: ['Neutrales Nomen nach „ein“ im Nominativ: ein gutes Restaurant.', ['', '„gute“ passt hier nicht zum neutralen Nomen.', '„guter“ ist eine maskuline Endung.'], 'Adjektivendungen'],
  g18: ['Vor dem Nomen steht der Superlativ als Adjektiv: der wärmste Tag.', ['„wärmer“ ist Komparativ.', '', '„am wärmsten“ steht ohne nachfolgendes Nomen.'], 'Superlativ'],
  g19: ['„helfen“ verlangt Dativ; Dativ von „ich“ ist „mir“.', ['„mich“ ist Akkusativ.', '', '„ich“ ist Nominativ und kann hier nicht Objekt sein.'], 'Personalpronomen im Dativ'],
  g20: ['Bei Körperpflege verwendet man „sich die Hände waschen“.', ['', '„ihr“ würde Besitz ausdrücken, nicht die reflexive Handlung.', '„sie“ ist hier keine passende reflexive Form.'], 'Reflexivpronomen'],
  g21: ['„seins“ ersetzt vollständig „sein Fahrrad“.', ['', '„seine“ braucht normalerweise ein feminines oder plurales Nomen.', '„seiner“ passt hier weder zu Kasus noch Genus.'], 'Possessivpronomen'],
  g22: ['„Könnten Sie … bitte …?“ ist eine höfliche Bitte im Konjunktiv II.', ['Der Imperativ klingt direkt und weniger höflich.', '', 'Die Aussageform mit Fragezeichen ist keine korrekte höfliche Bitte.'], 'Höfliche Bitten'],
  g23: ['In der indirekten Frage steht das Verb am Ende: wann der Bus kommt.', ['', '„kommt er“ ist direkte Fragewortstellung.', '„er kommt“ setzt ein zusätzliches Subjekt ein, obwohl „der Bus“ schon Subjekt ist.'], 'Indirekte Fragen'],
  g24: ['Mit „Wie viel“ fragt man nach einem Preis oder einer unzählbaren Menge.', ['', '„Wie viele“ braucht ein zählbares Nomen im Plural.', '„Was für“ fragt nach einer Art, nicht nach dem Preis.'], 'Preisfragen'],
  g25: ['„gehören“ verbindet den Besitzer im Dativ: dem Mann.', ['„der“ wäre Nominativ und markiert normalerweise ein Subjekt.', '„den“ ist maskuliner Akkusativ, aber „gehören“ verlangt Dativ.', ''], 'Verben mit Dativ'],
  g26: ['„mit“ verlangt immer Dativ; feminin wird „eine“ zu „einer“.', ['„eine“ ist Nominativ oder Akkusativ feminin, nicht Dativ.', '', '„einen“ ist maskuliner Akkusativ und passt nicht zu „Kollegin“.'], 'Dativ nach mit'],
  g27: ['Die Jacke ist hier das Subjekt und feminin: die Jacke.', ['', '„der“ wäre Dativ feminin oder Nominativ maskulin.', '„den“ ist maskuliner Akkusativ und passt nicht zu „Jacke“.'], 'Subjekt im Nominativ'],
  g28: ['Bei einer Ortsveränderung bildet „fahren“ das Perfekt mit „sein“: wir sind gefahren.', ['„haben“ passt hier nicht zur Bewegung von einem Ort zum anderen.', '', '„werden gefahren“ wäre eine andere Konstruktion und kein Perfekt.'], 'Perfekt mit sein'],
  g29: ['Die Vergangenheitsform von „haben“ lautet bei „ich“: hatte.', ['„habe“ ist Präsens und passt nicht zum Signalwort „früher“.', '', '„gehabt“ ist nur das Partizip und braucht zusätzlich ein Hilfsverb.'], 'Präteritum von haben'],
  g30: ['Das Subjekt „ihr“ verlangt die Form „dürft“.', ['', '„darf“ gehört zu „ich“, „er“, „sie“ oder „es“.', '„dürfen“ gehört zu „wir“, „sie“ oder der Höflichkeitsform „Sie“.'], 'Modalverb dürfen'],
  g31: ['Nach „Heute“ steht das konjugierte Verb auf Position 2: Heute muss ich …', ['Hier steht das Subjekt vor dem Verb, sodass das Verb erst Position 3 hat.', '', 'Die Satzglieder stehen in keiner gültigen deutschen Hauptsatzreihenfolge.'], 'Verbposition im Hauptsatz'],
  g32: ['Das Subjekt „sie“ verlangt die Form „kommt“ am Ende des dass-Satzes.', ['', '„kommen“ ist Infinitiv oder Plural und stimmt nicht mit „sie“ Singular überein.', '„komme“ gehört zu „ich“ oder zur indirekten Rede und passt hier nicht.'], 'dass-Nebensatz'],
  g33: ['Eine Ja-/Nein-Frage beginnt mit dem konjugierten Verb: Hast du …?', ['Diese umgangssprachliche Aussageform ist nicht die erwartete Standardfrage.', '', 'Nach „Heute“ müsste das Verb direkt folgen: Heute hast du …'], 'Ja-/Nein-Fragen'],
  g34: ['„wenn“ formuliert die Bedingung, unter der gemeinsames Lernen möglich ist.', ['', '„deshalb“ drückt eine Folge aus und leitet keinen Nebensatz ein.', '„aber“ zeigt einen Gegensatz und passt nicht zur Verb-Endstellung.'], 'Bedingung mit wenn'],
  g35: ['Der ausgefallene Bus ist die Ursache; „deshalb“ leitet die Folge ein.', ['„weil“ würde einen Nebensatz mit Verb am Ende verlangen.', '', '„dass“ leitet einen Inhaltssatz ein und beschreibt keine Folge.'], 'Folge mit deshalb'],
  g36: ['„zuerst … dann“ ordnet zwei Handlungen zeitlich.', ['', '„weil“ würde einen Grund nennen und das Verb ans Ende schicken.', '„ob“ leitet eine indirekte Ja-/Nein-Frage ein.'], 'Zeitliche Reihenfolge'],
  g37: ['Für einen Aufenthalt bei einer Person verwendet man „bei“ plus Dativ.', ['', '„nach“ beschreibt eine Richtung zu Städten oder Ländern ohne Artikel.', '„aus“ beschreibt eine Herkunft oder Bewegung von innen nach außen.'], 'Aufenthalt bei Personen'],
  g38: ['„stellen“ beschreibt eine Bewegung mit Ziel; deshalb heißt es „in die Küche“.', ['„in der Küche“ beantwortet „wo?“ und beschreibt keine Zielbewegung.', '', '„an der Küche“ ist weder die passende räumliche Beziehung noch der passende Kasus.'], 'Wohin mit Akkusativ'],
  g39: ['„seit einem Jahr“ bedeutet: Der Zustand begann früher und dauert noch an.', ['„vor einem Jahr“ bezeichnet nur einen abgeschlossenen Zeitpunkt in der Vergangenheit.', '', '„für einem Jahr“ ist grammatisch falsch; nach „für“ müsste Akkusativ stehen.'], 'Zeitangabe mit seit'],
  g40: ['Feminin Akkusativ nach „eine“: eine rote Tasche.', ['Die endungslose Form steht hier nicht direkt vor einem Nomen.', '', '„rotes“ ist eine neutrale Adjektivform und passt nicht zu „Tasche“.'], 'Adjektivendung feminin'],
  g41: ['Der Superlativ von „gern“ lautet „am liebsten“.', ['„lieber“ ist nur der Komparativ und vergleicht normalerweise zwei Möglichkeiten.', '', 'Ohne „am“ ist „liebsten“ in dieser Konstruktion unvollständig.'], 'Unregelmäßiger Superlativ'],
  g42: ['Gleichheit wird mit „so/genauso … wie“ ausgedrückt.', ['„als“ steht bei einem Unterschied im Komparativ, zum Beispiel „teurer als“.', '', '„denn“ kann hier keine beiden gleich starken Eigenschaften vergleichen.'], 'Vergleich mit wie'],
  g43: ['„Herrn Wagner“ ist maskulin und Akkusativ; das passende Pronomen ist „ihn“.', ['„ihm“ ist Dativ, aber „kennen“ verlangt ein Akkusativobjekt.', '', '„er“ ist Nominativ und kann hier nicht das Objekt ersetzen.'], 'Akkusativpronomen'],
  g44: ['Plural Akkusativ nach „wir“: unsere Großeltern.', ['', '„unseren“ passt zum maskulinen Akkusativ Singular oder Dativ Plural mit zusätzlichem -n.', '„unser“ ist die Grundform und passt nicht direkt vor „Großeltern“.'], 'Possessivartikel im Plural'],
  g45: ['Das Reflexivpronomen zu „wir“ ist „uns“: Wir treffen uns.', ['', '„euch“ gehört zu „ihr“ und würde eine andere Personengruppe bezeichnen.', '„sich“ gehört zu „er“, „sie“, „es“ oder „sie“ im Plural.'], 'Reflexivpronomen wir'],
  g46: ['„Woher?“ fragt nach Herkunft; „Aus Japan“ ist eine Herkunftsangabe.', ['„Wo?“ fragt nach einem festen Ort, nicht nach der Herkunft.', '„Wohin?“ fragt nach einem Ziel und würde zum Beispiel „nach Japan“ erwarten.', ''], 'Frage nach Herkunft'],
  g47: ['Eine indirekte Frage ohne Fragewort beginnt mit „ob“: ob der Supermarkt geöffnet ist.', ['', '„wann“ fragt nach einer Zeit, aber die erwartete Antwort ist hier ja oder nein.', '„warum“ fragt nach einem Grund, nicht nach dem geöffneten Zustand.'], 'Indirekte Frage mit ob'],
  g48: ['„Würden Sie mir bitte …?“ kombiniert Konjunktiv II und „bitte“ besonders höflich.', ['Die direkte Informationsfrage ist korrekt, aber weniger höflich formuliert.', 'Der Imperativ klingt wie eine Anweisung und nicht wie eine höfliche Bitte.', ''], 'Höfliche Frage mit würden']
};

const coreGrammarTeaching = Object.fromEntries(Object.entries(teachingRows).map(([id, [correctReason, wrongReasons, concept]]) => [id, {
  concept,
  correctReason,
  wrongReasons
}]));

export const grammarTeaching = {
  ...coreGrammarTeaching,
  ...Object.fromEntries(grammarExpansion.map(normalizeGrammarExpansion).map(({ id, teaching }) => [id, teaching]))
};
