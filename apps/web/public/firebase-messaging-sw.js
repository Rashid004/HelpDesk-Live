// Background FCM handler — runs when the tab isn't focused (or is closed).
// Service workers are plain static files with no bundler and no access to
// `process.env`, so the Firebase config can't come from NEXT_PUBLIC_* the
// way lib/firebase.ts reads it. Instead, the page that registers this file
// (see lib/push.ts) appends the same env values as query params, and we
// read them back from the registration URL here — one source of truth (the
// env vars), not a second hardcoded copy of the same config.
//
// No require()/import here — this is the Service Worker global scope, not
// a module context, so `importScripts` is the only loading mechanism
// available. It attaches `firebase` directly to the global scope below.
importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
});

const messaging = firebase.messaging();

// Fires for a push that arrives while no tab has focus. A push that arrives
// while a tab IS focused goes to onMessage() in lib/push.ts instead — FCM
// picks one or the other, never both, based on document visibility.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "New notification";
  self.registration.showNotification(title, {
    body: payload.notification?.body,
    icon: "/next.svg",
    data: payload.data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const ticketId = event.notification.data?.ticketId;
  const url = ticketId ? `/tickets/${ticketId}` : "/dashboard";
  event.waitUntil(self.clients.openWindow(url));
});
