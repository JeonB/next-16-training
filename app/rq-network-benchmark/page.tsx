import Link from "next/link";

export default function RqNetworkBenchmarkIndexPage() {
  return (
    <main className="container mx-auto max-w-4xl py-10 px-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">RQ Network Benchmark</h1>
        <p className="text-muted-foreground">
          동일한 사용자 시나리오(페이지 이동 반복)를 수행하면서 전략별 네트워크 요청
          횟수를 비교합니다.
        </p>
      </header>

      <section className="rounded-lg border p-4 space-y-3 bg-muted/20">
        <h2 className="text-lg font-semibold">측정 방법(권장)</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>DevTools → Network → Preserve log 켜기</li>
          <li>
            필터에 <span className="font-mono">/api/users</span> 입력
          </li>
          <li>아래 페이지에서 “자동 왕복” 버튼을 눌러 요청 수를 비교</li>
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
          href="/rq-network-benchmark/a?strategy=aggressive"
        >
          <div className="font-semibold">Aggressive</div>
          <div className="text-sm text-muted-foreground">
            staleTime=0 + refetchOnMount=&quot;always&quot; 등으로 매번 요청 유도
          </div>
        </Link>
        <Link
          className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
          href="/rq-network-benchmark/a?strategy=cached"
        >
          <div className="font-semibold">Cached</div>
          <div className="text-sm text-muted-foreground">
            staleTime 유지 + refetch 조건 최소화로 요청 감소
          </div>
        </Link>
      </section>
    </main>
  );
}

