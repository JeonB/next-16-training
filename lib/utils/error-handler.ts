/**
 * 통합 에러 처리 유틸리티
 * Route Handler와 Server Action에서 일관된 에러 처리
 */

import { createApiError, type ApiError } from "./api-error";
import type { ApiResponse } from "@/lib/types/user";

/**
 * 사용자 친화적인 에러 메시지 매핑
 */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "입력값이 올바르지 않습니다.",
  DUPLICATE_EMAIL: "이미 존재하는 이메일입니다.",
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  REQUIRED_FIELD: "필수 입력 항목이 누락되었습니다.",
  INVALID_EMAIL: "올바른 이메일 형식이 아닙니다.",
  INVALID_NAME: "이름은 1자 이상 100자 이하여야 합니다.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
  INTERNAL_ERROR: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
};

/**
 * 에러 코드에 따른 사용자 친화적인 메시지 반환
 * @param code - 에러 코드
 * @param defaultMessage - 기본 메시지 (코드가 없을 경우)
 * @returns 사용자 친화적인 메시지
 */
export function getUserFriendlyMessage(
  code?: string,
  defaultMessage?: string
): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  return defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Server Action용 에러 결과 생성
 * @param error - 에러 객체
 * @param defaultMessage - 기본 메시지
 * @returns UserActionResult 형식의 에러 결과
 */
export function createServerActionError(
  error: unknown,
  defaultMessage?: string
): { ok: false; message: string } {
  if (error instanceof Error && error.name === "ApiError") {
    const apiError = error as ApiError;
    return {
      ok: false,
      message: getUserFriendlyMessage(apiError.code, apiError.message),
    };
  }

  if (error instanceof Error) {
    return {
      ok: false,
      message: getUserFriendlyMessage(undefined, error.message),
    };
  }

  return {
    ok: false,
    message: getUserFriendlyMessage(undefined, defaultMessage),
  };
}

/**
 * Route Handler용 에러 응답 생성
 * @param error - 에러 객체
 * @param defaultMessage - 기본 메시지
 * @returns ApiResponse 형식의 에러 응답
 */
export function createRouteHandlerError(
  error: unknown,
  defaultMessage?: string
): ApiResponse<never> {
  if (error instanceof Error && error.name === "ApiError") {
    const apiError = error as ApiError;
    return {
      success: false,
      error: getUserFriendlyMessage(apiError.code, apiError.message),
      code: apiError.code,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: getUserFriendlyMessage(undefined, error.message),
      code: "INTERNAL_ERROR",
    };
  }

  return {
    success: false,
    error: getUserFriendlyMessage(undefined, defaultMessage),
    code: "UNKNOWN_ERROR",
  };
}

/**
 * 입력 검증 에러 생성
 * @param field - 필드명
 * @param message - 커스텀 메시지
 * @returns ApiError
 */
export function createValidationError(
  field?: string,
  message?: string
): ApiError {
  const errorMessage = message || `Invalid ${field || "input"}`;
  return createApiError(400, errorMessage, "VALIDATION_ERROR");
}

/**
 * 중복 이메일 에러 생성
 * @returns ApiError
 */
export function createDuplicateEmailError(): ApiError {
  return createApiError(
    409,
    ERROR_MESSAGES.DUPLICATE_EMAIL,
    "DUPLICATE_EMAIL"
  );
}

/**
 * 사용자 없음 에러 생성
 * @returns ApiError
 */
export function createUserNotFoundError(): ApiError {
  return createApiError(
    404,
    ERROR_MESSAGES.USER_NOT_FOUND,
    "USER_NOT_FOUND"
  );
}
