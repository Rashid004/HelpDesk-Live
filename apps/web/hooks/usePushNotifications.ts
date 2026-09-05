"use client";

import { useEffect } from "react";
import { setupNotifications } from "../lib/push";

/**
 * Registers this browser for FCM push once the signed-in user is known —
 * used by both the agent dashboard (new-ticket pushes) and the customer
 * dashboard (ticket-resolved pushes). Pass the auth guard's `ready` so this
 * doesn't fire before we know who's actually signed in.
 */
export function usePushNotifications(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    setupNotifications();
  }, [enabled]);
}
