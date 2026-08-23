import type { Request, Response } from "express";
import { signupSchema, loginSchema, refreshTokenSchema } from "@repo/shared";
import { ApiResponseHelper } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import type { authService } from "./auth.service.js";

export class AuthController {
    constructor(protected readonly service: typeof authService) { }

    signup = asyncHandler(async (req: Request, res: Response) => {
        const dto = signupSchema.parse(req.body);
        const data = await this.service.signupUser(dto);
        res.status(201).json(ApiResponseHelper.success(data, "Signup successful"));
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const dto = loginSchema.parse(req.body);
        const data = await this.service.loginUser(dto);
        res.status(200).json(ApiResponseHelper.success(data, "Login successful"));
    });

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const dto = refreshTokenSchema.parse(req.body);
        const data = await this.service.refreshSession(dto.refreshToken);
        res.status(200).json(ApiResponseHelper.success(data, "Session refreshed"));
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const dto = refreshTokenSchema.parse(req.body);
        await this.service.logoutUser(req.user!.id, dto.refreshToken);
        res.status(200).json(ApiResponseHelper.success(null, "Logout successful"));
    });
}
