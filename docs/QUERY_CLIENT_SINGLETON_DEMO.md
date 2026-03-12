# QueryClient 싱글톤 데모

## 서버에서는 매 요청마다 새 QueryClient를 써야 하는 이유

Next.js App Router에서 React Query를 쓰면, **서버에서** `getQueryClient()`를 호출할 때마다 **새 QueryClient 인스턴스**를 만들어야 합니다.  
이유는 다음과 같습니다.

- 각 HTTP 요청은 서로 다른 사용자/세션에 대응할 수 있음.
- 한 요청에서 prefetch한 데이터가 **다른 요청의 응답(HTML/페이로드)에 포함되면 안 됨** (요청 간 데이터 유출·다른 사용자 데이터 노출).
- `dehydrate(queryClient)`는 해당 인스턴스의 **캐시 전체**를 직렬화하므로, 서버에서 하나의 QueryClient를 재사용하면 이전 요청의 캐시가 다음 요청 응답에 그대로 섞여 나갈 수 있음.

따라서 **서버에서는 요청 단위로 캐시가 격리되어야 하므로** 매 요청마다 새 QueryClient를 만드는 방식이 맞습니다.  
(참고: `components/providers/get-query-client.ts`는 서버일 때만 매번 새 인스턴스를 만들고, 브라우저에서는 한 번만 만들어 재사용합니다.)

## 이 데모가 하는 일

- **의도적으로** 서버에서 QueryClient를 **싱글톤**으로 쓰는 코드를 두었습니다.
- `app/query-client-singleton-demo` 페이지는 `lib/demo/singleton-query-client.ts`의 `getSingletonQueryClient()`를 사용합니다.
- `?userId=1` 로 접속한 뒤 `?userId=2` 로 이동하면, 두 번째 요청의 화면에 **“이 요청에 포함된 다른 사용자 데이터”**로 user 1 정보가 노출됩니다.  
  → 싱글톤 캐시가 요청 간에 공유되어, 이전 요청(user 1) 데이터가 다음 요청(user 2)의 dehydrate 결과에 포함된 것을 직접 확인할 수 있습니다.

## 재현 시나리오

1. `/query-client-singleton-demo?userId=1` 접속
2. 같은 브라우저에서 `/query-client-singleton-demo?userId=2` 로 이동 (또는 새 탭에서 접속)
3. 두 번째 화면에서 “⚠️ 이 요청에 포함된 다른 사용자 데이터” 영역에 user 1(홍길동)이 보이면 재현된 것입니다.

이 데모는 **교육·점검용**이며, 프로덕션에서는 사용하지 마세요.
