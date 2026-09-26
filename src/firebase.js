import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBBspGNBspO9N5ePghA9dLuZOrf00MkqyfI",
  authDomain: "skill-lab-b5e16.firebaseapp.com",
  projectId: "skill-lab-b5e16",
  storageBucket: "skill-lab-b5e16.firebasestorage.app",
  messagingSenderId: "128086383416",
  appId: "1:128086383416:web:527a77f86a8bc54db0bfcd",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export const VAPID_KEY =
  "BANg8hVOS1rmbemDYS0cPbuhLOFSnClKfqVZL5itSLXlBhNEJsb0Rsu0nl2091wKP_ojb6dUIwOZfSx_KDNHzdU";


// =====================================================
// REGISTER FCM
// =====================================================

export async function requestNotificationPermission(email = null) {
  try {

    // ---------------------------------------------
    // Get saved user if email was not passed
    // ---------------------------------------------
    if (!email) {
      try {
        const savedUser =
          JSON.parse(localStorage.getItem("user") || "null");

        email = savedUser?.email || null;
      } catch (error) {
        console.error("User parse error:", error);
      }
    }

    if (!email) {
      console.warn(
        "No email available for FCM registration"
      );

      return null;
    }


    // ---------------------------------------------
    // Browser support
    // ---------------------------------------------
    if (!("Notification" in window)) {
      console.warn(
        "This browser does not support notifications."
      );

      return null;
    }


    // ---------------------------------------------
    // Permission
    // ---------------------------------------------
    let permission = Notification.permission;

    if (permission === "default") {
      permission =
        await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn(
        "Notification permission:",
        permission
      );

      return null;
    }


    // ---------------------------------------------
    // Service Worker
    // ---------------------------------------------
    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/",
        }
      );

    await navigator.serviceWorker.ready;

    console.log(
      "FCM Service Worker ready:",
      registration
    );


    // ---------------------------------------------
    // Get FCM token
    // ---------------------------------------------
    const token = await getToken(
      messaging,
      {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      }
    );


    if (!token) {
      console.warn(
        "FCM token was not generated"
      );

      return null;
    }


    console.log(
      "================================="
    );

    console.log(
      "FCM TOKEN:",
      token
    );

    console.log(
      "FCM EMAIL:",
      email
    );

    console.log(
      "================================="
    );


    // ---------------------------------------------
    // Save token in PHP
    // ---------------------------------------------
    const response = await fetch(
      "https://zyntaweb.com/skilllab/api/save_fcm_token.php",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
          token: token,
        }),
      }
    );


    if (!response.ok) {
      throw new Error(
        `FCM save failed: ${response.status}`
      );
    }


    const data = await response.json();

    console.log(
      "FCM token server response:",
      data
    );


    // Save locally also
    localStorage.setItem(
      "fcmToken",
      token
    );


    return token;

  } catch (error) {

    console.error(
      "FCM notification setup error:",
      error
    );

    return null;
  }
}


// =====================================================
// FOREGROUND MESSAGE
// =====================================================

export function listenForegroundMessages() {

  return onMessage(
    messaging,
    (payload) => {

      console.log(
        "Foreground FCM message:",
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


      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {

        new Notification(
          title,
          {
            body: body,

            icon: "/favicon.svg",

            tag:
              payload.data?.taskId
                ? `skilllab-task-${payload.data.taskId}`
                : "skilllab-task",
          }
        );
      }

    }
  );
}