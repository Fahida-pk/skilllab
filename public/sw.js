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
// =====================================================

const CACHE_NAME =
  "skill-lab-v5";


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
      "✅ Skill Lab SW installed"
    );


    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        (cache) => {

          return cache.addAll(
            APP_FILES
          );

        }
      )

    );


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
      "✅ Skill Lab SW activated"
    );


    event.waitUntil(

      caches.keys()
        .then(
          (cacheNames) => {

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

          }
        )
        .then(
          () => {

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

    if (
      event.request.method !==
      "GET"
    ) {

      return;

    }


    // =================================================
    // PAGE / NAVIGATION
    // =================================================

    if (
      event.request.mode ===
      "navigate"
    ) {

      event.respondWith(

        fetch(
          event.request
        )

        .then(
          (response) => {

            const clone =
              response.clone();


            caches.open(
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


      return;

    }


    // =================================================
    // OTHER FILES
    // =================================================

    event.respondWith(

      fetch(
        event.request
      )

      .then(
        (response) => {

          if (
            response &&
            response.status === 200
          ) {

            const clone =
              response.clone();


            caches.open(
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
      payload
    );

    console.log(
      "===================================="
    );


    // =================================================
    // TITLE
    // =================================================

    const title =
      payload.data?.title ||
      payload.notification?.title ||
      "⏰ Skill Lab";


    // =================================================
    // BODY
    // =================================================

    const body =
      payload.data?.body ||
      payload.notification?.body ||
      "Your task starts in 5 minutes.";


    // =================================================
    // TASK ID
    // =================================================

    const taskId =
      payload.data?.taskId ||
      "";


    // =================================================
    // URL
    // =================================================

    const notificationUrl =
      payload.data?.url ||
      "/task";


    // =================================================
    // NOTIFICATION
    // =================================================

    const options = {

      body:
        body,

      icon:
        "/icons/icon-192.png",

      badge:
        "/icons/icon-192.png",

      tag:
        taskId
          ? `skilllab-task-${taskId}`
          : `skilllab-task-${Date.now()}`,

      renotify:
        true,

      requireInteraction:
        true,

      vibrate: [
        200,
        100,
        200
      ],

      data: {

        url:
          notificationUrl,

        taskId:
          taskId

      }

    };


    // =================================================
    // SHOW
    // =================================================

    return self.registration.showNotification(
      title,
      options
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
      "🔔 Skill Lab notification clicked"
    );


    event.notification.close();


    const url =
      event.notification?.data?.url ||
      "/task";


    event.waitUntil(

      clients.matchAll({

        type:
          "window",

        includeUncontrolled:
          true

      })

      .then(
        (clientList) => {


          // =============================================
          // EXISTING SKILL LAB WINDOW
          // =============================================

          for (
            const client of clientList
          ) {

            if (
              "navigate" in client &&
              "focus" in client
            ) {

              client.navigate(
                url
              );

              return client.focus();

            }

          }


          // =============================================
          // OPEN NEW
          // =============================================

          if (
            clients.openWindow
          ) {

            return clients.openWindow(
              url
            );

          }

        }
      )

    );

  }
);