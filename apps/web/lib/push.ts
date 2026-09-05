"use client";

import { getToken, onMessage } from "firebase/messaging";
import { apiClient } from "./apiClient";
import { FIREBASE_VAPID_KEY, firebaseConfig, getFirebaseMessaging } from "./firebase";

let started = false;

/**
 * Registers this browser for FCM push and saves the resulting device token
 * on the current user (POST /users/fcm-token). Call once per session, after
 * login — for both roles, see hooks/usePushNotifications.ts.
 *
 * Deliberately swallows every failure instead of throwing: push setup is a
 * nice-to-have, not something that should ever break page load if a
 * browser denies permission, doesn't support web push, or the save request
 * fails.
 */
export async function setupNotifications(): Promise<void> {
  if (started) return;
  started = true;

  if (typeof window === "undefined" || !("Notification" in window)) return;

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging || !FIREBASE_VAPID_KEY) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // The service worker is a static file with no access to process.env
    // (see public/firebase-messaging-sw.js) — pass the same client config
    // this page already loaded as query params instead of hardcoding a
    // second copy of it there.
    const swParams = new URLSearchParams(
      Object.entries(firebaseConfig)
        .filter(([key]) => key !== "measurementId")
        .map(([key, value]) => [key, value ?? ""]),
    );
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${swParams.toString()}`,
    );

    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return;

    await apiClient.post("/users/fcm-token", { fcmToken: token });

    // Foreground messages: FCM only auto-shows a system notification via
    // the service worker when no tab has focus. While this tab is open, we
    // get the raw payload here instead and have to render it ourselves —
    // otherwise a push while the agent is looking at the app would do
    // nothing at all.
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "New notification";
      new Notification(title, {
        body: payload.notification?.body,
        icon: "/next.svg",
        data: payload.data,
      });
    });
  } catch (err) {
    console.error("[push] setupNotifications failed", err);
  }
}
