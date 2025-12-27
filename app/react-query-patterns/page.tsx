import { QueryCancellationDemo } from "./query-cancellation-demo";
import { CustomHooksDemo } from "./custom-hooks-demo";
import { QueryOptionsFactoryDemo } from "./query-options-factory-demo";
import { CacheOptimizationDemo } from "./cache-optimization-demo";
import { RealWorldScenariosDemo } from "./real-world-scenarios-demo";

/**
 * React Query 실전 패턴 학습 페이지
 *
 * 프로덕션 환경에서 사용하는 실전 패턴과 Best Practices를 학습합니다.
 */
export default function ReactQueryPatternsPage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React Query 실전 패턴</h1>
        <p className="text-lg text-muted-foreground mb-2">
          프로덕션 환경에서 사용하는 실전 패턴과 Best Practices를 학습합니다.
        </p>
        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
          <h2 className="font-semibold mb-2">학습 내용:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Query Cancellation (쿼리 취소)</li>
            <li>Custom Hooks 패턴</li>
            <li>Query Options Factory 패턴</li>
            <li>캐시 최적화 전략</li>
            <li>실전 시나리오 예제</li>
          </ul>
        </div>
      </div>

      <div className="space-y-16">
        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">1. Query Cancellation (쿼리 취소)</h2>
          <p className="text-muted-foreground mb-6">
            불필요한 네트워크 요청을 취소하여 성능을 최적화하고 리소스를 절약합니다.
          </p>
          <QueryCancellationDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">2. Custom Hooks 패턴</h2>
          <p className="text-muted-foreground mb-6">
            재사용 가능한 Custom Hooks를 만들어 코드 중복을 줄이고 유지보수성을 향상시킵니다.
          </p>
          <CustomHooksDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">3. Query Options Factory 패턴</h2>
          <p className="text-muted-foreground mb-6">
            queryOptions를 사용하여 타입 안전하고 재사용 가능한 쿼리 옵션을 생성합니다.
          </p>
          <QueryOptionsFactoryDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">4. 캐시 최적화 전략</h2>
          <p className="text-muted-foreground mb-6">
            캐시 전략을 최적화하여 불필요한 네트워크 요청을 줄이고 성능을 향상시킵니다.
          </p>
          <CacheOptimizationDemo />
        </section>

        <section className="pb-12">
          <h2 className="text-3xl font-bold mb-4">5. 실전 시나리오 예제</h2>
          <p className="text-muted-foreground mb-6">
            실제 프로젝트에서 자주 마주치는 복합적인 시나리오를 해결하는 패턴입니다.
          </p>
          <RealWorldScenariosDemo />
        </section>
      </div>
    </main>
  );
}

