import type { SendMessageDTO } from "@repo/shared";
import { MessageService } from "../../modules/messages/message.service.js";
import type { AppServer, AppSocket } from "../types.js";
import { logger } from "../../config/logger.js";
import { ticketRoom } from "../rooms.js";

const messageService = new MessageService();

export function registerMessageHandlers(io: AppServer, socket: AppSocket): void {

    socket.on("message:send", async (payload: { ticketId: string, data: SendMessageDTO }, ack?: (ok: boolean) => void) => {
        const user = socket.data.user

        try {
            const message = await messageService.sendMessage(
                payload.ticketId,
                user.id,
                user.role,
                payload.data
            )

            io.to(ticketRoom(payload.ticketId)).emit("message:new", message)
            ack?.(true)

        } catch (err) {
            logger.warn(
                { socketId: socket.id, userId: user.id, ticketId: payload.ticketId, err },
                "message:send failed",
            );
            ack?.(false);
        }
    });

    socket.on(
        "message:read",
        async (payload: { ticketId: string; messageId: string }, ack?: (ok: boolean) => void) => {
            const user = socket.data.user;

            try {
                const message = await messageService.markMessageRead(payload.messageId, user.id);
                io.to(ticketRoom(payload.ticketId)).emit("message:read", message);
                ack?.(true);
            } catch (err) {
                logger.warn(
                    { socketId: socket.id, userId: user.id, messageId: payload.messageId, err },
                    "message:read failed",
                );
                ack?.(false);
            }
        },
    );

}