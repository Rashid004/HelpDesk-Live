import { verifyAccessToken } from "../../lib/jwt.js";
import type { AppSocket } from "../types.js";

/**
 * Socket.IO connection middleware — verifies the JWT access token sent in
 * `handshake.auth.token` and attaches the identity to `socket.data.user`.
 * Runs once per connection attempt, before `connection` fires. Same trust
 * boundary as the REST `authenticate()` middleware, just a different
 * transport for the token (no per-message headers on a socket).
 */
export function authenticateSocket(socket: AppSocket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    socket.data.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}
