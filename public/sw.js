// =====================================================
// SKILL LAB
// ONE SERVICE WORKER
// PWA + FIREBASE FCM
// =====================================================


// =====================================================
// FIREBASE COMPAT
// =====================================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);


// =====================================================
// FIREBASE CONFIG
// =====================================================

firebase.initializeApp({
  apiKey: "AIzaSyBBspQGNBxON5ePghA9dLuZOrf00MkqyfI",

  authDomain: "skill-lab-b5e16.firebaseapp.com",

  projectId: "skill-lab-b5e16",

  storageBucket: "skill-lab-b5e16.firebasestorage.app",

  messagingSenderId: "128086383416",

  appId: "1:128086383416:web:527a77f86a8bc54db0bfcd",
});


const messaging = firebase.messaging();


// =====================================================
// CACHE
// IMPORTANT:
// Change version whenever Service Worker is updated
// =====================================================

const CACHE_NAME = "skill-lab-v8";


// =====================================================
// BASIC APP FILES
// =====================================================

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
];


// =====================================================
// INSTALL
// =====================================================

self.addEventListener("install", (event) => {
  console.log("====================================");
  console.log("✅ SKILL LAB SERVICE WORKER INSTALLED");
  console.log("📦 Cache:", CACHE_NAME);
  console.log("====================================");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_FILES);
      })
      .catch((error) => {
        console.error("❌ Cache install error:", error);
      })
  );

  // Immediately activate new Service Worker
  self.skipWaiting();
});


// =====================================================
// ACTIVATE
// =====================================================

self.addEventListener("activate", (event) => {
  console.log("====================================");
  console.log("✅ SKILL LAB SERVICE WORKER ACTIVATED");
  console.log("📦 Current cache:", CACHE_NAME);
  console.log("====================================");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (
                name !== CACHE_NAME &&
                name.startsWith("skill-lab-")
              );
            })
            .map((name) => {
              console.log(
                "🗑️ Deleting old cache:",
                name
              );

              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log(
          "✅ Old Skill Lab caches removed"
        );

        return self.clients.claim();
      })
  );
});


// =====================================================
// FETCH
// =====================================================

self.addEventListener("fetch", (event) => {

  // -----------------------------------------------------
  // Only handle GET requests
  // -----------------------------------------------------

  if (event.request.method !== "GET") {
    return;
  }


  // -----------------------------------------------------
  // Request URL
  // -----------------------------------------------------

  const requestUrl = new URL(
    event.request.url
  );


  // -----------------------------------------------------
  // Do NOT cache API requests
  // -----------------------------------------------------
  //
  // This is important because task data,
  // student data, subscription data, etc.
  // must stay fresh.
  // -----------------------------------------------------

  if (
    requestUrl.pathname.includes(
      "/skilllab/api/"
    )
  ) {
    return;
  }


  // -----------------------------------------------------
  // Also don't cache PHP/API style requests
  // from the SkillLab backend.
  // -----------------------------------------------------

  if (
    requestUrl.pathname.startsWith(
      "/skilllab/"
    ) &&
    requestUrl.origin !== self.location.origin
  ) {
    return;
  }


  // =====================================================
  // PAGE / NAVIGATION
  // =====================================================

  if (
    event.request.mode === "navigate"
  ) {

    event.respondWith(
      fetch(event.request, {
        cache: "no-store",
      })

        // -------------------------------------------------
        // Network successful
        // -------------------------------------------------

        .then((response) => {

          if (
            response &&
            response.ok
          ) {

            const clone =
              response.clone();

            // Cache successful navigation
            // in background.
            caches
              .open(CACHE_NAME)
              .then((cache) => {
                return cache.put(
                  event.request,
                  clone
                );
              })
              .catch((error) => {
                console.warn(
                  "⚠️ Navigation cache error:",
                  error
                );
              });
          }

          return response;
        })

        // -------------------------------------------------
        // Network failed
        // -------------------------------------------------

        .catch(async (error) => {

          console.warn(
            "📦 Network unavailable:",
            error
          );

          // First try exact requested page
          const cachedPage =
            await caches.match(
              event.request
            );

          if (cachedPage) {
            console.log(
              "📦 Returning cached requested page"
            );

            return cachedPage;
          }


          // -------------------------------------------------
          // IMPORTANT FIX
          // For React/Vite SPA routes such as:
          //
          // /subscription
          // /dashboard
          // /task
          //
          // there may not be a cache entry for the
          // exact route.
          //
          // So return cached index.html.
          // -------------------------------------------------

          const cachedIndex =
            await caches.match(
              "/index.html"
            );

          if (cachedIndex) {
            console.log(
              "📦 Returning cached index.html for SPA route"
            );

            return cachedIndex;
          }


          // -------------------------------------------------
          // Final fallback
          // ALWAYS return a valid Response.
          // This prevents:
          //
          // Failed to convert value to 'Response'
          // -------------------------------------------------

          return new Response(
            `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                  >
                  <title>Skill Lab</title>
                </head>

                <body>
                  <h2>Skill Lab</h2>
                  <p>
                    You are currently offline.
                    Please check your internet connection.
                  </p>
                </body>
              </html>
            `,
            {
              status: 503,
              statusText: "Service Unavailable",
              headers: {
                "Content-Type": "text/html; charset=utf-8",
              },
            }
          );
        })
    );

    return;
  }


  // =====================================================
  // OTHER GET REQUESTS
  // =====================================================

  event.respondWith(
    fetch(event.request)

      // -------------------------------------------------
      // Network success
      // -------------------------------------------------

      .then((response) => {

        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {

          const clone =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then((cache) => {
              return cache.put(
                event.request,
                clone
              );
            })
            .catch((error) => {
              console.warn(
                "⚠️ Cache put error:",
                error
              );
            });
        }

        return response;
      })

      // -------------------------------------------------
      // Network failed
      // -------------------------------------------------

      .catch(async () => {

        const cachedResponse =
          await caches.match(
            event.request
          );

        if (cachedResponse) {
          return cachedResponse;
        }


        // IMPORTANT:
        // Never return undefined from respondWith().
        return new Response(
          "Offline",
          {
            status: 503,
            statusText: "Service Unavailable",
          }
        );
      })
  );
});


