/**
 * 타입 안전한 API 클라이언트 유틸리티
 * BFF 패턴에서 내부 API 호출 시 사용
 */

import type { ApiResponse } from "@/lib/types/user";
import { createApiError } from "./api-error";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

/**
 * 내부 API 호출을 위한 타입 안전한 fetch 래퍼
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw createApiError(
        response.status,
        data.error || data.message || "Request failed",
        data.error
      );
    }

    if (!data.data) {
      throw createApiError(500, "No data in response", "NO_DATA");
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error && error.name === "ApiError") {
      throw error;
    }
    throw createApiError(500, "Network error", "NETWORK_ERROR");
  }
}

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "GET" });
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT 요청 헬퍼
 */
export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}
