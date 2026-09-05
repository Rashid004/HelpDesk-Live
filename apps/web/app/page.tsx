import { redirect } from "next/navigation";

// Session lives client-side only (in-memory access token + httpOnly refresh
// cookie — see lib/session.ts), so it can't be read here in a Server
// Component. Always land on /signin; its useGuestGuard() resolves the real
// session client-side and bounces an already-authenticated user onward to
// their role's home (see hooks/useAuthGuard.ts's homeFor()).
export default function HomePage(): never {
  redirect("/signin");
}
