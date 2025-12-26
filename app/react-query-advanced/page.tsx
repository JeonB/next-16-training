import { InfiniteQueriesDemo } from "./infinite-queries-demo";
import { ParallelQueriesDemo } from "./parallel-queries-demo";
import { DependentQueriesDemo } from "./dependent-queries-demo";
import { PrefetchingDemo } from "./prefetching-demo";
import { SuspenseIntegrationDemo } from "./suspense-integration-demo";

/**
 * React Query 고급 패턴 학습 페이지
 *
 * TanStack Query v5의 고급 기능과 실전 패턴들을 학습합니다.
 */
export default function ReactQueryAdvancedPage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React Query 고급 패턴</h1>
        <p className="text-lg text-muted-foreground mb-2">
          TanStack Query v5의 고급 기능과 실전 패턴을 학습합니다.
        </p>
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <h2 className="font-semibold mb-2">학습 내용:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Infinite Queries (무한 스크롤)</li>
            <li>Parallel Queries (useQueries)</li>
            <li>Dependent Queries (순차적 쿼리)</li>
            <li>Prefetching 전략 (사전 데이터 로딩)</li>
            <li>Suspense 통합 (React 18+)</li>
          </ul>
        </div>
      </div>

      <div className="space-y-16">
        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">1. Infinite Queries (무한 스크롤)</h2>
          <p className="text-muted-foreground mb-6">
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useInfiniteQuery</code>를 사용하여
            페이지네이션이 있는 데이터를 효율적으로 로드합니다.
          </p>
          <InfiniteQueriesDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">2. Parallel Queries (병렬 쿼리)</h2>
          <p className="text-muted-foreground mb-6">
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useQueries</code>를 사용하여
            여러 쿼리를 동시에 실행하고 관리합니다.
          </p>
          <ParallelQueriesDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">3. Dependent Queries (의존적 쿼리)</h2>
          <p className="text-muted-foreground mb-6">
            첫 번째 쿼리 결과에 따라 두 번째 쿼리를 실행하는 패턴입니다.
          </p>
          <DependentQueriesDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">4. Prefetching 전략</h2>
          <p className="text-muted-foreground mb-6">
            사용자가 필요할 것 같은 데이터를 미리 로드하여 사용자 경험을 향상시킵니다.
          </p>
          <PrefetchingDemo />
        </section>

        <section className="pb-12">
          <h2 className="text-3xl font-bold mb-4">5. Suspense 통합</h2>
          <p className="text-muted-foreground mb-6">
            React Suspense와 React Query를 함께 사용하여 선언적인 로딩 상태를 관리합니다.
          </p>
          <SuspenseIntegrationDemo />
        </section>
      </div>
    </main>
  );
}

