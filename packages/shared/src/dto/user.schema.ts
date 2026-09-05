import { z } from "zod";
import { userRoleEnum, userDepartmentEnum, userStatusEnum } from "../types/enums.js";

const agentMetaSchema = z.object({
  department: userDepartmentEnum,
  isOnShift: z.boolean().default(false),
});

const userStatusUpdateSchema = z.object({
  status: userStatusEnum,
  changedBy: z.string(),
  note: z.string().optional(),
  changedAt: z.date().default(() => new Date()),
});

const refreshTokenSchema = z.object({
  tokenHash: z.string(),
  issuedAt: z.date(),
  expiresAt: z.date(),
  revokedAt: z.date().nullable().default(null),
});

const userBaseSchema = {
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
};

export const createUserSchema = z.object({
  ...userBaseSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: userRoleEnum.default("customer"),
  agentMeta: agentMetaSchema.pick({ department: true }).optional(),
});

export const updateUserProfileSchema = z
  .object({
    fullName: userBaseSchema.fullName,
    phoneNumber: userBaseSchema.phoneNumber,
    profileImageUrl: userBaseSchema.profileImageUrl,
  })
  .partial();

export const updateUserStatusSchema = z.object({
  status: userStatusEnum,
  note: z.string().optional(),
});

export const toggleShiftSchema = z.object({
  isOnShift: z.boolean(),
});

export const requestAvatarUploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateFcmTokenSchema = z.object({
  fcmToken: z.string().min(1, "fcmToken is required"),
});

export const userSchema = z.object({
  ...userBaseSchema,
  id: z.string(),
  role: userRoleEnum,
  agentMeta: agentMetaSchema.extend({ department: userDepartmentEnum }).optional(),
  status: userStatusEnum.default("active"),
  statusUpdates: z.array(userStatusUpdateSchema).default([]),
  refreshTokens: z.array(refreshTokenSchema).default([]),
  // Web push registration token (FCM) for this device. Nullable — not every
  // user has granted browser notification permission. Never sent to clients
  // (see toUserDTO), only used server-side to target push sends.
  fcmToken: z.string().nullable().default(null),
  lastSeenAt: z.date().optional(),
  createdAt: z.date(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserProfileDTO = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserStatusDTO = z.infer<typeof updateUserStatusSchema>;
export type ToggleShiftDTO = z.infer<typeof toggleShiftSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type RequestAvatarUploadDTO = z.infer<typeof requestAvatarUploadSchema>;
export type UpdateFcmTokenDTO = z.infer<typeof updateFcmTokenSchema>;
export type User = z.infer<typeof userSchema>;
export type UserAgentMeta = z.infer<typeof agentMetaSchema>;
export type UserStatusUpdate = z.infer<typeof userStatusUpdateSchema>;
export type UserRefreshToken = z.infer<typeof refreshTokenSchema>;
