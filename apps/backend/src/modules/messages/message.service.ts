import type { SendMessageDTO } from "@repo/shared";
import { ApiError } from "../../utils/ApiError.js";
import { ticketRepository } from "../tickets/ticket.repository.js";
import { messageRepository } from "./message.repository.js";
import { toMessageDTO, toMessageDTOList } from "./message.maper.js";

export class MessageService {
  private async assertParticipant(ticketId: string, userId: string, role: string) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new ApiError("Ticket not found", 404);

    const isParticipant =
      role === "customer" ? ticket.customer.toString() === userId : ticket.agent?.toString() === userId;

    if (!isParticipant) throw new ApiError("Not authorized for this ticket", 403);
    return ticket;
  }

  async sendMessage(ticketId: string, senderId: string, senderRole: string, data: SendMessageDTO) {
    await this.assertParticipant(ticketId, senderId, senderRole);
    const message = await messageRepository.create(ticketId, senderId, data);
    return toMessageDTO(message);
  }

  async getMessagesForTicket(ticketId: string, userId: string, userRole: string) {
    await this.assertParticipant(ticketId, userId, userRole);
    const messages = await messageRepository.findByTicketId(ticketId);
    return toMessageDTOList(messages);
  }

  async markMessageRead(messageId: string, userId: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new ApiError("Message not found", 404);
    if (message.sender.toString() === userId) {
      throw new ApiError("Cannot mark your own message as read", 400);
    }

    const updated = await messageRepository.markAsRead(messageId);
    return toMessageDTO(updated!);
  }

  async markAllReadForTicket(ticketId: string, userId: string, userRole: string) {
    await this.assertParticipant(ticketId, userId, userRole);
    await messageRepository.markAllAsReadForTicket(ticketId, userId);
  }
}
