/**
 * SSR/SSG 패턴 데모
 * Server-Side Rendering과 React Query 통합
 */

import { getQueryClient } from "@/components/providers/get-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SSRClientComponent } from "./ssr-client-component";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Server Component에서 직접 데이터 가져오기
async function fetchPosts(): Promise<Post[]> {
  // 실제로는 데이터베이스나 API 호출
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Post ${i + 1}`,
    body: `This is the body of post ${i + 1}.`,
    userId: (i % 3) + 1,
  }));
}

/**
 * SSR 패턴: Server Component에서 데이터를 가져와
 * React Query 캐시에 설정 후 Client Component에 전달
 */
export async function SSRPatternDemo() {
  const queryClient = getQueryClient();

  // Server Component에서 직접 데이터 가져오기
  const posts = await fetchPosts();

  // React Query 캐시에 설정 (prefetch 대신 직접 설정)
  queryClient.setQueryData(["posts"], posts);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">SSR/SSG 패턴의 특징:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Server Component에서 데이터를 직접 가져옴</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">setQueryData</code>로 캐시에 설정</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">dehydrate</code>로 상태 직렬화</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">HydrationBoundary</code>로 클라이언트에 전달</li>
          <li>SSR: 매 요청마다 서버에서 렌더링</li>
          <li>SSG: 빌드 시점에 정적 HTML 생성</li>
        </ul>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <SSRClientComponent />
      </HydrationBoundary>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">실전 활용:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>블로그 포스트 목록 (SSG: 빌드 시 생성)</li>
          <li>사용자별 대시보드 (SSR: 요청 시 생성)</li>
          <li>검색 결과 (SSR: 동적 생성)</li>
          <li>SEO가 중요한 페이지</li>
        </ul>
      </div>
    </div>
  );
}

