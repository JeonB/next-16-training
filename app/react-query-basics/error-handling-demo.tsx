"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Error Handling 데모
 * 다양한 에러 처리 방법 학습
 */

interface Product {
  id: string;
  name: string;
  price: number;
}

// 항상 실패하는 Query (에러 테스트용)
async function fetchProductFail(id: string): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error(`제품 ${id}를 찾을 수 없습니다.`);
}

// 재시도가 필요한 Query
async function fetchProductRetry(id: string): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // 50% 확률로 실패 (재시도 테스트용)
  if (Math.random() > 0.5) {
    throw new Error("일시적인 서버 오류입니다. 재시도 중...");
  }
  return {
    id,
    name: `Product ${id}`,
    price: Math.floor(Math.random() * 100000),
  };
}

// Mutation 에러
async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (data.price && data.price < 0) {
    throw new Error("가격은 0보다 커야 합니다.");
  }
  return {
    id,
    name: data.name || `Product ${id}`,
    price: data.price || 0,
  };
}

function ErrorHandlingExample() {
  const [productId, setProductId] = useState("1");

  // 기본 에러 처리
  const { data, error, isError, refetch } = useQuery({
    queryKey: ["product-fail", productId],
    queryFn: () => fetchProductFail(productId),
    retry: false, // 재시도 비활성화
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 font-medium">
          Product ID:
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
      </div>

      {isError && (
        <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-950 rounded-lg">
          <p className="text-red-700 dark:text-red-400 font-semibold mb-2">에러 발생:</p>
          <p className="text-red-600 dark:text-red-300 text-sm mb-3">
            {error instanceof Error ? error.message : "알 수 없는 에러"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            다시 시도
          </button>
        </div>
      )}

      {data && (
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-green-700 dark:text-green-400">
            성공: {data.name} - {data.price.toLocaleString()}원
          </p>
        </div>
      )}
    </div>
  );
}

function RetryExample() {
  const [productId, setProductId] = useState("retry-1");

  // 재시도 설정이 있는 Query
  const { data, error, isError, isFetching, failureCount } = useQuery({
    queryKey: ["product-retry", productId],
    queryFn: () => fetchProductRetry(productId),
    retry: 3, // 최대 3번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 font-medium">
          Product ID:
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
        {isFetching && (
          <p className="text-sm text-blue-500 mt-2">
            로딩 중... (재시도 횟수: {failureCount})
          </p>
        )}
      </div>

      {isError && (
        <div className="p-4 border border-orange-300 bg-orange-50 dark:bg-orange-950 rounded-lg">
          <p className="text-orange-700 dark:text-orange-400">
            {error instanceof Error ? error.message : "알 수 없는 에러"}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
            재시도 횟수 초과 (최대 3번 재시도)
          </p>
        </div>
      )}

      {data && (
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-green-700 dark:text-green-400">
            성공: {data.name} - {data.price.toLocaleString()}원
          </p>
        </div>
      )}
    </div>
  );
}

function MutationErrorExample() {
  const [price, setPrice] = useState("10000");

  const mutation = useMutation({
    mutationFn: (price: number) => updateProduct("1", { price }),
    onError: (error) => {
      // Mutation 에러는 onError 콜백에서 처리
      console.error("Mutation error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      return;
    }
    mutation.mutate(priceNum);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 font-medium">가격:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            step="1000"
            min="0"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {mutation.isPending ? "업데이트 중..." : "가격 업데이트"}
        </button>
      </form>

      {mutation.isError && (
        <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-950 rounded-lg">
          <p className="text-red-700 dark:text-red-400 font-semibold">에러 발생:</p>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "알 수 없는 에러"}
          </p>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-green-700 dark:text-green-400">
            가격이 성공적으로 업데이트되었습니다!
          </p>
        </div>
      )}
    </div>
  );
}

export function ErrorHandlingDemo() {
  return (
    <div className="space-y-8">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Error Handling 방법:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">isError</code>, <code className="bg-white dark:bg-gray-800 px-1 rounded">error</code>로 에러 상태 확인</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">retry</code>: 자동 재시도 설정</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">retryDelay</code>: 재시도 지연 시간 설정</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">onError</code>: Mutation 에러 콜백</li>
          <li>Error Boundary와 함께 사용하면 전역 에러 처리 가능</li>
        </ul>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="font-semibold mb-3">1. 기본 에러 처리:</h3>
          <ErrorHandlingExample />
        </section>

        <section>
          <h3 className="font-semibold mb-3">2. 재시도 설정 (Retry):</h3>
          <RetryExample />
        </section>

        <section>
          <h3 className="font-semibold mb-3">3. Mutation 에러 처리:</h3>
          <MutationErrorExample />
        </section>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">에러 처리 전략:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>일시적인 네트워크 오류: 자동 재시도 (retry)</li>
          <li>영구적인 에러: 사용자에게 명확한 에러 메시지 표시</li>
          <li>Mutation 에러: onError 콜백에서 처리하고 사용자에게 피드백</li>
          <li>전역 에러: Error Boundary와 QueryClient의 onError 사용</li>
        </ul>
      </div>
    </div>
  );
}

