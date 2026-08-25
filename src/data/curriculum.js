import { initialAvatarState } from '../avatar/avatarCatalog.js';

export const skills = [
  { id: 'reading', label: 'Lesen', short: 'LE', color: '#d84a3a' },
  { id: 'listening', label: 'Hören', short: 'HÖ', color: '#3266c5' },
  { id: 'writing', label: 'Schreiben', short: 'SC', color: '#9b4e9f' },
  { id: 'speaking', label: 'Sprechen', short: 'SP', color: '#19765f' }
];

export const curriculum = [
  {
    id: 'ankommen', number: '01', title: 'Ankommen & Alltag', subtitle: 'Sich vorstellen, Termine, Tagesablauf', practiceSkill: 'speaking',
    grammar: ['Präsens wiederholen', 'Trennbare Verben', 'Zeitangaben'],
    vocabulary: ['Persönliche Angaben', 'Tageszeiten', 'Termine'],
    goals: ['Ein kurzes Profil verstehen', 'Über den eigenen Alltag sprechen', 'Eine einfache Termin-Nachricht schreiben'],
    sourceHint: 'Netzwerk A2 · Einstieg und Alltag'
  },
  {
    id: 'wohnen', number: '02', title: 'Wohnen & Nachbarschaft', subtitle: 'Räume, Möbel, Orientierung', practiceSkill: 'reading',
    grammar: ['Wechselpräpositionen', 'Dativ oder Akkusativ', 'Positionsverben'],
    vocabulary: ['Wohnung', 'Möbel', 'Nachbarschaft'],
    goals: ['Wohnungsanzeigen vergleichen', 'Beschreiben, wo etwas steht', 'Ein Problem in der Wohnung melden'],
    sourceHint: 'Grammatik aktiv · Wechselpräpositionen'
  },
  {
    id: 'arbeit', number: '03', title: 'Arbeit & Ausbildung', subtitle: 'Berufe, Erfahrungen, Pläne', practiceSkill: 'writing',
    grammar: ['Modalverben im Präteritum', 'weil-Sätze', 'Perfekt'],
    vocabulary: ['Berufe', 'Arbeitsplatz', 'Ausbildung'],
    goals: ['Eine Stellenanzeige verstehen', 'Über frühere Pflichten sprechen', 'Eine kurze berufliche Anfrage schreiben'],
    sourceHint: 'Netzwerk A2 · Schule und Beruf'
  },
  {
    id: 'gesundheit', number: '04', title: 'Gesundheit', subtitle: 'Beschwerden, Apotheke, Ratschläge', practiceSkill: 'speaking',
    grammar: ['Imperativ', 'sollen', 'Reflexive Verben'],
    vocabulary: ['Körper', 'Beschwerden', 'Medikamente'],
    goals: ['Anweisungen verstehen', 'Beschwerden beschreiben', 'Ratschläge geben'],
    sourceHint: 'Grammatik aktiv · Imperativ'
  },
  {
    id: 'unterwegs', number: '05', title: 'Unterwegs', subtitle: 'Verkehr, Wege, Reisen', practiceSkill: 'listening',
    grammar: ['Lokale Präpositionen', 'Dativ', 'Indirekte Fragen'],
    vocabulary: ['Verkehrsmittel', 'Bahnhof', 'Wegbeschreibung'],
    goals: ['Durchsagen verstehen', 'Nach dem Weg fragen', 'Eine Verbindung erklären'],
    sourceHint: 'Netzwerk A2 · Mobilität'
  },
  {
    id: 'einkaufen', number: '06', title: 'Einkaufen & Service', subtitle: 'Produkte, Reklamation, Wünsche', practiceSkill: 'writing',
    grammar: ['Adjektivendungen', 'Konjunktiv II mit würde', 'Vergleiche'],
    vocabulary: ['Kleidung', 'Größen', 'Service'],
    goals: ['Produktinformationen finden', 'Höflich um Hilfe bitten', 'Eine einfache Reklamation schreiben'],
    sourceHint: 'Netzwerk A2 · Konsum und Service'
  },
  {
    id: 'freizeit', number: '07', title: 'Freizeit & Medien', subtitle: 'Hobbys, Veranstaltungen, Meinungen', practiceSkill: 'reading',
    grammar: ['Perfekt', 'dass-Sätze', 'Verben mit Präpositionen'],
    vocabulary: ['Hobbys', 'Kultur', 'Medien'],
    goals: ['Veranstaltungstipps verstehen', 'Eine Meinung begründen', 'Jemanden einladen'],
    sourceHint: 'Netzwerk A2 · Freizeit'
  },
  {
    id: 'lernen', number: '08', title: 'Lernen & Schule', subtitle: 'Erinnerungen, Kurse, Lernwege', practiceSkill: 'listening',
    grammar: ['Präteritum von sein/haben', 'Modalverben im Präteritum', 'Nebensätze'],
    vocabulary: ['Schulfächer', 'Kurse', 'Lernstrategien'],
    goals: ['Kursinformationen verstehen', 'Über die Schulzeit sprechen', 'Einen Kurs kommentieren'],
    sourceHint: 'Netzwerk A2 · Schulzeit'
  },
  {
    id: 'kontakte', number: '09', title: 'Kontakte & Feste', subtitle: 'Einladen, absagen, gratulieren', practiceSkill: 'speaking',
    grammar: ['Personalpronomen im Dativ', 'Nebensätze mit wenn', 'Possessivartikel'],
    vocabulary: ['Feste', 'Geschenke', 'Beziehungen'],
    goals: ['Einladungen verstehen', 'Zu- oder absagen', 'Über ein Fest berichten'],
    sourceHint: 'Netzwerk A2 · Kontakte'
  },
  {
    id: 'behoerden', number: '10', title: 'Ämter & Organisation', subtitle: 'Formulare, Regeln, Auskünfte', practiceSkill: 'reading',
    grammar: ['Passiv mit werden', 'dürfen und müssen', 'Indirekte Fragen'],
    vocabulary: ['Dokumente', 'Behörden', 'Regeln'],
    goals: ['Formularfelder verstehen', 'Eine Auskunft erfragen', 'Regeln erklären'],
    sourceHint: 'A2 Prüfungssprache · Alltag organisieren'
  },
  {
    id: 'natur', number: '11', title: 'Natur & Wetter', subtitle: 'Wetterbericht, Ausflug, Vergleiche', practiceSkill: 'listening',
    grammar: ['Komparativ und Superlativ', 'wenn-Sätze', 'Adjektive'],
    vocabulary: ['Wetter', 'Landschaft', 'Aktivitäten'],
    goals: ['Wetterinformationen verstehen', 'Orte vergleichen', 'Einen Ausflug planen'],
    sourceHint: 'Netzwerk A2 · Ausflüge'
  },
  {
    id: 'zukunft', number: '12', title: 'Pläne & Zukunft', subtitle: 'Wünsche, Ziele, Verabredungen', practiceSkill: 'writing',
    grammar: ['werden + Infinitiv', 'Konjunktiv II', 'Temporale Präpositionen'],
    vocabulary: ['Ziele', 'Pläne', 'Veränderungen'],
    goals: ['Zukunftspläne verstehen', 'Wünsche formulieren', 'Eine Verabredung organisieren'],
    sourceHint: 'A2 Abschluss · Handlungsfähigkeit'
  }
];

