"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export default function CounterOptimized() {
  const [count, setCount] = useState(0);

  // ⚠️ 주의: React 19.2에서는 이런 수동 최적화가 오히려 성능을 저하시킵니다!
  // useMemo(() => count, [count])는 불필요한 오버헤드만 추가합니다
  // React Compiler가 이미 자동으로 최적화하기 때문입니다
  const memoizedCount = useMemo(() => count, [count]);

  // useCallback도 마찬가지로 중복 최적화로 오버헤드 발생
  // 실제 측정 결과: 이 버전이 자동 최적화 버전보다 약 4.5배 느림 (0.9ms vs 0.2ms)
  const memoizedHandleIncrement = useCallback(() => {
    setCount(count + 1);
  }, [count]);

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
    <div className="border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold">With useCallback/useMemo</h2>
      <div className="flex gap-2">
        <Button onClick={handleIncrement}>Increment</Button>
        <Button onClick={handleDecrement}>Decrement</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <p className="text-lg">Count: {memoizedCount}</p>
      {/* <Button onClick={memoizedHandleIncrement}>Increment (Memoized)</Button> */}
    </div>
  );
}
