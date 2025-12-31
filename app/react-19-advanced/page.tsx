import { TransitionDemo } from "./transition-demo";
import { ConcurrentFeaturesDemo } from "./concurrent-features-demo";
import { ServerClientIntegrationDemo } from "./server-client-integration-demo";
import { UseHookContext } from "./use-hook-context";
import { ContextProvider } from "@/components/providers/context-provider";

/**
 * React 19 고급 패턴 학습 페이지
 *
 * React 19의 고급 기능과 실전 패턴들을 학습합니다.
 */
export default function React19AdvancedPage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React 19 고급 패턴</h1>
        <p className="text-lg text-muted-foreground mb-2">
          React 19의 고급 기능과 실전 패턴을 학습합니다.
        </p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h2 className="font-semibold mb-2">학습 내용:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>useTransition과 startTransition</li>
            <li>Concurrent Features (동시성 기능)</li>
            <li>Server Components와 Client Components 통합 패턴</li>
            <li>성능 최적화 전략</li>
          </ul>
        </div>
      </div>

      <div className="space-y-16">
        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">
            1. useTransition과 startTransition
          </h2>
          <p className="text-muted-foreground mb-6">
            비동기 상태 업데이트를 처리하고 UI의 반응성을 유지하는 방법을
            학습합니다.
          </p>
          <TransitionDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">2. Concurrent Features</h2>
          <p className="text-muted-foreground mb-6">
            React 18+의 동시성 기능을 활용하여 더 나은 사용자 경험을 제공합니다.
          </p>
          <ConcurrentFeaturesDemo />
        </section>

        <section className="pb-12">
          <h2 className="text-3xl font-bold mb-4">
            3. Server & Client Components 통합
          </h2>
          <p className="text-muted-foreground mb-6">
            Next.js App Router에서 Server Components와 Client Components를
            효과적으로 통합하는 패턴입니다.
          </p>
          <ServerClientIntegrationDemo />
        </section>

        <section className="pb-12">
          <h2 className="text-3xl font-bold mb-4">4. useHookContext</h2>
          <p className="text-muted-foreground mb-6">
            useHookContext를 사용하여 컴포넌트에서 컨텍스트를 사용합니다.
          </p>

          <ContextProvider>
            <UseHookContext />
          </ContextProvider>
        </section>
      </div>
    </main>
  );
}
