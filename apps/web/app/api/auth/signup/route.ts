import { NextResponse } from "next/server";
import { proxySessionRequest } from "../_shared";

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }
  return proxySessionRequest("/auth/signup", body);
}
