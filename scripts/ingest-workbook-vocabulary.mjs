import fs from 'node:fs';
import path from 'node:path';
import { createWorker, OEM, PSM } from 'tesseract.js';
import languageData from '@tesseract.js-data/deu';
import { openPdf, renderPage } from './lib/pdf.mjs';

const rootDirectory = process.cwd();
const sourceFile = path.join(rootDirectory, 'pdfcoffee.com_netzwerk-neu-a2-bungsbuch-pdf-free.pdf');
const cacheDirectory = path.join(rootDirectory, 'data', 'vocabulary', 'layout');
const outputDirectory = path.join(rootDirectory, 'data', 'vocabulary');
const appOutputPath = path.join(rootDirectory, 'src', 'data', 'workbookVocabulary.js');

const chapters = [
  { id: 'kapitel-1', number: 1, title: 'Sprache und Wohnen', pages: [12] },
  { id: 'kapitel-2', number: 2, title: 'Ausbildung und Lebenswege', pages: [24] },
  { id: 'kapitel-3', number: 3, title: 'Medien und Film', pages: [35, 36] },
  { id: 'kapitel-4', number: 4, title: 'Ereignisse und Gefühle', pages: [51, 52] },
  { id: 'kapitel-5', number: 5, title: 'Stadt, Behörden und Geld', pages: [63, 64] },
  { id: 'kapitel-6', number: 6, title: 'Arbeitswelten und Bahnreisen', pages: [75, 76] },
  { id: 'kapitel-7', number: 7, title: 'Verkehr und Mobilität', pages: [91, 92] },
  { id: 'kapitel-8', number: 8, title: 'Lernen und Berufsalltag', pages: [103, 104] },
  { id: 'kapitel-9', number: 9, title: 'Sport und Reisen', pages: [117, 118] },
  { id: 'kapitel-10', number: 10, title: 'Wohnen und Tiere', pages: [133, 134] },
  { id: 'kapitel-11', number: 11, title: 'Lebensphasen und Zeit', pages: [145, 146] },
  { id: 'kapitel-12', number: 12, title: 'Unterhaltung und Kultur', pages: [157, 158] }
];

const skippedStarts = [
  'lernwortschatz', 'wichtig für mich', 'andere wichtige', 'ergänzen sie', 'notieren sie',
  'sammeln sie', 'schreiben sie', 'ordnen sie', 'finden sie', 'reagieren sie', 'welche ',
  'was passt', 'was machen', 'rund um das haus', 'sie wollen', 'sie bekommen', 'sie haben',
  'ein wasserglas', 'das sehe ich anders', 'das war bei mir auch so'
];

const headings = new Set([
  'universität', 'medien und geräte', 'aktivitäten mit medien', 'dinge vergleichen',
  'über arbeit sprechen', 'meinung äußern', 'kino und filme', 'besondere ereignisse',
  'glückwünsche ausdrücken', 'gefühle', 'in der stadt', 'im restaurant arbeiten',
  'bei der behörde', 'in der bank', 'bei der polizei', 'eine stadt-tour', 'arbeitswelten',
  'am bahnhof und am schalter', 'das stadtprogramm', 'den beruf wechseln', 'telefonieren',
  'die moderne arbeitswelt', 'verkehr in der stadt', 'verkehrsprobleme', 'rund ums auto',
  'im zug', 'rund ums flugzeug', 'einen weg beschreiben', 'einen service nutzen',
  'von untersuchungen berichten', 'die meinung sagen', 'lernen', 'prüfungen',
  'ratschläge geben', 'berufsalltag', 'anderen helfen', 'sorgen', 'eine präsentation halten',
  'sport machen', 'sportgeräte', 'vereine und fans', 'vorschläge machen',
  'unterwegs in d-a-ch', 'wohnformen', 'maße angeben', 'nachbarn', 'ein fest vorbereiten',
  'zimmer tauschen', 'tiere', 'lebensphasen', 'arbeit', '(frei-)zeit', 'ausflüge organisieren',
  'zeitreise', 'sprichwörter', 'gute unterhaltung!', 'festivalbesuch', 'meldungen', 'malerei'
]);

