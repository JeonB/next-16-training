"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CounterUnoptimized() {
  const [count, setCount] = useState(0);

  // React 19.2는 자동으로 메모이제이션을 해줍니다
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
      <h2 className="text-xl font-bold">Without useCallback/useMemo</h2>
      <div className="flex gap-2">
        <Button onClick={handleIncrement}>Increment</Button>
        <Button onClick={handleDecrement}>Decrement</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <p className="text-lg">Count: {count}</p>
    </div>
  );
}

