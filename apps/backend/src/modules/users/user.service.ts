import type {
  RequestAvatarUploadDTO,
  UpdateUserProfileDTO,
  UpdateUserStatusDTO,
} from "@repo/shared";
import { comparePassword } from "../../lib/hash.js";
import { createUploadUrl } from "../../lib/s3.js";
import { validateFileExtension } from "../../config/s3.js";
import { ALLOWED_IMAGE_EXTENSIONS } from "../../utils/constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { toUserDTO, toUserDTOList } from "./user.maper.js";
import { userRepository } from "./user.repository.js";

class UserService {
  async getAvatarUploadUrl(data: RequestAvatarUploadDTO) {
    if (!validateFileExtension(data.fileName, ALLOWED_IMAGE_EXTENSIONS)) {
      throw new ApiError(
        `Invalid image extension. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`,
        422,
      );
    }

    return createUploadUrl(data.fileName, data.contentType, "avatars");
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new ApiError("User not found", 404);

    return toUserDTO(user);
  }

  async listUsers(filter: Record<string, unknown>, page: number, limit: number) {
    const { users, total, pages } = await userRepository.findMany(filter, page, limit);
    return { users: toUserDTOList(users), total, page, limit, pages };
  }

  async listAgentsByDepartment(department: string, onShiftOnly = false) {
    const agents = await userRepository.findAgentsByDepartment(department, onShiftOnly);
    return toUserDTOList(agents);
  }

  async updateProfile(id: string, data: UpdateUserProfileDTO) {
    const updated = await userRepository.updateProfile(id, data);
    if (!updated) throw new ApiError("User not found", 404);
    return toUserDTO(updated);
  }

  async updateStatus(userId: string, changedBy: string, data: UpdateUserStatusDTO) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError("User not found", 404);

    const updated = await userRepository.updateStatus(userId, changedBy, data.status, data.note);
    return toUserDTO(updated!);
  }

  async toggleShift(userId: string, isOnShift: boolean) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError("User not found", 404);
    if (user.role !== "agent") throw new ApiError("Only agents can toggle shift", 400);

    const updated = await userRepository.toggleShift(userId, isOnShift);
    return toUserDTO(updated!);
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError("User not found", 404);

    const updated = await userRepository.updateFcmToken(userId, fcmToken);
    return toUserDTO(updated!);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError("User not found", 404);

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new ApiError("Current password is incorrect", 401);

    user.password = newPassword;
    await user.save();
    return toUserDTO(user);
  }
}

export const userService = new UserService();