function cleanLine(value) {
  return value
    .replaceAll('|', '')
    .replace(/[—_=]{2,}/g, ' ')
    .replace(/^[^\p{L}(]+/u, '')
    .replace(/\s+/g, ' ')
    .replace(/\bzulhören\b/gi, 'zuhören')
    .replace(/\bzulstimmen\b/gi, 'zustimmen')
    .replace(/\bweiterlleiten\b/gi, 'weiterleiten')
    .replace(/\bauflräumen\b/gi, 'aufräumen')
    .replace(/\banlbieten\b/gi, 'anbieten')
    .replace(/\bmitlhelfen\b/gi, 'mithelfen')
    .replace(/\bmitlspielen\b/gi, 'mitspielen')
    .replace(/\bausirichten\b/gi, 'ausrichten')
    .replace(/\babifliegen\b/gi, 'abfliegen')
    .replace(/\bvorlstellen\b/gi, 'vorstellen')
    .replace(/\bweglfahren\b/gi, 'wegfahren')
    .replace(/\blangllaufen\b/gi, 'langlaufen')
    .replace(/Führerschein-prüfung/gi, 'Führerscheinprüfung')
    .replace(/mitge-macht/gi, 'mitgemacht')
    .replace(/\s+[A-ZÄÖÜ]$/, '')
    .trim();
}

function groupColumnLines(words, splitX, side) {
  const columnWords = words
    .filter(word => word.confidence >= 45)
    .filter(word => side === 'left' ? word.bbox.x0 < splitX : word.bbox.x0 >= splitX)
    .sort((first, second) => ((first.bbox.y0 + first.bbox.y1) / 2) - ((second.bbox.y0 + second.bbox.y1) / 2));
  const rows = [];
  for (const word of columnWords) {
    const centerY = (word.bbox.y0 + word.bbox.y1) / 2;
    let row = rows.find(candidate => Math.abs(candidate.centerY - centerY) <= 7);
    if (!row) {
      row = { centerY, words: [] };
      rows.push(row);
    }
    row.words.push(word);
    row.centerY = row.words.reduce((sum, item) => sum + ((item.bbox.y0 + item.bbox.y1) / 2), 0) / row.words.length;
  }
  return rows
    .sort((first, second) => first.centerY - second.centerY)
    .map(row => cleanLine(row.words.sort((first, second) => first.bbox.x0 - second.bbox.x0).map(word => word.text).join(' ')))
    .filter(Boolean);
}

function extractWords(blocks) {
  return blocks.flatMap(block => block.paragraphs.flatMap(paragraph => paragraph.lines.flatMap(line => line.words)));
}

function isLikelyEntry(line) {
  const lower = line.toLocaleLowerCase('de');
  if (line.length < 2 || line.length > 105 || !/\p{L}/u.test(line)) return false;
  if (line.includes('_') || (/\)$/.test(line) && !line.includes('('))) return false;
  if (/[.:]$/.test(line) || /\?/.test(line)) return false;
  if (/^\d|^\d+\s*\/\s*\d+|^[a-zäöüß]?\s*\d+\b/i.test(line)) return false;
  if (skippedStarts.some(start => lower.startsWith(start))) return false;
  if (headings.has(lower.replace(/[:.!]$/, ''))) return false;
  if (/^(hat|ist|sind|war|waren|haben|können|werden|er |sie |wir |ihr |jetzt |früher |kommt |nimmt |gibt |fährt |läuft |lädt |trägt |wirft |fliegt |hält |steht |mehr gültig|patienten|ausgeben\)|getränke|popier|hausaufgaben|schultag\)|italienerin|österreicher)/i.test(line)) return false;
  if (/\b(seite|kapitel)\b/i.test(line)) return false;
  if (/\b(notieren|ergänzen|schreiben|sammeln|ordnen|buchstaben|sätze|möglichst|passende wörter|zeitlichen reihenfolge)\b/i.test(line)) return false;
  const words = line.match(/[\p{L}]+/gu) ?? [];
  if (words.length > 7) return false;
  const letterCount = (line.match(/\p{L}/gu) ?? []).length;
  if (letterCount / line.length < 0.55) return false;
  if (/^[A-ZÄÖÜ][\p{L}]+\s+[a-zäöüß]+\s+[a-zäöüß]+\s+[a-zäöüß]+/u.test(line) && !/^(Alles Gute|Das ist|So ein|Du Arme|Du Armer)/.test(line)) return false;
  return true;
}

