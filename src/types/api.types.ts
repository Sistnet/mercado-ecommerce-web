/**
 * API Types - Tipos base para respostas da API
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  errors: Array<{
    code?: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  totalSize: number;
  limit: number;
  offset: number;
  data: T[];
}

export interface ApiResponseModel<T> {
  response: T | null;
  error: ApiError | null;
  isSuccess: boolean;
}
