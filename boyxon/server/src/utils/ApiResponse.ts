export interface ApiResponseBody<T> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export function ok<T>(data: T, message = 'OK'): ApiResponseBody<T> {
  return { success: true, message, data };
}

export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = 'OK',
): ApiResponseBody<T[]> {
  return {
    success: true,
    message,
    data,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  };
}
