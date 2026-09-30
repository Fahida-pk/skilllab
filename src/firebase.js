// =====================================================
// SKILL LAB - FIREBASE FCM
// =====================================================

import {
  initializeApp
} from "firebase/app";

import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

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

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
  initializeApp(firebaseConfig);


// =====================================================
// FIREBASE MESSAGING
// =====================================================

export const messaging =
  getMessaging(app);


// =====================================================
// VAPID KEY
// =====================================================

export const VAPID_KEY =
  "BANg8hVOS1rmbemDYS0cPbuhLOFSnClKfqVZL5itSLXlBhNEJsb0Rsu0nl2091wKP_ojb6dUIwOZfSx_KDNHzdU";


// =====================================================
// REQUEST NOTIFICATION PERMISSION
// =====================================================

export async function requestNotificationPermission(
  email = null
) {

  try {

    console.log(
      "===================================="
    );

    console.log(
      "🔔 SKILL LAB FCM REGISTRATION"
    );

    console.log(
      "====================================");


    // =================================================
    // GET EMAIL
    // =================================================

    if (!email) {

      try {

        const savedUser =
          JSON.parse(
            localStorage.getItem(
              "user"
            ) || "null"
          );

        email =
          savedUser?.email ||
          null;

      } catch (error) {

        console.error(
          "User parse error:",
          error
        );

      }

    }


    // =================================================
    // EMAIL REQUIRED
    // =================================================

    if (!email) {

      console.error(
        "❌ No user email available"
      );

      return null;

    }


    console.log(
      "👤 User email:",
      email
    );


    // =================================================
    // CHECK NOTIFICATION SUPPORT
    // =================================================

    if (
      !("Notification" in window)
    ) {

      console.error(
        "❌ Browser does not support notifications"
      );

      return null;

    }


    // =================================================
    // REQUEST PERMISSION
    // =================================================

    let permission =
      Notification.permission;


    console.log(
      "🔔 Current permission:",
      permission
    );


    if (
      permission === "default"
    ) {

      permission =
        await Notification.requestPermission();

    }


    console.log(
      "🔔 Final permission:",
      permission
    );


    // =================================================
    // PERMISSION NOT GRANTED
    // =================================================

    if (
      permission !== "granted"
    ) {

      console.error(
        "❌ Notification permission not granted"
      );

      return null;

    }


    // =================================================
    // WAIT FOR SKILL LAB SERVICE WORKER
    // =================================================

    if (
      !("serviceWorker" in navigator)
    ) {

      console.error(
        "❌ Service Worker not supported"
      );

      return null;

    }


    const registration =
      await navigator.serviceWorker.ready;


    console.log(
      "✅ Service Worker ready"
    );

    console.log(
      "SW scope:",
      registration.scope
    );


    // =================================================
    // GET FCM TOKEN
    // =================================================

    const token =
      await getToken(
        messaging,
        {

          vapidKey:
            VAPID_KEY,

          serviceWorkerRegistration:
            registration

        }
      );


    console.log(
      "🔥 FCM TOKEN:",
      token
    );


    // =================================================
    // TOKEN FAILED
    // =================================================

    if (!token) {

      console.error(
        "❌ FCM token was not generated"
      );

      return null;

    }


    // =================================================
    // SAVE TOKEN TO DATABASE
    // =================================================

    const response =
      await fetch(
        "https://zyntaweb.com/skilllab/api/save_fcm_device.php",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              email:
                email,

              token:
                token

            })

        }
      );


    // =================================================
    // READ SERVER RESPONSE
    // =================================================

    const responseText =
      await response.text();


    console.log(
      "FCM save response:",
      responseText
    );


    let data;


    try {

      data =
        JSON.parse(
          responseText
        );

    } catch (error) {

      console.error(
        "❌ Server returned invalid JSON"
      );

      return null;

    }


    // =================================================
    // SAVE FAILED
    // =================================================

    if (
      !data.success
    ) {

      console.error(
        "❌ FCM device save failed:",
        data.message
      );

      return null;

    }


    // =================================================
    // SAVE TOKEN LOCALLY
    // =================================================

    localStorage.setItem(
      "fcmToken",
      token
    );


    localStorage.setItem(
      "fcmEmail",
      email
    );


    console.log(
      "===================================="
    );

    console.log(
      "✅ FCM REGISTRATION SUCCESS"
    );

    console.log(
      "👤 Email:",
      email
    );

    console.log(
      "===================================="
    );


    return token;

  } catch (error) {

    console.error(
      "❌ FCM setup error:",
      error
    );

    return null;

  }

}


// =====================================================
// FOREGROUND FCM
// =====================================================

export function listenForegroundMessages() {

  return onMessage(
    messaging,
    (payload) => {

      console.log(
        "===================================="
      );

      console.log(
        "🔥 FOREGROUND FCM MESSAGE"
      );

      console.log(
        payload
      );

      console.log(
        "===================================="
      );


      const title =
        payload.data?.title ||
        payload.notification?.title ||
        "⏰ Skill Lab";


      const body =
        payload.data?.body ||
        payload.notification?.body ||
        "Your task starts in 5 minutes.";


      const taskId =
        payload.data?.taskId ||
        "";


      // =================================================
      // SHOW FOREGROUND NOTIFICATION
      // =================================================

      if (
        Notification.permission ===
        "granted"
      ) {

        new Notification(
          title,
          {

            body:
              body,

            icon:
              "/icons/icon-192.png",

            badge:
              "/icons/icon-192.png",

            tag:
              taskId
                ? `skilllab-task-${taskId}`
                : `skilllab-task-${Date.now()}`

          }
        );

      }

    }
  );

}