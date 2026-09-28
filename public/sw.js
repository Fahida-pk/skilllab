const CACHE_NAME = "skill-lab-v1";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  console.log("Skill Lab PWA Service Worker installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  console.log("Skill Lab PWA Service Worker activated");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});


self.addEventListener("fetch", (event) => {

  // Only GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {

        // Save a copy in cache
        const responseClone =
          response.clone();

        caches.open(CACHE_NAME).then(
          (cache) => {
            cache.put(
              event.request,
              responseClone
            );
          }
        );

        return response;
      })
      .catch(() => {
        return caches.match(
          event.request
        );
      })
  );
});