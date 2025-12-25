"use client";

import { useRef, useState, type ComponentProps } from "react";

/**
 * React 19의 ref prop 데모
 * forwardRef가 deprecated되고 ref를 일반 prop으로 전달
 */

// React 19 방식: ref를 일반 prop으로 받음
interface InputProps extends ComponentProps<"input"> {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ label, ref, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <input
        ref={ref}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

// React 19 방식: ref를 일반 prop으로 받는 컴포넌트 (자식 요소에 전달)
interface FancyButtonProps extends ComponentProps<"button"> {
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

function FancyButton({ children, ref, ...props }: FancyButtonProps) {
  return (
    <button
      ref={ref}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}

export function RefPropDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [focusCount, setFocusCount] = useState(0);

  const handleFocusInput = () => {
    inputRef.current?.focus();
    setFocusCount((prev) => prev + 1);
  };

  const handleClickButton = () => {
    if (buttonRef.current) {
      buttonRef.current.textContent = `클릭됨! (${Date.now()})`;
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.textContent = "버튼 클릭 테스트";
        }
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">React 19의 ref 변경사항:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">forwardRef</code> deprecated</li>
          <li>ref를 일반 prop으로 전달 (타입: <code className="bg-white dark:bg-gray-800 px-1 rounded">React.Ref&lt;T&gt;</code>)</li>
          <li>더 간단하고 직관적인 API</li>
          <li>TypeScript 타입 추론이 더 명확해짐</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">1. Input 컴포넌트에 ref 전달:</h3>
          <Input
            ref={inputRef}
            label="이름"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="이름을 입력하세요"
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={handleFocusInput}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
            >
              Input에 포커스
            </button>
            <span className="text-sm text-muted-foreground">
              포커스 횟수: {focusCount}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. Button 컴포넌트에 ref 전달:</h3>
          <FancyButton ref={buttonRef} onClick={handleClickButton}>
            버튼 클릭 테스트
          </FancyButton>
          <p className="mt-2 text-sm text-muted-foreground">
            버튼을 클릭하면 ref를 통해 DOM을 직접 조작합니다.
          </p>
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">코드 비교:</h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-medium">❌ React 18 (forwardRef 사용):</p>
            <pre className="bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
{`const Input = forwardRef<HTMLInputElement, Props>(
  (props, ref) => <input ref={ref} {...props} />
);`}
            </pre>
          </div>
          <div>
            <p className="font-medium">✅ React 19 (ref를 prop으로):</p>
            <pre className="bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
{`function Input({ ref, ...props }: { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

