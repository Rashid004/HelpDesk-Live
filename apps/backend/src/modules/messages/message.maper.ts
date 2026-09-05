import type { HydratedDocument, Types } from "mongoose";
import type { Message, UserRole } from "@repo/shared";
import type { MessageDoc } from "./message.model.js";

// `sender` is a raw `Types.ObjectId` when the query didn't populate it, or
// this shape when it did (see message.repository.ts's
// `.populate("sender", "fullName email role")`).
interface PopulatedSender {
  _id: Types.ObjectId;
  fullName?: string;
  role?: UserRole;
}

type SenderRef = Types.ObjectId | PopulatedSender;

export function toMessageDTO(doc: HydratedDocument<MessageDoc>): Message {
  const obj = doc.toObject();
  const sender = obj.sender as unknown as SenderRef;
  const populated = sender as PopulatedSender;

  return {
    ...obj,
    id: obj._id.toString(),
    ticket: obj.ticket.toString(),
    sender: (populated._id ?? sender).toString(),
    senderName: populated.fullName,
    senderRole: populated.role,
  };
}

export function toMessageDTOList(docs: HydratedDocument<MessageDoc>[]): Message[] {
  return docs.map(toMessageDTO);
}
