import fs from 'node:fs';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { readArguments } from './lib/cli.mjs';

const argumentsMap = readArguments(process.argv.slice(2));
const query = argumentsMap.get('text') ?? process.argv.slice(2).filter(value => !value.startsWith('--')).join(' ');
if (!query) throw new Error('Provide a query, for example: npm run query -- --text "Wechselpräpositionen"');

const limit = Number(argumentsMap.get('limit') ?? 5);
const indexDirectory = path.join(process.cwd(), 'data', 'index');
const search = MiniSearch.loadJSON(fs.readFileSync(path.join(indexDirectory, 'search-index.json'), 'utf8'), {
  fields: ['text', 'instruction', 'topicsText', 'skillsText'],
  storeFields: ['type', 'bookId', 'pdfPage', 'printedPage', 'exerciseLabel', 'instruction', 'topics', 'skills'],
  searchOptions: { prefix: true, fuzzy: 0.2 }
});

const results = search.search(query, {
  prefix: true,
  fuzzy: 0.2,
  boost: { instruction: 3, topicsText: 2.5, skillsText: 2 },
  filter: result => {
    const matchesBook = !argumentsMap.get('book') || result.bookId === argumentsMap.get('book');
    const matchesType = !argumentsMap.get('type') || result.type === argumentsMap.get('type');
    return matchesBook && matchesType;
  }
}).slice(0, limit);

const records = new Map();
for (const fileName of ['pages.jsonl', 'exercises.jsonl']) {
  const filePath = path.join(indexDirectory, fileName);
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean)) {
    const record = JSON.parse(line);
    records.set(record.id, record);
  }
}

function createSnippet(text, terms) {
  const normalized = text.toLocaleLowerCase('de');
  const positions = terms.map(term => normalized.indexOf(term.toLocaleLowerCase('de'))).filter(position => position >= 0);
  const matchPosition = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, matchPosition - 160);
  const end = Math.min(text.length, start + 520);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

const output = results.map(result => {
  const record = records.get(result.id);
  return {
    ...result,
    ...(argumentsMap.has('full') ? { text: record?.text } : { snippet: createSnippet(record?.text ?? '', result.terms) })
  };
});

console.log(JSON.stringify(output, null, 2));
