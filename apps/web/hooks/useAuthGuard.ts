"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../lib/session";

/**
 * Client-side route guard. Tokens live in localStorage, so this can't be a
 * server middleware — the check runs on mount.
 *
 * Returns `ready`: false until the check passes (render a loader, NOT the
 * protected content, to avoid a flash before redirect).
 *
 * TODO: when refresh-token rotation is wired, also verify the access token
 * isn't expired here (or try a silent refresh) before treating it as valid.
 */
export function useAuthGuard(): { ready: boolean } {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setReady(true);
    } else {
      router.replace("/signin");
    }
  }, [router]);

  return { ready };
}

/**
 * Inverse guard for /signin and /signup — bounce already-authenticated
 * users to the dashboard.
 */
export function useGuestGuard(): { ready: boolean } {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      setReady(true);
    }
  }, [router]);

  return { ready };
}
