# Next.js 서버 사이드 메모리 누수 점검 결과

## 1. 점검 범위

- API 라우트 (`app/api/**`)
- 서버 액션 (`lib/actions/**`)
- 모듈 레벨 상태 (`lib/data/**`, `components/providers/get-query-client.ts`)
- 서버 컴포넌트 내 비동기/캐시 패턴

## 2. 점검 결과: 현재 코드베이스

### ✅ 전형적인 메모리 누수 없음

- **이벤트 리스너**: 서버 코드에 `addEventListener` 없음.
- **미해제 타이머**: API/서버 액션에서 `setInterval`/`setTimeout`으로 장기 구독하는 패턴 없음. (클라이언트/데모용 `setTimeout`은 요청 스코프 내 일회성 지연용.)
- **QueryClient**: `getQueryClient()`는 서버에서 요청마다 새 인스턴스 생성, 브라우저에서만 싱글톤. 서버 측 누수 없음.

### ⚠️ 주의할 점: 무제한 성장 가능성

| 위치 | 내용 | 위험도 |
|------|------|--------|
| `lib/data/users-store.ts` | 모듈 레벨 배열 `usersStore`. POST/서버 액션으로 사용자 생성 시 `push`만 하고 삭제/만료 없음. | 장기 실행 서버(예: `next start`)에서 사용자 수가 늘수록 메모리 사용량 증가. 서버리스에서는 인스턴스 재사용 시에도 동일. |

정리하면, **해제되지 않는 참조(리스너/타이머/클로저)로 인한 “누수”는 없고**, **의도된 인메모리 저장소가 제한 없이 커질 수 있는 구조**입니다.

## 3. 의도적 누수 데모 (교육용)

프로덕션 사용 금지. 다음 경로에서 “누수 위험이 있는 패턴”을 재현해 둠.

- **API**: `GET/POST /api/memory-leak-demo`
- **저장소**: `lib/data/memory-leak-demo-store.ts`

### 데모 패턴 요약

1. **무제한 캐시**  
   `Map`에만 추가하고 eviction/만료 없음. 요청마다 `?action=cache&key=...` 호출 시 캐시 크기만 증가.

2. **요청 컨텍스트 보관**  
   각 요청마다 모듈 레벨 배열에 메타데이터 + 큰 페이로드를 push하고, 삭제 로직 없음. `POST { "action": "request-log" }` 반복 시 배열만 커짐.

3. **서버 측 setInterval**  
   한 번 시작하면 `clearInterval` 없이 주기적으로 실행. 타이머와 클로저가 프로세스 생존 동안 유지됨. `POST { "action": "start-interval" }`로 시작.

### 사용 예시

```bash
# 상태 확인
curl "http://localhost:3000/api/memory-leak-demo?action=stats"

# 무제한 캐시에 추가 (여러 번 호출 시 cacheSize 증가)
curl "http://localhost:3000/api/memory-leak-demo?action=cache&key=test1"

# 요청 로그 배열에 추가 (여러 번 호출 시 logLength 증가)
curl -X POST "http://localhost:3000/api/memory-leak-demo" \
  -H "Content-Type: application/json" \
  -d '{"action":"request-log"}'

# setInterval 시작 (한 번만 시작, tick 수는 계속 증가)
curl -X POST "http://localhost:3000/api/memory-leak-demo" \
  -H "Content-Type: application/json" \
  -d '{"action":"start-interval"}'
```

## 4. 권장 사항

- **usersStore**: 프로덕션에서는 DB/외부 저장소 사용. 인메모리만 쓸 경우 최대 개수/TTL 제한 또는 주기적 trim 고려.
- **캐시**: 서버 메모리 캐시 사용 시 LRU/최대 크기/만료 시간 적용 (예: `lru-cache`).
- **타이머/구독**: 서버에서 장기 타이머나 이벤트 구독이 필요하면 종료 시 반드시 `clearInterval`/`removeListener` 등으로 해제.
