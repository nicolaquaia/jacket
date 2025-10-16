const cacheName = "jacket-cache-v1";
const assetsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/sun.svg',
  '/icons/cloud.svg',
  '/icons/cloud_partly.svg',
  '/icons/cloud_partly_rain.svg',
  '/icons/cloud_partly_night.svg',
  '/icons/rain.svg',
  '/icons/rain_heavy.svg',
  '/icons/rain_little.svg',
  '/icons/snow.svg',
  '/icons/thunder.svg',
  '/icons/night.svg',
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
