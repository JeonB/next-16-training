import { UseHookDemo } from "./use-hook-demo";
import { RefPropDemo } from "./ref-prop-demo";
import { ActionsDemo } from "./actions-demo";
import { OptimisticDemo } from "./optimistic-demo";
import { FormStatusDemo } from "./form-status-demo";

/**
 * React 19 주요 변경사항 학습 페이지
 *
 * React 19의 핵심 새로운 기능들을 학습할 수 있는 예제 모음
 */
export default function React19DemoPage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React 19 주요 변경사항 학습</h1>
        <p className="text-lg text-muted-foreground mb-2">
          React 19.0 ~ 19.2 버전의 새로운 기능과 변경사항을 학습합니다.
        </p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h2 className="font-semibold mb-2">학습 내용:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><code className="bg-white dark:bg-gray-800 px-1 rounded">use</code> 훅 - Promise와 Context 처리</li>
            <li>ref를 일반 prop으로 전달 (forwardRef deprecated)</li>
            <li>Server Actions와 Form Actions</li>
            <li><code className="bg-white dark:bg-gray-800 px-1 rounded">useOptimistic</code> 훅</li>
            <li><code className="bg-white dark:bg-gray-800 px-1 rounded">useFormStatus</code> 및 <code className="bg-white dark:bg-gray-800 px-1 rounded">useFormState</code> 훅</li>
          </ul>
        </div>
      </div>

      <div className="space-y-16">
        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">1. use 훅</h2>
          <p className="text-muted-foreground mb-6">
            React 19에서 도입된 <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">use</code> 훅은
            Promise와 Context를 처리하는 새로운 방식입니다.
            Suspense와 함께 사용하여 더 선언적인 비동기 처리가 가능합니다.
          </p>
          <UseHookDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">2. ref를 일반 prop으로 전달</h2>
          <p className="text-muted-foreground mb-6">
            React 19부터 <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">forwardRef</code>가
            deprecated되었습니다. ref는 이제 일반 prop으로 전달할 수 있습니다.
          </p>
          <RefPropDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">3. Server Actions & Form Actions</h2>
          <p className="text-muted-foreground mb-6">
            React 19는 Server Actions를 네이티브로 지원합니다.
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">action</code> prop을 통해
            서버 함수를 직접 연결할 수 있습니다.
          </p>
          <ActionsDemo />
        </section>

        <section className="border-b pb-12">
          <h2 className="text-3xl font-bold mb-4">4. useOptimistic 훅</h2>
          <p className="text-muted-foreground mb-6">
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useOptimistic</code>는
            비동기 작업에 대해 낙관적 업데이트를 쉽게 구현할 수 있게 해줍니다.
            사용자 경험을 크게 향상시킵니다.
          </p>
          <OptimisticDemo />
        </section>

        <section className="pb-12">
          <h2 className="text-3xl font-bold mb-4">5. useFormStatus & useFormState</h2>
          <p className="text-muted-foreground mb-6">
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useFormStatus</code>와
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">useFormState</code>는
            폼의 상태를 더 쉽게 관리할 수 있게 해줍니다.
          </p>
          <FormStatusDemo />
        </section>
      </div>
    </main>
  );
}

