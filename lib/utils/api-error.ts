/**
 * API 에러 처리 유틸리티
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createApiError(
  statusCode: number,
  message: string,
  code?: string
): ApiError {
  return new ApiError(statusCode, message, code);
}

export function handleApiError(error: unknown): {
  statusCode: number;
  message: string;
  code?: string;
} {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message || "Internal server error",
      code: "INTERNAL_ERROR",
    };
  }

  return {
    statusCode: 500,
    message: "Unknown error occurred",
    code: "UNKNOWN_ERROR",
  };
}

export function createErrorResponse(error: unknown) {
  const { statusCode, message, code } = handleApiError(error);
  return Response.json(
    {
      success: false,
      error: message,
      code,
    },
    { status: statusCode }
  );
}
