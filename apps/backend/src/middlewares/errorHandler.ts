import type { NextFunction, Request, Response } from "express";
import { ApiError, ApiValidationError } from "../utils/ApiError.js";
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
  if (err instanceof ApiValidationError) {
    res.status(422).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      errors: err.validationErrors,
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
    return;
  }

  const customErr = err as CustomError;
  const statusCode = customErr.statusCode ?? 500;

  if (statusCode >= 500) {
    logger.error({ err, url: req.originalUrl }, "Unhandled error");
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : err.message,
  });
}
