"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Optimistic Updates 데모
 * 낙관적 업데이트로 더 나은 사용자 경험 제공
 */

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

// Query 함수
async function fetchComments(): Promise<Comment[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      id: "1",
      text: "첫 번째 댓글입니다.",
      author: "User1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      text: "두 번째 댓글입니다.",
      author: "User2",
      createdAt: new Date().toISOString(),
    },
  ];
}

// Mutation 함수
async function addComment(text: string): Promise<Comment> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // 실제로는 서버 API 호출
  return {
    id: Date.now().toString(),
    text,
    author: "Current User",
    createdAt: new Date().toISOString(),
  };
}

async function deleteComment(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 실제로는 서버 API 호출
}

function CommentList() {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Comments 조회 Query
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments"],
    queryFn: fetchComments,
  });

  // Comment 추가 Mutation (Optimistic Update)
  const addMutation = useMutation({
    mutationFn: addComment,
    // onMutate: Mutation 실행 전에 실행 (낙관적 업데이트)
    onMutate: async (newCommentText) => {
      // 진행 중인 refetch 취소 (낙관적 업데이트가 덮어쓰이지 않도록)
      await queryClient.cancelQueries({ queryKey: ["comments"] });

      // 이전 데이터 백업 (롤백용)
      const previousComments = queryClient.getQueryData<Comment[]>(["comments"]);

      // 낙관적 업데이트: 즉시 UI에 반영
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        text: newCommentText,
        author: "Current User",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Comment[]>(["comments"], (old = []) => [
        ...old,
        optimisticComment,
      ]);

      // 롤백을 위한 컨텍스트 반환
      return { previousComments };
    },
    // onError: 에러 발생 시 롤백
    onError: (err, newCommentText, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments"], context.previousComments);
      }
    },
    // onSettled: 성공/실패 관계없이 실행 (최종 동기화)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  // Comment 삭제 Mutation (Optimistic Update)
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previousComments = queryClient.getQueryData<Comment[]>(["comments"]);

      // 낙관적 업데이트: 즉시 삭제
      queryClient.setQueryData<Comment[]>(["comments"], (old = []) =>
        old.filter((comment) => comment.id !== commentId)
      );

      return { previousComments };
    },
    onError: (err, commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments"], context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addMutation.mutate(newComment.trim());
      setNewComment("");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 댓글 추가 폼 */}
      <form onSubmit={handleAddComment} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          disabled={addMutation.isPending}
        />
        <button
          type="submit"
          disabled={addMutation.isPending || !newComment.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addMutation.isPending ? "추가 중..." : "댓글 추가"}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className={`p-4 border rounded-lg ${
              comment.id.startsWith("temp-")
                ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">{comment.author}</span>
                  {comment.id.startsWith("temp-") && (
                    <span className="text-xs text-blue-500">추가 중...</span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(comment.id)}
                disabled={deleteMutation.isPending}
                className="ml-2 px-2 py-1 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OptimisticUpdatesDemo() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Optimistic Updates 패턴:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">onMutate</code>: Mutation 실행 전 즉시 UI 업데이트</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">onError</code>: 에러 발생 시 이전 상태로 롤백</li>
          <li><code className="bg-white dark:bg-gray-800 px-1 rounded">onSettled</code>: 최종적으로 서버 상태와 동기화</li>
          <li>서버 응답을 기다리지 않아 사용자 경험 향상</li>
          <li>에러 발생 시 자동 롤백으로 일관성 유지</li>
        </ul>
      </div>

      <CommentList />

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">동작 흐름:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>사용자가 액션 수행 (댓글 추가, 삭제 등)</li>
          <li>onMutate에서 즉시 UI 업데이트 (낙관적 업데이트)</li>
          <li>백그라운드에서 서버와 동기화</li>
          <li>성공 시: onSettled에서 최종 동기화</li>
          <li>실패 시: onError에서 이전 상태로 롤백</li>
        </ol>
      </div>
    </div>
  );
}

