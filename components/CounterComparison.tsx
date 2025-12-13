"use client";

import { useState, useRef, useEffect } from "react";
import CounterOptimized from "./CounterOptimized";
import CounterUnoptimized from "./CounterUnoptimized";

export default function CounterComparison() {
  const renderCountRef = useRef(0);
  const [showProfiling, setShowProfiling] = useState(false);

  // 렌더링 횟수 추적 (useRef를 사용하여 무한 루프 방지)
  renderCountRef.current += 1;

  return (
    <div className="space-y-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">React 19.2 최적화 비교</h1>
        <p className="text-gray-600 dark:text-gray-400">
          React 19.2와 Next.js 16에서는 React Compiler가 자동으로 메모이제이션을
          처리합니다
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setShowProfiling(!showProfiling)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showProfiling ? "프로파일링 숨기기" : "프로파일링 정보 보기"}
          </button>
        </div>
        {showProfiling && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left">
            <p className="text-sm">
              <strong>렌더링 횟수:</strong> {renderCountRef.current}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <CounterOptimized />
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p className="text-sm font-semibold mb-2">수동 최적화 버전</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>useMemo로 count 메모이제이션</li>
              <li>useCallback으로 핸들러 메모이제이션</li>
              <li>의존성 배열 관리 필요</li>
            </ul>
          </div>
        </div>

        <div>
          <CounterUnoptimized />
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="text-sm font-semibold mb-2">
              자동 최적화 버전 (React 19.2)
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>React Compiler가 자동으로 최적화</li>
              <li>코드가 더 간결하고 읽기 쉬움</li>
              <li>의존성 배열 관리 불필요</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="font-bold mb-2">성능 측정 방법:</h3>
        <ol className="list-decimalㅌㅌㅌㅌㅌㅌ list-inside space-y-2 text-sm">
          <li>브라우저에서 React DevTools 확장 프로그램 설치</li>
          <li>Profiler 탭 열기</li>
          <li>녹화 시작 후 두 버전의 버튼을 여러 번 클릭</li>
          <li>녹화 중지 후 렌더링 시간과 빈도 비교</li>
        </ol>
      </div>
    </div>
  );
}
