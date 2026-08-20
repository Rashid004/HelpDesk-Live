import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { httpLogger } from "./config/logger.js";
import { initializeS3 } from "./config/s3.js";
import { errorHandler, type CustomError } from "./middlewares/errorHandler.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import userRoutes from "./modules/users/user.routes.js";

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
        (env.NODE_ENV !== "production" &&
          /^http:\/\/localhost:\d+$/.test(origin));

      isAllowed
        ? callback(null, true)
        : callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/users", userRoutes);

app.use((req: Request, _res: Response, next: NextFunction) => {
  const err: CustomError = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`,
  );
  err.statusCode = 404;
  next(err);
});

app.use(errorHandler);

initializeS3();

export default app;
