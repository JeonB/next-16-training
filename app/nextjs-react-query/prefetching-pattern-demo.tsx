"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Next.js에서 Prefetching 패턴 데모
 * Server Component에서 prefetch한 데이터를 Client Component에서 사용
 */

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

async function fetchProduct(productId: number): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: productId,
    name: `Product ${productId}`,
    price: productId * 10000,
    description: `This is a description for Product ${productId}.`,
  };
}

/**
 * Client Component
 * Server에서 prefetch된 데이터를 사용
 */
export function PrefetchingPatternDemo() {
  // Server Component에서 prefetch한 데이터가 이미 캐시에 있음
  // 따라서 즉시 표시되고, 필요시 백그라운드에서 리페치
  const { data: product, isLoading, isFetching } = useQuery({
    queryKey: ["product", 1],
    queryFn: () => fetchProduct(1),
    staleTime: 60 * 1000, // 1분간 fresh
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Prefetching 패턴 흐름:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Server Component에서 <code className="bg-white dark:bg-gray-800 px-1 rounded">queryClient.prefetchQuery()</code> 실행</li>
          <li>데이터가 QueryClient 캐시에 저장됨</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">dehydrate(queryClient)</code>로 상태를 직렬화</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">HydrationBoundary</code>로 클라이언트에 전달</li>
          <li>Client Component의 <code className="bg-white dark:bg-gray-800 px-1 rounded">useQuery</code>가 즉시 캐시된 데이터 사용</li>
        </ol>
      </div>

      <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
        {isFetching && !isLoading && (
          <div className="mb-4 text-sm text-blue-500">백그라운드 업데이트 중...</div>
        )}
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
          {product.price.toLocaleString()}원
        </p>
        <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">장점:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>초기 로딩 시간 단축 (서버에서 이미 데이터 가져옴)</li>
          <li>SEO 최적화 (서버에서 렌더링된 HTML 제공)</li>
          <li>더 나은 사용자 경험 (즉시 콘텐츠 표시)</li>
          <li>클라이언트에서 React Query의 모든 기능 사용 가능</li>
        </ul>
      </div>
    </div>
  );
}

