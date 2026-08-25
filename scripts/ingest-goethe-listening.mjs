import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { openPdf, extractNativePage } from './lib/pdf.mjs';

const workspace = process.cwd();
const outputDirectory = path.join(workspace, 'data', 'goethe-listening');

const tests = [
  {
    id: 'goethe-a2-modellsatz',
    title: 'Goethe-Zertifikat A2 Modellsatz Erwachsene',
    pdf: 'data/goethe-listening/sources/A2_Modellsatz_Erwachsene.pdf',
    audio: 'pruefungstraining_1_hoeren_a2_erwachsene-v2.mp4',
    audioUrl: 'https://goethemp4s.akamaized.net/resources/files/mp434/pruefungstraining_1_hoeren_a2_erwachsene.mp4',
    answers: ['b', 'b', 'c', 'b', 'a', 'b', 'g', 'h', 'd', 'e', 'c', 'a', 'b', 'b', 'b', 'nein', 'ja', 'ja', 'nein', 'nein'],
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Modellsatz_Erwachsene.pdf'
  },
  {
    id: 'goethe-a2-uebungssatz-01',
    title: 'Goethe-Zertifikat A2 Uebungssatz 01 Erwachsene',
    pdf: 'data/goethe-listening/sources/A2_Uebungssatz_Erwachsene.pdf',
    audio: 'pruefungstraining_2_hoeren_a2_erwachsene-v7.mp3',
    audioUrl: 'https://goethemp4s.akamaized.net/resources/files/mp38/pruefungstraining_2_hoeren_a2_erwachsene.mp3',
    answers: ['b', 'c', 'b', 'c', 'a', 'e', 'g', 'h', 'i', 'a', 'b', 'c', 'b', 'a', 'b', 'ja', 'nein', 'ja', 'ja', 'nein'],
    sourceUrl: 'https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Uebungssatz_Erwachsene.pdf'
  }
];

const pageGroups = {
  instructions: [17],
  questions: [18, 19, 20, 21],
  solutions: [34],
  transcripts: [35, 36, 37, 38]
};

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function probeAudio(filePath) {
  const result = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration,size,bit_rate,format_name:stream=codec_name,sample_rate,channels',
    '-of', 'json',
    filePath
  ], { encoding: 'utf8' });
  return JSON.parse(result);
}

async function extractPages(pdf, numbers) {
  return Promise.all(numbers.map(async pageNumber => ({
    pageNumber,
    text: await extractNativePage(await pdf.getPage(pageNumber))
  })));
}

fs.mkdirSync(outputDirectory, { recursive: true });
const manifest = [];

for (const test of tests) {
  const pdfPath = path.join(workspace, test.pdf);
  const audioPath = path.join(workspace, test.audio);
  const pdf = await openPdf(pdfPath);
  const sections = {};

  for (const [name, pageNumbers] of Object.entries(pageGroups)) {
    sections[name] = await extractPages(pdf, pageNumbers);
  }

  const audioProbe = probeAudio(audioPath);
  const audioFormat = audioProbe.format;
  const audioStream = audioProbe.streams[0];
  const source = {
    id: test.id,
    title: test.title,
    provider: 'Goethe-Institut',
    level: 'A2',
    audience: 'adults',
    itemCount: 20,
    partCount: 4,
    parts: [
      { number: 1, itemStart: 1, itemEnd: 5, plays: 2, format: 'multiple-choice' },
      { number: 2, itemStart: 6, itemEnd: 10, plays: 1, format: 'matching' },
      { number: 3, itemStart: 11, itemEnd: 15, plays: 1, format: 'multiple-choice' },
      { number: 4, itemStart: 16, itemEnd: 20, plays: 2, format: 'yes-no' }
    ],
    audio: {
      file: test.audio,
      sourceUrl: test.audioUrl,
      sha256: sha256(audioPath),
      durationSeconds: Number(audioFormat.duration),
      bytes: Number(audioFormat.size),
      bitrate: Number(audioFormat.bit_rate),
      format: audioFormat.format_name,
      codec: audioStream.codec_name,
      sampleRate: Number(audioStream.sample_rate),
      channels: audioStream.channels
    },
    answerKey: Object.fromEntries(test.answers.map((answer, index) => [index + 1, answer])),
    pdf: {
      file: test.pdf,
      sha256: sha256(pdfPath),
      pages: pdf.numPages,
      sourceUrl: test.sourceUrl
    },
    sections
  };

  fs.writeFileSync(
    path.join(outputDirectory, `${test.id}-source.json`),
    `${JSON.stringify(source, null, 2)}\n`,
    'utf8'
  );
  manifest.push({
    id: source.id,
    title: source.title,
    itemCount: source.itemCount,
    partCount: source.partCount,
    durationSeconds: source.audio.durationSeconds,
    sourceFile: `data/goethe-listening/${test.id}-source.json`
  });
}

fs.writeFileSync(
  path.join(outputDirectory, 'manifest.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), totalTests: manifest.length, totalParts: 8, totalItems: 40, tests: manifest }, null, 2)}\n`,
  'utf8'
);

console.log(JSON.stringify({ totalTests: manifest.length, totalParts: 8, totalItems: 40, tests: manifest }, null, 2));
