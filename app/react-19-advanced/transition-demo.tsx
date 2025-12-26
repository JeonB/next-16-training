"use client";

import { useTransition, startTransition, useState, useDeferredValue } from "react";

/**
 * React 19 useTransition과 startTransition 데모
 * 비동기 상태 업데이트와 UI 반응성 유지
 */

// 큰 리스트 생성 (느린 렌더링 시뮬레이션)
function generateLargeList(searchTerm: string): string[] {
  const items: string[] = [];
  for (let i = 1; i <= 50000; i++) {
    if (searchTerm === "" || String(i).includes(searchTerm)) {
      items.push(`Item ${i}`);
    }
  }
  return items;
}

// 일반 상태 업데이트 (블로킹)
function ListWithoutTransition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsUpdating(true);
    // 동기적으로 리스트 업데이트 (UI 블로킹)
    const newItems = generateLargeList(value);
    setItems(newItems);
    setIsUpdating(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 font-medium">
          검색 (일반 상태 업데이트):
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
            placeholder="숫자 입력..."
          />
        </label>
        {isUpdating && <span className="ml-2 text-sm text-blue-500">업데이트 중...</span>}
      </div>
      <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
        <p className="text-sm text-red-700 dark:text-red-400 mb-2">
          ⚠️ 입력이 끊기는 현상 발생 (블로킹)
        </p>
        <div className="max-h-40 overflow-y-auto">
          {items.slice(0, 100).map((item, index) => (
            <div key={index} className="text-sm py-1">
              {item}
            </div>
          ))}
          {items.length > 100 && (
            <div className="text-sm text-muted-foreground">
              ... 외 {items.length - 100}개
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          총 {items.length}개 항목
        </p>
      </div>
    </div>
  );
}

// useTransition 사용 (비블로킹)
function ListWithTransition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setSearchTerm(value); // 즉시 반영 (긴급 업데이트)

    // 느린 업데이트는 transition으로 처리 (비긴급)
    startTransition(() => {
      const newItems = generateLargeList(value);
      setItems(newItems);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 font-medium">
          검색 (useTransition 사용):
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
            placeholder="숫자 입력..."
          />
        </label>
        {isPending && <span className="ml-2 text-sm text-blue-500">업데이트 중...</span>}
      </div>
      <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
        <p className="text-sm text-green-700 dark:text-green-400 mb-2">
          ✅ 입력이 부드럽게 반응 (비블로킹)
        </p>
        <div className="max-h-40 overflow-y-auto">
          {items.slice(0, 100).map((item, index) => (
            <div key={index} className="text-sm py-1">
              {item}
            </div>
          ))}
          {items.length > 100 && (
            <div className="text-sm text-muted-foreground">
              ... 외 {items.length - 100}개
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          총 {items.length}개 항목 {isPending && "(업데이트 중...)"}
        </p>
      </div>
    </div>
  );
}

// useDeferredValue 사용 (대안)
function ListWithDeferredValue() {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const items = generateLargeList(deferredSearchTerm);
  const isPending = searchTerm !== deferredSearchTerm;

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 font-medium">
          검색 (useDeferredValue 사용):
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 px-3 py-1 border rounded"
            placeholder="숫자 입력..."
          />
        </label>
        {isPending && <span className="ml-2 text-sm text-blue-500">업데이트 중...</span>}
      </div>
      <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
        <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
          ✅ useDeferredValue로 값 업데이트 지연
        </p>
        <div className="max-h-40 overflow-y-auto">
          {items.slice(0, 100).map((item, index) => (
            <div key={index} className="text-sm py-1">
              {item}
            </div>
          ))}
          {items.length > 100 && (
            <div className="text-sm text-muted-foreground">
              ... 외 {items.length - 100}개
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          총 {items.length}개 항목 {isPending && "(업데이트 중...)"}
        </p>
      </div>
    </div>
  );
}

export function TransitionDemo() {
  return (
    <div className="space-y-8">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">useTransition과 startTransition:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">useTransition</code>: 비동기 상태 업데이트 관리</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">startTransition</code>: 긴급하지 않은 업데이트를 transition으로 표시</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">useDeferredValue</code>: 값 업데이트를 지연시켜 UI 반응성 유지</li>
          <li>입력 필드가 끊기는 현상 방지</li>
          <li>긴급 업데이트와 비긴급 업데이트 구분</li>
        </ul>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">1. 일반 상태 업데이트 (블로킹):</h3>
          <ListWithoutTransition />
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. useTransition 사용 (비블로킹):</h3>
          <ListWithTransition />
        </div>

        <div>
          <h3 className="font-semibold mb-3">3. useDeferredValue 사용 (대안):</h3>
          <ListWithDeferredValue />
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">언제 사용하나요?</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>useTransition:</strong> 여러 상태를 업데이트하는 경우</li>
          <li><strong>useDeferredValue:</strong> 단일 값을 지연시키는 경우</li>
          <li>검색 입력 필드, 필터링, 정렬 등에서 유용</li>
          <li>사용자 입력에 즉시 반응해야 하는 UI에서 필수</li>
        </ul>
      </div>
    </div>
  );
}

