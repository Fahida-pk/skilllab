import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBBspQGNBxON5ePghA9dLuZOrf00MkqyfI",
  authDomain: "skill-lab-b5e16.firebaseapp.com",
  projectId: "skill-lab-b5e16",
  storageBucket: "skill-lab-b5e16.firebasestorage.app",
  messagingSenderId: "128086383416",
  appId: "1:128086383416:web:527a77f86a8bc54db0bfcd"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

/*
 IMPORTANT:
 Firebase Console →
 Project Settings →
 Cloud Messaging →
 Web Push certificates →
 Web Push certificates / Generate key pair
*/
export const VAPID_KEY =
  "BANg8hVOS1rmbemDYS0cPbuhLOFSnClKfqVZL5itSLXlBhNEJsb0Rsu0nl2091wKP_ojb6dUIwOZfSx_KDNHzdU";

export async function requestNotificationPermission(email) {
  try {
    if (!email) {
      console.warn("No user email available");
      return null;
    }

    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications.");
      return null;
    }

    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn(
        "Notification permission:",
        permission
      );
      return null;
    }

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    console.log(
      "Firebase service worker registered:",
      registration
    );

    const token = await getToken(
      messaging,
      {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      }
    );

    if (!token) {
      console.warn("FCM token not generated");
      return null;
    }

    console.log("FCM TOKEN:", token);

    const response = await fetch(
      "https://zyntaweb.com/skilllab/api/save_fcm_token.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          token
        })
      }
    );

    const data = await response.json();

    console.log(
      "FCM token server response:",
      data
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

/*
 Foreground notification.
 If SkillLab page is open and FCM message arrives,
 we show a normal browser notification.
*/

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
        new Notification(title, {
          body,
          icon: "/favicon.svg",
          tag:
            payload.data?.taskId
              ? `skilllab-task-${payload.data.taskId}`
              : "skilllab-task"
        });
      }
    }
  );
}