import { logger } from "../../config/logger.js";
import { ticketRepository } from "../../modules/tickets/ticket.repository.js";
import { ticketRoom } from "../rooms.js";
import type { AppServer, AppSocket } from "../types.js";

export function registerChatHandlers(io: AppServer, socket: AppSocket): void {
  socket.on("ping-test", (data: unknown) => {
    logger.debug({ socketId: socket.id, data }, "Received ping-test");
    socket.emit("pong-test", "Server got your message!");
  });

  socket.on("ticket:join", async (ticketId: string, ack?: (ok: boolean) => void) => {
    const ticket = await ticketRepository.findById(ticketId);
    const user = socket.data.user;

    const isParticipant =
      ticket &&
      (user.role === "customer"
        ? ticket.customer.toString() === user.id
        : ticket.agent?.toString() === user.id);

    if (!isParticipant) {
      ack?.(false);
      logger.warn(
        { socketId: socket.id, userId: user.id, role: user.role, ticketId },
        "Non-participant tried to join ticket room",
      );
      return;
    }

    socket.join(ticketRoom(ticketId));
    ack?.(true);
  });

  socket.on("ticket:leave", (ticketId: string) => {
    socket.leave(ticketRoom(ticketId));
  });
}
