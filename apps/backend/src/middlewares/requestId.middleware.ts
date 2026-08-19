import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
