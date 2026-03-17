import { queryOptions } from "@tanstack/react-query";
import { apiGet } from "@/lib/utils/api-client";
import type { UserListResponse } from "@/lib/types/user";

export type BenchmarkStrategy = "aggressive" | "cached";

export const benchmarkKeys = {
  all: ["benchmark"] as const,
  usersList: (params: {
    page: number;
    limit: number;
    strategy: BenchmarkStrategy;
  }) => [...benchmarkKeys.all, "users", "list", params] as const,
} as const;

export function benchmarkUserListOptions(params: {
  page: number;
  limit: number;
  strategy: BenchmarkStrategy;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  const base = queryOptions({
    queryKey: benchmarkKeys.usersList(params),
    queryFn: () => apiGet<UserListResponse>(`/api/users?${searchParams}`),
  });

  if (params.strategy === "aggressive") {
    return {
      ...base,
      staleTime: 0,
      refetchOnMount: "always" as const,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    };
  }

  return {
    ...base,
    staleTime: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };
}