// =====================================================
// FIREBASE BACKGROUND FCM
// =====================================================

messaging.onBackgroundMessage(
  (payload) => {

    console.log(
      "===================================="
    );

    console.log(
      "🔥 SKILL LAB BACKGROUND FCM"
    );

    console.log(
      "📩 Payload:",
      payload
    );

    console.log(
      "===================================="
    );


    // =================================================
    // TITLE
    // =================================================

    const title =
      payload?.data?.title ||
      payload?.notification?.title ||
      "⏰ Skill Lab";


    // =================================================
    // BODY
    // =================================================

    const body =
      payload?.data?.body ||
      payload?.notification?.body ||
      "Your task starts in 5 minutes.";


    // =================================================
    // TASK ID
    // =================================================

    const taskId =
      payload?.data?.taskId ||
      payload?.data?.task_id ||
      "";


    // =================================================
    // URL
    // =================================================

    const notificationUrl =
      payload?.data?.url ||
      "/#/task";


    // =================================================
    // NOTIFICATION OPTIONS
    // =================================================

    const notificationOptions = {

      body: body,

      icon:
        "/icons/icon-192.png",

      badge:
        "/icons/icon-192.png",

      // Same task should update/replace
      // its notification
      tag: taskId
        ? `skilllab-task-${taskId}`
        : `skilllab-task-${Date.now()}`,

      // Show again even if same tag exists
      renotify: true,

      // Keep notification visible
      requireInteraction: true,

      // Android supported vibration
      vibrate: [
        200,
        100,
        200,
      ],

      // Data available when notification is clicked
      data: {
        url: notificationUrl,
        taskId: taskId,
      },
    };


    // =================================================
    // SHOW NOTIFICATION
    // =================================================

    return self.registration
      .showNotification(
        title,
        notificationOptions
      )

      .then(() => {

        console.log(
          "✅ Notification displayed:",
          title
        );

      })

      .catch((error) => {

        console.error(
          "❌ Notification display failed:",
          error
        );

      });

  }
);


// =====================================================
// NOTIFICATION CLICK
// =====================================================

self.addEventListener(
  "notificationclick",
  (event) => {

    console.log(
      "===================================="
    );

    console.log(
      "🔔 SKILL LAB NOTIFICATION CLICKED"
    );

    console.log(
      "===================================="
    );


    // -------------------------------------------------
    // Close notification
    // -------------------------------------------------

    event.notification.close();


    // -------------------------------------------------
    // GET URL
    // -------------------------------------------------

    const url =
      event.notification?.data?.url ||
      "/#/task";


    // -------------------------------------------------
    // HANDLE CLICK
    // -------------------------------------------------

    event.waitUntil(

      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })

        .then((clientList) => {

          // =========================================
          // FIND EXISTING SKILL LAB WINDOW
          // =========================================

          for (
            const client of clientList
          ) {

            if (
              "focus" in client
            ) {

              // Navigate existing tab
              if (
                "navigate" in client
              ) {

                return client
                  .navigate(url)

                  .then(() => {
                    return client.focus();
                  });
              }


              return client.focus();
            }
          }


          // =========================================
          // OPEN NEW WINDOW
          // =========================================

          if (
            clients.openWindow
          ) {

            return clients.openWindow(
              url
            );
          }


          return undefined;
        })

    );
  }
);


// =====================================================
// SERVICE WORKER MESSAGE
// =====================================================
//
// Allows the React app to force an update
// if required.
// =====================================================

self.addEventListener(
  "message",
  (event) => {

    if (
      event.data &&
      event.data.type ===
        "SKILL_LAB_SKIP_WAITING"
    ) {

      console.log(
        "🔄 Skill Lab Service Worker update requested"
      );

      self.skipWaiting();
    }

  }
);


// =====================================================
// END
// =====================================================

console.log(
  "🚀 Skill Lab ONE Service Worker loaded:",
  CACHE_NAME
);