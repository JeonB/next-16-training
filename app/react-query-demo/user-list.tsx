"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { userListOptions } from "@/lib/queries/user-queries";
import { UserForm } from "./user-form";
import { UserDetail } from "./user-detail";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types/user";

/**
 * 사용자 리스트 컴포넌트
 * useQuery, 페이지네이션, 검색 기능 예시
 */
export function UserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const limit = 10;

  // 검색어 debounce를 위한 로컬 상태
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 검색어 debounce 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // 검색 시 첫 페이지로 리셋
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // 쿼리 옵션 생성
  const queryOptions = useMemo(
    () => userListOptions({ page, limit, search: debouncedSearch }),
    [page, limit, debouncedSearch]
  );

  // useQuery로 데이터 조회
  const { data, isLoading, isError, error } = useQuery(queryOptions);

  // 페이지네이션 계산
  const hasNextPage = data
    ? (data.page - 1) * data.limit + data.users.length < data.total
    : false;
  const hasPreviousPage = page > 1;
  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          에러 발생
        </h2>
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 생성 버튼 */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            name="search"
            placeholder="이름 또는 이메일로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "취소" : "사용자 생성"}
        </Button>
      </div>

      {/* 생성 폼 */}
      {showCreateForm && (
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">새 사용자 생성</h2>
          <UserForm
            onSuccess={() => {
              setShowCreateForm(false);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      )}

      {/* 사용자 목록 */}
      {data && (
        <>
          <div className="rounded-lg border">
            <div className="p-4 border-b bg-muted/50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">사용자 목록</h2>
                <span className="text-sm text-muted-foreground">
                  총 {data.total}명 (페이지 {data.page}/{totalPages})
                </span>
              </div>
            </div>

            <div className="divide-y">
              {data.users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              ) : (
                data.users.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    isSelected={selectedUserId === user.id}
                    onSelect={() =>
                      setSelectedUserId(
                        selectedUserId === user.id ? null : user.id
                      )
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPreviousPage || isLoading}
            >
              이전
            </Button>

            <span className="text-sm text-muted-foreground">
              페이지 {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || isLoading}
            >
              다음
            </Button>
          </div>
        </>
      )}

      {/* 사용자 상세 */}
      {selectedUserId && (
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">사용자 상세</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUserId(null)}
            >
              닫기
            </Button>
          </div>
          <UserDetail userId={selectedUserId} />
        </div>
      )}
    </div>
  );
}

/**
 * 사용자 리스트 아이템 컴포넌트
 */
function UserListItem({
  user,
  isSelected,
  onSelect,
}: {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
          {user.role}
        </span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        생성: {new Date(user.createdAt).toLocaleDateString("ko-KR")}
      </div>
    </div>
  );
}
