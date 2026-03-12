/**
 * [데모 전용] 서버에서도 싱글톤으로 재사용하는 QueryClient
 *
 * 프로덕션 사용 금지. 서버는 매 요청마다 새 QueryClient를 써야 합니다.
 * 이 모듈은 "싱글톤 사용 시 문제" 재현용입니다.
 *
 * @see app/query-client-singleton-demo/page.tsx
 */

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
      },
    },
  });
}

let singletonQueryClient: QueryClient | undefined = undefined;

/**
 * 서버/클라이언트 모두 동일한 인스턴스를 재사용합니다.
 * 서버에서 사용 시 요청 간 캐시가 공유되어 다른 사용자 데이터가 유출될 수 있습니다.
 */
export function getSingletonQueryClient(): QueryClient {
  if (!singletonQueryClient) {
    singletonQueryClient = makeQueryClient();
  }
  return singletonQueryClient;
}
