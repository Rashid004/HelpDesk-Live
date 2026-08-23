import type { FilterQuery, UpdateQuery } from "mongoose";
import type { CreateTicketDTO, TicketStatus } from "@repo/shared";
import type { TicketDoc } from "./ticket.model.js";
import { TicketModel } from "./ticket.model.js";

class TicketRepository {
  create(customerId: string, referenceNumber: string, data: CreateTicketDTO) {
    return TicketModel.create({
      ...data,
      customer: customerId,
      referenceNumber,
    });
  }

  findById(id: string) {
    return TicketModel.findById(id);
  }

  findByReferenceNumber(referenceNumber: string) {
    return TicketModel.findOne({ referenceNumber });
  }

  async findMany(filter: FilterQuery<TicketDoc>, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      TicketModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      TicketModel.countDocuments(filter),
    ]);

    return { tickets, total, page, limit, pages: Math.ceil(total / limit) };
  }

  assignAgent(id: string, agentId: string) {
    return TicketModel.findByIdAndUpdate(id, { agent: agentId }, { new: true });
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

    return TicketModel.findByIdAndUpdate(id, update, { new: true });
  }

  rate(id: string, score: number, comment?: string) {
    return TicketModel.findByIdAndUpdate(id, { customerRating: { score, comment } }, { new: true });
  }
}

export const ticketRepository = new TicketRepository();
