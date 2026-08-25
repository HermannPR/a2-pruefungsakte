import { additionalTopicWords } from './vocabularyExpansion.js';

export const vocabularyTopics = [
  { id: 'sprache-wohnen', short: 'SW', title: 'Sprache & Wohnen', description: 'Sprachen lernen, Herkunft und Wohnformen' },
  { id: 'bildung-arbeit', short: 'BA', title: 'Bildung & Arbeit', description: 'Studium, Meinung und Berufsleben' },
  { id: 'medien', short: 'ME', title: 'Medien & Geräte', description: 'Digitale Geräte und typische Handlungen' },
  { id: 'film-kultur', short: 'FK', title: 'Film & Kultur', description: 'Filme beschreiben und bewerten' },
  { id: 'ereignisse', short: 'ER', title: 'Ereignisse & Feste', description: 'Feiern, Glückwünsche und wichtige Tage' },
  { id: 'gefuehle', short: 'GE', title: 'Gefühle & Reaktionen', description: 'Emotionen ausdrücken und reagieren' },
  { id: 'reisen-verkehr', short: 'RV', title: 'Reisen & Verkehr', description: 'Unterwegs sein und Probleme lösen' },
  { id: 'gesundheit-alltag', short: 'GA', title: 'Gesundheit & Alltag', description: 'Termine, Beschwerden und Hilfe' }
];

