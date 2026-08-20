import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z
      .enum(["development", "staging", "production"])
      .default("development"),

    // Database
    MONGODB_URI: z.string().min(10, "MongoDB connection URI is required"),

    // Redis (queues, caching, distributed locks) — optional in dev; queue/lock
    // features degrade if unset, boot doesn't fail
    REDIS_URL: z.string().optional(),

    // AWS S3 — optional in dev; file upload/storage degrades if unset,
    // boot doesn't fail
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET_NAME: z.string().optional(),

    // JWT — access token is short-lived and verified on every request;
    // refresh token is long-lived, stored hashed in DB, and rotated on use.
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    // CORS (optional for development)
    CORS_ORIGIN: z.string().optional(),

    // Firebase Cloud Messaging (push notifications) — optional in dev; push
    // sending degrades if unset, boot doesn't fail
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),

    // Resend (transactional email) — optional in dev; email sending degrades
    // if unset, boot doesn't fail
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().default("Helpdesk <noreply@helpdesk.com>"),

    // Frontend base URL — used to build links embedded in emails
    FRONTEND_URL: z.string().default("http://localhost:5173"),

    // Logging — "info" in production, "debug" in development/staging
    LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default(process.env.NODE_ENV === "production" ? "info" : "debug"),
  },
  // Runtime environment - what @t3-oss/env-core will read from
  runtimeEnv: process.env,

  // Skip validation during build (optional)
  skipValidation: process.env.NODE_ENV === "test",

  // Custom error message for missing variables
  onValidationError: (error: unknown) => {
    console.error("❌ Invalid environment variables:", error);
    throw new Error("Invalid environment variables");
  },
  // Called when validation passes
  onInvalidAccess: (variable: any) => {
    throw new Error(
      `❌ Attempted to access server-side environment variable '${variable}' on the client`,
    );
  },
});
