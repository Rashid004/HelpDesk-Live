import { z } from "zod";
import {
  ticketCategoryEnum,
  ticketPriorityEnum,
  ticketStatusEnum,
  fileTypeEnum,
} from "../types/enums";

const attachmentSchema = z.object({
  fileUrl: z.string().url(),
  fileType: fileTypeEnum,
  uploadedAt: z.date().default(() => new Date()),
});

const statusUpdateSchema = z.object({
  status: ticketStatusEnum,
  changedBy: z.string(),
  note: z.string().optional(),
  changedAt: z.date().default(() => new Date()),
});

const customerRatingSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
  ratedAt: z.date().default(() => new Date()),
});

const createAttachmentSchema = attachmentSchema.pick({
  fileUrl: true,
  fileType: true,
});

const ticketBaseSchema = {
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: ticketCategoryEnum,
  priority: ticketPriorityEnum.default("normal"),
};

export const createTicketSchema = z.object({
  ...ticketBaseSchema,
  attachments: z.array(createAttachmentSchema).optional(),
});

export const updateTicketStatusSchema = z
  .object({
    status: ticketStatusEnum,
    note: z.string().optional(),
    resolutionNote: z.string().optional(),
  })
  .refine((data) => data.status !== "resolved" || !!data.resolutionNote, {
    message: "resolutionNote is required when status is 'resolved'",
    path: ["resolutionNote"],
  });

export const rateTicketSchema = customerRatingSchema.pick({
  score: true,
  comment: true,
});

export const requestAttachmentUploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: fileTypeEnum,
  contentType: z.string().min(1),
});

export const ticketSchema = z.object({
  ...ticketBaseSchema,
  id: z.string(),
  referenceNumber: z
    .string()
    .regex(
      /^[A-Za-z0-9-]+$/,
      "referenceNumber must be URL-safe (used in /track/{referenceNumber})",
    ),
  customer: z.string(),
  agent: z.string().nullable(),
  attachments: z.array(attachmentSchema).optional(),
  status: ticketStatusEnum.default("open"),
  statusUpdates: z.array(statusUpdateSchema).default([]),
  resolutionNote: z.string().optional(),
  customerRating: customerRatingSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateTicketDTO = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusDTO = z.infer<typeof updateTicketStatusSchema>;
export type RateTicketDTO = z.infer<typeof rateTicketSchema>;
export type RequestAttachmentUploadDTO = z.infer<typeof requestAttachmentUploadSchema>;
export type Ticket = z.infer<typeof ticketSchema>;
export type TicketAttachment = z.infer<typeof attachmentSchema>;
export type TicketStatusUpdate = z.infer<typeof statusUpdateSchema>;
export type TicketCustomerRating = z.infer<typeof customerRatingSchema>;
