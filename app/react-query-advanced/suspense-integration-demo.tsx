"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";

/**
 * React Query Suspense 통합 데모
 * React Suspense와 함께 사용하는 패턴
 */

interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// 일반 쿼리 함수
async function fetchUser(userId: number): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    bio: `This is the bio of User ${userId}. They are a developer.`,
  };
}

async function fetchUserPosts(userId: number): Promise<Post[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return Array.from({ length: 3 }, (_, i) => ({
    id: userId * 10 + i,
    title: `Post ${i + 1} by User ${userId}`,
    body: `This is the body of post ${i + 1}. It contains some content.`,
    userId,
  }));
}

// useSuspenseQuery를 사용하는 컴포넌트
function UserProfileWithSuspense({ userId }: { userId: number }) {
  // useSuspenseQuery: Suspense와 함께 사용하는 쿼리
  const { data: user } = useSuspenseQuery({
    queryKey: ["user-suspense", userId],
    queryFn: () => fetchUser(userId),
  });

  // useSuspenseQuery는 항상 data가 존재 (로딩 상태는 Suspense fallback에서 처리)
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">{user.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{user.email}</p>
      <p className="text-sm text-gray-700 dark:text-gray-200">{user.bio}</p>
    </div>
  );
}

// 일반 useQuery를 사용하는 컴포넌트 (비교용)
function UserProfileTraditional({ userId }: { userId: number }) {
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user-traditional", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-red-700 dark:text-red-400">
          {error instanceof Error ? error.message : "에러 발생"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">{user.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{user.email}</p>
      <p className="text-sm text-gray-700 dark:text-gray-200">{user.bio}</p>
    </div>
  );
}

// 중첩된 Suspense 사용
function UserPostsWithSuspense({ userId }: { userId: number }) {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["posts-suspense", userId],
    queryFn: () => fetchUserPosts(userId),
  });

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-semibold mb-3">게시글 목록:</h3>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-900">
            <h4 className="font-medium">{post.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 로딩 Fallback 컴포넌트
function LoadingFallback({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="p-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}

export function SuspenseIntegrationDemo() {
  const [userId, setUserId] = useState(1);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useSuspenseQuery의 특징:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>로딩 상태를 Suspense fallback에서 처리 (더 선언적)</li>
          <li>항상 data가 존재 (null 체크 불필요)</li>
          <li>에러는 Error Boundary에서 처리</li>
          <li>React 18+ Suspense와 완벽하게 통합</li>
          <li>코드가 더 간결해짐 (if문 제거)</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          User ID:
          <input
            type="number"
            min="1"
            max="10"
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">1. useSuspenseQuery 사용 (Suspense와 함께):</h3>
          <Suspense fallback={<LoadingFallback message="사용자 정보 로딩 중..." />}>
            <UserProfileWithSuspense userId={userId} />
          </Suspense>
          <p className="mt-2 text-sm text-muted-foreground">
            ✅ Suspense fallback이 로딩 상태를 처리하므로 컴포넌트 내부에서 로딩 체크가 필요 없습니다.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. 일반 useQuery 사용 (비교용):</h3>
          <UserProfileTraditional userId={userId} />
          <p className="mt-2 text-sm text-muted-foreground">
            ⚠️ 컴포넌트 내부에서 isLoading, isError 등을 체크해야 합니다.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">3. 중첩된 Suspense:</h3>
          <Suspense fallback={<LoadingFallback message="사용자 정보 로딩 중..." />}>
            <UserProfileWithSuspense userId={userId} />
            <Suspense fallback={<LoadingFallback message="게시글 로딩 중..." />}>
              <div className="mt-4">
                <UserPostsWithSuspense userId={userId} />
              </div>
            </Suspense>
          </Suspense>
          <p className="mt-2 text-sm text-muted-foreground">
            💡 각 Suspense 경계는 독립적으로 로딩 상태를 관리합니다.
          </p>
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">언제 사용하나요?</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>useSuspenseQuery:</strong> React 18+, Suspense 사용 가능한 환경</li>
          <li><strong>useQuery:</strong> 더 세밀한 제어가 필요한 경우, React 17 이하</li>
          <li>Suspense는 선언적이고 깔끔한 로딩 상태 관리</li>
          <li>Error Boundary와 함께 사용하면 에러 처리도 간단</li>
        </ul>
      </div>
    </div>
  );
}

