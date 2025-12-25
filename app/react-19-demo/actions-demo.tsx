"use client";

import { useActionState } from "react";
import { useState, useTransition } from "react";

/**
 * React 19의 Server Actions & Form Actions 데모
 * action prop을 통한 서버 함수 직접 연결
 */

// Server Action (실제로는 'use server'가 필요하지만, 클라이언트 컴포넌트에서는 시뮬레이션)
async function submitForm(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { success: false, error: "이름과 이메일을 모두 입력해주세요." };
  }

  if (!email.includes("@")) {
    return { success: false, error: "유효한 이메일을 입력해주세요." };
  }

  return { success: true, message: `환영합니다, ${name}님!` };
}

// useActionState를 사용한 폼 (React 19)
function FormWithActionState() {
  const [state, formAction, isPending] = useActionState(
    submitForm,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">이름:</label>
        <input
          type="text"
          name="name"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">이메일:</label>
        <input
          type="email"
          name="email"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "제출 중..." : "제출"}
      </button>
      {state?.error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded">
          {state.message}
        </div>
      )}
    </form>
  );
}

// useTransition을 사용한 폼 (전통적인 방식)
function FormWithTransition() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await submitForm(formData);
      if (result.success) {
        setMessage(result.message || "성공!");
      } else {
        setError(result.error || "오류 발생");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">이름:</label>
        <input
          type="text"
          name="name"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">이메일:</label>
        <input
          type="email"
          name="email"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "제출 중..." : "제출"}
      </button>
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded">
          {message}
        </div>
      )}
    </form>
  );
}

export function ActionsDemo() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Server Actions & Form Actions의 특징:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">action</code> prop으로 서버 함수 직접 연결</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">useActionState</code>로 폼 상태 관리 간소화</li>
          <li>자동으로 FormData 처리</li>
          <li>서버 컴포넌트와의 통합이 더 자연스러움</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">1. useActionState 사용 (React 19):</h3>
          <FormWithActionState />
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. useTransition 사용 (전통적 방식):</h3>
          <FormWithTransition />
        </div>
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
        <p className="text-sm">
          <strong>참고:</strong> 실제 프로덕션에서는 Server Action에
          <code className="bg-white dark:bg-gray-800 px-1 rounded">'use server'</code> 지시어를 사용하여
          서버에서만 실행되도록 해야 합니다.
        </p>
      </div>
    </div>
  );
}

