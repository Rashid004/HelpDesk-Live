import type { NextFunction, Request, Response } from "express";
import { ApiError, ApiValidationError } from "../utils/ApiError.js";
import { ApiResponseHelper } from "../utils/ApiResponse.js";
import { logger } from "../config/logger.js";

export interface CustomError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = (req as Request & { requestId?: string }).requestId;

  if (err instanceof ApiValidationError) {
    res.status(422).json(
      ApiResponseHelper.error(
        err.message,
        err.errorCode,
        Object.entries(err.validationErrors).map(([field, message]) => ({
          field,
          message: Array.isArray(message) ? message.join(", ") : message,
        })),
      ),
    );
    return;
  }

  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json(ApiResponseHelper.error(err.message, err.errorCode));
    return;
  }

  const customErr = err as CustomError;
  const statusCode = customErr.statusCode ?? 500;

  if (statusCode >= 500) {
    logger.error({ err, url: req.originalUrl, requestId }, "Unhandled error");
  }

  res
    .status(statusCode)
    .json(
      ApiResponseHelper.error(
        statusCode >= 500 ? "Internal server error" : err.message,
      ),
    );
}
