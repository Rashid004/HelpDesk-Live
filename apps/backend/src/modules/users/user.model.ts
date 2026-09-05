import { model, Schema, Types } from "mongoose";
import { hashPassword } from "../../lib/hash.js";
import type { User, UserAgentMeta, UserStatusUpdate, UserRefreshToken } from "@repo/shared";

type StatusUpdateDoc = Omit<UserStatusUpdate, "changedBy"> & {
  changedBy: Types.ObjectId;
};

export type UserDoc = Omit<User, "id" | "statusUpdates"> & {
  password: string;
  statusUpdates: (StatusUpdateDoc & { _id: Types.ObjectId })[];
};

const agentMetaSchema = new Schema<UserAgentMeta>(
  {
    department: {
      type: String,
      enum: ["billing", "technical", "general"],
      required: true,
    },
    isOnShift: { type: Boolean, default: false },
  },
  { _id: false },
);

const statusUpdateSchema = new Schema<StatusUpdateDoc>({
  status: { type: String, enum: ["active", "suspended"], required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  note: { type: String },
  changedAt: { type: Date, default: () => new Date() },
});

const refreshTokenSchema = new Schema<UserRefreshToken>(
  {
    tokenHash: { type: String, required: true },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = new Schema<UserDoc>(
  {
    fullName: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // it will be hashed
    phoneNumber: { type: String, optional: true },
    profileImageUrl: { type: String, optional: true },
    role: { type: String, enum: ["customer", "agent"], required: true },
    agentMeta: { type: agentMetaSchema, default: undefined },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    statusUpdates: { type: [statusUpdateSchema], default: [] },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    fcmToken: { type: String, default: null },
    lastSeenAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

export const UserModel = model<UserDoc>("User", userSchema);
