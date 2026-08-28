import { ticketRoom } from "../rooms.js";
import type { AppServer, AppSocket } from "../types.js";

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
