"use client";

import type { UserRole } from "@repo/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ensureSession, getStoredUser } from "../lib/session";

/** Where each role lands after login/signup, and what a guard bounces a role-mismatch to. */
export function homeFor(role: UserRole): string {
  return role === "agent" ? "/agent/dashboard" : "/dashboard";
}

/**
 * Client-side route guard. The access token lives in memory only (see
 * lib/session.ts), so a hard reload always needs a silent-refresh round trip
 * before we know whether there's a real session — that's what `ensureSession`
 * does, off the httpOnly refresh cookie.
 *
 * Pass `requiredRole` to also enforce that the signed-in user is the right
 * kind of user for this page (e.g. `/agent/dashboard` requires "agent") —
 * a role mismatch bounces to that user's own home instead of rendering.
 *
 * Returns `ready`: false until the check resolves (render a loader, NOT the
 * protected content, to avoid a flash before redirect).
 */
export function useAuthGuard(requiredRole?: UserRole): { ready: boolean } {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureSession().then((ok) => {
      if (cancelled) return;
      if (!ok) {
        router.replace("/signin");
        return;
      }
      const user = getStoredUser();
      if (requiredRole && user?.role !== requiredRole) {
        router.replace(user ? homeFor(user.role) : "/signin");
        return;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router, requiredRole]);

  return { ready };
}

/**
 * Inverse guard for /signin and /signup — bounce already-authenticated
 * users to their role's home instead of rendering the auth form again.
 */
export function useGuestGuard(): { ready: boolean } {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureSession().then((ok) => {
      if (cancelled) return;
      if (ok) {
        const user = getStoredUser();
        router.replace(user ? homeFor(user.role) : "/dashboard");
      } else {
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { ready };
}
