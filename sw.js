const CACHE_NAME = "network-engineer-toolkit-app-cache-v1";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/app.js",
  "/sw.js",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("Precaching failed:", err);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    clients.claim() // Take control of open pages
  );
  console.log("Service Worker: Activated and claiming clients");
});

self.addEventListener("fetch", (event) => {
  // Cache-first strategy for all requests
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
