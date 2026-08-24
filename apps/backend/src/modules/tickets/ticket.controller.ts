import type { Request, Response } from "express";
import {
  createTicketSchema,
  updateTicketStatusSchema,
  rateTicketSchema,
  requestAttachmentUploadSchema,
} from "@repo/shared";
import { ApiResponseHelper } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import type { TicketService } from "./ticket.service.js";

export class TicketController {
  constructor(protected readonly service: TicketService) {}

  getAttachmentUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const dto = requestAttachmentUploadSchema.parse(req.body);
    const data = await this.service.getAttachmentUploadUrl(dto);
    res.status(200).json(ApiResponseHelper.success(data, "Upload URL generated"));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = createTicketSchema.parse(req.body);
    const data = await this.service.createTicket(req.user!.id, dto);
    res.status(201).json(ApiResponseHelper.success(data, "Ticket created"));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getTicketById(String(req.params.id));
    res.status(200).json(ApiResponseHelper.success(data));
  });

  getByReferenceNumber = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getTicketByReferenceNumber(String(req.params.referenceNumber));
    res.status(200).json(ApiResponseHelper.success(data));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, category, priority } = req.query as Record<
      string,
      string | undefined
    >;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (req.user!.role === "customer") filter.customer = req.user!.id;
    if (req.user!.role === "agent") filter.agent = req.user!.id;

    const result = await this.service.listTickets(filter, Number(page) || 1, Number(limit) || 20);

    res.status(200).json(
      ApiResponseHelper.paginated(result.tickets, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.pages,
        hasNext: result.page < result.pages,
        hasPrev: result.page > 1,
      }),
    );
  });

  claim = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.claimTicket(String(req.params.id), req.user!.id);
    res.status(200).json(ApiResponseHelper.success(data, "Ticket claimed"));
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const dto = updateTicketStatusSchema.parse(req.body);
    const data = await this.service.updateStatus(String(req.params.id), req.user!.id, dto);
    res.status(200).json(ApiResponseHelper.success(data, "Ticket status updated"));
  });

  rate = asyncHandler(async (req: Request, res: Response) => {
    const dto = rateTicketSchema.parse(req.body);
    const data = await this.service.rateTicket(String(req.params.id), req.user!.id, dto);
    res.status(200).json(ApiResponseHelper.success(data, "Ticket rated"));
  });
}
