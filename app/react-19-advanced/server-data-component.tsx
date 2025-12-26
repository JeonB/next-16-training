/**
 * Server Component 예제
 * 서버에서 데이터를 가져와 렌더링
 */

// Server Component (기본적으로 서버에서 실행)
export async function ServerDataComponent() {
  // 서버에서 직접 데이터 가져오기
  await new Promise((resolve) => setTimeout(resolve, 500)); // 시뮬레이션

  const serverData = {
    title: "Server Component에서 가져온 데이터",
    description: "이 데이터는 서버에서 렌더링되었습니다.",
    timestamp: new Date().toISOString(),
    serverTime: new Date().toLocaleString("ko-KR"),
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2">{serverData.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">{serverData.description}</p>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>Timestamp: {serverData.timestamp}</p>
        <p>서버 시간: {serverData.serverTime}</p>
      </div>
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          ✅ 이 컴포넌트는 서버에서 렌더링되어 JavaScript 번들에 포함되지 않습니다.
        </p>
      </div>
    </div>
  );
}

