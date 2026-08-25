import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const assetsDirectory = path.resolve('dist/assets');
const files = await readdir(assetsDirectory);

async function gzipSize(fileName) {
  return gzipSync(await readFile(path.join(assetsDirectory, fileName))).byteLength;
}

const appJavaScript = files.find(file => file === 'app.js');
const appStyles = files.find(file => file === 'app.css');
const workbookChunk = files.find(file => file.startsWith('workbookVocabulary-') && file.endsWith('.js'));
const reactVendor = files.find(file => file.startsWith('react-vendor-') && file.endsWith('.js'));
const supabaseVendor = files.find(file => file.startsWith('supabase-vendor-') && file.endsWith('.js'));

assert.ok(appJavaScript, 'The production app entry is missing.');
assert.ok(appStyles, 'The production stylesheet is missing.');
assert.ok(workbookChunk, 'Workbook vocabulary must remain a separate lazy chunk.');
assert.ok(reactVendor, 'React must remain a separately cacheable chunk.');
assert.ok(supabaseVendor, 'Supabase must remain a separately cacheable chunk.');

const appGzip = await gzipSize(appJavaScript);
const stylesGzip = await gzipSize(appStyles);
const workbookGzip = await gzipSize(workbookChunk);
const initialJavaScriptGzip = appGzip + await gzipSize(reactVendor) + await gzipSize(supabaseVendor);
const appSource = await readFile(path.join(assetsDirectory, appJavaScript), 'utf8');

assert.ok(initialJavaScriptGzip <= 220 * 1024, `Initial JavaScript exceeds 220 KiB gzip: ${initialJavaScriptGzip} bytes.`);
assert.ok(appGzip <= 110 * 1024, `Frequently changing app code exceeds 110 KiB gzip: ${appGzip} bytes.`);
assert.ok(stylesGzip <= 18 * 1024, `Initial CSS exceeds 18 KiB gzip: ${stylesGzip} bytes.`);
assert.ok(workbookGzip <= 18 * 1024, `Lazy workbook chunk exceeds 18 KiB gzip: ${workbookGzip} bytes.`);
assert.equal(appSource.includes('kapitel-12-1098'), false, 'Workbook data leaked back into the initial bundle.');

console.log(`Performance budget passed: initial JS ${Math.ceil(initialJavaScriptGzip / 1024)} KiB, cacheable app ${Math.ceil(appGzip / 1024)} KiB, CSS ${Math.ceil(stylesGzip / 1024)} KiB, lazy workbook ${Math.ceil(workbookGzip / 1024)} KiB gzip.`);
