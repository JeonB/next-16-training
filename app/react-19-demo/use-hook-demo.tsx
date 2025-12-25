"use client";

import { use, Suspense, useState, createContext, useContext } from "react";

/**
 * React 19의 use 훅 데모
 * Promise와 Context를 처리하는 새로운 방식
 */

// Promise를 생성하는 함수 (실제 API 호출 시뮬레이션)
function fetchUserData(userId: string): Promise<{ id: string; name: string; email: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`,
      });
    }, 1500);
  });
}

// Context 생성
const UserContext = createContext<Promise<{ id: string; name: string; email: string }> | null>(null);

// use 훅으로 Promise 처리하는 컴포넌트
function UserProfile({ userPromise }: { userPromise: Promise<{ id: string; name: string; email: string }> }) {
  // use 훅으로 Promise를 직접 사용 (Suspense와 함께 작동)
  const user = use(userPromise);

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-semibold mb-2">사용자 정보</h3>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>이름:</strong> {user.name}</p>
      <p><strong>이메일:</strong> {user.email}</p>
    </div>
  );
}

// Context와 use 훅 함께 사용하는 컴포넌트
function UserProfileFromContext() {
  const userPromise = useContext(UserContext);
  if (!userPromise) {
    return <div>Context가 제공되지 않았습니다.</div>;
  }

  // Context에서 가져온 Promise를 use 훅으로 처리
  const user = use(userPromise);

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-semibold mb-2">Context에서 가져온 사용자 정보</h3>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>이름:</strong> {user.name}</p>
      <p><strong>이메일:</strong> {user.email}</p>
    </div>
  );
}

// 로딩 중 컴포넌트
function LoadingFallback() {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  );
}

export function UseHookDemo() {
  const [userId, setUserId] = useState("1");
  const userPromise = fetchUserData(userId);
  const contextValue = fetchUserData("context-user");

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">use 훅의 주요 특징:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Promise를 직접 처리할 수 있어 async/await보다 더 선언적</li>
          <li>Suspense와 함께 사용하면 로딩 상태를 자동으로 처리</li>
          <li>Context와 함께 사용하면 비동기 데이터를 Context로 전달 가능</li>
          <li>에러는 Error Boundary에서 처리</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          사용자 ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
      </div>

      <div>
        <h3 className="font-semibold mb-3">1. Promise 직접 처리:</h3>
        <Suspense fallback={<LoadingFallback />}>
          <UserProfile userPromise={fetchUserData(userId)} />
        </Suspense>
      </div>

      <div>
        <h3 className="font-semibold mb-3">2. Context와 함께 사용:</h3>
        <UserContext.Provider value={contextValue}>
          <Suspense fallback={<LoadingFallback />}>
            <UserProfileFromContext />
          </Suspense>
        </UserContext.Provider>
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
        <p className="text-sm">
          <strong>주의:</strong> use 훅은 Promise나 Context를 인자로 받아야 합니다.
          일반 값에 사용하면 에러가 발생합니다.
        </p>
      </div>
    </div>
  );
}

