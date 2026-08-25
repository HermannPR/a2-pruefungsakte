import fs from 'node:fs';
import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';

globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

export async function openPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  return pdfjs.getDocument({ data, disableWorker: true }).promise;
}

export async function extractNativePage(page) {
  const content = await page.getTextContent();
  const lines = [];
  let currentLine = [];
  let previousY;

  for (const item of content.items) {
    if (!('str' in item)) continue;
    const currentY = Math.round(item.transform[5]);
    if (previousY !== undefined && Math.abs(currentY - previousY) > 2 && currentLine.length > 0) {
      lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
      currentLine = [];
    }
    if (item.str.trim()) currentLine.push(item.str.trim());
    if (item.hasEOL && currentLine.length > 0) {
      lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
      currentLine = [];
    }
    previousY = currentY;
  }
  if (currentLine.length > 0) lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
  return lines.filter(Boolean).join('\n');
}

export async function renderPage(page, scale = 2) {
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext('2d');
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}
