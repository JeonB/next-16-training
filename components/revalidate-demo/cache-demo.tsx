"use client";

import { useEffect, useState } from "react";

interface CacheDemoProps {
  initialTime: string;
  label: string;
  tag?: string;
}

export default function CacheDemo({ initialTime, label, tag }: CacheDemoProps) {
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsClient(true);
    }, 0);
    // 클라이언트에서만 시간 업데이트 (데모용)
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="rounded-xl border border-sky-100 bg-white/90 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-sky-900">{label}</h3>
        {tag && <p className="text-sm text-sky-600">태그: {tag}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-sky-50/50 p-4">
          <span className="text-sm font-medium text-sky-700">
            서버 렌더링 시간:
          </span>
          <span className="font-mono text-sm text-sky-900">
            {formatTime(initialTime)}
          </span>
        </div>
        {isClient && (
          <div className="flex items-center justify-between rounded-lg bg-amber-50/50 p-4">
            <span className="text-sm font-medium text-amber-700">
              클라이언트 시간:
            </span>
            <span className="font-mono text-sm text-amber-900">
              {formatTime(currentTime)}
            </span>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-sky-600/80">
        서버 렌더링 시간은 캐시된 값입니다. revalidatePath/revalidateTag를
        사용하면 이 값이 업데이트됩니다.
      </p>
    </div>
  );
}
