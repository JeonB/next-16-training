/**
 * 사용자 관련 React Query 쿼리 및 뮤테이션 설정
 * TanStack Query v5 최신 문법 사용
 */

import { queryOptions } from "@tanstack/react-query";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserListResponse,
} from "@/lib/types/user";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/utils/api-client";

/**
 * 구조화된 쿼리 키 팩토리
 * 계층적 구조로 쿼리 무효화 범위 제어
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: { page: number; limit: number; search?: string }) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
} as const;

/**
 * 사용자 목록 조회 쿼리 옵션
 */
export function userListOptions(filters: {
  page: number;
  limit: number;
  search?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  });
  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  return queryOptions({
    queryKey: userKeys.list(filters),
    queryFn: () => apiGet<UserListResponse>(`/api/users?${searchParams}`),
    staleTime: 60 * 1000, // 1분간 fresh 상태 유지
  });
}

/**
 * 사용자 상세 조회 쿼리 옵션
 */
export function userDetailOptions(id: string) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => apiGet<User>(`/api/users/${id}`),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
}

/**
 * 사용자 생성 뮤테이션 함수
 * useMutation에서 직접 사용할 수 있도록 함수만 반환
 */
export function createUserMutationFn(input: CreateUserInput) {
  return apiPost<User>("/api/users", input);
}

/**
 * 사용자 수정 뮤테이션 함수
 */
export function updateUserMutationFn({
  id,
  input,
}: {
  id: string;
  input: UpdateUserInput;
}) {
  return apiPut<User>(`/api/users/${id}`, input);
}

/**
 * 사용자 삭제 뮤테이션 함수
 */
export function deleteUserMutationFn(id: string) {
  return apiDelete<User>(`/api/users/${id}`);
}
