import type { FilterQuery, UpdateQuery } from "mongoose";
import type { CreateTicketDTO, TicketStatus } from "@repo/shared";
import type { TicketDoc } from "./ticket.model.js";
import { TicketModel } from "./ticket.model.js";

// Applied everywhere a Ticket goes back over the API — ticket.maper.ts reads
// these populated docs to fill in customerName/agentName. `select`d down to
// just fullName so the populate doesn't leak password hashes etc.
const NAME_POPULATE = [
  { path: "customer", select: "fullName" },
  { path: "agent", select: "fullName" },
];

class TicketRepository {
  async create(customerId: string, referenceNumber: string, data: CreateTicketDTO) {
    const ticket = await TicketModel.create({
      ...data,
      customer: customerId,
      referenceNumber,
    });
    return ticket.populate(NAME_POPULATE);
  }

  // Deliberately UNpopulated — several callers (chat.handler.ts's room-join
  // check, ticket.service.ts's claim/status/rate pre-checks,
  // message.service.ts's assertParticipant) compare `ticket.customer`/
  // `ticket.agent` against a plain id string via `.toString()`, which breaks
  // silently against a populated sub-document (its `.toString()` isn't the
  // id). Anything that needs display names should call
  // `findByIdWithNames` instead.
  findById(id: string) {
    return TicketModel.findById(id);
  }

  // Same query as findById, but populated — for the one call site
  // (ticket.service.ts's getTicketById) that maps straight to the DTO and
  // has no raw-id comparison to protect.
  findByIdWithNames(id: string) {
    return TicketModel.findById(id).populate(NAME_POPULATE);
  }

  findByReferenceNumber(referenceNumber: string) {
    return TicketModel.findOne({ referenceNumber }).populate(NAME_POPULATE);
  }

  async findMany(filter: FilterQuery<TicketDoc>, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      TicketModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(NAME_POPULATE),
      TicketModel.countDocuments(filter),
    ]);

    return { tickets, total, page, limit, pages: Math.ceil(total / limit) };
  }

  assignAgent(id: string, agentId: string) {
    return TicketModel.findByIdAndUpdate(id, { agent: agentId }, { new: true }).populate(
      NAME_POPULATE,
    );
  }

  updateStatus(
    id: string,
    changedBy: string,
    status: TicketStatus,
    note?: string,
    resolutionNote?: string,
  ) {
    const update: UpdateQuery<TicketDoc> = {
      status,
      $push: { statusUpdates: { status, changedBy, note } },
    };
    if (resolutionNote) update.resolutionNote = resolutionNote;

    return TicketModel.findByIdAndUpdate(id, update, { new: true }).populate(NAME_POPULATE);
  }

  rate(id: string, score: number, comment?: string) {
    return TicketModel.findByIdAndUpdate(
      id,
      { customerRating: { score, comment } },
      { new: true },
    ).populate(NAME_POPULATE);
  }
}

export const ticketRepository = new TicketRepository();
