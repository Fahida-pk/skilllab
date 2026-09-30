// =====================================================
// SKILL LAB - FIREBASE
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
  initializeApp(
    firebaseConfig
  );


// =====================================================
// MESSAGING
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

    // =================================================
    // GET USER EMAIL
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


    if (!email) {

      console.error(
        "❌ No email available"
      );

      return null;

    }


    // =================================================
    // NOTIFICATION SUPPORT
    // =================================================

    if (
      !("Notification" in window)
    ) {

      console.error(
        "❌ Notifications not supported"
      );

      return null;

    }


    // =================================================
    // PERMISSION
    // =================================================

    let permission =
      Notification.permission;


    if (
      permission === "default"
    ) {

      permission =
        await Notification.requestPermission();

    }


    console.log(
      "Notification permission:",
      permission
    );


    if (
      permission !== "granted"
    ) {

      console.error(
        "❌ Notification permission denied"
      );

      return null;

    }


    // =================================================
    // GET OUR SINGLE SERVICE WORKER
    // =================================================

    const registration =
      await navigator.serviceWorker.ready;


    console.log(
      "✅ Skill Lab service worker ready"
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
      "FCM TOKEN:",
      token
    );


    if (!token) {

      console.error(
        "❌ FCM token not generated"
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

          headers:
            {
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
        "❌ Invalid server response"
      );

      return null;

    }


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
    // SAVE LOCALLY
    // =================================================

    localStorage.setItem(
      "fcmToken",
      token
    );


    console.log(
      "✅ FCM registration successful"
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
        "🔥 FOREGROUND FCM MESSAGE",
        payload
      );


      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "⏰ Skill Lab";


      const body =
        payload.notification?.body ||
        payload.data?.body ||
        "Your task starts in 5 minutes.";


      const taskId =
        payload.data?.taskId ||
        "";


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
              "/favicon.svg",

            badge:
              "/favicon.svg",

            tag:
              taskId
                ? `skilllab-task-${taskId}`
                : "skilllab-task"

          }
        );

      }

    }
  );

}