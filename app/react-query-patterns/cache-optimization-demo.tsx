"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query 캐시 최적화 전략 데모
 * staleTime, gcTime, refetchOnWindowFocus 등의 전략
 */

interface Article {
  id: number;
  title: string;
  content: string;
  views: number;
  createdAt: string;
}

// API 함수
async function fetchArticle(articleId: number): Promise<Article> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: articleId,
    title: `Article ${articleId} Title`,
    content: `This is the content of article ${articleId}.`,
    views: Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString(),
  };
}

// 다른 전략의 Article 컴포넌트들
function ArticleWithDefaultSettings({ articleId }: { articleId: number }) {
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["article-default", articleId],
    queryFn: () => fetchArticle(articleId),
    // 기본 설정: staleTime 0, window focus 시 refetch
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{data.title}</h3>
        {isFetching && <span className="text-xs text-blue-500">리페치 중...</span>}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{data.content}</p>
      <p className="text-xs text-muted-foreground">
        조회수: {data.views} | 업데이트: {new Date(dataUpdatedAt).toLocaleTimeString()}
      </p>
      <p className="text-xs text-red-500 mt-1">
        ⚠️ Window focus 시 자동 refetch
      </p>
    </div>
  );
}

function ArticleWithLongStaleTime({ articleId }: { articleId: number }) {
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["article-stale", articleId],
    queryFn: () => fetchArticle(articleId),
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false, // Window focus 시 refetch 안 함
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{data.title}</h3>
        {isFetching && <span className="text-xs text-blue-500">리페치 중...</span>}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{data.content}</p>
      <p className="text-xs text-muted-foreground">
        조회수: {data.views} | 업데이트: {new Date(dataUpdatedAt).toLocaleTimeString()}
      </p>
      <p className="text-xs text-green-500 mt-1">
        ✅ 5분간 fresh, Window focus 시 refetch 안 함
      </p>
    </div>
  );
}

function ArticleWithShortStaleTime({ articleId }: { articleId: number }) {
  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["article-short", articleId],
    queryFn: () => fetchArticle(articleId),
    staleTime: 10 * 1000, // 10초간 fresh
    refetchInterval: 30 * 1000, // 30초마다 자동 refetch
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{data.title}</h3>
        {isFetching && <span className="text-xs text-blue-500">리페치 중...</span>}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{data.content}</p>
      <p className="text-xs text-muted-foreground">
        조회수: {data.views} | 업데이트: {new Date(dataUpdatedAt).toLocaleTimeString()}
      </p>
      <p className="text-xs text-yellow-500 mt-1">
        ⏱️ 10초 fresh, 30초마다 자동 refetch
      </p>
    </div>
  );
}

export function CacheOptimizationDemo() {
  const queryClient = useQueryClient();
  const [articleId, setArticleId] = useState(1);

  const handleClearCache = () => {
    queryClient.clear();
  };

  const handleRemoveQueries = () => {
    queryClient.removeQueries({ queryKey: ["article"] });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">캐시 최적화 전략:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">staleTime</code>: 데이터가 fresh로 유지되는 시간</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">gcTime</code>: 캐시가 메모리에 유지되는 시간 (이전 cacheTime)</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">refetchOnWindowFocus</code>: Window focus 시 refetch 여부</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">refetchInterval</code>: 자동 refetch 간격</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">refetchOnMount</code>: 컴포넌트 마운트 시 refetch 여부</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Article ID:
          <input
            type="number"
            min="1"
            max="10"
            value={articleId}
            onChange={(e) => setArticleId(parseInt(e.target.value) || 1)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleClearCache}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            전체 캐시 삭제
          </button>
          <button
            onClick={handleRemoveQueries}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
          >
            Article 쿼리 제거
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">1. 기본 설정 (staleTime: 0):</h3>
          <ArticleWithDefaultSettings articleId={articleId} />
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. 긴 staleTime (5분, refetchOnWindowFocus: false):</h3>
          <ArticleWithLongStaleTime articleId={articleId} />
        </div>

        <div>
          <h3 className="font-semibold mb-3">3. 짧은 staleTime + 자동 refetch (10초, 30초마다):</h3>
          <ArticleWithShortStaleTime articleId={articleId} />
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">전략 선택 가이드:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>정적 데이터:</strong> 긴 staleTime (예: 30분), refetchOnWindowFocus: false</li>
          <li><strong>자주 변경되는 데이터:</strong> 짧은 staleTime (예: 30초), refetchInterval 사용</li>
          <li><strong>실시간 데이터:</strong> staleTime: 0, refetchInterval: 짧은 간격</li>
          <li><strong>사용자 데이터:</strong> 중간 staleTime (예: 5분), refetchOnWindowFocus: true</li>
        </ul>
      </div>
    </div>
  );
}

