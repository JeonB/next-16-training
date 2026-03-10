import Link from "next/link";
import { getUserStats } from "@/lib/actions/user-stats-actions";
import StatsCard from "./stats-card";
import type { RoleDistribution, RecentUser } from "@/lib/types/user-stats.types";

export default async function BFFAggregationDemoPage() {
  // BFF 패턴: 서버에서 여러 데이터를 집계하여 최적화된 형태로 제공
  const stats = await getUserStats();

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/bff-demo"
              className="text-zinc-600 hover:text-black"
            >
              ← BFF 기본 데모로 돌아가기
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">
            BFF 데이터 집계 패턴 데모
          </h1>
          <p className="text-lg text-zinc-600">
            여러 데이터 소스를 집계하여 프론트엔드에 최적화된 형태로 제공하는
            BFF 패턴 예시
          </p>
        </div>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="전체 사용자"
            value={stats.totalUsers}
            description="등록된 총 사용자 수"
            trend={{
              value: stats.growthRate,
              isPositive: stats.growthRate >= 0,
            }}
          />
          <StatsCard
            title="일평균 생성"
            value={stats.averageUsersPerDay}
            description="하루 평균 신규 사용자 수"
          />
          <StatsCard
            title="성장률"
            value={`${stats.growthRate > 0 ? "+" : ""}${stats.growthRate}%`}
            description="최근 7일 vs 이전 7일"
            trend={{
              value: stats.growthRate,
              isPositive: stats.growthRate >= 0,
            }}
          />
          <StatsCard
            title="최근 사용자"
            value={stats.recentUsers.length}
            description="최근 7일 내 생성된 사용자"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 역할별 분포 */}
          <div className="bg-white rounded-lg shadow p-6 border border-zinc-200">
            <h2 className="text-2xl font-semibold text-black mb-4">
              역할별 사용자 분포
            </h2>
            <div className="space-y-4">
              {stats.roleDistribution.map((role) => (
                <RoleBar key={role.role} distribution={role} />
              ))}
            </div>
          </div>

          {/* 최근 생성된 사용자 */}
          <div className="bg-white rounded-lg shadow p-6 border border-zinc-200">
            <h2 className="text-2xl font-semibold text-black mb-4">
              최근 생성된 사용자
            </h2>
            <div className="space-y-3">
              {stats.recentUsers.length === 0 ? (
                <p className="text-zinc-600">
                  최근 7일 내 생성된 사용자가 없습니다.
                </p>
              ) : (
                stats.recentUsers.map((user) => (
                  <RecentUserItem key={user.id} user={user} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* BFF 패턴 설명 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 border border-zinc-200">
          <h2 className="text-2xl font-semibold text-black mb-4">
            BFF 데이터 집계 패턴 설명
          </h2>
          <div className="space-y-4 text-zinc-700">
            <div>
              <h3 className="font-semibold text-black mb-2">
                1. 데이터 집계 (Aggregation)
              </h3>
              <p>
                여러 데이터 소스나 여러 API 호출을 하나의 Server Action으로
                집계합니다. 이 예시에서는 사용자 목록에서 통계를 계산하지만,
                실제로는 여러 백엔드 서비스를 호출하여 데이터를 모을 수
                있습니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">
                2. 데이터 변환 (Transformation)
              </h3>
              <p>
                백엔드의 원시 데이터를 프론트엔드 UI에 최적화된 형태로
                변환합니다. 예를 들어, 역할별 분포를 계산하거나, 최근 사용자를
                필터링하고 정렬하는 등의 작업을 수행합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">
                3. 성능 최적화
              </h3>
              <p>
                집계된 데이터를 캐싱하여 불필요한 재계산을 방지합니다. 또한,
                서버 컴포넌트에서 직접 호출하여 클라이언트 사이드 JavaScript
                없이 데이터를 제공합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">
                4. 타입 안전성
              </h3>
              <p>
                TypeScript를 통해 집계된 데이터의 타입을 명확히 정의하여,
                컴파일 타임에 오류를 발견하고 자동완성을 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoleBarProps {
  distribution: RoleDistribution;
}

function RoleBar({ distribution }: RoleBarProps) {
  const roleLabels: Record<string, string> = {
    admin: "관리자",
    user: "사용자",
    guest: "게스트",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-black">
          {roleLabels[distribution.role] || distribution.role}
        </span>
        <span className="text-sm text-zinc-600">
          {distribution.count}명 ({distribution.percentage}%)
        </span>
      </div>
      <div className="w-full bg-zinc-200 rounded-full h-2">
        <div
          className="bg-black h-2 rounded-full transition-all duration-300"
          style={{ width: `${distribution.percentage}%` }}
        />
      </div>
    </div>
  );
}

interface RecentUserItemProps {
  user: RecentUser;
}

function RecentUserItem({ user }: RecentUserItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-black">{user.name}</p>
        <p className="text-sm text-zinc-600">
          {user.email}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-zinc-600">
          {user.daysSinceCreation === 0
            ? "오늘"
            : `${user.daysSinceCreation}일 전`}
        </p>
      </div>
    </div>
  );
}
