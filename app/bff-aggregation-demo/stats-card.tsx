import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-zinc-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-black">
            {value}
          </p>
          {description && (
            <p className="text-xs text-zinc-500 mt-2">
              {description}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-zinc-500">
                vs 이전 기간
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-zinc-400">{icon}</div>
        )}
      </div>
    </div>
  );
}
