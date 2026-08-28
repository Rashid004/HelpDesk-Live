import { userRepository } from "../../modules/users/user.repository.js";
import type { AppServer, AppSocket } from "../types.js";

const PRESENCE_ROOM = "presence";

/**
 * Registers realtime presence events for an authenticated socket.
 *
 * @param io - The application server used to broadcast offline events
 * @param socket - The authenticated socket connection to track
 */
export function registerPresenceHandlers(io: AppServer, socket: AppSocket): void {
    const user = socket.data.user;

    socket.join(PRESENCE_ROOM);
    socket.broadcast.to(PRESENCE_ROOM).emit("presence:online", { userId: user.id });

    socket.on("disconnect", async () => {
        const updated = await userRepository.touchLastSeen(user.id);
        io.to(PRESENCE_ROOM).emit("presence:offline", {
            userId: user.id,
            lastSeenAt: updated?.lastSeenAt,
        });
    });
}
