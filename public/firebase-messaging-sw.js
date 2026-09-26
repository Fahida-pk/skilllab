// =====================================================
// FIREBASE MESSAGING SERVICE WORKER
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
// BACKGROUND FCM MESSAGE
// =====================================================

messaging.onBackgroundMessage(
  function (payload) {

    console.log(
      "========================================"
    );

    console.log(
      "BACKGROUND FCM MESSAGE"
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
      payload.notification?.title ||
      payload.data?.title ||
      "⏰ Skill Lab";


    // =================================================
    // BODY
    // =================================================

    const body =
      payload.notification?.body ||
      payload.data?.body ||
      "Your task time is ready.";


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

      body:
        body,

      icon:
        "/favicon.svg",

      badge:
        "/favicon.svg",

      tag:
        taskId
          ? `skilllab-task-${taskId}`
          : "skilllab-task",

      renotify:
        true,

      requireInteraction:
        true,

      vibrate:
        [
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
  function (event) {

    console.log(
      "Notification clicked"
    );


    // Close notification
    event.notification.close();


    // Get URL from notification
    const url =
      event.notification?.data?.url ||
      "/task";


    // =================================================
    // OPEN / FOCUS SKILL LAB
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
          function (clientList) {

            // -----------------------------------------
            // Existing Skill Lab window
            // -----------------------------------------

            for (
              const client of clientList
            ) {

              if (
                "focus" in client
              ) {

                return client.focus();

              }

            }


            // -----------------------------------------
            // Open new window
            // -----------------------------------------

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