import { NextRequest } from "next/server";
import type { User, UpdateUserInput, ApiResponse } from "@/lib/types/user";
import { createErrorResponse, createApiError } from "@/lib/utils/api-error";
import { revalidateTag, revalidatePath } from "next/cache";
import { usersStore } from "@/lib/data/users-store";

/**
 * GET /api/users/[id]
 * 특정 사용자 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = usersStore.find((u) => u.id === id);

    if (!user) {
      throw createApiError(404, "User not found", "USER_NOT_FOUND");
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user,
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
 * PUT /api/users/[id]
 * 사용자 정보 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateUserInput = await request.json();

    const userIndex = usersStore.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw createApiError(404, "User not found", "USER_NOT_FOUND");
    }

    // 이메일 변경 시 중복 확인
    if (body.email && body.email !== usersStore[userIndex].email) {
      if (usersStore.some((u) => u.email === body.email && u.id !== id)) {
        throw createApiError(409, "Email already exists", "DUPLICATE_EMAIL");
      }
    }

    // 사용자 정보 업데이트
    const updatedUser: User = {
      ...usersStore[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    usersStore[userIndex] = updatedUser;

    // 캐시 무효화
    revalidateTag("users", "user-${id}");
    revalidatePath("/api/users");
    revalidatePath(`/api/users/${id}`);

    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    };

    return Response.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * DELETE /api/users/[id]
 * 사용자 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userIndex = usersStore.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw createApiError(404, "User not found", "USER_NOT_FOUND");
    }

    const deletedUser = usersStore[userIndex];
    usersStore.splice(userIndex, 1);

    // 캐시 무효화
    revalidateTag("users", `user-${id}`);
    revalidatePath("/api/users");

    const response: ApiResponse<User> = {
      success: true,
      data: deletedUser,
      message: "User deleted successfully",
    };

    return Response.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}
