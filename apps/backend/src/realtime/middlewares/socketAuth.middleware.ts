import { verifyAccessToken } from "../../lib/jwt.js";
import type { AppSocket } from "../types.js";

/**
 * Authenticates a Socket.IO connection using the JWT provided in the handshake.
 *
 * @param socket - The Socket.IO connection to authenticate
 * @param next - Callback invoked with an error when authentication fails
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
