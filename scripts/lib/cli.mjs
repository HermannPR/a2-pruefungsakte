export function readArguments(argv) {
  const argumentsMap = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) continue;
    const key = value.slice(2);
    const nextValue = argv[index + 1];
    if (!nextValue || nextValue.startsWith('--')) {
      argumentsMap.set(key, true);
    } else {
      argumentsMap.set(key, nextValue);
      index += 1;
    }
  }
  return argumentsMap;
}

export function parsePageSelection(value, pageCount) {
  if (!value || value === 'all') {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set();
  for (const segment of String(value).split(',')) {
    const range = segment.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!range) throw new Error(`Invalid page selection: ${segment}`);
    const firstPage = Number(range[1]);
    const lastPage = Number(range[2] ?? range[1]);
    for (let page = firstPage; page <= lastPage; page += 1) {
      if (page >= 1 && page <= pageCount) pages.add(page);
    }
  }
  return [...pages].sort((left, right) => left - right);
}
