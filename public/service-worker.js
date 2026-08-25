const CACHE_NAME = 'a2-pruefungsakte-v3';
const APP_SHELL = ['/', '/favicon.svg', '/manifest.webmanifest'];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch('/index.html', { cache: 'no-store' });
  const html = await response.clone().text();
  const generatedAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
  await cache.put('/index.html', response);
  await cache.addAll([...APP_SHELL, ...new Set(generatedAssets)]);
}

self.addEventListener('install', event => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy));
      return response;
    }).catch(() => caches.match('/index.html')));
    return;
  }
  if (new URL(event.request.url).pathname === '/assets/app.js' || new URL(event.request.url).pathname === '/assets/app.css') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => clients[0]?.focus() ?? self.clients.openWindow('/')));
});
