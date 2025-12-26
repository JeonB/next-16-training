/**
 * Server & Client Components 통합 데모
 * Next.js App Router에서의 통합 패턴
 */

import { ServerDataComponent } from "./server-data-component";
import { ClientInteractiveComponent } from "./client-interactive-component";

export function ServerClientIntegrationDemo() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Server & Client Components 통합 패턴:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Server Components:</strong> 서버에서 렌더링, 데이터베이스/API 직접 접근 가능</li>
          <li><strong>Client Components:</strong> 브라우저에서 렌더링, 인터랙션 처리</li>
          <li>Server Components에서 Client Components로 props 전달</li>
          <li>각 컴포넌트의 역할을 명확히 분리</li>
          <li>번들 크기 최소화 (서버 컴포넌트는 번들에 포함 안 됨)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">1. Server Component (데이터 페칭):</h3>
          <ServerDataComponent />
        </div>

        <div>
          <h3 className="font-semibold mb-3">2. Client Component (인터랙션):</h3>
          <ClientInteractiveComponent initialCount={10} />
        </div>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">최적화 전략:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>가능한 많은 것을 Server Component로 처리</li>
          <li>인터랙션이 필요한 부분만 Client Component로 분리</li>
          <li>Server Component에서 데이터를 가져와 Client Component에 전달</li>
          <li>불필요한 JavaScript 번들 크기 감소</li>
        </ul>
      </div>
    </div>
  );
}

