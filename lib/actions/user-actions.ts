"use server";

import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserListResponse,
} from "@/lib/types/user";
import { usersStore } from "@/lib/data/users-store";
import { revalidatePath, revalidateTag } from "next/cache";

const USERS_TAG = "users";
const USERS_LIST_TAG = "users-list";

export interface UserActionResult {
  ok: boolean;
  message?: string;
}

const notEmptyString = (value: FormDataEntryValue | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toCreateInput = (formData: FormData): CreateUserInput | null => {
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");

  if (!notEmptyString(name) || !notEmptyString(email)) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim(),
    role:
      role && typeof role === "string"
        ? (role as CreateUserInput["role"])
        : "user",
  };
};

const toUpdateInput = (formData: FormData): UpdateUserInput => {
  const name = formData.get("name");
  const email = formData.get("email");
  const role = formData.get("role");

  const nextInput: UpdateUserInput = {};

  if (notEmptyString(name)) nextInput.name = name.trim();
  if (notEmptyString(email)) nextInput.email = email.trim();
  if (role && typeof role === "string")
    nextInput.role = role as UpdateUserInput["role"];

  return nextInput;
};

const applySearch = (list: User[], search?: string) => {
  if (!search) return list;
  const lowered = search.toLowerCase();
  return list.filter(
    (user) =>
      user.name.toLowerCase().includes(lowered) ||
      user.email.toLowerCase().includes(lowered)
  );
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

export async function getUsers(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<UserListResponse> {
  const filtered = applySearch(usersStore, search);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

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
    throw new Error("User not found");
  }
  return user;
}

export async function createUserAction(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  const input = toCreateInput(formData);

  if (!input) {
    return { ok: false, message: "이름과 이메일은 필수입니다." };
  }

  const isDuplicate = usersStore.some(
    (user) => user.email.toLowerCase() === input.email.toLowerCase()
  );
  if (isDuplicate) {
    return { ok: false, message: "이미 존재하는 이메일입니다." };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role ?? "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  usersStore.push(newUser);
  revalidateBff();

  return { ok: true, message: "사용자가 생성되었습니다." };
}

export async function updateUserAction(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  const id = formData.get("id");
  if (!notEmptyString(id)) {
    return { ok: false, message: "사용자 ID가 없습니다." };
  }

  const userIndex = usersStore.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return { ok: false, message: "사용자를 찾을 수 없습니다." };
  }

  const input = toUpdateInput(formData);

  if (input.email && input.email !== usersStore[userIndex].email) {
    const duplicate = usersStore.some(
      (u) => u.email.toLowerCase() === input.email?.toLowerCase() && u.id !== id
    );
    if (duplicate) {
      return { ok: false, message: "이미 존재하는 이메일입니다." };
    }
  }

  usersStore[userIndex] = {
    ...usersStore[userIndex],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  revalidateBff(id);
  return { ok: true, message: "사용자 정보를 수정했습니다." };
}

export async function deleteUserAction(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  const id = formData.get("id");
  if (!notEmptyString(id)) {
    return { ok: false, message: "사용자 ID가 없습니다." };
  }

  const userIndex = usersStore.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return { ok: false, message: "사용자를 찾을 수 없습니다." };
  }

  usersStore.splice(userIndex, 1);
  revalidateBff(id);

  return { ok: true, message: "사용자를 삭제했습니다." };
}
