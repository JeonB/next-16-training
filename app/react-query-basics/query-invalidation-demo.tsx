"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Query Invalidation 데모
 * 캐시 무효화를 통한 자동 리페치
 */

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Query 함수
async function fetchTodos(): Promise<Todo[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 실제로는 서버 API 호출
  return [
    { id: "1", text: "React Query 학습하기", completed: false },
    { id: "2", text: "캐시 무효화 이해하기", completed: true },
    { id: "3", text: "예제 코드 작성하기", completed: false },
  ];
}

// Mutation 함수
async function createTodo(text: string): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: Date.now().toString(),
    text,
    completed: false,
  };
}

async function toggleTodo(id: string): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  // 실제로는 서버 API 호출
  return {
    id,
    text: `Todo ${id}`,
    completed: true,
  };
}

function TodoList() {
  const queryClient = useQueryClient();
  const [newTodoText, setNewTodoText] = useState("");

  // Todos 조회 Query
  const { data: todos, isLoading, isRefetching } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // Todo 생성 Mutation
  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Mutation 성공 후 관련 쿼리 무효화 → 자동 리페치
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodoText("");
    },
  });

  // Todo 토글 Mutation
  const toggleMutation = useMutation({
    mutationFn: toggleTodo,
    onSuccess: () => {
      // Mutation 성공 후 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      createMutation.mutate(newTodoText.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Todo 추가 폼 */}
      <form onSubmit={handleAddTodo} className="flex space-x-2">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="새 Todo 입력..."
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={createMutation.isPending}
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {createMutation.isPending ? "추가 중..." : "추가"}
        </button>
      </form>

      {/* Todo 목록 */}
      <div className="space-y-2">
        {isRefetching && (
          <div className="text-sm text-blue-500">업데이트 중...</div>
        )}
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleMutation.mutate(todo.id)}
              disabled={toggleMutation.isPending}
              className="w-5 h-5"
            />
            <span
              className={`flex-1 ${
                todo.completed
                  ? "line-through text-gray-400"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QueryInvalidationDemo() {
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Query Invalidation 패턴:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Mutation 성공 후 관련 Query 무효화</li>
          <li>무효화된 Query는 자동으로 리페치됨</li>
          <li>구조화된 Query Keys를 사용하면 선택적 무효화 가능</li>
          <li>서버 상태와 클라이언트 상태 동기화의 핵심 메커니즘</li>
        </ul>
      </div>

      <TodoList />

      <div className="space-y-3">
        <h3 className="font-semibold">수동 무효화 테스트:</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["todos"] });
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm"
          >
            Todos 무효화 (리페치)
          </button>
          <button
            onClick={() => {
              queryClient.refetchQueries({ queryKey: ["todos"] });
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
          >
            Todos 수동 리페치
          </button>
          <button
            onClick={() => {
              queryClient.resetQueries({ queryKey: ["todos"] });
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
          >
            Todos 캐시 리셋
          </button>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
          <p className="text-sm font-semibold mb-1">차이점:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code className="bg-white dark:bg-gray-800 px-1 rounded">invalidateQueries</code>: 무효화하고 활성 쿼리만 리페치</li>
            <li><code className="bg-white dark:bg-gray-800 px-1 rounded">refetchQueries</code>: 즉시 리페치 (무효화 없이)</li>
            <li><code className="bg-white dark:bg-gray-800 px-1 rounded">resetQueries</code>: 캐시를 완전히 리셋</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

