const TOPIC_PATTERNS = [
  ['Akkusativ', /\bAkkusativ\b/i],
  ['Dativ', /\bDativ\b/i],
  ['Genitiv', /\bGenitiv\b/i],
  ['Imperativ', /\bImperativ\b/i],
  ['Perfekt', /\bPerfekt\b/i],
  ['Präteritum', /\bPr[äa]teritum\b/i],
  ['Modalverben', /\bModalverben?\b/i],
  ['Trennbare Verben', /\btrennbare[nr]? Verben?\b/i],
  ['Wechselpräpositionen', /\bWechselpr[äa]positionen?\b/i],
  ['Präpositionen', /Pr[äa]positionen?\b/i],
  ['Possessivartikel', /\bPossessivartikel\b/i],
  ['Personalpronomen', /\bPersonalpronomen\b/i],
  ['Reflexive Verben', /\breflexive[nr]? Verben?\b/i],
  ['Nebensätze', /\bNebens[äa]tze?\b/i],
  ['Relativsätze', /\bRelativs[äa]tze?\b/i],
  ['Konjunktiv II', /\bKonjunktiv\s*II\b/i],
  ['Komparativ und Superlativ', /\b(?:Komparativ|Superlativ)\b/i],
  ['Wortschatz', /\bWortschatz\b/i]
];

const SKILL_PATTERNS = [
  ['Hören', /\bH[öo]ren\b/i],
  ['Lesen', /\bLesen\b/i],
  ['Schreiben', /\bSchreiben\b/i],
  ['Sprechen', /\bSprechen\b/i],
  ['Grammatik', /\bGrammatik\b/i],
  ['Wortschatz', /\bWortschatz\b/i]
];

export function extractLabels(text, patterns) {
  return patterns.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

export function extractTopics(text) {
  return extractLabels(text, TOPIC_PATTERNS);
}

export function extractSkills(text) {
  return extractLabels(text, SKILL_PATTERNS);
}

export function detectSection(text) {
  for (const line of text.split('\n').slice(0, 30)) {
    const match = line.match(/^(Kapitel|Lektion)\s*(\d{1,2})\b\s*[:–-]?\s*(.*)$/i);
    if (match) {
      return {
        type: match[1].toLowerCase(),
        number: Number(match[2]),
        title: match[3].trim() || null
      };
    }
  }
  return null;
}

export function detectPrintedPage(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const edgeLines = [...lines.slice(0, 5), ...lines.slice(-5)];
  const candidates = edgeLines
    .map(line => line.match(/^(?:[A-Za-zÄÖÜäöüß]+\s+)?(\d{1,3})(?:\s+[A-Za-zÄÖÜäöüß]+)?$/)?.[1])
    .filter(Boolean)
    .map(Number);
  return candidates.at(-1) ?? null;
}

export function splitExercises(pageRecord, section = null) {
  const lines = pageRecord.text.split('\n').map(line => line.trim()).filter(Boolean);
  const starts = [];
  const exercisePattern = /^(?:Übung\s+)?(\d{1,3})(?:\s*([a-z]))?[.)]?\s+(.{4,})$/i;
  const directiveLanguage = /\b(?:Schreiben|Ergänzen|Ordnen|Hören|Lesen|Sprechen|Markieren|Ankreuzen|Kreuzen|Verbinden|Wählen|Einsetzen|Setzen|Bilden|Formulieren|Vergleichen|Arbeiten|Ansehen|Sehen|Erzählen|Notieren|Unterstreichen|Beschreiben|Sammeln|Zuordnen|Korrigieren|Spielen|Suchen|Passen)\b/;
  const questionLanguage = /^(?:Was|Wie|Wo|Wer|Wann|Warum|Welch|Richtig oder falsch)\b/i;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(exercisePattern);
    if (!match) continue;
    if (Number(match[1]) > 30) continue;
    if (/^\d+[.:,-]/.test(match[3])) continue;
    if (!directiveLanguage.test(match[3]) && !questionLanguage.test(match[3])) continue;
    starts.push({ index, number: Number(match[1]), part: match[2]?.toLowerCase() ?? null, instruction: match[3].trim() });
  }

  return starts.map((start, index) => {
    const end = starts[index + 1]?.index ?? lines.length;
    const text = lines.slice(start.index, end).join('\n');
    const label = `${start.number}${start.part ?? ''}`;
    return {
      id: `${pageRecord.bookId}:p${pageRecord.pdfPage}:e${label}:${index + 1}`,
      type: 'exercise',
      bookId: pageRecord.bookId,
      bookKind: pageRecord.bookKind,
      pdfPage: pageRecord.pdfPage,
      printedPage: detectPrintedPage(pageRecord.text),
      section,
      exerciseNumber: start.number,
      exercisePart: start.part,
      exerciseLabel: label,
      instruction: start.instruction,
      topics: extractTopics(text),
      skills: extractSkills(text),
      ocrConfidence: pageRecord.ocrConfidence,
      text
    };
  });
}
