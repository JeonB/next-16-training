import { UserList } from "@/app/react-query-demo/user-list";

/**
 * React Query 학습 예시 메인 페이지
 * 서버 컴포넌트에서 초기 데이터 prefetch
 */
export default async function ReactQueryDemoPage() {
  const response = await fetch("/api/users?page=1&limit=10");
  const initialData = await response.json();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">React Query 학습 예시</h1>
        <p className="text-muted-foreground">
          TanStack Query v5 최신 문법을 활용한 다양한 패턴 학습
        </p>
      </div>

      <UserList initialData={initialData} />
    </main>
  );
}
