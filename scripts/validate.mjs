import fs from 'node:fs';
import path from 'node:path';

const rootDirectory = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(rootDirectory, 'data', 'manifest.json'), 'utf8'));
const report = { generatedAt: new Date().toISOString(), valid: true, books: [] };

for (const book of manifest.books) {
  const pageDirectory = path.join(rootDirectory, 'data', 'pages', book.id);
  const records = fs.existsSync(pageDirectory)
    ? fs.readdirSync(pageDirectory).filter(file => file.endsWith('.json')).map(file => JSON.parse(fs.readFileSync(path.join(pageDirectory, file), 'utf8')))
    : [];
  const emptyPages = records.filter(record => record.characterCount === 0).map(record => record.pdfPage);
  const lowConfidencePages = records
    .filter(record => record.ocrConfidence !== null && record.ocrConfidence < 60)
    .map(record => ({ page: record.pdfPage, confidence: record.ocrConfidence }));
  const complete = book.status === 'ready' ? records.length === book.pageCount : null;
  if (complete === false || emptyPages.length > Math.max(3, Math.ceil(book.pageCount * 0.05))) report.valid = false;
  report.books.push({
    id: book.id,
    sourceStatus: book.status,
    expectedPages: book.pageCount,
    extractedPages: records.length,
    complete,
    emptyPages,
    lowConfidencePages
  });
}

const indexDirectory = path.join(rootDirectory, 'data', 'index');
fs.mkdirSync(indexDirectory, { recursive: true });
fs.writeFileSync(path.join(indexDirectory, 'validation.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exitCode = 1;
