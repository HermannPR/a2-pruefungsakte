export function cleanExtractedText(value) {
  return String(value ?? '')
    .replace(/\u00ad/g, '')
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.replace(/[\t ]+/g, ' ').trim())
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function estimateTextQuality(text) {
  if (!text) return 0;
  const letters = (text.match(/[A-Za-zÄÖÜäöüß]/g) ?? []).length;
  const replacementCharacters = (text.match(/[�]/g) ?? []).length;
  const controlCharacters = (text.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g) ?? []).length;
  return Math.max(0, Math.min(1, (letters / Math.max(text.length, 1)) - ((replacementCharacters + controlCharacters) / Math.max(text.length, 1))));
}