export const practiceBank = {
  reading: [
    {
      id: 'r1', title: 'Aushang im Haus', level: 'leicht',
      passage: 'Liebe Hausbewohner, am Dienstag wird von 8 bis 12 Uhr das Wasser abgestellt. Bitte benutzen Sie in dieser Zeit weder die Waschmaschine noch die Spülmaschine. Ab 12 Uhr funktioniert alles wieder.',
      question: 'Was sollen die Bewohner am Dienstagvormittag tun?',
      options: ['Die Waschmaschine nicht benutzen.', 'Zu Hause auf den Techniker warten.', 'Wasser für das ganze Haus kaufen.'], answer: 0,
      explanation: '„Weder … noch“ bedeutet: Beide Geräte sollen in dieser Zeit nicht benutzt werden.'
    },
    {
      id: 'r2', title: 'Nachricht von Nora', level: 'leicht',
      passage: 'Hallo Ben, ich komme heute ungefähr zwanzig Minuten später zum Deutschkurs. Der Bus fährt wegen einer Baustelle nicht durch die Innenstadt. Kannst du Frau Weber bitte Bescheid sagen? Danke, Nora',
      question: 'Warum kommt Nora später?',
      options: ['Sie muss länger arbeiten.', 'Ihr Bus fährt eine andere Strecke.', 'Der Deutschkurs beginnt später.'], answer: 1,
      explanation: 'Die Baustelle verändert die Busstrecke; deshalb verspätet sich Nora.'
    },
    {
      id: 'r3', title: 'Kursangebot', level: 'mittel',
      passage: 'Fit am Morgen: Bewegung für alle, die den Tag aktiv beginnen möchten. Montags und donnerstags, 7:30–8:15 Uhr. Der erste Termin ist kostenlos. Bitte bringen Sie bequeme Kleidung und ein Handtuch mit. Anmeldung bis Freitag im Büro oder online.',
      question: 'Welche Aussage ist richtig?',
      options: ['Man muss für den ersten Termin bezahlen.', 'Der Kurs findet zweimal pro Woche statt.', 'Man kann sich nur persönlich anmelden.'], answer: 1,
      explanation: 'Montag und Donnerstag sind zwei Termine pro Woche.'
    },
    {
      id: 'r4', title: 'Reklamation', level: 'mittel',
      passage: 'Sehr geehrte Damen und Herren, vor einer Woche habe ich bei Ihnen Kopfhörer bestellt. Das Paket ist gestern angekommen, aber der rechte Kopfhörer funktioniert nicht. Ich möchte keinen neuen Artikel, sondern mein Geld zurück. Mit freundlichen Grüßen, Karim Yilmaz',
      question: 'Was möchte Karim?',
      options: ['Eine Reparatur.', 'Andere Kopfhörer.', 'Eine Rückzahlung.'], answer: 2,
      explanation: '„Mein Geld zurück“ bedeutet eine Rückzahlung.'
    },
    {
      id: 'r5', title: 'Bibliotheksregeln', level: 'mittel',
      passage: 'Bücher können vier Wochen ausgeliehen werden. Eine Verlängerung ist zweimal möglich, wenn niemand das Buch reserviert hat. Filme müssen bereits nach einer Woche zurückgebracht werden. Bei verspäteter Rückgabe kostet jeder Tag 50 Cent.',
      question: 'Wann kann man ein Buch nicht verlängern?',
      options: ['Wenn eine andere Person es reserviert hat.', 'Wenn man es schon zwei Wochen hat.', 'Wenn man gleichzeitig einen Film ausleiht.'], answer: 0,
      explanation: 'Eine Reservierung durch eine andere Person verhindert die Verlängerung.'
    },
    {
      id: 'r6', title: 'Ausflug am Wochenende', level: 'prüfungsnah',
      passage: 'Am Samstag bleibt es bis zum Mittag trocken. Am Nachmittag ziehen von Westen Regenwolken auf. Für Sonntag werden niedrigere Temperaturen, aber viel Sonne erwartet. Wanderer sollten beachten, dass einige Wege wegen des starken Regens der letzten Tage noch gesperrt sind.',
      question: 'Welcher Tag eignet sich wahrscheinlich besser für eine Wanderung?',
      options: ['Samstagabend.', 'Sonntag.', 'Beide Tage sind gleich gut.'], answer: 1,
      explanation: 'Am Sonntag ist es zwar kühler, aber sonnig. Samstag kommt am Nachmittag Regen.'
    }
  ],
  listening: [
    {
      id: 'l1', title: 'Durchsage am Bahnhof', level: 'leicht',
      transcript: 'Achtung auf Gleis sieben. Der Regionalzug nach Bonn fährt heute nicht um vierzehn Uhr zehn, sondern zwanzig Minuten später. Reisende nach Köln benutzen bitte den Zug auf Gleis neun.',
      question: 'Was ändert sich beim Zug nach Bonn?',
      options: ['Das Gleis.', 'Die Abfahrtszeit.', 'Das Reiseziel.'], answer: 1,
      explanation: 'Der Zug fährt zwanzig Minuten später.'
    },
    {
      id: 'l2', title: 'Anruf beim Arzt', level: 'leicht',
      transcript: 'Guten Tag, hier ist die Praxis Doktor Kramer. Ihr Termin morgen um halb elf muss leider ausfallen. Wir können Ihnen am Donnerstag um neun Uhr oder am Freitag um zwölf Uhr einen neuen Termin anbieten. Bitte rufen Sie uns zurück.',
      question: 'Warum soll die Person zurückrufen?',
      options: ['Sie soll einen neuen Termin wählen.', 'Sie muss ihre Adresse nennen.', 'Sie soll ein Rezept abholen.'], answer: 0,
      explanation: 'Die Praxis bietet zwei neue Termine an; die Person muss einen auswählen.'
    },
    {
      id: 'l3', title: 'Sprachnachricht', level: 'mittel',
      transcript: 'Hi Lea, ich bin schon im Supermarkt. Brot und Milch habe ich. Soll ich auch Tomaten kaufen? Käse brauchen wir nicht, davon ist noch genug da. Ruf mich bitte schnell an, denn in zehn Minuten gehe ich zur Kasse.',
      question: 'Was ist noch unklar?',
      options: ['Ob Tomaten gekauft werden sollen.', 'Ob genug Käse da ist.', 'Ob Lea Brot braucht.'], answer: 0,
      explanation: 'Die Person fragt ausdrücklich nach den Tomaten.'
    },
    {
      id: 'l4', title: 'Radiotipp', level: 'mittel',
      transcript: 'Unser Freizeittipp: Das Stadtmuseum öffnet am Sonntag schon um neun Uhr. Familien zahlen bis zwölf Uhr keinen Eintritt. Um zehn Uhr beginnt eine Führung speziell für Kinder. Eine Anmeldung ist nicht nötig.',
      question: 'Was ist am Sonntagvormittag kostenlos?',
      options: ['Der Eintritt für Familien.', 'Jede Führung.', 'Das Frühstück im Museum.'], answer: 0,
      explanation: 'Familien zahlen bis zwölf Uhr keinen Eintritt.'
    },
    {
      id: 'l5', title: 'Im Büro', level: 'mittel',
      transcript: 'Frau Santos, könnten Sie bitte zuerst die E-Mails beantworten? Die Besprechung mit Herrn Wolf beginnt erst um drei. Die Unterlagen dafür liegen schon auf Ihrem Schreibtisch. Den Brief an die Versicherung machen wir morgen zusammen.',
      question: 'Was soll Frau Santos zuerst machen?',
      options: ['Die Unterlagen suchen.', 'E-Mails beantworten.', 'Einen Brief schreiben.'], answer: 1,
      explanation: 'Die erste direkte Bitte betrifft die E-Mails.'
    },
    {
      id: 'l6', title: 'Wetter und Verkehr', level: 'prüfungsnah',
      transcript: 'Wegen starken Schnees fahren die Busse im Norden der Stadt nur unregelmäßig. Die Straßenbahnlinien zwei und vier fahren normal. Autofahrer sollen die Hauptstraße am Park vermeiden. Dort gab es einen Unfall.',
      question: 'Welche Verkehrsmittel fahren ohne Änderungen?',
      options: ['Alle Busse.', 'Die Straßenbahnen zwei und vier.', 'Autos auf der Hauptstraße.'], answer: 1,
      explanation: 'Nur für die Straßenbahnlinien zwei und vier wird ausdrücklich „normal“ gesagt.'
    }
  ],
  writing: [
    {
      id: 'w1', title: 'Termin absagen', level: 'leicht', minWords: 35,
      prompt: 'Sie können morgen nicht zu Ihrem Deutschkurs kommen. Schreiben Sie Ihrer Kursleiterin Frau Klein.',
      bullets: ['Warum können Sie nicht kommen?', 'Bitten Sie um die Hausaufgaben.', 'Sagen Sie, wann Sie wiederkommen.'],
      targetWords: ['leider', 'weil', 'Hausaufgaben', 'wieder'], modelStart: 'Liebe Frau Klein,\nleider kann ich morgen nicht …'
    },
    {
      id: 'w2', title: 'Einladung beantworten', level: 'mittel', minWords: 40,
      prompt: 'Ihr Freund Max lädt Sie am Samstag zu seiner Geburtstagsfeier ein. Antworten Sie ihm.',
      bullets: ['Bedanken Sie sich.', 'Sagen Sie zu oder ab und begründen Sie.', 'Fragen Sie, ob Sie etwas mitbringen sollen.'],
      targetWords: ['danke', 'Samstag', 'weil', 'mitbringen'], modelStart: 'Hallo Max,\nvielen Dank für deine Einladung …'
    },
    {
      id: 'w3', title: 'Problem in der Wohnung', level: 'mittel', minWords: 45,
      prompt: 'Seit zwei Tagen funktioniert die Heizung in Ihrer Wohnung nicht. Schreiben Sie an die Hausverwaltung.',
      bullets: ['Beschreiben Sie das Problem.', 'Erklären Sie, warum es dringend ist.', 'Bitten Sie um einen Termin.'],
      targetWords: ['Heizung', 'seit', 'dringend', 'Termin'], modelStart: 'Sehr geehrte Damen und Herren,\nseit zwei Tagen …'
    },
    {
      id: 'w4', title: 'Kursinformation', level: 'prüfungsnah', minWords: 50,
      prompt: 'Sie interessieren sich für einen Computerkurs, haben aber noch Fragen. Schreiben Sie an das Kursbüro.',
      bullets: ['Fragen Sie nach den Kurszeiten.', 'Fragen Sie nach dem Preis.', 'Erklären Sie kurz Ihre Vorkenntnisse.'],
      targetWords: ['Kurs', 'wann', 'kostet', 'Erfahrung'], modelStart: 'Sehr geehrte Damen und Herren,\nich interessiere mich für …'
    }
  ],
  speaking: [
    {
      id: 's1', title: 'Sich vorstellen', level: 'leicht', seconds: 45,
      prompt: 'Stellen Sie sich kurz vor.', bullets: ['Name und Herkunft', 'Wohnort', 'Arbeit oder Kurs', 'Ein Hobby'],
      targetWords: ['ich', 'wohne', 'arbeite', 'gern']
    },
    {
      id: 's2', title: 'Gemeinsam planen', level: 'mittel', seconds: 60,
      prompt: 'Sie möchten mit einer Freundin am Wochenende etwas unternehmen. Machen Sie einen Vorschlag.',
      bullets: ['Aktivität', 'Tag und Uhrzeit', 'Treffpunkt', 'Alternative bei schlechtem Wetter'],
      targetWords: ['können', 'Samstag', 'treffen', 'wenn']
    },
    {
      id: 's3', title: 'Um Hilfe bitten', level: 'mittel', seconds: 45,
      prompt: 'Sie sind neu in der Stadt und suchen die Bibliothek. Bitten Sie höflich um Hilfe.',
      bullets: ['Nach dem Weg fragen', 'Nach einem Verkehrsmittel fragen', 'Sich bedanken'],
      targetWords: ['Entschuldigung', 'wie', 'fahren', 'danke']
    },
    {
      id: 's4', title: 'Über Erfahrungen sprechen', level: 'prüfungsnah', seconds: 75,
      prompt: 'Erzählen Sie von einem Kurs oder einer Ausbildung, die Ihnen gefallen hat.',
      bullets: ['Was und wann?', 'Was haben Sie gelernt?', 'Was war gut oder schwierig?', 'Würden Sie den Kurs empfehlen?'],
      targetWords: ['habe', 'gelernt', 'weil', 'würde']
    }
  ]
};

