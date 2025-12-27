"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Custom Hooks 패턴 데모
 * 재사용 가능한 Custom Hooks 만들기
 */

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface CreateUserInput {
  name: string;
  email: string;
  role?: string;
}

// API 함수
async function fetchUser(userId: number): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    role: userId % 2 === 0 ? "admin" : "user",
  };
}

async function createUser(input: CreateUserInput): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: Date.now(),
    name: input.name,
    email: input.email,
    role: input.role || "user",
  };
}

// Custom Hook: 사용자 조회
function useUser(userId: number | null) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId!),
    enabled: userId !== null,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// Custom Hook: 사용자 생성 Mutation
function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Custom Hook: 사용자 목록 (추가 예제)
function useUsers(filters?: { role?: string }) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      // 실제로는 서버 API 호출
      return Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 2 === 0 ? "admin" : "user",
      })).filter((user) => !filters?.role || user.role === filters.role);
    },
    staleTime: 2 * 60 * 1000, // 2분
  });
}

// Custom Hook을 사용하는 컴포넌트
function UserProfile({ userId }: { userId: number | null }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-red-700 dark:text-red-400">사용자를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">{user.name}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-1">{user.email}</p>
      <span className={`px-2 py-1 rounded text-xs ${
        user.role === "admin"
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
      }`}>
        {user.role}
      </span>
    </div>
  );
}

function CreateUserForm() {
  const createUser = useCreateUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(
      { name: name.trim(), email: email.trim() },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
      <div>
        <label className="block text-sm font-medium mb-1">이름:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={createUser.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">이메일:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={createUser.isPending}
        />
      </div>
      <button
        type="submit"
        disabled={createUser.isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {createUser.isPending ? "생성 중..." : "사용자 생성"}
      </button>
      {createUser.isSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400">사용자가 생성되었습니다!</p>
      )}
      {createUser.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">생성 중 오류가 발생했습니다.</p>
      )}
    </form>
  );
}

function UsersList() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <p className="text-muted-foreground">사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-semibold mb-3">사용자 목록:</h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="text-sm">
            {user.name} ({user.email}) - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CustomHooksDemo() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(1);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Custom Hooks의 장점:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>코드 재사용성 향상</li>
          <li>로직과 UI 분리</li>
          <li>테스트 용이성</li>
          <li>타입 안전성</li>
          <li>유지보수성 향상</li>
          <li>일관된 패턴 사용</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">1. useUser Hook 사용:</h3>
          <div className="mb-2">
            <label className="block mb-2 font-medium">
              User ID:
              <input
                type="number"
                min="1"
                max="10"
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                className="ml-2 px-3 py-1 border rounded"
              />
            </label>
          </div>
          <UserProfile userId={selectedUserId} />
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. useCreateUser Hook 사용:</h3>
          <CreateUserForm />
        </div>

        <div>
          <h3 className="font-semibold mb-3">3. useUsers Hook 사용:</h3>
          <UsersList />
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">Best Practices:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>도메인별로 Custom Hooks 분리 (예: useUser, useProduct)</li>
          <li>Query와 Mutation을 함께 제공하는 Hook 만들기</li>
          <li>타입을 명확히 정의</li>
          <li>옵션을 파라미터로 받아 유연성 확보</li>
          <li>관련 쿼리 키를 함께 관리</li>
        </ul>
      </div>
    </div>
  );
}

