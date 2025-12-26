"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hydration 패턴 데모
 * 서버에서 가져온 데이터를 클라이언트 React Query 캐시에 주입
 */

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

async function fetchUser(userId: number): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    role: userId % 2 === 0 ? "admin" : "user",
  };
}

/**
 * Hydration 패턴 예제
 * Server Component에서 이미 가져온 데이터를 활용
 */
export function HydrationPatternDemo() {
  const queryClient = useQueryClient();

  // Server Component에서 이미 prefetch한 데이터 사용
  const { data: user, isLoading, isFetching } = useQuery({
    queryKey: ["user", 1],
    queryFn: () => fetchUser(1),
  });

  // 수동으로 캐시에 데이터 설정하는 방법 (대안)
  const handleManualHydration = () => {
    const manualUser: User = {
      id: 999,
      name: "Manual User",
      email: "manual@example.com",
      role: "admin",
    };

    queryClient.setQueryData(["user", 999], manualUser);
  };

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Hydration 패턴의 두 가지 방법:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>prefetchQuery + HydrationBoundary:</strong> Server Component에서 prefetch 후 자동 hydration</li>
          <li><strong>setQueryData:</strong> 수동으로 캐시에 데이터 설정</li>
          <li>둘 다 클라이언트에서 즉시 데이터 사용 가능</li>
        </ul>
      </div>

      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
        {isFetching && !isLoading && (
          <div className="mb-4 text-sm text-blue-500">백그라운드 업데이트 중...</div>
        )}
        <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-1">{user.email}</p>
        <p className="text-sm">
          <span className="font-medium">역할:</span>{" "}
          <span className={`px-2 py-1 rounded text-xs ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}>
            {user.role}
          </span>
        </p>
      </div>

      <div>
        <button
          onClick={handleManualHydration}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          수동 Hydration (setQueryData)
        </button>
        <p className="mt-2 text-sm text-muted-foreground">
          클릭 후 캐시에 수동으로 데이터를 설정합니다. React Query DevTools에서 확인 가능합니다.
        </p>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">언제 어떤 방법을 사용하나요?</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>prefetchQuery:</strong> Server Component에서 데이터 가져올 때 (권장)</li>
          <li><strong>setQueryData:</strong> 서버 액션 결과, 이벤트 핸들러 결과 등을 캐시에 저장할 때</li>
          <li>둘 다 React Query의 캐싱, 리페칭, 무효화 기능 활용 가능</li>
        </ul>
      </div>
    </div>
  );
}

