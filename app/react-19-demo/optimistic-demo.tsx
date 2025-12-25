"use client";

import { useOptimistic, useState, useTransition } from "react";

/**
 * React 19의 useOptimistic 데모
 * 낙관적 업데이트를 쉽게 구현
 */

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// 서버 액션 시뮬레이션
async function toggleTodo(id: string, currentCompleted: boolean): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 실제로는 서버 API 호출
  return {
    id,
    text: `Todo ${id}`,
    completed: !currentCompleted,
  };
}

async function addTodo(text: string): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: Date.now().toString(),
    text,
    completed: false,
  };
}

export function OptimisticDemo() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "React 19 학습하기", completed: false },
    { id: "2", text: "useOptimistic 예제 만들기", completed: true },
    { id: "3", text: "코드 리뷰하기", completed: false },
  ]);

  // useOptimistic: 낙관적 업데이트를 위한 훅
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state: Todo[], newTodo: Todo) => {
      // 낙관적 업데이트: 즉시 UI에 반영
      return [...state, newTodo];
    }
  );

  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    startTransition(async () => {
      // 낙관적 업데이트: 즉시 상태 변경
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );

      try {
        // 서버 동기화 (실제로는 서버 액션 호출)
        const updated = await toggleTodo(id, todo.completed);
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      } catch (error) {
        // 에러 발생 시 원래 상태로 복원
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? todo : t))
        );
      }
    });
  };

  const handleAdd = (text: string) => {
    const tempTodo: Todo = {
      id: `temp-${Date.now()}`,
      text,
      completed: false,
    };

    startTransition(async () => {
      // 낙관적 업데이트
      addOptimisticTodo(tempTodo);

      try {
        // 서버 동기화
        const newTodo = await addTodo(text);
        setTodos((prev) => [...prev, newTodo]);
      } catch (error) {
        // 에러 발생 시 낙관적 업데이트 취소
        setTodos((prev) => prev.filter((t) => t.id !== tempTodo.id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useOptimistic의 장점:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>서버 응답을 기다리지 않고 즉시 UI 업데이트</li>
          <li>더 나은 사용자 경험 (반응성 향상)</li>
          <li>에러 발생 시 자동으로 롤백 가능</li>
          <li>로딩 상태 관리가 간단해짐</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">Todo 목록:</h3>
          <div className="space-y-2">
            {optimisticTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id)}
                  disabled={isPending}
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
                {todo.id.startsWith("temp-") && (
                  <span className="text-xs text-blue-500">추가 중...</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <TodoForm onAdd={handleAdd} disabled={isPending} />
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">동작 방식:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>사용자가 액션을 수행 (체크박스 클릭, Todo 추가 등)</li>
          <li>즉시 UI가 업데이트됨 (낙관적 업데이트)</li>
          <li>백그라운드에서 서버와 동기화</li>
          <li>성공 시 최종 상태로 업데이트, 실패 시 롤백</li>
        </ol>
      </div>
    </div>
  );
}

function TodoForm({
  onAdd,
  disabled,
}: {
  onAdd: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="새 Todo 입력..."
        disabled={disabled}
        className="flex-1 px-3 py-2 border rounded-md disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        추가
      </button>
    </form>
  );
}

