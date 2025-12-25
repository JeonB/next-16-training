import { QueryBasicsDemo } from "./query-basics-demo";
import { MutationBasicsDemo } from "./mutation-basics-demo";
import { QueryInvalidationDemo } from "./query-invalidation-demo";
import { OptimisticUpdatesDemo } from "./optimistic-updates-demo";
import { ErrorHandlingDemo } from "./error-handling-demo";
import { QueryKeysDemo } from "./query-keys-demo";

/**
 * React Query 핵심 기본기 학습 페이지
 *
 * TanStack Query (React Query) v5의 핵심 개념들을 단계별로 학습할 수 있는 예제 모음
 */
export default function ReactQueryBasicsPage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React Query 핵심 기본기 학습</h1>
        <p className="text-lg text-muted-foreground mb-2">
          TanStack Query v5의 핵심 개념을 단계별로 학습합니다.
        </p>
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <h2 className="font-semibold mb-2">학습 내용:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>기본 Query 사용법 (useQuery)</li>
            <li>Mutation 사용법 (useMutation)</li>
            <li>Query Keys 관리와 구조화</li>
            <li>Query Invalidation (캐시 무효화)</li>
            <li>Optimistic Updates (낙관적 업데이트)</li>
            <li>Error Handling (에러 처리)</li>
          </ul>
        </div>
      </div>

      <div className="space-y-16">
        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">1. 기본 Query (useQuery)</h2>
          <p className="text-muted-foreground mb-6">
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useQuery</code>는
            서버에서 데이터를 가져오고 캐싱하는 가장 기본적인 훅입니다.
          </p>
          <QueryBasicsDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">2. Query Keys 관리</h2>
          <p className="text-muted-foreground mb-6">
            Query Keys는 쿼리를 식별하고 그룹화하는 핵심 메커니즘입니다.
            구조화된 키를 사용하면 캐시 관리가 훨씬 쉬워집니다.
          </p>
          <QueryKeysDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">3. Mutation (useMutation)</h2>
          <p className="text-muted-foreground mb-6">
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useMutation</code>는
            서버의 데이터를 생성, 수정, 삭제하는 작업을 처리합니다.
          </p>
          <MutationBasicsDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">4. Query Invalidation (캐시 무효화)</h2>
          <p className="text-muted-foreground mb-6">
            데이터가 변경되었을 때 관련된 쿼리 캐시를 무효화하여
            자동으로 리페치하도록 할 수 있습니다.
          </p>
          <QueryInvalidationDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">5. Optimistic Updates (낙관적 업데이트)</h2>
          <p className="text-muted-foreground mb-6">
            서버 응답을 기다리지 않고 즉시 UI를 업데이트하여
            더 나은 사용자 경험을 제공할 수 있습니다.
          </p>
          <OptimisticUpdatesDemo />
        </section>

        <section className="pb-12">
          <h2 className="text-3xl font-bold mb-4">6. Error Handling (에러 처리)</h2>
          <p className="text-muted-foreground mb-6">
            React Query는 다양한 방법으로 에러를 처리할 수 있습니다.
            전역 에러 처리부터 개별 쿼리 에러 처리까지 알아봅니다.
          </p>
          <ErrorHandlingDemo />
        </section>
      </div>
    </main>
  );
}

