/**
 * [데모 전용] 서버 사이드 메모리 누수 위험 시나리오 테스트 페이지
 * 프로덕션 사용 금지.
 */

import Link from "next/link";
import {
  getUnboundedCacheSize,
  getRequestContextLogLength,
  isLeakyIntervalRunning,
  getLeakyIntervalTickCount,
} from "@/lib/data/memory-leak-demo-store";

const API_BASE = "http://localhost:3000/api/memory-leak-demo";

function getStats() {
  return {
    unboundedCacheSize: getUnboundedCacheSize(),
    requestContextLogLength: getRequestContextLogLength(),
    leakyIntervalRunning: isLeakyIntervalRunning(),
    leakyIntervalTickCount: getLeakyIntervalTickCount(),
  };
}

export default function MemoryLeakDemoPage() {
  const stats = getStats();

  return (
    <div className="min-h-screen p-8 font-sans">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link className="text-blue-500 hover:underline" href="/">
            ← Home
          </Link>
          <h1 className="text-xl font-bold">[데모] 서버 메모리 누수 점검</h1>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            이 페이지와 /api/memory-leak-demo 는 교육용입니다. 프로덕션에서
            사용하지 마세요.
          </p>
        </div>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-2 font-semibold">현재 상태 (서버 메모리 데모)</h2>
          <ul className="space-y-1 text-sm">
            <li>무제한 캐시 크기: {stats.unboundedCacheSize}</li>
            <li>요청 로그 배열 길이: {stats.requestContextLogLength}</li>
            <li>
              Leaky setInterval 실행 중:{" "}
              {stats.leakyIntervalRunning ? "예" : "아니오"}
            </li>
            <li>Leaky interval tick 수: {stats.leakyIntervalTickCount}</li>
          </ul>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-2 font-semibold">
            누수 시나리오 트리거 (curl 또는 브라우저)
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>
              캐시 누적:{" "}
              <code className="rounded bg-zinc-200 px-1">
                GET {API_BASE}?action=cache&key=test1
              </code>
            </li>
            <li>
              요청 로그 누적:{" "}
              <code className="rounded bg-zinc-200 px-1">POST {API_BASE}</code>{" "}
              body: {`{"action":"request-log"}`}
            </li>
            <li>
              setInterval 시작:{" "}
              <code className="rounded bg-zinc-200 px-1">POST {API_BASE}</code>{" "}
              body: {`{"action":"start-interval"}`}
            </li>
          </ul>
        </section>

        <p className="text-sm text-zinc-500">
          자세한 점검 결과와 권장 사항:{" "}
          <code className="rounded bg-zinc-200 px-1">
            docs/SERVER_MEMORY_LEAK_AUDIT.md
          </code>
        </p>
      </div>
    </div>
  );
}
