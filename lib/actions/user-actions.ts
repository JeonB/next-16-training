"use server";

import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserListResponse,
} from "@/lib/types/user";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Server Actions를 통한 사용자 관리
 * BFF 패턴: Server Actions가 내부 API Route를 호출하여 데이터 처리
 */

const API_BASE = "/api/users";

/**
 * 사용자 목록 조회
 */
export async function getUsersAction(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<UserListResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_BASE}?${params.toString()}`, {
      method: "GET",
      next: { tags: ["users"], revalidate: 60 },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch users");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * 특정 사용자 조회
 */
export async function getUserByIdAction(id: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "GET",
      next: { tags: ["users", `user-${id}`], revalidate: 60 },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * 새 사용자 생성
 */
export async function createUserAction(input: CreateUserInput): Promise<User> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create user");
    }

    const data = await response.json();

    // 캐시 무효화
    revalidateTag("users", "users-list");
    revalidatePath("/bff-demo");

    return data.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * 사용자 정보 수정
 */
export async function updateUserAction(
  id: string,
  input: UpdateUserInput
): Promise<User> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update user");
    }

    const data = await response.json();

    // 캐시 무효화
    revalidateTag("users", "users-list");
    revalidateTag(`user-${id}`, `user-${id}`);
    revalidatePath("/bff-demo");
    revalidatePath(`/bff-demo/${id}`);

    return data.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * 사용자 삭제
 */
export async function deleteUserAction(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete user");
    }

    // 캐시 무효화
    revalidateTag("users", "users-list");
    revalidateTag(`user-${id}`, `user-${id}`);
    revalidatePath("/bff-demo");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
