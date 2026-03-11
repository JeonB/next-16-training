"use client";

import { useEffect, useState } from "react";

type Stats = {
  unboundedCacheSize: number;
  requestContextLogLength: number;
  leakyIntervalRunning: boolean;
  leakyIntervalTickCount: number;
};

const POLL_INTERVAL_MS = 1500;

async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/memory-leak-demo?action=stats", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchStats();
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      }
    };

    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 font-semibold">현재 상태 (서버 메모리 데모)</h2>
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 font-semibold">현재 상태 (서버 메모리 데모)</h2>
        <p className="text-sm text-zinc-500">로딩 중...</p>
      </section>
    );
  }

  return (
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
      <p className="mt-2 text-xs text-zinc-400">
        약 {POLL_INTERVAL_MS / 1000}초마다 자동 갱신
      </p>
    </section>
  );
}
