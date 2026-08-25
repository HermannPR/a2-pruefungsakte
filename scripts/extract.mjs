import fs from 'node:fs';
import path from 'node:path';
import { createWorker, OEM, PSM } from 'tesseract.js';
import languageData from '@tesseract.js-data/deu';
import { findBooks, selectBooks } from './lib/books.mjs';
import { parsePageSelection, readArguments } from './lib/cli.mjs';
import { extractNativePage, openPdf, renderPage } from './lib/pdf.mjs';
import { cleanExtractedText, estimateTextQuality } from './lib/text.mjs';

const argumentsMap = readArguments(process.argv.slice(2));
const rootDirectory = process.cwd();
const manifestPath = path.join(rootDirectory, 'data', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  throw new Error('Missing data/manifest.json. Run npm run inventory first.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestById = new Map(manifest.books.map(book => [book.id, book]));
const books = selectBooks(findBooks(rootDirectory), argumentsMap.get('book'));
const force = argumentsMap.has('force');
const requestedMode = argumentsMap.get('mode') ?? 'auto';
const scale = Number(argumentsMap.get('scale') ?? 2);
let ocrWorker;
let lastOcrProgress = -1;

async function getOcrWorker() {
  if (ocrWorker) return ocrWorker;
  ocrWorker = await createWorker(languageData.code, OEM.LSTM_ONLY, {
    langPath: languageData.langPath,
    gzip: languageData.gzip,
    logger: message => {
      if (message.status === 'recognizing text' && Number.isFinite(message.progress)) {
        const progress = Math.floor(message.progress * 10) * 10;
        if (progress !== lastOcrProgress) {
          lastOcrProgress = progress;
          process.stdout.write(`\rOCR ${progress}%   `);
        }
      }
    }
  });
  await ocrWorker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    preserve_interword_spaces: '1'
  });
  return ocrWorker;
}

try {
  for (const book of books) {
    const manifestBook = manifestById.get(book.id);
    if (!manifestBook) throw new Error(`Book ${book.id} is missing from the manifest.`);
    if (manifestBook.status !== 'ready') {
      console.warn(`Skipping ${book.id}: ${manifestBook.status}`);
      continue;
    }
    const document = await openPdf(book.filePath);
    const pages = parsePageSelection(argumentsMap.get('pages'), document.numPages);
    const outputDirectory = path.join(rootDirectory, 'data', 'pages', book.id);
    fs.mkdirSync(outputDirectory, { recursive: true });
    const mode = requestedMode === 'auto' ? manifestBook.extractionMode : requestedMode;

    console.log(`\n${book.id}: ${pages.length} page(s), mode=${mode}`);
    for (const pageNumber of pages) {
      const outputPath = path.join(outputDirectory, `${String(pageNumber).padStart(4, '0')}.json`);
      if (!force && fs.existsSync(outputPath)) {
        console.log(`page ${pageNumber}/${document.numPages}: cached`);
        continue;
      }

      const startedAt = Date.now();
      const page = await document.getPage(pageNumber);
      let text;
      let confidence = null;
      let nativeText = null;
      let actualMode = mode;
      let extractionWarning = null;
      if (mode === 'ocr' || mode === 'hybrid') {
        if (mode === 'hybrid') nativeText = cleanExtractedText(await extractNativePage(page));
        try {
          const image = (await renderPage(page, scale)).toBuffer('image/png');
          const worker = await getOcrWorker();
          lastOcrProgress = -1;
          const result = await worker.recognize(image);
          text = result.data.text;
          confidence = result.data.confidence;
          process.stdout.write('\r');
        } catch (error) {
          if (mode !== 'hybrid' || !nativeText) throw error;
          text = nativeText;
          actualMode = 'native-fallback';
          extractionWarning = error.message;
          console.warn(`page ${pageNumber}: OCR render failed, using native text`);
        }
      } else {
        text = await extractNativePage(page);
      }

      text = cleanExtractedText(text);
      const record = {
        schemaVersion: 1,
        bookId: book.id,
        bookKind: book.kind,
        sourceFile: book.fileName,
        pdfPage: pageNumber,
        extractionMode: actualMode,
        extractionWarning,
        ocrConfidence: confidence,
        textQuality: estimateTextQuality(text),
        characterCount: text.length,
        nativeText,
        text
      };
      fs.writeFileSync(outputPath, `${JSON.stringify(record, null, 2)}\n`);
      page.cleanup();
      console.log(`page ${pageNumber}/${document.numPages}: ${text.length} chars, ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
    }
    await document.cleanup();
  }
} finally {
  if (ocrWorker) await ocrWorker.terminate();
}
