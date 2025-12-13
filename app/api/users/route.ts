import { NextRequest } from "next/server";
import type {
  User,
  CreateUserInput,
  UserListResponse,
  ApiResponse,
} from "@/lib/types/user";
import { createErrorResponse, createApiError } from "@/lib/utils/api-error";
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
    const search = searchParams.get("search") || "";

    // 검색 필터링
    let filteredUsers = usersStore;
    if (search) {
      filteredUsers = usersStore.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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
      throw createApiError(
        400,
        "Name and email are required",
        "VALIDATION_ERROR"
      );
    }

    // 이메일 중복 확인
    if (usersStore.some((user) => user.email === body.email)) {
      throw createApiError(409, "Email already exists", "DUPLICATE_EMAIL");
    }

    // 새 사용자 생성
    const newUser: User = {
      id: String(usersStore.length + 1),
      name: body.name,
      email: body.email,
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
