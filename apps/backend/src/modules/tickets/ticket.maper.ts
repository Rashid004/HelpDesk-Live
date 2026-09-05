import type { HydratedDocument, Types } from "mongoose";
import type { Ticket } from "@repo/shared";
import type { TicketDoc } from "./ticket.model.js";

// `customer`/`agent` are `Types.ObjectId` when the query didn't populate them,
// or this shape (Mongoose strips everything but `_id` + the `select`ed
// fields — see ticket.repository.ts's NAME_POPULATE) when it did.
interface PopulatedUserRef {
    _id: Types.ObjectId;
    fullName?: string;
}

type UserRef = Types.ObjectId | PopulatedUserRef;

function idOf(ref: UserRef): string {
    return ((ref as PopulatedUserRef)._id ?? ref).toString();
}

function nameOf(ref: UserRef): string | undefined {
    return (ref as PopulatedUserRef).fullName;
}

export function toTicketDTO(doc: HydratedDocument<TicketDoc>): Ticket {
    const obj = doc.toObject();
    const customer = obj.customer as unknown as UserRef;
    const agent = obj.agent as unknown as UserRef | null;

    return {
        ...obj,
        id: obj._id.toString(),
        customer: idOf(customer),
        customerName: nameOf(customer),
        agent: agent ? idOf(agent) : null,
        agentName: agent ? (nameOf(agent) ?? null) : null,
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
