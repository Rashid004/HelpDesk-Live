import type { SendMessageDTO } from "@repo/shared";
import { MessageModel } from "./message.model.js";

class MessageRepository {
  async create(ticketId: string, senderId: string, data: SendMessageDTO) {
    const message = await MessageModel.create({
      ticket: ticketId,
      sender: senderId,
      content: data.content,
      attachment: data.attachment,
    });
    // Populated so both the REST response and the message:new socket
    // broadcast (realtime/handlers/message.handler.ts) carry senderName —
    // otherwise only history fetched via findByTicketId would have it.
    return message.populate("sender", "fullName email role");
  }

  findByTicketId(ticketId: string) {
    return MessageModel.find({ ticket: ticketId })
      .populate("sender", "fullName email role")
      .sort({ createdAt: 1 });
  }

  findById(messageId: string) {
    return MessageModel.findById(messageId);
  }

  markAsRead(messageId: string) {
    return MessageModel.findByIdAndUpdate(
      messageId,
      { readAt: new Date() },
      { new: true },
    );
  }

  // mark everything NOT sent by the current reader as read
  markAllAsReadForTicket(ticketId: string, excludeSenderId: string) {
    return MessageModel.updateMany(
      { ticket: ticketId, sender: { $ne: excludeSenderId }, readAt: null },
      { readAt: new Date() },
    );
  }
}

export const messageRepository = new MessageRepository();
