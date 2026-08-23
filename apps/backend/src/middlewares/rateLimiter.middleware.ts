import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { ApiResponseHelper } from "../utils/ApiResponse.js";

/**
 * Shared handler so every limiter below returns the same response shape
 * as the rest of the API instead of express-rate-limit's default text body.
 */
function rateLimitHandler(_req: Request, res: Response) {
    res.status(429).json(ApiResponseHelper.error("Too many requests, please try again later"));
}

// General ceiling for all API traffic — generous, just guards against abuse/bugs.
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

// Tight limit for login/signup — brute-force and credential-stuffing protection.
// Keyed by IP (default), so it throttles per-attacker, not per-account.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // only count failed attempts toward the limit
    handler: rateLimitHandler,
});
