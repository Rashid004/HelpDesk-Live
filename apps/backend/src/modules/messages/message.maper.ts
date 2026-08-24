import type { HydratedDocument, Types } from "mongoose";
import type { Message } from "@repo/shared";
import type { MessageDoc } from "./message.model.js";

export function toMessageDTO(doc: HydratedDocument<MessageDoc>): Message {
  const obj = doc.toObject();
  // sender may be a raw ObjectId or a populated user doc, depending on the query
  const sender = obj.sender as Types.ObjectId & { _id?: Types.ObjectId };

  return {
    ...obj,
    id: obj._id.toString(),
    ticket: obj.ticket.toString(),
    sender: (sender._id ?? sender).toString(),
  };
}

export function toMessageDTOList(docs: HydratedDocument<MessageDoc>[]): Message[] {
  return docs.map(toMessageDTO);
}
