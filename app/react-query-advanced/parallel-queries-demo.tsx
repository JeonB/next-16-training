"use client";

import { useQueries } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Parallel Queries 데모
 * 여러 쿼리를 동시에 실행하고 관리
 */

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

// 개별 쿼리 함수들
async function fetchUser(userId: number): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));
  // 실제로는 서버 API 호출
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    phone: `010-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
  };
}

async function fetchTodos(userId: number): Promise<Todo[]> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));
  // 실제로는 서버 API 호출
  return Array.from({ length: 3 }, (_, i) => ({
    id: userId * 10 + i,
    title: `Todo ${i + 1} for User ${userId}`,
    completed: Math.random() > 0.5,
    userId,
  }));
}

export function ParallelQueriesDemo() {
  const [userIds] = useState([1, 2, 3]);

  // useQueries: 여러 쿼리를 동시에 실행
  const userQueries = useQueries({
    queries: userIds.map((userId) => ({
      queryKey: ["user", userId],
      queryFn: () => fetchUser(userId),
    })),
  });

  // 각 사용자의 Todos를 가져오는 병렬 쿼리
  const todoQueries = useQueries({
    queries: userIds.map((userId) => ({
      queryKey: ["todos", userId],
      queryFn: () => fetchTodos(userId),
      enabled: userQueries.some((q, idx) => idx === userIds.indexOf(userId) && q.isSuccess), // 사용자 데이터가 로드된 후에만 실행
    })),
  });

  const allUsersLoaded = userQueries.every((q) => q.isSuccess);
  const allTodosLoaded = todoQueries.every((q) => q.isSuccess);
  const isLoading = userQueries.some((q) => q.isLoading);
  const hasError = userQueries.some((q) => q.isError);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useQueries의 특징:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>여러 쿼리를 동적으로 생성하고 실행</li>
          <li>각 쿼리는 독립적으로 관리됨</li>
          <li>배열 형태로 결과 반환 (각 쿼리별 상태 접근 가능)</li>
          <li>각 쿼리에 개별 옵션 설정 가능 (enabled, staleTime 등)</li>
          <li>병렬 실행으로 성능 향상</li>
        </ul>
      </div>

      {/* 상태 표시 */}
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Users 로딩:</span>
            <span className={`ml-2 ${allUsersLoaded ? "text-green-500" : isLoading ? "text-blue-500" : "text-gray-500"}`}>
              {allUsersLoaded ? "완료" : isLoading ? "로딩 중..." : "대기"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Todos 로딩:</span>
            <span className={`ml-2 ${allTodosLoaded ? "text-green-500" : "text-blue-500"}`}>
              {allTodosLoaded ? "완료" : "로딩 중..."}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">에러:</span>
            <span className={`ml-2 ${hasError ? "text-red-500" : "text-green-500"}`}>
              {hasError ? "발생" : "없음"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">총 쿼리:</span>
            <span className="ml-2">{userIds.length * 2}개</span>
          </div>
        </div>
      </div>

      {/* 사용자 및 Todos 목록 */}
      <div className="space-y-4">
        {userQueries.map((userQuery, index) => {
          const userId = userIds[index];
          const todosQuery = todoQueries[index];

          if (userQuery.isLoading) {
            return (
              <div key={userId} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            );
          }

          if (userQuery.isError) {
            return (
              <div key={userId} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                <p className="text-red-700 dark:text-red-400">
                  User {userId} 로딩 실패
                </p>
              </div>
            );
          }

          const user = userQuery.data;
          if (!user) return null;

          return (
            <div key={userId} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{user.phone}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Todos:</h4>
                {todosQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground">로딩 중...</div>
                ) : todosQuery.isError ? (
                  <div className="text-sm text-red-500">Todos 로딩 실패</div>
                ) : todosQuery.data && todosQuery.data.length > 0 ? (
                  <ul className="space-y-1">
                    {todosQuery.data.map((todo) => (
                      <li
                        key={todo.id}
                        className={`text-sm ${
                          todo.completed
                            ? "line-through text-gray-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {todo.completed ? "✓" : "○"} {todo.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">Todos가 없습니다.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">실전 활용:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>대시보드: 여러 위젯 데이터 동시 로딩</li>
          <li>상세 페이지: 관련 데이터 병렬 로딩</li>
          <li>리스트 페이지: 각 항목의 추가 정보 로딩</li>
          <li>동적 쿼리: 사용자 선택에 따라 쿼리 동적 생성</li>
        </ul>
      </div>
    </div>
  );
}

