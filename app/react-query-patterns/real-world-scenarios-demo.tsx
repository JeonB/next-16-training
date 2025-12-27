"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/**
 * 실전 시나리오 데모
 * 실제 프로젝트에서 자주 마주치는 복합적인 시나리오
 */

interface Comment {
  id: number;
  text: string;
  author: string;
  createdAt: string;
  likes: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
}

// API 함수들
async function fetchPost(postId: number): Promise<Post> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: postId,
    title: `Post ${postId} Title`,
    content: `This is the content of post ${postId}.`,
    likes: Math.floor(Math.random() * 100),
    commentsCount: Math.floor(Math.random() * 20),
  };
}

async function fetchComments(postId: number): Promise<Comment[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return Array.from({ length: 3 }, (_, i) => ({
    id: postId * 10 + i,
    text: `Comment ${i + 1} on post ${postId}`,
    author: `User${i + 1}`,
    createdAt: new Date().toISOString(),
    likes: Math.floor(Math.random() * 10),
  }));
}

async function likePost(postId: number): Promise<{ likes: number }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { likes: Math.floor(Math.random() * 100) };
}

async function addComment(postId: number, text: string): Promise<Comment> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return {
    id: Date.now(),
    text,
    author: "Current User",
    createdAt: new Date().toISOString(),
    likes: 0,
  };
}

// 시나리오 1: Optimistic Update + Invalidation
function PostWithOptimisticLike({ postId }: { postId: number }) {
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });

  const likeMutation = useMutation({
    mutationFn: () => likePost(postId),
    onMutate: async () => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // 이전 데이터 백업
      const previousPost = queryClient.getQueryData<Post>(["post", postId]);

      // 낙관적 업데이트
      if (previousPost) {
        queryClient.setQueryData<Post>(["post", postId], {
          ...previousPost,
          likes: previousPost.likes + 1,
        });
      }

      return { previousPost };
    },
    onError: (err, variables, context) => {
      // 에러 시 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },
    onSettled: () => {
      // 최종 동기화
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  if (!post) return null;

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{post.content}</p>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          좋아요 {post.likes}
        </button>
        <span className="text-sm text-gray-500">댓글 {post.commentsCount}</span>
      </div>
    </div>
  );
}

// 시나리오 2: Mutation 후 관련 쿼리 무효화 및 업데이트
function CommentsSection({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addComment(postId, text),
    onSuccess: (newComment) => {
      // 댓글 목록 즉시 업데이트 (캐시 업데이트)
      queryClient.setQueryData<Comment[]>(["comments", postId], (old = []) => [
        ...old,
        newComment,
      ]);

      // Post의 commentsCount 업데이트
      queryClient.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          commentsCount: old.commentsCount + 1,
        };
      });

      setNewComment("");
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
        <h4 className="font-semibold mb-3">댓글 ({comments?.length || 0}개):</h4>
        {comments && comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="p-2 border rounded bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">{comment.likes} 좋아요</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">댓글이 없습니다.</p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newComment.trim()) {
            addCommentMutation.mutate(newComment.trim());
          }
        }}
        className="flex space-x-2"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={addCommentMutation.isPending}
        />
        <button
          type="submit"
          disabled={addCommentMutation.isPending || !newComment.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {addCommentMutation.isPending ? "작성 중..." : "댓글 작성"}
        </button>
      </form>
    </div>
  );
}

export function RealWorldScenariosDemo() {
  const [postId, setPostId] = useState(1);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">실전 시나리오 패턴:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Optimistic Update:</strong> 즉시 UI 업데이트 후 서버 동기화</li>
          <li><strong>Cache Update:</strong> Mutation 후 관련 캐시 직접 업데이트</li>
          <li><strong>Multiple Invalidation:</strong> 여러 쿼리를 한 번에 무효화</li>
          <li><strong>Related Data Sync:</strong> 관련 데이터 동시 업데이트</li>
          <li><strong>Error Handling:</strong> 에러 발생 시 롤백</li>
        </ul>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Post ID:
          <input
            type="number"
            min="1"
            max="10"
            value={postId}
            onChange={(e) => setPostId(parseInt(e.target.value) || 1)}
            className="ml-2 px-3 py-1 border rounded"
          />
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">시나리오 1: Optimistic Update (좋아요):</h3>
          <PostWithOptimisticLike postId={postId} />
          <p className="mt-2 text-sm text-muted-foreground">
            좋아요 버튼을 클릭하면 즉시 UI가 업데이트되고, 서버 동기화 후 최종 상태로 반영됩니다.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">시나리오 2: Cache Update (댓글 추가):</h3>
          <CommentsSection postId={postId} />
          <p className="mt-2 text-sm text-muted-foreground">
            댓글을 추가하면 댓글 목록과 Post의 commentsCount가 동시에 업데이트됩니다.
          </p>
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">Best Practices:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>낙관적 업데이트는 중요하지 않은 작업에 사용 (좋아요, 댓글 등)</li>
          <li>에러 발생 시 반드시 롤백 처리</li>
          <li>관련 데이터는 함께 업데이트하여 일관성 유지</li>
          <li>onSettled에서 최종 동기화 보장</li>
          <li>캐시 업데이트와 무효화를 적절히 조합</li>
        </ul>
      </div>
    </div>
  );
}

