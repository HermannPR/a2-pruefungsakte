const diagnosticsKey = 'a2-client-diagnostics';
const maximumEntries = 20;

function safeRead() {
  try {
    const value = JSON.parse(localStorage.getItem(diagnosticsKey) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function recordClientDiagnostic(type, error) {
  try {
    const entries = safeRead();
    entries.push({
      type,
      name: error?.name ?? 'Error',
      time: new Date().toISOString(),
      page: window.location.pathname,
      online: navigator.onLine
    });
    localStorage.setItem(diagnosticsKey, JSON.stringify(entries.slice(-maximumEntries)));
  } catch {}
}

export function installClientDiagnostics() {
  window.addEventListener('error', event => {
    if (event.filename && !event.filename.startsWith(window.location.origin)) return;
    recordClientDiagnostic('runtime', event.error);
  });
  window.addEventListener('unhandledrejection', event => recordClientDiagnostic('promise', event.reason));
}

export async function clearAppCaches() {
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith('a2-pruefungsakte-')).map(key => caches.delete(key)));
}
