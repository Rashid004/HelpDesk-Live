import { model, Schema, Types } from "mongoose";
import type { Message, FileType } from "@repo/shared";

type MessageAttachmentDoc = { fileUrl: string; fileType: FileType };

export type MessageDoc = Omit<Message, "id" | "ticket" | "sender"> & {
  ticket: Types.ObjectId;
  sender: Types.ObjectId;
};

const attachmentSchema = new Schema<MessageAttachmentDoc>(
  {
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ["image", "document"], required: true },
  },
  { _id: false },
);

const messageSchema = new Schema<MessageDoc>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    attachment: { type: attachmentSchema },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const MessageModel = model<MessageDoc>("Message", messageSchema);
