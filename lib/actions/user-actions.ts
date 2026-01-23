"use server";

import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserListResponse,
} from "@/lib/types/user";
import { usersStore } from "@/lib/data/users-store";
import { revalidatePath, revalidateTag } from "next/cache";
import { apiGet } from "../utils/api-client";
import {
  applySearch,
  applyPagination,
  validateEmailUniqueness,
  generateUserId,
  isValidEmail,
  isValidName,
  isValidRole,
} from "../utils/user-helpers";
import {
  createServerActionError,
  createValidationError,
  createDuplicateEmailError,
  createUserNotFoundError,
} from "../utils/error-handler";

const USERS_TAG = "users";
const USERS_LIST_TAG = "users-list";

export interface UserActionResult {
  ok: boolean;
  message?: string;
}

const notEmptyString = (
  value: FormDataEntryValue | null
): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toCreateInput = (formData: FormData): CreateUserInput | null => {
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");

  if (!notEmptyString(name) || !notEmptyString(email)) {
    return null;
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  // 입력 검증
  if (!isValidName(trimmedName)) {
    return null;
  }

  if (!isValidEmail(trimmedEmail)) {
    return null;
  }

  return {
    name: trimmedName,
    email: trimmedEmail,
    role:
      role && typeof role === "string" && isValidRole(role)
        ? role
        : "user",
  };
};

const toUpdateInput = (formData: FormData): UpdateUserInput => {
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");

  const nextInput: UpdateUserInput = {};

  if (notEmptyString(name)) {
    const trimmedName = name.trim();
    if (isValidName(trimmedName)) {
      nextInput.name = trimmedName;
    }
  }

  if (notEmptyString(email)) {
    const trimmedEmail = email.trim();
    if (isValidEmail(trimmedEmail)) {
      nextInput.email = trimmedEmail;
    }
  }

  if (role && typeof role === "string" && isValidRole(role)) {
    nextInput.role = role;
  }

  return nextInput;
};

const revalidateBff = (id?: string) => {
  revalidateTag(USERS_TAG, "max");
  revalidateTag(USERS_LIST_TAG, "max");
  if (id) {
    revalidateTag(`user-${id}`, "max");
  }
  revalidatePath("/bff-demo");
  revalidatePath("/api/users");
};

export async function getUserList(filters: { page: number; limit: number }) {
  // 서버 액션에서 직접 데이터 페칭
  return await apiGet<UserListResponse>(
    `/api/users?page=${filters.page}&limit=${filters.limit}`
  );
}

export async function getUsers(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<UserListResponse> {
  const filtered = applySearch(usersStore, search);
  const paginatedUsers = applyPagination(filtered, page, limit);

  return {
    users: paginatedUsers,
    total: filtered.length,
    page,
    limit,
  };
}

export async function getUserById(id: string): Promise<User> {
  const user = usersStore.find((u) => u.id === id);
  if (!user) {
    throw createUserNotFoundError();
  }
  return user;
}

export async function createUserAction(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  try {
    const input = toCreateInput(formData);

    if (!input) {
      return createServerActionError(
        createValidationError("name/email", "이름과 이메일은 필수이며 올바른 형식이어야 합니다.")
      );
    }

    if (!validateEmailUniqueness(input.email, usersStore)) {
      return createServerActionError(createDuplicateEmailError());
    }

    const newUser: User = {
      id: generateUserId(),
      name: input.name,
      email: input.email,
      role: input.role ?? "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    usersStore.push(newUser);
    revalidateBff();

    return { ok: true, message: "사용자가 생성되었습니다." };
  } catch (error) {
    return createServerActionError(error, "사용자 생성 중 오류가 발생했습니다.");
  }
}

export async function updateUserAction(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  try {
    const id = formData.get("id");
    if (!notEmptyString(id)) {
      return createServerActionError(
        createValidationError("id", "사용자 ID가 없습니다.")
      );
    }

    const userIndex = usersStore.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return createServerActionError(createUserNotFoundError());
    }

    const input = toUpdateInput(formData);

    // 입력값이 없는 경우
    if (Object.keys(input).length === 0) {
      return createServerActionError(
        createValidationError("input", "수정할 정보가 없습니다.")
      );
    }

    // 이메일 변경 시 중복 검사
    if (input.email && input.email !== usersStore[userIndex].email) {
      if (!validateEmailUniqueness(input.email, usersStore, id)) {
        return createServerActionError(createDuplicateEmailError());
      }
    }

    usersStore[userIndex] = {
      ...usersStore[userIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    revalidateBff(id);
    return { ok: true, message: "사용자 정보를 수정했습니다." };
  } catch (error) {
    return createServerActionError(error, "사용자 수정 중 오류가 발생했습니다.");
  }
}

export async function deleteUserAction(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  try {
    const id = formData.get("id");
    if (!notEmptyString(id)) {
      return createServerActionError(
        createValidationError("id", "사용자 ID가 없습니다.")
      );
    }

    const userIndex = usersStore.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return createServerActionError(createUserNotFoundError());
    }

    usersStore.splice(userIndex, 1);
    revalidateBff(id);

    return { ok: true, message: "사용자를 삭제했습니다." };
  } catch (error) {
    return createServerActionError(error, "사용자 삭제 중 오류가 발생했습니다.");
  }
}
