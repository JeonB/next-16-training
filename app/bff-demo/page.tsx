import Link from "next/link";
import {
  createUserAction,
  deleteUserAction,
  getUserById,
  getUsers,
  updateUserAction,
} from "@/lib/actions/user-actions";
import { CreateUserForm, DeleteUserForm, EditUserForm } from "./user-forms";

type PageSearchParams = Record<string, string | undefined>;

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

const buildUserLink = (id: string, search?: string) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("user", id);
  return `/bff-demo?${params.toString()}`;
};

export default async function BFFDemoPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const selectedUserId = resolvedParams.user;

  const { users } = await getUsers(1, 10, search);
  const selectedUser = selectedUserId
    ? await getUserById(selectedUserId as string)
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
            BFF 패턴 데모
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Next.js 16의 Route Handlers와 Server Actions를 활용한 BFF 패턴 예시
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사용자 목록 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
                  사용자 목록
                </h2>
                <form method="get" className="flex gap-2">
                  <input
                    name="search"
                    type="text"
                    placeholder="검색..."
                    defaultValue={search}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
                    검색
                  </button>
                  {search ? (
                    <Link
                      href="/bff-demo"
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      초기화
                    </Link>
                  ) : null}
                </form>
              </div>

              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-zinc-600 dark:text-zinc-400">
                    사용자가 없습니다. 새로 추가해 보세요.
                  </p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          href={buildUserLink(user.id, search)}
                          className="flex-1 space-y-1"
                        >
                          <h3 className="font-semibold text-black dark:text-zinc-50">
                            {user.name}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {user.email}
                          </p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                            {user.role}
                          </span>
                        </Link>
                        <DeleteUserForm
                          action={deleteUserAction}
                          userId={user.id}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 사용자 생성 폼 */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                새 사용자 생성
              </h2>
              <CreateUserForm action={createUserAction} />
            </div>
          </div>

          {/* 사용자 수정 폼 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                사용자 수정
              </h2>
              <EditUserForm action={updateUserAction} user={selectedUser} />
              {selectedUserId ? (
                <div className="mt-3">
                  <Link
                    href={`/bff-demo${
                      search ? `?search=${encodeURIComponent(search)}` : ""
                    }`}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
                  >
                    선택 해제
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* BFF 패턴 설명 */}
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
            BFF 패턴 설명
          </h2>
          <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
            <div>
              <h3 className="font-semibold text-black dark:text-zinc-50 mb-2">
                1. Route Handlers (app/api/users/*)
              </h3>
              <p>
                RESTful API 엔드포인트로, 외부 클라이언트나 다른 서비스에서도
                호출 가능합니다. Next.js 16의 최신 Route Handler 문법을
                사용합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-zinc-50 mb-2">
                2. Server Actions (lib/actions/user-actions.ts)
              </h3>
              <p>
                클라이언트 컴포넌트에서 직접 호출 가능한 서버 함수입니다. Route
                Handler 없이도 폼 액션만으로 CRUD를 처리합니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-zinc-50 mb-2">
                3. 타입 안전성
              </h3>
              <p>
                TypeScript를 통해 엔드투엔드 타입 안전성을 보장합니다. 타입
                정의는 lib/types/user.ts에 있습니다.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-zinc-50 mb-2">
                4. 캐싱 전략
              </h3>
              <p>
                Next.js 16의 revalidateTag와 revalidatePath를 활용하여 효율적인
                캐시 무효화를 구현했습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
