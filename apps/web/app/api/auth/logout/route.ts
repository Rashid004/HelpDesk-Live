import { type NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, REFRESH_COOKIE } from "../_shared";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  const authorization = req.headers.get("authorization");

  // Best-effort server-side revoke (POST /auth/logout needs both the access
  // token, for `authenticate`, and the refresh token, to know which session
  // to revoke). If either is missing, or the call fails, we still clear the
  // cookie below — a client-side logout should never get stuck on the
  // network.
  if (refreshToken && authorization) {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(REFRESH_COOKIE, "", { path: "/api/auth", maxAge: 0 });
  return response;
}