const topicWords = {
  'sprache-wohnen': [
    ['die Muttersprache', '-n', 'Die Sprache, die man als Kind zuerst lernt.', 'Deutsch ist nicht meine Muttersprache.'],
    ['fließend', '', 'Eine Sprache sicher und ohne viele Pausen sprechen.', 'Sie spricht schon fließend Deutsch.'],
    ['zuhören', 'hat zugehört', 'Aufmerksam hören, was jemand sagt.', 'Bitte hör mir kurz zu.'],
    ['begründen', 'hat begründet', 'Erklären, warum etwas so ist.', 'Begründen Sie Ihre Meinung.'],
    ['mieten', 'hat gemietet', 'Für eine Wohnung regelmäßig Geld bezahlen.', 'Wir haben eine kleine Wohnung gemietet.'],
    ['renovieren', 'hat renoviert', 'Eine Wohnung oder ein Haus wieder schön machen.', 'Sie renovieren gerade die Küche.'],
    ['auf dem Land', '', 'Außerhalb einer großen Stadt.', 'Meine Großeltern wohnen auf dem Land.'],
    ['die Angst', 'Ängste', 'Ein starkes Gefühl, wenn man sich vor etwas fürchtet.', 'Er hat Angst vor der Prüfung.']
  ],
  'bildung-arbeit': [
    ['die Vorlesung', '-en', 'Eine Unterrichtsstunde an einer Universität.', 'Die Vorlesung beginnt um zehn Uhr.'],
    ['die Meinung', '-en', 'Was jemand über ein Thema denkt.', 'Wie ist deine Meinung dazu?'],
    ['zustimmen', 'hat zugestimmt', 'Sagen, dass man dieselbe Meinung hat.', 'Ich stimme dir völlig zu.'],
    ['ablehnen', 'hat abgelehnt', 'Sagen, dass man etwas nicht möchte oder akzeptiert.', 'Sie hat das Angebot abgelehnt.'],
    ['freiwillig', '', 'Aus eigenem Wunsch und ohne Pflicht.', 'Er hilft freiwillig im Sportverein.'],
    ['unabhängig', '', 'Nicht von einer anderen Person abhängig.', 'Sie möchte finanziell unabhängig sein.'],
    ['die Bewerbung', '-en', 'Unterlagen, mit denen man eine Arbeitsstelle sucht.', 'Ich schicke heute meine Bewerbung ab.'],
    ['die Erfahrung', '-en', 'Wissen, das man durch praktische Tätigkeiten bekommt.', 'Haben Sie Erfahrung im Verkauf?']
  ],
  medien: [
    ['der Bildschirm', '-e', 'Der Teil eines Geräts, auf dem man Bilder und Text sieht.', 'Der Bildschirm ist zu dunkel.'],
    ['die Tastatur', '-en', 'Damit schreibt man am Computer.', 'Auf der Tastatur fehlt eine Taste.'],
    ['der Lautsprecher', '-', 'Ein Gerät, aus dem Ton oder Musik kommt.', 'Der Lautsprecher ist sehr leise.'],
    ['herunterladen', 'hat heruntergeladen', 'Eine Datei aus dem Internet auf ein Gerät holen.', 'Ich habe die App heruntergeladen.'],
    ['hochladen', 'hat hochgeladen', 'Eine Datei vom Gerät ins Internet stellen.', 'Lade bitte das Foto hoch.'],
    ['weiterleiten', 'hat weitergeleitet', 'Eine Nachricht an eine andere Person schicken.', 'Kannst du mir die E-Mail weiterleiten?'],
    ['der Beitrag', 'Beiträge', 'Ein Text, Bild oder Video in einem Medium.', 'Sie schreibt einen kurzen Blogbeitrag.'],
    ['privat', '', 'Nur für eine Person oder eine kleine Gruppe bestimmt.', 'Diese Nachricht ist privat.']
  ],
  'film-kultur': [
    ['die Handlung', '-en', 'Die Geschichte, die in einem Film passiert.', 'Die Handlung war spannend.'],
    ['die Hauptperson', '-en', 'Die wichtigste Person in einer Geschichte.', 'Die Hauptperson arbeitet als Ärztin.'],
    ['die Komödie', '-n', 'Ein lustiger Film, bei dem man lachen kann.', 'Wir sehen heute eine Komödie.'],
    ['der Krimi', '-s', 'Eine Geschichte über ein Verbrechen und seine Lösung.', 'Mein Vater liest gern Krimis.'],
    ['der Trailer', '-', 'Ein kurzer Werbefilm für einen neuen Film.', 'Der Trailer macht neugierig.'],
    ['der Witz', '-e', 'Eine kurze Geschichte, die lustig sein soll.', 'Er erzählt einen guten Witz.'],
    ['flüstern', 'hat geflüstert', 'Sehr leise sprechen.', 'Im Kino flüstern die beiden miteinander.'],
    ['gewinnen', 'hat gewonnen', 'Bei einem Spiel oder Wettbewerb Erster sein.', 'Unser Team hat das Spiel gewonnen.']
  ],
  ereignisse: [
    ['die Geburt', '-en', 'Der Moment, in dem ein Kind auf die Welt kommt.', 'Zur Geburt wünschen wir alles Gute.'],
    ['die Führerscheinprüfung', '-en', 'Die Prüfung, die man für den Führerschein macht.', 'Sie hat morgen ihre Führerscheinprüfung.'],
    ['bestehen', 'hat bestanden', 'Bei einer Prüfung erfolgreich sein.', 'Er hat die Deutschprüfung bestanden.'],
    ['gratulieren', 'hat gratuliert', 'Jemandem zu einem schönen Ereignis Glück wünschen.', 'Wir gratulieren dir herzlich.'],
    ['sich bedanken', 'hat sich bedankt', 'Einer Person für etwas Danke sagen.', 'Ich bedanke mich für das Geschenk.'],
    ['die Absage', '-n', 'Eine Nachricht, dass etwas nicht stattfindet oder jemand nicht kommt.', 'Leider habe ich eine Absage bekommen.'],
    ['das Brautpaar', '-e', 'Die zwei Menschen, die heiraten.', 'Das Brautpaar tanzt zuerst.'],
    ['das Feuerwerk', '-e', 'Bunte Lichter am Himmel bei einem Fest.', 'Um Mitternacht beginnt das Feuerwerk.']
  ],
  gefuehle: [
    ['aufgeregt', '', 'Nervös und gespannt vor einem wichtigen Ereignis.', 'Vor der Prüfung bin ich sehr aufgeregt.'],
    ['genervt', '', 'Unzufrieden, weil etwas immer wieder stört.', 'Sie ist vom Lärm genervt.'],
    ['stolz', '', 'Sehr zufrieden mit einer eigenen oder fremden Leistung.', 'Seine Eltern sind stolz auf ihn.'],
    ['traurig', '', 'Unglücklich und ohne Freude.', 'Sie ist wegen der Absage traurig.'],
    ['sich ärgern', 'hat sich geärgert', 'Wütend oder unzufrieden über etwas sein.', 'Ich ärgere mich über die Verspätung.'],
    ['sich wohlfühlen', 'hat sich wohlgefühlt', 'Sich an einem Ort oder in einer Situation gut fühlen.', 'Wir fühlen uns hier sehr wohl.'],
    ['sich streiten', 'hat sich gestritten', 'Wütend verschiedene Meinungen sagen.', 'Die Geschwister streiten sich oft.'],
    ['beruhigen', 'hat beruhigt', 'Dafür sorgen, dass jemand wieder ruhig wird.', 'Die Ärztin beruhigt den Patienten.']
  ],
  'reisen-verkehr': [
    ['die Unterkunft', 'Unterkünfte', 'Ein Ort, an dem man auf einer Reise schläft.', 'Unsere Unterkunft liegt am Bahnhof.'],
    ['die Verspätung', '-en', 'Wenn Bus oder Zug später als geplant kommt.', 'Der Zug hat zwanzig Minuten Verspätung.'],
    ['umsteigen', 'ist umgestiegen', 'Ein Verkehrsmittel verlassen und ein anderes nehmen.', 'In Köln müssen wir umsteigen.'],
    ['die Fahrkarte', '-n', 'Ein Ticket für Bus, Bahn oder Zug.', 'Wo kann ich eine Fahrkarte kaufen?'],
    ['das Gepäck', '', 'Koffer und Taschen auf einer Reise.', 'Das Gepäck ist schon im Auto.'],
    ['die Abfahrt', '-en', 'Der Zeitpunkt, an dem Bus oder Zug losfährt.', 'Die Abfahrt ist um 8:35 Uhr.'],
    ['der Verkehr', '', 'Alle Fahrzeuge, die auf Straßen unterwegs sind.', 'Morgens gibt es viel Verkehr.'],
    ['die Währung', '-en', 'Das Geld, mit dem man in einem Land bezahlt.', 'Welche Währung hat dieses Land?']
  ],
  'gesundheit-alltag': [
    ['die Untersuchung', '-en', 'Wenn eine Ärztin oder ein Arzt den Körper kontrolliert.', 'Die Untersuchung dauert zehn Minuten.'],
    ['das Rezept', '-e', 'Ein Dokument vom Arzt für ein Medikament.', 'Mit dem Rezept gehe ich zur Apotheke.'],
    ['die Erkältung', '-en', 'Eine leichte Krankheit mit Husten oder Schnupfen.', 'Wegen meiner Erkältung bleibe ich zu Hause.'],
    ['sich ausruhen', 'hat sich ausgeruht', 'Pause machen, damit der Körper wieder Kraft bekommt.', 'Du solltest dich heute ausruhen.'],
    ['die Apotheke', '-n', 'Ein Geschäft, in dem man Medikamente bekommt.', 'Die Apotheke schließt um acht.'],
    ['die Beschwerden', 'Plural', 'Gesundheitliche Probleme oder Schmerzen.', 'Welche Beschwerden haben Sie?'],
    ['vereinbaren', 'hat vereinbart', 'Gemeinsam einen Termin oder Plan festlegen.', 'Ich möchte einen Termin vereinbaren.'],
    ['absagen', 'hat abgesagt', 'Sagen, dass man zu einem Termin nicht kommen kann.', 'Sie muss den Termin absagen.']
  ]
};

export const vocabularyBank = vocabularyTopics.flatMap(topic =>
  [...topicWords[topic.id], ...additionalTopicWords[topic.id]].map(([word, detail, definition, example], index) => ({
    id: `${topic.short.toLowerCase()}${index + 1}`,
    topic: topic.id,
    word,
    detail,
    definition,
    example
  }))
);
