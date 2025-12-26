"use client";

import { useState } from "react";

/**
 * Client Component 예제
 * 인터랙션이 필요한 컴포넌트
 */

interface ClientInteractiveComponentProps {
  initialCount: number;
}

// Client Component ('use client' 지시어 필요)
export function ClientInteractiveComponent({ initialCount }: ClientInteractiveComponentProps) {
  const [count, setCount] = useState(initialCount);
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Client Component (인터랙션)</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            카운터: <span className="font-semibold text-lg">{count}</span>
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCount((prev) => prev - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              -1
            </button>
            <button
              onClick={() => setCount((prev) => prev + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              +1
            </button>
            <button
              onClick={() => setCount(initialCount)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm">활성 상태: {isActive ? "활성" : "비활성"}</span>
          </label>
        </div>
      </div>

      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          ✅ 이 컴포넌트는 클라이언트에서 렌더링되며 인터랙션을 처리합니다.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          초기값 ({initialCount})은 Server Component에서 전달받았습니다.
        </p>
      </div>
    </div>
  );
}

