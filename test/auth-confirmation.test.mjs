import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('confirmation email routes scanners through a user-controlled page', async () => {
  const template = await readFile(new URL('../supabase/templates/confirmation.html', import.meta.url), 'utf8');
  assert.match(template, /\/confirm-signup\?token_hash=\{\{ \.TokenHash \}\}/);
  assert.doesNotMatch(template, /\.ConfirmationURL/);
});

test('confirmation page verifies only after user action', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /onClick=\{confirmEmail\}/);
  assert.match(app, /verifyOtp\(\{ token_hash: tokenHash, type: 'email' \}\)/);
  assert.doesNotMatch(app, /useEffect\(confirmEmail/);
});
