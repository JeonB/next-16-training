"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

/**
 * React Query Query Options Factory 패턴 데모
 * queryOptions를 사용한 타입 안전한 쿼리 옵션 생성
 */

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

interface ProductListParams {
  category?: string;
  page?: number;
  limit?: number;
}

// API 함수
async function fetchProduct(productId: number): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: productId,
    name: `Product ${productId}`,
    price: productId * 10000,
    category: productId % 2 === 0 ? "electronics" : "clothing",
    description: `Description for Product ${productId}`,
  };
}

async function fetchProducts(params: ProductListParams): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return Array.from({ length: 5 }, (_, i) => ({
    id: params.page ? (params.page - 1) * 5 + i + 1 : i + 1,
    name: `Product ${i + 1}`,
    price: (i + 1) * 10000,
    category: params.category || (i % 2 === 0 ? "electronics" : "clothing"),
    description: `Description for Product ${i + 1}`,
  }));
}

// Query Keys Factory (이미 있는 패턴과 일관성 유지)
const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
} as const;

// Query Options Factory: 개별 제품 조회
function productDetailOptions(productId: number) {
  return queryOptions({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProduct(productId),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// Query Options Factory: 제품 목록 조회
function productListOptions(params?: ProductListParams) {
  return queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params || {}),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
}

// Query Options Factory를 사용하는 컴포넌트
function ProductDetail({ productId }: { productId: number }) {
  // queryOptions를 직접 사용 (타입 안전)
  const { data: product, isLoading, error } = useQuery(productDetailOptions(productId));

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-red-700 dark:text-red-400">제품을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
        {product.price.toLocaleString()}원
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">카테고리: {product.category}</p>
      <p className="text-sm text-gray-700 dark:text-gray-200">{product.description}</p>
    </div>
  );
}

function ProductsList({ params }: { params?: ProductListParams }) {
  const { data: products, isLoading, error } = useQuery(productListOptions(params));

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !products) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-red-700 dark:text-red-400">제품 목록을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-semibold mb-3">제품 목록 ({products.length}개):</h3>
      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="p-2 border rounded bg-gray-50 dark:bg-gray-900">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {product.price.toLocaleString()}원 - {product.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QueryOptionsFactoryDemo() {
  const [productId, setProductId] = useState(1);
  const [category, setCategory] = useState<string>("");

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Query Options Factory 패턴의 장점:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>타입 안전성: queryOptions가 타입을 자동 추론</li>
          <li>재사용성: Server Component와 Client Component에서 모두 사용 가능</li>
          <li>일관성: 쿼리 옵션을 한 곳에서 관리</li>
          <li>prefetchQuery와 useQuery에서 동일한 옵션 사용</li>
          <li>코드 중복 제거</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">1. 제품 상세 (productDetailOptions 사용):</h3>
          <div className="mb-2">
            <label className="block mb-2 font-medium">
              Product ID:
              <input
                type="number"
                min="1"
                max="10"
                value={productId}
                onChange={(e) => setProductId(parseInt(e.target.value) || 1)}
                className="ml-2 px-3 py-1 border rounded"
              />
            </label>
          </div>
          <ProductDetail productId={productId} />
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. 제품 목록 (productListOptions 사용):</h3>
          <div className="mb-2">
            <label className="block mb-2 font-medium">
              카테고리 필터:
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="ml-2 px-3 py-1 border rounded"
              >
                <option value="">전체</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
              </select>
            </label>
          </div>
          <ProductsList params={category ? { category } : undefined} />
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">Server Component에서 사용 예시:</h3>
        <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`// Server Component
const queryClient = getQueryClient();
await queryClient.prefetchQuery(
  productDetailOptions(productId)
);

// Client Component
const { data } = useQuery(
  productDetailOptions(productId)
);`}
        </pre>
        <p className="text-sm mt-2">
          동일한 queryOptions를 Server와 Client에서 모두 사용할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

