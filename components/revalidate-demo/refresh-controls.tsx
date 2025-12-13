"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  revalidatePathAction,
  revalidateTagAction,
  refreshAction,
  updateDataAndRevalidateAction,
} from "@/lib/actions/revalidate-demo";

export default function RefreshControls() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAction = async (
    action: () => Promise<{ success: boolean; message: string }>
  ) => {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });
      // 성공 시 잠시 후 메시지 제거
      if (result.success) {
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-100 bg-white/90 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-sky-900">
          캐시 무효화 방법
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-sky-700">
              1. revalidatePath
            </h4>
            <p className="text-xs text-sky-600/80">특정 경로의 캐시 무효화</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleAction(() => revalidatePathAction("/revalidate-refresh"))
              }
              disabled={isPending}
              className="w-full"
            >
              경로 무효화
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-sky-700">
              2. revalidateTag
            </h4>
            <p className="text-xs text-sky-600/80">태그 기반 캐시 무효화</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleAction(() => revalidateTagAction("demo-data", "max"))
              }
              disabled={isPending}
              className="w-full"
            >
              태그 무효화
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-sky-700">3. refresh</h4>
            <p className="text-xs text-sky-600/80">uncached 컴포넌트만 갱신</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(refreshAction)}
              disabled={isPending}
              className="w-full"
            >
              새로고침
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white/90 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-sky-900">실무 예시</h3>
        <div className="space-y-2">
          <p className="text-sm text-sky-700">
            데이터 업데이트 후 관련 캐시를 자동으로 무효화하는 패턴
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() =>
              handleAction(() =>
                updateDataAndRevalidateAction(1, { title: "업데이트된 데이터" })
              )
            }
            disabled={isPending}
          >
            데이터 업데이트 + 캐시 무효화
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {isPending && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-700">처리 중...</p>
        </div>
      )}
    </div>
  );
}
