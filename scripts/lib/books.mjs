import fs from 'node:fs';
import path from 'node:path';

const BOOK_PATTERNS = [
  { id: 'grammatik-aktiv-a1-b1', kind: 'grammar', pattern: /grammatik-aktiv/i },
  { id: 'netzwerk-a2-kursbuch', kind: 'coursebook', pattern: /kursbuch/i },
  { id: 'netzwerk-neu-a2-uebungsbuch', kind: 'workbook', pattern: /bungsbuch/i }
];

export function findBooks(rootDirectory = process.cwd()) {
  return fs.readdirSync(rootDirectory)
    .filter(fileName => fileName.toLowerCase().endsWith('.pdf'))
    .map(fileName => {
      const match = BOOK_PATTERNS.find(candidate => candidate.pattern.test(fileName));
      const fallbackId = path.basename(fileName, path.extname(fileName))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      return {
        id: match?.id ?? fallbackId,
        kind: match?.kind ?? 'reference',
        fileName,
        filePath: path.join(rootDirectory, fileName)
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function selectBooks(books, requestedId) {
  if (!requestedId) return books;
  const selected = books.filter(book => book.id === requestedId);
  if (selected.length === 0) {
    throw new Error(`Unknown book "${requestedId}". Available: ${books.map(book => book.id).join(', ')}`);
  }
  return selected;
}
