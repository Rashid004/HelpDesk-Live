"use client";

import { useSyncExternalStore } from "react";
import { getStoredUser, subscribeSession } from "../lib/session";
import type { UserView } from "../lib/types";

interface SessionState {
  user: UserView | null;
  isAuthenticated: boolean;
}

const getServerSnapshot = (): UserView | null => null;

/** Reactive read of the current session — re-renders on login/logout/refresh. */
export function useSession(): SessionState {
  const user = useSyncExternalStore(subscribeSession, getStoredUser, getServerSnapshot);
  return { user, isAuthenticated: !!user };
}
