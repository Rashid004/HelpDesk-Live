// src/lib/firebase.ts
import admin from "firebase-admin";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const app =
  env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
    ? (admin.apps[0] ??
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          // dotenv already turns the \n escapes in FIREBASE_PRIVATE_KEY into
          // real newlines for a double-quoted value; this is a defensive
          // no-op for any \n that survives (e.g. value set unquoted).
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      }))
    : null;

if (!app) {
  logger.warn("Firebase credentials not set — push notifications disabled");
}

export const messaging = app ? admin.messaging(app) : null;
