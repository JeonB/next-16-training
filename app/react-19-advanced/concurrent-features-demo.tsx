"use client";

import { useState, Suspense, useMemo } from "react";
import { use } from "react";

/**
 * React 19 Concurrent Features 데모
 * 동시성 기능과 최적화 패턴
 */

// 느린 데이터 가져오기 시뮬레이션
function fetchData(key: string): Promise<{ data: string; timestamp: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `Data for ${key}`,
        timestamp: Date.now(),
      });
    }, 1500);
  });
}

// use 훅과 Suspense를 사용한 데이터 로딩
function DataDisplay({ dataPromise }: { dataPromise: Promise<{ data: string; timestamp: number }> }) {
  const result = use(dataPromise);

  return (
    <div className="p-4 border rounded-lg bg-white">
      <p className="font-semibold">{result.data}</p>
      <p className="text-xs text-muted-foreground mt-1">
        로드 시간: {new Date(result.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}

// 로딩 Fallback
function LoadingFallback({ label }: { label: string }) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">{label} 로딩 중...</span>
      </div>
    </div>
  );
}

export function ConcurrentFeaturesDemo() {
  const [tab, setTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

  // 각 탭의 데이터를 메모이제이션 (같은 탭으로 돌아가면 캐시 사용)
  const dataPromises = useMemo(() => {
    return {
      tab1: fetchData("tab1"),
      tab2: fetchData("tab2"),
      tab3: fetchData("tab3"),
    };
  }, []); // 한 번만 생성

  const currentDataPromise = dataPromises[tab];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Concurrent Features의 장점:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>여러 작업을 동시에 처리 가능</li>
          <li>Suspense로 선언적인 로딩 상태 관리</li>
          <li>우선순위 기반 렌더링</li>
          <li>중단 가능한 렌더링 (더 긴급한 업데이트가 있으면 중단)</li>
          <li>더 나은 사용자 경험</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3">탭 전환 (Concurrent 렌더링):</h3>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setTab("tab1")}
            className={`px-4 py-2 rounded-md ${
              tab === "tab1"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Tab 1
          </button>
          <button
            onClick={() => setTab("tab2")}
            className={`px-4 py-2 rounded-md ${
              tab === "tab2"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Tab 2
          </button>
          <button
            onClick={() => setTab("tab3")}
            className={`px-4 py-2 rounded-md ${
              tab === "tab3"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Tab 3
          </button>
        </div>

        <Suspense fallback={<LoadingFallback label={tab} />}>
          <DataDisplay dataPromise={currentDataPromise} />
        </Suspense>

        <p className="mt-4 text-sm text-muted-foreground">
          💡 각 탭의 데이터는 한 번만 로드되며, 탭을 다시 클릭하면 즉시 표시됩니다 (캐시 사용).
        </p>
      </div>

      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">Concurrent Features 활용:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>탭 전환 시 이전 탭 데이터 유지</li>
          <li>중단 가능한 렌더링으로 긴급 업데이트 우선 처리</li>
          <li>Suspense로 로딩 상태를 선언적으로 관리</li>
          <li>더 나은 성능과 사용자 경험</li>
        </ul>
      </div>
    </div>
  );
}

