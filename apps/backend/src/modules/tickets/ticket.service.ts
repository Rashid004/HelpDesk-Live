import type {
  CreateTicketDTO,
  UpdateTicketStatusDTO,
  RateTicketDTO,
  RequestAttachmentUploadDTO,
} from "@repo/shared";
import { ApiError } from "../../utils/ApiError.js";
import { acquireLock, releaseLock } from "../../infrastructure/redisLock.js";
import { getIO } from "../../realtime/io.js";
import { ticketRoom } from "../../realtime/rooms.js";
import { generateReferenceNumber } from "../../lib/referenceNumber.js";
import { createUploadUrl } from "../../lib/s3.js";
import { validateFileExtension } from "../../config/s3.js";
import { ALLOWED_DOCUMENT_EXTENSIONS, ALLOWED_IMAGE_EXTENSIONS } from "../../utils/constants.js";
import { ticketRepository } from "./ticket.repository.js";
import { toTicketDTO, toTicketDTOList } from "./ticket.maper.js";
import { userRepository } from "../users/user.repository.js";
import { enqueueResolutionEmail } from "../../infrastructure/queue/email.queue.js";
import { notifyAgentsOfNewTicket } from "../notifications/notification.service.js";
import { logger } from "../../config/logger.js";

export class TicketService {
  async getAttachmentUploadUrl(data: RequestAttachmentUploadDTO) {
    const allowedExtensions =
      data.fileType === "image" ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_DOCUMENT_EXTENSIONS;

    if (!validateFileExtension(data.fileName, allowedExtensions)) {
      throw new ApiError(
        `Invalid file extension for ${data.fileType}. Allowed: ${allowedExtensions.join(", ")}`,
        422,
      );
    }

    return createUploadUrl(data.fileName, data.contentType, "attachments");
  }

  async createTicket(customerId: string, data: CreateTicketDTO) {
    const referenceNumber = generateReferenceNumber();
    const ticket = await ticketRepository.create(customerId, referenceNumber, data);
    const dto = toTicketDTO(ticket);

    // Fire-and-forget: a customer creating a ticket must get their response
    // immediately regardless of FCM. Not awaited, and any rejection (a
    // dead token, Firebase being slow/down) is caught right here so it
    // can't become an unhandled rejection — it only ever reaches the log.
    notifyAgentsOfNewTicket(dto).catch((err) => {
      logger.error({ err, ticketId: dto.id }, "failed to notify agents of new ticket");
    });

    return dto;
  }

  async getTicketById(id: string, requesterId: string, requesterRole: string) {
    const ticket = await ticketRepository.findByIdWithNames(id);
    if (!ticket) throw new ApiError("Ticket not found", 404);
    const dto = toTicketDTO(ticket);
    this.assertViewable(dto, requesterId, requesterRole);
    return dto;
  }

  async getTicketByReferenceNumber(referenceNumber: string, requesterId: string, requesterRole: string) {
    const ticket = await ticketRepository.findByReferenceNumber(referenceNumber);
    if (!ticket) throw new ApiError("Ticket not found", 404);
    const dto = toTicketDTO(ticket);
    this.assertViewable(dto, requesterId, requesterRole);
    return dto;
  }

  // Agents can view any ticket — they need to browse the unclaimed queue to
  // decide what to pick up. Customers may only view their own; without this,
  // GET /tickets/:id had no ownership check at all and any authenticated
  // customer could read any other customer's ticket (title, resolution
  // note, rating) just by guessing/enumerating ids.
  private assertViewable(ticket: { customer: string }, requesterId: string, requesterRole: string) {
    if (requesterRole === "customer" && ticket.customer !== requesterId) {
      throw new ApiError("Ticket not found", 404);
    }
  }

  async listTickets(filter: Record<string, unknown>, page: number, limit: number) {
    const { tickets, total, pages } = await ticketRepository.findMany(filter, page, limit);
    return { tickets: toTicketDTOList(tickets), total, page, limit, pages };
  }

  async claimTicket(ticketId: string, agentId: string) {
    const lockKey = `ticket-lock:${ticketId}`;

    // Fast gate: only one request per ticket may proceed past this point.
    const locked = await acquireLock(lockKey, agentId);
    if (!locked) {
      throw new ApiError("Ticket is already being assigned", 409);
    }

    try {
      // Source of truth: the lock only guaranteed we run this check alone.
      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) throw new ApiError("Ticket not found", 404);
      if (ticket.agent) throw new ApiError("Ticket already claimed", 409);

      const updated = await ticketRepository.assignAgent(ticketId, agentId);
      const dto = toTicketDTO(updated!);

      // Tell every agent viewing this ticket that it's now taken, so their
      // "Assign to me" button disappears without a refresh.
      getIO().to(ticketRoom(ticketId)).emit("ticket:assigned", {
        ticketId,
        agentId,
        ticket: dto,
      });

      return dto;
    } finally {
      // Always release — success, DB re-check failure, or mapper error.
      await releaseLock(lockKey, agentId);
    }
  }

  async updateStatus(ticketId: string, changedBy: string, data: UpdateTicketStatusDTO) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new ApiError("Ticket not found", 404);

    const updated = await ticketRepository.updateStatus(
      ticketId,
      changedBy,
      data.status,
      data.note,
      data.resolutionNote,
    );

    if (data.status === "resolved" && ticket.status !== "resolved") {
      const customer = await userRepository.findById(ticket.customer.toString());
      if (customer?.email) {
        await enqueueResolutionEmail(ticketId, customer.email, updated!.referenceNumber);
      } else {
        logger.warn({ ticketId }, "resolved ticket has no customer email — email skipped");
      }
    }

    return toTicketDTO(updated!);
  }

  async rateTicket(ticketId: string, customerId: string, data: RateTicketDTO) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new ApiError("Ticket not found", 404);
    if (ticket.customer.toString() !== customerId) {
      throw new ApiError("Not authorized to rate this ticket", 403);
    }
    if (ticket.status !== "resolved" && ticket.status !== "closed") {
      throw new ApiError("Ticket must be resolved before rating", 400);
    }

    const updated = await ticketRepository.rate(ticketId, data.score, data.comment);
    return toTicketDTO(updated!);
  }
}
