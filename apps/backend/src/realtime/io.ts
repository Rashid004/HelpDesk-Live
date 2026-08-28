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

export function getIO(): AppServer {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  }
  return io;
}
