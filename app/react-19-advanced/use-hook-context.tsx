"use client";

import { AppContext } from "@/components/providers/context-provider";
import { use } from "react";
import { ContextProvider } from "@/components/providers/context-provider";
export const UseHookContext = () => {
  const { count, increment, decrement, setCount } = use(AppContext);
  return (
    <div className="space-y-4">
      <h1>Count: {count}</h1>
      <div className="flex gap-2">
        <button
          onClick={increment}
          className="hover:bg-blue-600 transition-colors duration-300 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Increment
        </button>
        <button
          onClick={decrement}
          className="hover:bg-red-600 transition-colors duration-300 cursor-pointer bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Decrement
        </button>
        <button
          onClick={() => setCount(0)}
          className="hover:bg-gray-600 transition-colors duration-300 cursor-pointer bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
