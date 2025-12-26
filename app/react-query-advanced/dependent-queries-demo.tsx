"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Dependent Queries 데모
 * 첫 번째 쿼리 결과에 따라 두 번째 쿼리를 실행하는 패턴
 */

interface User {
  id: number;
  name: string;
  email: string;
  companyId: number;
}

interface Company {
  id: number;
  name: string;
  address: string;
  employeeCount: number;
}

interface Post {
  id: number;
  title: string;
  userId: number;
}

// 첫 번째 쿼리: 사용자 정보
async function fetchUser(userId: number): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    companyId: userId % 3 + 1, // 1, 2, 3 중 하나
  };
}

// 두 번째 쿼리: 회사 정보 (사용자의 companyId 필요)
async function fetchCompany(companyId: number): Promise<Company> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    id: companyId,
    name: `Company ${companyId}`,
    address: `${companyId}00 Main St, City`,
    employeeCount: companyId * 50,
  };
}

// 세 번째 쿼리: 사용자의 게시글 (사용자 ID 필요)
async function fetchUserPosts(userId: number): Promise<Post[]> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return Array.from({ length: 3 }, (_, i) => ({
    id: userId * 10 + i,
    title: `Post ${i + 1} by User ${userId}`,
    userId,
  }));
}

export function DependentQueriesDemo() {
  const [userId, setUserId] = useState<number | null>(1);

  // 첫 번째 쿼리: 사용자 정보
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: userError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId!),
    enabled: userId !== null, // userId가 있을 때만 실행
  });

  // 두 번째 쿼리: 회사 정보 (사용자의 companyId에 의존)
  const {
    data: company,
    isLoading: isLoadingCompany,
    isError: isErrorCompany,
  } = useQuery({
    queryKey: ["company", user?.companyId],
    queryFn: () => fetchCompany(user!.companyId),
    enabled: !!user?.companyId, // user와 companyId가 있을 때만 실행
  });

  // 세 번째 쿼리: 사용자의 게시글 (사용자 ID에 의존)
  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
  } = useQuery({
    queryKey: ["posts", "user", user?.id],
    queryFn: () => fetchUserPosts(user!.id),
    enabled: !!user?.id, // user와 id가 있을 때만 실행
  });

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Dependent Queries 패턴:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">enabled</code> 옵션으로 쿼리 실행 조건 제어</li>
          <li>첫 번째 쿼리 결과를 두 번째 쿼리의 파라미터로 사용</li>
          <li>순차적 로딩이 필요한 경우에 유용</li>
          <li>타입 안전성 보장 (user가 없으면 쿼리 실행 안 됨)</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          User ID (1-10):
          <input
            type="number"
            min="1"
            max="10"
            value={userId || ""}
            onChange={(e) => setUserId(e.target.value ? parseInt(e.target.value) : null)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
        <p className="text-sm text-muted-foreground">
          User ID를 변경하면 회사 정보와 게시글이 자동으로 로드됩니다.
        </p>
      </div>

      {/* 로딩 상태 */}
      {isLoadingUser && (
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      )}

      {/* 에러 상태 */}
      {isErrorUser && (
        <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
          <p className="text-red-700 dark:text-red-400">
            사용자 로딩 실패: {userError instanceof Error ? userError.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* 사용자 정보 */}
      {user && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2">사용자 정보</h3>
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>회사 ID:</strong> {user.companyId}</p>
          </div>

          {/* 회사 정보 (의존적 쿼리) */}
          {isLoadingCompany ? (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ) : isErrorCompany ? (
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
              <p className="text-red-700 dark:text-red-400">회사 정보 로딩 실패</p>
            </div>
          ) : company ? (
            <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2">회사 정보</h3>
              <p><strong>회사명:</strong> {company.name}</p>
              <p><strong>주소:</strong> {company.address}</p>
              <p><strong>직원 수:</strong> {company.employeeCount}명</p>
            </div>
          ) : null}

          {/* 게시글 목록 (의존적 쿼리) */}
          {isLoadingPosts ? (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : isErrorPosts ? (
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
              <p className="text-red-700 dark:text-red-400">게시글 로딩 실패</p>
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2">게시글 목록</h3>
              <ul className="space-y-2">
                {posts.map((post) => (
                  <li key={post.id} className="p-2 border rounded bg-gray-50 dark:bg-gray-900">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">Post ID: {post.id}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">실전 활용:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>사용자 프로필 → 사용자의 게시글/댓글</li>
          <li>주문 정보 → 주문 상세 → 상품 정보</li>
          <li>검색 결과 → 각 결과의 추가 정보</li>
          <li>계층적 데이터 로딩</li>
        </ul>
      </div>
    </div>
  );
}

