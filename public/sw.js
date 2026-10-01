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

  apiKey:
    "AIzaSyBBspQGNBxON5ePghA9dLuZOrf00MkqyfI",

  authDomain:
    "skill-lab-b5e16.firebaseapp.com",

  projectId:
    "skill-lab-b5e16",

  storageBucket:
    "skill-lab-b5e16.firebasestorage.app",

  messagingSenderId:
    "128086383416",

  appId:
    "1:128086383416:web:527a77f86a8bc54db0bfcd"

});


const messaging =
  firebase.messaging();


// =====================================================
// CACHE
// IMPORTANT:
// Change version whenever Service Worker is updated
// =====================================================

const CACHE_NAME =
  "skill-lab-v7";


// =====================================================
// BASIC APP FILES
// =====================================================

const APP_FILES = [

  "/",

  "/index.html",

  "/manifest.webmanifest"

];


// =====================================================
// INSTALL
// =====================================================

self.addEventListener(
  "install",
  (event) => {

    console.log(
      "===================================="
    );

    console.log(
      "✅ SKILL LAB SERVICE WORKER INSTALLED"
    );

    console.log(
      "📦 Cache:",
      CACHE_NAME
    );

    console.log(
      "===================================="
    );


    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(
          (cache) => {

            return cache.addAll(
              APP_FILES
            );

          }
        )

        .catch(
          (error) => {

            console.error(
              "❌ Cache install error:",
              error
            );

          }
        )

    );


    // Immediately activate new Service Worker
    self.skipWaiting();

  }
);


// =====================================================
// ACTIVATE
// =====================================================

self.addEventListener(
  "activate",
  (event) => {

    console.log(
      "===================================="
    );

    console.log(
      "✅ SKILL LAB SERVICE WORKER ACTIVATED"
    );

    console.log(
      "📦 Current cache:",
      CACHE_NAME
    );

    console.log(
      "===================================="
    );


    event.waitUntil(

      caches
        .keys()

        .then(
          (cacheNames) => {

            return Promise.all(

              cacheNames

                .filter(
                  (name) => {

                    return (
                      name !== CACHE_NAME &&
                      name.startsWith(
                        "skill-lab-"
                      )
                    );

                  }
                )

                .map(
                  (name) => {

                    console.log(
                      "🗑️ Deleting old cache:",
                      name
                    );

                    return caches.delete(
                      name
                    );

                  }
                )

            );

          }
        )

        .then(
          () => {

            console.log(
              "✅ Old Skill Lab caches removed"
            );

            return self.clients.claim();

          }
        )

    );

  }
);


// =====================================================
// FETCH
// =====================================================

self.addEventListener(
  "fetch",
  (event) => {

    // Only handle GET requests
    if (
      event.request.method !== "GET"
    ) {

      return;

    }


    // =================================================
    // Do NOT cache API requests
    // =================================================
    // This is important because task data,
    // student data, etc. must stay fresh.
    // =================================================

    const requestUrl =
      new URL(
        event.request.url
      );


    if (
      requestUrl.pathname.includes(
        "/skilllab/api/"
      )
    ) {

      return;

    }


    // =================================================
    // PAGE / NAVIGATION
    // =================================================

    if (
      event.request.mode === "navigate"
    ) {

      event.respondWith(

        fetch(
          event.request,
          {
            cache: "no-store"
          }
        )

        .then(
          (response) => {

            if (
              response &&
              response.ok
            ) {

              const clone =
                response.clone();


              caches
                .open(
                  CACHE_NAME
                )
                .then(
                  (cache) => {

                    cache.put(
                      event.request,
                      clone
                    );

                  }
                );

            }


            return response;

          }
        )

        .catch(
          () => {

            console.log(
              "📦 Network unavailable. Using cached page."
            );

            return caches.match(
              event.request
            );

          }
        )

      );

      return;

    }


    // =================================================
    // OTHER GET REQUESTS
    // =================================================

    event.respondWith(

      fetch(
        event.request
      )

      .then(
        (response) => {

          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {

            const clone =
              response.clone();


            caches
              .open(
                CACHE_NAME
              )
              .then(
                (cache) => {

                  cache.put(
                    event.request,
                    clone
                  );

                }
              );

          }


          return response;

        }
      )

      .catch(
        () => {

          return caches.match(
            event.request
          );

        }
      )

    );

  }
);


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

      body:
        body,


      icon:
        "/icons/icon-192.png",


      badge:
        "/icons/icon-192.png",


      // Same task should update/replace its notification
      tag:
        taskId
          ? `skilllab-task-${taskId}`
          : `skilllab-task-${Date.now()}`,


      // Show again even if same tag exists
      renotify:
        true,


      // Keep notification visible
      requireInteraction:
        true,


      // Android supported vibration
      vibrate: [
        200,
        100,
        200
      ],


      // Data available when notification is clicked
      data: {

        url:
          notificationUrl,

        taskId:
          taskId

      }

    };


    // =================================================
    // SHOW NOTIFICATION
    // =================================================

    return self.registration
      .showNotification(
        title,
        notificationOptions
      )

      .then(
        () => {

          console.log(
            "✅ Notification displayed:",
            title
          );

        }
      )

      .catch(
        (error) => {

          console.error(
            "❌ Notification display failed:",
            error
          );

        }
      );

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


    // Close notification
    event.notification.close();


    // =================================================
    // GET URL
    // =================================================

    const url =
      event.notification?.data?.url ||
      "/#/task";


    // =================================================
    // HANDLE CLICK
    // =================================================

    event.waitUntil(

      clients
        .matchAll({

          type:
            "window",

          includeUncontrolled:
            true

        })

        .then(
          (clientList) => {

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

                    .then(
                      () => {

                        return client.focus();

                      }
                    );

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

          }
        )

    );

  }
);


// =====================================================
// SERVICE WORKER MESSAGE
// =====================================================
// Allows the React app to force an update if required.
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