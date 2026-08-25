let activeRequest = 0;

function normalizedLanguage(voice) {
  return voice?.lang?.replace('_', '-').toLowerCase() ?? '';
}

export function selectGermanVoice(voices = []) {
  return voices
    .filter(voice => normalizedLanguage(voice).startsWith('de'))
    .sort((left, right) => voiceScore(right) - voiceScore(left))[0] ?? null;
}

function voiceScore(voice) {
  const language = normalizedLanguage(voice);
  const name = voice.name?.toLowerCase() ?? '';
  let score = language === 'de-de' ? 100 : 50;
  if (voice.localService) score += 15;
  if (/katja|hedda|anna|stefan|conrad|google.*deutsch|microsoft.*german/.test(name)) score += 10;
  if (voice.default) score += 1;
  return score;
}

export function cancelGermanSpeech() {
  activeRequest += 1;
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}

export function speakGerman(text, { rate = 0.82, pitch = 1, onend, onerror } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  const synthesis = window.speechSynthesis;
  const request = ++activeRequest;
  synthesis.cancel();

  function play() {
    if (request !== activeRequest) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    const voice = selectGermanVoice(synthesis.getVoices());
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'de-DE';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = onend ?? null;
    utterance.onerror = onerror ?? null;
    synthesis.speak(utterance);
  }

  if (synthesis.getVoices().length) {
    play();
    return true;
  }

  let completed = false;
  const voicesReady = () => {
    if (completed) return;
    completed = true;
    synthesis.removeEventListener?.('voiceschanged', voicesReady);
    play();
  };
  synthesis.addEventListener?.('voiceschanged', voicesReady);
  window.setTimeout(voicesReady, 750);
  return true;
}
