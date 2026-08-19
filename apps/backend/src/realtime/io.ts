import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env.js";

let io: SocketIOServer;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : "*",
      credentials: true,
    },
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  }
  return io;
}
