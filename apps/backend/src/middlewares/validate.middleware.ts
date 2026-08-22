import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiValidationError } from "../utils/ApiError.js";

type RequestPart = "body" | "query" | "params";

function formatIssues(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const field = issue.path.join(".") || "root";
    (errors[field] ??= []).push(issue.message);
  }
  return errors;
}

export function validate(schema: ZodType, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      throw new ApiValidationError(formatIssues(result.error.issues));
    }
    req[part] = result.data;
    next();
  };
}
