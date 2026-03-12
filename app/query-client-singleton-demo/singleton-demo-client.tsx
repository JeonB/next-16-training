"use client";

import { useQuery } from "@tanstack/react-query";

const DEMO_QUERY_KEY_PREFIX = "singleton-demo-user";

export type DemoUser = { id: string; name: string; email: string };

type SingletonDemoClientProps = {
  currentUserId: string;
  leakedUsers: DemoUser[];
};

export function SingletonDemoClient({
  currentUserId,
  leakedUsers,
}: SingletonDemoClientProps) {
  const { data: currentUser, isLoading, isError } = useQuery({
    queryKey: [DEMO_QUERY_KEY_PREFIX, currentUserId],
    queryFn: () => fetchDemoUser(currentUserId),
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 font-semibold">현재 요청의 사용자 (userId={currentUserId})</h3>
        {isLoading && <p className="text-sm text-zinc-500">로딩 중...</p>}
        {isError && <p className="text-sm text-red-600">로드 실패</p>}
        {currentUser && (
          <p className="text-sm">
            {currentUser.name} ({currentUser.email})
          </p>
        )}
      </section>

      {leakedUsers.length > 0 && (
        <section className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <h3 className="mb-2 font-semibold text-amber-800">
            ⚠️ 이 요청에 포함된 다른 사용자 데이터 (싱글톤 캐시 유출)
          </h3>
          <p className="mb-2 text-sm text-amber-800">
            서버에서 QueryClient를 싱글톤으로 쓰면, 이전 요청의 캐시가 그대로 남아
            dehydrate 시 함께 직렬화되어 이 요청의 HTML/페이로드에 포함됩니다.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
            {leakedUsers.map((u) => (
              <li key={u.id}>
                {u.name} (id: {u.id}, {u.email})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

async function fetchDemoUser(userId: string): Promise<DemoUser> {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const json = await res.json();
  const user = json.data;
  return { id: user.id, name: user.name, email: user.email };
}

export { DEMO_QUERY_KEY_PREFIX };
