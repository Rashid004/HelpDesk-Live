import type { Request, Response } from "express";
import { sendMessageSchema } from "@repo/shared";
import { ApiResponseHelper } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import type { MessageService } from "./message.service.js";

export class MessageController {
  constructor(protected readonly service: MessageService) {}

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const dto = sendMessageSchema.parse(req.body);
    const ticketId = String(req.body.ticketId);
    const data = await this.service.sendMessage(ticketId, req.user!.id, req.user!.role, dto);
    res.status(201).json(ApiResponseHelper.success(data, "Message sent"));
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const ticketId = String(req.query.ticketId);
    const data = await this.service.getMessagesForTicket(ticketId, req.user!.id, req.user!.role);
    res.status(200).json(ApiResponseHelper.success(data));
  });

  markMessageAsRead = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.markMessageRead(String(req.params.messageId), req.user!.id);
    res.status(200).json(ApiResponseHelper.success(data, "Message marked as read"));
  });

  markAllMessagesAsRead = asyncHandler(async (req: Request, res: Response) => {
    const ticketId = String(req.body.ticketId);
    await this.service.markAllReadForTicket(ticketId, req.user!.id, req.user!.role);
    res.status(200).json(ApiResponseHelper.success(null, "Messages marked as read"));
  });
}
