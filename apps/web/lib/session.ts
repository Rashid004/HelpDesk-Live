"use client";

import type { UserView } from "./types";

/**
 * Client-side session state.
 *
 * STORAGE DECISION — in-memory access token + httpOnly-cookie refresh token,
 * not localStorage for either:
 *
 *  - The refresh token (7d) never reaches browser JS at all. `login`/`signup`
 *    go through this app's own `/api/auth/*` route handlers (see
 *    app/api/auth/), which call the real backend server-side and set the
 *    refresh token as an httpOnly, Secure (in prod), SameSite=Lax cookie
 *    scoped to `/api/auth`. `document.cookie` can't see it, so an XSS bug on
 *    this page can't exfiltrate it — the worst it can do is ride the cookie
 *    on requests to our own refresh/logout routes, which is also all a
 *    legitimate browser tab needs.
 *  - The access token (15m) lives only in this module's memory, never
 *    localStorage/sessionStorage. It's still readable by injected JS on this
 *    page (nothing browser-side is immune to that), but there's no
 *    persistent copy for a script to scrape after the fact, and it's gone on
 *    tab close or reload.
 *  - Tradeoff: the access token *has* to be JS-visible, because Socket.IO's
 *    browser client authenticates by putting it in the handshake payload
 *    (`io(url, { auth: { token } })`) — there's no way to hand a socket
 *    handshake an httpOnly cookie, and the backend's socket middleware
 *    (realtime/middlewares/socketAuth.middleware.ts) only accepts a token
 *    there, not a cookie. A pure "nothing in JS" design isn't reachable
 *    without changing that. So: httpOnly cookie for the token that matters
 *    most long-term (refresh), in-memory for the one that has to be
 *    JS-visible anyway (access).
 *  - Cost of "in memory only": a hard reload loses the access token, so
 *    every app boot calls `ensureSession()`, which silently refreshes off
 *    the httpOnly cookie before any protected content renders.
 */

let accessToken: string | null = null;
let user: UserView | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) l();
}

/** For React's useSyncExternalStore — see hooks/useSession.ts. */
export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getStoredUser(): UserView | null {
  return user;
}

export function isAuthenticated(): boolean {
  return !!accessToken;
}

export interface SessionPayload {
  user: UserView;
  accessToken: string;
}

export function saveSession({ user: u, accessToken: token }: SessionPayload): void {
  user = u;
  accessToken = token;
  emit();
}

export function clearSession(): void {
  user = null;
  accessToken = null;
  emit();
}

/* ------------------------------------------------------------------ */
/*  Silent refresh                                                     */
/* ------------------------------------------------------------------ */

interface RefreshResponse {
  user: UserView;
  accessToken: string;
}

// De-duped in-flight refresh — concurrent callers (multiple guards mounting,
// or apiClient's 401 handler firing mid-boot) all await the same request
// instead of racing separate POSTs against the rotating refresh token.
let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchanges the httpOnly refresh cookie for a fresh access token via our own
 * `/api/auth/refresh` proxy. Updates the in-memory session on success.
 * Returns the new access token, or null if there's no valid session.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) return null;
      const body = (await res.json()) as Partial<RefreshResponse> | null;
      if (!body?.accessToken || !body.user) return null;
      saveSession({ user: body.user, accessToken: body.accessToken });
      return body.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/**
 * Called once by the route guards on mount (see hooks/useAuthGuard.ts).
 * Resolves true if a session is (or becomes) established.
 */
export async function ensureSession(): Promise<boolean> {
  if (accessToken) return true;
  const token = await refreshAccessToken();
  return !!token;
}
