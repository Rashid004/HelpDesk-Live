import { type NextRequest, NextResponse } from "next/server";
import { proxySessionRequest, REFRESH_COOKIE } from "../_shared";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ success: false, message: "No active session" }, { status: 401 });
  }
  // Backend rotates on every refresh (old token revoked, new one issued) —
  // proxySessionRequest overwrites the cookie with the rotated value.
  return proxySessionRequest("/auth/refresh", { refreshToken });
}
