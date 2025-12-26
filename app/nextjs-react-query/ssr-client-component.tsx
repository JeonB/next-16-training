"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * SSR 패턴에서 사용하는 Client Component
 * Server Component에서 설정한 데이터를 사용
 */

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

async function fetchPosts(): Promise<Post[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: `Post ${i + 1}`,
    body: `This is the body of post ${i + 1}.`,
    userId: (i % 3) + 1,
  }));
}

export function SSRClientComponent() {
  // Server Component에서 이미 캐시에 설정한 데이터 사용
  const { data: posts, isLoading, isFetching } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 60 * 1000, // 1분간 fresh
  });

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <p className="text-muted-foreground">포스트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFetching && !isLoading && (
        <div className="text-sm text-blue-500">백그라운드 업데이트 중...</div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{post.body}</p>
            <p className="text-xs text-muted-foreground">User ID: {post.userId}</p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
        <p className="text-sm">
          💡 이 데이터는 Server Component에서 이미 가져와 캐시에 설정되었기 때문에
          즉시 표시됩니다. 필요 시 백그라운드에서 리페치됩니다.
        </p>
      </div>
    </div>
  );
}

