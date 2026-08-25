import test from 'node:test';
import assert from 'node:assert/strict';
import { selectGermanVoice } from '../src/lib/germanSpeech.js';

test('selects an installed German voice instead of the default English voice', () => {
  const voices = [
    { name: 'English Default', lang: 'en-US', default: true, localService: true },
    { name: 'German Generic', lang: 'de-AT', default: false, localService: true },
    { name: 'Microsoft Katja Online', lang: 'de-DE', default: false, localService: false }
  ];
  assert.equal(selectGermanVoice(voices).name, 'Microsoft Katja Online');
});

test('returns null when the device has no German voice', () => {
  assert.equal(selectGermanVoice([{ name: 'English', lang: 'en-GB' }]), null);
});
