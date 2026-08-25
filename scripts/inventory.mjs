import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { findBooks } from './lib/books.mjs';
import { extractNativePage, openPdf } from './lib/pdf.mjs';
import { estimateTextQuality } from './lib/text.mjs';

const outputDirectory = path.join(process.cwd(), 'data');
fs.mkdirSync(outputDirectory, { recursive: true });

const manifest = { generatedAt: new Date().toISOString(), books: [] };

for (const book of findBooks()) {
  const fileBuffer = fs.readFileSync(book.filePath);
  let replacementSequences = 0;
  for (let index = 0; index < fileBuffer.length - 2; index += 1) {
    if (fileBuffer[index] === 0xef && fileBuffer[index + 1] === 0xbf && fileBuffer[index + 2] === 0xbd) {
      replacementSequences += 1;
      index += 2;
    }
  }
  const corruptedByteRatio = replacementSequences * 3 / fileBuffer.length;
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const status = corruptedByteRatio > 0.01 ? 'unusable-corrupt-source' : 'ready';

  if (status !== 'ready') {
    const source = fileBuffer.toString('latin1');
    const pageCount = (source.match(/\/Type\s*\/Page\b/g) ?? []).length;
    const item = {
      ...book,
      filePath: path.relative(process.cwd(), book.filePath),
      bytes: fileBuffer.length,
      sha256: hash,
      pageCount,
      status,
      corruptedByteRatio,
      extractionMode: 'unavailable',
      samples: []
    };
    manifest.books.push(item);
    console.log(`${item.id}: ${item.pageCount} pages, ${status}, unavailable`);
    continue;
  }

  const document = await openPdf(book.filePath);
  const samplePages = [...new Set([1, Math.ceil(document.numPages / 2), document.numPages])];
  const samples = [];

  for (const pageNumber of samplePages) {
    const page = await document.getPage(pageNumber);
    const text = await extractNativePage(page);
    samples.push({
      pageNumber,
      nativeCharacters: text.length,
      textQuality: estimateTextQuality(text),
      replacementCharacters: (text.match(/�/g) ?? []).length
    });
    page.cleanup();
  }

  const nativeCharacters = samples.reduce((sum, sample) => sum + sample.nativeCharacters, 0);
  const replacementCharacters = samples.reduce((sum, sample) => sum + sample.replacementCharacters, 0);
  const extractionMode = book.kind === 'coursebook'
    ? 'hybrid'
    : nativeCharacters < 300
      ? 'ocr'
      : replacementCharacters > 0
        ? 'hybrid'
        : 'native';
  const item = {
    ...book,
    filePath: path.relative(process.cwd(), book.filePath),
    bytes: fs.statSync(book.filePath).size,
    sha256: hash,
    pageCount: document.numPages,
    status,
    corruptedByteRatio,
    extractionMode,
    samples
  };
  manifest.books.push(item);
  console.log(`${item.id}: ${item.pageCount} pages, ${status}, ${extractionMode}`);
  await document.cleanup();
}

fs.writeFileSync(path.join(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
