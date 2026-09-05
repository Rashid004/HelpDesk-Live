import { NextResponse } from "next/server";

/**
 * Shared plumbing for the auth proxy routes (login/signup/refresh/logout).
 * These are the only routes in the app that talk to the backend directly
 * with fetch — everything else goes through lib/apiClient.ts from the
 * browser. See lib/session.ts for why auth is special-cased this way.
 */

export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(
  /\/$/,
  "",
);

// Scoped to /api/auth so the cookie only ever rides along on requests to
// these route handlers, never on ordinary browser navigation or API calls.
export const REFRESH_COOKIE = "hdl_rt";
const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // matches backend JWT_REFRESH_EXPIRES_IN default (7d)

interface BackendErrorEnvelope {
  message?: string;
  errors?: { field: string; message: string }[];
}

interface BackendSessionEnvelope {
  message?: string;
  data?: {
    user: unknown;
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * POSTs to a backend session endpoint (/auth/login, /auth/signup,
 * /auth/refresh), then splits the response: the refresh token is set as an
 * httpOnly cookie on the Next.js response and never sent to the browser as
 * JSON; only { user, accessToken } comes back in the body.
 */
export async function proxySessionRequest(path: string, body: unknown): Promise<NextResponse> {
  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the server. Please try again." },
      { status: 502 },
    );
  }

  const envelope = (await backendRes.json().catch(() => null)) as
    | (BackendErrorEnvelope & BackendSessionEnvelope)
    | null;

  if (!backendRes.ok || !envelope?.data) {
    return NextResponse.json(
      {
        success: false,
        message: envelope?.message ?? "Something went wrong. Please try again.",
        errors: envelope?.errors ?? [],
      },
      { status: backendRes.status },
    );
  }

  const { user, accessToken, refreshToken } = envelope.data;
  const response = NextResponse.json({ user, accessToken });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
