import type { NextFunction, Request, Response } from "express";
import {
  createTicketSchema,
  updateTicketStatusSchema,
  rateTicketSchema,
} from "@repo/shared";
import { createModuleLogger } from "../../config/logger.js";
import { ApiResponseHelper } from "../../utils/ApiResponse.js";
import type { TicketService } from "./ticket.service.js";

export class TicketController {
  protected readonly logger = createModuleLogger("TicketController");

  constructor(protected readonly service: TicketService) { }

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = createTicketSchema.parse(req.body);
      const data = await this.service.createTicket(req.user!.id, dto);
      res
        .status(201)
        .json(ApiResponseHelper.success(data, "Ticket created"));
    } catch (error) {
      this.logger.error({ err: error }, "Failed to create ticket");
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTicketById(String(req.params.id));
      res.status(200).json(ApiResponseHelper.success(data));
    } catch (error) {
      this.logger.error(
        { err: error, id: req.params.id },
        "Failed to fetch ticket",
      );
      next(error);
    }
  };

  getByReferenceNumber = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTicketByReferenceNumber(
        String(req.params.referenceNumber),
      );
      res.status(200).json(ApiResponseHelper.success(data));
    } catch (error) {
      this.logger.error(
        { err: error, referenceNumber: req.params.referenceNumber },
        "Failed to fetch ticket by reference number",
      );
      next(error);
    }
  };

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
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

      const result = await this.service.listTickets(
        filter,
        Number(page) || 1,
        Number(limit) || 20,
      );

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
    } catch (error) {
      this.logger.error({ err: error }, "Failed to list tickets");
      next(error);
    }
  };

  claim = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.claimTicket(
        String(req.params.id),
        req.user!.id,
      );
      res.status(200).json(ApiResponseHelper.success(data, "Ticket claimed"));
    } catch (error) {
      this.logger.error(
        { err: error, id: req.params.id },
        "Failed to claim ticket",
      );
      next(error);
    }
  };

  updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = updateTicketStatusSchema.parse(req.body);
      const data = await this.service.updateStatus(
        String(req.params.id),
        req.user!.id,
        dto,
      );
      res
        .status(200)
        .json(ApiResponseHelper.success(data, "Ticket status updated"));
    } catch (error) {
      this.logger.error(
        { err: error, id: req.params.id },
        "Failed to update ticket status",
      );
      next(error);
    }
  };

  rate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = rateTicketSchema.parse(req.body);
      const data = await this.service.rateTicket(
        String(req.params.id),
        req.user!.id,
        dto,
      );
      res.status(200).json(ApiResponseHelper.success(data, "Ticket rated"));
    } catch (error) {
      this.logger.error(
        { err: error, id: req.params.id },
        "Failed to rate ticket",
      );
      next(error);
    }
  };
}