function splitEntry(line) {
  const exampleMatch = line.match(/\((.+)\)/);
  const withoutExample = cleanLine(line.replace(/\(.*/, ''));
  const commaIndex = withoutExample.indexOf(',');
  const word = cleanLine(commaIndex === -1 ? withoutExample : withoutExample.slice(0, commaIndex));
  const detail = commaIndex === -1 ? '' : cleanLine(withoutExample.slice(commaIndex + 1));
  return { word, detail, example: exampleMatch?.[1]?.trim() ?? '' };
}

function normalizeKey(value) {
  return value.toLocaleLowerCase('de').replace(/[^a-zäöüß0-9]+/g, ' ').trim();
}

async function loadPageLayout(document, worker, pageNumber) {
  const cachePath = path.join(cacheDirectory, `${String(pageNumber).padStart(4, '0')}.json`);
  if (fs.existsSync(cachePath)) return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const page = await document.getPage(pageNumber);
  const canvas = await renderPage(page, 2);
  const result = await worker.recognize(canvas.toBuffer('image/png'), {}, { blocks: true, text: true });
  const words = extractWords(result.data.blocks ?? []);
  const layout = {
    page: pageNumber,
    width: canvas.width,
    confidence: result.data.confidence,
    lines: [
      ...groupColumnLines(words, canvas.width / 2, 'left'),
      ...groupColumnLines(words, canvas.width / 2, 'right')
    ]
  };
  fs.writeFileSync(cachePath, `${JSON.stringify(layout, null, 2)}\n`);
  page.cleanup();
  return layout;
}

if (!fs.existsSync(sourceFile)) throw new Error(`Missing source PDF: ${sourceFile}`);
fs.mkdirSync(cacheDirectory, { recursive: true });
fs.mkdirSync(outputDirectory, { recursive: true });

const document = await openPdf(sourceFile);
const worker = await createWorker(languageData.code, OEM.LSTM_ONLY, {
  langPath: languageData.langPath,
  gzip: languageData.gzip
});
await worker.setParameters({
  tessedit_pageseg_mode: PSM.AUTO,
  preserve_interword_spaces: '1'
});

const entries = [];
const seen = new Set();
try {
  for (const chapter of chapters) {
    for (const pageNumber of chapter.pages) {
      process.stdout.write(`Chapter ${chapter.number}, page ${pageNumber}... `);
      const layout = await loadPageLayout(document, worker, pageNumber);
      let previousEntry = null;
      for (const line of layout.lines) {
        if (previousEntry?.word.endsWith('-') && /^[\p{L}]/u.test(line)) {
          previousEntry.word = `${previousEntry.word}${splitEntry(line).word}`;
          continue;
        }
        if (!isLikelyEntry(line)) continue;
        const parsed = splitEntry(line);
        if (/\.[)]?$/.test(parsed.word) || /^[A-ZÄÖÜ]{1,2}$/.test(parsed.word)) continue;
        const key = normalizeKey(parsed.word);
        if (!key || key.length < 2 || seen.has(`${chapter.id}:${key}`)) continue;
        const entry = {
          id: `${chapter.id}-${entries.length + 1}`,
          chapter: chapter.id,
          word: parsed.word,
          detail: parsed.detail,
          example: parsed.example,
          sourcePage: pageNumber
        };
        entries.push(entry);
        seen.add(`${chapter.id}:${key}`);
        previousEntry = entry;
      }
      console.log(`${layout.lines.length} reconstructed lines`);
    }
  }
} finally {
  await worker.terminate();
  await document.cleanup();
}

const sourceRecord = {
  generatedAt: new Date().toISOString(),
  source: path.basename(sourceFile),
  chapters,
  entryCount: entries.length,
  entries
};
fs.writeFileSync(path.join(outputDirectory, 'workbook-vocabulary.json'), `${JSON.stringify(sourceRecord, null, 2)}\n`);
fs.writeFileSync(
  appOutputPath,
  `// Generated by scripts/ingest-workbook-vocabulary.mjs\nexport const workbookVocabularyTopics = ${JSON.stringify(chapters, null, 2)};\n\nexport const workbookVocabulary = ${JSON.stringify(entries, null, 2)};\n`
);
console.log(`Wrote ${entries.length} workbook vocabulary entries across ${chapters.length} chapters.`);
