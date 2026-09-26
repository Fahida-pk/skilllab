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
    "AIzaSyBBspGNBspO9N5ePghA9dLuZOrf00MkqyfI",

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
// BACKGROUND MESSAGE
// =====================================================

messaging.onBackgroundMessage(
  function (payload) {

    console.log(
      "BACKGROUND FCM:",
      payload
    );


    const title =
      payload.notification?.title ||
      payload.data?.title ||
      "Skill Lab";


    const body =
      payload.notification?.body ||
      payload.data?.body ||
      "Your task time is ready.";


    const taskId =
      payload.data?.taskId || "";


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
          payload.data?.url ||
          "/task",

        taskId:
          taskId

      }

    };


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
        function (clientList) {

          for (
            const client of clientList
          ) {

            if (
              "focus" in client
            ) {

              return client.focus();

            }

          }


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