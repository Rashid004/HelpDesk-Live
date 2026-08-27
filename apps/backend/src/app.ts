import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { httpLogger } from "./config/logger.js";
import { initializeS3 } from "./config/s3.js";
import { errorHandler, type CustomError } from "./middlewares/errorHandler.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import apiRoutes from "./modules/index.js";
import { initSentry, Sentry } from "./lib/sentry.js";

initSentry(); // must run before anything else touches Express

const app: Express = express();

app.use(requestIdMiddleware);
app.use(httpLogger);
app.use(helmet());

if (env.NODE_ENV === "production" && !env.CORS_ORIGIN) {
  throw new Error("CRITICAL: CORS_ORIGIN must be set in production");
}

const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",").map((origin: string) => origin.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowed =
        !origin ||
        allowedOrigins.includes(origin) ||
        (env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin));

      isAllowed ? callback(null, true) : callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "ok" });
});

app.use("/api/v1", apiLimiter, apiRoutes);

// app.get("/debug-sentry", function mainHandler(_req: Request, _res: Response) {
//   throw new Error("My first Sentry error!");
// });

app.use((req: Request, _res: Response, next: NextFunction) => {
  const err: CustomError = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

initializeS3();

export default app;