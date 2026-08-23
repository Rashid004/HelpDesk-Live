import type { FilterQuery } from "mongoose";
import type { CreateUserDTO, UpdateUserProfileDTO, UserStatus } from "@repo/shared";
import type { UserDoc } from "./user.model.js";
import { UserModel } from "./user.model.js";

class UserRepository {
  create(data: CreateUserDTO) {
    return UserModel.create(data);
  }

  findById(id: string) {
    return UserModel.findById(id);
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  async findMany(filter: FilterQuery<UserDoc>, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  updateProfile(id: string, data: UpdateUserProfileDTO) {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  updateStatus(id: string, changedBy: string, status: UserStatus, note?: string) {
    return UserModel.findByIdAndUpdate(
      id,
      { status, $push: { statusUpdates: { status, changedBy, note } } },
      { new: true },
    );
  }

  findAgentsByDepartment(department: string, onShiftOnly = false) {
    const filter: FilterQuery<UserDoc> = {
      role: "agent",
      "agentMeta.department": department,
      status: "active",
    };
    if (onShiftOnly) filter["agentMeta.isOnShift"] = true;

    return UserModel.find(filter).sort({ "agentMeta.isOnShift": -1, createdAt: -1 });
  }

  toggleShift(id: string, isOnShift: boolean) {
    return UserModel.findByIdAndUpdate(id, { "agentMeta.isOnShift": isOnShift }, { new: true });
  }

  touchLastSeen(id: string) {
    return UserModel.findByIdAndUpdate(id, { lastSeenAt: new Date() }, { new: true });
  }

  addRefreshToken(userId: string, tokenHash: string, issuedAt: Date, expiresAt: Date) {
    return UserModel.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: { tokenHash, issuedAt, expiresAt, revokedAt: null } } },
      { new: true },
    );
  }

  revokeRefreshToken(id: string, tokenHash: string) {
    return UserModel.updateOne(
      { _id: id, "refreshTokens.tokenHash": tokenHash },
      { $set: { "refreshTokens.$.revokedAt": new Date() } },
    );
  }
}

export const userRepository = new UserRepository();
