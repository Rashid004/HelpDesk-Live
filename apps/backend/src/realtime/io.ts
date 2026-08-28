import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { registerChatHandlers } from "./handlers/chat.handler.js";
import { authenticateSocket } from "./middlewares/socketAuth.middleware.js";
import type { AppServer } from "./types.js";
import { registerMessageHandlers } from "./handlers/message.handler.js";
import { registerTypingHandlers } from "./handlers/typing.handler.js";
import { registerPresenceHandlers } from "./handlers/presence.handler.js";

let io: AppServer | undefined;

/**
 * Initializes the Socket.IO server and attaches it to the provided HTTP server.
 *
 * @param httpServer - The HTTP server that hosts Socket.IO connections
 * @returns The initialized Socket.IO application server
 */
export function initSocket(httpServer: HttpServer): AppServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : "*",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id, userId: socket.data.user.id }, "Socket connected");

    registerChatHandlers(io as AppServer, socket);
    registerMessageHandlers(io as AppServer, socket);
    registerTypingHandlers(io as AppServer, socket);
    registerPresenceHandlers(io as AppServer, socket);

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id, userId: socket.data.user.id }, "Socket disconnected");
    });
  });

  return io;
}

/**
 * Retrieves the initialized Socket.IO server.
 *
 * @returns The initialized Socket.IO server
 * @throws If the Socket.IO server has not been initialized
 */
export function getIO(): AppServer {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  }
  return io;
}