practiceBank.reading.push(
  {
    id: 'r7', title: 'Nachricht aus dem Sportverein', level: 'mittel', goethePart: 'Lesen Teil 1',
    passage: 'Liebe Mitglieder, am Freitag bleibt die Sporthalle wegen Reparaturen geschlossen. Der Yogakurs findet deshalb einmalig im Raum 3 der Volkshochschule statt. Beginn ist wie immer um 18 Uhr. Bitte bringen Sie eine eigene Matte mit.',
    question: 'Was ist am Freitag anders?',
    options: ['Der Yogakurs beginnt später.', 'Der Yogakurs ist an einem anderen Ort.', 'Die Mitglieder brauchen keine Matte.'],
    answer: 1, explanation: 'Der Kurs findet einmalig in Raum 3 der Volkshochschule statt.'
  },
  {
    id: 'r8', title: 'Anzeigen für einen Nebenjob', level: 'prüfungsnah', goethePart: 'Lesen Teil 2',
    passage: 'A Café Morgenrot sucht Hilfe am Wochenende, Erfahrung nicht nötig. B Fahrradladen Blitz braucht montags bis freitags von 9 bis 13 Uhr eine Person mit Computerkenntnissen. C Familie Yilmaz sucht dienstags und donnerstags abends Betreuung für zwei Kinder.',
    question: 'Mina studiert vormittags und kann nur an zwei Abenden arbeiten. Welche Anzeige passt?',
    options: ['Anzeige A', 'Anzeige B', 'Anzeige C'],
    answer: 2, explanation: 'Nur Anzeige C bietet Arbeit an zwei Abenden.'
  },
  {
    id: 'r9', title: 'E-Mail zur Hotelbuchung', level: 'mittel', goethePart: 'Lesen Teil 3',
    passage: 'Sehr geehrter Herr Öztürk, Ihr Zimmer ist ab Donnerstag reserviert. Da Sie erst nach 22 Uhr ankommen, legen wir Ihre Schlüsselkarte in den Automaten neben dem Eingang. Den Code erhalten Sie am Reisetag per SMS. Frühstück können Sie morgens direkt im Restaurant buchen.',
    question: 'Wie bekommt Herr Öztürk sein Zimmer, wenn er ankommt?',
    options: ['Ein Mitarbeiter wartet auf ihn.', 'Er benutzt einen Automaten und einen Code.', 'Er holt den Schlüssel im Restaurant.'],
    answer: 1, explanation: 'Die Schlüsselkarte liegt im Automaten; der Code kommt per SMS.'
  },
  {
    id: 'r10', title: 'Hinweis im Bürgerbüro', level: 'prüfungsnah', goethePart: 'Lesen Teil 4',
    passage: 'Wegen einer technischen Störung können heute keine neuen Ausweise beantragt werden. Bereits fertige Dokumente können Sie bis 16 Uhr abholen. Termine für andere Anliegen finden normal statt. Neue Termine gibt es online oder telefonisch ab morgen.',
    question: 'Was ist heute möglich?',
    options: ['Einen neuen Ausweis beantragen.', 'Ein fertiges Dokument abholen.', 'Nur telefonisch einen Termin buchen.'],
    answer: 1, explanation: 'Fertige Dokumente können bis 16 Uhr abgeholt werden.'
  }
);

