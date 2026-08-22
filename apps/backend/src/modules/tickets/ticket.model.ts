import { model, Schema, Types } from "mongoose";
import type {
  Ticket,
  TicketAttachment,
  TicketStatusUpdate,
  TicketCustomerRating,
} from "@repo/shared";

type StatusUpdateDoc = Omit<TicketStatusUpdate, "changedBy"> & {
  changedBy: Types.ObjectId;
};

export type TicketDoc = Omit<
  Ticket,
  "id" | "customer" | "agent" | "attachments" | "statusUpdates"
> & {
  customer: Types.ObjectId;
  agent: Types.ObjectId | null;
  attachments: (TicketAttachment & { _id: Types.ObjectId })[];
  statusUpdates: (StatusUpdateDoc & { _id: Types.ObjectId })[];
};

const attachmentSchema = new Schema<TicketAttachment>({
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ["image", "document"], required: true },
  uploadedAt: { type: Date, default: () => new Date() },
});

const statusUpdateSchema = new Schema<StatusUpdateDoc>({
  status: {
    type: String,
    enum: ["open", "inProgress", "resolved", "closed"],
    required: true,
  },
  changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  note: { type: String },
  changedAt: { type: Date, default: () => new Date() },
});

const customerRatingSchema = new Schema<TicketCustomerRating>(
  {
    score: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    ratedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const ticketSchema = new Schema<TicketDoc>(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[A-Za-z0-9-]+$/,
    },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent: { type: Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true, minlength: 3 },
    description: { type: String, required: true, minlength: 10 },
    category: {
      type: String,
      enum: ["billing", "technical", "accountIssue", "other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    attachments: { type: [attachmentSchema], default: [] },
    status: {
      type: String,
      enum: ["open", "inProgress", "resolved", "closed"],
      default: "open",
    },
    statusUpdates: { type: [statusUpdateSchema], default: [] },
    resolutionNote: { type: String },
    customerRating: { type: customerRatingSchema },
  },
  { timestamps: true },
);

export const TicketModel = model<TicketDoc>("Ticket", ticketSchema);
