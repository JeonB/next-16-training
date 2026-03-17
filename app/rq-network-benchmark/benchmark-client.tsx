"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import {
  benchmarkKeys,
  benchmarkUserListOptions,
  type BenchmarkStrategy,
} from "@/lib/queries/benchmark-queries";
import { Button } from "@/components/ui/button";

type BenchmarkPageId = "a" | "b";

function parseStrategy(value: string | null): BenchmarkStrategy {
  return value === "aggressive" ? "aggressive" : "cached";
}

export function BenchmarkClient({ pageId }: { pageId: BenchmarkPageId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const strategy = parseStrategy(searchParams.get("strategy"));
  const limit = 10;

  const queryOptions = useMemo(
    () => benchmarkUserListOptions({ page: 1, limit, strategy }),
    [limit, strategy]
  );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    fetchStatus,
    status,
    dataUpdatedAt,
  } = useQuery(queryOptions);

  const isFetchingCount = useIsFetching({
    queryKey: benchmarkKeys.usersList({ page: 1, limit, strategy }),
  });

  const [hops, setHops] = useState(10);
  const [delayMs, setDelayMs] = useState(250);
  const [isRunning, setIsRunning] = useState(false);
  const runIdRef = useRef(0);

  const otherPage = pageId === "a" ? "b" : "a";

  useEffect(() => {
    // 각 페이지 마운트가 "refetchOnMount" 영향을 받게 하기 위해,
    // 여기서는 별도 side-effect 없이 useQuery만 유지합니다.
  }, []);

  async function runAutoHops() {
    runIdRef.current += 1;
    const runId = runIdRef.current;
    setIsRunning(true);

    for (let i = 0; i < hops; i += 1) {
      if (runIdRef.current !== runId) break;

      const nextPage = i % 2 === 0 ? otherPage : pageId;
      router.push(`/rq-network-benchmark/${nextPage}?strategy=${strategy}`);

      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), delayMs);
      });
    }

    if (runIdRef.current === runId) {
      setIsRunning(false);
    }
  }

  function stop() {
    runIdRef.current += 1;
    setIsRunning(false);
  }

  return (
    <main className="container mx-auto max-w-4xl py-10 px-4 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Benchmark {pageId.toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">
            strategy:{" "}
            <span className="font-mono font-semibold">{strategy}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            className="text-sm text-blue-600 hover:underline"
            href="/rq-network-benchmark"
          >
            인덱스로
          </Link>
          <Link
            className="text-sm text-blue-600 hover:underline"
            href={`/rq-network-benchmark/${otherPage}?strategy=${strategy}`}
          >
            {otherPage.toUpperCase()}로 이동
          </Link>
        </div>
      </header>

      <section className="rounded-lg border p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="space-y-1">
            <div className="text-xs text-muted-foreground">hops</div>
            <input
              type="number"
              name="hops"
              min={2}
              max={200}
              value={hops}
              onChange={(e) => setHops(Number(e.target.value))}
              className="w-28 px-3 py-2 border rounded-md bg-background"
              disabled={isRunning}
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-muted-foreground">delay(ms)</div>
            <input
              type="number"
              name="delayMs"
              min={50}
              max={5000}
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              className="w-32 px-3 py-2 border rounded-md bg-background"
              disabled={isRunning}
            />
          </label>

          <div className="flex gap-2">
            <Button onClick={runAutoHops} disabled={isRunning}>
              자동 왕복 실행
            </Button>
            <Button variant="outline" onClick={stop} disabled={!isRunning}>
              정지
            </Button>
          </div>

          <div className="ml-auto flex gap-2">
            <Link
              className="text-sm text-blue-600 hover:underline"
              href={`/rq-network-benchmark/${pageId}?strategy=aggressive`}
            >
              aggressive로
            </Link>
            <Link
              className="text-sm text-blue-600 hover:underline"
              href={`/rq-network-benchmark/${pageId}?strategy=cached`}
            >
              cached로
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          DevTools Network에서 <span className="font-mono">/api/users</span>로
          필터 후, “자동 왕복 실행” 전/후 요청 수를 비교하세요.
        </p>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold">현재 페이지에서 발생하는 요청</h2>
        <div className="text-sm text-muted-foreground">
          {isError ? (
            <span className="text-destructive">요청 실패</span>
          ) : isLoading ? (
            <span>로딩 중...</span>
          ) : (
            <span>
              users: <span className="font-mono">{data?.users.length ?? 0}</span>{" "}
              / total: <span className="font-mono">{data?.total ?? 0}</span>
            </span>
          )}
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="font-medium text-foreground/80 mb-1">
              fetch indicators
            </div>
            <div>
              status: <span className="font-mono">{status}</span>
            </div>
            <div>
              fetchStatus: <span className="font-mono">{fetchStatus}</span>
            </div>
            <div>
              isFetching: <span className="font-mono">{String(isFetching)}</span>
            </div>
            <div>
              isFetchingCount:{" "}
              <span className="font-mono">{isFetchingCount}</span>
            </div>
          </div>

          <div className="rounded-md border bg-muted/20 p-3">
            <div className="font-medium text-foreground/80 mb-1">
              last fetch time
            </div>
            <div>
              dataUpdatedAt:{" "}
              <span className="font-mono">
                {dataUpdatedAt
                  ? new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")
                  : "-"}
              </span>
            </div>
            <div className="mt-1">
              <span className="font-mono">aggressive</span>는 왕복 시마다 이 값이
              계속 갱신되는 게 정상입니다.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

