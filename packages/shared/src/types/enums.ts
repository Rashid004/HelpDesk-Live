import { z } from "zod";

export const ticketCategoryEnum = z.enum(["billing", "technical", "accountIssue", "other"]);
export type TicketCategory = z.infer<typeof ticketCategoryEnum>;

export const ticketPriorityEnum = z.enum(["low", "normal", "high"]);
export type TicketPriority = z.infer<typeof ticketPriorityEnum>;

export const ticketStatusEnum = z.enum(["open", "inProgress", "resolved", "closed"]);
export type TicketStatus = z.infer<typeof ticketStatusEnum>;

export const fileTypeEnum = z.enum(["image", "document"]);
export type FileType = z.infer<typeof fileTypeEnum>;

export const userRoleEnum = z.enum(["customer", "agent"]);
export type UserRole = z.infer<typeof userRoleEnum>;

export const userDepartmentEnum = z.enum(["billing", "technical", "general"]);
export type UserDepartment = z.infer<typeof userDepartmentEnum>;

export const userStatusEnum = z.enum(["active", "suspended"]);
export type UserStatus = z.infer<typeof userStatusEnum>;
