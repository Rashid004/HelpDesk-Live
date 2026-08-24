import { Request, Response } from "express";
import { ApiResponseHelper } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { userService } from "./user.service.js";
import {
  changePasswordSchema,
  requestAvatarUploadSchema,
  toggleShiftSchema,
  updateUserProfileSchema,
  updateUserStatusSchema,
} from "@repo/shared";

export class UserController {
  constructor(protected readonly service: typeof userService) {}

  getAvatarUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const dto = requestAvatarUploadSchema.parse(req.body);
    const data = await this.service.getAvatarUploadUrl(dto);
    res.status(200).json(ApiResponseHelper.success(data, "Upload URL generated"));
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getUserById(req.user!.id);
    res.status(200).json(ApiResponseHelper.success(data));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getUserById(String(req.params.id));
    res.status(200).json(ApiResponseHelper.success(data));
  });

  getUserList = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, role, status } = req.query as Record<string, string | undefined>;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const result = await this.service.listUsers(filter, Number(page) || 1, Number(limit) || 20);

    res.status(200).json(
      ApiResponseHelper.paginated(result.users, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.pages,
        hasNext: result.page < result.pages,
        hasPrev: result.page > 1,
      }),
    );
  });

  getListAgentsByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { onShiftOnly } = req.query as Record<string, string | undefined>;
    const data = await this.service.listAgentsByDepartment(
      String(req.params.department),
      onShiftOnly === "true",
    );
    res.status(200).json(ApiResponseHelper.success(data));
  });

  updateMe = asyncHandler(async (req: Request, res: Response) => {
    const dto = updateUserProfileSchema.parse(req.body);
    const data = await this.service.updateProfile(req.user!.id, dto);
    res.status(200).json(ApiResponseHelper.success(data, "Profile updated"));
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const dto = updateUserStatusSchema.parse(req.body);
    const data = await this.service.updateStatus(String(req.params.id), req.user!.id, dto);
    res.status(200).json(ApiResponseHelper.success(data, "User status updated"));
  });

  toggleShift = asyncHandler(async (req: Request, res: Response) => {
    const dto = toggleShiftSchema.parse(req.body);
    const data = await this.service.toggleShift(req.user!.id, dto.isOnShift);
    res.status(200).json(ApiResponseHelper.success(data, "Shift status updated"));
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const dto = changePasswordSchema.parse(req.body);
    const data = await this.service.changePassword(
      req.user!.id,
      dto.currentPassword,
      dto.newPassword,
    );
    res.status(200).json(ApiResponseHelper.success(data, "Password changed"));
  });
}
