export interface PaginationMeta {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  pagination?: PaginationMeta;
  error: { message: string; statusCode: number } | null;
}

export function successResponse<T>(
  data: T,
  pagination?: PaginationMeta
): ApiResponse<T> {
  return {
    success: true,
    data,
    pagination,
    error: null,
  };
}

export function errorResponse(
  message: string,
  statusCode = 400
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: { message, statusCode },
  };
}
