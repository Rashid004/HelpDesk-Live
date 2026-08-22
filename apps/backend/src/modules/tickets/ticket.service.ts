import type {
    CreateTicketDTO,
    UpdateTicketStatusDTO,
    RateTicketDTO,
} from "@repo/shared";
import { ApiError } from "../../utils/ApiError.js";
import { withAssignmentLock } from "../../infrastructure/lock.js";
import { generateReferenceNumber } from "../../lib/referenceNumber.js";
import { ticketRepository } from "./ticket.repository.js";
import { toTicketDTO, toTicketDTOList } from "./ticket.maper.js";

export class TicketService {
    async createTicket(customerId: string, data: CreateTicketDTO) {
        const referenceNumber = generateReferenceNumber();
        const ticket = await ticketRepository.create(
            customerId,
            referenceNumber,
            data,
        );
        return toTicketDTO(ticket);
    }

    async getTicketById(id: string) {
        const ticket = await ticketRepository.findById(id);
        if (!ticket) throw new ApiError("Ticket not found", 404);
        return toTicketDTO(ticket);
    }

    async getTicketByReferenceNumber(referenceNumber: string) {
        const ticket =
            await ticketRepository.findByReferenceNumber(referenceNumber);
        if (!ticket) throw new ApiError("Ticket not found", 404);
        return toTicketDTO(ticket);
    }

    async listTickets(
        filter: Record<string, unknown>,
        page: number,
        limit: number,
    ) {
        const { tickets, total, pages } = await ticketRepository.findMany(
            filter,
            page,
            limit,
        );
        return { tickets: toTicketDTOList(tickets), total, page, limit, pages };
    }

    async claimTicket(ticketId: string, agentId: string) {
        return withAssignmentLock(ticketId, async () => {
            const ticket = await ticketRepository.findById(ticketId);
            if (!ticket) throw new ApiError("Ticket not found", 404);
            if (ticket.agent) throw new ApiError("Ticket already claimed", 409);

            const updated = await ticketRepository.assignAgent(ticketId, agentId);
            return toTicketDTO(updated!);
        });
    }

    async updateStatus(
        ticketId: string,
        changedBy: string,
        data: UpdateTicketStatusDTO,
    ) {
        const ticket = await ticketRepository.findById(ticketId);
        if (!ticket) throw new ApiError("Ticket not found", 404);

        const updated = await ticketRepository.updateStatus(
            ticketId,
            changedBy,
            data.status,
            data.note,
            data.resolutionNote,
        );
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

        const updated = await ticketRepository.rate(
            ticketId,
            data.score,
            data.comment,
        );
        return toTicketDTO(updated!);
    }
}
