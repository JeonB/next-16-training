/**
 * 사용자 관련 공통 유틸리티 함수
 * Route Handler와 Server Action에서 공통으로 사용
 */

import type { User } from "@/lib/types/user";

/**
 * 사용자 목록에서 검색 필터링 적용
 * @param users - 필터링할 사용자 목록
 * @param search - 검색어 (선택적)
 * @returns 필터링된 사용자 목록
 */
export function applySearch(users: User[], search?: string): User[] {
  if (!search || search.trim().length === 0) {
    return users;
  }

  const lowered = search.toLowerCase().trim();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowered) ||
      user.email.toLowerCase().includes(lowered)
  );
}

/**
 * 이메일 중복 검사
 * @param email - 검사할 이메일
 * @param users - 사용자 목록
 * @param excludeUserId - 제외할 사용자 ID (수정 시 사용)
 * @returns 중복 여부
 */
export function validateEmailUniqueness(
  email: string,
  users: User[],
  excludeUserId?: string
): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  return !users.some(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.id !== excludeUserId
  );
}

/**
 * 새로운 사용자 ID 생성
 * UUID v4 사용
 * @returns 생성된 사용자 ID
 */
export function generateUserId(): string {
  return crypto.randomUUID();
}

/**
 * 페이지네이션 적용
 * @param items - 페이지네이션할 항목 목록
 * @param page - 페이지 번호 (1부터 시작)
 * @param limit - 페이지당 항목 수
 * @returns 페이지네이션된 항목 목록
 */
export function applyPagination<T>(
  items: T[],
  page: number,
  limit: number
): T[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return items.slice(startIndex, endIndex);
}

/**
 * 사용자 역할 유효성 검사
 * @param role - 검사할 역할
 * @returns 유효한 역할인지 여부
 */
export function isValidRole(
  role: string
): role is User["role"] {
  return role === "admin" || role === "user" || role === "guest";
}

/**
 * 이메일 형식 검증
 * @param email - 검증할 이메일
 * @returns 유효한 이메일 형식인지 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * 사용자 이름 검증
 * @param name - 검증할 이름
 * @returns 유효한 이름인지 여부
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}
