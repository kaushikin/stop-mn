const CACHE_NAME = "discipline-days-v1";
const urlsToCache = [
  "/stop-mn/",
  "/stop-mn/index.html",
  "/stop-mn/style.css",
  "/stop-mn/script.js",
  "/stop-mn/manifest.json",
  "/stop-mn/icon-192.png",
  "/stop-mn/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});