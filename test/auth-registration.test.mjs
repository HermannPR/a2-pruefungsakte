import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('registration requires matching password confirmation', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /mode === 'signup' && password !== passwordConfirmation/);
  assert.match(app, /value=\{passwordConfirmation\}/);
  assert.match(app, /required minLength=\{12\}/);
  assert.match(app, /autoComplete="new-password"/);
});

test('transactional auth emails have a persistent per-address cooldown', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /emailCooldownMilliseconds = 120000/);
  assert.match(app, /a2-email-cooldown:/);
  assert.match(app, /blockDuringEmailCooldown\(\)/);
  assert.match(app, /auth\.resendCountdown/);
  assert.match(app, /auth\.resetCountdown/);
});

test('Google OAuth is available behind a deployment flag', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /VITE_GOOGLE_AUTH_ENABLED/);
  assert.match(app, /signInWithOAuth\(\{ provider: 'google'/);
  assert.match(app, /redirectTo: window\.location\.origin/);
  assert.match(app, /google-auth-button/);
});
