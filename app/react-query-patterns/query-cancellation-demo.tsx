"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

/**
 * React Query Query Cancellation 데모
 * 불필요한 네트워크 요청 취소
 */

interface SearchResult {
  id: number;
  title: string;
  description: string;
}

// AbortController를 사용한 취소 가능한 fetch
async function searchItems(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // signal이 취소되었는지 확인
  if (signal?.aborted) {
    throw new Error("Query was cancelled");
  }

  // 실제로는 서버 API 호출
  const results: SearchResult[] = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Result ${i + 1} for "${query}"`,
    description: `This is a description for search result ${i + 1} matching "${query}".`,
  }));

  return results;
}

// React Query는 자동으로 AbortSignal을 전달함
function SearchResults({ query }: { query: string }) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) => searchItems(query, signal), // signal을 받아서 전달
    enabled: query.length > 0,
    staleTime: 30 * 1000, // 30초
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-red-700 dark:text-red-400">
          {error instanceof Error && error.message === "Query was cancelled"
            ? "검색이 취소되었습니다."
            : "에러 발생"}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <p className="text-muted-foreground">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isFetching && !isLoading && (
        <div className="text-sm text-blue-500">업데이트 중...</div>
      )}
      {data.map((result) => (
        <div
          key={result.id}
          className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold mb-1">{result.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{result.description}</p>
        </div>
      ))}
    </div>
  );
}

export function QueryCancellationDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 디바운싱: 빠른 입력 시 불필요한 요청 방지
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Query Cancellation의 특징:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>컴포넌트 언마운트 시 자동으로 쿼리 취소</li>
          <li>같은 queryKey로 새로운 쿼리가 시작되면 이전 쿼리 취소</li>
          <li>AbortController를 사용하여 네트워크 요청 취소</li>
          <li>불필요한 네트워크 요청과 메모리 사용 감소</li>
          <li>디바운싱과 함께 사용하면 더욱 효과적</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          검색어 입력:
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
            placeholder="검색어를 입력하세요..."
          />
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          빠르게 입력하면 이전 요청이 자동으로 취소됩니다. 500ms 디바운싱이 적용됩니다.
        </p>
      </div>

      {debouncedQuery && <SearchResults query={debouncedQuery} />}

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">실전 활용:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>검색 입력 필드 (자동 취소)</li>
          <li>필터 변경 시 이전 요청 취소</li>
          <li>페이지 이동 시 진행 중인 요청 취소</li>
          <li>디바운싱과 함께 사용하여 성능 최적화</li>
        </ul>
      </div>
    </div>
  );
}

