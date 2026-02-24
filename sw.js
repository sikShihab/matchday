/* =========================================================================
   MatchDay — Service Worker (PWA)
   Strategy:
   - App Shell cached on install
   - Stale‑While‑Revalidate for same‑origin static assets
   - Navigation fallback to /index.html when offline
   - Versioned cache with cleanup on activate
   ------------------------------------------------------------------------- */

const CACHE_VERSION = 'v4';
const CACHE_NAME = `matchday-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',               // If hosting at domain root. If hosting in a subfolder, you can remove this line.
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/logo.png'
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: SWR for same-origin GETs + offline navigation fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Navigation requests: try network, then fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Keep the latest /index.html handy
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', res.clone()));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkRes.clone()));
          }
          return networkRes;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
``
