import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const redis = env.REDIS_URL ? new Redis(env.REDIS_URL) : null;

redis?.on("error", (err: Error) =>
    logger.error({ err }, "Redis connection error"),
);
