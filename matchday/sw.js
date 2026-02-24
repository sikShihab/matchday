const cacheName = "matchday-cache-v1";
const assetsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/logo.png",
  "/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assetsToCache)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key !== cacheName ? caches.delete(key) : null)))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});
