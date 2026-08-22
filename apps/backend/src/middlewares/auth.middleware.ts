import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@repo/shared";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../lib/jwt.js";

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: UserRole };
        }
    }
}

export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        throw new ApiError("Authentication required", 401);
    }

    const token = header.slice("Bearer ".length);

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch {
        throw new ApiError("Invalid or expired token", 401);
    }
}

export function authorize(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) throw new ApiError("Authentication required", 401);
        if (!roles.includes(req.user.role)) {
            throw new ApiError("Insufficient permissions", 403);
        }
        next();
    };
}
