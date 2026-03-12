"use client";

import { useQueries } from "@tanstack/react-query";

/**
 * useQueries 최소 예제 (TanStack Query v5 / 2026 기준)
 *
 * 따라 하기용: id 목록에 대해 병렬로 fetch 후 결과 배열로 다루는 패턴
 *
 * @example
 * const ids = [1, 2, 3];
 * const results = useQueries({
 *   queries: ids.map((id) => ({
 *     queryKey: ["item", id],
 *     queryFn: () => fetch(`/api/items/${id}`).then((r) => r.json()),
 *   })),
 * });
 * // results[0].data, results[0].isLoading, results[0].isError ...
 */

interface Item {
  id: number;
  label: string;
}

async function fetchItem(id: number): Promise<Item> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
  return { id, label: `Item ${id}` };
}

const IDS = [1, 2, 3];

export function UseQueriesMinimalExample() {
  const results = useQueries({
    queries: IDS.map((id) => ({
      queryKey: ["item", id] as const,
      queryFn: () => fetchItem(id),
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.isError);

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <h4 className="font-semibold">useQueries 최소 예제</h4>
      <p className="text-sm text-zinc-600">
        id 목록 [1, 2, 3]에 대해 병렬로 fetch하고, 각 결과를 배열로 다룹니다.
      </p>
      {isLoading && <p className="text-sm text-blue-600">로딩 중...</p>}
      {error && (
        <p className="text-sm text-red-600">
          오류: {error.error instanceof Error ? error.error.message : "Unknown"}
        </p>
      )}
      <ul className="list-disc list-inside text-sm">
        {results.map((r, i) => (
          <li key={IDS[i]}>
            {r.data ? r.data.label : r.isLoading ? "..." : "-"}
          </li>
        ))}
      </ul>
      <pre className="overflow-x-auto rounded bg-zinc-100 p-2 text-xs">
        {`const results = useQueries({
  queries: ids.map((id) => ({
    queryKey: ["item", id],
    queryFn: () => fetchItem(id),
  })),
});
// results[0].data, results[0].isLoading, ...`}
      </pre>
    </div>
  );
}