practiceBank.listening.push(
  {
    id: 'l7', title: 'Ansage in der Apotheke', level: 'mittel', goethePart: 'Hören Teil 1',
    transcript: 'Guten Tag, Frau Becker. Ihr Medikament ist heute leider noch nicht da. Die Lieferung kommt morgen gegen elf Uhr. Wenn Sie möchten, schicken wir Ihnen sofort eine Nachricht, sobald Sie es abholen können.',
    question: 'Wann kommt das Medikament wahrscheinlich?',
    options: ['Heute Abend.', 'Morgen gegen elf Uhr.', 'Erst nächste Woche.'],
    answer: 1, explanation: 'Die Lieferung wird morgen gegen elf Uhr erwartet.'
  },
  {
    id: 'l8', title: 'Gespräch über einen Ausflug', level: 'prüfungsnah', goethePart: 'Hören Teil 2',
    transcript: 'Also, mit dem Zug wären wir schon um neun am See. Das ist mir am Samstag zu früh. Dann nehmen wir den Bus um zehn. Der braucht zwar länger, aber wir können ausschlafen. Gut, und zurück fahren wir am besten mit dem Zug.',
    question: 'Wie fahren die Personen zum See?',
    options: ['Mit dem Bus um zehn.', 'Mit dem Zug um neun.', 'Mit dem Auto am Nachmittag.'],
    answer: 0, explanation: 'Sie entscheiden sich für den Bus um zehn.'
  },
  {
    id: 'l9', title: 'Interview im Lokalradio', level: 'prüfungsnah', goethePart: 'Hören Teil 3',
    transcript: 'Ich arbeite seit einem Jahr in der Stadtbibliothek. Viele denken, ich sortiere nur Bücher. Tatsächlich organisiere ich auch Veranstaltungen und helfe Besuchern bei der digitalen Ausleihe. Am liebsten plane ich unsere Lesungen für Kinder.',
    question: 'Was macht die Person besonders gern?',
    options: ['Bücher sortieren.', 'Kindertreffen vorbereiten.', 'Computer reparieren.'],
    answer: 1, explanation: 'Sie plant am liebsten Lesungen für Kinder.'
  },
  {
    id: 'l10', title: 'Telefonische Terminänderung', level: 'mittel', goethePart: 'Hören Teil 4',
    transcript: 'Hallo Herr Chen, hier ist die Praxis Sommer. Ihr Termin am Mittwoch um halb drei muss leider verschoben werden. Wir können Ihnen am selben Tag um fünf Uhr oder am Donnerstagvormittag einen neuen Termin anbieten. Bitte rufen Sie uns bis Dienstag zurück.',
    question: 'Was soll Herr Chen tun?',
    options: ['Am Mittwoch um halb drei kommen.', 'Bis Dienstag einen neuen Termin bestätigen.', 'Erst am Donnerstag anrufen.'],
    answer: 1, explanation: 'Die Praxis bittet um einen Rückruf bis Dienstag.'
  }
);

