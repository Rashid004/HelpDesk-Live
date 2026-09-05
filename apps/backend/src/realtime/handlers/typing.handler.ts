import { ticketRoom } from "../rooms.js";
import type { AppServer, AppSocket } from "../types.js";

export function registerTypingHandlers(io: AppServer, socket: AppSocket): void {
    // Tickets this socket has an outstanding typing:start for (no matching
    // typing:stop yet) — used to clean up on disconnect below.
    const activeTypingTicketIds = new Set<string>();

    socket.on("typing:start", (ticketId: string) => {
        activeTypingTicketIds.add(ticketId);
        socket.broadcast.to(ticketRoom(ticketId)).emit("typing:start", {
            ticketId,
            userId: socket.data.user.id,
        });
    });

    socket.on("typing:stop", (ticketId: string) => {
        activeTypingTicketIds.delete(ticketId);
        socket.broadcast.to(ticketRoom(ticketId)).emit("typing:stop", {
            ticketId,
            userId: socket.data.user.id,
        });
    });

    // A dropped connection (closed tab, crash, lost network) never gets to
    // emit typing:stop itself — without this, the other participant's
    // "is typing…" indicator stays lit until some unrelated typing event
    // happens to fire.
    socket.on("disconnect", () => {
        for (const ticketId of activeTypingTicketIds) {
            socket.broadcast.to(ticketRoom(ticketId)).emit("typing:stop", {
                ticketId,
                userId: socket.data.user.id,
            });
        }
    });
}
