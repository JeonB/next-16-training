"use client";

import { useState, useTransition, useOptimistic, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User, CreateUserInput, UpdateUserInput } from "@/lib/types/user";
import {
  getUsersAction,
  getUserByIdAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/lib/actions/user-actions";

export default function BFFDemoPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const {
    data: usersResult,
    isPending: isUsersPending,
    isFetching: isFetchingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", "list", searchTerm || "all"],
    queryFn: () => getUsersAction(1, 10, searchTerm || undefined),
  });
  const baseUsers = usersResult?.users ?? [];
  const [optimisticUsers, setOptimisticUsers] =
    useOptimistic<User[]>(baseUsers);
  // 폼 상태
  const [formData, setFormData] = useState<CreateUserInput>({
    name: "",
    email: "",
    role: "user",
  });
  const [editFormData, setEditFormData] = useState<UpdateUserInput>({});

  // 사용자 목록 조회
  const isUsersLoading = isUsersPending || isFetchingUsers;
  const usersErrorMessage =
    error ?? (usersError instanceof Error ? usersError.message : null);

  // 사용자 생성
  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOptimisticUsers((prev: User[]) => [
      ...prev,
      {
        ...formData,
        role: formData.role as "admin" | "user" | "guest",
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User,
    ]);
    startTransition(async () => {
      await createUserAction(formData);
      await queryClient.invalidateQueries({
        queryKey: ["users", "list"],
        exact: false,
      });
    });
    setFormData({ name: "", email: "", role: "user" });
  };

  // 사용자 수정
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    setOptimisticUsers((prev: User[]) =>
      prev.map((u: User) =>
        u.id === selectedUser.id ? { ...u, ...editFormData } : u
      )
    );
    startTransition(async () => {
      await updateUserAction(selectedUser.id, editFormData);
      await queryClient.invalidateQueries({
        queryKey: ["users", "list"],
        exact: false,
      });
    });
  };

  // 사용자 삭제
  const handleDelete = async (id: string) => {
    setOptimisticUsers((prev: User[]) => prev.filter((u: User) => u.id !== id));
    startTransition(async () => {
      await deleteUserAction(id);
      await queryClient.invalidateQueries({
        queryKey: ["users", "list"],
        exact: false,
      });
    });
  };

  // 사용자 선택
  const handleSelectUser = async (id: string) => {
    setIsDetailLoading(true);
    setError(null);
    try {
      const user = await getUserByIdAction(id);
      setSelectedUser(user);
      setEditFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setIsDetailLoading(false);
    }
  };

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

        {usersErrorMessage && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">
              {usersErrorMessage}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사용자 목록 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
                  사용자 목록
                </h2>
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                />
              </div>

              {isUsersLoading || isDetailLoading ? (
                <p className="text-zinc-600 dark:text-zinc-400">로딩 중...</p>
              ) : (
                <div className="space-y-2">
                  {optimisticUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      onClick={() => handleSelectUser(user.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-black dark:text-zinc-50">
                            {user.name}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {user.email}
                          </p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                            {user.role}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user.id);
                          }}
                          disabled={isPending}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 사용자 생성 폼 */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                새 사용자 생성
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
                    역할
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "admin" | "user" | "guest",
                      })
                    }
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                  >
                    <option value="user">사용자</option>
                    <option value="admin">관리자</option>
                    <option value="guest">게스트</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 font-medium"
                >
                  {isPending ? "생성 중..." : "생성"}
                </button>
              </form>
            </div>
          </div>

          {/* 사용자 수정 폼 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                사용자 수정
              </h2>
              {selectedUser ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={editFormData.name || selectedUser.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={editFormData.email || selectedUser.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-zinc-50 mb-1">
                      역할
                    </label>
                    <select
                      value={editFormData.role || selectedUser.role}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          role: e.target.value as "admin" | "user" | "guest",
                        })
                      }
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                    >
                      <option value="user">사용자</option>
                      <option value="admin">관리자</option>
                      <option value="guest">게스트</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 font-medium"
                  >
                    {isPending ? "수정 중..." : "수정"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setEditFormData({});
                    }}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-black dark:text-zinc-50"
                  >
                    취소
                  </button>
                </form>
              ) : (
                <p className="text-zinc-600 dark:text-zinc-400">
                  수정할 사용자를 선택하세요.
                </p>
              )}
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
                클라이언트 컴포넌트에서 직접 호출 가능한 서버 함수입니다.
                내부적으로 Route Handlers를 호출하여 BFF 패턴을 구현합니다.
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
