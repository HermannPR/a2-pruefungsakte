import fs from 'node:fs';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { detectPrintedPage, detectSection, extractSkills, extractTopics, splitExercises } from './lib/structure.mjs';

const rootDirectory = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'data', 'manifest.json'), 'utf8'));
const indexDirectory = path.join(rootDirectory, 'data', 'index');
fs.mkdirSync(indexDirectory, { recursive: true });

const pages = [];
const exercises = [];
for (const book of manifest.books.filter(item => item.status === 'ready')) {
  const pageDirectory = path.join(rootDirectory, 'data', 'pages', book.id);
  if (!fs.existsSync(pageDirectory)) continue;
  let currentSection = null;
  const files = fs.readdirSync(pageDirectory).filter(file => file.endsWith('.json')).sort();

  for (const file of files) {
    const source = JSON.parse(fs.readFileSync(path.join(pageDirectory, file), 'utf8'));
    currentSection = detectSection(source.text) ?? currentSection;
    const page = {
      ...source,
      id: `${source.bookId}:p${source.pdfPage}`,
      type: 'page',
      printedPage: detectPrintedPage(source.text),
      section: currentSection,
      topics: extractTopics(source.text),
      skills: extractSkills(source.text)
    };
    pages.push(page);
    exercises.push(...splitExercises(page, currentSection));
  }
}

const searchableRecords = [...pages, ...exercises];
const search = new MiniSearch({
  fields: ['text', 'instruction', 'topicsText', 'skillsText'],
  storeFields: ['type', 'bookId', 'pdfPage', 'printedPage', 'exerciseLabel', 'instruction', 'topics', 'skills'],
  searchOptions: { prefix: true, fuzzy: 0.2, boost: { instruction: 3, topicsText: 2.5, skillsText: 2 } }
});
search.addAll(searchableRecords.map(record => ({
  ...record,
  topicsText: record.topics.join(' '),
  skillsText: record.skills.join(' ')
})));

fs.writeFileSync(path.join(indexDirectory, 'pages.jsonl'), pages.map(record => JSON.stringify(record)).join('\n') + (pages.length ? '\n' : ''));
fs.writeFileSync(path.join(indexDirectory, 'exercises.jsonl'), exercises.map(record => JSON.stringify(record)).join('\n') + (exercises.length ? '\n' : ''));
fs.writeFileSync(path.join(indexDirectory, 'search-index.json'), JSON.stringify(search));
fs.writeFileSync(path.join(indexDirectory, 'summary.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  pages: pages.length,
  exercises: exercises.length,
  books: [...new Set(pages.map(page => page.bookId))]
}, null, 2)}\n`);

console.log(`Indexed ${pages.length} pages and ${exercises.length} exercise blocks.`);
