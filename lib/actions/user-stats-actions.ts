"use server";

import { revalidateTag } from "next/cache";
import { usersStore } from "@/lib/data/users-store";
import type {
  UserStatsSummary,
  RoleDistribution,
  RecentUser,
} from "@/lib/types/user-stats.types";
import type { User } from "@/lib/types/user";

const USER_STATS_TAG = "user-stats";

/**
 * 역할별 사용자 분포 계산
 */
function calculateRoleDistribution(users: User[]): RoleDistribution[] {
  const total = users.length;
  if (total === 0) {
    return [];
  }

  const roleCounts = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    {} as Record<User["role"], number>
  );

  return (["admin", "user", "guest"] as const).map((role) => ({
    role,
    count: roleCounts[role] || 0,
    percentage: total > 0 ? Math.round((roleCounts[role] || 0) / total * 100) : 0,
  }));
}

/**
 * 최근 생성된 사용자 목록 (최근 7일)
 */
function getRecentUsers(users: User[], limit: number = 5): RecentUser[] {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return users
    .filter((user) => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= sevenDaysAgo;
    })
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit)
    .map((user) => {
      const createdAt = new Date(user.createdAt);
      const daysSinceCreation = Math.floor(
        (now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        daysSinceCreation,
      };
    });
}

/**
 * 일평균 사용자 생성 수 계산
 */
function calculateAverageUsersPerDay(users: User[]): number {
  if (users.length === 0) {
    return 0;
  }

  const sortedUsers = [...users].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const firstUserDate = new Date(sortedUsers[0].createdAt);
  const lastUserDate = new Date(sortedUsers[sortedUsers.length - 1].createdAt);
  const daysDiff =
    (lastUserDate.getTime() - firstUserDate.getTime()) /
    (24 * 60 * 60 * 1000);

  if (daysDiff === 0) {
    return users.length;
  }

  return Math.round((users.length / daysDiff) * 10) / 10;
}

/**
 * 성장률 계산 (최근 7일 vs 그 이전 7일)
 */
function calculateGrowthRate(users: User[]): number {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000
  );

  const recentUsers = users.filter(
    (user) => new Date(user.createdAt) >= sevenDaysAgo
  ).length;

  const previousUsers = users.filter(
    (user) => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo;
    }
  ).length;

  if (previousUsers === 0) {
    return recentUsers > 0 ? 100 : 0;
  }

  return Math.round(((recentUsers - previousUsers) / previousUsers) * 100);
}

/**
 * 사용자 통계 집계
 * BFF 패턴: 여러 데이터 소스를 집계하여 프론트엔드에 최적화된 형태로 제공
 */
export async function getUserStats(): Promise<UserStatsSummary> {
  // 실제 프로덕션에서는 여러 API를 호출하여 데이터를 집계할 수 있습니다
  // 예: await Promise.all([getUsersFromDB(), getUsersFromCache(), ...])

  const roleDistribution = calculateRoleDistribution(usersStore);
  const recentUsers = getRecentUsers(usersStore, 5);
  const averageUsersPerDay = calculateAverageUsersPerDay(usersStore);
  const growthRate = calculateGrowthRate(usersStore);

  return {
    totalUsers: usersStore.length,
    roleDistribution,
    recentUsers,
    averageUsersPerDay,
    growthRate,
  };
}

/**
 * 캐시 무효화
 */
export async function revalidateUserStats() {
  revalidateTag(USER_STATS_TAG, "max");
}
