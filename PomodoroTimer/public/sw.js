/* Tiny Pomodoro service worker.
 *
 * Makes the exported web app installable ("Add to Home Screen") and gives it
 * an offline app shell. The PWA shell is versioned: bump CACHE_VERSION whenever
 * the app shell changes so stale assets are evicted on the next activation.
 *
 * Strategy: precache the app shell (HTML, manifest, icons) on install, then
 * serve navigation requests network-first with a cached fallback so the app
 * still opens offline. Static assets (the hashed JS bundle) are cached
 * lazily with a stale-while-revalidate approach.
 */

const CACHE_VERSION = 'tiny-pomodoro-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      // Take control of open pages immediately instead of waiting for the
      // next navigation, so the freshly installed cache is used right away.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests; everything else goes to the network untouched.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin requests (e.g. remote fonts) pass straight through.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first so fresh deploys win, with the cached
  // shell as an offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only refresh the cached shell from a real page response; a 404
          // (e.g. GitHub Pages' error page for an unknown path) must never
          // poison the offline fallback.
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(CACHE_VERSION)
              .then((cache) => cache.put('./index.html', copy))
              .catch(() => {});
          }
          return response;
        })
        // Guard against the shell never having been cached (first-visit
        // offline) so respondWith never receives undefined.
        .catch(() => caches.match('./index.html').then((r) => r ?? Response.error())),
    );
    return;
  }

  // Static assets: cache-first with background refresh (stale-while-revalidate).
  // The JS bundle is content-hashed, so an old entry is never served for a new
  // URL; revalidation keeps the cache fresh across deploys.
  event.respondWith(
    caches.match(request).then((cached) => {
      const refresh = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(CACHE_VERSION)
              .then((cache) => cache.put(request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || refresh.then((response) => response ?? Response.error());
    }),
  );
});
