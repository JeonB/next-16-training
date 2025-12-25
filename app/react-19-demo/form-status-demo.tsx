"use client";

import { useFormStatus, useFormState } from "react-dom";
import { type FormEvent } from "react";

/**
 * React 19의 useFormStatus & useFormState 데모
 * 폼 상태 관리를 위한 새로운 훅들
 */

// Server Action 시뮬레이션
async function submitComment(prevState: { message: string; error?: string }, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const comment = formData.get("comment") as string;

  if (!comment || comment.trim().length === 0) {
    return { message: "", error: "댓글을 입력해주세요." };
  }

  if (comment.length < 5) {
    return { message: "", error: "댓글은 최소 5자 이상이어야 합니다." };
  }

  return { message: `댓글이 등록되었습니다: "${comment}"`, error: undefined };
}

// useFormStatus를 사용하는 Submit 버튼 컴포넌트
function SubmitButton() {
  // useFormStatus는 가장 가까운 form의 상태를 가져옴
  const { pending, data, method, action } = useFormStatus();

  return (
    <div className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "제출 중..." : "댓글 등록"}
      </button>
      {pending && (
        <p className="text-sm text-muted-foreground">
          폼이 제출 중입니다... (method: {method}, action: {action || "현재 URL"})
        </p>
      )}
    </div>
  );
}

// useFormState를 사용하는 폼 컴포넌트
function CommentForm() {
  // useFormState: 폼의 상태와 액션을 관리
  const [state, formAction] = useFormState(submitComment, { message: "" });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          댓글:
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="댓글을 입력하세요 (최소 5자)"
        />
      </div>

      <SubmitButton />

      {state.error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded">
          {state.error}
        </div>
      )}

      {state.message && (
        <div className="p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded">
          {state.message}
        </div>
      )}
    </form>
  );
}

// useFormStatus를 사용하는 다른 예제: 로딩 인디케이터
function FormStatusIndicator() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span>처리 중...</span>
    </div>
  );
}

function SearchForm() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 실제로는 검색 로직 실행
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex space-x-2">
        <input
          type="search"
          name="query"
          placeholder="검색..."
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          검색
        </button>
      </div>
      <FormStatusIndicator />
    </form>
  );
}

export function FormStatusDemo() {
  return (
    <div className="space-y-8">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useFormStatus & useFormState의 특징:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <code className="bg-white dark:bg-gray-800 px-1 rounded">useFormStatus</code>:
            가장 가까운 form의 제출 상태를 읽음 (pending, data, method, action)
          </li>
          <li>
            <code className="bg-white dark:bg-gray-800 px-1 rounded">useFormState</code>:
            폼의 상태와 액션을 함께 관리 (이전 상태를 인자로 받음)
          </li>
          <li>Server Actions와 함께 사용하면 더 강력함</li>
          <li>폼 제출 상태를 컴포넌트 트리 어디서나 접근 가능</li>
        </ul>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">1. useFormState + useFormStatus 사용:</h3>
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
            <CommentForm />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. useFormStatus만 사용 (로딩 인디케이터):</h3>
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
            <SearchForm />
          </div>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
        <p className="text-sm">
          <strong>주의:</strong> <code className="bg-white dark:bg-gray-800 px-1 rounded">useFormStatus</code>는
          반드시 <code className="bg-white dark:bg-gray-800 px-1 rounded">form</code> 요소의 자식 컴포넌트에서만 사용해야 합니다.
          form 외부에서는 작동하지 않습니다.
        </p>
      </div>
    </div>
  );
}

