"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userKeys,
  createUserMutationFn,
  updateUserMutationFn,
  deleteUserMutationFn,
} from "@/lib/queries/user-queries";
import { Button } from "@/components/ui/button";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserListResponse,
} from "@/lib/types/user";

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 사용자 생성/수정 폼 컴포넌트
 * useMutation 및 옵티미스틱 업데이트 예시
 */
export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!user;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<"admin" | "user" | "guest">(
    user?.role || "user"
  );

  // 생성 뮤테이션 (옵티미스틱 업데이트 포함)
  const createMutation = useMutation({
    mutationFn: createUserMutationFn,
    onSuccess: (newUser) => {
      // 모든 목록 쿼리에 새 유저 즉시 추가
      queryClient.setQueriesData<UserListResponse>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old) return old;
          // 첫 페이지에 새 유저 추가 (일반적으로 새로 생성된 항목은 첫 페이지에 표시)
          const updatedUsers = [newUser, ...old.users];
          return {
            ...old,
            users: updatedUsers,
            total: old.total + 1,
          };
        }
      );
      // 백그라운드에서 최신 데이터 리패치 (데이터 일관성 보장)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      onSuccess?.();
    },
  });

  // 수정 뮤테이션 (옵티미스틱 업데이트 포함)
  const updateMutation = useMutation({
    mutationFn: updateUserMutationFn,
    // 옵티미스틱 업데이트: 서버 응답 전 UI 업데이트
    onMutate: async ({ id, input }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // 이전 데이터 스냅샷 저장
      const previousUser = queryClient.getQueryData<User>(userKeys.detail(id));
      const previousQueries = queryClient
        .getQueriesData({ queryKey: userKeys.lists() })
        .map(([queryKey, data]) => [queryKey, data] as const);

      // 옵티미스틱 업데이트: 상세 쿼리
      if (previousUser) {
        queryClient.setQueryData<User>(userKeys.detail(id), {
          ...previousUser,
          ...input,
          updatedAt: new Date().toISOString(),
        });
      }

      // 옵티미스틱 업데이트: 목록 쿼리
      queryClient.setQueriesData<{ users: User[] }>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            users: old.users.map((u) =>
              u.id === id
                ? { ...u, ...input, updatedAt: new Date().toISOString() }
                : u
            ),
          };
        }
      );

      // 롤백을 위한 컨텍스트 반환
      return { previousUser, previousQueries };
    },
    // 에러 발생 시 롤백
    onError: (_error, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(variables.id),
          context.previousUser
        );
      }
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // 성공 또는 실패 후 처리
    onSettled: (data, _error, variables) => {
      // 상세 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      onSuccess?.();
    },
  });

  // 삭제 뮤테이션 (옵티미스틱 업데이트 포함)
  const deleteMutation = useMutation({
    mutationFn: deleteUserMutationFn,
    // 옵티미스틱 업데이트: 목록에서 즉시 제거
    onMutate: async (id) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

      // 모든 목록 쿼리의 이전 데이터 저장
      const previousQueries = queryClient
        .getQueriesData({ queryKey: userKeys.lists() })
        .map(([queryKey, data]) => [queryKey, data] as const);

      const previousUser = queryClient.getQueryData<User>(userKeys.detail(id));

      // 목록에서 사용자 제거
      queryClient.setQueriesData<{ users: User[]; total: number }>(
        { queryKey: userKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            users: old.users.filter((user) => user.id !== id),
            total: old.total - 1,
          };
        }
      );

      // 상세 쿼리 제거
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });

      return { previousQueries, previousUser };
    },
    // 에러 발생 시 롤백
    onError: (_error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(_variables),
          context.previousUser
        );
      }
    },
    // 성공 또는 실패 후 처리
    onSettled: () => {
      // 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      onSuccess?.();
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;
  const isPending = mutation.isPending || deleteMutation.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEditMode && user) {
      const input: UpdateUserInput = {};
      if (name !== user.name) input.name = name;
      if (email !== user.email) input.email = email;
      if (role !== user.role) input.role = role;

      if (Object.keys(input).length > 0) {
        updateMutation.mutate({ id: user.id, input });
      }
    } else {
      const input: CreateUserInput = {
        name,
        email,
        role,
      };
      createMutation.mutate(input);
    }
  };

  const handleDelete = () => {
    if (!user || !confirm("정말 삭제하시겠습니까?")) return;
    deleteMutation.mutate(user.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          역할
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "admin" | "user" | "guest")
          }
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="user">사용자</option>
          <option value="admin">관리자</option>
          <option value="guest">게스트</option>
        </select>
      </div>

      {mutation.isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "오류가 발생했습니다."}
          </p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {isEditMode && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            삭제
          </Button>
        )}
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            취소
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "처리 중..." : isEditMode ? "수정" : "생성"}
        </Button>
      </div>
    </form>
  );
}
