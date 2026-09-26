import { initializeApp } from "firebase/app";

import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

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
// WEB PUSH VAPID KEY
// =====================================================

export const VAPID_KEY =
  "BANg8hVOS1rmbemDYS0cPbuhLOFSnClKfqVZL5itSLXlBhNEJsb0Rsu0nl2091wKP_ojb6dUIwOZfSx_KDNHzdU";


// =====================================================
// REGISTER FCM
// =====================================================

export async function requestNotificationPermission(
  email = null
) {

  try {

    console.log(
      "========================================"
    );

    console.log(
      "FCM REGISTRATION START"
    );

    console.log(
      "========================================"
    );


    // =================================================
    // 1. GET EMAIL
    // =================================================

    if (!email) {

      try {

        const savedUser =
          JSON.parse(
            localStorage.getItem("user") ||
            "null"
          );

        email =
          savedUser?.email || null;

      } catch (error) {

        console.error(
          "User parse error:",
          error
        );

      }

    }


    console.log(
      "FCM EMAIL:",
      email
    );


    // =================================================
    // EMAIL REQUIRED FOR LOGIN-BASED REGISTRATION
    // =================================================

    if (!email) {

      console.error(
        "❌ No email available for FCM registration"
      );

      return null;

    }


    // =================================================
    // 2. CHECK NOTIFICATION SUPPORT
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
    // 3. NOTIFICATION PERMISSION
    // =================================================

    let permission =
      Notification.permission;


    console.log(
      "Current notification permission:",
      permission
    );


    if (
      permission === "default"
    ) {

      console.log(
        "Requesting notification permission..."
      );


      permission =
        await Notification.requestPermission();

    }


    console.log(
      "Final notification permission:",
      permission
    );


    // =================================================
    // PERMISSION NOT GRANTED
    // =================================================

    if (
      permission !== "granted"
    ) {

      console.error(
        "❌ Notification permission was not granted:",
        permission
      );

      return null;

    }


    console.log(
      "✅ Notification permission granted"
    );


    // =================================================
    // 4. REGISTER SERVICE WORKER
    // =================================================

    console.log(
      "Registering Firebase service worker..."
    );


    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/"
        }
      );


    console.log(
      "✅ Firebase service worker registered:",
      registration
    );


    // =================================================
    // 5. WAIT FOR SERVICE WORKER
    // =================================================

    await navigator.serviceWorker.ready;


    console.log(
      "✅ Firebase service worker is ready"
    );


    // =================================================
    // 6. GENERATE FCM TOKEN
    // =================================================

    console.log(
      "Generating FCM token..."
    );


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
      "FCM TOKEN RESULT:",
      token
    );


    // =================================================
    // TOKEN NOT GENERATED
    // =================================================

    if (!token) {

      console.error(
        "❌ FCM token was not generated"
      );

      return null;

    }


    console.log(
      "========================================"
    );

    console.log(
      "✅ FCM TOKEN GENERATED"
    );

    console.log(
      "Email:",
      email
    );

    console.log(
      "Token:",
      token
    );

    console.log(
      "========================================"
    );


    // =================================================
    // 7. SAVE TOKEN TO NEW TABLE
    // =================================================
    //
    // IMPORTANT:
    // NEW FILE:
    //
    // save_fcm_device.php
    //
    // OLD FILE:
    //
    // save_fcm_token.php
    //
    // is no longer used.
    // =================================================


    console.log(
      "Saving FCM device to server..."
    );


    const response =
      await fetch(
        "https://zyntaweb.com/skilllab/api/save_fcm_device.php",
        {

          method: "POST",

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


    console.log(
      "FCM save HTTP status:",
      response.status
    );


    // =================================================
    // 8. READ RESPONSE
    // =================================================

    const responseText =
      await response.text();


    console.log(
      "FCM save raw response:",
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
        "❌ Server did not return valid JSON"
      );

      return null;

    }


    console.log(
      "FCM device server response:",
      data
    );


    // =================================================
    // SERVER FAILED
    // =================================================

    if (
      !data.success
    ) {

      console.error(
        "❌ FCM device was NOT saved:",
        data.message || ""
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


    console.log(
      "========================================"
    );

    console.log(
      "✅ FCM REGISTRATION SUCCESSFUL"
    );

    console.log(
      "Email:",
      email
    );

    console.log(
      "Device ID:",
      data.device_id
    );

    console.log(
      "User ID:",
      data.user_id
    );

    console.log(
      "Token saved in database"
    );

    console.log(
      "========================================"
    );


    return token;


  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "❌ FCM NOTIFICATION SETUP ERROR"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    return null;

  }

}


// =====================================================
// FOREGROUND FCM MESSAGE
// =====================================================

export function listenForegroundMessages() {

  console.log(
    "Starting foreground FCM listener..."
  );


  return onMessage(
    messaging,
    (payload) => {

      console.log(
        "========================================"
      );

      console.log(
        "FOREGROUND FCM MESSAGE"
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
        "Skill Lab";


      // =================================================
      // BODY
      // =================================================

      const body =
        payload.notification?.body ||
        payload.data?.body ||
        "Your task time is ready.";


      // =================================================
      // SHOW FOREGROUND NOTIFICATION
      // =================================================

      if (

        "Notification" in window &&

        Notification.permission === "granted"

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
              payload.data?.taskId
                ? `skilllab-task-${payload.data.taskId}`
                : "skilllab-task"

          }
        );

      }

    }
  );

}