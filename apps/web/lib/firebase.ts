/**
 * Firebase client SDK — browser-side config for FCM web push registration.
 *
 * All values come from NEXT_PUBLIC_FIREBASE_* env vars (see .env.example)
 * instead of being hardcoded, since this is the single place the app reads
 * them from. This is the public client config (safe to ship to the
 * browser) — it's a different credential set from apps/backend's
 * FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY, which are the private
 * admin service-account keys used server-side to *send* pushes.
 */
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Analytics, getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { type Messaging, getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Used with getToken() to register this browser for FCM web push.
export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  app ??= getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

let analytics: Promise<Analytics | null> | null = null;

/** Analytics needs a browser (indexedDB) — resolves to null during SSR or if unsupported. */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  analytics ??= isAnalyticsSupported().then((supported) =>
    supported ? getAnalytics(getFirebaseApp()) : null,
  );
  return analytics;
}

let messaging: Promise<Messaging | null> | null = null;

/**
 * Messaging needs a browser with Service Worker + Push API support — null
 * during SSR, and null in browsers that don't support web push at all
 * (e.g. Safari on iOS below 16.4). Callers must handle the null case
 * instead of assuming push always works.
 */
export function getFirebaseMessaging(): Promise<Messaging | null> {
  messaging ??= isMessagingSupported().then((supported) =>
    supported ? getMessaging(getFirebaseApp()) : null,
  );
  return messaging;
}
