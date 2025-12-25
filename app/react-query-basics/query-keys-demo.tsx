"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Query Keys 관리 데모
 * 구조화된 쿼리 키의 중요성과 사용법
 */

interface User {
  id: string;
  name: string;
  email: string;
}

// 구조화된 Query Keys 팩토리 패턴
const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: { page: number; search?: string }) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
} as const;

async function fetchUser(id: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
  };
}

function UserDetail({ userId }: { userId: string }) {
  const query = useQuery({
    queryKey: userKeys.detail(userId),  // 구조화된 키 사용
    queryFn: () => fetchUser(userId),
  });

  if (query.isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-red-700 dark:text-red-400">에러 발생</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-semibold">{query.data.name}</h3>
      <p className="text-sm text-muted-foreground">{query.data.email}</p>
      <p className="text-xs text-muted-foreground mt-2">
        Query Key: {JSON.stringify(userKeys.detail(userId))}
      </p>
    </div>
  );
}

export function QueryKeysDemo() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("1");

  // Query Keys를 활용한 캐시 무효화 예제
  const invalidateAllUsers = () => {
    // 모든 users 관련 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  };

  const invalidateUserLists = () => {
    // 모든 user list 쿼리만 무효화 (detail은 유지)
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  };

  const invalidateSpecificUser = () => {
    // 특정 user detail만 무효화
    queryClient.invalidateQueries({ queryKey: userKeys.detail(selectedUserId) });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">구조화된 Query Keys의 장점:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>계층적 구조로 쿼리를 그룹화 가능</li>
          <li>부분 무효화가 쉬움 (예: 모든 목록만 무효화)</li>
          <li>타입 안전성 확보</li>
          <li>쿼리 키 관리가 체계적</li>
          <li>일관된 네이밍 컨벤션 유지</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          User ID:
          <input
            type="text"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
        <UserDetail userId={selectedUserId} />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Query Keys 구조:</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm">
          <div className="mb-2">
            <span className="text-blue-500">userKeys.all</span>
            <span className="text-gray-500"> → ["users"]</span>
          </div>
          <div className="mb-2 ml-4">
            <span className="text-green-500">userKeys.lists()</span>
            <span className="text-gray-500"> → ["users", "list"]</span>
          </div>
          <div className="mb-2 ml-8">
            <span className="text-purple-500">userKeys.list(filters)</span>
            <span className="text-gray-500"> → ["users", "list", filters]</span>
          </div>
          <div className="mb-2 ml-4">
            <span className="text-green-500">userKeys.details()</span>
            <span className="text-gray-500"> → ["users", "detail"]</span>
          </div>
          <div className="ml-8">
            <span className="text-purple-500">userKeys.detail(id)</span>
            <span className="text-gray-500"> → ["users", "detail", id]</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">캐시 무효화 테스트:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={invalidateAllUsers}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
          >
            모든 Users 무효화
          </button>
          <button
            onClick={invalidateUserLists}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
          >
            User Lists만 무효화
          </button>
          <button
            onClick={invalidateSpecificUser}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
          >
            현재 User만 무효화
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          각 버튼을 클릭하면 해당하는 쿼리들만 무효화되어 자동으로 리페치됩니다.
        </p>
      </div>
    </div>
  );
}

