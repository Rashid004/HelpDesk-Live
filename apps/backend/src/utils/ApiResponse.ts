import { z } from "zod";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Alias for backward compatibility
export type PaginationResponseDto = PaginationMeta;

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc";
  search?: string | undefined;
}

// Standard pagination query schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export class ApiResponseHelper {
  static success<T>(
    data: T,
    message: string = "Success",
    meta?: ApiResponse<T>["meta"],
    requestId?: string,
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
        ...meta,
      },
    };
  }

  static error(
    message: string,
    error?: string,
    errors?: ApiResponse["errors"],
  ): ApiResponse<null> {
    return {
      success: false,
      message,
      ...(error !== undefined && { error }),
      ...(errors !== undefined && { errors }),
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message: string = "Success",
    requestId?: string,
  ): ApiResponse<T[]> {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
        pagination,
      },
    };
  }
}
