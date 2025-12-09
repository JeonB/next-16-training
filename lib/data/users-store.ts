/**
 * 공유 사용자 데이터 저장소
 * 실제 프로덕션에서는 데이터베이스나 외부 API를 사용합니다.
 */

import type { User } from "@/lib/types/user";

// 메모리 기반 임시 데이터 저장소
export const usersStore: User[] = [
  {
    id: "1",
    name: "홍길동",
    email: "hong@example.com",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "김철수",
    email: "kim@example.com",
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
