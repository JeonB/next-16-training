"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Infinite Queries 데모
 * 무한 스크롤 구현 패턴
 */

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface PostsPage {
  posts: Post[];
  nextCursor?: number;
  hasMore: boolean;
}

// 페이지네이션 API 시뮬레이션
async function fetchPosts(pageParam: number = 1, limit: number = 10): Promise<PostsPage> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 실제로는 서버 API 호출
  const startId = (pageParam - 1) * limit + 1;
  const posts: Post[] = Array.from({ length: limit }, (_, i) => ({
    id: startId + i,
    title: `Post ${startId + i} Title`,
    body: `This is the body of post ${startId + i}. It contains some content.`,
    userId: Math.floor(Math.random() * 10) + 1,
  }));

  const hasMore = pageParam < 5; // 최대 5페이지까지만

  return {
    posts,
    nextCursor: hasMore ? pageParam + 1 : undefined,
    hasMore,
  };
}

export function InfiniteQueriesDemo() {
  const [limit] = useState(10);

  const {
    data,
    fetchNextPage,        // 다음 페이지 가져오기
    hasNextPage,          // 다음 페이지 존재 여부
    isFetchingNextPage,   // 다음 페이지 로딩 중
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts-infinite", limit],
    queryFn: ({ pageParam }) => fetchPosts(pageParam, limit),
    initialPageParam: 1,  // 초기 페이지 파라미터
    getNextPageParam: (lastPage) => lastPage.nextCursor,  // 다음 페이지 파라미터 계산
    getPreviousPageParam: (firstPage) => firstPage.nextCursor,  // 이전 페이지 (선택사항)
  });

  // 모든 페이지의 posts를 평탄화
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useInfiniteQuery의 주요 속성:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">data.pages</code>: 각 페이지의 데이터 배열</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">fetchNextPage</code>: 다음 페이지 가져오기</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">hasNextPage</code>: 다음 페이지 존재 여부</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isFetchingNextPage</code>: 다음 페이지 로딩 중</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">getNextPageParam</code>: 다음 페이지 파라미터 계산 함수</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">initialPageParam</code>: 초기 페이지 파라미터</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Posts ({allPosts.length}개):</h3>
        {allPosts.map((post) => (
          <div
            key={post.id}
            className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
          >
            <h4 className="font-semibold mb-1">{post.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {post.body}
            </p>
            <p className="text-xs text-gray-500 mt-2">Post ID: {post.id} | User ID: {post.userId}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center">
        {hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </button>
        ) : (
          <p className="text-muted-foreground">모든 데이터를 불러왔습니다.</p>
        )}
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">실전 활용:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>무한 스크롤: Intersection Observer와 함께 사용</li>
          <li>페이지네이션: "더 보기" 버튼 클릭</li>
          <li>소셜 미디어 피드: 트위터, 인스타그램 스타일</li>
          <li>댓글 로딩: 점진적 로딩</li>
        </ul>
      </div>
    </div>
  );
}

