// =====================================================
// SKILL LAB - FIREBASE MESSAGING SERVICE WORKER
// =====================================================

// =====================================================
// FIREBASE APP COMPAT
// =====================================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);


// =====================================================
// FIREBASE MESSAGING COMPAT
// =====================================================

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


// =====================================================
// FIREBASE MESSAGING
// =====================================================

const messaging =
  firebase.messaging();


// =====================================================
// SERVICE WORKER READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "🔥 SKILL LAB FIREBASE SERVICE WORKER"
);

console.log(
  "🔥 SERVICE WORKER LOADED"
);

console.log(
  "========================================"
);


// =====================================================
// BACKGROUND FCM MESSAGE
//
// This works when:
//
// ✔ Skill Lab tab is in background
// ✔ Browser is minimized
// ✔ Skill Lab page is not active
// ✔ PWA is running in background
// ✔ Browser is not currently showing Skill Lab
//
// Website does NOT need to be active.
// =====================================================

messaging.onBackgroundMessage(
  (payload) => {

    console.log(
      "========================================"
    );

    console.log(
      "🔥 BACKGROUND FCM MESSAGE RECEIVED"
    );

    console.log(
      payload
    );

    console.log(
      "========================================"
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
    // NOTIFICATION OPTIONS
    // =================================================

    const notificationOptions = {

      // -----------------------------------------------
      // MESSAGE
      // -----------------------------------------------

      body:
        body,


      // -----------------------------------------------
      // ICON
      // -----------------------------------------------

      icon:
        "/favicon.svg",


      // -----------------------------------------------
      // BADGE
      // -----------------------------------------------

      badge:
        "/favicon.svg",


      // -----------------------------------------------
      // UNIQUE TAG
      // -----------------------------------------------

      tag:
        taskId
          ? `skilllab-task-${taskId}`
          : "skilllab-task",


      // -----------------------------------------------
      // SHOW AGAIN EVEN WITH SAME TAG
      // -----------------------------------------------

      renotify:
        true,


      // -----------------------------------------------
      // KEEP NOTIFICATION VISIBLE
      // -----------------------------------------------

      requireInteraction:
        true,


      // -----------------------------------------------
      // VIBRATION
      // -----------------------------------------------

      vibrate:
        [
          200,
          100,
          200
        ],


      // -----------------------------------------------
      // CUSTOM DATA
      // -----------------------------------------------

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

    return self.registration.showNotification(
      title,
      notificationOptions
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


    // =================================================
    // CLOSE NOTIFICATION
    // =================================================

    event.notification.close();


    // =================================================
    // GET URL
    // =================================================

    const url =
      event.notification?.data?.url ||
      "/task";


    // =================================================
    // OPEN / FOCUS SKILL LAB
    // =================================================

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
          // CHECK EXISTING SKILL LAB WINDOW
          // =============================================

          for (
            const client of clientList
          ) {

            if (
              "focus" in client
            ) {

              return client.focus();

            }

          }


          // =============================================
          // OPEN NEW SKILL LAB WINDOW
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


// =====================================================
// SERVICE WORKER INSTALL
// =====================================================

self.addEventListener(
  "install",
  () => {

    console.log(
      "✅ Skill Lab Service Worker installed"
    );

    self.skipWaiting();

  }
);


// =====================================================
// SERVICE WORKER ACTIVATE
// =====================================================

self.addEventListener(
  "activate",
  (event) => {

    console.log(
      "✅ Skill Lab Service Worker activated"
    );

    event.waitUntil(
      self.clients.claim()
    );

  }
);