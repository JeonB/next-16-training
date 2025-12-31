"use client";
import { createContext, useContext, useState } from "react";

interface ContextProviderProps {
  children: React.ReactNode;
}

interface AppContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;
}

export const AppContext = createContext<AppContextType>({
  count: 0,
  increment: () => {},
  decrement: () => {},
  setCount: () => {},
});

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [count, setCount] = useState(0);
  const increment = () => {
    setCount(count + 1);
  };
  const decrement = () => {
    setCount(count - 1);
  };
  return (
    <AppContext.Provider value={{ count, increment, decrement, setCount }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