practiceBank.writing.push(
  {
    id: 'w5', title: 'Verspätung mitteilen', level: 'mittel', goethePart: 'Schreiben Teil 1', minWords: 25,
    prompt: 'Sie treffen Ihre Freundin Lea, aber Ihr Bus hat Verspätung. Schreiben Sie eine kurze Nachricht.',
    bullets: ['Entschuldigen Sie sich.', 'Sagen Sie, warum Sie später kommen.', 'Schlagen Sie eine neue Uhrzeit vor.'],
    targetWords: ['leider', 'Bus', 'später', 'Uhr'], modelStart: 'Hallo Lea, es tut mir leid, aber …'
  },
  {
    id: 'w6', title: 'Informationen zur Unterkunft', level: 'prüfungsnah', goethePart: 'Schreiben Teil 2', minWords: 45,
    prompt: 'Sie möchten im September ein Wochenende in einer Pension verbringen. Schreiben Sie an die Pension.',
    bullets: ['Fragen Sie nach einem freien Doppelzimmer.', 'Fragen Sie nach dem Preis mit Frühstück.', 'Erklären Sie, wann Sie ankommen.'],
    targetWords: ['Zimmer', 'September', 'Frühstück', 'ankommen'], modelStart: 'Sehr geehrte Damen und Herren, ich möchte …'
  },
  {
    id: 'w7', title: 'Bei der Arbeit tauschen', level: 'prüfungsnah', goethePart: 'Schreiben Teil 2', minWords: 45,
    prompt: 'Sie können am Samstag nicht arbeiten. Schreiben Sie Ihrem Kollegen Daniel und bitten Sie um einen Tausch.',
    bullets: ['Nennen Sie den Grund.', 'Schlagen Sie einen anderen Arbeitstag vor.', 'Bitten Sie um eine schnelle Antwort.'],
    targetWords: ['Samstag', 'weil', 'tauschen', 'antworten'], modelStart: 'Hallo Daniel, könntest du vielleicht …'
  }
);

