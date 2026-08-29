import axios, { AxiosError, type AxiosInstance } from "axios";
import { getAccessToken } from "./session";

/**
 * Shared axios instance for the backend REST API.
 *
 * Backend wraps every response in an envelope:
 *   success:  { success: true,  message, data, meta }
 *   error:    { success: false, message, error?, errors?: [{ field, message }] }
 *
 * The response interceptor unwraps `data` on success and throws a normalized
 * `ApiError` on failure, so callers work with plain payloads.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Attach the access token to every request.
http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: ApiFieldError[];

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ErrorEnvelope {
  message?: string;
  error?: string;
  errors?: ApiFieldError[];
}

// Unwrap `data`; normalize errors.
http.interceptors.response.use(
  (response) => {
    // Resolve callers with the bare payload, not the AxiosResponse.
    const body = response.data;
    if (body && typeof body === "object" && "data" in body) {
      return body.data;
    }
    return body;
  },
  (error: AxiosError<ErrorEnvelope>) => {
    // TODO: on 401, try POST /auth/refresh with the stored refresh token,
    // then replay the original request once. Auth-only wiring skips this
    // for now — a 401 just surfaces to the caller.
    const res = error.response;
    const envelope = res?.data;
    const message =
      envelope?.errors?.map((e) => e.message).join(", ") ||
      envelope?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(
      new ApiError(message, res?.status ?? 0, envelope?.errors ?? []),
    );
  },
);
