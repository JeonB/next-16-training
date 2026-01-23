import { NextRequest } from "next/server";
import type {
  User,
  CreateUserInput,
  UserListResponse,
  ApiResponse,
} from "@/lib/types/user";
import { createErrorResponse } from "@/lib/utils/api-error";
import {
  createValidationError,
  createDuplicateEmailError,
} from "@/lib/utils/error-handler";
import {
  applySearch,
  applyPagination,
  validateEmailUniqueness,
  generateUserId,
  isValidEmail,
  isValidName,
  isValidRole,
} from "@/lib/utils/user-helpers";
import { revalidateTag } from "next/cache";
import { usersStore } from "@/lib/data/users-store";

/**
 * GET /api/users
 * 사용자 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;

    // 검색 필터링
    const filteredUsers = applySearch(usersStore, search);

    // 페이지네이션
    const paginatedUsers = applyPagination(filteredUsers, page, limit);

    const response: ApiResponse<UserListResponse> = {
      success: true,
      data: {
        users: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit,
      },
    };

    return Response.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * POST /api/users
 * 새 사용자 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserInput = await request.json();

    // 입력 검증
    if (!body.name || !body.email) {
      throw createValidationError("name/email", "Name and email are required");
    }

    if (!isValidName(body.name)) {
      throw createValidationError("name", "Name must be between 1 and 100 characters");
    }

    if (!isValidEmail(body.email)) {
      throw createValidationError("email", "Invalid email format");
    }

    // 역할 검증
    if (body.role && !isValidRole(body.role)) {
      throw createValidationError("role", "Invalid role");
    }

    // 이메일 중복 확인
    if (!validateEmailUniqueness(body.email, usersStore)) {
      throw createDuplicateEmailError();
    }

    // 새 사용자 생성 (ID 생성 로직 통일)
    const newUser: User = {
      id: generateUserId(),
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    usersStore.push(newUser);

    // 캐시 무효화
    revalidateTag("users", "max");
    revalidateTag("users-list", "max");

    const response: ApiResponse<User> = {
      success: true,
      data: newUser,
      message: "User created successfully",
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
