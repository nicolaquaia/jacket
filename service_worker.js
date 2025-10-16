const cacheName = "jacket-cache-v1";
const assetsToCache = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./icons/sun.svg",
  "./icons/cloud.svg",
  // add all your other icons
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(assetsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
