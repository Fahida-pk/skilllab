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
  console.log("Background FCM message:", payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "Skill Lab";

  const body =
    payload.notification?.body ||
    payload.data?.body ||
    "Your task time is ready.";

  const options = {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: payload.data?.taskId
      ? `skilllab-task-${payload.data.taskId}`
      : "skilllab-task",
    renotify: true,
    requireInteraction: false,
    data: {
      url: payload.data?.url || "/"
    }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});