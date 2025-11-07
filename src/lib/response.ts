export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: { message: string; statusCode: number } | null;
}

export function successResponse(data: any) {
  return { success: true, data, error: null };
}

export function errorResponse(message: string, statusCode = 400) {
  return { success: false, data: null, error: { message, statusCode } };
}
