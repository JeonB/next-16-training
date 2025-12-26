import { PrefetchingPatternDemo } from "./prefetching-pattern-demo";
import { HydrationPatternDemo } from "./hydration-pattern-demo";
import { SSRPatternDemo } from "./ssr-pattern-demo";

/**
 * Next.js와 React Query 통합 패턴 학습 페이지
 *
 * Next.js App Router에서 React Query를 효과적으로 사용하는 실전 패턴들을 학습합니다.
 */
export default function NextJsReactQueryPage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Next.js & React Query 통합 패턴</h1>
        <p className="text-lg text-muted-foreground mb-2">
          Next.js App Router에서 React Query를 활용한 실전 패턴을 학습합니다.
        </p>
        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
          <h2 className="font-semibold mb-2">학습 내용:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Server Components에서 Prefetching</li>
            <li>HydrationBoundary를 통한 서버-클라이언트 상태 전달</li>
            <li>SSR/SSG 패턴과 React Query 통합</li>
            <li>실전 최적화 전략</li>
          </ul>
        </div>
      </div>

      <div className="space-y-16">
        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">1. Prefetching 패턴</h2>
          <p className="text-muted-foreground mb-6">
            Server Component에서 데이터를 미리 가져와 클라이언트에 전달하는 패턴입니다.
          </p>
          <PrefetchingPatternDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">2. Hydration 패턴</h2>
          <p className="text-muted-foreground mb-6">
            서버에서 가져온 데이터를 클라이언트의 React Query 캐시에 주입하는 방법입니다.
          </p>
          <HydrationPatternDemo />
        </section>

        <section className="pb-12">
          <h2 className="text-3xl font-bold mb-4">3. SSR/SSG 패턴</h2>
          <p className="text-muted-foreground mb-6">
            Server-Side Rendering과 Static Site Generation에서 React Query를 활용하는 패턴입니다.
          </p>
          <SSRPatternDemo />
        </section>
      </div>
    </main>
  );
}

