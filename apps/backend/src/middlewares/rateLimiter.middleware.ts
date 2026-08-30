import type { Request, Response } from "express";
import rateLimit, { type Store } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../infrastructure/redis.js";
import { ApiResponseHelper } from "../utils/ApiResponse.js";

/**
 * Shared handler so every limiter below returns the same response shape
 * as the rest of the API instead of express-rate-limit's default text body.
 */
function rateLimitHandler(_req: Request, res: Response) {
    res.status(429).json(ApiResponseHelper.error("Too many requests, please try again later"));
}

/**
 * Build a Redis-backed store so the counter is shared across every server
 * instance (ECS tasks behind the ALB) instead of living in one process's
 * memory. Falls back to the default in-memory store when Redis isn't
 * configured (local dev / CI) — acceptable there since it's single-process.
 */
function makeStore(prefix: string): Store | undefined {
    if (!redis) return undefined;
    const client = redis; // narrow: non-null inside the closure below
    return new RedisStore({
        prefix,
        // rate-limit-redis is client-agnostic; hand it a raw command runner.
        sendCommand: (...args: string[]) =>
            client.call(args[0]!, ...args.slice(1)) as Promise<never>,
    });
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

// Ticket creation: 5 per user per minute. Keyed by authenticated user id
// (not IP) — users are logged in, and IP keying would wrongly lump together
// everyone behind the same NAT / corporate proxy.
export const createTicketLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: makeStore("rl:ticket-create:"),
    keyGenerator: (req: Request) => req.user!.id,
    handler: (_req: Request, res: Response) => {
        res
            .status(429)
            .json(
                ApiResponseHelper.error(
                    "Too many tickets created. Please wait before creating another.",
                ),
            );
    },
});
