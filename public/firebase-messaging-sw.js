importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBBspQGNBxON5ePghA9dLuZOrf00MkqyfI",
  authDomain: "skill-lab-b5e16.firebaseapp.com",
  projectId: "skill-lab-b5e16",
  storageBucket: "skill-lab-b5e16.firebasestorage.app",
  messagingSenderId: "128086383416",
  appId: "1:128086383416:web:527a77f86a8bc54db0bfcd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title =
    payload.notification?.title || "Skill Lab";

  const options = {
    body:
      payload.notification?.body || "Your task time has started.",
    icon: "/favicon.svg"
  };

  self.registration.showNotification(title, options);
});