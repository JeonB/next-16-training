/**
 * [데모 전용] QueryClient 싱글톤 사용 시 "다른 사용자 데이터 유출" 재현
 *
 * 프로덕션 사용 금지. 서버에서만 의도적으로 싱글톤을 사용합니다.
 *
 * 재현 방법:
 * 1. ?userId=1 로 접속
 * 2. 같은 브라우저에서 ?userId=2 로 이동 (또는 새 탭에서 ?userId=2)
 * 3. 두 번째 요청 화면에 "이 요청에 포함된 다른 사용자 데이터"로 user 1이 노출됨
 */

import Link from "next/link";
import {
  getSingletonQueryClient,
  getLastRequestedUserId,
  setLastRequestedUserId,
} from "@/lib/demo/singleton-query-client";
import { getUserById } from "@/lib/actions/user-actions";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SingletonDemoClient, DEMO_QUERY_KEY_PREFIX } from "./singleton-demo-client";
import type { DemoUser } from "./singleton-demo-client";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

async function getDemoUser(userId: string): Promise<DemoUser> {
  const u = await getUserById(userId);
  return { id: u.id, name: u.name, email: u.email };
}

export default async function QueryClientSingletonDemoPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const userId = params.userId ?? "1";

  const queryClient = getSingletonQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [DEMO_QUERY_KEY_PREFIX, userId],
    queryFn: () => getDemoUser(userId),
  });

  const leakedUsers: DemoUser[] = [];
  const prevUserId = getLastRequestedUserId();
  if (prevUserId != null && prevUserId !== userId) {
    const cache = queryClient.getQueryCache();
    const prevQuery = cache.find({ queryKey: [DEMO_QUERY_KEY_PREFIX, prevUserId] });
    const data = prevQuery?.state.data as DemoUser | undefined;
    if (data?.id && data?.name && data?.email) {
      leakedUsers.push(data);
    }
  }
  setLastRequestedUserId(userId);

  return (
    <div className="min-h-screen p-8 font-sans">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link className="text-blue-500 hover:underline" href="/">
            ← Home
          </Link>
          <h1 className="text-xl font-bold">QueryClient 싱글톤 문제 재현 (데모)</h1>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            이 페이지는 서버에서 <strong>의도적으로</strong> QueryClient 싱글톤을
            사용합니다. <strong>먼저 userId=1을 누른 뒤, 이어서 userId=2</strong>를
            누르면, 두 번째 화면에 “이 요청에 포함된 다른 사용자 데이터”로 user 1이
            표시됩니다. (처음부터 userId=2만 누르면 유출 영역은 비어 있습니다.)
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/query-client-singleton-demo?userId=1"
            className="rounded bg-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-300"
          >
            userId=1
          </Link>
          <Link
            href="/query-client-singleton-demo?userId=2"
            className="rounded bg-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-300"
          >
            userId=2
          </Link>
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <SingletonDemoClient currentUserId={userId} leakedUsers={leakedUsers} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
