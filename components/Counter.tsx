"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Counter() {
  const [count, setCount] = useState(0);

  // React 19.2는 자동으로 메모이제이션을 해줍니다
  // useCallback, useMemo가 더 이상 필요하지 않습니다
  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleDecrement = () => {
    setCount(count - 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Counter</h1>
        <Link
          href="/comparison"
          className="text-sm text-blue-600 hover:underline"
        >
          최적화 비교 보기 →
        </Link>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleIncrement}>Increment</Button>
        <Button onClick={handleDecrement}>Decrement</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <p className="text-lg">Count: {count}</p>
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded text-sm">
        <p className="font-semibold mb-1">React 19.2 자동 최적화</p>
        <p className="text-gray-600 dark:text-gray-400">
          이 컴포넌트는 useCallback이나 useMemo 없이 작성되었지만, React
          Compiler가 자동으로 최적화를 처리합니다.
        </p>
      </div>
    </div>
  );
}
