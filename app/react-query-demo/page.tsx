import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/components/providers/get-query-client";
import { userListOptions } from "@/lib/queries/user-queries";
import { UserList } from "./user-list";

/**
 * React Query 학습 예시 메인 페이지
 * 서버 컴포넌트에서 초기 데이터 prefetch
 */
export default async function ReactQueryDemoPage() {
  const queryClient = getQueryClient();

  // 초기 페이지 데이터 prefetch
  await queryClient.prefetchQuery(userListOptions({ page: 1, limit: 10 }));

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">React Query 학습 예시</h1>
        <p className="text-muted-foreground">
          TanStack Query v5 최신 문법을 활용한 다양한 패턴 학습
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <UserList />
      </HydrationBoundary>
    </main>
  );
}
