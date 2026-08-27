import { logger } from "../../config/logger.js";
import type { AppServer, AppSocket } from "../types.js";

export function registerChatHandlers(io: AppServer, socket: AppSocket): void {
  socket.on("ping-test", (data: unknown) => {
    logger.debug({ socketId: socket.id, data }, "Received ping-test");
    socket.emit("pong-test", "Server got your message!");
  });
}
