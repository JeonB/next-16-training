import { NextRequest } from "next/server";
import type { User, UpdateUserInput, ApiResponse } from "@/lib/types/user";
import { createErrorResponse } from "@/lib/utils/api-error";
import {
  createUserNotFoundError,
  createDuplicateEmailError,
  createValidationError,
} from "@/lib/utils/error-handler";
import {
  validateEmailUniqueness,
  isValidEmail,
  isValidName,
  isValidRole,
} from "@/lib/utils/user-helpers";
import { revalidateTag, revalidatePath } from "next/cache";
import { usersStore } from "@/lib/data/users-store";

/**
 * GET /api/users/[id]
 * 특정 사용자 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = usersStore.find((u) => u.id === id);

    if (!user) {
      throw createUserNotFoundError();
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateUserInput = await _request.json();

    const userIndex = usersStore.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw createUserNotFoundError();
    }

    // 입력 검증
    if (body.name && !isValidName(body.name)) {
      throw createValidationError("name", "Name must be between 1 and 100 characters");
    }

    if (body.email && !isValidEmail(body.email)) {
      throw createValidationError("email", "Invalid email format");
    }

    if (body.role && !isValidRole(body.role)) {
      throw createValidationError("role", "Invalid role");
    }

    // 이메일 변경 시 중복 확인
    if (body.email && body.email !== usersStore[userIndex].email) {
      if (!validateEmailUniqueness(body.email, usersStore, id)) {
        throw createDuplicateEmailError();
      }
    }

    // 사용자 정보 업데이트
    const updatedUser: User = {
      ...usersStore[userIndex],
      ...(body.name && { name: body.name.trim() }),
      ...(body.email && { email: body.email.trim() }),
      ...(body.role && { role: body.role }),
      updatedAt: new Date().toISOString(),
    };

    usersStore[userIndex] = updatedUser;

    // 캐시 무효화
    revalidateTag("users", "max");
    revalidateTag(`user-${id}`, "max");
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userIndex = usersStore.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw createUserNotFoundError();
    }

    const deletedUser = usersStore[userIndex];
    usersStore.splice(userIndex, 1);

    // 캐시 무효화
    revalidateTag("users", "max");
    revalidateTag(`user-${id}`, "max");
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
