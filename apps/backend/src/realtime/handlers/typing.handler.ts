import { ticketRoom } from "../rooms.js";
import type { AppServer, AppSocket } from "../types.js";

/**
 * Registers socket handlers that broadcast typing status changes to other clients in a ticket room.
 *
 * @param io - The application server instance.
 * @param socket - The connected client socket.
 */
export function registerTypingHandlers(io: AppServer, socket: AppSocket): void {
    socket.on("typing:start", (ticketId: string) => {
        socket.broadcast.to(ticketRoom(ticketId)).emit("typing:start", {
            ticketId,
            userId: socket.data.user.id,
        });
    });

    socket.on("typing:stop", (ticketId: string) => {
        socket.broadcast.to(ticketRoom(ticketId)).emit("typing:stop", {
            ticketId,
            userId: socket.data.user.id,
        });
    });
}
