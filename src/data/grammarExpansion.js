export const grammarExpansion = [
  {
    id: 'g49', topic: 'cases', prompt: 'Ich danke ___ Ärztin für ihre Hilfe.', options: ['die', 'der', 'den'], answer: 1,
    explanation: 'Das Verb „danken“ verlangt den Dativ: der Ärztin.',
    teaching: { concept: 'Dativverb danken', correctReason: '„danken“ verbindet die Person immer im Dativ: Ich danke der Ärztin.', wrongReasons: ['„die“ ist Nominativ oder Akkusativ feminin, aber „danken“ verlangt Dativ.', '', '„den“ passt nicht zu einem femininen Nomen im Singular.'] }
  },
  {
    id: 'g50', topic: 'cases', prompt: 'Wegen ___ starken Regens bleibt das Schwimmbad geschlossen.', options: ['des', 'dem', 'den'], answer: 0,
    explanation: 'Nach „wegen“ steht in der Standardsprache der Genitiv: wegen des Regens.',
    teaching: { concept: 'Genitiv nach wegen', correctReason: '„wegen“ verlangt hier Genitiv; „Regen“ ist maskulin: wegen des starken Regens.', wrongReasons: ['', '„dem“ ist Dativ und entspricht nicht der hier erwarteten Standardsprache.', '„den“ wäre Akkusativ Singular oder Dativ Plural und passt nicht.'] }
  },
  {
    id: 'g51', topic: 'cases', prompt: 'Die Chefin gibt ___ neuen Mitarbeiter den Schlüssel.', options: ['dem', 'den', 'der'], answer: 0,
    explanation: 'Die empfangende Person steht bei „geben“ im Dativ: dem Mitarbeiter.',
    teaching: { concept: 'Dativ- und Akkusativobjekt', correctReason: 'Wer etwas bekommt, steht im Dativ: Die Chefin gibt dem Mitarbeiter den Schlüssel.', wrongReasons: ['', '„den Mitarbeiter“ wäre Akkusativ, doch Akkusativ ist bereits „den Schlüssel“.', '„der“ passt weder zum maskulinen Dativ noch zum Satzbau.'] }
  },
  {
    id: 'g52', topic: 'cases', prompt: 'Ohne ___ gültigen Ausweis können Sie das Paket nicht abholen.', options: ['einen', 'einem', 'ein'], answer: 0,
    explanation: '„ohne“ verlangt Akkusativ: ohne einen gültigen Ausweis.',
    teaching: { concept: 'Akkusativ nach ohne', correctReason: 'Nach „ohne“ steht immer Akkusativ; maskulin heißt es „einen Ausweis“.', wrongReasons: ['', '„einem“ ist Dativ und kann nach „ohne“ nicht stehen.', '„ein“ wäre Nominativ; außerdem braucht das Adjektiv dann eine andere Endung.'] }
  },
  {
    id: 'g53', topic: 'cases', prompt: 'Das Fahrrad ___ Kindes steht vor der Schule.', options: ['des', 'dem', 'den'], answer: 0,
    explanation: 'Der Besitzer steht im Genitiv: das Fahrrad des Kindes.',
    teaching: { concept: 'Besitz im Genitiv', correctReason: 'Der Genitiv zeigt hier den Besitzer; neutral Singular lautet der Artikel „des“.', wrongReasons: ['', '„dem Kind“ ist Dativ und drückt in dieser Form keinen Besitz aus.', '„den“ passt nicht zum neutralen Nomen „Kind“ im Singular.'] }
  },
  {
    id: 'g54', topic: 'cases', prompt: 'Wir suchen eine Wohnung mit ___ großen Balkon.', options: ['einem', 'einen', 'einer'], answer: 0,
    explanation: '„mit“ verlangt Dativ; maskulin lautet die Form „einem großen Balkon“.',
    teaching: { concept: 'Dativ nach mit', correctReason: 'Die Präposition „mit“ verlangt Dativ: mit einem großen Balkon.', wrongReasons: ['', '„einen“ ist maskuliner Akkusativ und kann nach „mit“ nicht stehen.', '„einer“ ist Dativ feminin, „Balkon“ ist jedoch maskulin.'] }
  },
  {
    id: 'g55', topic: 'verbs', prompt: 'Bevor wir losgefahren sind, ___ ich noch schnell getankt.', options: ['habe', 'bin', 'hatte'], answer: 0,
    explanation: '„tanken“ bildet das Perfekt mit „haben“: ich habe getankt.',
    teaching: { concept: 'Perfekt mit haben', correctReason: '„tanken“ bezeichnet keine Ortsveränderung und bildet das Perfekt mit „haben“.', wrongReasons: ['', '„sein“ ist hier das falsche Hilfsverb, obwohl danach eine Reise beginnt.', '„hatte getankt“ wäre Plusquamperfekt und wird durch den Satz nicht verlangt.'] }
  },
  {
    id: 'g56', topic: 'verbs', prompt: 'Als Jugendliche ___ meine Mutter jeden Morgen früh aufstehen.', options: ['musste', 'mussten', 'müsste'], answer: 0,
    explanation: 'Vergangene Pflicht mit „meine Mutter“: sie musste aufstehen.',
    teaching: { concept: 'Modalverb im Präteritum', correctReason: 'Das feminine Singularsubjekt verlangt im Präteritum „musste“.', wrongReasons: ['', '„mussten“ gehört zu einem Subjekt im Plural oder zu „wir“.', '„müsste“ ist Konjunktiv II und bezeichnet keine reale vergangene Pflicht.'] }
  },
  {
    id: 'g57', topic: 'verbs', prompt: 'Warum ___ ihr gestern nicht zur Besprechung gekommen?', options: ['seid', 'habt', 'wart'], answer: 0,
    explanation: 'Das Bewegungsverb „kommen“ bildet das Perfekt mit „sein“: ihr seid gekommen.',
    teaching: { concept: 'Perfekt mit sein', correctReason: '„kommen“ bildet das Perfekt mit „sein“; zu „ihr“ gehört „seid“.', wrongReasons: ['', '„habt gekommen“ ist falsch, weil „kommen“ hier nicht mit „haben“ steht.', '„wart gekommen“ verbindet Präteritum mit Partizip und bildet kein korrektes Perfekt.'] }
  },
  {
    id: 'g58', topic: 'verbs', prompt: 'Der Hausmeister hat die Tür um sieben Uhr ___.', options: ['aufgeschlossen', 'aufschließen', 'schloss auf'], answer: 0,
    explanation: 'Nach „hat“ steht das Partizip II des trennbaren Verbs: aufgeschlossen.',
    teaching: { concept: 'Partizip trennbarer Verben', correctReason: 'Das Perfekt lautet „hat aufgeschlossen“; „ge“ steht zwischen Vorsilbe und Stamm.', wrongReasons: ['', 'Der Infinitiv „aufschließen“ kann nach dem Hilfsverb „hat“ nicht allein stehen.', '„schloss auf“ ist Präteritum und darf nicht zusätzlich mit „hat“ kombiniert werden.'] }
  },
  {
    id: 'g59', topic: 'verbs', prompt: 'Vor zwei Jahren ___ wir noch in Dresden.', options: ['wohnten', 'wohnen', 'gewohnt'], answer: 0,
    explanation: 'Die abgeschlossene Zeitangabe verlangt hier Präteritum: wir wohnten.',
    teaching: { concept: 'Präteritum regelmäßiger Verben', correctReason: '„vor zwei Jahren“ markiert Vergangenheit; die korrekte finite Form ist „wohnten“.', wrongReasons: ['', '„wohnen“ ist Präsens oder Infinitiv und passt nicht zur vergangenen Zeit.', '„gewohnt“ ist ein Partizip und benötigt ein zusätzliches Hilfsverb.'] }
  },
  {
    id: 'g60', topic: 'verbs', prompt: 'Nächste Woche ___ ich wahrscheinlich länger arbeiten müssen.', options: ['werde', 'würde', 'bin'], answer: 0,
    explanation: 'Eine Erwartung für die Zukunft kann mit „werden + Infinitiv“ stehen.',
    teaching: { concept: 'Futur mit werden', correctReason: '„werde … arbeiten müssen“ bezeichnet eine wahrscheinliche zukünftige Pflicht.', wrongReasons: ['', '„würde“ formuliert eine Bedingung oder höfliche Vorstellung, nicht diese Erwartung.', '„bin arbeiten müssen“ ist keine mögliche deutsche Verbkonstruktion.'] }
  },
  {
    id: 'g61', topic: 'wordOrder', prompt: 'Ich weiß nicht, ob ich morgen länger ___.', options: ['arbeiten muss', 'muss arbeiten', 'arbeiten gemusst'], answer: 0,
    explanation: 'Im Nebensatz steht das Modalverb nach dem Infinitiv am Ende.',
    teaching: { concept: 'Modalverb im Nebensatz', correctReason: 'Im ob-Satz bildet „arbeiten muss“ gemeinsam das Satzende.', wrongReasons: ['', '„muss arbeiten“ ist die Reihenfolge eines Hauptsatzes, nicht eines Nebensatzes.', '„arbeiten gemusst“ braucht für das Perfekt zusätzlich ein Hilfsverb.'] }
  },
  {
    id: 'g62', topic: 'wordOrder', prompt: 'Nach der Arbeit ___ ich direkt zum Sprachkurs.', options: ['fahre', 'ich fahre', 'direkt fahre'], answer: 0,
    explanation: 'Nach dem ersten Satzglied steht das konjugierte Verb auf Position 2.',
    teaching: { concept: 'Inversion im Hauptsatz', correctReason: '„Nach der Arbeit“ besetzt Position 1; deshalb folgt sofort das Verb „fahre“.', wrongReasons: ['', 'Mit „ich fahre“ stünde das Verb erst auf Position 3.', '„direkt fahre“ stellt ein Adverb vor das Verb und verletzt dadurch die Verbzweitstellung.'] }
  },
  {
    id: 'g63', topic: 'wordOrder', prompt: 'Können Sie mir sagen, wo ich das Formular ___?', options: ['abgeben kann', 'kann abgeben', 'abgeben können'], answer: 0,
    explanation: 'In der indirekten Frage steht „abgeben kann“ am Satzende.',
    teaching: { concept: 'Indirekte Frage mit Modalverb', correctReason: 'Der Infinitiv „abgeben“ steht vor dem finiten Modalverb „kann“ am Nebensatzende.', wrongReasons: ['', '„kann abgeben“ entspricht der Reihenfolge einer direkten Frage.', '„können“ stimmt nicht mit dem Singularsubjekt „ich“ überein.'] }
  },
  {
    id: 'g64', topic: 'wordOrder', prompt: 'Zuerst füllt Frau Kaya das Formular aus, danach ___ sie es ab.', options: ['gibt', 'sie gibt', 'abgibt'], answer: 0,
    explanation: 'Nach „danach“ folgt im Hauptsatz das Verb; „ab“ steht am Ende.',
    teaching: { concept: 'Trennbares Verb nach Adverb', correctReason: '„danach“ steht auf Position 1, „gibt“ auf Position 2 und „ab“ am Ende.', wrongReasons: ['', 'Mit „sie gibt“ würde das konjugierte Verb erst nach dem Subjekt stehen.', '„abgibt“ bleibt nur im Nebensatz ungetrennt und steht dort am Ende.'] }
  },
  {
    id: 'g65', topic: 'wordOrder', prompt: 'Welche Reihenfolge ist korrekt?', options: ['Ich habe gestern meiner Schwester das Buch gegeben.', 'Ich gestern habe das Buch meiner Schwester gegeben.', 'Gestern ich habe meiner Schwester das Buch gegeben.'], answer: 0,
    explanation: 'Im Hauptsatz steht die finite Verbform an Position 2 und das Partizip am Ende.',
    teaching: { concept: 'Satzklammer im Perfekt', correctReason: '„habe“ steht korrekt auf Position 2; „gegeben“ schließt die Satzklammer.', wrongReasons: ['', 'Hier steht „habe“ erst nach zwei Satzgliedern und damit zu spät.', 'Nach „Gestern“ müsste direkt „habe“ folgen, nicht das Subjekt.'] }
  },
  {
    id: 'g66', topic: 'wordOrder', prompt: 'Obwohl der Weg weit ist, ___ wir zu Fuß.', options: ['gehen', 'wir gehen', 'zu Fuß gehen'], answer: 0,
    explanation: 'Nach einem vorangestellten Nebensatz beginnt der Hauptsatz mit dem Verb.',
    teaching: { concept: 'Nebensatz vor Hauptsatz', correctReason: 'Der ganze obwohl-Satz besetzt Position 1; im Hauptsatz folgt deshalb „gehen“ vor „wir“.', wrongReasons: ['', '„wir gehen“ würde das Verb im Hauptsatz auf Position 3 verschieben.', 'Diese Folge enthält nach dem Komma kein korrekt platziertes finites Verb.'] }
  },
  {
    id: 'g67', topic: 'connectors', prompt: '___ der Zug pünktlich war, kam Amir zu spät.', options: ['Obwohl', 'Weil', 'Damit'], answer: 0,
    explanation: '„obwohl“ drückt einen unerwarteten Gegensatz aus.',
    teaching: { concept: 'Gegensatz mit obwohl', correctReason: 'Pünktlicher Zug und verspätete Ankunft stehen im Gegensatz; dazu passt „obwohl“.', wrongReasons: ['', '„weil“ würde den pünktlichen Zug unlogisch als Grund für die Verspätung nennen.', '„damit“ nennt ein Ziel und passt nicht zur Beziehung dieser Aussagen.'] }
  },
  {
    id: 'g68', topic: 'connectors', prompt: 'Der Aufzug ist kaputt. ___ müssen wir die Treppe nehmen.', options: ['Deshalb', 'Trotzdem', 'Während'], answer: 0,
    explanation: 'Der kaputte Aufzug ist die Ursache; die Treppe ist die Folge.',
    teaching: { concept: 'Folge mit deshalb', correctReason: '„deshalb“ verbindet den Grund im ersten Satz mit seiner logischen Folge.', wrongReasons: ['', '„trotzdem“ würde eine Handlung entgegen einer Erwartung ausdrücken.', '„während“ verlangt einen Nebensatz und beschreibt Gleichzeitigkeit oder Gegensatz.'] }
  },
  {
    id: 'g69', topic: 'connectors', prompt: 'Ich spreche langsam, ___ mich alle verstehen können.', options: ['damit', 'dass', 'obwohl'], answer: 0,
    explanation: '„damit“ nennt das Ziel: Alle sollen mich verstehen.',
    teaching: { concept: 'Zweck mit damit', correctReason: 'Das langsame Sprechen hat das Ziel, dass alle verstehen; deshalb steht „damit“.', wrongReasons: ['', '„dass“ nennt einen Inhalt, aber nicht den Zweck einer Handlung.', '„obwohl“ drückt einen Gegensatz aus, der hier nicht vorhanden ist.'] }
  },
  {
    id: 'g70', topic: 'connectors', prompt: 'Ruf mich bitte an, ___ du am Bahnhof ankommst.', options: ['wenn', 'weil', 'deshalb'], answer: 0,
    explanation: '„wenn“ bezeichnet den zukünftigen Zeitpunkt der Ankunft.',
    teaching: { concept: 'Zeitpunkt mit wenn', correctReason: 'Bei einem zukünftigen oder wiederholten Zeitpunkt verwendet man „wenn“.', wrongReasons: ['', '„weil“ würde die Ankunft als Grund für den Anruf erklären, nicht dessen Zeitpunkt.', '„deshalb“ leitet keinen Nebensatz mit dem Verb am Ende ein.'] }
  },
  {
    id: 'g71', topic: 'connectors', prompt: 'Mira fährt nicht mit dem Bus, ___ mit dem Fahrrad.', options: ['sondern', 'aber', 'oder'], answer: 0,
    explanation: 'Nach einer Verneinung korrigiert „sondern“ die erste Aussage.',
    teaching: { concept: 'Korrektur mit sondern', correctReason: '„nicht … sondern“ ersetzt die verneinte Möglichkeit durch die richtige.', wrongReasons: ['', '„aber“ zeigt einen Gegensatz, korrigiert jedoch nicht so direkt nach „nicht“.', '„oder“ bietet eine offene Alternative statt die tatsächliche Wahl zu nennen.'] }
  },
  {
    id: 'g72', topic: 'connectors', prompt: '___ ich gegessen hatte, ging ich noch eine Runde spazieren.', options: ['Nachdem', 'Bevor', 'Während'], answer: 0,
    explanation: 'Erst wurde gegessen, danach begann der Spaziergang.',
    teaching: { concept: 'Zeitfolge mit nachdem', correctReason: '„nachdem“ zeigt, dass das Essen vor dem Spaziergang abgeschlossen war.', wrongReasons: ['', '„bevor“ würde bedeuten, dass der Spaziergang vor dem Essen stattfand.', '„während“ beschreibt Gleichzeitigkeit, aber die Handlungen passieren nacheinander.'] }
  },
  {
    id: 'g73', topic: 'prepositions', prompt: 'Die Apotheke liegt direkt ___ dem Rathaus.', options: ['gegenüber', 'entlang', 'zwischen'], answer: 0,
    explanation: '„gegenüber“ steht hier mit Dativ: gegenüber dem Rathaus.',
    teaching: { concept: 'Lokale Präposition gegenüber', correctReason: 'Für die Position auf der anderen Straßenseite passt „gegenüber“ plus Dativ.', wrongReasons: ['', '„entlang dem Rathaus“ bezeichnet keinen gegenüberliegenden Ort.', '„zwischen“ braucht zwei Bezugspunkte, nicht nur das Rathaus.'] }
  },
  {
    id: 'g74', topic: 'prepositions', prompt: 'Der Brief liegt ___ den beiden Büchern.', options: ['zwischen', 'durch', 'gegen'], answer: 0,
    explanation: 'Ein Ort in der Mitte von zwei Dingen wird mit „zwischen“ beschrieben.',
    teaching: { concept: 'Zwischen mit Dativ', correctReason: '„liegt“ beschreibt einen festen Ort; „zwischen den Büchern“ steht im Dativ.', wrongReasons: ['', '„durch“ bezeichnet eine Bewegung durch einen Raum und verlangt Akkusativ.', '„gegen“ bedeutet Kontakt oder Richtung, aber nicht die Position in der Mitte.'] }
  },
  {
    id: 'g75', topic: 'prepositions', prompt: 'Bitte stellen Sie die Kartons ___ Keller.', options: ['in den', 'im', 'aus dem'], answer: 0,
    explanation: '„stellen“ beschreibt eine Bewegung wohin: in den Keller.',
    teaching: { concept: 'Richtung mit Akkusativ', correctReason: 'Das Ziel der Bewegung verlangt bei „in“ Akkusativ: in den Keller.', wrongReasons: ['', '„im Keller“ beschreibt einen festen Ort, nicht das Ziel des Stellens.', '„aus dem Keller“ bezeichnet die entgegengesetzte Richtung nach draußen.'] }
  },
  {
    id: 'g76', topic: 'prepositions', prompt: 'Ich arbeite erst ___ drei Monaten in dieser Firma.', options: ['seit', 'vor', 'ab'], answer: 0,
    explanation: 'Der Zeitraum begann früher und dauert bis heute: seit drei Monaten.',
    teaching: { concept: 'Dauer mit seit', correctReason: '„seit“ verbindet einen Beginn in der Vergangenheit mit einem noch aktuellen Zustand.', wrongReasons: ['', '„vor drei Monaten“ nennt nur einen vergangenen Zeitpunkt, keine andauernde Dauer.', '„ab“ bezeichnet einen Startpunkt in Gegenwart oder Zukunft.'] }
  },
  {
    id: 'g77', topic: 'prepositions', prompt: 'Nach dem Kurs gehe ich noch kurz ___ Bäcker.', options: ['zum', 'beim', 'vom'], answer: 0,
    explanation: 'Eine Bewegung zu einer Person oder einem Geschäft steht mit „zu“: zum Bäcker.',
    teaching: { concept: 'Richtung mit zu', correctReason: '„gehen“ beschreibt hier das Ziel; „zu dem“ wird zu „zum“ zusammengezogen.', wrongReasons: ['', '„beim Bäcker“ beschreibt den Aufenthaltsort und beantwortet „wo?“.', '„vom Bäcker“ bezeichnet die Bewegung weg vom Geschäft.'] }
  },
  {
    id: 'g78', topic: 'prepositions', prompt: 'Die Sprechstunde ist heute ___ 14 bis 16 Uhr.', options: ['von', 'seit', 'gegen'], answer: 0,
    explanation: 'Ein begrenzter Zeitraum wird mit „von … bis“ angegeben.',
    teaching: { concept: 'Zeitraum von bis', correctReason: 'Die feste Verbindung „von 14 bis 16 Uhr“ nennt Anfang und Ende.', wrongReasons: ['', '„seit“ beschreibt eine Dauer bis heute und kann nicht mit „bis 16 Uhr“ kombiniert werden.', '„gegen“ nennt eine ungefähre einzelne Uhrzeit, keinen Zeitraum.'] }
  },
  {
    id: 'g79', topic: 'adjectives', prompt: 'Ich nehme den ___ Pullover dort links.', options: ['blauen', 'blaue', 'blauem'], answer: 0,
    explanation: 'Nach „den“ im maskulinen Akkusativ endet das Adjektiv auf „-en“.',
    teaching: { concept: 'Adjektiv nach bestimmtem Artikel', correctReason: '„den Pullover“ ist maskuliner Akkusativ; die Adjektivendung lautet „-en“.', wrongReasons: ['', '„blaue“ passt hier nicht nach dem bestimmten Artikel im maskulinen Akkusativ.', '„blauem“ ist eine Dativendung und widerspricht dem Artikel „den“.'] }
  },
  {
    id: 'g80', topic: 'adjectives', prompt: 'Sie wohnt in einer ___ Straße.', options: ['ruhigen', 'ruhige', 'ruhiger'], answer: 0,
    explanation: 'Nach „einer“ im Dativ feminin steht die Endung „-en“.',
    teaching: { concept: 'Adjektiv im Dativ', correctReason: '„in einer Straße“ beschreibt einen Ort im Dativ; deshalb heißt es „ruhigen“.', wrongReasons: ['', '„ruhige“ wäre eine Form für Nominativ oder Akkusativ feminin.', '„ruhiger“ passt nicht nach „einer“ im Dativ feminin.'] }
  },
  {
    id: 'g81', topic: 'adjectives', prompt: 'Im Regal stehen mehrere ___ Gläser.', options: ['saubere', 'sauberen', 'sauberes'], answer: 0,
    explanation: 'Ohne Artikel im Nominativ Plural trägt das Adjektiv die Endung „-e“.',
    teaching: { concept: 'Adjektiv ohne Artikel', correctReason: '„mehrere Gläser“ ist Nominativ Plural; die passende Form lautet „saubere“.', wrongReasons: ['', '„sauberen“ wäre unter anderem nach einem bestimmten Artikel oder im Dativ möglich.', '„sauberes“ gehört zum neutralen Singular, nicht zum Plural.'] }
  },
  {
    id: 'g82', topic: 'adjectives', prompt: 'Der neue Weg ist viel ___ als der alte.', options: ['kürzer', 'kurz', 'am kürzesten'], answer: 0,
    explanation: '„als“ und „viel“ verlangen hier den Komparativ „kürzer“.',
    teaching: { concept: 'Verstärkter Komparativ', correctReason: 'Zwei Wege werden verglichen; „viel kürzer als“ ist die korrekte Vergleichsform.', wrongReasons: ['', 'Die Grundform „kurz“ kann nicht mit „als“ diesen Unterschied ausdrücken.', '„am kürzesten“ ist Superlativ und wird nicht für einen Vergleich von zwei Dingen verwendet.'] }
  },
  {
    id: 'g83', topic: 'adjectives', prompt: 'Welcher Zug fährt ___ ab?', options: ['am frühesten', 'früher', 'früheste'], answer: 0,
    explanation: 'Ohne nachfolgendes Nomen steht der Superlativ mit „am“: am frühesten.',
    teaching: { concept: 'Adverbialer Superlativ', correctReason: 'Gesucht ist der früheste von mehreren Zügen; beim Verb steht „am frühesten“.', wrongReasons: ['', '„früher“ ist Komparativ und vergleicht nur mit einem anderen Zeitpunkt.', '„früheste“ müsste als Adjektiv direkt vor einem Nomen stehen.'] }
  },
  {
    id: 'g84', topic: 'adjectives', prompt: 'Wir brauchen für die Feier frisches Brot und ___ Getränke.', options: ['kalte', 'kalten', 'kaltes'], answer: 0,
    explanation: 'Ohne Artikel steht im Akkusativ Plural die starke Endung „-e“.',
    teaching: { concept: 'Starke Adjektivendung Plural', correctReason: '„Getränke“ steht ohne Artikel im Akkusativ Plural; korrekt ist „kalte Getränke“.', wrongReasons: ['', '„kalten“ würde hier einen Artikel oder eine andere Kasusumgebung erwarten.', '„kaltes“ ist neutraler Singular und passt nicht zum Plural „Getränke“.'] }
  },
  {
    id: 'g85', topic: 'pronouns', prompt: 'Kannst du Frau Aydin den Termin erklären? – Ja, ich erkläre ___ ihn.', options: ['ihr', 'sie', 'ihnen'], answer: 0,
    explanation: 'Die Person steht bei „erklären“ im Dativ: Ich erkläre ihr den Termin.',
    teaching: { concept: 'Personalpronomen im Dativ', correctReason: 'Frau Aydin ist die empfangende Person; ihr Pronomen im Dativ lautet „ihr“.', wrongReasons: ['', '„sie“ ist Nominativ oder Akkusativ und passt nicht zur empfangenden Person.', '„ihnen“ ist Dativ Plural oder Höflichkeitsform, nicht feminin Singular.'] }
  },
  {
    id: 'g86', topic: 'pronouns', prompt: 'Der Drucker funktioniert nicht. Kannst du ___ bitte reparieren?', options: ['ihn', 'ihm', 'er'], answer: 0,
    explanation: '„reparieren“ verlangt Akkusativ; „der Drucker“ wird zu „ihn“.',
    teaching: { concept: 'Akkusativpronomen', correctReason: 'Der Drucker ist das direkte Objekt von „reparieren“; maskulin Akkusativ heißt „ihn“.', wrongReasons: ['', '„ihm“ ist Dativ, doch „reparieren“ nimmt hier ein Akkusativobjekt.', '„er“ ist Nominativ und kann nicht an dieser Objektstelle stehen.'] }
  },
  {
    id: 'g87', topic: 'pronouns', prompt: 'Wir haben unsere Schlüssel, aber Lena findet ___ nicht.', options: ['ihre', 'ihren', 'ihr'], answer: 0,
    explanation: 'Das Possessivpronomen ersetzt „ihre Schlüssel“ im Akkusativ Plural.',
    teaching: { concept: 'Possessivpronomen im Plural', correctReason: '„ihre“ ersetzt hier vollständig das plurale Akkusativobjekt „ihre Schlüssel“.', wrongReasons: ['', '„ihren“ passt zu maskulinem Akkusativ Singular oder Dativ Plural mit anderer Form.', '„ihr“ kann das plurale Nomen an dieser Stelle nicht korrekt ersetzen.'] }
  },
  {
    id: 'g88', topic: 'pronouns', prompt: 'Ich ziehe ___ vor dem Sport schnell die Schuhe an.', options: ['mir', 'mich', 'mein'], answer: 0,
    explanation: 'Bei einem Körperteil oder Kleidungsstück steht das Reflexivpronomen oft im Dativ.',
    teaching: { concept: 'Reflexivpronomen im Dativ', correctReason: '„die Schuhe“ ist bereits Akkusativobjekt; die betroffene Person steht daher als „mir“ im Dativ.', wrongReasons: ['', '„mich“ wäre Akkusativ, aber diese Funktion übernimmt bereits „die Schuhe“.', '„mein“ ist ein Possessivartikel und kein Reflexivpronomen.'] }
  },
  {
    id: 'g89', topic: 'pronouns', prompt: 'Diese Jacke ist zu klein. Ich nehme lieber ___.', options: ['die dort', 'der dort', 'den dort'], answer: 0,
    explanation: 'Das Demonstrativpronomen bezieht sich auf die feminine „Jacke“ im Akkusativ.',
    teaching: { concept: 'Demonstrativpronomen', correctReason: '„nehmen“ verlangt Akkusativ; feminin Singular bleibt das Pronomen „die“.', wrongReasons: ['', '„der“ wäre hier Dativ feminin oder Nominativ maskulin.', '„den“ ist maskuliner Akkusativ und passt nicht zu „Jacke“.'] }
  },
  {
    id: 'g90', topic: 'pronouns', prompt: 'Paul und ich organisieren das Fest. Könnt ihr ___ helfen?', options: ['uns', 'euch', 'ihnen'], answer: 0,
    explanation: '„Paul und ich“ entspricht „wir“; der Dativ von „wir“ ist „uns“.',
    teaching: { concept: 'Dativpronomen wir', correctReason: '„helfen“ verlangt Dativ, und „Paul und ich“ wird durch „uns“ ersetzt.', wrongReasons: ['', '„euch“ bezieht sich auf die angesprochenen Personen, nicht auf Paul und mich.', '„ihnen“ würde über andere Personen sprechen, statt „wir“ zu ersetzen.'] }
  },
  {
    id: 'g91', topic: 'questions', prompt: 'Könnten Sie mir sagen, ___ dieser Bus zum Flughafen fährt?', options: ['ob', 'wann', 'wohin'], answer: 0,
    explanation: 'Eine indirekte Ja-/Nein-Frage beginnt mit „ob“.',
    teaching: { concept: 'Indirekte Ja-Nein-Frage', correctReason: 'Die erwartete Antwort lautet ja oder nein; deshalb leitet „ob“ die Frage ein.', wrongReasons: ['', '„wann“ würde gezielt nach der Abfahrtszeit fragen, nicht nach der Verbindung selbst.', '„wohin“ fragt nach einem Ziel, das mit „zum Flughafen“ bereits genannt ist.'] }
  },
  {
    id: 'g92', topic: 'questions', prompt: '___ Termin passt Ihnen besser: Montag oder Mittwoch?', options: ['Welcher', 'Welchen', 'Welchem'], answer: 0,
    explanation: '„Termin“ ist das Subjekt der Frage und steht im Nominativ maskulin.',
    teaching: { concept: 'Frageartikel welcher', correctReason: 'Der Termin ist das grammatische Subjekt; maskuliner Nominativ lautet „welcher“.', wrongReasons: ['', '„welchen“ ist maskuliner Akkusativ, doch hier gibt es kein Akkusativobjekt.', '„welchem“ ist Dativ und wird von keinem Verb oder keiner Präposition verlangt.'] }
  },
  {
    id: 'g93', topic: 'questions', prompt: '___ einem Kurs suchen Sie genau?', options: ['Nach was für', 'Was für', 'Mit welchem'], answer: 0,
    explanation: 'Das Verb „suchen nach“ verlangt „nach“ plus Dativ: nach was für einem Kurs.',
    teaching: { concept: 'Frage mit was für ein', correctReason: '„nach etwas suchen“ ist eine feste Verbindung; nach „nach“ steht Dativ.', wrongReasons: ['', '„Was für einem Kurs“ fehlt die vom Verb verlangte Präposition „nach“.', '„mit welchem“ fragt nach einem begleitenden Kurs, nicht nach dem gesuchten Typ.'] }
  },
  {
    id: 'g94', topic: 'questions', prompt: 'Wie frage ich höflich nach einer Wiederholung?', options: ['Könnten Sie das bitte noch einmal sagen?', 'Sagen Sie das wieder.', 'Was haben Sie gesagt?'], answer: 0,
    explanation: 'Konjunktiv II, „bitte“ und Infinitiv formulieren eine höfliche Bitte.',
    teaching: { concept: 'Höflich um Wiederholung bitten', correctReason: '„Könnten Sie … bitte …?“ ist eine vollständige und respektvolle Bitte.', wrongReasons: ['', 'Der Imperativ wirkt wie eine Anweisung und ist in dieser Situation zu direkt.', 'Die Frage ist möglich, klingt aber deutlich direkter und weniger höflich.'] }
  },
  {
    id: 'g95', topic: 'questions', prompt: '___ soll ich das unterschriebene Formular schicken?', options: ['Wohin', 'Wo', 'Woher'], answer: 0,
    explanation: '„schicken“ beschreibt eine Richtung zu einem Ziel; danach fragt „wohin“.',
    teaching: { concept: 'Wo, wohin oder woher', correctReason: 'Gesucht ist das Ziel der Sendung, daher lautet das passende Fragewort „wohin“.', wrongReasons: ['', '„wo“ fragt nach einem festen Ort, nicht nach dem Ziel einer Bewegung.', '„woher“ fragt nach dem Ausgangspunkt oder der Herkunft.'] }
  },
  {
    id: 'g96', topic: 'questions', prompt: 'Wissen Sie, ___ die Anmeldung endet?', options: ['wann', 'wie lange', 'wie oft'], answer: 0,
    explanation: 'Nach dem konkreten Endzeitpunkt fragt man mit „wann“.',
    teaching: { concept: 'Indirekte W-Frage', correctReason: '„wann“ fragt nach dem Zeitpunkt, an dem die Anmeldung endet.', wrongReasons: ['', '„wie lange“ fragt nach einer Dauer und würde eine andere Satzform oder Antwort erwarten.', '„wie oft“ fragt nach einer Häufigkeit, nicht nach einem Anmeldeschluss.'] }
  }
];

export function normalizeGrammarExpansion(item, index) {
  const answer = index % item.options.length;
  const rotate = values => values.map((_, targetIndex) => values[(targetIndex - answer + item.answer + values.length) % values.length]);
  return {
    ...item,
    options: rotate(item.options),
    answer,
    teaching: { ...item.teaching, wrongReasons: rotate(item.teaching.wrongReasons) }
  };
}
