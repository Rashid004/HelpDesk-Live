import type { HydratedDocument, Types } from "mongoose";
import type { Ticket } from "@repo/shared";
import type { TicketDoc } from "./ticket.model.js";

export function toTicketDTO(doc: HydratedDocument<TicketDoc>): Ticket {
    const obj = doc.toObject();

    return {
        ...obj,
        id: obj._id.toString(),
        customer: obj.customer.toString(),
        agent: obj.agent ? (obj.agent as Types.ObjectId).toString() : null,
        statusUpdates: obj.statusUpdates.map(({ _id, ...update }) => ({
            ...update,
            changedBy: update.changedBy.toString(),
        })),
        attachments: obj.attachments?.map(({ _id, ...attachment }) => attachment),
    };
}

export function toTicketDTOList(docs: HydratedDocument<TicketDoc>[]): Ticket[] {
    return docs.map(toTicketDTO);
}
