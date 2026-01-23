/**
 * 사용자 통계 관련 타입 정의
 * BFF 패턴에서 데이터 집계 및 변환에 사용
 */

import type { User } from "./user";

/**
 * 역할별 사용자 통계
 */
export interface RoleDistribution {
  role: User["role"];
  count: number;
  percentage: number;
}

/**
 * 최근 활동 사용자
 */
export interface RecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  daysSinceCreation: number;
}

/**
 * 사용자 통계 요약
 */
export interface UserStatsSummary {
  totalUsers: number;
  roleDistribution: RoleDistribution[];
  recentUsers: RecentUser[];
  averageUsersPerDay: number;
  growthRate: number;
}

/**
 * 통계 집계 응답 타입
 */
export interface UserStatsResponse {
  success: boolean;
  data: UserStatsSummary;
  generatedAt: string;
}
