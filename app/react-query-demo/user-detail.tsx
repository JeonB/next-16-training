"use client";

import { Suspense, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userDetailOptions } from "@/lib/queries/user-queries";
import { UserForm } from "./user-form";
import { Button } from "@/components/ui/button";

/**
 * 사용자 상세 컴포넌트
 * useSuspenseQuery 예시 - Suspense와 함께 사용
 */
export function UserDetail({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<UserDetailSkeleton />}>
      <UserDetailContent userId={userId} />
    </Suspense>
  );
}

/**
 * useSuspenseQuery를 사용하는 실제 컨텐츠 컴포넌트
 */
function UserDetailContent({ userId }: { userId: string }) {
  const { data: user } = useSuspenseQuery(userDetailOptions(userId));
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">사용자 정보 수정</h3>
        <UserForm
          user={user}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{user.name}</h3>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          수정
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-muted-foreground">역할</p>
          <p className="font-medium">{user.role}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">사용자 ID</p>
          <p className="font-medium font-mono text-sm">{user.id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">생성일</p>
          <p className="font-medium">
            {new Date(user.createdAt).toLocaleString("ko-KR")}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">수정일</p>
          <p className="font-medium">
            {new Date(user.updatedAt).toLocaleString("ko-KR")}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 로딩 스켈레톤
 */
function UserDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-9 w-16 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-5 w-32 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-5 w-40 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-5 w-40 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
