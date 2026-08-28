import type { Server, Socket } from "socket.io";
import type { UserRole } from "@repo/shared";

export interface SocketUser {
  id: string;
  role: UserRole;
}

// Data Socket.IO stores on `socket.data` — set by `authenticateSocket`,
// read by every handler downstream. Passed as the 4th generic to
// `Server`/`Socket` so `socket.data.user` is typed everywhere, no casting.
// Event payloads aren't typed yet (left as `any`) — that's a later step
// once the message/typing/presence event names are all defined.
export interface SocketData {
  user: SocketUser;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppServer = Server<any, any, any, SocketData>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppSocket = Socket<any, any, any, SocketData>;
