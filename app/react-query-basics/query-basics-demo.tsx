"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query 기본 Query 사용법 데모
 * useQuery의 핵심 개념 학습
 */

interface Post {
  id: string;
  title: string;
  body: string;
  userId: number;
}

// 간단한 fetch 함수
async function fetchPost(postId: string): Promise<Post> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  return response.json();
}

function PostDetail({ postId }: { postId: string }) {
  // useQuery 기본 사용법
  const {
    data,           // 쿼리 결과 데이터
    isLoading,      // 첫 로딩 중인지 여부
    isError,        // 에러 발생 여부
    error,          // 에러 객체
    isFetching,     // 백그라운드 리페치 중인지 여부
    isSuccess,      // 성공적으로 데이터를 가져왔는지 여부
    refetch,        // 수동으로 리페치하는 함수
  } = useQuery({
    queryKey: ["post", postId],  // 쿼리 키 (캐시 식별자)
    queryFn: () => fetchPost(postId),  // 데이터를 가져오는 함수
    enabled: !!postId,  // postId가 있을 때만 쿼리 실행
    staleTime: 5000,  // 5초간 fresh 상태 유지 (이 시간 동안은 리페치 안 함)
    gcTime: 60000,  // 60초간 캐시 유지 (이전에는 cacheTime)
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-red-700 dark:text-red-400">
          에러 발생: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold">{data.title}</h3>
          {isFetching && (
            <span className="text-xs text-blue-500">업데이트 중...</span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300">{data.body}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Post ID: {data.id}</span>
          <span>User ID: {data.userId}</span>
        </div>
      </div>

      <button
        onClick={() => refetch()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        수동 리페치
      </button>
    </div>
  );
}

export function QueryBasicsDemo() {
  const [postId, setPostId] = useState("1");

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useQuery의 주요 속성:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">data</code>: 쿼리 결과 데이터</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isLoading</code>: 첫 로딩 중 (캐시가 없을 때)</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isFetching</code>: 백그라운드 리페치 중</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isError</code>: 에러 발생 여부</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isSuccess</code>: 성공적으로 데이터를 가져왔는지</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">refetch</code>: 수동 리페치 함수</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">staleTime</code>: 데이터가 fresh로 유지되는 시간</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">gcTime</code>: 캐시가 메모리에 유지되는 시간</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Post ID:
          <input
            type="number"
            min="1"
            max="100"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          ID를 변경하면 자동으로 새로운 쿼리가 실행됩니다. 같은 ID를 입력하면 캐시된 데이터를 사용합니다.
        </p>
      </div>

      <PostDetail postId={postId} />

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">캐싱 동작:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>같은 queryKey로 요청하면 캐시된 데이터를 즉시 반환</li>
          <li>staleTime이 지나면 백그라운드에서 자동 리페치</li>
          <li>컴포넌트가 언마운트되어도 gcTime 동안 캐시 유지</li>
          <li>window에 다시 포커스하면 자동 리페치 (설정에 따라)</li>
        </ol>
      </div>
    </div>
  );
}

