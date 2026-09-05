import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { clearSession, getAccessToken, refreshAccessToken } from "./session";
import type { PaginationMeta } from "./types";

/**
 * Single typed HTTP client for the real backend (everything except the
 * login/signup/refresh/logout flows, which go through app/api/auth/* — see
 * lib/session.ts for why). Built on axios, matching the project's existing
 * choice (already a dependency, used the same way in the auth-only pass this
 * file replaces).
 *
 * Responsibilities kept here so no call site hand-rolls them:
 *  - attaches the in-memory access token to every request
 *  - on a 401, refreshes the access token exactly once and replays the
 *    original request; if the refresh itself fails, clears the session and
 *    sends the user to /signin
 *  - normalizes every failure into one `ApiError` shape, parsed from the
 *    backend's `{ success, message, error, errors }` envelope
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

  /** The backend's message for one specific field, if it flagged one (e.g. "email"). */
  fieldError(field: string): string | undefined {
    return this.fieldErrors.find((e) => e.field === field)?.message;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ApiFieldError[];
  meta?: { timestamp: string; requestId?: string; pagination?: PaginationMeta };
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

function toApiError(error: AxiosError<ApiEnvelope<unknown>>): ApiError {
  const res = error.response;
  const envelope = res?.data;
  const message =
    envelope?.message ||
    envelope?.errors?.map((e) => e.message).join(", ") ||
    error.message ||
    "Something went wrong. Please try again.";
  return new ApiError(message, res?.status ?? 0, envelope?.errors ?? []);
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = config?.url?.includes("/auth/refresh");

    if (status === 401 && config && !config._retried && !isRefreshCall) {
      config._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.set("Authorization", `Bearer ${newToken}`);
        return axiosClient(config);
      }
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(toApiError(error));
  },
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await axiosClient.request<ApiEnvelope<T>>(config);
  return res.data.data as T;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

async function requestPaginated<T>(config: AxiosRequestConfig): Promise<Paginated<T>> {
  const res = await axiosClient.request<ApiEnvelope<T[]>>(config);
  const items = res.data.data ?? [];
  return {
    items,
    pagination: res.data.meta?.pagination ?? {
      page: 1,
      limit: items.length,
      total: items.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    request<T>({ method: "GET", url, params }),
  getPaginated: <T>(url: string, params?: Record<string, unknown>): Promise<Paginated<T>> =>
    requestPaginated<T>({ method: "GET", url, params }),
  post: <T>(url: string, data?: unknown): Promise<T> => request<T>({ method: "POST", url, data }),
  patch: <T>(url: string, data?: unknown): Promise<T> => request<T>({ method: "PATCH", url, data }),
  delete: <T>(url: string): Promise<T> => request<T>({ method: "DELETE", url }),
};

/**
 * For the three session flows that must go through our own Next.js route
 * handlers instead of straight to the backend (login/signup/refresh) — see
 * lib/session.ts. Same ApiError shape as everything else above.
 */
export async function postAuthProxy<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error. Check your connection and try again.", 0);
  }

  const envelope = (await res.json().catch(() => null)) as
    | ({ success?: boolean; message?: string; errors?: ApiFieldError[] } & Partial<T>)
    | null;

  if (!res.ok || !envelope) {
    throw new ApiError(
      envelope?.message ?? "Something went wrong. Please try again.",
      res.status,
      envelope?.errors ?? [],
    );
  }
  return envelope as T;
}
