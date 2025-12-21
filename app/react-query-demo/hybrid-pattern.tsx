import { UserList } from "@/app/react-query-demo/user-list";
import { getQueryClient } from "@/components/providers/get-query-client";
import { userKeys } from "@/lib/queries/user-queries";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

/**
 * React Query 학습 예시 메인 페이지
 * 하이브리드 패턴
 */
export default async function ReactQueryDemoPage() {
  // 서버에서 직접 fetch
  const response = await fetch(
    `${process.env.API_URL}/api/users?page=1&limit=10`
  );
  const initialData = await response.json();

  const queryClient = getQueryClient();

  // React Query 캐시에 직접 설정 (prefetch 대신)
  queryClient.setQueryData(userKeys.list({ page: 1, limit: 10 }), initialData);

  return (
    <main className="container mx-auto py-8 px-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UserList />
      </HydrationBoundary>
    </main>
  );
}
