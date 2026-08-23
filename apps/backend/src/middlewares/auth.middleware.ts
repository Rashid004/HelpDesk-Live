import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@repo/shared";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../lib/jwt.js";

// Augments Express's Request type so `req.user` is known everywhere without casting.
declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: UserRole };
        }
    }
}

/**
 * Verifies the "Authorization: Bearer <token>" header and attaches the
 * decoded identity to `req.user`. Must run before `authorize()` on any
 * protected route. Throws are synchronous, so Express's default error
 * handling (via errorHandler.ts) catches them without needing asyncHandler.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
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
        // Any verify failure (bad signature, malformed, expired) is reported
        // the same way — don't leak which case it was.
        throw new ApiError("Invalid or expired token", 401);
    }
}

/**
 * Restricts a route to one or more roles. Must run after `authenticate()`.
 * Usage: router.get("/", authenticate, authorize("agent"), handler)
 */
export function authorize(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) throw new ApiError("Authentication required", 401);
        if (!roles.includes(req.user.role)) {
            throw new ApiError("Insufficient permissions", 403);
        }
        next();
    };
}
