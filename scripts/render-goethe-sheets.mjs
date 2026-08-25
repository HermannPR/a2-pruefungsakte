import fs from 'node:fs';
import path from 'node:path';
import { openPdf, renderPage } from './lib/pdf.mjs';

const sets = [
  { prefix: 'model', pdf: 'data/goethe-listening/sources/A2_Modellsatz_Erwachsene.pdf' },
  { prefix: 'practice', pdf: 'data/goethe-listening/sources/A2_Uebungssatz_Erwachsene.pdf' }
];

const jobs = [];
for (const set of sets) {
  for (let part = 1; part <= 4; part += 1) {
    jobs.push({ ...set, page: 6 + part * 2, output: `public/goethe/reading/${set.prefix}-part-${part}-page-1.png` });
    jobs.push({ ...set, page: 7 + part * 2, output: `public/goethe/reading/${set.prefix}-part-${part}-page-2.png` });
    jobs.push({ ...set, page: 17 + part, output: `public/goethe/listening/${set.prefix}-part-${part}.png` });
  }
  jobs.push({ ...set, page: 24, output: `public/goethe/writing/${set.prefix}-tasks.png` });
  jobs.push({ ...set, page: 26, output: `public/goethe/speaking/${set.prefix}-part-1.png` });
  jobs.push({ ...set, page: 27, output: `public/goethe/speaking/${set.prefix}-part-2.png` });
  jobs.push({ ...set, page: 28, output: `public/goethe/speaking/${set.prefix}-part-3-a.png` });
  jobs.push({ ...set, page: 29, output: `public/goethe/speaking/${set.prefix}-part-3-b.png` });
}

const pdfCache = new Map();
for (const job of jobs) {
  if (!pdfCache.has(job.pdf)) pdfCache.set(job.pdf, await openPdf(job.pdf));
  const pdf = pdfCache.get(job.pdf);
  const canvas = await renderPage(await pdf.getPage(job.page), 2.5);
  fs.mkdirSync(path.dirname(job.output), { recursive: true });
  fs.writeFileSync(job.output, canvas.toBuffer('image/png'));
}

const totalBytes = jobs.reduce((sum, job) => sum + fs.statSync(job.output).size, 0);
console.log(`Rendered ${jobs.length} Goethe worksheets at 2.5× (${(totalBytes / 1024 / 1024).toFixed(1)} MB).`);
