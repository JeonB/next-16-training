"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Mutation 기본 사용법 데모
 * useMutation의 핵심 개념 학습
 */

interface CreateUserInput {
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Mutation 함수 (서버 API 호출 시뮬레이션)
async function createUser(input: CreateUserInput): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 실제로는 서버 API 호출
  return {
    id: Date.now().toString(),
    name: input.name,
    email: input.email,
    createdAt: new Date().toISOString(),
  };
}

function UserForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // useMutation 기본 사용법
  const mutation = useMutation({
    mutationFn: createUser,  // 서버에 데이터를 보내는 함수
    onSuccess: (data) => {
      // 성공 시 실행할 콜백
      console.log("User created:", data);

      // 관련 쿼리 캐시 무효화 (선택사항)
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // 폼 초기화
      setName("");
      setEmail("");
    },
    onError: (error) => {
      // 에러 발생 시 실행할 콜백
      console.error("Error creating user:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutation.mutate({  // mutate 함수로 mutation 실행
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">이름:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            disabled={mutation.isPending}
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
            disabled={mutation.isPending}
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "생성 중..." : "사용자 생성"}
        </button>
      </form>

      {/* Mutation 상태 표시 */}
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <h3 className="font-semibold mb-2">Mutation 상태:</h3>
        <ul className="text-sm space-y-1">
          <li>
            <code className="bg-white dark:bg-gray-800 px-1 rounded">isPending</code>:{" "}
            {mutation.isPending ? "진행 중" : "대기 중"}
          </li>
          <li>
            <code className="bg-white dark:bg-gray-800 px-1 rounded">isSuccess</code>:{" "}
            {mutation.isSuccess ? "성공" : "아님"}
          </li>
          <li>
            <code className="bg-white dark:bg-gray-800 px-1 rounded">isError</code>:{" "}
            {mutation.isError ? "에러" : "정상"}
          </li>
          {mutation.data && (
            <li>
              <code className="bg-white dark:bg-gray-800 px-1 rounded">data</code>:{" "}
              {JSON.stringify(mutation.data, null, 2)}
            </li>
          )}
          {mutation.error && (
            <li>
              <code className="bg-white dark:bg-gray-800 px-1 rounded">error</code>:{" "}
              {mutation.error instanceof Error ? mutation.error.message : "Unknown error"}
            </li>
          )}
        </ul>
      </div>

      {mutation.isSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <p className="text-green-700 dark:text-green-400">
            사용자가 성공적으로 생성되었습니다!
          </p>
        </div>
      )}

      {mutation.isError && (
        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
          <p className="text-red-700 dark:text-red-400">
            사용자 생성 중 오류가 발생했습니다.
          </p>
        </div>
      )}
    </div>
  );
}

export function MutationBasicsDemo() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useMutation의 주요 속성:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">mutate</code>: mutation 실행 함수</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">mutateAsync</code>: Promise를 반환하는 mutation 실행</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isPending</code>: mutation 진행 중 여부</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isSuccess</code>: 성공 여부</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isError</code>: 에러 발생 여부</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">data</code>: 성공 시 반환된 데이터</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">error</code>: 에러 객체</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">onSuccess</code>: 성공 콜백</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">onError</code>: 에러 콜백</li>
        </ul>
      </div>

      <UserForm />

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">Mutation vs Query:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Query</strong>: 데이터를 읽어올 때 사용 (GET 요청)</li>
          <li><strong>Mutation</strong>: 데이터를 변경할 때 사용 (POST, PUT, DELETE 요청)</li>
          <li>Mutation은 자동으로 캐시하지 않음 (수동으로 처리 필요)</li>
          <li>Mutation 후 관련 Query를 무효화하여 자동 리페치가 일반적</li>
        </ul>
      </div>
    </div>
  );
}

