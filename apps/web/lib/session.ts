"use client";

import type { UserView } from "./types";

/**
 * Client-side session store — access/refresh tokens + the signed-in user,
 * kept in localStorage. Good enough for this learning project; a production
 * build would prefer httpOnly cookies.
 *
 * All reads are SSR-safe (guarded on `window`).
 */

const ACCESS_KEY = "hdl.accessToken";
const REFRESH_KEY = "hdl.refreshToken";
const USER_KEY = "hdl.user";

const hasWindow = (): boolean => typeof window !== "undefined";

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): UserView | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserView;
  } catch {
    return null;
  }
}

export interface SessionPayload {
  user: UserView;
  accessToken: string;
  refreshToken: string;
}

export function saveSession({
  user,
  accessToken,
  refreshToken,
}: SessionPayload): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ACCESS_KEY, accessToken);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
