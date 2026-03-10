"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Prefetching 데모
 * 사용자가 필요할 것 같은 데이터를 미리 로드
 */

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// 제품 정보 가져오기
async function fetchProduct(productId: number): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: productId,
    name: `Product ${productId}`,
    price: productId * 10000,
    description: `This is a description for Product ${productId}. It's a great product!`,
  };
}

function ProductCard({ productId, onSelect }: { productId: number; onSelect: () => void }) {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  // Prefetching: 마우스 호버 시 미리 데이터 로드
  const handleMouseEnter = () => {
    setIsHovered(true);
    queryClient.prefetchQuery({
      queryKey: ["product", productId],
      queryFn: () => fetchProduct(productId),
      staleTime: 5 * 60 * 1000, // 5분간 fresh 유지
    });
  };

  return (
    <div
      className="p-4 border rounded-lg bg-white cursor-pointer hover:shadow-lg transition-shadow"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <h3 className="font-semibold mb-1">Product {productId}</h3>
      {isHovered && (
        <p className="text-xs text-blue-500">데이터 미리 로딩 중...</p>
      )}
      <p className="text-sm text-muted-foreground">클릭하여 상세보기</p>
    </div>
  );
}

function ProductDetail({ productId }: { productId: number | null }) {
  const {
    data: product,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId!),
    enabled: productId !== null,
    staleTime: 5 * 60 * 1000, // prefetch와 동일한 staleTime
  });

  if (!productId) {
    return (
      <div className="p-8 border rounded-lg bg-gray-50 text-center text-muted-foreground">
        제품을 선택하세요
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 border rounded-lg bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 border rounded-lg bg-red-50">
        <p className="text-red-700">
          에러 발생: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="p-6 border rounded-lg bg-white">
      {isFetching && !isLoading && (
        <div className="mb-4 text-sm text-blue-500">업데이트 중...</div>
      )}
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      <p className="text-3xl font-semibold text-blue-600 mb-4">
        {product.price.toLocaleString()}원
      </p>
      <p className="text-gray-700">{product.description}</p>
    </div>
  );
}

export function PrefetchingDemo() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const productIds = [1, 2, 3, 4, 5];

  // 버튼 클릭으로 prefetch
  const handlePrefetchAll = () => {
    productIds.forEach((id) => {
      queryClient.prefetchQuery({
        queryKey: ["product", id],
        queryFn: () => fetchProduct(id),
      });
    });
  };

  // 특정 제품 prefetch
  const handlePrefetchProduct = (productId: number) => {
    queryClient.prefetchQuery({
      queryKey: ["product", productId],
      queryFn: () => fetchProduct(productId),
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Prefetching 전략:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>호버 시 prefetch:</strong> 사용자가 호버한 항목 미리 로드</li>
          <li><strong>라우트 prefetch:</strong> 다음 페이지로 이동할 데이터 미리 로드</li>
          <li><strong>버튼 클릭 prefetch:</strong> 특정 액션 시 관련 데이터 미리 로드</li>
          <li><strong>마운트 시 prefetch:</strong> 컴포넌트 마운트 시 관련 데이터 미리 로드</li>
          <li>staleTime을 설정하여 캐시 활용</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">Prefetch 액션:</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handlePrefetchAll}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm"
            >
              모든 제품 미리 로드
            </button>
            {productIds.map((id) => (
              <button
                key={id}
                onClick={() => handlePrefetchProduct(id)}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Product {id} 미리 로드
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">제품 목록 (호버 시 자동 prefetch):</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productIds.map((id) => (
              <ProductCard
                key={id}
                productId={id}
                onSelect={() => setSelectedProductId(id)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">제품 상세:</h3>
          <ProductDetail productId={selectedProductId} />
          <p className="mt-2 text-sm text-muted-foreground">
            💡 제품 카드를 호버하면 데이터가 미리 로드되어 클릭 시 즉시 표시됩니다.
          </p>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">실전 활용:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>이커머스: 제품 목록에서 호버 시 상세 정보 미리 로드</li>
          <li>소셜 미디어: 피드 스크롤 시 다음 페이지 미리 로드</li>
          <li>대시보드: 주요 데이터 미리 로드하여 초기 로딩 시간 단축</li>
          <li>네비게이션: 링크 호버 시 해당 페이지 데이터 미리 로드</li>
        </ul>
      </div>
    </div>
  );
}