practiceBank.speaking.push(
  {
    id: 's5', title: 'Persönliche Fragen stellen', level: 'mittel', goethePart: 'Sprechen Teil 1', seconds: 45,
    prompt: 'Stellen und beantworten Sie Fragen zum Thema Freizeit.',
    bullets: ['Was machen Sie gern?', 'Mit wem?', 'Wie oft?', 'Wo?'],
    targetWords: ['gern', 'mit', 'oft', 'weil']
  },
  {
    id: 's6', title: 'Von einer Reise erzählen', level: 'prüfungsnah', goethePart: 'Sprechen Teil 2', seconds: 90,
    prompt: 'Erzählen Sie von einer Reise, an die Sie sich gut erinnern.',
    bullets: ['Ziel und Reisezeit', 'Verkehrsmittel', 'Aktivitäten', 'Was war besonders?'],
    targetWords: ['war', 'gefahren', 'dann', 'besonders']
  },
  {
    id: 's7', title: 'Eine Feier gemeinsam planen', level: 'prüfungsnah', goethePart: 'Sprechen Teil 3', seconds: 90,
    prompt: 'Sie möchten mit einer anderen Person eine kleine Kursfeier planen. Machen Sie Vorschläge und reagieren Sie.',
    bullets: ['Tag und Uhrzeit', 'Ort', 'Essen und Getränke', 'Wer bringt was mit?'],
    targetWords: ['könnten', 'vielleicht', 'lieber', 'mitbringen']
  }
);

export const initialProgress = {
  skills: {
    ...Object.fromEntries(skills.map(skill => [skill.id, { earned: 0, possible: 0 }])),
    grammar: { earned: 0, possible: 0, byTopic: {}, byQuestion: {} },
    vocabulary: { reviewed: [], mastered: [] }
  },
  completedUnits: [],
  streak: 0,
  totalSessions: 0,
  lastStudyDate: null,
  activity: [],
  achievements: [],
  avatar: initialAvatarState,
  study: {
    mistakes: [],
    bookmarks: [],
    resume: { view: 'dashboard', unitId: 'ankommen', skillId: 'reading' },
    reminder: { enabled: false, time: '18:00', lastNotifiedDate: null }
  }
};
