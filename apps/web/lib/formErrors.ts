import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./apiClient";

/**
 * Applies a backend ApiError's structural field errors (from Zod validation
 * — errorHandler.ts's ZodError/ApiValidationError branches, the only cases
 * that actually carry `errors: [{ field, message }]`) onto a react-hook-form
 * instance via `setError`, so they render under the right input instead of
 * as a generic banner. Returns true if at least one field error was applied.
 *
 * Business-rule errors (plain `ApiError`s like "User already exists" or
 * "Invalid email or password") carry NO field attribution from the backend
 * — errorHandler.ts only attaches `errors[]` for Zod/ApiValidationError.
 * Those need a call-site-specific mapping; see signup/page.tsx for the one
 * case (409 on signup) worth doing that for.
 */
export function applyApiFieldErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(err instanceof ApiError) || err.fieldErrors.length === 0) return false;
  for (const { field, message } of err.fieldErrors) {
    setError(field as Path<T>, { type: "server", message });
  }
  return true;
}
