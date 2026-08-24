import { z } from "zod";
import { fileTypeEnum } from "../types/enums.js";

export const messageAttachmentSchema = z.object({
    fileUrl: z.string().url(),
    fileType: fileTypeEnum,
});

// content or attachment required
export const sendMessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty").optional(),
    attachment: messageAttachmentSchema.optional(),
}).refine(
    (data) => !!data.content || !!data.attachment,
    { message: "Either content or an attachment is required", path: ["content"] }
);

// messageId comes from URL param in single-mark route; body schema kept for future batch endpoint
export const markMessageReadSchema = z.object({
    messageId: z.string(),
});

// DB document / API response shape
export const messageSchema = z.object({
    id: z.string(),
    ticket: z.string(),
    sender: z.string(),
    content: z.string().optional(),
    attachment: messageAttachmentSchema.optional(),
    readAt: z.date().nullable().default(null),
    createdAt: z.date(),
});

export type Message = z.infer<typeof messageSchema>;
export type MarkMessageReadDTO = z.infer<typeof markMessageReadSchema>;
export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
