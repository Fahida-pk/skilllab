const CACHE_NAME = "skill-lab-v2";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.webmanifest"
];


// =====================================================
// INSTALL
// =====================================================

self.addEventListener("install", (event) => {

  console.log(
    "✅ Skill Lab PWA Service Worker installed"
  );

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then((cache) => {

        return cache.addAll(APP_FILES);

      })

  );

  // Activate immediately
  self.skipWaiting();

});


// =====================================================
// ACTIVATE
// =====================================================

self.addEventListener("activate", (event) => {

  console.log(
    "✅ Skill Lab PWA Service Worker activated"
  );

  event.waitUntil(

    caches.keys()
      .then((cacheNames) => {

        return Promise.all(

          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME
            )
            .map(
              (name) =>
                caches.delete(name)
            )

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


// =====================================================
// FETCH
// =====================================================

self.addEventListener("fetch", (event) => {

  // Only GET requests
  if (
    event.request.method !== "GET"
  ) {
    return;
  }


  const request =
    event.request;


  // ===================================================
  // HTML / NAVIGATION
  // ===================================================
  //
  // Always get the latest HTML from server.
  // This prevents old React build from being loaded.
  // ===================================================

  if (
    request.mode === "navigate"
  ) {

    event.respondWith(

      fetch(request)
        .then((response) => {

          // Save latest HTML
          const responseClone =
            response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {

              cache.put(
                request,
                responseClone
              );

            });

          return response;

        })
        .catch(() => {

          // Offline fallback
          return caches.match(
            request
          );

        })

    );

    return;
  }


  // ===================================================
  // OTHER FILES
  // ===================================================

  event.respondWith(

    fetch(request)
      .then((response) => {

        // Only cache successful responses
        if (
          response &&
          response.status === 200
        ) {

          const responseClone =
            response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {

              cache.put(
                request,
                responseClone
              );

            });

        }

        return response;

      })
      .catch(() => {

        return caches.match(
          request
        );

      })

  );

});